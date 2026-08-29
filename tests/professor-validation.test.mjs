import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { validateCourseRating } from '../app/api/courses/validation.mjs';

const directorySource = readFileSync(new URL('../app/courses/course-directory.tsx', import.meta.url), 'utf8');
const courseDbSource = readFileSync(new URL('../db/courses.ts', import.meta.url), 'utf8');

test('course rating requires all five integer dimensions from 0 to 100', () => {
  const valid = {
    learningScore: 84,
    workloadScore: 0,
    examDifficultyScore: 51,
    gradingStandardScore: 73,
    attendanceFrequencyScore: 100,
  };
  assert.deepEqual(validateCourseRating(valid), { ok: true, value: valid });
  assert.equal(validateCourseRating({ ...valid, learningScore: -1 }).ok, false);
  assert.equal(validateCourseRating({ ...valid, workloadScore: -1 }).ok, false);
  assert.equal(validateCourseRating({ ...valid, examDifficultyScore: 100.5 }).ok, false);
  assert.equal(validateCourseRating({ ...valid, gradingStandardScore: 101 }).ok, false);
  assert.equal(validateCourseRating({ ...valid, attendanceFrequencyScore: 101 }).ok, false);
  assert.equal(validateCourseRating({ workloadScore: 100 }).ok, false);
  assert.equal(validateCourseRating({ ...valid, workloadScore: null }).ok, false);
  assert.equal(validateCourseRating({ ...valid, workloadScore: '' }).ok, false);
  assert.equal(validateCourseRating({ ...valid, workloadScore: false }).ok, false);
  assert.equal(validateCourseRating({
    learning_score: 84,
    workload_score: 0,
    exam_difficulty_score: 51,
    grading_standard_score: 73,
    attendance_frequency_score: 100,
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
