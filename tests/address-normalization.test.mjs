import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeAddress } from '../db/normalization.mjs';

test('normalizes whitespace, 台/臺, punctuation, and dash variants', () => {
  assert.equal(normalizeAddress('宜蘭縣 宜蘭市 神農路二段 127 號'), '宜蘭縣宜蘭市神農路二段127號');
  assert.equal(normalizeAddress('台北市，大安區－和平東路'), '臺北市大安區之和平東路');
  assert.equal(normalizeAddress('ＡＢＣ １２３'), 'ABC123');
});

test('the same Taiwan address produces the same normalized key', () => {
  const compact = normalizeAddress('宜蘭縣宜蘭市神農路二段127號');
  const spaced = normalizeAddress('宜蘭縣 宜蘭市 神農路二段 127 號');
  assert.equal(compact, spaced);
});
