import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import test from 'node:test';

const report = JSON.parse(readFileSync(new URL('../db/course-import-report.generated.json', import.meta.url), 'utf8'));
const importer = readFileSync(new URL('../scripts/import-official-course-history.py', import.meta.url), 'utf8');

test('historical course import is material and records its coverage', () => {
  assert.equal(report.courseCount, 33225);
  assert.equal(report.policy.officialUniversityDomainsOnly, true);
  assert.equal(report.policy.requiresCurrentOfficialFacultyEvidence, true);
  assert.ok(report.courseMigrationFiles.length > 1);
  for (const file of report.courseMigrationFiles) {
    const size = statSync(new URL(`../drizzle/${file}`, import.meta.url)).size;
    assert.ok(size < 6.1 * 1024 * 1024, `${file} is too large for the source repository`);
  }
  assert.match(importer, /active_rows = \[active\[teacher\] for teacher in teachers if teacher in active\]/);
  assert.match(importer, /official_url\(university_id, seed\["officialSourceUrl"\]\)/);
});
