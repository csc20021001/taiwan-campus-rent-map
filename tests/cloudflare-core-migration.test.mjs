import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

const coreMigration = readFileSync(new URL('../drizzle/0004_cloudflare_core.sql', import.meta.url), 'utf8');
const seedMigration = readFileSync(new URL('../drizzle/0005_seed_government_rentals.sql', import.meta.url), 'utf8');
const coordinateMigration = readFileSync(new URL('../drizzle/0006_fixed_absolute_coordinates.sql', import.meta.url), 'utf8');
const professorSourceMigration = readFileSync(new URL('../drizzle/0007_official_professor_sources.sql', import.meta.url), 'utf8');
const academicUnitsMigration = readFileSync(new URL('../drizzle/0008_academic_units_and_rating_dimensions.sql', import.meta.url), 'utf8');
const rentalCommentsMigration = readFileSync(new URL('../drizzle/0009_rental_comments.sql', import.meta.url), 'utf8');
const professorLearningMigration = readFileSync(new URL('../drizzle/0010_professor_learning_score.sql', import.meta.url), 'utf8');
const unifiedProfessorMigration = readFileSync(new URL('../drizzle/0011_unify_professor_identities.sql', import.meta.url), 'utf8');
const currentRentalMigration = readFileSync(new URL('../drizzle/0012_nycu_campuses_and_current_rentals.sql', import.meta.url), 'utf8');
const courseMigration = readFileSync(new URL('../drizzle/0013_courses_and_course_ratings.sql', import.meta.url), 'utf8');
const removedUniversityMigration = readFileSync(new URL('../drizzle/0023_replace_ncku_with_private_universities.sql', import.meta.url), 'utf8');

function apply(database, sql) {
  for (const statement of sql.split('--> statement-breakpoint').map((value) => value.trim()).filter(Boolean)) {
    database.exec(statement);
  }
}

function databaseWithCore() {
  const database = new DatabaseSync(':memory:');
  database.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE universities (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      short_name TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      district TEXT NOT NULL DEFAULT '',
      latitude REAL NOT NULL DEFAULT 0,
      longitude REAL NOT NULL DEFAULT 0,
      address TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE users (id TEXT PRIMARY KEY NOT NULL);
    INSERT INTO universities (id) VALUES
      ('ntu'), ('nthu'), ('nycu'), ('ncku'), ('ncu'), ('nchu'), ('nsysu'), ('ccu'), ('ntust'), ('ntut'), ('niu');
  `);
  apply(database, coreMigration);
  apply(database, professorSourceMigration);
  apply(database, academicUnitsMigration);
  apply(database, rentalCommentsMigration);
  apply(database, professorLearningMigration);
  return database;
}

test('rental comments are public records linked to a location and user', () => {
  const database = databaseWithCore();
  apply(database, seedMigration);
  database.exec(`
    INSERT INTO users (id) VALUES ('comment-user');
    INSERT INTO rental_comments
      (id, rental_location_id, user_id, content, created_at, updated_at)
    SELECT 'comment-1', id, 'comment-user', '採光很好，晚上也安靜。', '2026-08-27T01:00:00.000Z', '2026-08-27T01:00:00.000Z'
    FROM rental_locations WHERE normalized_address = '臺北市大安區和平東路二段96巷51號';
  `);
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM rental_comments').get().count, 1);
  assert.throws(() => database.exec(`INSERT INTO rental_comments
    (id, rental_location_id, user_id, content, created_at, updated_at)
    SELECT 'comment-2', id, 'comment-user', '太短', 'now', 'now'
    FROM rental_locations LIMIT 1`), /CHECK/);
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM pragma_index_list('rental_comments') WHERE name = 'idx_rental_comments_location_created'").get().count, 1);
});

test('academic units and five professor rating dimensions migrate with constraints', () => {
  const database = databaseWithCore();
  database.exec(`
    INSERT INTO academic_departments
      (id, university_id, college, name, unit_type, official_source_url, created_at, updated_at)
    VALUES
      ('dept-1', 'ntu', '工學院', '機械工程學系', 'department',
       'https://www.ntu.edu.tw/academics/academics_list.html', 'now', 'now');
    INSERT INTO users (id) VALUES ('dimension-user');
    INSERT INTO professors (id, university_id, department, name, created_at, updated_at)
    VALUES ('dimension-prof', 'ntu', '機械工程學系', '林老師', 'now', 'now');
    INSERT INTO professor_ratings
      (id, professor_id, user_id, easy_to_pass_score, attitude_score, learning_score, workload_score,
       exam_difficulty_score, grading_standard_score, created_at, updated_at)
    VALUES ('dimension-rating', 'dimension-prof', 'dimension-user', 3, 5, 4, 2, 4, 3, 'now', 'now');
  `);
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM academic_departments').get().count, 1);
  assert.equal(database.prepare(`SELECT attitude_score FROM professor_ratings
    WHERE id = 'dimension-rating'`).get().attitude_score, 5);
  assert.equal(database.prepare(`SELECT learning_score FROM professor_ratings
    WHERE id = 'dimension-rating'`).get().learning_score, 4);
  assert.throws(() => database.exec(`UPDATE professor_ratings SET workload_score = 0
    WHERE id = 'dimension-rating'`), /CHECK/);
  assert.throws(() => database.exec(`INSERT INTO academic_departments
    (id, university_id, college, name, unit_type, official_source_url, created_at, updated_at)
    VALUES ('dept-2', 'ntu', '其他學院', '機械工程學系', 'department', 'https://www.ntu.edu.tw/', 'now', 'now')`), /UNIQUE/);
});

test('professors retain an official public source URL', () => {
  const database = databaseWithCore();
  database.exec(`
    INSERT INTO professors
      (id, university_id, department, name, official_source_url, created_at, updated_at)
    VALUES
      ('prof-source-1', 'ntu', '農業經濟學系', '陳教授',
       'https://www.agec.ntu.edu.tw/zh_tw/teacher', 'now', 'now');
  `);
  const professor = database.prepare(`
    SELECT official_source_url FROM professors WHERE id = 'prof-source-1'
  `).get();
  assert.equal(professor.official_source_url, 'https://www.agec.ntu.edu.tw/zh_tw/teacher');
});

test('courses rate four course dimensions and keep official source links', () => {
  const database = databaseWithCore();
  apply(database, courseMigration);
  database.exec(`
    INSERT INTO users (id) VALUES ('course-user');
    INSERT INTO courses
      (id, university_id, term, course_code, name, department, official_source_url,
       department_source_url, created_at, updated_at)
    VALUES ('course-1', 'ntu', '115-1', 'CS1001', '程式設計', '資訊工程學系',
      'https://nol.ntu.edu.tw/', 'https://www.csie.ntu.edu.tw/', 'now', 'now');
    INSERT INTO course_instructors
      (course_id, instructor_name, official_source_url, created_at)
    VALUES ('course-1', '王小明', 'https://www.csie.ntu.edu.tw/', 'now');
    INSERT INTO course_ratings
      (id, course_id, user_id, learning_score, workload_score, exam_difficulty_score,
       grading_standard_score, created_at, updated_at)
    VALUES ('course-rating-1', 'course-1', 'course-user', 5, 4, 3, 2, 'now', 'now');
  `);
  assert.equal(database.prepare("SELECT learning_score FROM course_ratings WHERE id = 'course-rating-1'").get().learning_score, 5);
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM pragma_table_info('course_ratings') WHERE name = 'attitude_score'").get().count, 0);
  assert.throws(() => database.exec("UPDATE course_ratings SET workload_score = 0 WHERE id = 'course-rating-1'"), /CHECK/);
  assert.equal(database.prepare("SELECT official_source_url FROM courses WHERE id = 'course-1'").get().official_source_url, 'https://nol.ntu.edu.tw/');
});

test('same university professor shares one identity and one rating across units', () => {
  const database = databaseWithCore();
  database.exec(`
    INSERT INTO users (id) VALUES ('merge-user');
    INSERT INTO professors (id, university_id, department, name, official_source_url, created_at, updated_at)
    VALUES
      ('prof-a', 'ntu', '資訊工程學系', '林老師', 'https://www.ntu.edu.tw/', 'now', '2026-01-01'),
      ('prof-b', 'ntu', '資料科學學位學程', '林老師', 'https://www.ntu.edu.tw/', 'now', '2026-01-02');
    INSERT INTO professor_ratings
      (id, professor_id, user_id, easy_to_pass_score, attitude_score, learning_score, workload_score,
       exam_difficulty_score, grading_standard_score, created_at, updated_at)
    VALUES
      ('rating-a', 'prof-a', 'merge-user', 3, 3, 3, 3, 3, 3, 'now', '2026-01-01'),
      ('rating-b', 'prof-b', 'merge-user', 4, 4, 4, 4, 4, 4, 'now', '2026-01-02');
  `);
  apply(database, unifiedProfessorMigration);
  const professor = database.prepare("SELECT id, department FROM professors WHERE university_id = 'ntu' AND name = '林老師'").get();
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM professors WHERE university_id = 'ntu' AND name = '林老師'").get().count, 1);
  assert.deepEqual(new Set(professor.department.split('／')), new Set(['資訊工程學系', '資料科學學位學程']));
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM professor_ratings WHERE professor_id = ?').get(professor.id).count, 1);
  assert.equal(database.prepare('SELECT attitude_score FROM professor_ratings WHERE professor_id = ?').get(professor.id).attitude_score, 4);
  assert.throws(() => database.exec(`INSERT INTO professors
    (id, university_id, department, name, official_source_url, created_at, updated_at)
    VALUES ('prof-c', 'ntu', '其他學程', '林老師', 'https://www.ntu.edu.tw/', 'now', 'now')`), /UNIQUE/);
});

test('government seed is de-duplicated and associated with all supplied schools', () => {
  const database = databaseWithCore();
  apply(database, seedMigration);
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM rental_locations').get().count, 48);
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM rental_location_universities').get().count, 51);
  const shared = database.prepare(`SELECT COUNT(*) AS count
    FROM rental_location_universities lu JOIN rental_locations l ON l.id = lu.rental_location_id
    WHERE l.normalized_address = '新竹市世傑路288號'`).get();
  assert.equal(shared.count, 2);
  assert.equal(database.prepare(`SELECT COUNT(*) AS count FROM rental_locations
    WHERE normalized_address = '新竹市世傑路288號'`).get().count, 1);
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM rental_reports').get().count, 0);
});

test('current government listings and both NYCU campuses migrate', () => {
  const database = databaseWithCore();
  apply(database, seedMigration);
  apply(database, currentRentalMigration);
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM universities WHERE id = 'nycu-yangming'").get().count, 1);
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM rental_locations WHERE id LIKE 'moe-current-%'").get().count, 3);
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM rental_locations WHERE id LIKE 'moe-current-%' AND source = 'government'").get().count, 3);
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM rental_locations WHERE id LIKE 'moe-current-%' AND reference_rent_source LIKE '教育部雲端租屋生活網%'").get().count, 3);
});

test('removed university migration deletes every linked record', () => {
  const database = databaseWithCore();
  apply(database, courseMigration);
  database.exec(`
    CREATE TABLE listings (id TEXT PRIMARY KEY NOT NULL, university_id TEXT NOT NULL);
    CREATE TABLE reviews (id TEXT PRIMARY KEY NOT NULL, listing_id TEXT NOT NULL);
    CREATE TABLE app_runtime_state (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL, updated_at TEXT NOT NULL);
    INSERT INTO app_runtime_state VALUES ('schema_version', 'old', 'now');
    INSERT INTO users (id) VALUES ('remove-user');
    INSERT INTO listings VALUES ('remove-listing', 'ncku');
    INSERT INTO reviews VALUES ('remove-review', 'remove-listing');
    INSERT INTO rental_locations
      (id, university_id, address, normalized_address, source, coordinates_verified, created_at, updated_at)
    VALUES ('remove-rental', 'ncku', '測試地址', '測試地址', 'government', 0, 'now', 'now');
    INSERT INTO rental_location_universities VALUES ('remove-rental', 'ncku', 'now');
    INSERT INTO rental_reports
      (id, rental_location_id, user_id, monthly_rent, overall_rating, is_valid, is_outlier, created_at, updated_at)
    VALUES ('remove-report', 'remove-rental', 'remove-user', 5000, 3, 1, 0, 'now', 'now');
    INSERT INTO rental_comments
      (id, rental_location_id, user_id, content, created_at, updated_at)
    VALUES ('remove-comment', 'remove-rental', 'remove-user', '這是測試留言', 'now', 'now');
    INSERT INTO academic_departments
      (id, university_id, college, name, unit_type, official_source_url, created_at, updated_at)
    VALUES ('remove-dept', 'ncku', '測試學院', '測試學系', 'department', 'https://example.invalid/', 'now', 'now');
    INSERT INTO professors
      (id, university_id, department, name, official_source_url, created_at, updated_at)
    VALUES ('remove-professor', 'ncku', '測試學系', '測試教授', 'https://example.invalid/', 'now', 'now');
    INSERT INTO professor_ratings
      (id, professor_id, user_id, easy_to_pass_score, attitude_score, learning_score, workload_score,
       exam_difficulty_score, grading_standard_score, created_at, updated_at)
    VALUES ('remove-professor-rating', 'remove-professor', 'remove-user', 3, 3, 3, 3, 3, 3, 'now', 'now');
    INSERT INTO courses
      (id, university_id, term, course_code, name, department, official_source_url,
       department_source_url, created_at, updated_at)
    VALUES ('remove-course', 'ncku', '115-1', 'TEST', '測試課程', '測試學系',
      'https://example.invalid/', 'https://example.invalid/', 'now', 'now');
    INSERT INTO course_instructors VALUES ('remove-course', '測試教授', 'remove-professor', 'https://example.invalid/', 'now');
    INSERT INTO course_ratings
      (id, course_id, user_id, learning_score, workload_score, exam_difficulty_score,
       grading_standard_score, created_at, updated_at)
    VALUES ('remove-course-rating', 'remove-course', 'remove-user', 3, 3, 3, 3, 'now', 'now');
  `);

  apply(database, removedUniversityMigration);

  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM universities WHERE id = 'ncku'").get().count, 0);
  for (const table of ['listings', 'reviews', 'rental_locations', 'rental_location_universities',
    'rental_reports', 'rental_comments', 'academic_departments', 'professors', 'professor_ratings',
    'courses', 'course_instructors', 'course_ratings']) {
    assert.equal(database.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count, 0, table);
  }
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM universities WHERE id IN ('cycu', 'tku', 'yzu', 'fcu')").get().count, 4);
  database.close();
});

test('fixed absolute migration separates shared street centroids', () => {
  const database = databaseWithCore();
  apply(database, seedMigration);
  apply(database, coordinateMigration);
  const rows = database.prepare(`SELECT normalized_address, latitude, longitude, coordinate_source
    FROM rental_locations WHERE normalized_address LIKE '新竹市公道五路二段%'
    ORDER BY normalized_address`).all();
  assert.equal(rows.length, 4);
  assert.equal(new Set(rows.map((row) => `${row.latitude},${row.longitude}`)).size, 4);
  assert.equal(rows.every((row) => row.coordinate_source === 'fixed_absolute_estimate'), true);
  const fixed = database.prepare(`SELECT latitude, longitude FROM rental_locations
    WHERE normalized_address = '新竹市公道五路二段293號'`).get();
  assert.equal(fixed.latitude, 24.79592);
  assert.equal(fixed.longitude, 121.0103);
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
