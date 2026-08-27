import { NextResponse } from 'next/server';
import { getSessionUser, isSameOriginRequest } from '@/app/auth/server';
import { ensureDatabase, getD1 } from '@/db';
import { attachRentalToUniversity, findExistingRental, getRentalLocation, listRentalLocations } from '@/db/rentals';
import { normalizeAddress } from '@/db/normalization.mjs';
import { enforceUserRateLimit, RateLimitError } from '@/db/rate-limit';
import { validateRentalLocation } from './validation.mjs';

const SCHOOL_ID = /^[a-z0-9-]{2,20}$/;

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const universityId = params.get('university_id') ?? '';
  if (!SCHOOL_ID.test(universityId)) return NextResponse.json({ error: '請指定有效的 university_id。' }, { status: 400 });

  const rawBounds = ['north', 'south', 'east', 'west'].map((key) => params.get(key));
  const hasAnyBound = rawBounds.some((value) => value !== null);
  const hasAllBounds = rawBounds.every((value) => value !== null);
  if (hasAnyBound && !hasAllBounds) return NextResponse.json({ error: '地圖範圍必須同時包含 north、south、east、west。' }, { status: 400 });
  const [north, south, east, west] = rawBounds.map((value) => value === null ? undefined : Number(value));
  if (hasAllBounds && (![north, south, east, west].every(Number.isFinite) || north! <= south! || east! <= west!)) {
    return NextResponse.json({ error: '地圖範圍格式不正確。' }, { status: 400 });
  }

  await ensureDatabase();
  const rentals = await listRentalLocations({ universityId, north, south, east, west });
  return NextResponse.json({ rentals }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: '不允許跨站新增地點。' }, { status: 403 });
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: '請先使用 Google 登入。' }, { status: 401 });
  try {
    await enforceUserRateLimit(user.id, 'rental-location', 8, 60);
  } catch (error) {
    if (error instanceof RateLimitError) return NextResponse.json({ error: error.message }, { status: 429 });
    throw error;
  }

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: '資料格式不正確。' }, { status: 400 }); }
  const validated = validateRentalLocation((body ?? {}) as Record<string, unknown>);
  if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });

  await ensureDatabase();
  const db = getD1();
  const school = await db.prepare('SELECT id FROM universities WHERE id = ? LIMIT 1').bind(validated.value.universityId).first();
  if (!school) return NextResponse.json({ error: '找不到指定學校。' }, { status: 404 });

  const existing = await findExistingRental(validated.value.address, validated.value.latitude, validated.value.longitude);
  if (existing) {
    await attachRentalToUniversity(existing.id, validated.value.universityId);
    return NextResponse.json({ rental: await getRentalLocation(existing.id), deduplicated: true });
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.batch([
    db.prepare(`INSERT INTO rental_locations (
      id, university_id, address, normalized_address, latitude, longitude, source,
      reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
      created_by_user_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'user', NULL, NULL, 'user-map', 1, ?, ?, ?)`)
      .bind(id, validated.value.universityId, validated.value.address, normalizeAddress(validated.value.address),
        validated.value.latitude, validated.value.longitude, user.id, now, now),
    db.prepare(`INSERT INTO rental_location_universities (rental_location_id, university_id, created_at)
      VALUES (?, ?, ?)`).bind(id, validated.value.universityId, now),
  ]);
  return NextResponse.json({ rental: await getRentalLocation(id), deduplicated: false }, { status: 201 });
}
