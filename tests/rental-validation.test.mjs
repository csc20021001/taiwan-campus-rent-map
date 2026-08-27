import assert from 'node:assert/strict';
import test from 'node:test';
import { validateRentalLocation, validateRentalReport } from '../app/api/rentals/validation.mjs';
import { validateRentalComment } from '../app/api/rentals/comments-validation.mjs';

test('accepts a valid rental location in Taiwan', () => {
  const result = validateRentalLocation({
    universityId: 'niu', address: '宜蘭縣宜蘭市神農路二段127號', latitude: 24.7514, longitude: 121.751,
  });
  assert.equal(result.ok, true);
});

test('rejects incomplete addresses and coordinates outside Taiwan', () => {
  assert.equal(validateRentalLocation({ universityId: 'niu', address: '宜蘭', latitude: 24.7, longitude: 121.7 }).ok, false);
  assert.equal(validateRentalLocation({ universityId: 'niu', address: '宜蘭縣宜蘭市神農路二段127號', latitude: 40, longitude: 121.7 }).ok, false);
});

test('rental reports enforce integer limits and a 1-5 rating', () => {
  assert.equal(validateRentalReport({ monthlyRent: 8500, overallRating: 4 }).ok, true);
  assert.equal(validateRentalReport({ monthlyRent: 1, overallRating: 4 }).ok, false);
  assert.equal(validateRentalReport({ monthlyRent: 500000, overallRating: 4 }).ok, false);
  assert.equal(validateRentalReport({ monthlyRent: 8500.5, overallRating: 4 }).ok, false);
  assert.equal(validateRentalReport({ monthlyRent: 8500, overallRating: 6 }).ok, false);
});

test('rental comments trim public text and enforce safe length limits', () => {
  assert.deepEqual(validateRentalComment({ content: '  採光很好，晚上安靜。  ' }), {
    ok: true,
    value: { content: '採光很好，晚上安靜。' },
  });
  assert.equal(validateRentalComment({ content: '太短' }).ok, false);
  assert.equal(validateRentalComment({ content: '字'.repeat(501) }).ok, false);
});
