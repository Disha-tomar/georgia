/** Helpers that join the hand-authored itinerary to the generated data. */
import { DAYS } from '../data/itinerary';
import elevations from '../data/elevations.json';
import credits from '../data/photo-credits.json';
import type { Stop } from '../data/types';

type Credit = { commons: string; artist: string; license: string; licenseUrl: string; sourceUrl: string };

const ELEV = elevations as Record<string, number>;
const CREDITS = credits as Record<string, Credit>;

export const elevationOf = (id: string): number | undefined => ELEV[id];

/** Resolve a stop's imagery, following photoAlias. Null means icon fallback. */
export function photoOf(stop: Stop): { full: string; card: string; credit: Credit } | null {
  const id = stop.photoAlias ?? stop.id;
  const credit = CREDITS[id];
  if (!credit) return null;
  return { full: `/photos/${id}.webp`, card: `/photos/${id}-card.webp`, credit };
}

export const fmtAlt = (m: number) => m.toLocaleString('en-US') + ' m';

/** Great-circle distance in km. */
export function haversine(aLat: number, aLon: number, bLat: number, bLon: number) {
  const R = 6371, rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(bLat - aLat), dLon = rad(bLon - aLon);
  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Stops that carry a meaningful altitude — transit waypoints are indicative only. */
export const profileStops = (stops: Stop[]) => stops.filter(s => !s.transit);

/**
 * Which day is "today", or null when the trip is not running.
 * Compared in local date terms so a late night does not roll the day over early.
 */
export function currentDayNumber(now = new Date()): number | null {
  const today = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');
  return DAYS.find(d => d.date === today)?.n ?? null;
}

/**
 * Index of the stop the schedule says you should be at, by wall clock.
 * Phase 4 replaces this with GPS; until then time alone is the best guess.
 */
export function scheduledStopIndex(stops: Stop[], now = new Date()): number {
  const mins = now.getHours() * 60 + now.getMinutes();
  let idx = 0;
  stops.forEach((s, i) => {
    const m = /^(\d{2}):(\d{2})$/.exec(s.time);
    if (m && +m[1] * 60 + +m[2] <= mins) idx = i;
  });
  return idx;
}
