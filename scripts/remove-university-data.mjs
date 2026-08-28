import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const universityId = process.argv[2];
if (!/^[a-z0-9-]{2,40}$/i.test(universityId ?? '')) {
  throw new Error('Usage: node scripts/remove-university-data.mjs <university-id>');
}

const jsonFiles = [
  'db/professors.seed.json',
  'db/professor-candidates.generated.json',
  'db/department-sites.generated.json',
  'db/faculty-pages.generated.json',
];

const rentalAddresses = universityId === 'ncku' ? new Set([
  '臺南市東區東門路一段61號之9',
  '臺南市東區勝利路115號七樓之2',
  '臺南市東區東門路一段298號八樓之2',
  '臺南市東區勝利路50號七樓',
  '臺南市東區東寧路西段23號七樓之2',
]) : new Set();

for (const filename of jsonFiles) {
  const path = resolve(filename);
  const rows = JSON.parse(readFileSync(path, 'utf8'));
  if (!Array.isArray(rows)) throw new Error(`${filename} must contain a JSON array.`);
  const filtered = rows.filter((row) => row?.universityId !== universityId);
  writeFileSync(path, `${JSON.stringify(filtered, null, 2)}\n`);
  console.log(`${filename}: removed ${rows.length - filtered.length} row(s)`);
}

const geocodePath = resolve('db/rental-geocode-cache.json');
const geocodeCache = JSON.parse(readFileSync(geocodePath, 'utf8'));
for (const address of rentalAddresses) delete geocodeCache[address];
writeFileSync(geocodePath, `${JSON.stringify(geocodeCache, null, 2)}\n`);
console.log(`db/rental-geocode-cache.json: removed ${rentalAddresses.size} address(es)`);

const reportPath = resolve('db/course-import-report.generated.json');
const report = JSON.parse(readFileSync(reportPath, 'utf8'));
const removedReports = report.schools.filter((school) => school.universityId === universityId);
report.schools = report.schools.filter((school) => school.universityId !== universityId);
report.courseCount -= removedReports.reduce((count, school) => count + Number(school.verifiedOfferings ?? 0), 0);
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`db/course-import-report.generated.json: removed ${removedReports.length} school report(s)`);

const migrationFiles = readdirSync(resolve('drizzle'))
  .filter((filename) => /^\d+_official_course_history.*\.sql$/.test(filename));
for (const filename of migrationFiles) {
  const path = resolve('drizzle', filename);
  const statements = readFileSync(path, 'utf8').split('--> statement-breakpoint');
  let removedRows = 0;
  const filteredStatements = statements.flatMap((statement) => {
    const trimmed = statement.trim();
    if (!/^INSERT INTO (courses|course_instructors)\b/.test(trimmed)) return trimmed ? [trimmed] : [];
    const lines = trimmed.split(/\r?\n/);
    const rows = lines.filter((line) => /^\('/.test(line));
    const keptRows = rows.filter((line) => !line.includes(`course-${universityId}-`));
    removedRows += rows.length - keptRows.length;
    if (keptRows.length === 0) return [];
    const keptSet = new Set(keptRows);
    const filteredLines = lines.filter((line) => !/^\('/.test(line) || keptSet.has(line));
    const lastRowIndex = filteredLines.findLastIndex((line) => /^\('/.test(line));
    filteredLines[lastRowIndex] = filteredLines[lastRowIndex].replace(/,$/, '');
    return [filteredLines.join('\n')];
  });
  writeFileSync(path, `${filteredStatements.join('\n--> statement-breakpoint\n')}\n`);
  console.log(`drizzle/${filename}: removed ${removedRows} row(s)`);
}
