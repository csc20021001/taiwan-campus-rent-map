import assert from 'node:assert/strict';
import test from 'node:test';
import { createCampusMapStyle, DEFAULT_VECTOR_TILE_URL } from '../app/campus-map-style.mjs';

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
