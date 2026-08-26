import { NextResponse } from 'next/server';
import { ensureDatabase, getD1 } from '@/db';

type ListingRow = {
  id: string;
  university_id: string;
  title: string;
  address: string;
  monthly_rent: number;
  room_type: string;
  area_ping: number;
  walk_minutes: number;
  latitude: number;
  longitude: number;
  highlights: string;
  featured: number;
  rating: number;
  review_count: number;
};

export async function GET(request: Request) {
  const school = new URL(request.url).searchParams.get('school') ?? 'ntu';
  if (!/^[a-z0-9-]{2,20}$/.test(school)) {
    return NextResponse.json({ error: '學校代碼格式不正確。' }, { status: 400 });
  }

  await ensureDatabase();
  const result = await getD1().prepare(`
    SELECT
      l.id, l.university_id, l.title, l.address, l.monthly_rent, l.room_type,
      l.area_ping, l.walk_minutes, l.latitude, l.longitude, l.highlights, l.featured,
      ROUND(
        (l.seed_rating * l.seed_review_count + COALESCE(SUM(r.rating), 0)) /
        (l.seed_review_count + COUNT(r.id)),
        1
      ) AS rating,
      l.seed_review_count + COUNT(r.id) AS review_count
    FROM listings l
    LEFT JOIN reviews r ON r.listing_id = l.id
    WHERE l.university_id = ?
    GROUP BY l.id
    ORDER BY l.featured DESC, rating DESC, l.monthly_rent ASC
  `).bind(school).all<ListingRow>();

  const listings = result.results.map((row) => ({
    id: row.id,
    universityId: row.university_id,
    title: row.title,
    address: row.address,
    monthlyRent: row.monthly_rent,
    roomType: row.room_type,
    areaPing: row.area_ping,
    walkMinutes: row.walk_minutes,
    latitude: row.latitude,
    longitude: row.longitude,
    highlights: JSON.parse(row.highlights) as string[],
    featured: Boolean(row.featured),
    rating: row.rating,
    reviewCount: row.review_count,
  }));

  return NextResponse.json({ listings });
}
