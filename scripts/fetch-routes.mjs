/**
 * Bake real road geometry for each day's drive.
 *
 * Straight lines between stops would be a lie on the Georgian Military
 * Highway — the road switchbacks hard through Gudauri, and a straight line
 * from Pasanauri to the Friendship Monument crosses a mountain.
 *
 * Routed once here against the public OSRM demo server and written to
 * src/data/routes.geojson. No runtime routing dependency: on the road the
 * line is already in the bundle.
 *
 * Walking days (1, 2, 9) get straight connectors instead — OSRM's car profile
 * would send you round one-way systems you will be crossing on foot.
 *
 * Run: npm run data:routes
 */
import fs from 'node:fs/promises';
import { DAYS } from '../src/data/itinerary.ts';

const OUT = 'src/data/routes.json';
const OSRM = 'https://router.project-osrm.org/route/v1/driving/';
const WALKING_DAYS = new Set([1, 2, 9]);

const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Ramer–Douglas–Peucker. OSRM returns metre-level precision; at the zooms a
 * phone actually draws this, ~10 m is invisible and costs a third of the file.
 */
const TOLERANCE = 0.00009; // degrees, roughly 10 m at this latitude

function perpDist(p, a, b) {
  let x = a[0], y = a[1], dx = b[0] - x, dy = b[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) { x = b[0]; y = b[1]; }
    else if (t > 0) { x += dx * t; y += dy * t; }
  }
  return Math.hypot(p[0] - x, p[1] - y);
}

function simplify(pts, tol = TOLERANCE) {
  if (pts.length < 3) return pts;
  let maxD = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpDist(pts[i], pts[0], pts[pts.length - 1]);
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD <= tol) return [pts[0], pts[pts.length - 1]];
  return [
    ...simplify(pts.slice(0, idx + 1), tol).slice(0, -1),
    ...simplify(pts.slice(idx), tol),
  ];
}

/** Trim coordinates to 5 decimals — ~1 m, well past what the map renders. */
const round5 = pts => pts.map(c => [+c[0].toFixed(5), +c[1].toFixed(5)]);

async function route(coords) {
  const path = coords.map(c => `${c[0]},${c[1]}`).join(';');
  const url = `${OSRM}${path}?overview=full&geometries=geojson&continue_straight=false`;
  const r = await fetch(url, { headers: { 'User-Agent': 'GeorgiaTripCompanion/0.1' } });
  if (!r.ok) throw new Error('OSRM HTTP ' + r.status);
  const j = await r.json();
  if (j.code !== 'Ok') throw new Error('OSRM ' + j.code);
  return j.routes[0];
}

const features = [];
for (const day of DAYS) {
  // one point per stop, de-duplicated so a hotel and its dinner don't confuse OSRM
  const pts = [];
  for (const s of day.stops) {
    const last = pts[pts.length - 1];
    if (!last || Math.abs(last[0] - s.lon) > 1e-4 || Math.abs(last[1] - s.lat) > 1e-4) {
      pts.push([s.lon, s.lat]);
    }
  }
  if (pts.length < 2) { console.log('  day ' + day.n + ': single point, skipped'); continue; }

  if (WALKING_DAYS.has(day.n)) {
    features.push({
      type: 'Feature',
      properties: { day: day.n, mode: 'walk', from: day.from, to: day.to },
      geometry: { type: 'LineString', coordinates: pts },
    });
    console.log('  day ' + day.n + ': straight connectors (' + pts.length + ' pts, walking day)');
    continue;
  }

  try {
    const r = await route(pts);
    const raw = r.geometry.coordinates;
    const thin = round5(simplify(raw));
    features.push({
      type: 'Feature',
      properties: {
        day: day.n, mode: 'drive', from: day.from, to: day.to,
        km: +(r.distance / 1000).toFixed(1),
        mins: Math.round(r.duration / 60),
      },
      geometry: { type: 'LineString', coordinates: thin },
    });
    const stated = day.distanceKm;
    console.log(
      '  day ' + day.n + ': ' + String(raw.length).padStart(5) + ' → ' +
      String(thin.length).padStart(4) + ' pts  ' +
      (r.distance / 1000).toFixed(0).padStart(4) + ' km  ' +
      Math.round(r.duration / 60).toString().padStart(4) + ' min' +
      (stated ? '   (itinerary says ' + stated + ' km)' : '')
    );
  } catch (e) {
    console.log('  day ' + day.n + ': FAILED — ' + e.message);
  }
  await sleep(1200);
}

const fc = { type: 'FeatureCollection', features };
await fs.writeFile(OUT, JSON.stringify(fc) + '\n');

const pts = features.reduce((a, f) => a + f.geometry.coordinates.length, 0);
const km = features.reduce((a, f) => a + (f.properties.km || 0), 0);
const bytes = (await fs.stat(OUT)).size;
console.log('\n' + '─'.repeat(58));
console.log('features   :', features.length + ' of ' + DAYS.length + ' days');
console.log('points     :', pts.toLocaleString('en-US'));
console.log('driven     :', km.toFixed(0) + ' km');
console.log('written    :', OUT, '(' + (bytes / 1024).toFixed(0) + ' KB)');
