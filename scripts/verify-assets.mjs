/**
 * The build gate.
 *
 * Every stop must resolve to either a real photo pair on disk or a deliberate
 * fallback. A missing image should break the build here, not turn up as a grey
 * box at Jvari Pass with no signal to fix it.
 *
 * Also checks elevations, coordinate sanity, and internal consistency.
 * Exits non-zero on any error. Run: npm run data:verify
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { DAYS } from '../src/data/itinerary.ts';

const PHOTOS = 'public/photos';
const errors = [], warnings = [];

const exists = async p => !!(await fs.stat(p).catch(() => null));
const size = async p => (await fs.stat(p).catch(() => ({ size: 0 }))).size;

const elevations = JSON.parse(await fs.readFile('src/data/elevations.json', 'utf8').catch(() => '{}'));
const credits = JSON.parse(await fs.readFile('src/data/photo-credits.json', 'utf8').catch(() => '{}'));

const stops = DAYS.flatMap(d => d.stops.map(s => ({ day: d.n, ...s })));
const ids = new Set(stops.map(s => s.id));

/* ── ids are unique ── */
const seen = new Set();
for (const s of stops) {
  if (seen.has(s.id)) errors.push(`duplicate stop id: ${s.id}`);
  seen.add(s.id);
}

/* ── every stop resolves to a photo, an alias, or a stated fallback ── */
let withPhoto = 0, withAlias = 0, withFallback = 0, photoBytes = 0;
for (const s of stops) {
  if (s.photoAlias) {
    withAlias++;
    if (!ids.has(s.photoAlias)) errors.push(`${s.id}: photoAlias points at unknown stop "${s.photoAlias}"`);
    else if (!await exists(path.join(PHOTOS, s.photoAlias + '.webp')))
      errors.push(`${s.id}: aliases "${s.photoAlias}" but that stop has no photo on disk`);
    continue;
  }

  const full = path.join(PHOTOS, s.id + '.webp');
  const card = path.join(PHOTOS, s.id + '-card.webp');
  const hasFull = await exists(full), hasCard = await exists(card);

  if (hasFull && hasCard) {
    withPhoto++;
    photoBytes += await size(full);
    photoBytes += await size(card);
    if (!credits[s.id]) errors.push(`${s.id}: photo on disk but NO CREDIT — CC BY/BY-SA require attribution`);
    else {
      const c = credits[s.id];
      if (!c.artist || c.artist === 'Unknown') warnings.push(`${s.id}: credit has no named author`);
      if (!c.license) errors.push(`${s.id}: credit has no licence`);
    }
  } else if (hasFull !== hasCard) {
    errors.push(`${s.id}: only one photo tier present (full=${hasFull} card=${hasCard})`);
  } else if (s.photoNote) {
    withFallback++;
  } else {
    errors.push(`${s.id}: no photo, no alias, and no photoNote explaining why`);
  }
}

/* ── no orphan files ── */
const onDisk = (await fs.readdir(PHOTOS).catch(() => [])).filter(f => f.endsWith('.webp'));
for (const f of onDisk) {
  const id = f.replace(/-card\.webp$|\.webp$/, '');
  if (!ids.has(id)) warnings.push(`orphan file not referenced by any stop: ${f}`);
}

/* ── elevations present and plausible ── */
for (const s of stops) {
  const m = elevations[s.id];
  if (m === undefined) errors.push(`${s.id}: no elevation — run npm run data:elevation`);
  else if (m < -50 || m > 5200) errors.push(`${s.id}: implausible elevation ${m} m`);
}

/* ── coordinates inside Georgia's bounding box ── */
for (const s of stops) {
  if (s.lat < 41.0 || s.lat > 43.6 || s.lon < 39.9 || s.lon > 46.8)
    errors.push(`${s.id}: coordinate ${s.lat},${s.lon} is outside Georgia`);
}

/* ── content completeness ── */
for (const s of stops) {
  if (!s.blurb?.length) errors.push(`${s.id}: no blurb`);
  if (!s.food?.length && !s.foodNote) warnings.push(`${s.id}: no food picks and no foodNote`);
  for (const f of s.food || []) if (!f.source) errors.push(`${s.id}: food "${f.name}" has no source`);
  if (s.needsVerify) warnings.push(`${s.id}: coordinate still flagged needsVerify`);
}

/* ── days are complete and in order ── */
DAYS.forEach((d, i) => {
  if (d.n !== i + 1) errors.push(`day ${d.n} is out of order at index ${i}`);
  if (!d.stops.length) errors.push(`day ${d.n} has no stops`);
  if (!d.sub) errors.push(`day ${d.n} has no summary`);
});

/* ── report ── */
const mb = n => (n / 1048576).toFixed(2) + ' MB';
console.log('days            :', DAYS.length);
console.log('stops           :', stops.length);
console.log('with photo      :', withPhoto);
console.log('aliased         :', withAlias);
console.log('icon fallback   :', withFallback);
console.log('photo budget    :', mb(photoBytes));
console.log('food picks      :', stops.reduce((a, s) => a + (s.food?.length || 0), 0));
console.log('credited images :', Object.keys(credits).length);

if (warnings.length) {
  console.log('\nWARNINGS (' + warnings.length + ')');
  for (const w of warnings) console.log('  ! ' + w);
}
if (errors.length) {
  console.log('\nERRORS (' + errors.length + ')');
  for (const e of errors) console.log('  x ' + e);
  console.log('\nFAILED');
  process.exit(1);
}
console.log('\nAll checks passed.');
