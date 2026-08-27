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
  assert.match(home, /我已閱讀、理解並同意以上聲明/);
  assert.match(home, /disabled=\{!agreed\}/);
  assert.match(home, /router\.push\(`\/\$\{entry\}`\)/);
  assert.doesNotMatch(home, /RentalExplorer/);
});

test('entry disclaimers cover the material rental and course risks', () => {
  assert.match(home, /資料與地圖限制/);
  assert.match(home, /交易與人身安全/);
  assert.match(home, /刊登與公開評論/);
  assert.match(home, /課程資料限制/);
  assert.match(home, /評分與發言責任/);
  assert.match(home, /非校方立場/);
  assert.match(home, /依法不得預先免除或限制的責任/);
  assert.match(home, /href="\/terms"/);
  assert.match(home, /href="\/privacy"/);
});

test('rental map remains available on its dedicated route', () => {
  assert.match(rentalsPage, /RentalExplorer/);
});
