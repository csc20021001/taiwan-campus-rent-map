import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const sourcePath = resolve('db/professors.seed.json');
const outputPath = resolve('db/professors-seed.generated.sql');
const allowedUniversities = new Set(['ntu', 'nthu', 'nycu', 'ncku', 'ncu', 'nchu', 'nsysu', 'ccu', 'ntust', 'ntut', 'niu']);
const rows = JSON.parse(readFileSync(sourcePath, 'utf8'));
if (!Array.isArray(rows)) throw new Error('db/professors.seed.json 必須是陣列。');

const seen = new Set();
const sqlString = (value) => `'${String(value).replaceAll("'", "''")}'`;
const statements = rows.map((row, index) => {
  const id = String(row.id ?? '').trim();
  const universityId = String(row.universityId ?? '').trim();
  const department = String(row.department ?? '').trim();
  const name = String(row.name ?? '').trim();
  if (!/^[a-z0-9-]{2,80}$/i.test(id)) throw new Error(`第 ${index + 1} 筆教授 id 格式不正確。`);
  if (!allowedUniversities.has(universityId)) throw new Error(`第 ${index + 1} 筆 universityId 不在支援名單。`);
  if (department.length < 2 || department.length > 80 || name.length < 2 || name.length > 40) {
    throw new Error(`第 ${index + 1} 筆教授姓名或系所長度不正確。`);
  }
  const identity = `${universityId}\u0000${department}\u0000${name}`;
  if (seen.has(identity)) throw new Error(`第 ${index + 1} 筆教授資料重複。`);
  seen.add(identity);
  return `INSERT INTO professors (id, university_id, department, name, created_at, updated_at)
VALUES (${sqlString(id)}, ${sqlString(universityId)}, ${sqlString(department)}, ${sqlString(name)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT(university_id, department, name) DO UPDATE SET name = excluded.name, updated_at = CURRENT_TIMESTAMP;`;
});

writeFileSync(outputPath, `${statements.join('\n--> statement-breakpoint\n')}${statements.length ? '\n--> statement-breakpoint\n' : ''}PRAGMA optimize;\n`);
console.log(`Wrote ${rows.length} professor seed row(s) to db/professors-seed.generated.sql.`);
