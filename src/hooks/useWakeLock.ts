/**
 * Keep the screen on while navigating.
 *
 * A phone that sleeps every 30 seconds is useless as a co-driver. The lock is
 * released by the browser whenever the tab is hidden, so it is reacquired on
 * return rather than silently staying off.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

type Sentinel = { released: boolean; release(): Promise<void>; addEventListener(t: 'release', cb: () => void): void };

export function useWakeLock() {
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  const [on, setOn] = useState(false);
  const sentinel = useRef<Sentinel | null>(null);

  const acquire = useCallback(async () => {
    if (!supported) return;
    try {
      sentinel.current = await (navigator as unknown as {
        wakeLock: { request(t: 'screen'): Promise<Sentinel> };
      }).wakeLock.request('screen');
      sentinel.current.addEventListener('release', () => { sentinel.current = null; });
      setOn(true);
    } catch {
      // Refused on low battery, or not permitted — not worth an error to the user
      setOn(false);
    }
  }, [supported]);

  const release = useCallback(async () => {
    try { await sentinel.current?.release(); } catch { /* already gone */ }
    sentinel.current = null;
    setOn(false);
  }, []);

  const toggle = useCallback(() => { on ? release() : acquire(); }, [on, acquire, release]);

  /* Browsers drop the lock when the tab is hidden; take it back on return. */
  useEffect(() => {
    if (!on) return;
    const onVis = () => { if (document.visibilityState === 'visible' && !sentinel.current) acquire(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [on, acquire]);

  useEffect(() => () => { sentinel.current?.release().catch(() => {}); }, []);

  return { supported, on, toggle };
}
