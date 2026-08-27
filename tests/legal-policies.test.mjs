import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const terms = readFileSync(new URL('../app/terms/page.tsx', import.meta.url), 'utf8');
const privacy = readFileSync(new URL('../app/privacy/page.tsx', import.meta.url), 'utf8');

test('terms describe service boundaries and user-generated-content risks', () => {
  assert.match(terms, /不是出租人、承租人、不動產經紀業、租賃住宅服務業/);
  assert.match(terms, /租屋交易與防詐提醒/);
  assert.match(terms, /禁止內容與行為/);
  assert.match(terms, /著作權通知與下架/);
  assert.match(terms, /三次涉有著作權侵害情事/);
  assert.match(terms, /外部連結、廣告與第三方服務/);
  assert.match(terms, /故意或重大過失/);
  assert.match(terms, /依法享有且不得拋棄的權利/);
});

test('privacy policy includes the statutory collection notice fields', () => {
  assert.match(privacy, /個資蒐集者與聯絡方式/);
  assert.match(privacy, /蒐集目的/);
  assert.match(privacy, /利用期間、地區、對象與方式/);
  assert.match(privacy, /是否必須提供資料及不提供的影響/);
  assert.match(privacy, /查詢或閱覽、製給複製本、補充或更正、停止蒐集處理或利用，以及刪除/);
  assert.match(privacy, /境外處理/);
});
