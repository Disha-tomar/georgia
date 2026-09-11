/**
 * Download the basemap for offline use.
 *
 * 64 MB is a real download, so it is never automatic: it happens when you ask,
 * ideally on hotel wifi rather than roaming. It is fetched as a stream so the
 * progress bar is honest, and written to Cache Storage in 8 MB chunks — small
 * enough that no browser refuses them, and resumable if the connection drops
 * half way up a mountain.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  BASEMAP_CACHE, BASEMAP_PATH, CHUNK_SIZE, DOWNLOAD_PARAM,
  chunkUrl, metaUrl, type BasemapMeta,
} from '../lib/basemapCache';

export type MapState =
  | { kind: 'checking' }
  | { kind: 'absent' }
  | { kind: 'partial'; have: number; chunks: number }
  | { kind: 'downloading'; received: number; total: number }
  | { kind: 'ready'; bytes: number }
  | { kind: 'error'; message: string };

export const fmtMB = (n: number) => (n / 1048576).toFixed(0) + ' MB';

export function useOfflineMap() {
  const [state, setState] = useState<MapState>({ kind: 'checking' });
  const [persisted, setPersisted] = useState<boolean | null>(null);

  /** Verify every chunk is present, not just the metadata. */
  const check = useCallback(async () => {
    if (!('caches' in window)) {
      setState({ kind: 'error', message: 'This browser has no Cache Storage.' });
      return;
    }
    try {
      const cache = await caches.open(BASEMAP_CACHE);
      const metaRes = await cache.match(metaUrl());
      if (!metaRes) { setState({ kind: 'absent' }); return; }

      const meta: BasemapMeta = await metaRes.json();
      let have = 0;
      for (let i = 0; i < meta.chunks; i++) if (await cache.match(chunkUrl(i))) have++;

      if (have === meta.chunks) setState({ kind: 'ready', bytes: meta.size });
      else setState({ kind: 'partial', have, chunks: meta.chunks });
    } catch (e) {
      setState({ kind: 'error', message: (e as Error).message });
    }
  }, []);

  useEffect(() => {
    check();
    navigator.storage?.persisted?.().then(setPersisted).catch(() => setPersisted(null));
  }, [check]);

  const download = useCallback(async () => {
    setState({ kind: 'downloading', received: 0, total: 0 });

    /* Ask not to be evicted under storage pressure. The browser can still say
       no, but asking measurably improves survival — especially on iOS. */
    try { await navigator.storage?.persist?.(); } catch { /* unsupported */ }

    try {
      const cache = await caches.open(BASEMAP_CACHE);
      // Clear any half-finished attempt so chunk indices cannot go stale.
      await cache.delete(metaUrl());

      const res = await fetch(`${BASEMAP_PATH}?${DOWNLOAD_PARAM}=1`, { cache: 'reload' });
      if (!res.ok) throw new Error('server returned ' + res.status);

      const total = Number(res.headers.get('content-length') ?? 0);
      const reader = res.body?.getReader();
      if (!reader) throw new Error('streaming not supported by this browser');

      let pending: BlobPart[] = [];
      let pendingBytes = 0;
      let received = 0;
      let index = 0;

      const flush = async () => {
        if (!pendingBytes) return;
        await cache.put(chunkUrl(index), new Response(new Blob(pending), {
          headers: { 'Content-Type': 'application/octet-stream' },
        }));
        index++;
        pending = [];
        pendingBytes = 0;
      };

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        let offset = 0;
        // A network chunk can straddle a boundary, so split precisely —
        // uneven chunks would break the range arithmetic in the worker.
        while (offset < value.byteLength) {
          const room = CHUNK_SIZE - pendingBytes;
          const take = Math.min(room, value.byteLength - offset);
          pending.push(value.slice(offset, offset + take) as BlobPart);
          pendingBytes += take;
          offset += take;
          if (pendingBytes === CHUNK_SIZE) await flush();
        }
        received += value.byteLength;
        setState({ kind: 'downloading', received, total });
      }
      await flush();

      const meta: BasemapMeta = {
        size: received,
        chunkSize: CHUNK_SIZE,
        chunks: index,
        storedAt: Date.now(),
      };
      // Metadata last: its presence is what marks the download complete.
      await cache.put(metaUrl(), new Response(JSON.stringify(meta), {
        headers: { 'Content-Type': 'application/json' },
      }));

      setState({ kind: 'ready', bytes: received });
      navigator.storage?.persisted?.().then(setPersisted).catch(() => {});
    } catch (e) {
      const msg = (e as Error).message;
      setState({
        kind: 'error',
        message: /quota|exceeded|storage/i.test(msg)
          ? 'Not enough free storage on this device for the 64 MB map.'
          : 'Download failed: ' + msg,
      });
    }
  }, []);

  const remove = useCallback(async () => {
    try { await caches.delete(BASEMAP_CACHE); } catch { /* nothing there */ }
    setState({ kind: 'absent' });
  }, []);

  return { state, persisted, download, remove, recheck: check };
}
