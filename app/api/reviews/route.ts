import { NextResponse } from 'next/server';
import { ensureDatabase, getD1 } from '@/db';
import { getSessionUser, isSameOriginRequest } from '@/app/auth/server';
import { validateReview } from './validation.mjs';
import { enforceUserRateLimit, RateLimitError } from '@/db/rate-limit';

type ReviewRow = { id: number; author_name: string; rating: number; content: string; created_at: string };

export async function GET(request: Request) {
  const listingId = new URL(request.url).searchParams.get('listingId') ?? '';
  if (!/^[a-z0-9-]{2,40}$/.test(listingId)) {
    return NextResponse.json({ error: '租屋項目格式不正確。' }, { status: 400 });
  }

  await ensureDatabase();
  const result = await getD1().prepare(`
    SELECT id, author_name, rating, content, created_at
    FROM reviews
    WHERE listing_id = ?
    ORDER BY created_at DESC, id DESC
    LIMIT 50
  `).bind(listingId).all<ReviewRow>();

  return NextResponse.json({ reviews: result.results.map((row) => ({
    id: row.id,
    authorName: row.author_name,
    rating: row.rating,
    content: row.content,
    createdAt: row.created_at,
  })) });
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: '不允許跨站留言。' }, { status: 403 });
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: '請先使用 Google 登入。' }, { status: 401 });
  try {
    await enforceUserRateLimit(user.id, 'legacy-review', 20, 60);
  } catch (error) {
    if (error instanceof RateLimitError) return NextResponse.json({ error: error.message }, { status: 429 });
    throw error;
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '留言內容格式不正確。' }, { status: 400 });
  }

  const validated = validateReview((body ?? {}) as Record<string, unknown>);
  if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });

  await ensureDatabase();
  const db = getD1();
  const exists = await db.prepare('SELECT id FROM listings WHERE id = ? LIMIT 1').bind(validated.value.listingId).first();
  if (!exists) return NextResponse.json({ error: '找不到這筆租屋資訊。' }, { status: 404 });

  const createdAt = new Date().toISOString();
  const result = await db.prepare(`
    INSERT INTO reviews (listing_id, author_name, rating, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    validated.value.listingId,
    user.name,
    validated.value.rating,
    validated.value.content,
    createdAt,
  ).run();

  return NextResponse.json({ review: {
    id: Number(result.meta.last_row_id),
    authorName: user.name,
    rating: validated.value.rating,
    content: validated.value.content,
    createdAt,
  } }, { status: 201 });
}
