import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createCampusMapStyle, DEFAULT_VECTOR_TILE_URL } from '../app/campus-map-style.mjs';

const rentalExplorer = readFileSync(new URL('../app/rental-explorer.tsx', import.meta.url), 'utf8');
const globalStyles = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

test('campus map uses the hosted OpenFreeMap vector source', () => {
  const style = createCampusMapStyle();
  assert.equal(style.sources.openmaptiles.type, 'vector');
  assert.equal(style.sources.openmaptiles.url, DEFAULT_VECTOR_TILE_URL);
});

test('campus map contains no place, POI, or symbol layers', () => {
  const style = createCampusMapStyle('https://tiles.example.com/planet.json');
  assert.equal(style.sources.openmaptiles.url, 'https://tiles.example.com/planet.json');
  assert.equal(style.layers.some((layer) => layer.type === 'symbol'), false);
  assert.equal(style.layers.some((layer) => ['place', 'poi', 'pois'].includes(layer['source-layer'])), false);
  assert.equal(style.layers.some((layer) => layer['source-layer'] === 'building'), true);
  assert.equal(style.layers.some((layer) => layer['source-layer'] === 'transportation'), true);
});

test('production map explicitly bundles and configures the MapLibre worker', () => {
  assert.match(rentalExplorer, /maplibre-gl-worker\.mjs\?worker&url/);
  assert.match(rentalExplorer, /setWorkerUrl\(workerModule\.default\)/);
});

test('map markers use exact subpixel positioning and source-only copy stays hidden', () => {
  assert.equal((rentalExplorer.match(/subpixelPositioning: true/g) ?? []).length, 3);
  assert.doesNotMatch(rentalExplorer, /住過的人回報/);
  assert.doesNotMatch(rentalExplorer, /政府歷史租賃參考/);
  assert.doesNotMatch(rentalExplorer, /這筆資料已納入上方平均租金/);
});

test('selected rental marker styling never overwrites MapLibre positioning', () => {
  const selectedRule = globalStyles.match(/\.rent-marker\.is-selected\s*\{([^}]*)\}/)?.[1] ?? '';
  assert.ok(selectedRule.length > 0);
  assert.doesNotMatch(selectedRule, /(?:^|;)\s*transform\s*:/);
});
