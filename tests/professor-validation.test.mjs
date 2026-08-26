import assert from 'node:assert/strict';
import test from 'node:test';
import { validateProfessorRating } from '../app/api/professors/validation.mjs';

test('professor rating accepts only integer scores from 1 to 5', () => {
  assert.equal(validateProfessorRating({ easyToPassScore: 1 }).ok, true);
  assert.equal(validateProfessorRating({ easy_to_pass_score: 5 }).ok, true);
  assert.equal(validateProfessorRating({ easyToPassScore: 0 }).ok, false);
  assert.equal(validateProfessorRating({ easyToPassScore: 5.5 }).ok, false);
});
