import { index, integer, primaryKey, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const universities = sqliteTable('universities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  shortName: text('short_name').notNull(),
  city: text('city').notNull(),
  district: text('district').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  address: text('address').notNull(),
  createdAt: text('created_at'),
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  googleSub: text('google_sub').notNull(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  uniqueIndex('idx_users_google_sub').on(table.googleSub),
  index('idx_users_email').on(table.email),
]);

export const authSessions = sqliteTable('auth_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('idx_auth_sessions_user_expires').on(table.userId, table.expiresAt),
]);

export const listings = sqliteTable('listings', {
  id: text('id').primaryKey(),
  universityId: text('university_id').notNull().references(() => universities.id, { onDelete: 'restrict' }),
  ownerUserId: text('owner_user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  title: text('title').notNull(),
  address: text('address').notNull(),
  description: text('description').notNull(),
  monthlyRent: integer('monthly_rent').notNull(),
  roomType: text('room_type').notNull(),
  areaPing: real('area_ping').notNull(),
  walkMinutes: integer('walk_minutes').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  highlights: text('highlights', { mode: 'json' }).$type<string[]>().notNull(),
  contactMethod: text('contact_method').notNull(),
  contactValue: text('contact_value').notNull(),
  status: text('status').notNull().default('published'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('idx_listings_university_status').on(table.universityId, table.status),
  index('idx_listings_owner_created').on(table.ownerUserId, table.createdAt),
]);

export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listingId: text('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  authorName: text('author_name').notNull(),
  rating: integer('rating').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('idx_reviews_listing_created').on(table.listingId, table.createdAt),
]);

export const academicDepartments = sqliteTable('academic_departments', {
  id: text('id').primaryKey(),
  universityId: text('university_id').notNull().references(() => universities.id, { onDelete: 'cascade' }),
  college: text('college').notNull(),
  name: text('name').notNull(),
  unitType: text('unit_type').notNull(),
  officialSourceUrl: text('official_source_url').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('idx_academic_departments_university_college').on(table.universityId, table.college, table.name),
  index('idx_academic_departments_name').on(table.name),
  uniqueIndex('idx_academic_departments_identity').on(table.universityId, table.name),
]);

export const professors = sqliteTable('professors', {
  id: text('id').primaryKey(),
  universityId: text('university_id').notNull().references(() => universities.id, { onDelete: 'cascade' }),
  department: text('department').notNull(),
  name: text('name').notNull(),
  officialSourceUrl: text('official_source_url').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('idx_professors_university').on(table.universityId),
  index('idx_professors_department').on(table.department),
  index('idx_professors_name').on(table.name),
  uniqueIndex('idx_professors_identity').on(table.universityId, table.name),
]);

export const professorRatings = sqliteTable('professor_ratings', {
  id: text('id').primaryKey(),
  professorId: text('professor_id').notNull().references(() => professors.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  easyToPassScore: integer('easy_to_pass_score').notNull(),
  attitudeScore: integer('attitude_score').notNull().default(3),
  learningScore: integer('learning_score').notNull().default(3),
  workloadScore: integer('workload_score').notNull().default(3),
  examDifficultyScore: integer('exam_difficulty_score').notNull().default(3),
  gradingStandardScore: integer('grading_standard_score').notNull().default(3),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('idx_professor_ratings_professor').on(table.professorId),
  index('idx_professor_ratings_user').on(table.userId),
  uniqueIndex('idx_professor_ratings_user_professor').on(table.userId, table.professorId),
]);

export const courses = sqliteTable('courses', {
  id: text('id').primaryKey(),
  universityId: text('university_id').notNull().references(() => universities.id, { onDelete: 'cascade' }),
  term: text('term').notNull(),
  firstTerm: text('first_term').notNull().default(''),
  lastTerm: text('last_term').notNull().default(''),
  offeredTerms: text('offered_terms').notNull().default(''),
  courseCode: text('course_code').notNull(),
  name: text('name').notNull(),
  department: text('department').notNull(),
  officialSourceUrl: text('official_source_url').notNull(),
  departmentSourceUrl: text('department_source_url').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('idx_courses_university_term').on(table.universityId, table.term, table.department, table.name),
  index('idx_courses_name').on(table.name),
  index('idx_courses_department').on(table.department),
  uniqueIndex('idx_courses_identity').on(table.universityId, table.term, table.courseCode),
]);

export const courseInstructors = sqliteTable('course_instructors', {
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  instructorName: text('instructor_name').notNull(),
  professorId: text('professor_id').references(() => professors.id, { onDelete: 'set null' }),
  officialSourceUrl: text('official_source_url').notNull().default(''),
  createdAt: text('created_at').notNull(),
}, (table) => [
  primaryKey({ columns: [table.courseId, table.instructorName] }),
  index('idx_course_instructors_name').on(table.instructorName),
  index('idx_course_instructors_professor').on(table.professorId),
]);

export const courseRatings = sqliteTable('course_ratings', {
  id: text('id').primaryKey(),
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  learningScore: integer('learning_score').notNull(),
  workloadScore: integer('workload_score').notNull(),
  examDifficultyScore: integer('exam_difficulty_score').notNull(),
  gradingStandardScore: integer('grading_standard_score').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('idx_course_ratings_course').on(table.courseId),
  index('idx_course_ratings_user').on(table.userId),
  uniqueIndex('idx_course_ratings_user_course').on(table.userId, table.courseId),
]);

export const rentalLocations = sqliteTable('rental_locations', {
  id: text('id').primaryKey(),
  universityId: text('university_id').notNull().references(() => universities.id, { onDelete: 'restrict' }),
  address: text('address').notNull(),
  normalizedAddress: text('normalized_address').notNull(),
  latitude: real('latitude'),
  longitude: real('longitude'),
  source: text('source').notNull(),
  referenceRent: integer('reference_rent'),
  referenceRentSource: text('reference_rent_source'),
  coordinateSource: text('coordinate_source'),
  coordinatesVerified: integer('coordinates_verified', { mode: 'boolean' }).notNull().default(false),
  createdByUserId: text('created_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  uniqueIndex('idx_rental_locations_normalized_address').on(table.normalizedAddress),
  index('idx_rental_locations_university').on(table.universityId),
  index('idx_rental_locations_coordinates').on(table.latitude, table.longitude),
]);

export const rentalLocationUniversities = sqliteTable('rental_location_universities', {
  rentalLocationId: text('rental_location_id').notNull().references(() => rentalLocations.id, { onDelete: 'cascade' }),
  universityId: text('university_id').notNull().references(() => universities.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull(),
}, (table) => [
  primaryKey({ columns: [table.rentalLocationId, table.universityId] }),
  index('idx_rental_location_universities_university').on(table.universityId, table.rentalLocationId),
]);

export const rentalReports = sqliteTable('rental_reports', {
  id: text('id').primaryKey(),
  rentalLocationId: text('rental_location_id').notNull().references(() => rentalLocations.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  monthlyRent: integer('monthly_rent').notNull(),
  overallRating: integer('overall_rating').notNull(),
  isValid: integer('is_valid', { mode: 'boolean' }).notNull().default(true),
  isOutlier: integer('is_outlier', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('idx_rental_reports_location').on(table.rentalLocationId),
  index('idx_rental_reports_user').on(table.userId),
  uniqueIndex('idx_rental_reports_user_location').on(table.userId, table.rentalLocationId),
]);

export const rentalComments = sqliteTable('rental_comments', {
  id: text('id').primaryKey(),
  rentalLocationId: text('rental_location_id').notNull().references(() => rentalLocations.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('idx_rental_comments_location_created').on(table.rentalLocationId, table.createdAt),
  index('idx_rental_comments_user_created').on(table.userId, table.createdAt),
]);

export const apiRateLimits = sqliteTable('api_rate_limits', {
  userId: text('user_id').notNull(),
  action: text('action').notNull(),
  windowStartedAt: integer('window_started_at').notNull(),
  requestCount: integer('request_count').notNull().default(1),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.action, table.windowStartedAt] }),
  index('idx_api_rate_limits_cleanup').on(table.windowStartedAt),
]);
