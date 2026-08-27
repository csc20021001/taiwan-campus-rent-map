import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { rentalCampuses, universities } from '../app/data.ts';
import { currentGovernmentRentalSeeds } from '../db/current-government-rental-seeds.ts';

const rentalDbSource = readFileSync(new URL('../db/rentals.ts', import.meta.url), 'utf8');

test('NYCU remains one professor school and becomes two rental campuses', () => {
  assert.equal(universities.filter((school) => school.id.startsWith('nycu')).length, 1);
  assert.deepEqual(
    rentalCampuses.filter((school) => school.id.startsWith('nycu')).map((school) => school.shortName),
    ['交大校區', '陽明校區'],
  );
  assert.equal(new Set(rentalCampuses.map((school) => school.id)).size, rentalCampuses.length);
});

test('current listings use only the Ministry of Education public rental platform', () => {
  assert.ok(currentGovernmentRentalSeeds.length >= 3);
  for (const rental of currentGovernmentRentalSeeds) {
    assert.match(rental.referenceRentSource, /^教育部雲端租屋生活網｜https:\/\/house\.nfu\.edu\.tw\//);
    assert.doesNotMatch(rental.referenceRentSource, /591|樂屋|rakuya|rent\.591/i);
    assert.ok(rental.latitude >= 21.8 && rental.latitude <= 25.5);
    assert.ok(rental.longitude >= 119.3 && rental.longitude <= 122.1);
  }
});

test('newly created rental locations are sorted first', () => {
  assert.match(rentalDbSource, /ORDER BY l\.created_at DESC/);
});
