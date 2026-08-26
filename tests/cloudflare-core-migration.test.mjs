import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

const coreMigration = readFileSync(new URL('../drizzle/0004_cloudflare_core.sql', import.meta.url), 'utf8');
const seedMigration = readFileSync(new URL('../drizzle/0005_seed_government_rentals.sql', import.meta.url), 'utf8');

function apply(database, sql) {
  for (const statement of sql.split('--> statement-breakpoint').map((value) => value.trim()).filter(Boolean)) {
    database.exec(statement);
  }
}

function databaseWithCore() {
  const database = new DatabaseSync(':memory:');
  database.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE universities (id TEXT PRIMARY KEY NOT NULL);
    CREATE TABLE users (id TEXT PRIMARY KEY NOT NULL);
    INSERT INTO universities (id) VALUES
      ('ntu'), ('nthu'), ('nycu'), ('ncku'), ('ncu'), ('nchu'), ('nsysu'), ('ccu'), ('ntust'), ('ntut'), ('niu');
  `);
  apply(database, coreMigration);
  return database;
}

test('government seed is de-duplicated and associated with all supplied schools', () => {
  const database = databaseWithCore();
  apply(database, seedMigration);
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM rental_locations').get().count, 53);
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM rental_location_universities').get().count, 56);
  const shared = database.prepare(`SELECT COUNT(*) AS count
    FROM rental_location_universities lu JOIN rental_locations l ON l.id = lu.rental_location_id
    WHERE l.normalized_address = '新竹市世傑路288號'`).get();
  assert.equal(shared.count, 2);
  assert.equal(database.prepare(`SELECT COUNT(*) AS count FROM rental_locations
    WHERE normalized_address = '新竹市世傑路288號'`).get().count, 1);
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM rental_reports').get().count, 0);
});

test('unique rating/report constraints and rent bounds are enforced', () => {
  const database = databaseWithCore();
  apply(database, seedMigration);
  database.exec(`
    INSERT INTO users (id) VALUES ('user-1');
    INSERT INTO professors (id, university_id, department, name, created_at, updated_at)
    VALUES ('prof-1', 'ntu', '資訊工程學系', '王教授', 'now', 'now');
    INSERT INTO professor_ratings (id, professor_id, user_id, easy_to_pass_score, created_at, updated_at)
    VALUES ('rating-1', 'prof-1', 'user-1', 4, 'now', 'now');
  `);
  assert.throws(() => database.exec(`INSERT INTO professor_ratings
    (id, professor_id, user_id, easy_to_pass_score, created_at, updated_at)
    VALUES ('rating-2', 'prof-1', 'user-1', 5, 'now', 'now')`), /UNIQUE/);
  assert.throws(() => database.exec(`INSERT INTO rental_reports
    (id, rental_location_id, user_id, monthly_rent, overall_rating, created_at, updated_at)
    VALUES ('report-1', 'gov-033ff1ba498d8bfd', 'user-1', 1, 5, 'now', 'now')`), /CHECK/);
});

test('rent and rating statistics average every valid source', () => {
  const database = databaseWithCore();
  apply(database, seedMigration);
  database.exec(`
    INSERT INTO users (id) VALUES ('user-1'), ('user-2');
    INSERT INTO rental_reports
      (id, rental_location_id, user_id, monthly_rent, overall_rating, is_valid, is_outlier, created_at, updated_at)
    SELECT 'report-1', id, 'user-1', 10500, 3, 1, 0, 'now', 'now'
    FROM rental_locations WHERE normalized_address = '臺北市大安區和平東路二段96巷51號';
    INSERT INTO rental_reports
      (id, rental_location_id, user_id, monthly_rent, overall_rating, is_valid, is_outlier, created_at, updated_at)
    SELECT 'report-2', id, 'user-2', 30000, 5, 1, 0, 'now', 'now'
    FROM rental_locations WHERE normalized_address = '臺北市大安區和平東路二段96巷51號';
  `);

  const statistics = database.prepare(`
    SELECT
      ROUND(
        (COALESCE(SUM(CASE WHEN r.is_valid = 1 AND r.is_outlier = 0 THEN r.monthly_rent END), 0)
          + COALESCE(l.reference_rent, 0)) * 1.0 /
        NULLIF(COUNT(CASE WHEN r.is_valid = 1 AND r.is_outlier = 0 THEN 1 END)
          + CASE WHEN l.reference_rent IS NULL THEN 0 ELSE 1 END, 0),
        0
      ) AS average_rent,
      COUNT(CASE WHEN r.is_valid = 1 AND r.is_outlier = 0 THEN 1 END)
        + CASE WHEN l.reference_rent IS NULL THEN 0 ELSE 1 END AS price_source_count,
      ROUND(AVG(CASE WHEN r.is_valid = 1 AND r.is_outlier = 0 THEN r.overall_rating END), 1) AS average_rating
    FROM rental_locations l
    LEFT JOIN rental_reports r ON r.rental_location_id = l.id
    WHERE l.normalized_address = '臺北市大安區和平東路二段96巷51號'
    GROUP BY l.id
  `).get();

  assert.equal(statistics.average_rent, 20000);
  assert.equal(statistics.price_source_count, 3);
  assert.equal(statistics.average_rating, 4);
});
