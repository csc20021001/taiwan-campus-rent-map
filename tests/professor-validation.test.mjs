import assert from 'node:assert/strict';
import test from 'node:test';
import { validateProfessorRating } from '../app/api/professors/validation.mjs';

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
