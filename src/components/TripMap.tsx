/**
 * The offline map.
 *
 * MapLibre reads the PMTiles archive directly over HTTP range requests — one
 * static file, no tile server. Once the archive is in Cache Storage the
 * service worker answers those range requests from disk, so this works with
 * the radio off.
 */
import { useEffect, useRef, useState } from 'react';
import { Protocol } from 'pmtiles';
import type MapLibre from 'maplibre-gl';

/* MapLibre is loaded as a plain script (see scripts/copy-maplibre.mjs) — its
   worker does not survive Vite's bundler. Types still come from the package. */
declare const maplibregl: typeof MapLibre;
type MLMap = MapLibre.Map;
type MLMarker = MapLibre.Marker;
import type { Day, Stop } from '../data/types';
import type { Fix } from '../hooks/useGeolocation';
import { buildStyle, LIGHT, DARK } from '../lib/mapStyle';
import routes from '../data/routes.json';

/* Absolute: 'pmtiles:///georgia.pmtiles' has an empty host and does not
   resolve reliably inside the protocol handler. */
const pmtilesUrl = () => new URL('/georgia.pmtiles', location.href).href;

/* Registered once for the page, not per mount — MapLibre keys protocols globally. */
let protocolRegistered = false;
function registerProtocol() {
  if (protocolRegistered) return;
  maplibregl.addProtocol("pmtiles", new Protocol().tile);
  protocolRegistered = true;
}

const isDark = () => {
  const root = document.documentElement;
  return root.getAttribute('data-theme') === 'dark' ||
    (!root.hasAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
};

/** Accuracy circle as a polygon — MapLibre has no metres-radius circle. */
function accuracyRing(lat: number, lon: number, metres: number, sides = 48) {
  const ring: [number, number][] = [];
  const dLat = metres / 111_320;
  const dLon = metres / (111_320 * Math.cos((lat * Math.PI) / 180));
  for (let i = 0; i <= sides; i++) {
    const t = (i / sides) * 2 * Math.PI;
    ring.push([lon + dLon * Math.cos(t), lat + dLat * Math.sin(t)]);
  }
  return { type: 'Feature' as const, properties: {}, geometry: { type: 'Polygon' as const, coordinates: [ring] } };
}

export function TripMap({
  day, stops, activeId, visited, onPick, fix, stale, follow, onFollowChange,
}: {
  day: Day;
  stops: Stop[];
  activeId: string | null;
  visited: Set<string>;
  onPick: (id: string) => void;
  fix: Fix | null;
  stale: boolean;
  follow: boolean;
  onFollowChange: (v: boolean) => void;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const map = useRef<MLMap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const meMarker = useRef<MLMarker | null>(null);

  /* ── create once ── */
  useEffect(() => {
    if (!holder.current || map.current) return;
    registerProtocol();

    let m: MLMap;
    try {
      m = new maplibregl.Map({
        container: holder.current,
        style: buildStyle(pmtilesUrl(), isDark() ? DARK : LIGHT),
        center: [44.15, 42.04],
        zoom: 6.4,
        attributionControl: false,
        // The basemap stops at 15; let people zoom past it rather than
        // hitting a wall, MapLibre will overzoom the vector tiles.
        maxZoom: 18,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return;
    }

    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    m.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    m.on('error', (e: { error?: { message?: string } }) => {
      // A missing basemap is the expected failure before the download, and
      // must read as a clear message rather than a blank grey rectangle.
      const msg = e.error?.message ?? 'unknown map error';
      console.error('[map]', msg);
      setError(/pmtiles|404|failed to fetch|network/i.test(msg)
        ? 'Basemap not available — download it in Settings, or connect to wifi.'
        : msg);
    });

    /* If the style never settles, say so rather than showing a blank canvas
       forever — a silent empty map is the worst possible failure on the road. */
    const stall = window.setTimeout(() => {
      if (!m.isStyleLoaded()) {
        setError('Basemap did not load. Download it in Settings, or connect to wifi.');
      }
    }, 12_000);

    /* style.load, not load: `load` also waits on every source settling, and a
       slow basemap would then block the route line and pins indefinitely. */
    m.on('style.load', () => {
      window.clearTimeout(stall);
      m.addSource('route', { type: 'geojson', data: routes as never });
      m.addLayer({
        id: 'route-casing', type: 'line', source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': 'rgba(0,0,0,.16)', 'line-width': 7 },
      });
      m.addLayer({
        id: 'route-line', type: 'line', source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#C86B3C',
          'line-width': ['interpolate', ['linear'], ['zoom'], 6, 2.2, 12, 4.5],
          'line-dasharray': ['case', ['==', ['get', 'mode'], 'walk'], ['literal', [2, 2]], ['literal', [1, 0]]],
        },
      });
      /* Your own position: accuracy halo under a heading-rotated car. */
      m.addSource('me', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      m.addLayer({
        id: 'me-accuracy', type: 'fill', source: 'me',
        paint: { 'fill-color': '#2F5A7A', 'fill-opacity': 0.13 },
      });
      m.addLayer({
        id: 'me-accuracy-edge', type: 'line', source: 'me',
        paint: { 'line-color': '#2F5A7A', 'line-opacity': 0.35, 'line-width': 1 },
      });

      setReady(true);
    });

    /* Panning by hand means you want to look somewhere else — stop chasing. */
    m.on('dragstart', () => onFollowChange(false));
    m.on('zoomstart', e => { if ((e as { originalEvent?: unknown }).originalEvent) onFollowChange(false); });

    map.current = m;
    setMounted(true);
    return () => { window.clearTimeout(stall); m.remove(); map.current = null; };
  }, []);

  /* ── route filter follows the selected day (needs the style) ── */
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    for (const id of ['route-casing', 'route-line']) {
      if (m.getLayer(id)) m.setFilter(id, ['==', ['get', 'day'], day.n]);
    }
  }, [day.n, ready]);

  /* ── pins are plain DOM and deliberately do not wait on the basemap, so
        the day still reads even if the tiles never arrive ── */
  useEffect(() => {
    const m = map.current;
    if (!m || !mounted) return;

    const markers: MLMarker[] = [];
    stops.forEach((s, i) => {
      const el = document.createElement('button');
      el.className = 'mpin';
      el.type = 'button';
      el.setAttribute('aria-label', `${s.title}, stop ${i + 1}`);
      if (visited.has(s.id)) el.dataset.done = '1';
      if (s.id === activeId) el.dataset.active = '1';
      el.textContent = String(i + 1);
      el.onclick = () => onPick(s.id);
      markers.push(new maplibregl.Marker({ element: el }).setLngLat([s.lon, s.lat]).addTo(m));
    });

    const bounds = new maplibregl.LngLatBounds();
    stops.forEach(s => bounds.extend([s.lon, s.lat]));
    if (!bounds.isEmpty()) {
      m.fitBounds(bounds, { padding: { top: 60, bottom: 60, left: 40, right: 40 }, duration: 700, maxZoom: 13 });
    }

    return () => markers.forEach(mk => mk.remove());
  }, [day.n, stops, activeId, visited, mounted, onPick]);

  /* ── the car: position, heading, accuracy halo ── */
  useEffect(() => {
    const m = map.current;
    if (!m || !mounted) return;

    if (!fix) {
      meMarker.current?.remove();
      meMarker.current = null;
      const src = ready && m.getSource('me');
      if (src) (src as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    if (!meMarker.current) {
      const el = document.createElement('div');
      el.className = 'mecar';
      el.setAttribute('aria-label', 'Your position');
      el.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M3 13.5h18M5.2 13.5l1.9-5.3A2 2 0 0 1 9 6.8h6a2 2 0 0 1 1.9 1.4l1.9 5.3M4 13.5v3.2M20 13.5v3.2M3 16.7h18" ' +
        'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<circle cx="7.4" cy="16.9" r="1.7" fill="none" stroke="currentColor" stroke-width="1.7"/>' +
        '<circle cx="16.6" cy="16.9" r="1.7" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>';
      meMarker.current = new maplibregl.Marker({ element: el, rotationAlignment: 'map' }).setLngLat([fix.lon, fix.lat]).addTo(m);
    }

    meMarker.current.setLngLat([fix.lon, fix.lat]);
    // heading is null when stationary; keep the last one rather than snapping north
    if (fix.heading !== null) meMarker.current.setRotation(fix.heading);
    (meMarker.current.getElement() as HTMLElement).dataset.stale = stale ? '1' : '';

    if (ready && m.getSource('me')) {
      (m.getSource('me') as maplibregl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: [accuracyRing(fix.lat, fix.lon, Math.min(fix.accuracy, 2000))],
      });
    }

    if (follow) {
      m.easeTo({ center: [fix.lon, fix.lat], zoom: Math.max(m.getZoom(), 13), duration: 900 });
    }
  }, [fix, stale, follow, mounted, ready]);

  return (
    <div className="mapwrap">
      <div ref={holder} className="mapcanvas" />
      {error && (
        <div className="maperr">
          <strong>Map unavailable</strong>
          <span>{error}</span>
        </div>
      )}
      {fix && (
        <button
          className={"mefollow" + (follow ? " on" : "")}
          onClick={() => onFollowChange(!follow)}
          aria-pressed={follow}
        >
          {follow ? "Following" : "Recentre"}
        </button>
      )}
      <div className="maplegend">
        Day {day.n} · {day.from} → {day.to}
        {day.distanceKm ? ` · ${day.distanceKm} km` : ''}
      </div>
    </div>
  );
}
