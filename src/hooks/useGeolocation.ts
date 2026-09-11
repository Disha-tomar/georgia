/**
 * Live position from the phone's GPS.
 *
 * Degrades honestly: if permission is denied or the fix is stale, the app says
 * so rather than showing a confident car marker in the wrong valley. Nothing
 * is sent anywhere — the coordinates never leave the device.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export type Fix = {
  lat: number;
  lon: number;
  /** Metres of uncertainty, as reported by the device. */
  accuracy: number;
  /** Degrees from true north, or null when stationary. */
  heading: number | null;
  /** Metres per second, or null. */
  speed: number | null;
  at: number;
};

export type GeoStatus =
  | 'unsupported'   // no Geolocation API at all
  | 'insecure'      // needs HTTPS; will never work here
  | 'off'           // not watching yet
  | 'waiting'       // watching, no fix yet
  | 'live'          // have a fix
  | 'denied'        // user said no
  | 'error';

const KEY = 'gt-geo-on';

/** A fix older than this is stale enough to stop trusting silently. */
export const STALE_MS = 90_000;

export function useGeolocation() {
  const [status, setStatus] = useState<GeoStatus>(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return 'unsupported';
    // Geolocation is gated on a secure context everywhere. localhost counts.
    if (!window.isSecureContext) return 'insecure';
    return 'off';
  });
  const [fix, setFix] = useState<Fix | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setStatus(s => (s === 'unsupported' || s === 'insecure' ? s : 'off'));
    try { localStorage.removeItem(KEY); } catch { /* private mode */ }
  }, []);

  const start = useCallback(() => {
    if (!navigator.geolocation || !window.isSecureContext) return;
    if (watchId.current !== null) return;
    setStatus('waiting');
    setMessage(null);
    try { localStorage.setItem(KEY, '1'); } catch { /* private mode */ }

    watchId.current = navigator.geolocation.watchPosition(
      p => {
        setFix({
          lat: p.coords.latitude,
          lon: p.coords.longitude,
          accuracy: p.coords.accuracy,
          heading: Number.isFinite(p.coords.heading) ? p.coords.heading : null,
          speed: Number.isFinite(p.coords.speed) ? p.coords.speed : null,
          at: p.timestamp,
        });
        setStatus('live');
      },
      err => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
          setMessage('Location permission denied. Enable it in your browser settings to track the drive.');
          try { localStorage.removeItem(KEY); } catch { /* private mode */ }
        } else {
          setStatus('error');
          setMessage(err.code === err.TIMEOUT
            ? 'No GPS fix yet — this can take a minute in a valley.'
            : 'Position unavailable.');
        }
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 30_000 },
    );
  }, []);

  /* Resume tracking across reloads if it was on — a refresh mid-drive should
     not silently stop following you. */
  useEffect(() => {
    let wanted = false;
    try { wanted = localStorage.getItem(KEY) === '1'; } catch { /* private mode */ }
    if (wanted) start();
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [start]);

  const stale = fix !== null && Date.now() - fix.at > STALE_MS;

  return { status, fix, stale, message, start, stop, tracking: watchId.current !== null };
}
