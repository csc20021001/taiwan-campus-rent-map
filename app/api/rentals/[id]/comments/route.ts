import { NextResponse } from 'next/server';
import { ensureDatabase, getD1 } from '@/db';
import { getSessionUser, isSameOriginRequest } from '@/app/auth/server';
import { enforceUserRateLimit, RateLimitError } from '@/db/rate-limit';
import { validateRentalComment } from '../../comments-validation.mjs';

const RENTAL_ID = /^[a-z0-9-]{2,80}$/i;
type CommentRow = { id: string; author_name: string; content: string; created_at: string };

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!RENTAL_ID.test(id)) return NextResponse.json({ error: '租屋地點代碼格式不正確。' }, { status: 400 });

  await ensureDatabase();
  const result = await getD1().prepare(`
    SELECT c.id, u.name AS author_name, c.content, c.created_at
    FROM rental_comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.rental_location_id = ?
    ORDER BY c.created_at DESC, c.id DESC
    LIMIT 50
  `).bind(id).all<CommentRow>();

  return NextResponse.json({ comments: result.results.map((row) => ({
    id: row.id,
    authorName: row.author_name,
    content: row.content,
    createdAt: row.created_at,
  })) }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: '不允許跨站評論。' }, { status: 403 });
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: '請先使用 Google 登入。' }, { status: 401 });
  const { id } = await context.params;
  if (!RENTAL_ID.test(id)) return NextResponse.json({ error: '租屋地點代碼格式不正確。' }, { status: 400 });

  try {
    await enforceUserRateLimit(user.id, 'rental-comment', 10, 60);
  } catch (error) {
    if (error instanceof RateLimitError) return NextResponse.json({ error: error.message }, { status: 429 });
    throw error;
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: '評論格式不正確。' }, { status: 400 });
  }
  const validated = validateRentalComment((body ?? {}) as Record<string, unknown>);
  if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });

  await ensureDatabase();
  const db = getD1();
  const location = await db.prepare('SELECT id FROM rental_locations WHERE id = ? LIMIT 1').bind(id).first();
  if (!location) return NextResponse.json({ error: '找不到租屋地點。' }, { status: 404 });

  const createdAt = new Date().toISOString();
  const commentId = crypto.randomUUID();
  await db.prepare(`
    INSERT INTO rental_comments (id, rental_location_id, user_id, content, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(commentId, id, user.id, validated.value.content, createdAt, createdAt).run();

  return NextResponse.json({ comment: {
    id: commentId,
    authorName: user.name,
    content: validated.value.content,
    createdAt,
  } }, { status: 201 });
}
