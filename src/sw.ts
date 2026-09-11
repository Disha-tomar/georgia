/// <reference lib="webworker" />
/**
 * Service worker.
 *
 * Two jobs, and the second is the interesting one.
 *
 * 1. Precache the app shell, photos, fonts, glyphs and MapLibre, so the whole
 *    itinerary works with the radio off.
 *
 * 2. Serve the basemap. MapLibre reads PMTiles with HTTP *range* requests —
 *    "give me bytes 41,000,000 to 41,004,095" — and Cache Storage only holds
 *    whole responses. The archive is stored as 8 MB chunks, so this works out
 *    which chunks a range touches, slices each one as a Blob (disk-backed, so
 *    it never loads 64 MB into memory) and stitches them into a 206.
 */
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import {
  BASEMAP_CACHE, BASEMAP_PATH, DOWNLOAD_PARAM,
  chunkUrl, metaUrl, planRange, type BasemapMeta,
} from './lib/basemapCache';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isBasemap =
    url.origin === self.location.origin &&
    url.pathname === BASEMAP_PATH &&
    !url.searchParams.has(DOWNLOAD_PARAM); // the download itself must reach the network
  if (isBasemap) event.respondWith(serveBasemap(event.request));
});

async function serveBasemap(request: Request): Promise<Response> {
  const cache = await caches.open(BASEMAP_CACHE);
  const metaRes = await cache.match(metaUrl());

  // Not downloaded yet: stay online-capable rather than failing outright.
  if (!metaRes) {
    try {
      return await fetch(request);
    } catch {
      return new Response('Offline basemap not downloaded yet.', {
        status: 504, statusText: 'Basemap unavailable',
      });
    }
  }

  const meta: BasemapMeta = await metaRes.json();
  const range = request.headers.get('range');

  try {
    if (!range) {
      // Whole-file request — rare, but assemble it rather than refuse.
      const all = await readParts(cache, [...Array(meta.chunks).keys()].map(index => ({
        index, from: 0, to: CHUNK_MAX,
      })));
      return new Response(new Blob(all), {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': String(meta.size),
          'Accept-Ranges': 'bytes',
        },
      });
    }

    const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (!m) return rangeError(meta.size);

    let start: number, end: number;
    if (m[1] === '') {
      // suffix form: "bytes=-500" means the last 500 bytes
      const len = Number(m[2]);
      if (!len) return rangeError(meta.size);
      start = Math.max(0, meta.size - len);
      end = meta.size - 1;
    } else {
      start = Number(m[1]);
      end = m[2] === '' ? meta.size - 1 : Math.min(Number(m[2]), meta.size - 1);
    }
    if (!(start >= 0 && end >= start && start < meta.size)) return rangeError(meta.size);

    const parts = await readParts(cache, planRange(start, end, meta.chunkSize));
    const body = new Blob(parts);

    return new Response(body, {
      status: 206,
      statusText: 'Partial Content',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Range': `bytes ${start}-${end}/${meta.size}`,
        'Content-Length': String(end - start + 1),
        'Accept-Ranges': 'bytes',
      },
    });
  } catch {
    // A missing chunk means the cache was evicted part-way. Say so clearly:
    // the app checks for this and offers a re-download.
    return new Response('Offline basemap is incomplete — re-download it in Settings.', {
      status: 503, statusText: 'Basemap incomplete',
    });
  }
}

const CHUNK_MAX = Number.MAX_SAFE_INTEGER;

async function readParts(
  cache: Cache,
  parts: { index: number; from: number; to: number }[],
): Promise<Blob[]> {
  const out: Blob[] = [];
  for (const p of parts) {
    const res = await cache.match(chunkUrl(p.index));
    if (!res) throw new Error('missing chunk ' + p.index);
    const blob = await res.blob();
    out.push(p.to === CHUNK_MAX ? blob : blob.slice(p.from, p.to));
  }
  return out;
}

function rangeError(size: number) {
  return new Response(null, {
    status: 416,
    statusText: 'Range Not Satisfiable',
    headers: { 'Content-Range': `bytes */${size}` },
  });
}
