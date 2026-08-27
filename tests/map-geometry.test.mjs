import assert from 'node:assert/strict';
import test from 'node:test';
import { absoluteLngLat, boundsForLocations } from '../app/map-geometry.mjs';

test('absolute coordinates round-trip exactly without relative offsets', () => {
  assert.deepEqual(absoluteLngLat(24.79592, 121.01030), [121.01030, 24.79592]);
  assert.deepEqual(absoluteLngLat(22.62048, 120.27085), [120.27085, 22.62048]);
});

test('bounds contain the campus and every persisted rental coordinate', () => {
  const bounds = boundsForLocations(
    { latitude: 24.796, longitude: 121.0 },
    [
      { latitude: 24.79, longitude: 120.99 },
      { latitude: 24.81, longitude: 121.02 },
      { latitude: null, longitude: null },
    ],
  );
  assert.deepEqual(bounds, [[120.99, 24.79], [121.02, 24.81]]);
});

test('invalid or off-Taiwan coordinates are rejected instead of repositioned', () => {
  assert.throws(() => absoluteLngLat(Number.NaN, 121), /finite/);
  assert.throws(() => absoluteLngLat(35, 139), /Taiwan/);
});
