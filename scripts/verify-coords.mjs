/**
 * Check every hand-entered coordinate against OpenStreetMap.
 *
 * A wrong coordinate is the most damaging error in this app — it sends you
 * down the wrong valley with no signal. This resolves each named place via
 * Nominatim and reports how far our stored point is from OSM's.
 *
 * Nominatim asks for <=1 request/second and a real User-Agent. Both honoured.
 * Run: npm run data:coords
 */
import { DAYS } from '../src/data/itinerary.ts';

const UA = 'GeorgiaTripCompanion/0.1 (personal offline travel PWA; coordinate QA)';

/** Stops with no findable name on OSM — practical waypoints, not places. */
const SKIP = new Set([
  'depart-tbilisi', 'drive-to-martvili', 'drive-back-tbilisi', 'refuel',
  'return-rental', 'depart-kakheti', 'breakfast-checkout', 'monastery-blitz',
  'vera-lunch', 'farewell-dinner', 'metekhi-dinner', 'borjomi-dinner',
  'borjomi-lunch', 'martvili-lunch', 'akhaltsikhe-lunch', 'wineries',
  'return-tbilisi-kakheti', 'gori-checkin', 'kutaisi-checkin', 'borjomi-checkin',
  'kazbegi-checkin', 'tbs-arrival',
]);

/** Better search strings where the display title is ambiguous. */
const QUERY = {
  'sameba-cathedral': 'Holy Trinity Cathedral of Tbilisi',
  'rike-park': 'Rike Park, Tbilisi',
  'narikala': 'Narikala, Tbilisi',
  'abanotubani': 'Abanotubani, Tbilisi',
  'bridge-of-peace': 'Bridge of Peace, Tbilisi',
  'clock-tower': 'Gabriadze Clock Tower, Tbilisi',
  'freedom-square': 'Freedom Square, Tbilisi',
  'dry-bridge': 'Dry Bridge Market, Tbilisi',
  'mtatsminda': 'Mtatsminda Funicular, Tbilisi',
  'chronicles-of-georgia': 'Chronicle of Georgia, Tbilisi',
  'ananuri-fortress': 'Ananuri, Georgia',
  'pasanauri': 'Pasanauri, Georgia',
  'aragvi-confluence': 'Pasanauri, Mtskheta-Mtianeti, Georgia',
  'friendship-monument': 'Russia-Georgia Friendship Monument, Gudauri',
  'jvari-pass-springs': 'Jvari Pass, Georgia',
  'gergeti-trinity': 'Gergeti Trinity Church, Georgia',
  'sno-stone-heads': 'Sno, Kazbegi Municipality, Georgia',
  'jvari-monastery': 'Jvari Monastery, Mtskheta',
  'svetitskhoveli': 'Svetitskhoveli Cathedral, Mtskheta',
  'salobie-lunch': 'Salobie, Mtskheta, Georgia',
  'uplistsikhe': 'Uplistsikhe, Georgia',
  'gori-fortress': 'Gori Fortress, Georgia',
  'stalin-museum': 'Joseph Stalin Museum, Gori',
  'martvili-canyon': 'Martvili Canyon, Georgia',
  'prometheus-cave': 'Prometheus Cave, Kumistavi, Georgia',
  'motsameta': 'Motsameta Monastery, Georgia',
  'gelati': 'Gelati Monastery, Georgia',
  'bagrati': 'Bagrati Cathedral, Kutaisi',
  'white-bridge': 'Colchis Fountain, Kutaisi',
  'khertvisi': 'Khertvisi Fortress, Georgia',
  'vardzia': 'Vardzia, Georgia',
  'rabati-castle': 'Rabati Castle, Akhaltsikhe',
  'borjomi-sulfur-pools': 'Borjomi Central Park, Georgia',
  'green-monastery': 'Green Monastery, Chitakhevi, Georgia',
  'borjomi-spring': 'Borjomi Central Park, Georgia',
  'borjomi-cable-car': 'Borjomi cable car, Georgia',
  'bodbe': 'Bodbe Monastery, Georgia',
  'sighnaghi': 'Sighnaghi, Georgia',
  'tbs-departure': 'Tbilisi International Airport',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Great-circle distance in km. */
function haversine(a, b, c, d) {
  const R = 6371, rad = x => x * Math.PI / 180;
  const dLat = rad(c - a), dLon = rad(d - b);
  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function lookup(q) {
  const u = new URL('https://nominatim.openstreetmap.org/search');
  u.search = new URLSearchParams({ q, format: 'json', limit: '1', countrycodes: 'ge' });
  const r = await fetch(u, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const j = await r.json();
  return j[0] ? { lat: +j[0].lat, lon: +j[0].lon, name: j[0].display_name } : null;
}

const rows = [];
for (const day of DAYS) {
  for (const s of day.stops) {
    if (SKIP.has(s.id)) { rows.push({ day: day.n, s, verdict: 'skip' }); continue; }
    const q = QUERY[s.id] || s.title + ', Georgia';
    let hit = null, err = null;
    try { hit = await lookup(q); } catch (e) { err = e.message; }
    await sleep(1100);

    if (err) rows.push({ day: day.n, s, verdict: 'error', err });
    else if (!hit) rows.push({ day: day.n, s, verdict: 'notfound', q });
    else {
      const km = haversine(s.lat, s.lon, hit.lat, hit.lon);
      const verdict = km < 1 ? 'ok' : km < 5 ? 'close' : km < 25 ? 'CHECK' : 'WRONG';
      rows.push({ day: day.n, s, verdict, km, hit });
    }
    const last = rows[rows.length - 1];
    const mark = { ok: '  ok ', close: ' ~   ', CHECK: ' !!  ', WRONG: 'XXXX ', notfound: '  ?  ', error: ' err ', skip: '  -  ' }[last.verdict];
    console.log(
      mark + String(day.n) + '  ' + s.id.padEnd(26) +
      (last.km !== undefined ? last.km.toFixed(2).padStart(7) + ' km' : '')
    );
  }
}

const tally = rows.reduce((a, r) => (a[r.verdict] = (a[r.verdict] || 0) + 1, a), {});
console.log('\n' + '─'.repeat(72));
console.log('ok <1km:', tally.ok || 0, ' close <5km:', tally.close || 0,
            ' CHECK:', tally.CHECK || 0, ' WRONG:', tally.WRONG || 0,
            ' notfound:', tally.notfound || 0, ' skipped:', tally.skip || 0);

const bad = rows.filter(r => r.verdict === 'CHECK' || r.verdict === 'WRONG');
if (bad.length) {
  console.log('\nNEEDS ATTENTION — ours vs OSM:');
  for (const r of bad) {
    console.log('  ' + r.s.id);
    console.log('    ours: ' + r.s.lat.toFixed(4) + ', ' + r.s.lon.toFixed(4));
    console.log('    osm : ' + r.hit.lat.toFixed(4) + ', ' + r.hit.lon.toFixed(4) + '  (' + r.km.toFixed(1) + ' km away)');
    console.log('    osm says: ' + r.hit.name.slice(0, 90));
  }
}
const nf = rows.filter(r => r.verdict === 'notfound');
if (nf.length) {
  console.log('\nNOT FOUND ON OSM (verify by hand):');
  for (const r of nf) console.log('  ' + r.s.id + '  — searched: ' + r.q);
}
