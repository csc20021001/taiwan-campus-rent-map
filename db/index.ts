import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { previewListings, universities } from '../app/data';

const seedComments: Record<string, { author: string; rating: number; content: string }> = {
  'ntu-01': { author: '阿庭', rating: 5, content: '採光真的很好，房東回覆也快。晚上溫州街很安靜，走去學校很方便。' },
  'ntu-02': { author: '小予', rating: 4, content: '離捷運和超商都近，公共空間保持得滿乾淨，隔音普通。' },
  'ntu-03': { author: '林同學', rating: 5, content: '獨立洗衣機很加分，管理員收包裹也方便，整體住得安心。' },
  'nthu-01': { author: '建功人', rating: 5, content: '陽台通風、附近吃的很多，晚一點回家也還算熱鬧。' },
  'nycu-01': { author: '交大生', rating: 4, content: '合租室友單純，公共客廳夠大，騎車進校園很快。' },
  'ncku-01': { author: '成杏人', rating: 5, content: '房間新、網路穩，育樂街生活機能不用多說。' },
  'ncu-01': { author: '松果', rating: 4, content: '採光很舒服也能養貓，冬天風大但房間沒有明顯潮濕。' },
  'nchu-01': { author: '興大米', rating: 5, content: '買菜吃飯都方便，垃圾集中處理對學生很省事。' },
  'ccu-01': { author: '民雄仔', rating: 4, content: '環境安靜、停機車方便，晚上回家建議結伴。' },
  'nsysu-01': { author: '西子灣', rating: 5, content: '陽台真的看得到海，搭輕軌也方便，夏天西曬稍微明顯。' },
  'ntust-01': { author: '北漂生', rating: 4, content: '共居規則清楚，定期清潔很有感，房間空間偏精巧。' },
  'ntut-01': { author: '光華人', rating: 5, content: '交通超方便，有電梯搬行李輕鬆，附近晚上也很熱鬧。' },
  'niu-01': { author: '蘭陽人', rating: 5, content: '陽台曬衣服很快，附近採買方便，房東溝通很親切。' },
};

export function getD1() {
  if (!env.DB) throw new Error('Cloudflare D1 binding `DB` is unavailable.');
  return env.DB;
}

export function getDb() {
  return drizzle(getD1(), { schema });
}

export async function ensureDatabase() {
  const db = getD1();
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS universities (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      short_name TEXT NOT NULL,
      city TEXT NOT NULL,
      district TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      address TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY NOT NULL,
      university_id TEXT NOT NULL REFERENCES universities(id),
      title TEXT NOT NULL,
      address TEXT NOT NULL,
      monthly_rent INTEGER NOT NULL,
      room_type TEXT NOT NULL,
      area_ping REAL NOT NULL,
      walk_minutes INTEGER NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      highlights TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      seed_rating REAL NOT NULL DEFAULT 0,
      seed_review_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      listing_id TEXT NOT NULL REFERENCES listings(id),
      author_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_listings_university_id ON listings(university_id)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_reviews_listing_created ON reviews(listing_id, created_at DESC)'),
  ]);

  const schoolSeeds = universities.map((school) => db.prepare(`
    INSERT OR IGNORE INTO universities
      (id, name, short_name, city, district, latitude, longitude, address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(school.id, school.name, school.shortName, school.city, school.district, school.latitude, school.longitude, school.address));
  await db.batch(schoolSeeds);

  const listingSeeds = previewListings.map((listing) => db.prepare(`
    INSERT OR IGNORE INTO listings
      (id, university_id, title, address, monthly_rent, room_type, area_ping, walk_minutes, latitude, longitude, highlights, featured, seed_rating, seed_review_count, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    listing.id, listing.universityId, listing.title, listing.address, listing.monthlyRent,
    listing.roomType, listing.areaPing, listing.walkMinutes, listing.latitude, listing.longitude,
    JSON.stringify(listing.highlights), listing.featured ? 1 : 0, listing.rating,
    listing.reviewCount, '2026-08-26T00:00:00.000Z',
  ));
  await db.batch(listingSeeds);

  const reviewSeeds = Object.entries(seedComments).map(([listingId, review]) => db.prepare(`
    INSERT INTO reviews (listing_id, author_name, rating, content, created_at)
    SELECT ?, ?, ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM reviews WHERE listing_id = ? AND author_name = ? AND content = ?
    )
  `).bind(listingId, review.author, review.rating, review.content, '2026-08-20T12:00:00.000Z', listingId, review.author, review.content));
  await db.batch(reviewSeeds);
  await db.prepare('PRAGMA optimize').run();
}
