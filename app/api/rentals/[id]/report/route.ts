import { NextResponse } from 'next/server';
import { getSessionUser, isSameOriginRequest } from '@/app/auth/server';
import { ensureDatabase, getD1 } from '@/db';
import { getRentalLocation, medianRentExcludingUser } from '@/db/rentals';
import { enforceUserRateLimit, RateLimitError } from '@/db/rate-limit';
import { validateRentalReport } from '../../validation.mjs';

const RENTAL_ID = /^[a-z0-9-]{2,80}$/i;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: '不允許跨站回報。' }, { status: 403 });
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: '請先使用 Google 登入。' }, { status: 401 });
  const { id } = await context.params;
  if (!RENTAL_ID.test(id)) return NextResponse.json({ error: '租屋地點代碼格式不正確。' }, { status: 400 });
  try {
    await enforceUserRateLimit(user.id, 'rental-report', 20, 60);
  } catch (error) {
    if (error instanceof RateLimitError) return NextResponse.json({ error: error.message }, { status: 429 });
    throw error;
  }

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: '資料格式不正確。' }, { status: 400 }); }
  const validated = validateRentalReport((body ?? {}) as Record<string, unknown>);
  if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });

  await ensureDatabase();
  const db = getD1();
  const location = await db.prepare('SELECT id FROM rental_locations WHERE id = ? LIMIT 1').bind(id).first();
  if (!location) return NextResponse.json({ error: '找不到租屋地點。' }, { status: 404 });

  const baseline = await medianRentExcludingUser(id, user.id);
  const isOutlier = baseline.priceSourceCount >= 5 && baseline.medianRent !== null &&
    (validated.value.monthlyRent < baseline.medianRent * 0.4 || validated.value.monthlyRent > baseline.medianRent * 2.5);
  const now = new Date().toISOString();
  await db.prepare(`INSERT INTO rental_reports (
      id, rental_location_id, user_id, monthly_rent, overall_rating, is_valid, is_outlier, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
    ON CONFLICT(user_id, rental_location_id) DO UPDATE SET
      monthly_rent = excluded.monthly_rent,
      overall_rating = excluded.overall_rating,
      is_valid = 1,
      is_outlier = excluded.is_outlier,
      updated_at = excluded.updated_at`)
    .bind(crypto.randomUUID(), id, user.id, validated.value.monthlyRent, validated.value.overallRating, isOutlier ? 1 : 0, now, now).run();

  return NextResponse.json({ rental: await getRentalLocation(id), excludedAsOutlier: isOutlier });
}
