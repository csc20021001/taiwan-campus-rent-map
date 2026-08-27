import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { validateCourseRating } from '../app/api/courses/validation.mjs';

const directorySource = readFileSync(new URL('../app/courses/course-directory.tsx', import.meta.url), 'utf8');
const courseDbSource = readFileSync(new URL('../db/courses.ts', import.meta.url), 'utf8');

test('course rating requires all four integer dimensions from 1 to 5', () => {
  const valid = { learningScore: 4, workloadScore: 2, examDifficultyScore: 3, gradingStandardScore: 4 };
  assert.deepEqual(validateCourseRating(valid), { ok: true, value: valid });
  assert.equal(validateCourseRating({ ...valid, workloadScore: 0 }).ok, false);
  assert.equal(validateCourseRating({ ...valid, examDifficultyScore: 5.5 }).ok, false);
  assert.equal(validateCourseRating({ learningScore: 5 }).ok, false);
  assert.equal(validateCourseRating({
    learning_score: 5, workload_score: 2, exam_difficulty_score: 3, grading_standard_score: 4,
  }).ok, true);
});

test('course directory exposes university official course, teacher, and department links', () => {
  assert.match(directorySource, /官方課程資料/);
  assert.match(directorySource, /官方系所網站/);
  assert.match(directorySource, /instructor\.officialSourceUrl/);
  assert.match(directorySource, /target="_blank"/);
  assert.match(courseDbSource, /officialSourceUrl/);
  assert.doesNotMatch(directorySource, /老師態度|attitudeScore|averageAttitude/);
});
