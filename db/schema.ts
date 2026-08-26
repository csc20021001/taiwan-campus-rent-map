import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const universities = sqliteTable('universities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  shortName: text('short_name').notNull(),
  city: text('city').notNull(),
  district: text('district').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  address: text('address').notNull(),
});

export const listings = sqliteTable('listings', {
  id: text('id').primaryKey(),
  universityId: text('university_id').notNull().references(() => universities.id),
  title: text('title').notNull(),
  address: text('address').notNull(),
  monthlyRent: integer('monthly_rent').notNull(),
  roomType: text('room_type').notNull(),
  areaPing: real('area_ping').notNull(),
  walkMinutes: integer('walk_minutes').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  highlights: text('highlights', { mode: 'json' }).$type<string[]>().notNull(),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  seedRating: real('seed_rating').notNull().default(0),
  seedReviewCount: integer('seed_review_count').notNull().default(0),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('idx_listings_university_id').on(table.universityId),
]);

export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listingId: text('listing_id').notNull().references(() => listings.id),
  authorName: text('author_name').notNull(),
  rating: integer('rating').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('idx_reviews_listing_created').on(table.listingId, table.createdAt),
]);
