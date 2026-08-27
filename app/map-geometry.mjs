const TAIWAN_LIMITS = Object.freeze({ south: 21.8, north: 25.5, west: 119.3, east: 122.1 });

/** Return a persisted geographic point without any relative or random offset. */
export function absoluteLngLat(latitude, longitude) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new TypeError('Latitude and longitude must be finite numbers.');
  }
  if (latitude < TAIWAN_LIMITS.south || latitude > TAIWAN_LIMITS.north
    || longitude < TAIWAN_LIMITS.west || longitude > TAIWAN_LIMITS.east) {
    throw new RangeError('Coordinates must be within Taiwan.');
  }
  return [longitude, latitude];
}

export function boundsForLocations(campus, locations) {
  const points = [absoluteLngLat(campus.latitude, campus.longitude)];
  for (const location of locations) {
    if (location.latitude === null || location.longitude === null) continue;
    points.push(absoluteLngLat(location.latitude, location.longitude));
  }
  const longitudes = points.map(([longitude]) => longitude);
  const latitudes = points.map(([, latitude]) => latitude);
  return [
    [Math.min(...longitudes), Math.min(...latitudes)],
    [Math.max(...longitudes), Math.max(...latitudes)],
  ];
}
