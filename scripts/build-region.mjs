/**
 * Build the area-of-interest polygon for the offline basemap extract.
 *
 * Vercel refuses any single file over 100 MB, and a maxzoom-14 extract of
 * Georgia's whole bounding box lands around 110 MB — most of it Turkey,
 * Armenia, Azerbaijan, Russia and the Black Sea, none of which we enter.
 *
 * So instead of dropping to zoom 13 and losing street detail everywhere,
 * clip to where we actually go: a corridor around each day's routed line,
 * widened into a disc around each town we sleep or walk in.
 *
 * Emits a MultiPolygon for `pmtiles extract --region`.
 * Run: npm run data:region
 */
import fs from 'node:fs/promises';
import { DAYS } from '../src/data/itinerary.ts';

const OUT = 'build/region.geojson';

/** Corridor half-width around a drive, km. Covers detours and wrong turns. */
const ROAD_KM = 9;
/** Radius around a town stop, km. Wider — this is where we walk. */
const TOWN_KM = 14;
/** Sample the route this often, km. Closer than the radius so discs overlap. */
const STEP_KM = 6;

const KM_PER_DEG_LAT = 111.32;
const kmPerDegLon = lat => 111.32 * Math.cos((lat * Math.PI) / 180);

/** A circle as a 14-gon in degrees — plenty for a clipping region. */
function disc(lon, lat, km, sides = 14) {
  const ring = [];
  for (let i = 0; i <= sides; i++) {
    const t = (i / sides) * 2 * Math.PI;
    ring.push([
      +(lon + (km / kmPerDegLon(lat)) * Math.cos(t)).toFixed(5),
      +(lat + (km / KM_PER_DEG_LAT) * Math.sin(t)).toFixed(5),
    ]);
  }
  return [ring];
}

function haversine(aLon, aLat, bLon, bLat) {
  const R = 6371, rad = x => (x * Math.PI) / 180;
  const dLat = rad(bLat - aLat), dLon = rad(bLon - aLon);
  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const routes = JSON.parse(await fs.readFile('src/data/routes.json', 'utf8'));
const polys = [];

/* Corridor along each day's line, sampled so the discs chain together. */
for (const f of routes.features) {
  const cs = f.geometry.coordinates;
  let since = Infinity;
  for (let i = 0; i < cs.length; i++) {
    if (i > 0) since += haversine(cs[i - 1][0], cs[i - 1][1], cs[i][0], cs[i][1]);
    if (since >= STEP_KM || i === 0 || i === cs.length - 1) {
      polys.push(disc(cs[i][0], cs[i][1], ROAD_KM));
      since = 0;
    }
  }
}
const corridorCount = polys.length;

/* Wider discs where we are on foot rather than driving through. */
const WALKABLE = new Set(['bed', 'city', 'market', 'spa', 'cablecar', 'khinkali']);
let townCount = 0;
for (const day of DAYS) {
  for (const s of day.stops) {
    if (!WALKABLE.has(s.kind)) continue;
    polys.push(disc(s.lon, s.lat, TOWN_KM));
    townCount++;
  }
}

const fc = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: { name: 'Georgia trip corridor' },
    geometry: { type: 'MultiPolygon', coordinates: polys },
  }],
};

await fs.mkdir('build', { recursive: true });
await fs.writeFile(OUT, JSON.stringify(fc) + '\n');

/* Report the bounding box so the result can be sanity-checked. */
let minLon = 180, minLat = 90, maxLon = -180, maxLat = -90;
for (const p of polys) for (const c of p[0]) {
  minLon = Math.min(minLon, c[0]); maxLon = Math.max(maxLon, c[0]);
  minLat = Math.min(minLat, c[1]); maxLat = Math.max(maxLat, c[1]);
}
const bytes = (await fs.stat(OUT)).size;
console.log('corridor discs :', corridorCount, `(${ROAD_KM} km half-width, every ${STEP_KM} km)`);
console.log('town discs     :', townCount, `(${TOWN_KM} km radius)`);
console.log('total polygons :', polys.length);
console.log('bbox           :', [minLon, minLat, maxLon, maxLat].map(n => n.toFixed(2)).join(','));
console.log('written        :', OUT, '(' + (bytes / 1024).toFixed(0) + ' KB)');
