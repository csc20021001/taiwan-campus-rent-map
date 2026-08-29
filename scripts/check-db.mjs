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
  (SELECT COUNT(*) FROM academic_departments) AS academicDepartments,
  (SELECT COUNT(*) FROM professors) AS professors,
  (SELECT COUNT(*) FROM courses) AS courses,
  (SELECT COUNT(*) FROM course_instructors) AS courseInstructors,
  (SELECT COUNT(*) FROM course_ratings) AS courseRatings,
  (SELECT COUNT(*) FROM users) AS users`).get();
const coursePlan = database.prepare(`EXPLAIN QUERY PLAN SELECT id FROM courses
  WHERE university_id = ? AND semester = ? AND department = ? ORDER BY name LIMIT 36`)
  .all('ntu', '1', '資訊工程學系');
const ratingPlan = database.prepare(`EXPLAIN QUERY PLAN SELECT AVG(workload_score) FROM course_ratings
  WHERE course_id = ? AND instructor_name = ?`).all('course-id', '教師');

console.log(JSON.stringify({ indexes, counts, coursePlan, ratingPlan }, null, 2));
