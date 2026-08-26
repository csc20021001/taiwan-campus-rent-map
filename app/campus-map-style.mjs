export const DEFAULT_PMTILES_URL = 'https://data.source.coop/protomaps/openstreetmap/v4.pmtiles';

function protocolUrl(url) {
  return url.startsWith('pmtiles://') ? url : `pmtiles://${url}`;
}

/**
 * Deliberately quiet campus cartography: no place labels, business POIs,
 * attractions, transit labels, or other symbol layers are included.
 */
export function createCampusMapStyle(pmtilesUrl) {
  return /** @type {import('maplibre-gl').StyleSpecification} */ ({
    version: 8,
    name: '校邊極簡校園底圖',
    sources: {
      protomaps: {
        type: 'vector',
        url: protocolUrl(pmtilesUrl),
        attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a> · <a href="https://protomaps.com" target="_blank">Protomaps</a>',
      },
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#e8eee9' } },
      {
        id: 'earth',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'earth',
        paint: { 'fill-color': '#f7f6ef' },
      },
      {
        id: 'green-space',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'landuse',
        filter: ['match', ['get', 'kind'], ['park', 'grass', 'forest', 'wood', 'school', 'pedestrian'], true, false],
        paint: { 'fill-color': '#dce9dc', 'fill-opacity': 0.72 },
      },
      {
        id: 'water',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'water',
        paint: { 'fill-color': '#c9e3e5' },
      },
      {
        id: 'buildings',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'buildings',
        minzoom: 14,
        paint: {
          'fill-color': '#deded8',
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0.35, 16, 0.72],
          'fill-outline-color': '#d2d4cf',
        },
      },
      {
        id: 'major-road-casing',
        type: 'line',
        source: 'protomaps',
        'source-layer': 'roads',
        filter: ['match', ['get', 'kind'], ['highway', 'major_road', 'medium_road'], true, false],
        paint: {
          'line-color': '#d9d8d0',
          'line-width': ['interpolate', ['linear'], ['zoom'], 11, 2, 15, 8, 18, 15],
        },
      },
      {
        id: 'major-roads',
        type: 'line',
        source: 'protomaps',
        'source-layer': 'roads',
        filter: ['match', ['get', 'kind'], ['highway', 'major_road', 'medium_road'], true, false],
        paint: {
          'line-color': '#fffdf8',
          'line-width': ['interpolate', ['linear'], ['zoom'], 11, 1, 15, 5.5, 18, 11],
        },
      },
      {
        id: 'local-roads',
        type: 'line',
        source: 'protomaps',
        'source-layer': 'roads',
        minzoom: 14,
        filter: ['match', ['get', 'kind'], ['minor_road', 'other'], true, false],
        paint: {
          'line-color': '#ffffff',
          'line-width': ['interpolate', ['linear'], ['zoom'], 14, 0.8, 18, 5],
        },
      },
    ],
  });
}
