import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

const seeds = JSON.parse(
  readFileSync(new URL('../db/professors.seed.json', import.meta.url), 'utf8'),
);
const generatedSql = readFileSync(
  new URL('../db/professors-seed.generated.sql', import.meta.url),
  'utf8',
);

const officialDomains = {
  ntu: 'ntu.edu.tw',
  nthu: 'nthu.edu.tw',
  nycu: 'nycu.edu.tw',
  ncku: 'ncku.edu.tw',
  ncu: 'ncu.edu.tw',
  nchu: 'nchu.edu.tw',
  ccu: 'ccu.edu.tw',
  nsysu: 'nsysu.edu.tw',
  ntust: 'ntust.edu.tw',
  ntut: 'ntut.edu.tw',
  niu: 'niu.edu.tw',
};

const expectedCounts = {
  ntu: 10,
  nthu: 9,
  nycu: 13,
  ncku: 17,
  ncu: 20,
  nchu: 14,
  ccu: 8,
  nsysu: 16,
  ntust: 27,
  ntut: 23,
  niu: 10,
};

test('professor seed contains only unique official university records', () => {
  assert.equal(seeds.length, 167);
  assert.equal(new Set(seeds.map((row) => row.id)).size, seeds.length);
  assert.equal(
    new Set(seeds.map((row) => `${row.universityId}\u0000${row.department}\u0000${row.name}`)).size,
    seeds.length,
  );

  const actualCounts = Object.fromEntries(
    Object.keys(expectedCounts).map((universityId) => [
      universityId,
      seeds.filter((row) => row.universityId === universityId).length,
    ]),
  );
  assert.deepEqual(actualCounts, expectedCounts);

  for (const row of seeds) {
    const source = new URL(row.sourceUrl);
    const expectedDomain = officialDomains[row.universityId];
    assert.equal(source.protocol, 'https:');
    assert.equal(
      source.hostname === expectedDomain || source.hostname.endsWith(`.${expectedDomain}`),
      true,
      `${row.id} must use the official ${expectedDomain} domain`,
    );
    assert.doesNotMatch(source.hostname, /forum|dcard|ptt/i);
  }
});

test('generated professor SQL imports all official-source records', () => {
  const database = new DatabaseSync(':memory:');
  database.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE universities (id TEXT PRIMARY KEY NOT NULL);
    INSERT INTO universities (id) VALUES
      ('ntu'), ('nthu'), ('nycu'), ('ncku'), ('ncu'), ('nchu'),
      ('nsysu'), ('ccu'), ('ntust'), ('ntut'), ('niu');
    CREATE TABLE professors (
      id TEXT PRIMARY KEY NOT NULL,
      university_id TEXT NOT NULL REFERENCES universities(id),
      department TEXT NOT NULL,
      name TEXT NOT NULL,
      official_source_url TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (university_id, department, name)
    );
  `);
  database.exec(generatedSql);

  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM professors').get().count, 167);
  assert.equal(
    database.prepare("SELECT COUNT(*) AS count FROM professors WHERE official_source_url = ''").get().count,
    0,
  );
  assert.deepEqual(
    Object.fromEntries(
      database.prepare(`
        SELECT university_id, COUNT(*) AS count
        FROM professors
        GROUP BY university_id
      `).all().map((row) => [row.university_id, row.count]),
    ),
    expectedCounts,
  );
});
