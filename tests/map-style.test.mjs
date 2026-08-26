import assert from 'node:assert/strict';
import test from 'node:test';
import { createCampusMapStyle } from '../app/campus-map-style.mjs';

test('campus map uses a PMTiles vector source', () => {
  const style = createCampusMapStyle('https://example.com/taiwan.pmtiles');
  assert.equal(style.sources.protomaps.type, 'vector');
  assert.equal(style.sources.protomaps.url, 'pmtiles://https://example.com/taiwan.pmtiles');
});

test('campus map contains no place, POI, or symbol layers', () => {
  const style = createCampusMapStyle('pmtiles://https://example.com/taiwan.pmtiles');
  assert.equal(style.sources.protomaps.url, 'pmtiles://https://example.com/taiwan.pmtiles');
  assert.equal(style.layers.some((layer) => layer.type === 'symbol'), false);
  assert.equal(style.layers.some((layer) => ['places', 'pois'].includes(layer['source-layer'])), false);
});
