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

export function TripMap({
  day, stops, activeId, visited, onPick,
}: {
  day: Day;
  stops: Stop[];
  activeId: string | null;
  visited: Set<string>;
  onPick: (id: string) => void;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const map = useRef<MLMap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);

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
      setReady(true);
    });

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

  return (
    <div className="mapwrap">
      <div ref={holder} className="mapcanvas" />
      {error && (
        <div className="maperr">
          <strong>Map unavailable</strong>
          <span>{error}</span>
        </div>
      )}
      <div className="maplegend">
        Day {day.n} · {day.from} → {day.to}
        {day.distanceKm ? ` · ${day.distanceKm} km` : ''}
      </div>
    </div>
  );
}
