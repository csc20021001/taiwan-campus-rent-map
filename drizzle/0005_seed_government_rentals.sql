INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-033ff1ba498d8bfd', 'ntu', '臺北市大安區和平東路二段96巷51號',
  '臺北市大安區和平東路二段96巷51號', 25.0232323, 121.5410608,
  'government', 19500, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ntu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺北市大安區和平東路二段96巷51號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-777042bc1d0ad716', 'ntu', '臺北市大安區辛亥路二段109號',
  '臺北市大安區辛亥路二段109號', 25.0213291, 121.5433534,
  'government', 32000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ntu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺北市大安區辛亥路二段109號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-cd0adae4f88dbc94', 'ntu', '臺北市大安區和平東路二段76巷23弄8號',
  '臺北市大安區和平東路二段76巷23弄8號', 25.0226511, 121.5398877,
  'government', 30000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ntu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺北市大安區和平東路二段76巷23弄8號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-95f4d148a181c315', 'ntu', '臺北市大安區辛亥路二段171巷9號',
  '臺北市大安區辛亥路二段171巷9號', 25.0224401, 121.5410903,
  'government', 55000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ntu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺北市大安區辛亥路二段171巷9號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-6571d877e4287467', 'ntu', '臺北市大安區和平東路二段118巷54弄16號',
  '臺北市大安區和平東路二段118巷54弄16號', 25.0220113, 121.5419551,
  'government', 30000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ntu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺北市大安區和平東路二段118巷54弄16號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-a8d60303f3213b86', 'nthu', '新竹市公道五路二段425之5號',
  '新竹市公道五路二段425之5號', 24.7960627, 121.0117186,
  'government', 40000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'nthu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '新竹市公道五路二段425之5號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'nycu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '新竹市公道五路二段425之5號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-c7b7e611166571ad', 'nthu', '新竹市公道五路二段313號',
  '新竹市公道五路二段313號', 24.7960627, 121.0117186,
  'government', 50000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'nthu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '新竹市公道五路二段313號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'nycu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '新竹市公道五路二段313號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-73897ec18b99bfda', 'nthu', '新竹市公道五路二段293號',
  '新竹市公道五路二段293號', 24.7960627, 121.0117186,
  'government', 34056, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'nthu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '新竹市公道五路二段293號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-7102d3f9d9b0a585', 'nthu', '新竹市公道五路二段299號',
  '新竹市公道五路二段299號', 24.7960627, 121.0117186,
  'government', 61231, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'nthu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '新竹市公道五路二段299號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-dad833018ee757c6', 'nthu', '新竹市世傑路288號',
  '新竹市世傑路288號', 24.7919624, 121.0096343,
  'government', 74706, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'nthu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '新竹市世傑路288號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'nycu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '新竹市世傑路288號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-9fd0e61a542be679', 'nycu', '新竹市世傑路72號',
  '新竹市世傑路72號', 24.7919624, 121.0096343,
  'government', 32500, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'nycu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '新竹市世傑路72號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-39cd84e979219bcd', 'nycu', '新竹市世傑路116號',
  '新竹市世傑路116號', 24.7919624, 121.0096343,
  'government', 25000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'nycu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '新竹市世傑路116號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-c968e9f50b264364', 'ncku', '臺南市東區東門路一段61號之9',
  '臺南市東區東門路一段61號之9', 22.9867164, 120.2177839,
  'government', 6000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ncku', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺南市東區東門路一段61號之9'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-b1951bbeab44b3a5', 'ncku', '臺南市東區勝利路115號七樓之2',
  '臺南市東區勝利路115號七樓之2', 22.9951192, 120.2181162,
  'government', 8500, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ncku', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺南市東區勝利路115號七樓之2'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-2bb9feed968d5512', 'ncku', '臺南市東區東門路一段298號八樓之2',
  '臺南市東區東門路一段298號八樓之2', 22.9867164, 120.2177839,
  'government', 17000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ncku', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺南市東區東門路一段298號八樓之2'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-9b86d12b74857526', 'ncku', '臺南市東區勝利路50號七樓',
  '臺南市東區勝利路50號七樓', 22.9951192, 120.2181162,
  'government', 7000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ncku', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺南市東區勝利路50號七樓'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-fd68fbb636d82ff7', 'ncku', '臺南市東區東寧路西段23號七樓之2',
  '臺南市東區東寧路西段23號七樓之2', 22.9930555, 120.2139594,
  'government', 10000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ncku', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺南市東區東寧路西段23號七樓之2'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-b79e9cd7b4080a37', 'ncu', '桃園市中壢區51號',
  '桃園市中壢區51號', NULL, NULL,
  'government', 18000, 'government', NULL,
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ncu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '桃園市中壢區51號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-4e6f4894946dbca3', 'ncu', '桃園市中壢區61號',
  '桃園市中壢區61號', NULL, NULL,
  'government', 12000, 'government', NULL,
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ncu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '桃園市中壢區61號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-52d753c11e29a4b4', 'ncu', '桃園市中壢區101號',
  '桃園市中壢區101號', NULL, NULL,
  'government', 26000, 'government', NULL,
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ncu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '桃園市中壢區101號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-99b4c3540807fd47', 'ncu', '桃園市中壢區113號',
  '桃園市中壢區113號', NULL, NULL,
  'government', 15000, 'government', NULL,
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ncu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '桃園市中壢區113號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-d2c0d81e5137634c', 'ncu', '桃園市中壢區大享街468號',
  '桃園市中壢區大享街468號', 24.9735451, 121.1929104,
  'government', 17000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ncu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '桃園市中壢區大享街468號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-006773df92ee9d96', 'nchu', '臺中市南區學府路3號',
  '臺中市南區學府路3號', 24.1288776, 120.6741113,
  'government', 14000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'nchu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺中市南區學府路3號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-3211a8774b5f7dda', 'nchu', '臺中市南區興大路200號',
  '臺中市南區興大路200號', 24.1239979, 120.6729573,
  'government', 17000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'nchu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺中市南區興大路200號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-02d4f09e64b87a43', 'nchu', '臺中市南區學府路21號',
  '臺中市南區學府路21號', 24.1288776, 120.6741113,
  'government', 8300, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'nchu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺中市南區學府路21號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-fc56fb1af29ba02f', 'nchu', '臺中市南區復新街55號',
  '臺中市南區復新街55號', 24.1246948, 120.6756745,
  'government', 6000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'nchu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺中市南區復新街55號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-df4b078163d5c25c', 'nchu', '臺中市南區永東街42號',
  '臺中市南區永東街42號', 24.1245014, 120.6726337,
  'government', 11400, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'nchu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺中市南區永東街42號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-8bc9393d0e77f40e', 'nsysu', '高雄市鼓山區濱海一路88巷16號',
  '高雄市鼓山區濱海一路88巷16號', 22.6203435, 120.2707284,
  'government', NULL, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'nsysu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '高雄市鼓山區濱海一路88巷16號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-fe4b096efbdf14df', 'nsysu', '高雄市鼓山區濱海一路88巷26號',
  '高雄市鼓山區濱海一路88巷26號', 22.6203435, 120.2707284,
  'government', NULL, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'nsysu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '高雄市鼓山區濱海一路88巷26號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-190f966b819ecd0b', 'nsysu', '高雄市鼓山區濱海一路88巷28號',
  '高雄市鼓山區濱海一路88巷28號', 22.6203435, 120.2707284,
  'government', NULL, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'nsysu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '高雄市鼓山區濱海一路88巷28號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-d3766154e172ebc8', 'nsysu', '高雄市鼓山區濱海一路88巷22號',
  '高雄市鼓山區濱海一路88巷22號', 22.6203435, 120.2707284,
  'government', NULL, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'nsysu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '高雄市鼓山區濱海一路88巷22號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-f6b691648fc0267d', 'nsysu', '高雄市鼓山區濱海一路88巷20號',
  '高雄市鼓山區濱海一路88巷20號', 22.6203435, 120.2707284,
  'government', NULL, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'nsysu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '高雄市鼓山區濱海一路88巷20號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-3569c94826a5eafb', 'ccu', '嘉義縣民雄鄉三興路119號',
  '嘉義縣民雄鄉三興路119號', NULL, NULL,
  'government', 3200, 'government', NULL,
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ccu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '嘉義縣民雄鄉三興路119號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-f83a732106e30fa0', 'ccu', '嘉義縣民雄鄉鴨母坔61之71號五樓五',
  '嘉義縣民雄鄉鴨母坔61之71號五樓五', 23.5319532, 120.4347818,
  'government', 4000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ccu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '嘉義縣民雄鄉鴨母坔61之71號五樓五'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-264f3ac40989a580', 'ccu', '嘉義縣民雄鄉鎮北村圳溝墘21號三樓之14',
  '嘉義縣民雄鄉鎮北村圳溝墘21號三樓之14', 23.571561, 120.448288,
  'government', 4700, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ccu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '嘉義縣民雄鄉鎮北村圳溝墘21號三樓之14'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-221e3373cda29b1b', 'ccu', '嘉義縣民雄鄉鎮北村圳溝墘20號二樓之一',
  '嘉義縣民雄鄉鎮北村圳溝墘20號二樓之一', 23.571561, 120.448288,
  'government', 5000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ccu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '嘉義縣民雄鄉鎮北村圳溝墘20號二樓之一'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-ee599ba0dd231ae1', 'ccu', '嘉義縣民雄鄉鎮北村圳溝墘19號四樓之三',
  '嘉義縣民雄鄉鎮北村圳溝墘19號四樓之三', 23.571561, 120.448288,
  'government', 4300, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ccu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '嘉義縣民雄鄉鎮北村圳溝墘19號四樓之三'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-a11814c967cc43bd', 'ntust', '臺北市大安區羅斯福路四段119巷38號',
  '臺北市大安區羅斯福路四段119巷38號', 25.0112287, 121.5376979,
  'government', 23000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ntust', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺北市大安區羅斯福路四段119巷38號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-ff27001d5d0b5443', 'ntust', '臺北市中正區羅斯福路四段162號',
  '臺北市中正區羅斯福路四段162號', 25.0121146, 121.5365269,
  'government', 18500, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ntust', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺北市中正區羅斯福路四段162號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-73fbabc950d74cd3', 'ntust', '臺北市文山區羅斯福路四段210號',
  '臺北市文山區羅斯福路四段210號', 25.0103997, 121.5371773,
  'government', 19000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ntust', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺北市文山區羅斯福路四段210號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-8c0a5e1877fc1cff', 'ntust', '臺北市文山區羅斯福路四段202號',
  '臺北市文山區羅斯福路四段202號', 25.0103997, 121.5371773,
  'government', 30483, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ntust', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺北市文山區羅斯福路四段202號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-702ad5ab5175f77e', 'ntust', '臺北市文山區羅斯福路四段200號',
  '臺北市文山區羅斯福路四段200號', 25.0103997, 121.5371773,
  'government', 18000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ntust', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺北市文山區羅斯福路四段200號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-053762df951e69f8', 'ntut', '臺北市大安區忠孝東路三段52號',
  '臺北市大安區忠孝東路三段52號', 25.0419275, 121.5360576,
  'government', 47550, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ntut', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺北市大安區忠孝東路三段52號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-6512b0c9eb183f74', 'ntut', '臺北市大安區忠孝東路三段54號',
  '臺北市大安區忠孝東路三段54號', 25.0419275, 121.5360576,
  'government', 45000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ntut', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺北市大安區忠孝東路三段54號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-8994b2e45ba4b4a7', 'ntut', '臺北市大安區忠孝東路三段88號',
  '臺北市大安區忠孝東路三段88號', 25.0419275, 121.5360576,
  'government', 35000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ntut', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺北市大安區忠孝東路三段88號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-48289558b38d8464', 'ntut', '臺北市大安區新生南路一段97巷3號',
  '臺北市大安區新生南路一段97巷3號', 25.0411399, 121.5350061,
  'government', 151000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ntut', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺北市大安區新生南路一段97巷3號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-a3d67ea316c71d98', 'ntut', '臺北市大安區建國南路一段42號',
  '臺北市大安區建國南路一段42號', 25.0432799, 121.5363961,
  'government', 30000, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'ntut', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '臺北市大安區建國南路一段42號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-45eb52bbba9644a0', 'niu', '宜蘭縣宜蘭市神農路二段127號',
  '宜蘭縣宜蘭市神農路二段127號', 24.7514864, 121.7509979,
  'government', NULL, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'niu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '宜蘭縣宜蘭市神農路二段127號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-40e46090723eb129', 'niu', '宜蘭縣宜蘭市神農路二段125號',
  '宜蘭縣宜蘭市神農路二段125號', 24.7514864, 121.7509979,
  'government', NULL, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'niu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '宜蘭縣宜蘭市神農路二段125號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-9092f9670229e108', 'niu', '宜蘭縣宜蘭市神農路二段57巷23號',
  '宜蘭縣宜蘭市神農路二段57巷23號', 24.7521128, 121.7504278,
  'government', NULL, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'niu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '宜蘭縣宜蘭市神農路二段57巷23號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-d7b13d4e2f205595', 'niu', '宜蘭縣宜蘭市神農路二段50號',
  '宜蘭縣宜蘭市神農路二段50號', 24.7514864, 121.7509979,
  'government', NULL, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'niu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '宜蘭縣宜蘭市神農路二段50號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'gov-8036b3e4085b4f7a', 'niu', '宜蘭縣宜蘭市復興路一段74之2號',
  '宜蘭縣宜蘭市復興路一段74之2號', 24.7488613, 121.7514521,
  'government', NULL, 'government', 'nominatim',
  0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, 'niu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '宜蘭縣宜蘭市復興路一段74之2號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'admin-niu-yizhong-82', 'niu', '260 宜蘭縣宜蘭市思源里宜中路82號',
  '260宜蘭縣宜蘭市思源里宜中路82號', 24.74692, 121.74265, 'admin',
  NULL, NULL, 'admin', 0, NULL, '2026-08-26T00:00:00.000Z', '2026-08-26T00:00:00.000Z'
) ON CONFLICT(normalized_address) DO NOTHING;
--> statement-breakpoint
INSERT INTO rental_location_universities (rental_location_id, university_id, created_at)
SELECT id, 'niu', '2026-08-26T00:00:00.000Z' FROM rental_locations
WHERE normalized_address = '260宜蘭縣宜蘭市思源里宜中路82號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;
--> statement-breakpoint
PRAGMA optimize;
