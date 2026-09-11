/**
 * Bake ground elevation for every stop.
 *
 * Altitude is static, so it belongs in the bundle rather than behind a network
 * call — it is the one "environmental" number that is always available offline,
 * and on this trip it matters (450 m in Tbilisi, 2,395 m at Jvari Pass).
 *
 * Source: Open-Meteo elevation API, 90 m SRTM/Copernicus digital elevation
 * model. No API key. Writes src/data/elevations.json keyed by stop id.
 *
 * Run: npm run data:elevation
 */
import fs from 'node:fs/promises';
import { DAYS } from '../src/data/itinerary.ts';

const OUT = 'src/data/elevations.json';
const CHUNK = 90; // API accepts up to 100 coordinate pairs per request

const stops = DAYS.flatMap(d => d.stops.map(s => ({ day: d.n, ...s })));
const out = {};

for (let i = 0; i < stops.length; i += CHUNK) {
  const batch = stops.slice(i, i + CHUNK);
  const u = new URL('https://api.open-meteo.com/v1/elevation');
  u.search = new URLSearchParams({
    latitude: batch.map(s => s.lat).join(','),
    longitude: batch.map(s => s.lon).join(','),
  });
  const r = await fetch(u);
  if (!r.ok) throw new Error('Open-Meteo elevation HTTP ' + r.status);
  const j = await r.json();
  batch.forEach((s, k) => { out[s.id] = Math.round(j.elevation[k]); });
}

await fs.writeFile(OUT, JSON.stringify(out, null, 2) + '\n');

/* Report, so the numbers get eyeballed rather than trusted blindly. */
console.log('elevation (m), in trip order\n');
let prevDay = 0;
for (const s of stops) {
  if (s.day !== prevDay) { console.log('  ── Day ' + s.day); prevDay = s.day; }
  const m = out[s.id];
  const bar = '█'.repeat(Math.max(0, Math.round(m / 90)));
  console.log('     ' + String(m).padStart(5) + '  ' + s.id.padEnd(26) + bar);
}

const vals = Object.values(out);
const peakId = Object.keys(out).find(k => out[k] === Math.max(...vals));
const lowId = Object.keys(out).find(k => out[k] === Math.min(...vals));
console.log('\n' + '─'.repeat(60));
console.log('highest:', Math.max(...vals) + ' m', '(' + peakId + ')');
console.log('lowest :', Math.min(...vals) + ' m', '(' + lowId + ')');
console.log('written:', OUT, '—', Object.keys(out).length, 'stops');
