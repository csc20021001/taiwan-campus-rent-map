import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const databaseDirectory = join('.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
const databaseFile = readdirSync(databaseDirectory).find((name) => name.endsWith('.sqlite') && name !== 'metadata.sqlite');

if (!databaseFile) throw new Error('找不到本機 D1 SQLite；請先執行 npm run dev 並開啟一次網站。');

const database = new DatabaseSync(join(databaseDirectory, databaseFile), { readOnly: true });
const indexes = database.prepare("SELECT name FROM sqlite_schema WHERE type = 'index' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
const counts = database.prepare(`SELECT
  (SELECT COUNT(*) FROM universities) AS universities,
  (SELECT COUNT(*) FROM rental_locations) AS rentalLocations,
  (SELECT COUNT(*) FROM rental_location_universities) AS rentalAssociations,
  (SELECT COUNT(*) FROM rental_reports) AS rentalReports,
  (SELECT COUNT(*) FROM academic_departments) AS academicDepartments,
  (SELECT COUNT(*) FROM professors) AS professors,
  (SELECT COUNT(*) FROM professor_ratings) AS professorRatings,
  (SELECT COUNT(*) FROM users) AS users`).get();
const rentalPlan = database.prepare(`EXPLAIN QUERY PLAN SELECT l.id FROM rental_locations l
  JOIN rental_location_universities lu ON lu.rental_location_id = l.id
  WHERE lu.university_id = ? AND l.latitude BETWEEN ? AND ? AND l.longitude BETWEEN ? AND ?`)
  .all('ntu', 24.9, 25.2, 121.4, 121.7);
const reportPlan = database.prepare(`EXPLAIN QUERY PLAN SELECT AVG(monthly_rent) FROM rental_reports
  WHERE rental_location_id = ? AND is_valid = 1 AND is_outlier = 0`).all('rental-id');

console.log(JSON.stringify({ indexes, counts, rentalPlan, reportPlan }, null, 2));
