export const DEFAULT_VECTOR_TILE_URL = 'https://tiles.openfreemap.org/planet';

/**
 * Deliberately quiet campus cartography: the source contains OpenStreetMap data,
 * while this style renders only land, water, buildings and roads. It has no
 * place labels, business POIs, attractions, transit labels or symbol layers.
 */
export function createCampusMapStyle(vectorTileUrl = DEFAULT_VECTOR_TILE_URL) {
  return /** @type {import('maplibre-gl').StyleSpecification} */ ({
    version: 8,
    name: 'WZUNAA 極簡校園底圖',
    sources: {
      openmaptiles: {
        type: 'vector',
        url: vectorTileUrl,
        attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a> · <a href="https://openfreemap.org" target="_blank">OpenFreeMap</a>',
      },
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#f3f2eb' } },
      {
        id: 'residential-land', type: 'fill', source: 'openmaptiles', 'source-layer': 'landuse',
        filter: ['match', ['get', 'class'], ['residential', 'suburb'], true, false],
        paint: { 'fill-color': '#eeeee7', 'fill-opacity': 0.72 },
      },
      {
        id: 'parks', type: 'fill', source: 'openmaptiles', 'source-layer': 'park',
        paint: { 'fill-color': '#dce9dc', 'fill-opacity': 0.82 },
      },
      {
        id: 'water', type: 'fill', source: 'openmaptiles', 'source-layer': 'water',
        paint: { 'fill-color': '#c9e3e5' },
      },
      {
        id: 'waterways', type: 'line', source: 'openmaptiles', 'source-layer': 'waterway',
        paint: { 'line-color': '#b8d9de', 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 0.5, 17, 2.5] },
      },
      {
        id: 'buildings', type: 'fill', source: 'openmaptiles', 'source-layer': 'building', minzoom: 13,
        paint: {
          'fill-color': '#d9d9d2',
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0.25, 16, 0.76],
          'fill-outline-color': '#cbcec8',
        },
      },
      {
        id: 'major-road-casing', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation',
        filter: ['match', ['get', 'class'], ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'], true, false],
        paint: {
          'line-color': '#d7d6cf',
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 15, 8, 18, 15],
        },
      },
      {
        id: 'major-roads', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation',
        filter: ['match', ['get', 'class'], ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'], true, false],
        paint: {
          'line-color': '#fffdf8',
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 15, 5.5, 18, 11],
        },
      },
      {
        id: 'local-roads', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation', minzoom: 13,
        filter: ['match', ['get', 'class'], ['minor', 'service', 'track', 'path'], true, false],
        paint: {
          'line-color': '#ffffff',
          'line-width': ['interpolate', ['linear'], ['zoom'], 13, 0.65, 18, 5],
        },
      },
    ],
  });
}
