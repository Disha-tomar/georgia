/**
 * Weather from Open-Meteo — the one thing in this app that needs the network.
 *
 * No API key, 16-day forecast (which covers the whole trip from mid-September),
 * and generous free use. Fetched for every stop in one batched request and
 * cached; offline it shows the last values with an honest "updated N ago"
 * stamp, so a stale reading is never mistaken for a live one.
 */
import { DAYS } from '../data/itinerary';

const KEY = 'gt-weather-v1';
const ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

export type DayWeather = {
  tMax: number;
  tMin: number;
  rainChance: number;
  code: number;
  sunrise: string;
  sunset: string;
  windMax: number;
};

export type WeatherCache = {
  fetchedAt: number;
  /** stop id → weather on that stop's own date */
  byStop: Record<string, DayWeather>;
};

/** WMO weather codes, grouped to what actually changes your day. */
export function describeCode(code: number): { label: string; icon: 'sun' | 'cloud' | 'rain' | 'snow' | 'storm' } {
  if (code === 0) return { label: 'Clear', icon: 'sun' };
  if (code <= 2) return { label: 'Mostly clear', icon: 'sun' };
  if (code === 3) return { label: 'Overcast', icon: 'cloud' };
  if (code <= 48) return { label: 'Fog', icon: 'cloud' };
  if (code <= 57) return { label: 'Drizzle', icon: 'rain' };
  if (code <= 67) return { label: 'Rain', icon: 'rain' };
  if (code <= 77) return { label: 'Snow', icon: 'snow' };
  if (code <= 82) return { label: 'Showers', icon: 'rain' };
  if (code <= 86) return { label: 'Snow showers', icon: 'snow' };
  return { label: 'Thunderstorm', icon: 'storm' };
}

export function readCache(): WeatherCache | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WeatherCache) : null;
  } catch {
    return null;
  }
}

function writeCache(c: WeatherCache) {
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* quota or private mode */ }
}

/**
 * One request covering every stop. Open-Meteo accepts comma-separated
 * coordinate lists and answers with an array in the same order.
 */
export async function fetchWeather(signal?: AbortSignal): Promise<WeatherCache> {
  const stops = DAYS.flatMap(d => d.stops.map(s => ({ id: s.id, lat: s.lat, lon: s.lon, date: d.date })));

  /*
   * Ask for the whole 16-day window rather than the trip's explicit dates.
   * The forecast horizon is only ever ~16 days out, so requesting a range that
   * runs past it is rejected outright (HTTP 400) and we would get nothing at
   * all — including for the days that *are* forecastable. Days beyond the
   * horizon simply come back absent and fill in as departure approaches.
   */
  const url = new URL(ENDPOINT);
  url.search = new URLSearchParams({
    latitude: stops.map(s => s.lat.toFixed(4)).join(','),
    longitude: stops.map(s => s.lon.toFixed(4)).join(','),
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset',
    timezone: 'Asia/Tbilisi',
    forecast_days: '16',
  }).toString();

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('Open-Meteo HTTP ' + res.status);
  const json = await res.json();

  // A single coordinate returns an object; several return an array.
  const list: any[] = Array.isArray(json) ? json : [json];

  const byStop: Record<string, DayWeather> = {};
  stops.forEach((s, i) => {
    const d = list[i]?.daily;
    if (!d) return;
    const k = d.time.indexOf(s.date);
    if (k < 0) return;
    byStop[s.id] = {
      code: d.weather_code[k],
      tMax: Math.round(d.temperature_2m_max[k]),
      tMin: Math.round(d.temperature_2m_min[k]),
      rainChance: d.precipitation_probability_max?.[k] ?? 0,
      windMax: Math.round(d.wind_speed_10m_max?.[k] ?? 0),
      sunrise: (d.sunrise?.[k] ?? '').slice(11, 16),
      sunset: (d.sunset?.[k] ?? '').slice(11, 16),
    };
  });

  const cache: WeatherCache = { fetchedAt: Date.now(), byStop };
  writeCache(cache);
  return cache;
}

/** "just now" / "4 h ago" / "3 days ago" — so stale data reads as stale. */
export function freshness(ts: number): string {
  const mins = Math.round((Date.now() - ts) / 60_000);
  if (mins < 2) return 'just now';
  if (mins < 60) return mins + ' min ago';
  const hours = Math.round(mins / 60);
  if (hours < 36) return hours + ' h ago';
  return Math.round(hours / 24) + ' days ago';
}
