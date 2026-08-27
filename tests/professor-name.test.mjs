import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { maskProfessorName } from '../lib/professor-name.mjs';

const professorQueries = readFileSync(new URL('../db/professors.ts', import.meta.url), 'utf8');
const professorDirectory = readFileSync(new URL('../app/professors/professor-directory.tsx', import.meta.url), 'utf8');

test('professor names expose only the outer characters', () => {
  assert.equal(maskProfessorName('毛文芳'), '毛○芳');
  assert.equal(maskProfessorName('歐陽文忠'), '歐○○忠');
  assert.equal(maskProfessorName('王明'), '王○');
  assert.equal(maskProfessorName('Anima Bag'), 'A○○○a B○g');
});

test('professor API responses use masked names', () => {
  assert.match(professorQueries, /name:\s*maskProfessorName\(row\.name\)/);
});

test('professor UI explains learning and lenient grading direction', () => {
  assert.match(professorDirectory, /越高代表越能學到東西/);
  assert.match(professorDirectory, /越高代表給分越寬鬆/);
  assert.match(professorDirectory, /送出五項評分/);
});
