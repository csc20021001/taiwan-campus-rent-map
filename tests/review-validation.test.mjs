import assert from 'node:assert/strict';
import test from 'node:test';
import { validateReview } from '../app/api/reviews/validation.mjs';

test('accepts and trims a valid review', () => {
  const result = validateReview({ listingId: 'ntu-01', authorName: ' 小明 ', rating: 5, content: ' 採光很好，房東回覆快速。 ' });
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, { listingId: 'ntu-01', authorName: '小明', rating: 5, content: '採光很好，房東回覆快速。' });
});

test('rejects ratings outside one to five', () => {
  assert.equal(validateReview({ listingId: 'ntu-01', authorName: '小明', rating: 0, content: '這是有效長度留言' }).ok, false);
  assert.equal(validateReview({ listingId: 'ntu-01', authorName: '小明', rating: 6, content: '這是有效長度留言' }).ok, false);
});

test('rejects malformed ids and oversized fields', () => {
  assert.equal(validateReview({ listingId: '../bad', authorName: '小明', rating: 4, content: '這是有效長度留言' }).ok, false);
  assert.equal(validateReview({ listingId: 'ntu-01', authorName: '名'.repeat(25), rating: 4, content: '這是有效長度留言' }).ok, false);
  assert.equal(validateReview({ listingId: 'ntu-01', authorName: '小明', rating: 4, content: '字'.repeat(301) }).ok, false);
});

test('rejects comments shorter than four characters', () => {
  const result = validateReview({ listingId: 'ntu-01', authorName: '小明', rating: 4, content: '太短' });
  assert.equal(result.ok, false);
  assert.match(result.error, /4–300/);
});
