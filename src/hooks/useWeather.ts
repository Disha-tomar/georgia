/**
 * Weather, cached and honest about its age.
 *
 * Shows whatever was last fetched immediately, then refreshes in the
 * background when online and the cache is older than an hour. Offline it keeps
 * showing the old values with their timestamp rather than blanking.
 */
import { useCallback, useEffect, useState } from 'react';
import { fetchWeather, readCache, type WeatherCache } from '../lib/weather';

const REFRESH_AFTER = 60 * 60 * 1000; // 1 hour

export function useWeather() {
  const [cache, setCache] = useState<WeatherCache | null>(readCache);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    if (!navigator.onLine) { setFailed(true); return; }
    setLoading(true);
    setFailed(false);
    try {
      setCache(await fetchWeather(signal));
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    const stale = !cache || Date.now() - cache.fetchedAt > REFRESH_AFTER;
    if (stale) refresh(ac.signal);
    return () => ac.abort();
    // deliberately once on mount; the manual refresh covers the rest
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Try again when the phone comes back online — likely at the next hotel. */
  useEffect(() => {
    const onOnline = () => {
      if (!cache || Date.now() - cache.fetchedAt > REFRESH_AFTER) refresh();
    };
    addEventListener('online', onOnline);
    return () => removeEventListener('online', onOnline);
  }, [cache, refresh]);

  return { cache, loading, failed, refresh };
}
