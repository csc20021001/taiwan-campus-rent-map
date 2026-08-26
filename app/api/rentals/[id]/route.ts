import { NextResponse } from 'next/server';
import { ensureDatabase } from '@/db';
import { getRentalLocation } from '@/db/rentals';

const RENTAL_ID = /^[a-z0-9-]{2,80}$/i;

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!RENTAL_ID.test(id)) return NextResponse.json({ error: '租屋地點代碼格式不正確。' }, { status: 400 });
  await ensureDatabase();
  const rental = await getRentalLocation(id);
  if (!rental) return NextResponse.json({ error: '找不到租屋地點。' }, { status: 404 });
  return NextResponse.json({ rental }, { headers: { 'Cache-Control': 'public, max-age=30, s-maxage=120' } });
}
