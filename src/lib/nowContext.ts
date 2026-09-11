/**
 * Turn a GPS fix (or, failing that, the clock) into the one line you want
 * while moving: where am I, what's next, how far.
 *
 * The distinction that matters is honesty. With a fix we say where you *are*;
 * without one we say where the schedule *expects* you, and label it as such.
 * Never dress a guess up as a position.
 */
import type { Day, Stop } from '../data/types';
import { haversine, scheduledStopIndex } from './stops';
import type { Fix } from '../hooks/useGeolocation';

/** Within this of a stop, call it arrived rather than en route. */
const AT_STOP_KM = 0.8;

export type NowContext = {
  /** How the position was decided. */
  source: 'gps' | 'schedule';
  /** Index of the stop you are at, or -1 when between stops. */
  atIndex: number;
  /** Next stop not yet reached, or null at the end of the day. */
  next: Stop | null;
  nextIndex: number;
  /** Straight-line km to the next stop, GPS only. Road distance is longer. */
  kmToNext: number | null;
  /** Nearest stop regardless of distance — used when between stops. */
  nearest: Stop | null;
  kmToNearest: number | null;
  /** True when the fix places you far from every stop on this day. */
  offRoute: boolean;
};

export function computeNow(day: Day, fix: Fix | null, now = new Date()): NowContext {
  const stops = day.stops;

  if (fix) {
    let bestIdx = 0, bestKm = Infinity;
    stops.forEach((s, i) => {
      const km = haversine(fix.lat, fix.lon, s.lat, s.lon);
      if (km < bestKm) { bestKm = km; bestIdx = i; }
    });

    const atStop = bestKm <= AT_STOP_KM;
    /* Between stops, the next one is the nearest that lies ahead in the day's
       order — not simply the closest, which can be the one just left. */
    const nextIndex = atStop ? bestIdx + 1 : nextAhead(stops, bestIdx, fix);
    const next = stops[nextIndex] ?? null;

    return {
      source: 'gps',
      atIndex: atStop ? bestIdx : -1,
      next,
      nextIndex,
      kmToNext: next ? haversine(fix.lat, fix.lon, next.lat, next.lon) : null,
      nearest: stops[bestIdx] ?? null,
      kmToNearest: bestKm,
      // 40 km from every stop on the day means something has gone sideways
      offRoute: bestKm > 40,
    };
  }

  const i = scheduledStopIndex(stops, now);
  return {
    source: 'schedule',
    atIndex: i,
    next: stops[i + 1] ?? null,
    nextIndex: i + 1,
    kmToNext: null,
    nearest: stops[i] ?? null,
    kmToNearest: null,
    offRoute: false,
  };
}

/**
 * Pick the next stop when between two. Prefer the one after the nearest, but
 * if you are actually closer to a later stop (a skipped detour, say), take
 * that instead of insisting on an order you have already left behind.
 */
function nextAhead(stops: Stop[], nearestIdx: number, fix: Fix): number {
  const after = nearestIdx + 1;
  if (after >= stops.length) return stops.length;
  const dAfter = haversine(fix.lat, fix.lon, stops[after].lat, stops[after].lon);
  const dNearest = haversine(fix.lat, fix.lon, stops[nearestIdx].lat, stops[nearestIdx].lon);
  // Closer to the following stop than to the nearest one => already past it.
  return dAfter < dNearest ? after : nearestIdx;
}

/** "1.2 km" / "340 m" / "84 km" */
export function fmtKm(km: number): string {
  if (km < 1) return Math.round(km * 1000) + ' m';
  if (km < 10) return km.toFixed(1) + ' km';
  return Math.round(km) + ' km';
}
