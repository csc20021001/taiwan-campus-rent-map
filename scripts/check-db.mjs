import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const databaseDirectory = join('.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
const databaseFile = readdirSync(databaseDirectory).find((name) => name.endsWith('.sqlite') && name !== 'metadata.sqlite');

if (!databaseFile) throw new Error('找不到本機 D1 SQLite；請先執行 npm run dev 並開啟一次網站。');

const database = new DatabaseSync(join(databaseDirectory, databaseFile), { readOnly: true });
const indexes = database.prepare("SELECT name FROM sqlite_schema WHERE type = 'index' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
const counts = database.prepare('SELECT (SELECT COUNT(*) FROM listings) AS listings, (SELECT COUNT(*) FROM reviews) AS reviews, (SELECT COUNT(*) FROM users) AS users').get();
const listingPlan = database.prepare("EXPLAIN QUERY PLAN SELECT * FROM listings WHERE university_id = ? AND status = 'published'").all('ntu');
const sessionPlan = database.prepare('EXPLAIN QUERY PLAN SELECT * FROM auth_sessions WHERE user_id = ? AND expires_at > ?').all('user-id', new Date().toISOString());

console.log(JSON.stringify({ indexes, counts, listingPlan, sessionPlan }, null, 2));
