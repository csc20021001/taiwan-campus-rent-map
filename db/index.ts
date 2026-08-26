import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { universities } from '../app/data';

const sampleListingIds = [
  'ntu-01', 'ntu-02', 'ntu-03', 'nthu-01', 'nycu-01', 'ncku-01', 'ncu-01',
  'nchu-01', 'ccu-01', 'nsysu-01', 'ntust-01', 'ntut-01', 'niu-01',
];

let databaseReady: Promise<void> | null = null;

export function getD1() {
  if (!env.DB) throw new Error('Cloudflare D1 binding `DB` is unavailable.');
  return env.DB;
}

export function getDb() {
  return drizzle(getD1(), { schema });
}

async function migrateLegacyListings() {
  const db = getD1();
  const tableInfo = await db.prepare('PRAGMA table_info(listings)').all<{ name: string }>();
  const isLegacy = tableInfo.results.length > 0 && !tableInfo.results.some((column) => column.name === 'owner_user_id');
  if (!isLegacy) return;

  await db.batch([
    db.prepare('DROP TABLE IF EXISTS reviews'),
    db.prepare('DROP TABLE IF EXISTS listings'),
  ]);
}

async function initializeDatabase() {
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
    db.prepare(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      google_sub TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS auth_sessions (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`),
  ]);

  await migrateLegacyListings();

  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY NOT NULL,
      university_id TEXT NOT NULL REFERENCES universities(id) ON DELETE RESTRICT,
      owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      title TEXT NOT NULL,
      address TEXT NOT NULL,
      description TEXT NOT NULL,
      monthly_rent INTEGER NOT NULL,
      room_type TEXT NOT NULL,
      area_ping REAL NOT NULL,
      walk_minutes INTEGER NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      highlights TEXT NOT NULL,
      contact_method TEXT NOT NULL,
      contact_value TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'published',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      author_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`),
    db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_expires ON auth_sessions(user_id, expires_at)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_listings_university_status ON listings(university_id, status)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_listings_owner_created ON listings(owner_user_id, created_at DESC)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_reviews_listing_created ON reviews(listing_id, created_at DESC)'),
  ]);

  const placeholders = sampleListingIds.map(() => '?').join(', ');
  await db.batch([
    db.prepare(`DELETE FROM reviews WHERE listing_id IN (${placeholders})`).bind(...sampleListingIds),
    db.prepare(`DELETE FROM listings WHERE id IN (${placeholders})`).bind(...sampleListingIds),
  ]);

  const schoolSeeds = universities.map((school) => db.prepare(`
    INSERT INTO universities
      (id, name, short_name, city, district, latitude, longitude, address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      short_name = excluded.short_name,
      city = excluded.city,
      district = excluded.district,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      address = excluded.address
  `).bind(school.id, school.name, school.shortName, school.city, school.district, school.latitude, school.longitude, school.address));
  await db.batch(schoolSeeds);
}

export function ensureDatabase() {
  if (!databaseReady) {
    databaseReady = initializeDatabase().catch((error) => {
      databaseReady = null;
      throw error;
    });
  }
  return databaseReady;
}
