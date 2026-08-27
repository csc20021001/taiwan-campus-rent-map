import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const courseSeeds = readFileSync(new URL('../db/course-seeds.ts', import.meta.url), 'utf8');
const courseDirectory = readFileSync(new URL('../app/courses/course-directory.tsx', import.meta.url), 'utf8');

test('course instructors use full public names without masking', () => {
  assert.match(courseSeeds, /\{ name: '吳紀聖' \}/);
  assert.match(courseDirectory, /instructor\.name/);
  assert.doesNotMatch(courseDirectory, /maskProfessorName|○/);
});

test('course UI explains learning and lenient grading direction', () => {
  assert.match(courseDirectory, /越高代表越能學到東西/);
  assert.match(courseDirectory, /越高代表給分越寬鬆/);
  assert.match(courseDirectory, /送出四項課程評分/);
});
