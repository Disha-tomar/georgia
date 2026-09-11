/**
 * MapLibre style for the offline basemap, in the folk-journal palette.
 *
 * Hand-written rather than pulled from protomaps-themes so the map reads as
 * part of the app instead of a generic tile layer dropped into it — and so it
 * carries no extra runtime dependency onto the phone.
 *
 * Layer names follow the Protomaps v4 basemap schema.
 */
import type { StyleSpecification } from 'maplibre-gl';

export type MapPalette = {
  land: string; water: string; green: string; sand: string;
  roadMajor: string; roadMinor: string; roadCase: string;
  building: string; text: string; halo: string; boundary: string;
};

export const LIGHT: MapPalette = {
  land: '#F4EBDC', water: '#B8CEDA', green: '#DCE4CC', sand: '#EFE2C8',
  roadMajor: '#E8C9A8', roadMinor: '#FBF6EC', roadCase: '#DCC8AC',
  building: '#E5D7C2', text: '#6E6055', halo: '#FBF6EC', boundary: '#C9B49A',
};

export const DARK: MapPalette = {
  land: '#17130F', water: '#16242E', green: '#1B241A', sand: '#221C15',
  roadMajor: '#463527', roadMinor: '#2C241D', roadCase: '#3A2C21',
  building: '#241E18', text: '#B4A292', halo: '#17130F', boundary: '#4A3A2C',
};

export function buildStyle(pmtilesUrl: string, p: MapPalette): StyleSpecification {
  return {
    version: 8,
    glyphs: '/fonts/glyphs/{fontstack}/{range}.pbf',
    sources: {
      protomaps: {
        type: 'vector',
        /*
         * Declare the tile template directly rather than `url:` + a TileJSON
         * round trip: one less request before the first tile, and the zoom
         * range is already known from the archive. Keep these in step with
         * scripts/extract-basemap.sh if MAXZOOM changes.
         */
        tiles: ['pmtiles://' + pmtilesUrl + '/{z}/{x}/{y}'],
        minzoom: 0,
        maxzoom: 15,
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> · Protomaps',
      },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': p.land } },

      { id: 'earth', type: 'fill', source: 'protomaps', 'source-layer': 'earth',
        paint: { 'fill-color': p.land } },

      { id: 'landuse-green', type: 'fill', source: 'protomaps', 'source-layer': 'landuse',
        filter: ['in', ['get', 'kind'], ['literal', ['park', 'forest', 'wood', 'grass', 'nature_reserve', 'scrub', 'farmland', 'golf_course', 'pitch']]],
        paint: { 'fill-color': p.green, 'fill-opacity': 0.75 } },

      { id: 'landuse-sand', type: 'fill', source: 'protomaps', 'source-layer': 'landuse',
        filter: ['in', ['get', 'kind'], ['literal', ['beach', 'sand', 'glacier', 'quarry']]],
        paint: { 'fill-color': p.sand } },

      { id: 'water', type: 'fill', source: 'protomaps', 'source-layer': 'water',
        paint: { 'fill-color': p.water } },

      { id: 'buildings', type: 'fill', source: 'protomaps', 'source-layer': 'buildings',
        minzoom: 14,
        paint: { 'fill-color': p.building, 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 15.5, 0.8] } },

      /* roads: casing under fill, so junctions read cleanly */
      { id: 'roads-case', type: 'line', source: 'protomaps', 'source-layer': 'roads',
        filter: ['in', ['get', 'kind'], ['literal', ['highway', 'major_road']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': p.roadCase,
          'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 5, 1.5, 10, 4.5, 15, 14],
        } },

      { id: 'roads-minor', type: 'line', source: 'protomaps', 'source-layer': 'roads',
        minzoom: 12,
        filter: ['in', ['get', 'kind'], ['literal', ['minor_road', 'other', 'path']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': p.roadMinor,
          'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 12, 0.5, 15, 5],
        } },

      { id: 'roads-major', type: 'line', source: 'protomaps', 'source-layer': 'roads',
        filter: ['in', ['get', 'kind'], ['literal', ['highway', 'major_road']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': p.roadMajor,
          'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 5, 0.6, 10, 2.6, 15, 10],
        } },

      { id: 'boundaries', type: 'line', source: 'protomaps', 'source-layer': 'boundaries',
        filter: ['in', ['get', 'kind'], ['literal', ['country', 'region']]],
        paint: { 'line-color': p.boundary, 'line-width': 1, 'line-dasharray': [3, 2] } },

      { id: 'place-labels', type: 'symbol', source: 'protomaps', 'source-layer': 'places',
        filter: ['in', ['get', 'kind'], ['literal', ['locality', 'country', 'region']]],
        layout: {
          'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 6, 10, 12, 14, 15, 17],
          'text-max-width': 8,
        },
        paint: { 'text-color': p.text, 'text-halo-color': p.halo, 'text-halo-width': 1.6 } },
    ],
  };
}
