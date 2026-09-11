/**
 * Bundle MapLibre SDF glyph ranges so map labels render offline.
 *
 * Without these the basemap draws roads and water but no place names — which
 * is exactly the information you need when you are lost. They are fetched once
 * and committed, like everything else the app needs on the road.
 *
 * The Georgian block matters: plenty of villages on this route carry only a
 * Georgian-script name in OSM, so without 4096-4351 they render as boxes.
 *
 * Run: npm run data:glyphs
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://protomaps.github.io/basemaps-assets/fonts';
const STACK = 'Noto Sans Regular';
const OUT = path.join('public/fonts/glyphs', STACK);

const RANGES = [
  ['0-255', 'basic latin'],
  ['256-511', 'latin extended — accented names'],
  ['512-767', 'latin extended B'],
  ['4096-4351', 'GEORGIAN — village names in OSM'],
  ['8192-8447', 'punctuation, dashes, currency'],
];

await fs.mkdir(OUT, { recursive: true });
let total = 0;

for (const [range, why] of RANGES) {
  const url = `${BASE}/${encodeURIComponent(STACK)}/${range}.pbf`;
  const r = await fetch(url);
  if (!r.ok) { console.log('  FAIL   ' + range + ' — HTTP ' + r.status); continue; }
  const buf = Buffer.from(await r.arrayBuffer());
  await fs.writeFile(path.join(OUT, range + '.pbf'), buf);
  total += buf.length;
  console.log('  ok     ' + range.padEnd(10) + (buf.length / 1024).toFixed(0).padStart(4) + ' KB   ' + why);
}

console.log('\nstack  :', STACK);
console.log('written:', OUT);
console.log('total  :', (total / 1024).toFixed(0) + ' KB');
