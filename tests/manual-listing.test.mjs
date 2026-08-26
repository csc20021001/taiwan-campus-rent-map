import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

const migration = readFileSync(new URL('../drizzle/0003_add_yizhong_listing.sql', import.meta.url), 'utf8');

test('manual Yizhong Road listing keeps supplied facts without inventing rental terms', () => {
  const database = new DatabaseSync(':memory:');
  database.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE universities (id TEXT PRIMARY KEY NOT NULL);
    INSERT INTO universities (id) VALUES ('niu');
    CREATE TABLE users (
      id TEXT PRIMARY KEY NOT NULL, google_sub TEXT NOT NULL UNIQUE, email TEXT NOT NULL,
      name TEXT NOT NULL, avatar_url TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE listings (
      id TEXT PRIMARY KEY NOT NULL, university_id TEXT NOT NULL REFERENCES universities(id),
      owner_user_id TEXT NOT NULL REFERENCES users(id), title TEXT NOT NULL, address TEXT NOT NULL,
      description TEXT NOT NULL, monthly_rent INTEGER NOT NULL, room_type TEXT NOT NULL,
      area_ping REAL NOT NULL, walk_minutes INTEGER NOT NULL, latitude REAL NOT NULL,
      longitude REAL NOT NULL, highlights TEXT NOT NULL, contact_method TEXT NOT NULL,
      contact_value TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
  `);
  for (const statement of migration.split('--> statement-breakpoint').map((value) => value.trim()).filter(Boolean)) {
    database.exec(statement);
  }
  const listing = database.prepare(`
    SELECT address, monthly_rent, room_type, area_ping, walk_minutes, contact_value, description
    FROM listings WHERE id = 'manual-niu-yizhong-82'
  `).get();

  assert.equal(listing.address, '260 宜蘭縣宜蘭市思源里宜中路82號');
  assert.equal(listing.contact_value, '0972249085');
  assert.equal(listing.monthly_rent, 0);
  assert.equal(listing.room_type, '詳情請洽');
  assert.equal(listing.area_ping, 0);
  assert.equal(listing.walk_minutes, 0);
  assert.match(listing.description, /約略位置/);
});
