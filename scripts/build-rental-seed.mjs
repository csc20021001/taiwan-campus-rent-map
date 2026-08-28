import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fixedAbsoluteCoordinate } from '../db/rental-coordinate-overrides.mjs';

const groups = {
  ntu: [
    ['臺北市大安區和平東路二段96巷51號', 19500],
    ['臺北市大安區辛亥路二段109號', 32000],
    ['臺北市大安區和平東路二段76巷23弄8號', 30000],
    ['臺北市大安區辛亥路二段171巷9號', 55000],
    ['臺北市大安區和平東路二段118巷54弄16號', 30000],
  ],
  nthu: [
    ['新竹市公道五路二段425之5號', 40000],
    ['新竹市公道五路二段313號', 50000],
    ['新竹市公道五路二段293號', 34056],
    ['新竹市公道五路二段299號', 61231],
    ['新竹市世傑路288號', 74706],
  ],
  nycu: [
    ['新竹市世傑路288號', 74706],
    ['新竹市世傑路72號', 32500],
    ['新竹市世傑路116號', 25000],
    ['新竹市公道五路二段425之5號', 40000],
    ['新竹市公道五路二段313號', 50000],
  ],
  ncu: [
    ['桃園市中壢區51號', 18000],
    ['桃園市中壢區61號', 12000],
    ['桃園市中壢區101號', 26000],
    ['桃園市中壢區113號', 15000],
    ['桃園市中壢區大享街468號', 17000],
  ],
  nchu: [
    ['臺中市南區學府路3號', 14000],
    ['臺中市南區興大路200號', 17000],
    ['臺中市南區學府路21號', 8300],
    ['臺中市南區復新街55號', 6000],
    ['臺中市南區永東街42號', 11400],
  ],
  nsysu: [
    ['高雄市鼓山區濱海一路88巷16號', null],
    ['高雄市鼓山區濱海一路88巷26號', null],
    ['高雄市鼓山區濱海一路88巷28號', null],
    ['高雄市鼓山區濱海一路88巷22號', null],
    ['高雄市鼓山區濱海一路88巷20號', null],
  ],
  ccu: [
    ['嘉義縣民雄鄉三興路119號', 3200],
    ['嘉義縣民雄鄉鴨母坔61之71號五樓五', 4000],
    ['嘉義縣民雄鄉鎮北村圳溝墘21號三樓之14', 4700],
    ['嘉義縣民雄鄉鎮北村圳溝墘20號二樓之一', 5000],
    ['嘉義縣民雄鄉鎮北村圳溝墘19號四樓之三', 4300],
  ],
  ntust: [
    ['臺北市大安區羅斯福路四段119巷38號', 23000],
    ['臺北市中正區羅斯福路四段162號', 18500],
    ['臺北市文山區羅斯福路四段210號', 19000],
    ['臺北市文山區羅斯福路四段202號', 30483],
    ['臺北市文山區羅斯福路四段200號', 18000],
  ],
  ntut: [
    ['臺北市大安區忠孝東路三段52號', 47550],
    ['臺北市大安區忠孝東路三段54號', 45000],
    ['臺北市大安區忠孝東路三段88號', 35000],
    ['臺北市大安區新生南路一段97巷3號', 151000],
    ['臺北市大安區建國南路一段42號', 30000],
  ],
  niu: [
    ['宜蘭縣宜蘭市神農路二段127號', null],
    ['宜蘭縣宜蘭市神農路二段125號', null],
    ['宜蘭縣宜蘭市神農路二段57巷23號', null],
    ['宜蘭縣宜蘭市神農路二段50號', null],
    ['宜蘭縣宜蘭市復興路一段74之2號', null],
  ],
};

export function normalizeAddress(value) {
  return value.normalize('NFKC')
    .replace(/[台臺]/g, '臺')
    .replace(/[\s,，、。．]/g, '')
    .replace(/[-－—]/g, '之')
    .trim();
}

function fallbackAddresses(address) {
  const values = [address];
  const withoutFloor = address.replace(/[一二三四五六七八九十0-9]+樓(?:之?[一二三四五六七八九十0-9]+)?$/u, '');
  if (withoutFloor !== address) values.push(withoutFloor);
  const withoutUnit = withoutFloor.replace(/號之[一二三四五六七八九十0-9]+$/u, '號');
  if (!values.includes(withoutUnit)) values.push(withoutUnit);
  const withoutHouseNumber = withoutUnit.replace(/[0-9一二三四五六七八九十]+(?:之[0-9一二三四五六七八九十]+)?號.*$/u, '');
  if (withoutHouseNumber.length >= 6 && !values.includes(withoutHouseNumber)) values.push(withoutHouseNumber);
  return values;
}

function incompleteAddress(address) {
  return /^桃園市中壢區\d+號$/u.test(address);
}

const sleep = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));
const cachePath = resolve('db/rental-geocode-cache.json');
const outputPath = resolve('db/rental-seeds.generated.ts');
const migrationPath = resolve('drizzle/0005_seed_government_rentals.sql');
const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, 'utf8')) : {};

async function geocode(address) {
  const fixedCoordinate = fixedAbsoluteCoordinate(address);
  if (fixedCoordinate) return fixedCoordinate;
  if (incompleteAddress(address)) {
    cache[address] ??= { latitude: null, longitude: null, coordinateSource: null, coordinatesVerified: false };
    return cache[address];
  }
  if (cache[address]?.latitude) return cache[address];

  for (const query of fallbackAddresses(address)) {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.search = new URLSearchParams({ q: query, format: 'jsonv2', countrycodes: 'tw', limit: '1' }).toString();
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CampusNestTaiwanSeed/1.0 (contact: sjehd363960@gmail.com)',
        'Accept-Language': 'zh-TW,zh;q=0.9',
      },
    });
    if (!response.ok) throw new Error(`Geocoder returned ${response.status} for ${query}`);
    const rows = await response.json();
    if (rows[0]) {
      cache[address] = {
        latitude: Number(rows[0].lat),
        longitude: Number(rows[0].lon),
        coordinateSource: 'nominatim',
        coordinatesVerified: query === address,
      };
      writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
      await sleep(1100);
      return cache[address];
    }
    await sleep(1100);
  }

  cache[address] = { latitude: null, longitude: null, coordinateSource: null, coordinatesVerified: false };
  writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
  return cache[address];
}

const byAddress = new Map();
for (const [universityId, rows] of Object.entries(groups)) {
  for (const [address, referenceRent] of rows) {
    const normalizedAddress = normalizeAddress(address);
    const existing = byAddress.get(normalizedAddress);
    if (existing) {
      existing.universityIds.push(universityId);
      continue;
    }
    byAddress.set(normalizedAddress, {
      id: `gov-${createHash('sha256').update(normalizedAddress).digest('hex').slice(0, 16)}`,
      primaryUniversityId: universityId,
      universityIds: [universityId],
      address,
      normalizedAddress,
      referenceRent,
    });
  }
}

const locations = [];
for (const item of byAddress.values()) {
  const coordinates = await geocode(item.address);
  locations.push({ ...item, ...coordinates });
  console.log(`${locations.length}/${byAddress.size} ${item.address} → ${coordinates.latitude ?? '待確認'}, ${coordinates.longitude ?? '待確認'}`);
}

const output = `export type RentalSeed = {
  id: string;
  primaryUniversityId: string;
  universityIds: string[];
  address: string;
  normalizedAddress: string;
  latitude: number | null;
  longitude: number | null;
  source: 'government';
  referenceRent: number | null;
  referenceRentSource: 'government';
  coordinateSource: 'nominatim' | 'fixed_absolute_estimate' | null;
  coordinatesVerified: boolean;
};

export const rentalSeeds: RentalSeed[] = ${JSON.stringify(locations.map((item) => ({
  ...item,
  source: 'government',
  referenceRentSource: 'government',
})), null, 2)};
`;

writeFileSync(outputPath, output);
const sqlString = (value) => value === null ? 'NULL' : `'${String(value).replaceAll("'", "''")}'`;
const sqlNumber = (value) => value === null ? 'NULL' : String(value);
const seedTime = '2026-08-26T00:00:00.000Z';
const migration = [
  ...locations.flatMap((item) => {
    const location = `INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  ${sqlString(item.id)}, ${sqlString(item.primaryUniversityId)}, ${sqlString(item.address)},
  ${sqlString(item.normalizedAddress)}, ${sqlNumber(item.latitude)}, ${sqlNumber(item.longitude)},
  'government', ${sqlNumber(item.referenceRent)}, 'government', ${sqlString(item.coordinateSource)},
  ${item.coordinatesVerified ? 1 : 0}, NULL, '${seedTime}', '${seedTime}'
) ON CONFLICT(normalized_address) DO UPDATE SET
  reference_rent = excluded.reference_rent,
  reference_rent_source = excluded.reference_rent_source,
  latitude = COALESCE(rental_locations.latitude, excluded.latitude),
  longitude = COALESCE(rental_locations.longitude, excluded.longitude),
  coordinate_source = COALESCE(rental_locations.coordinate_source, excluded.coordinate_source),
  updated_at = excluded.updated_at;`;
    const associations = item.universityIds.map((universityId) => `INSERT INTO rental_location_universities
  (rental_location_id, university_id, created_at)
SELECT id, ${sqlString(universityId)}, '${seedTime}' FROM rental_locations
WHERE normalized_address = ${sqlString(item.normalizedAddress)}
ON CONFLICT(rental_location_id, university_id) DO NOTHING;`);
    return [location, ...associations];
  }),
  `INSERT INTO rental_locations (
  id, university_id, address, normalized_address, latitude, longitude, source,
  reference_rent, reference_rent_source, coordinate_source, coordinates_verified,
  created_by_user_id, created_at, updated_at
) VALUES (
  'admin-niu-yizhong-82', 'niu', '260 宜蘭縣宜蘭市思源里宜中路82號',
  '260宜蘭縣宜蘭市思源里宜中路82號', 24.74692, 121.74265, 'admin',
  NULL, NULL, 'admin', 0, NULL, '${seedTime}', '${seedTime}'
) ON CONFLICT(normalized_address) DO NOTHING;`,
  `INSERT INTO rental_location_universities (rental_location_id, university_id, created_at)
SELECT id, 'niu', '${seedTime}' FROM rental_locations
WHERE normalized_address = '260宜蘭縣宜蘭市思源里宜中路82號'
ON CONFLICT(rental_location_id, university_id) DO NOTHING;`,
  'PRAGMA optimize;',
].join('\n--> statement-breakpoint\n');
writeFileSync(migrationPath, `${migration}\n`);
writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
console.log(`Wrote ${locations.length} unique rental locations and ${Object.values(groups).flat().length} university associations to TypeScript and SQL seed files.`);
