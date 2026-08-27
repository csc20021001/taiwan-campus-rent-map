import { getD1 } from './index';
import { normalizeAddress } from './normalization.mjs';

export type RentalLocationView = {
  id: string;
  universityId: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  source: 'government' | 'user' | 'admin';
  referenceRent: number | null;
  referenceRentSource: string | null;
  coordinateSource: string | null;
  coordinatesVerified: boolean;
  averageRent: number | null;
  medianRent: number | null;
  priceSourceCount: number;
  rentReportCount: number;
  averageRating: number | null;
  ratingCount: number;
};

type RentalRow = {
  id: string;
  university_id: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  source: 'government' | 'user' | 'admin';
  reference_rent: number | null;
  reference_rent_source: string | null;
  coordinate_source: string | null;
  coordinates_verified: number;
  average_rent: number | null;
  price_source_count: number;
  rent_report_count: number;
  average_rating: number | null;
  rating_count: number;
};

function mapRental(row: RentalRow, medianRent: number | null): RentalLocationView {
  return {
    id: row.id,
    universityId: row.university_id,
    address: row.address,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    source: row.source,
    referenceRent: row.reference_rent === null ? null : Number(row.reference_rent),
    referenceRentSource: row.reference_rent_source,
    coordinateSource: row.coordinate_source,
    coordinatesVerified: Boolean(row.coordinates_verified),
    averageRent: row.average_rent === null ? null : Number(row.average_rent),
    medianRent,
    priceSourceCount: Number(row.price_source_count),
    rentReportCount: Number(row.rent_report_count),
    averageRating: row.average_rating === null ? null : Number(row.average_rating),
    ratingCount: Number(row.rating_count),
  };
}

export async function listRentalLocations(options: {
  universityId: string;
  north?: number;
  south?: number;
  east?: number;
  west?: number;
}) {
  const conditions = ['lu.university_id = ?'];
  const values: Array<string | number> = [options.universityId];
  if ([options.north, options.south, options.east, options.west].every((value) => value !== undefined)) {
    conditions.push('l.latitude BETWEEN ? AND ?', 'l.longitude BETWEEN ? AND ?');
    values.push(options.south!, options.north!, options.west!, options.east!);
  }

  const rows = await getD1().prepare(`
    SELECT
      l.id, lu.university_id, l.address, l.latitude, l.longitude, l.source,
      l.reference_rent, l.reference_rent_source, l.coordinate_source,
      l.coordinates_verified,
      ROUND(
        (COALESCE(SUM(CASE WHEN r.is_valid = 1 AND r.is_outlier = 0 THEN r.monthly_rent END), 0)
          + COALESCE(l.reference_rent, 0)) * 1.0 /
        NULLIF(COUNT(CASE WHEN r.is_valid = 1 AND r.is_outlier = 0 THEN 1 END)
          + CASE WHEN l.reference_rent IS NULL THEN 0 ELSE 1 END, 0),
        0
      ) AS average_rent,
      COUNT(CASE WHEN r.is_valid = 1 AND r.is_outlier = 0 THEN 1 END)
        + CASE WHEN l.reference_rent IS NULL THEN 0 ELSE 1 END AS price_source_count,
      COUNT(CASE WHEN r.is_valid = 1 AND r.is_outlier = 0 THEN 1 END) AS rent_report_count,
      ROUND(AVG(CASE WHEN r.is_valid = 1 AND r.is_outlier = 0 THEN r.overall_rating END), 1) AS average_rating,
      COUNT(CASE WHEN r.is_valid = 1 AND r.is_outlier = 0 THEN 1 END) AS rating_count
    FROM rental_locations l
    JOIN rental_location_universities lu ON lu.rental_location_id = l.id
    LEFT JOIN rental_reports r ON r.rental_location_id = l.id
    WHERE ${conditions.join(' AND ')}
    GROUP BY l.id, lu.university_id
    ORDER BY CASE l.source WHEN 'user' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END,
      l.created_at DESC, price_source_count DESC, l.reference_rent IS NULL, average_rent ASC, l.address ASC
    LIMIT 250
  `).bind(...values).all<RentalRow>();

  return rows.results.map((row) => mapRental(row, null));
}

export async function getRentalLocation(id: string): Promise<RentalLocationView | null> {
  const [rowResult, medianResult] = await getD1().batch([
    getD1().prepare(`
      SELECT
        l.id, l.university_id, l.address, l.latitude, l.longitude, l.source,
        l.reference_rent, l.reference_rent_source, l.coordinate_source,
        l.coordinates_verified,
        ROUND(
          (COALESCE(SUM(CASE WHEN r.is_valid = 1 AND r.is_outlier = 0 THEN r.monthly_rent END), 0)
            + COALESCE(l.reference_rent, 0)) * 1.0 /
          NULLIF(COUNT(CASE WHEN r.is_valid = 1 AND r.is_outlier = 0 THEN 1 END)
            + CASE WHEN l.reference_rent IS NULL THEN 0 ELSE 1 END, 0),
          0
        ) AS average_rent,
        COUNT(CASE WHEN r.is_valid = 1 AND r.is_outlier = 0 THEN 1 END)
          + CASE WHEN l.reference_rent IS NULL THEN 0 ELSE 1 END AS price_source_count,
        COUNT(CASE WHEN r.is_valid = 1 AND r.is_outlier = 0 THEN 1 END) AS rent_report_count,
        ROUND(AVG(CASE WHEN r.is_valid = 1 AND r.is_outlier = 0 THEN r.overall_rating END), 1) AS average_rating,
        COUNT(CASE WHEN r.is_valid = 1 AND r.is_outlier = 0 THEN 1 END) AS rating_count
      FROM rental_locations l
      LEFT JOIN rental_reports r ON r.rental_location_id = l.id
      WHERE l.id = ?
      GROUP BY l.id
    `).bind(id),
    getD1().prepare(`WITH price_values AS (
      SELECT reference_rent AS monthly_rent
      FROM rental_locations
      WHERE id = ? AND reference_rent IS NOT NULL
      UNION ALL
      SELECT monthly_rent
      FROM rental_reports
      WHERE rental_location_id = ? AND is_valid = 1 AND is_outlier = 0
    ), ranked AS (
      SELECT monthly_rent, ROW_NUMBER() OVER (ORDER BY monthly_rent) AS row_number,
        COUNT(*) OVER () AS total
      FROM price_values
    )
    SELECT ROUND(AVG(monthly_rent), 0) AS median_rent
    FROM ranked
    WHERE row_number IN ((total + 1) / 2, (total + 2) / 2)`).bind(id, id),
  ]);

  const row = rowResult.results[0] as RentalRow | undefined;
  if (!row) return null;
  const median = (medianResult.results[0] as { median_rent: number | null } | undefined)?.median_rent ?? null;
  return mapRental(row, median === null ? null : Number(median));
}

export async function findExistingRental(address: string, latitude: number, longitude: number) {
  const normalized = normalizeAddress(address);
  return getD1().prepare(`
    SELECT id FROM rental_locations
    WHERE normalized_address = ?
       OR (coordinates_verified = 1 AND latitude IS NOT NULL AND longitude IS NOT NULL
           AND ABS(latitude - ?) <= 0.00015 AND ABS(longitude - ?) <= 0.00015)
    ORDER BY normalized_address = ? DESC
    LIMIT 1
  `).bind(normalized, latitude, longitude, normalized).first<{ id: string }>();
}

export async function attachRentalToUniversity(rentalLocationId: string, universityId: string) {
  await getD1().prepare(`
    INSERT INTO rental_location_universities (rental_location_id, university_id, created_at)
    VALUES (?, ?, ?)
    ON CONFLICT(rental_location_id, university_id) DO NOTHING
  `).bind(rentalLocationId, universityId, new Date().toISOString()).run();
}

export async function medianRentExcludingUser(rentalLocationId: string, userId: string) {
  const row = await getD1().prepare(`WITH price_values AS (
    SELECT reference_rent AS monthly_rent
    FROM rental_locations
    WHERE id = ? AND reference_rent IS NOT NULL
    UNION ALL
    SELECT monthly_rent
    FROM rental_reports
    WHERE rental_location_id = ? AND user_id != ? AND is_valid = 1 AND is_outlier = 0
  ), ranked AS (
    SELECT monthly_rent, ROW_NUMBER() OVER (ORDER BY monthly_rent) AS row_number,
      COUNT(*) OVER () AS total
    FROM price_values
  )
  SELECT ROUND(AVG(monthly_rent), 0) AS median_rent, MAX(total) AS price_source_count
  FROM ranked
  WHERE row_number IN ((total + 1) / 2, (total + 2) / 2)`).bind(rentalLocationId, rentalLocationId, userId)
    .first<{ median_rent: number | null; price_source_count: number | null }>();
  return {
    medianRent: row?.median_rent === null || row?.median_rent === undefined ? null : Number(row.median_rent),
    priceSourceCount: Number(row?.price_source_count ?? 0),
  };
}
