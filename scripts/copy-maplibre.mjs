/**
 * Stage MapLibre as a plain static script instead of bundling it.
 *
 * Why: MapLibre does its vector-tile and GeoJSON parsing in a web worker.
 * Bundled through Vite 8 / rolldown, that worker never responds — sources stay
 * unloaded forever, no tiles are requested, `idle` never fires, and the map
 * renders nothing at all with no error. Loaded as its own UMD script the same
 * version works correctly (verified side by side).
 *
 * This also keeps ~800 KB out of the app bundle and makes MapLibre an ordinary
 * file the service worker can precache for offline use.
 *
 * Run: npm run data:maplibre  (wired into the build)
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const SRC = 'node_modules/maplibre-gl/dist';
const OUT = 'public/maplibre';
const FILES = ['maplibre-gl.js', 'maplibre-gl.css'];

await fs.mkdir(OUT, { recursive: true });

let total = 0;
for (const f of FILES) {
  const buf = await fs.readFile(path.join(SRC, f));
  await fs.writeFile(path.join(OUT, f), buf);
  total += buf.length;
  console.log('  ' + f.padEnd(22) + (buf.length / 1024).toFixed(0).padStart(5) + ' KB');
}

const version = JSON.parse(await fs.readFile('node_modules/maplibre-gl/package.json', 'utf8')).version;
await fs.writeFile(path.join(OUT, 'VERSION'), version + '\n');

console.log('\nmaplibre-gl :', version);
console.log('staged      :', OUT, '(' + (total / 1024).toFixed(0) + ' KB)');
console.log('note        : re-run after upgrading maplibre-gl');
