import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const home = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const rentalsPage = readFileSync(new URL('../app/rentals/page.tsx', import.meta.url), 'utf8');

test('homepage asks users to choose rentals or professors', () => {
  assert.match(home, /今天想查什麼/);
  assert.match(home, /href="\/rentals"/);
  assert.match(home, /查房子/);
  assert.match(home, /href="\/professors"/);
  assert.match(home, /查教授/);
  assert.doesNotMatch(home, /RentalExplorer/);
});

test('rental map remains available on its dedicated route', () => {
  assert.match(rentalsPage, /RentalExplorer/);
});
