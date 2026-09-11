/** Shared shapes for the itinerary data. */

export type StopKind =
  | 'car' | 'plane' | 'monument' | 'church' | 'fortress' | 'cave' | 'river'
  | 'peak' | 'khinkali' | 'bed' | 'market' | 'spa' | 'city' | 'wine' | 'cablecar';

export interface FoodPick {
  name: string;
  kind?: 'restaurant' | 'cafe' | 'bakery' | 'winery' | 'wine-bar' | 'duqani';
  /** Rough price tier in lari. */
  price: '₾' | '₾₾' | '₾₾₾';
  /** Why this one, in a sentence. */
  why: string;
  /** The thing to actually order. */
  dish?: string;
  lat?: number;
  lon?: number;
  /** Where the recommendation came from, so it can be re-checked. */
  source: string;
}

export interface Photo {
  /** Wikimedia Commons file name, without the "File:" prefix. */
  commons: string;
  artist?: string;
  license?: string;
  licenseUrl?: string;
  sourceUrl?: string;
}

export interface Stop {
  id: string;
  /** Local time from the itinerary, 24h. */
  time: string;
  title: string;
  /** Short italic subtitle under the title. */
  kicker: string;
  /** One or two short paragraphs, written for a phone screen. */
  blurb: string[];
  lat: number;
  lon: number;
  /** Metres. Filled in by scripts/fetch-elevation.mjs — do not hand-edit. */
  elevationM?: number;
  kind: StopKind;
  /** Minutes to linger, where the itinerary implies one. */
  dwell?: string;
  /** Drive from the previous stop. */
  drive?: { mins: number; km: number };
  /** Search term for scripts/fetch-photos.mjs when no file is pinned yet. */
  photoQuery?: string;
  photos?: Photo[];
  /** Reuse another stop id's photo — same place, no second download. */
  photoAlias?: string;
  /** Rendered as the illustrated fallback panel when there is no photo. */
  photoNote?: string;
  ticket?: { priceGel?: number; note: string };
  tips?: string[];
  food?: FoodPick[];
  /** Shown when food is empty — says why, rather than leaving a hole. */
  foodNote?: string;
  /** Coordinate still to be confirmed against OSM. */
  needsVerify?: boolean;
  /**
   * A waypoint on a drive rather than a place — its coordinate is indicative
   * only. The UI hides its altitude chip and leaves it out of the altitude
   * profile, so an arbitrary mid-route point cannot distort the curve.
   */
  transit?: boolean;
}

export interface Day {
  n: number;
  /** ISO date. */
  date: string;
  /** Short label for the day strip. */
  dd: string;
  label: string;
  from: string;
  to: string;
  departAt?: string;
  distanceKm?: number;
  headline: string;
  /** One paragraph framing the day. */
  sub: string;
  /** Practical reminders surfaced from the itinerary. */
  checklist?: string[];
  stops: Stop[];
}
