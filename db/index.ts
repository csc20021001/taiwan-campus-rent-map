import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { rentalCampuses } from '../app/data';
import { rentalSeeds } from './rental-seeds.generated';
import { fixedAbsoluteCoordinate } from './rental-coordinate-overrides.mjs';
import { professorSeeds } from './professors-seeds.generated';
import { departmentSeeds } from './department-seeds';
import { currentGovernmentRentalSeeds } from './current-government-rental-seeds';
import { courseSeeds } from './course-seeds';

const sampleListingIds = [
  'ntu-01', 'ntu-02', 'ntu-03', 'nthu-01', 'nycu-01', 'ncku-01', 'ncu-01',
  'nchu-01', 'ccu-01', 'nsysu-01', 'ntust-01', 'ntut-01', 'niu-01',
];

let databaseReady: Promise<void> | null = null;

export function getD1() {
  if (!env.DB) throw new Error('Cloudflare D1 binding `DB` is unavailable.');
  return env.DB;
}

export function getDb() {
  return drizzle(getD1(), { schema });
}

async function migrateLegacyListings() {
  const db = getD1();
  const tableInfo = await db.prepare('PRAGMA table_info(listings)').all<{ name: string }>();
  const isLegacy = tableInfo.results.length > 0 && !tableInfo.results.some((column) => column.name === 'owner_user_id');
  if (!isLegacy) return;

  await db.batch([
    db.prepare('DROP TABLE IF EXISTS reviews'),
    db.prepare('DROP TABLE IF EXISTS listings'),
  ]);
}

async function ensureUniversityCreatedAt() {
  const db = getD1();
  const tableInfo = await db.prepare('PRAGMA table_info(universities)').all<{ name: string }>();
  if (tableInfo.results.length > 0 && !tableInfo.results.some((column) => column.name === 'created_at')) {
    await db.prepare('ALTER TABLE universities ADD COLUMN created_at TEXT').run();
  }
}

async function ensureProfessorOfficialSourceUrl() {
  const db = getD1();
  const tableInfo = await db.prepare('PRAGMA table_info(professors)').all<{ name: string }>();
  if (tableInfo.results.length > 0 && !tableInfo.results.some((column) => column.name === 'official_source_url')) {
    await db.prepare("ALTER TABLE professors ADD COLUMN official_source_url TEXT NOT NULL DEFAULT ''").run();
  }
}

async function ensureProfessorRatingDimensions() {
  const db = getD1();
  const tableInfo = await db.prepare('PRAGMA table_info(professor_ratings)').all<{ name: string }>();
  if (tableInfo.results.length === 0) return;
  const existing = new Set(tableInfo.results.map((column) => column.name));
  const additions = [
    ['attitude_score', 'ALTER TABLE professor_ratings ADD COLUMN attitude_score INTEGER NOT NULL DEFAULT 3 CHECK (attitude_score BETWEEN 1 AND 5)'],
    ['learning_score', 'ALTER TABLE professor_ratings ADD COLUMN learning_score INTEGER NOT NULL DEFAULT 3 CHECK (learning_score BETWEEN 1 AND 5)'],
    ['workload_score', 'ALTER TABLE professor_ratings ADD COLUMN workload_score INTEGER NOT NULL DEFAULT 3 CHECK (workload_score BETWEEN 1 AND 5)'],
    ['exam_difficulty_score', 'ALTER TABLE professor_ratings ADD COLUMN exam_difficulty_score INTEGER NOT NULL DEFAULT 3 CHECK (exam_difficulty_score BETWEEN 1 AND 5)'],
    ['grading_standard_score', 'ALTER TABLE professor_ratings ADD COLUMN grading_standard_score INTEGER NOT NULL DEFAULT 3 CHECK (grading_standard_score BETWEEN 1 AND 5)'],
  ] as const;
  for (const [column, sql] of additions) {
    if (!existing.has(column)) await db.prepare(sql).run();
  }
}

async function ensureUnifiedProfessorIdentities() {
  const db = getD1();
  const identityIndex = await db.prepare(`SELECT sql FROM sqlite_master
    WHERE type = 'index' AND name = 'idx_professors_identity'`).first<{ sql: string | null }>();
  if (identityIndex?.sql && !/department/i.test(identityIndex.sql)) return;

  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS _professor_identity_map (
      old_id TEXT PRIMARY KEY NOT NULL,
      canonical_id TEXT NOT NULL,
      merged_department TEXT NOT NULL
    )`),
    db.prepare('DELETE FROM _professor_identity_map'),
    db.prepare(`INSERT INTO _professor_identity_map (old_id, canonical_id, merged_department)
      SELECT p.id, grouped.canonical_id, grouped.merged_department
      FROM professors p
      JOIN (
        SELECT university_id, name, MIN(id) AS canonical_id,
          REPLACE(GROUP_CONCAT(DISTINCT department), ',', '／') AS merged_department
        FROM professors GROUP BY university_id, name
      ) grouped ON grouped.university_id = p.university_id AND grouped.name = p.name`),
    db.prepare(`CREATE TABLE IF NOT EXISTS _professor_rating_rank (
      rating_id TEXT PRIMARY KEY NOT NULL,
      canonical_id TEXT NOT NULL,
      identity_rank INTEGER NOT NULL
    )`),
    db.prepare('DELETE FROM _professor_rating_rank'),
    db.prepare(`INSERT INTO _professor_rating_rank (rating_id, canonical_id, identity_rank)
      SELECT pr.id, identity_map.canonical_id,
        ROW_NUMBER() OVER (
          PARTITION BY pr.user_id, identity_map.canonical_id
          ORDER BY pr.updated_at DESC, pr.id DESC
        ) AS identity_rank
      FROM professor_ratings pr
      JOIN _professor_identity_map identity_map ON identity_map.old_id = pr.professor_id`),
    db.prepare(`DELETE FROM professor_ratings
      WHERE id IN (SELECT rating_id FROM _professor_rating_rank WHERE identity_rank > 1)`),
    db.prepare(`UPDATE professor_ratings SET professor_id = (
        SELECT canonical_id FROM _professor_rating_rank WHERE rating_id = professor_ratings.id
      ) WHERE id IN (SELECT rating_id FROM _professor_rating_rank WHERE identity_rank = 1)`),
    db.prepare(`DELETE FROM professors WHERE id IN (
      SELECT old_id FROM _professor_identity_map WHERE old_id != canonical_id
    )`),
    db.prepare(`UPDATE professors SET department = (
        SELECT merged_department FROM _professor_identity_map
        WHERE canonical_id = professors.id LIMIT 1
      ), updated_at = CURRENT_TIMESTAMP
      WHERE id IN (SELECT canonical_id FROM _professor_identity_map)`),
    db.prepare('DROP INDEX IF EXISTS idx_professors_identity'),
    db.prepare('CREATE UNIQUE INDEX idx_professors_identity ON professors(university_id, name)'),
    db.prepare('DROP TABLE _professor_rating_rank'),
    db.prepare('DROP TABLE _professor_identity_map'),
  ]);
}

async function runBatches(statements: D1PreparedStatement[], size = 80) {
  const db = getD1();
  for (let index = 0; index < statements.length; index += size) {
    await db.batch(statements.slice(index, index + size));
  }
}

async function initializeCoreTables() {
  const db = getD1();
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS academic_departments (
      id TEXT PRIMARY KEY NOT NULL,
      university_id TEXT NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
      college TEXT NOT NULL,
      name TEXT NOT NULL,
      unit_type TEXT NOT NULL CHECK (unit_type IN ('department', 'institute', 'program', 'academic-unit')),
      official_source_url TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (university_id, name)
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS professors (
      id TEXT PRIMARY KEY NOT NULL,
      university_id TEXT NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
      department TEXT NOT NULL,
      name TEXT NOT NULL,
      official_source_url TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS professor_ratings (
      id TEXT PRIMARY KEY NOT NULL,
      professor_id TEXT NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      easy_to_pass_score INTEGER NOT NULL CHECK (easy_to_pass_score BETWEEN 1 AND 5),
      attitude_score INTEGER NOT NULL DEFAULT 3 CHECK (attitude_score BETWEEN 1 AND 5),
      learning_score INTEGER NOT NULL DEFAULT 3 CHECK (learning_score BETWEEN 1 AND 5),
      workload_score INTEGER NOT NULL DEFAULT 3 CHECK (workload_score BETWEEN 1 AND 5),
      exam_difficulty_score INTEGER NOT NULL DEFAULT 3 CHECK (exam_difficulty_score BETWEEN 1 AND 5),
      grading_standard_score INTEGER NOT NULL DEFAULT 3 CHECK (grading_standard_score BETWEEN 1 AND 5),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY NOT NULL,
      university_id TEXT NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
      term TEXT NOT NULL,
      course_code TEXT NOT NULL,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      official_source_url TEXT NOT NULL,
      department_source_url TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (university_id, term, course_code)
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS course_instructors (
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      instructor_name TEXT NOT NULL,
      professor_id TEXT REFERENCES professors(id) ON DELETE SET NULL,
      official_source_url TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      PRIMARY KEY (course_id, instructor_name)
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS course_ratings (
      id TEXT PRIMARY KEY NOT NULL,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      learning_score INTEGER NOT NULL CHECK (learning_score BETWEEN 1 AND 5),
      workload_score INTEGER NOT NULL CHECK (workload_score BETWEEN 1 AND 5),
      exam_difficulty_score INTEGER NOT NULL CHECK (exam_difficulty_score BETWEEN 1 AND 5),
      grading_standard_score INTEGER NOT NULL CHECK (grading_standard_score BETWEEN 1 AND 5),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (user_id, course_id)
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS rental_locations (
      id TEXT PRIMARY KEY NOT NULL,
      university_id TEXT NOT NULL REFERENCES universities(id) ON DELETE RESTRICT,
      address TEXT NOT NULL,
      normalized_address TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      source TEXT NOT NULL CHECK (source IN ('government', 'user', 'admin')),
      reference_rent INTEGER CHECK (reference_rent IS NULL OR reference_rent > 0),
      reference_rent_source TEXT,
      coordinate_source TEXT,
      coordinates_verified INTEGER NOT NULL DEFAULT 0 CHECK (coordinates_verified IN (0, 1)),
      created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      CHECK ((latitude IS NULL AND longitude IS NULL) OR
             (latitude BETWEEN 21.8 AND 25.5 AND longitude BETWEEN 119.3 AND 122.1))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS rental_location_universities (
      rental_location_id TEXT NOT NULL REFERENCES rental_locations(id) ON DELETE CASCADE,
      university_id TEXT NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (rental_location_id, university_id)
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS rental_reports (
      id TEXT PRIMARY KEY NOT NULL,
      rental_location_id TEXT NOT NULL REFERENCES rental_locations(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      monthly_rent INTEGER NOT NULL CHECK (monthly_rent BETWEEN 1000 AND 200000),
      overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
      is_valid INTEGER NOT NULL DEFAULT 1 CHECK (is_valid IN (0, 1)),
      is_outlier INTEGER NOT NULL DEFAULT 0 CHECK (is_outlier IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS rental_comments (
      id TEXT PRIMARY KEY NOT NULL,
      rental_location_id TEXT NOT NULL REFERENCES rental_locations(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL CHECK (length(trim(content)) BETWEEN 4 AND 500),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS api_rate_limits (
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      window_started_at INTEGER NOT NULL,
      request_count INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (user_id, action, window_started_at)
    )`),
  ]);
  await ensureProfessorOfficialSourceUrl();
  await ensureProfessorRatingDimensions();
  await ensureUnifiedProfessorIdentities();
  await db.batch([
    db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_academic_departments_identity ON academic_departments(university_id, name)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_academic_departments_university_college ON academic_departments(university_id, college, name)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_academic_departments_name ON academic_departments(name)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_professors_university ON professors(university_id)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_professors_department ON professors(department)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_professors_name ON professors(name)'),
    db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_professor_ratings_user_professor ON professor_ratings(user_id, professor_id)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_professor_ratings_professor ON professor_ratings(professor_id)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_professor_ratings_user ON professor_ratings(user_id)'),
    db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_courses_identity ON courses(university_id, term, course_code)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_courses_university_term ON courses(university_id, term, department, name)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_courses_name ON courses(name)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_course_instructors_name ON course_instructors(instructor_name)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_course_instructors_professor ON course_instructors(professor_id)'),
    db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_course_ratings_user_course ON course_ratings(user_id, course_id)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_course_ratings_course ON course_ratings(course_id)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_course_ratings_user ON course_ratings(user_id)'),
    db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_rental_locations_normalized_address ON rental_locations(normalized_address)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_rental_locations_university ON rental_locations(university_id)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_rental_locations_coordinates ON rental_locations(latitude, longitude)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_rental_location_universities_university ON rental_location_universities(university_id, rental_location_id)'),
    db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_rental_reports_user_location ON rental_reports(user_id, rental_location_id)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_rental_reports_location ON rental_reports(rental_location_id)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_rental_reports_user ON rental_reports(user_id)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_rental_reports_aggregate ON rental_reports(rental_location_id, is_valid, is_outlier)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_rental_comments_location_created ON rental_comments(rental_location_id, created_at DESC)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_rental_comments_user_created ON rental_comments(user_id, created_at DESC)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_api_rate_limits_cleanup ON api_rate_limits(window_started_at)'),
  ]);
}

async function seedDepartments() {
  const db = getD1();
  const timestamp = '2026-08-27T00:00:00.000Z';
  const statements = departmentSeeds.map((seed) => db.prepare(`
    INSERT INTO academic_departments (
      id, university_id, college, name, unit_type, official_source_url, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(university_id, name) DO UPDATE SET
      college = excluded.college,
      unit_type = excluded.unit_type,
      official_source_url = excluded.official_source_url,
      updated_at = excluded.updated_at
  `).bind(
    seed.id, seed.universityId, seed.college, seed.name, seed.unitType,
    seed.sourceUrl, timestamp, timestamp,
  ));
  await runBatches(statements);
}

async function seedProfessors() {
  const db = getD1();
  const timestamp = '2026-08-27T00:00:00.000Z';
  const statements = professorSeeds.map((seed) => db.prepare(`
    INSERT INTO professors (
      id, university_id, department, name, official_source_url, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(university_id, name) DO UPDATE SET
      department = excluded.department,
      official_source_url = excluded.official_source_url,
      updated_at = excluded.updated_at
  `).bind(seed.id, seed.universityId, seed.department, seed.name, seed.sourceUrl, timestamp, timestamp));
  await runBatches(statements);
}

async function seedCourses() {
  const db = getD1();
  const timestamp = '2026-08-27T00:00:00.000Z';
  const courseStatements = courseSeeds.map((seed) => db.prepare(`
    INSERT INTO courses (
      id, university_id, term, course_code, name, department,
      official_source_url, department_source_url, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(university_id, term, course_code) DO UPDATE SET
      name = excluded.name,
      department = excluded.department,
      official_source_url = excluded.official_source_url,
      department_source_url = excluded.department_source_url,
      updated_at = excluded.updated_at
  `).bind(
    seed.id, seed.universityId, seed.term, seed.courseCode, seed.name, seed.department,
    seed.officialSourceUrl, seed.departmentSourceUrl, timestamp, timestamp,
  ));
  await runBatches(courseStatements);

  const professorByIdentity = new Map(professorSeeds.map((seed) => [`${seed.universityId}\u0000${seed.name}`, seed]));
  const instructorStatements = courseSeeds.flatMap((seed) => seed.instructors.map((instructor) => {
    const professor = professorByIdentity.get(`${seed.universityId}\u0000${instructor.name}`);
    return db.prepare(`
      INSERT INTO course_instructors (
        course_id, instructor_name, professor_id, official_source_url, created_at
      ) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(course_id, instructor_name) DO UPDATE SET
        professor_id = excluded.professor_id,
        official_source_url = excluded.official_source_url
    `).bind(seed.id, instructor.name, professor?.id ?? null, instructor.officialSourceUrl ?? professor?.sourceUrl ?? '', timestamp);
  }));
  await runBatches(instructorStatements);
}

async function seedRentalLocations() {
  const db = getD1();
  const timestamp = '2026-08-26T00:00:00.000Z';
  const locationSeeds = rentalSeeds.map((seed) => {
    const coordinate = fixedAbsoluteCoordinate(seed.normalizedAddress) ?? seed;
    return db.prepare(`
    INSERT INTO rental_locations (
      id, university_id, address, normalized_address, latitude, longitude, source,
      reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
      created_by_user_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'government', ?, 'government', ?, ?, NULL, ?, ?)
    ON CONFLICT(normalized_address) DO UPDATE SET
      reference_rent = excluded.reference_rent,
      reference_rent_source = excluded.reference_rent_source,
      latitude = CASE WHEN excluded.coordinate_source = 'fixed_absolute_estimate'
        THEN excluded.latitude ELSE COALESCE(rental_locations.latitude, excluded.latitude) END,
      longitude = CASE WHEN excluded.coordinate_source = 'fixed_absolute_estimate'
        THEN excluded.longitude ELSE COALESCE(rental_locations.longitude, excluded.longitude) END,
      coordinate_source = CASE WHEN excluded.coordinate_source = 'fixed_absolute_estimate'
        THEN excluded.coordinate_source ELSE COALESCE(rental_locations.coordinate_source, excluded.coordinate_source) END,
      coordinates_verified = CASE WHEN excluded.coordinate_source = 'fixed_absolute_estimate'
        THEN 0 ELSE rental_locations.coordinates_verified END,
      updated_at = excluded.updated_at
  `).bind(
    seed.id, seed.primaryUniversityId, seed.address, seed.normalizedAddress,
    coordinate.latitude, coordinate.longitude, seed.referenceRent, coordinate.coordinateSource,
    coordinate.coordinatesVerified ? 1 : 0, timestamp, timestamp,
  );
  });
  await runBatches(locationSeeds);

  const associationSeeds = rentalSeeds.flatMap((seed) => seed.universityIds.map((universityId) => db.prepare(`
    INSERT INTO rental_location_universities (rental_location_id, university_id, created_at)
    SELECT id, ?, ? FROM rental_locations WHERE normalized_address = ?
    ON CONFLICT(rental_location_id, university_id) DO NOTHING
  `).bind(universityId, timestamp, seed.normalizedAddress)));
  await runBatches(associationSeeds);

  await db.batch([
    db.prepare(`INSERT INTO rental_locations (
      id, university_id, address, normalized_address, latitude, longitude, source,
      reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
      created_by_user_id, created_at, updated_at
    ) VALUES (
      'admin-niu-yizhong-82', 'niu', '260 宜蘭縣宜蘭市思源里宜中路82號',
      '260宜蘭縣宜蘭市思源里宜中路82號', 24.74692, 121.74265, 'admin',
      NULL, NULL, 'admin', 0, NULL, ?, ?
    ) ON CONFLICT(normalized_address) DO NOTHING`).bind(timestamp, timestamp),
    db.prepare(`INSERT INTO rental_location_universities (rental_location_id, university_id, created_at)
      SELECT id, 'niu', ? FROM rental_locations
      WHERE normalized_address = '260宜蘭縣宜蘭市思源里宜中路82號'
      ON CONFLICT(rental_location_id, university_id) DO NOTHING`).bind(timestamp),
  ]);

  const currentLocationStatements = currentGovernmentRentalSeeds.flatMap((seed) => [
    db.prepare(`INSERT INTO rental_locations (
      id, university_id, address, normalized_address, latitude, longitude, source,
      reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
      created_by_user_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'government', ?, ?, ?, 0, NULL, ?, ?)
    ON CONFLICT(normalized_address) DO UPDATE SET
      university_id = excluded.university_id,
      source = 'government',
      reference_rent = excluded.reference_rent,
      reference_rent_source = excluded.reference_rent_source,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      coordinate_source = excluded.coordinate_source,
      coordinates_verified = 0,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at`).bind(
      seed.id, seed.universityId, seed.address, seed.normalizedAddress,
      seed.latitude, seed.longitude, seed.referenceRent, seed.referenceRentSource,
      seed.coordinateSource, seed.createdAt, seed.createdAt,
    ),
    db.prepare(`INSERT INTO rental_location_universities (rental_location_id, university_id, created_at)
      SELECT id, ?, ? FROM rental_locations WHERE normalized_address = ?
      ON CONFLICT(rental_location_id, university_id) DO NOTHING`)
      .bind(seed.universityId, seed.createdAt, seed.normalizedAddress),
  ]);
  await runBatches(currentLocationStatements);
}

async function initializeDatabase() {
  const db = getD1();
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS universities (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      short_name TEXT NOT NULL,
      city TEXT NOT NULL,
      district TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      address TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      google_sub TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS auth_sessions (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`),
  ]);

  await ensureUniversityCreatedAt();

  await migrateLegacyListings();

  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY NOT NULL,
      university_id TEXT NOT NULL REFERENCES universities(id) ON DELETE RESTRICT,
      owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      title TEXT NOT NULL,
      address TEXT NOT NULL,
      description TEXT NOT NULL,
      monthly_rent INTEGER NOT NULL,
      room_type TEXT NOT NULL,
      area_ping REAL NOT NULL,
      walk_minutes INTEGER NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      highlights TEXT NOT NULL,
      contact_method TEXT NOT NULL,
      contact_value TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'published',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      author_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`),
    db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_expires ON auth_sessions(user_id, expires_at)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_listings_university_status ON listings(university_id, status)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_listings_owner_created ON listings(owner_user_id, created_at DESC)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_reviews_listing_created ON reviews(listing_id, created_at DESC)'),
  ]);

  const placeholders = sampleListingIds.map(() => '?').join(', ');
  await db.batch([
    db.prepare(`DELETE FROM reviews WHERE listing_id IN (${placeholders})`).bind(...sampleListingIds),
    db.prepare(`DELETE FROM listings WHERE id IN (${placeholders})`).bind(...sampleListingIds),
  ]);

  const schoolSeeds = rentalCampuses.map((school) => db.prepare(`
    INSERT INTO universities
      (id, name, short_name, city, district, latitude, longitude, address, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      short_name = excluded.short_name,
      city = excluded.city,
      district = excluded.district,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      address = excluded.address,
      created_at = COALESCE(universities.created_at, excluded.created_at)
  `).bind(school.id, school.name, school.shortName, school.city, school.district, school.latitude, school.longitude, school.address, '2026-08-26T00:00:00.000Z'));
  await db.batch(schoolSeeds);

  await initializeCoreTables();
  await seedDepartments();
  await seedProfessors();
  await seedCourses();
  await seedRentalLocations();
  await db.prepare('PRAGMA optimize').run();
}

export function ensureDatabase() {
  if (!databaseReady) {
    databaseReady = initializeDatabase().catch((error) => {
      databaseReady = null;
      throw error;
    });
  }
  return databaseReady;
}
