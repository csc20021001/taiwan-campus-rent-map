import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const database = readFileSync(new URL('../db/index.ts', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../drizzle/0021_runtime_seed_versions.sql', import.meta.url), 'utf8');

test('large runtime seeds are versioned and skipped after successful import', () => {
  assert.match(database, /runVersionedSeed/);
  assert.match(database, /marker\?\.version === options\.version/);
  assert.match(database, /Number\(count\?\.count \?\? 0\) > 0/);
  for (const seed of ['departments', 'professors', 'rentals']) {
    assert.match(migration, new RegExp(`'${seed}'`));
  }
});
