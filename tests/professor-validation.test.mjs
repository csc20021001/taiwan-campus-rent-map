import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { validateProfessorRating } from '../app/api/professors/validation.mjs';

const directorySource = readFileSync(new URL('../app/professors/professor-directory.tsx', import.meta.url), 'utf8');
const professorDbSource = readFileSync(new URL('../db/professors.ts', import.meta.url), 'utf8');

test('professor rating requires all five integer dimensions from 1 to 5', () => {
  const valid = { attitudeScore: 5, learningScore: 4, workloadScore: 2, examDifficultyScore: 3, gradingStandardScore: 4 };
  assert.deepEqual(validateProfessorRating(valid), { ok: true, value: valid });
  assert.equal(validateProfessorRating({ ...valid, workloadScore: 0 }).ok, false);
  assert.equal(validateProfessorRating({ ...valid, examDifficultyScore: 5.5 }).ok, false);
  assert.equal(validateProfessorRating({ attitudeScore: 5 }).ok, false);
  assert.equal(validateProfessorRating({
    attitude_score: 1, learning_score: 5, workload_score: 2, exam_difficulty_score: 3, grading_standard_score: 4,
  }).ok, true);
});

test('professor directory exposes no external source links', () => {
  assert.doesNotMatch(directorySource, /查看官方師資頁|查看學校網站|professor-official-link|target="_blank"/);
  assert.doesNotMatch(professorDbSource, /officialSourceUrl|official_source_url/);
});
