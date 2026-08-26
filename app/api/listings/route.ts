import { NextResponse } from 'next/server';
import { ensureDatabase, getD1 } from '@/db';
import { getSessionUser, isSameOriginRequest } from '@/app/auth/server';
import { validateListing } from './validation.mjs';

type ListingRow = {
  id: string;
  university_id: string;
  title: string;
  address: string;
  description: string;
  monthly_rent: number;
  room_type: string;
  area_ping: number;
  walk_minutes: number;
  latitude: number;
  longitude: number;
  highlights: string;
  contact_method: string;
  contact_value: string;
  rating: number;
  review_count: number;
};

function toListing(row: ListingRow) {
  return {
    id: row.id,
    universityId: row.university_id,
    title: row.title,
    address: row.address,
    description: row.description,
    monthlyRent: row.monthly_rent,
    roomType: row.room_type,
    areaPing: row.area_ping,
    walkMinutes: row.walk_minutes,
    latitude: row.latitude,
    longitude: row.longitude,
    highlights: JSON.parse(row.highlights) as string[],
    contactMethod: row.contact_method,
    contactValue: row.contact_value,
    featured: false,
    rating: row.rating,
    reviewCount: row.review_count,
  };
}

export async function GET(request: Request) {
  const school = new URL(request.url).searchParams.get('school') ?? 'ntu';
  if (!/^[a-z0-9-]{2,20}$/.test(school)) {
    return NextResponse.json({ error: '學校代碼格式不正確。' }, { status: 400 });
  }

  await ensureDatabase();
  const result = await getD1().prepare(`
    SELECT
      l.id, l.university_id, l.title, l.address, l.description, l.monthly_rent,
      l.room_type, l.area_ping, l.walk_minutes, l.latitude, l.longitude,
      l.highlights, l.contact_method, l.contact_value,
      COALESCE(ROUND(AVG(r.rating), 1), 0) AS rating,
      COUNT(r.id) AS review_count
    FROM listings l
    LEFT JOIN reviews r ON r.listing_id = l.id
    WHERE l.university_id = ? AND l.status = 'published'
    GROUP BY l.id
    ORDER BY l.created_at DESC, l.monthly_rent ASC
    LIMIT 100
  `).bind(school).all<ListingRow>();

  return NextResponse.json({ listings: result.results.map(toListing) });
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: '不允許跨站刊登。' }, { status: 403 });
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: '請先使用 Google 登入。' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '刊登內容格式不正確。' }, { status: 400 });
  }
  const validated = validateListing((body ?? {}) as Record<string, unknown>);
  if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });

  await ensureDatabase();
  const db = getD1();
  const school = await db.prepare('SELECT id FROM universities WHERE id = ? LIMIT 1').bind(validated.value.universityId).first();
  if (!school) return NextResponse.json({ error: '找不到指定學校。' }, { status: 404 });

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.prepare(`
    INSERT INTO listings (
      id, university_id, owner_user_id, title, address, description, monthly_rent,
      room_type, area_ping, walk_minutes, latitude, longitude, highlights,
      contact_method, contact_value, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)
  `).bind(
    id,
    validated.value.universityId,
    user.id,
    validated.value.title,
    validated.value.address,
    validated.value.description,
    validated.value.monthlyRent,
    validated.value.roomType,
    validated.value.areaPing,
    validated.value.walkMinutes,
    validated.value.latitude,
    validated.value.longitude,
    JSON.stringify(validated.value.highlights),
    validated.value.contactMethod,
    validated.value.contactValue,
    now,
    now,
  ).run();

  return NextResponse.json({ listing: {
    ...validated.value,
    id,
    rating: 0,
    reviewCount: 0,
    featured: false,
  } }, { status: 201 });
}
