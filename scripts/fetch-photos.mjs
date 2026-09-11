/**
 * Build-time photo pipeline.
 *
 * Nothing is fetched from Wikimedia at runtime — the app must work with the
 * radio off. This downloads once, compresses, and writes files that get
 * committed, served by Vercel as static assets, and precached by the SW.
 *
 * For each stop:
 *   - use its pinned `photos[].commons` file, or search Commons for `photoQuery`
 *   - read author + licence from the API (CC BY / BY-SA require attribution)
 *   - download a 1600px render, never the original (some are 16 MB)
 *   - emit  <id>.webp      1000px q68  — expanded stop view
 *           <id>-card.webp  480x300 q72 — rail thumbnail
 *   - record credits in public/photos/credits.json
 *
 * Stops with no usable result are listed at the end; those render the
 * illustrated icon fallback rather than a broken frame.
 *
 * Run: npm run data:photos        (add --force to re-download everything)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { DAYS } from '../src/data/itinerary.ts';

const OUT = 'public/photos';
const UA = 'GeorgiaTripCompanion/0.1 (personal offline travel PWA; build-time fetch)';
const FORCE = process.argv.includes('--force');

const FULL = { width: 1000, quality: 68 };
const CARD = { width: 480, height: 300, quality: 72 };

const sleep = ms => new Promise(r => setTimeout(r, ms));
const strip = h => String(h || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const exists = async p => !!(await fs.stat(p).catch(() => null));

/** Reject maps, diagrams, coats of arms, and other non-photographic results. */
const BAD = /\b(map|karte|coat of arms|flag|logo|diagram|plan|seal|stamp|banner|icon|location|locator)\b/i;

/**
 * Commons rate-limits hard (HTTP 429) and answers with plain text, not JSON,
 * when it does. Back off and retry rather than silently losing the stop.
 */
async function politeFetch(url, tries = 6) {
  for (let i = 0; i < tries; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (r.status === 429 || r.status === 503) {
      const wait = Math.max(+(r.headers.get('retry-after') || 0) * 1000, 2000 * 2 ** i);
      console.log('        rate-limited, waiting ' + (wait / 1000).toFixed(0) + 's…');
      await sleep(wait);
      continue;
    }
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r;
  }
  throw new Error('gave up after ' + tries + ' attempts (rate limited)');
}

async function api(params) {
  const u = new URL('https://commons.wikimedia.org/w/api.php');
  u.search = new URLSearchParams({ format: 'json', ...params });
  return (await politeFetch(u)).json();
}

/** Top photographic match for a free-text query. */
async function search(q) {
  const j = await api({
    action: 'query', generator: 'search', gsrnamespace: '6', gsrlimit: '8',
    gsrsearch: 'filetype:bitmap ' + q, prop: 'imageinfo',
    iiprop: 'url|extmetadata|size',
  });
  const pages = Object.values(j.query?.pages || {});
  // generator results come back unordered; restore relevance order
  pages.sort((a, b) => (a.index ?? 99) - (b.index ?? 99));
  for (const p of pages) {
    const name = p.title.replace(/^File:/, '');
    if (BAD.test(name)) continue;
    const ii = p.imageinfo?.[0];
    if (!ii || ii.width < 900) continue;
    return { name, ii };
  }
  return null;
}

/** Metadata for one known file name. */
async function byName(name) {
  const j = await api({
    action: 'query', titles: 'File:' + name, prop: 'imageinfo',
    iiprop: 'url|extmetadata|size',
  });
  const p = Object.values(j.query?.pages || {})[0];
  return p?.imageinfo?.[0] ? { name, ii: p.imageinfo[0] } : null;
}

function credit(ii) {
  const md = ii.extmetadata || {};
  return {
    artist: strip(md.Artist?.value) || 'Unknown',
    license: strip(md.LicenseShortName?.value) || 'see Commons',
    licenseUrl: strip(md.LicenseUrl?.value) || '',
    sourceUrl: ii.descriptionurl || '',
  };
}

await fs.mkdir(OUT, { recursive: true });
const creditsPath = 'src/data/photo-credits.json';
const credits = JSON.parse(await fs.readFile(creditsPath, 'utf8').catch(() => '{}'));

const stops = DAYS.flatMap(d => d.stops.map(s => ({ day: d.n, ...s })));
const missing = [], skipped = [], aliased = [];
let bytesFull = 0, bytesCard = 0, fetched = 0;

for (const s of stops) {
  const fullPath = path.join(OUT, s.id + '.webp');
  const cardPath = path.join(OUT, s.id + '-card.webp');

  if (s.photoAlias) { aliased.push(s.id); continue; }
  if (s.photoNote && !s.photos?.length && !s.photoQuery) { skipped.push(s.id); continue; }

  if (!FORCE && await exists(fullPath) && await exists(cardPath) && credits[s.id]) {
    const st = await fs.stat(fullPath);
    bytesFull += st.size;
    bytesCard += (await fs.stat(cardPath)).size;
    console.log('  cached  ' + String(s.day) + ' ' + s.id);
    continue;
  }

  let hit = null;
  try {
    hit = s.photos?.[0]?.commons ? await byName(s.photos[0].commons)
        : s.photoQuery ? await search(s.photoQuery)
        : null;
  } catch (e) {
    console.log('  ERROR   ' + s.id + ' — ' + e.message);
  }
  await sleep(1200); // Commons rate-limits aggressively

  if (!hit) { missing.push(s.id); console.log('  MISSING ' + String(s.day) + ' ' + s.id); continue; }

  const src = 'https://commons.wikimedia.org/wiki/Special:FilePath/'
            + encodeURIComponent(hit.name) + '?width=1600';
  let buf;
  try { buf = Buffer.from(await (await politeFetch(src)).arrayBuffer()); }
  catch (e) { missing.push(s.id); console.log('  DL FAIL ' + s.id + ' — ' + e.message); continue; }

  const full = await sharp(buf).resize(FULL.width, null, { withoutEnlargement: true })
    .webp({ quality: FULL.quality }).toBuffer();
  const card = await sharp(buf).resize(CARD.width, CARD.height, { fit: 'cover', position: 'attention' })
    .webp({ quality: CARD.quality }).toBuffer();

  await fs.writeFile(fullPath, full);
  await fs.writeFile(cardPath, card);
  credits[s.id] = { commons: hit.name, ...credit(hit.ii) };
  bytesFull += full.length; bytesCard += card.length; fetched++;

  console.log('  ok      ' + String(s.day) + ' ' + s.id.padEnd(26)
    + (full.length / 1024).toFixed(0).padStart(4) + 'K +'
    + (card.length / 1024).toFixed(0).padStart(3) + 'K  ' + credits[s.id].license);
  await sleep(600);
}

await fs.writeFile(creditsPath, JSON.stringify(credits, null, 2) + '\n');

const mb = n => (n / 1048576).toFixed(2) + ' MB';
console.log('\n' + '─'.repeat(66));
console.log('downloaded this run :', fetched);
console.log('full  (1000px q68)  :', mb(bytesFull));
console.log('card  (480px  q72)  :', mb(bytesCard));
console.log('TOTAL PHOTO BUDGET  :', mb(bytesFull + bytesCard));
console.log('credits written     :', Object.keys(credits).length, 'entries →', creditsPath);
if (aliased.length) console.log('\nreusing another stop’s photo (' + aliased.length + '): ' + aliased.join(', '));
if (skipped.length) console.log('\ndeliberate fallbacks (' + skipped.length + '):', skipped.join(', '));
if (missing.length) {
  console.log('\nNO PHOTO FOUND (' + missing.length + ') — pin a file by hand or leave the icon fallback:');
  for (const id of missing) console.log('  ' + id);
}
