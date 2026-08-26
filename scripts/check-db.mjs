import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const databaseDirectory = join('.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
const databaseFile = readdirSync(databaseDirectory).find((name) => name.endsWith('.sqlite') && name !== 'metadata.sqlite');

if (!databaseFile) throw new Error('找不到本機 D1 SQLite；請先執行 npm run dev 並開啟一次網站。');

const database = new DatabaseSync(join(databaseDirectory, databaseFile), { readOnly: true });
const indexes = database.prepare("SELECT name FROM sqlite_schema WHERE type = 'index' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
const listingPlan = database.prepare('EXPLAIN QUERY PLAN SELECT * FROM listings WHERE university_id = ?').all('ntu');
const reviewPlan = database.prepare('EXPLAIN QUERY PLAN SELECT * FROM reviews WHERE listing_id = ? ORDER BY created_at DESC').all('ntu-01');

console.log(JSON.stringify({ indexes, listingPlan, reviewPlan }, null, 2));
