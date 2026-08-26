import assert from 'node:assert/strict';
import test from 'node:test';
import { validateListing } from '../app/api/listings/validation.mjs';

const valid = {
  universityId: 'ntu',
  title: '正式刊登的學生套房',
  address: '臺北市大安區測試路一段10號',
  description: '採光良好並附有獨立衛浴，歡迎預約看房。',
  monthlyRent: 12000,
  roomType: '獨立套房',
  areaPing: 7.5,
  walkMinutes: 8,
  latitude: 25.018,
  longitude: 121.54,
  highlights: ['可開伙', '垃圾代收'],
  contactMethod: 'LINE',
  contactValue: 'campus-nest-owner',
};

test('accepts a valid Taiwan rental listing', () => {
  const result = validateListing(valid);
  assert.equal(result.ok, true);
  assert.deepEqual(result.ok && result.value.highlights, ['可開伙', '垃圾代收']);
});

test('rejects invalid price, room type, and coordinates', () => {
  assert.equal(validateListing({ ...valid, monthlyRent: 999 }).ok, false);
  assert.equal(validateListing({ ...valid, roomType: '豪宅' }).ok, false);
  assert.equal(validateListing({ ...valid, latitude: 40 }).ok, false);
});

test('deduplicates highlights and enforces contact details', () => {
  const result = validateListing({ ...valid, highlights: ['可開伙', '可開伙'] });
  assert.equal(result.ok, true);
  assert.deepEqual(result.ok && result.value.highlights, ['可開伙']);
  assert.equal(validateListing({ ...valid, contactMethod: 'Instagram' }).ok, false);
});
