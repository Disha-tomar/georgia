/**
 * How the offline basemap is stored, shared by the service worker and the
 * download manager so the two can never disagree.
 *
 * The archive is kept as ~8 MB chunks rather than one 64 MB entry. Safari has
 * a history of refusing oversized single Cache Storage entries, and that
 * failure would surface as "no map at Jvari Pass" — the one place it cannot be
 * fixed. Chunks also make a failed download resumable instead of all-or-nothing.
 */
export const BASEMAP_CACHE = 'gt-basemap-v2';
export const BASEMAP_PATH = '/georgia.pmtiles';

/** 8 MiB — comfortably under any per-entry cap, few enough chunks to be cheap. */
export const CHUNK_SIZE = 8 * 1024 * 1024;

/** Synthetic in-cache URLs. Never hit the network; they only key the cache. */
export const metaUrl = () => '/__basemap/meta';
export const chunkUrl = (i: number) => `/__basemap/chunk/${i}`;

/**
 * The download fetches with ?dl=1 so the worker passes it through to the
 * network instead of answering from the very cache it is trying to fill.
 */
export const DOWNLOAD_PARAM = 'dl';

export type BasemapMeta = {
  size: number;
  chunkSize: number;
  chunks: number;
  storedAt: number;
};

/** Which chunks a byte range touches, and how to slice each one. */
export function planRange(start: number, end: number, chunkSize: number) {
  const first = Math.floor(start / chunkSize);
  const last = Math.floor(end / chunkSize);
  const parts: { index: number; from: number; to: number }[] = [];
  for (let i = first; i <= last; i++) {
    const base = i * chunkSize;
    parts.push({
      index: i,
      from: Math.max(start, base) - base,
      // exclusive end, as Blob.slice expects
      to: Math.min(end, base + chunkSize - 1) - base + 1,
    });
  }
  return parts;
}
