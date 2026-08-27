import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const home = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const rentalsPage = readFileSync(new URL('../app/rentals/page.tsx', import.meta.url), 'utf8');

test('homepage asks users to choose rentals or courses', () => {
  assert.match(home, /今天想查什麼/);
  assert.match(home, /openDisclaimer\('rentals'\)/);
  assert.match(home, /查房子/);
  assert.match(home, /openDisclaimer\('courses'\)/);
  assert.match(home, /查課程/);
  assert.match(home, /四項評分/);
  assert.match(home, /role="dialog"/);
  assert.match(home, /我已閱讀並同意以上提醒/);
  assert.match(home, /disabled=\{!agreed\}/);
  assert.match(home, /router\.push\(`\/\$\{entry\}`\)/);
  assert.doesNotMatch(home, /RentalExplorer/);
});

test('rental map remains available on its dedicated route', () => {
  assert.match(rentalsPage, /RentalExplorer/);
});
