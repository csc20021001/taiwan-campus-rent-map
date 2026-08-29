import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

const scaleMigration = readFileSync(new URL('../drizzle/0053_course_rating_scale_0_100.sql', import.meta.url), 'utf8')
  .split('--> statement-breakpoint')
  .map((statement) => statement.trim())
  .filter(Boolean);
const restoreDimensionsMigration = readFileSync(new URL('../drizzle/0054_restore_course_rating_dimensions.sql', import.meta.url), 'utf8')
  .split('--> statement-breakpoint')
  .map((statement) => statement.trim())
  .filter(Boolean);

test('0–100 migrations preserve rows and restore the five rating dimensions', () => {
  const database = new DatabaseSync(':memory:');
  database.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE users (id TEXT PRIMARY KEY NOT NULL);
    CREATE TABLE courses (id TEXT PRIMARY KEY NOT NULL);
    CREATE TABLE course_ratings (
      id TEXT PRIMARY KEY NOT NULL,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      instructor_name TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      learning_score INTEGER NOT NULL CHECK (learning_score BETWEEN 1 AND 5),
      workload_score INTEGER NOT NULL CHECK (workload_score BETWEEN 1 AND 5),
      exam_difficulty_score INTEGER NOT NULL CHECK (exam_difficulty_score BETWEEN 1 AND 5),
      grading_standard_score INTEGER NOT NULL CHECK (grading_standard_score BETWEEN 1 AND 5),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (user_id, course_id, instructor_name)
    );
    CREATE INDEX idx_course_ratings_course ON course_ratings(course_id, instructor_name);
    CREATE INDEX idx_course_ratings_user ON course_ratings(user_id);
    CREATE UNIQUE INDEX idx_course_ratings_user_course_instructor ON course_ratings(user_id, course_id, instructor_name);
    CREATE TABLE app_runtime_state (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL, updated_at TEXT NOT NULL);
    INSERT INTO users VALUES ('user-1');
    INSERT INTO courses VALUES ('course-1');
    INSERT INTO course_ratings VALUES ('rating-1', 'course-1', '王老師', 'user-1', 1, 2, 3, 5, 'now', 'now');
  `);

  for (const statement of scaleMigration) database.exec(statement);

  const migratedRating = database.prepare(`SELECT workload_score, exam_difficulty_score, attendance_frequency_score
    FROM course_ratings WHERE id = 'rating-1'`).get();
  assert.deepEqual({ ...migratedRating }, {
    workload_score: 40,
    exam_difficulty_score: 60,
    attendance_frequency_score: null,
  });
  const legacyRating = database.prepare(`SELECT learning_score, workload_score, exam_difficulty_score, grading_standard_score
    FROM course_ratings_legacy_1_to_5 WHERE id = 'rating-1'`).get();
  assert.deepEqual({ ...legacyRating }, {
    learning_score: 1,
    workload_score: 2,
    exam_difficulty_score: 3,
    grading_standard_score: 5,
  });

  database.prepare(`INSERT INTO course_ratings (
      id, course_id, instructor_name, user_id, workload_score,
      exam_difficulty_score, attendance_frequency_score, created_at, updated_at
    ) VALUES ('rating-2', 'course-1', '李老師', 'user-1', 0, 100, 73, 'now', 'now')`).run();

  for (const statement of restoreDimensionsMigration) database.exec(statement);

  const restoredLegacyRating = database.prepare(`SELECT learning_score, workload_score,
      exam_difficulty_score, grading_standard_score, attendance_frequency_score
    FROM course_ratings WHERE id = 'rating-1'`).get();
  assert.deepEqual({ ...restoredLegacyRating }, {
    learning_score: 20,
    workload_score: 40,
    exam_difficulty_score: 60,
    grading_standard_score: 100,
    attendance_frequency_score: null,
  });
  const threeDimensionRating = database.prepare(`SELECT learning_score, grading_standard_score,
      attendance_frequency_score FROM course_ratings WHERE id = 'rating-2'`).get();
  assert.deepEqual({ ...threeDimensionRating }, {
    learning_score: null,
    grading_standard_score: null,
    attendance_frequency_score: 73,
  });

  database.prepare(`INSERT INTO course_ratings (
      id, course_id, instructor_name, user_id, learning_score, workload_score,
      exam_difficulty_score, grading_standard_score, attendance_frequency_score, created_at, updated_at
    ) VALUES ('rating-3', 'course-1', '陳老師', 'user-1', 0, 100, 73, 50, 25, 'now', 'now')`).run();
  assert.throws(() => database.prepare(`INSERT INTO course_ratings VALUES
    ('rating-4', 'course-1', '林老師', 'user-1', 50, 50, 50, 'now', 'now', -1, 50)`).run());
  assert.throws(() => database.prepare(`INSERT INTO course_ratings VALUES
    ('rating-5', 'course-1', '張老師', 'user-1', 50, 50, 50, 'now', 'now', 50, 101)`).run());
  assert.throws(() => database.prepare(`INSERT INTO course_ratings VALUES
    ('rating-6', 'course-1', '趙老師', 'user-1', 50.5, 50, 50, 'now', 'now', 50, 50)`).run());
  assert.equal(database.prepare("SELECT value FROM app_runtime_state WHERE key = 'schema_version'").get().value, '2026-08-29-course-rating-five-dimensions-v1');
  database.close();
});

test('course interface presents editable 0–100 controls and 100-point averages', () => {
  const source = readFileSync(new URL('../app/courses/course-directory.tsx', import.meta.url), 'utf8');
  assert.match(source, /min="0" max="100" step="1"/);
  assert.match(source, /\/ 100/);
  assert.match(source, /0–100 分課程評分/);
  assert.match(source, /label: '學習收穫'/);
  assert.match(source, /label: '作業量'/);
  assert.match(source, /label: '考試難度'/);
  assert.match(source, /label: '給分標準'/);
  assert.match(source, /label: '點名頻率'/);
  assert.match(source, /送出五項課程評分/);
  assert.doesNotMatch(source, /\[1, 2, 3, 4, 5\]/);
});
