/** Hand-drawn line glyphs, one per stop kind. Inline SVG — free, and offline. */
import type { StopKind } from '../data/types';

const P = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const GLYPHS = {
  car: <><path {...P} strokeWidth={1.6} d="M3 13.5h18M5.2 13.5l1.9-5.3A2 2 0 0 1 9 6.8h6a2 2 0 0 1 1.9 1.4l1.9 5.3M4 13.5v3.2M20 13.5v3.2M3 16.7h18" /><circle {...P} strokeWidth={1.6} cx="7.4" cy="16.9" r="1.7" /><circle {...P} strokeWidth={1.6} cx="16.6" cy="16.9" r="1.7" /></>,
  plane: <path {...P} strokeWidth={1.6} d="M10.2 3.4a1.6 1.6 0 0 1 3.2 0v5.3l7.6 4.2v2.3l-7.6-2.3v4.4l2.6 1.9v1.6l-4.2-1.2-4.2 1.2v-1.6l2.6-1.9v-4.4L2.6 15.2v-2.3l7.6-4.2Z" />,
  monument: <path {...P} strokeWidth={1.6} d="M4 20h16M6.5 20V8.5l2-3.5 2 3.5V20M13.5 20V6.8l2-2.8 2 2.8V20" />,
  church: <><path {...P} strokeWidth={1.6} d="M5.5 20v-8.6L12 6.6l6.5 4.8V20M9.5 20v-4.6h5V20" /><path {...P} strokeWidth={1.6} d="M12 6.6V2.8M10.3 4.2h3.4" /></>,
  fortress: <><path {...P} strokeWidth={1.6} d="M3.5 20V8.5h2.3V6h2.4v2.5h2.3V6h2.4v2.5h2.3V6h2.4v2.5h2.3V20" /><path {...P} strokeWidth={1.6} d="M10 20v-4.5h4V20" /></>,
  cave: <><path {...P} strokeWidth={1.6} d="M2.8 20V13a9.2 9.2 0 0 1 18.4 0v7" /><path {...P} strokeWidth={1.6} d="M8.4 20v-6.6a3.6 3.6 0 0 1 7.2 0V20" /></>,
  river: <><path {...P} strokeWidth={1.6} d="M2.5 15.5c2.4-2 4.7 2 7.1 0s4.7 2 7.1 0 4.7 2 4.8.3M2.5 19.4c2.4-2 4.7 2 7.1 0s4.7 2 7.1 0 4.7 2 4.8.3" /><path {...P} strokeWidth={1.6} opacity={.55} d="M6.5 11.5 10.8 4l4.2 7.5" /></>,
  peak: <><path {...P} strokeWidth={1.6} d="M2.5 19h19L14.7 6.4 11.4 12 9 8.6 2.5 19Z" /><circle {...P} strokeWidth={1.4} opacity={.6} cx="17.6" cy="5.4" r="2.1" /></>,
  khinkali: <><circle {...P} strokeWidth={1.6} cx="12" cy="14.2" r="6.4" /><path {...P} strokeWidth={1.6} d="M12 7.8V3.4M12 3.4c-1.1 0-1.9.7-1.9 1.5M12 3.4c1.1 0 1.9.7 1.9 1.5" /><path {...P} strokeWidth={1.3} opacity={.65} d="M8.3 9.6 12 7.8l3.7 1.8M6.3 12.2 12 7.8l5.7 4.4" /></>,
  bed: <path {...P} strokeWidth={1.6} d="M3 19v-9M3 13.5h18V19M21 19v-4M3 19h18M7.4 10.4h3.2a1.6 1.6 0 0 1 1.6 1.6v1.5H5.8V12a1.6 1.6 0 0 1 1.6-1.6Z" />,
  market: <><path {...P} strokeWidth={1.6} d="M3.4 9.4h17.2L19.3 20H4.7L3.4 9.4Z" /><path {...P} strokeWidth={1.6} d="M8.4 9.4V6.8a3.6 3.6 0 0 1 7.2 0v2.6" /></>,
  spa: <><path {...P} strokeWidth={1.6} d="M3.5 20a9.3 9.3 0 0 1 17 0" /><path {...P} strokeWidth={1.5} opacity={.65} d="M9 8.4c0-1.4 1.5-1.8 1.5-3.2M12 7.6c0-1.6 1.6-2 1.6-3.6M15 8.4c0-1.2 1.3-1.6 1.3-2.8" /></>,
  city: <><path {...P} strokeWidth={1.6} d="M3.4 20V10l5.4-3.2V20M8.8 20V12l5.4-2.4V20M14.2 20V13l6.4 2.4V20" /><path {...P} strokeWidth={1.4} opacity={.55} d="M6 13.6v1.2M11.4 15v1.2M17 17.6v1.2" /></>,
  wine: <><path {...P} strokeWidth={1.6} d="M7.6 3.4h8.8l-.7 5.4a4.2 4.2 0 0 1-8.3 0L7.6 3.4Z" /><path {...P} strokeWidth={1.6} d="M12 13v6.6M8.4 20h7.2" /></>,
  cablecar: <><path {...P} strokeWidth={1.5} d="M2.6 4.6 21.4 9" /><path {...P} strokeWidth={1.6} d="M12 6.8v3.4M7.2 10.2h9.6v7a2 2 0 0 1-2 2H9.2a2 2 0 0 1-2-2v-7Z" /><path {...P} strokeWidth={1.4} opacity={.6} d="M7.2 14h9.6" /></>,
} satisfies Record<StopKind, React.ReactNode>;

export const UI = {
  check: <path {...P} strokeWidth={2.4} d="M5 12.6l4.4 4.4L19 7.4" />,
  chev: <path {...P} strokeWidth={1.9} d="M6 9.5l6 6 6-6" />,
  left: <path {...P} strokeWidth={1.9} d="M14.5 5.5l-7 6.5 7 6.5" />,
  right: <path {...P} strokeWidth={1.9} d="M9.5 5.5l7 6.5-7 6.5" />,
  alt: <><path {...P} strokeWidth={1.7} d="M2.5 19h19L12 4 2.5 19Z" /><path {...P} strokeWidth={1.4} opacity={.6} d="M8.2 12.5h7.6" /></>,
  clock: <><circle {...P} strokeWidth={1.7} cx="12" cy="12" r="8.6" /><path {...P} strokeWidth={1.7} d="M12 7.2V12l3.4 2.2" /></>,
  ticket: <path {...P} strokeWidth={1.6} d="M3.5 9.4V7A1.5 1.5 0 0 1 5 5.5h14A1.5 1.5 0 0 1 20.5 7v2.4a2.6 2.6 0 0 0 0 5.2V17a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17v-2.4a2.6 2.6 0 0 0 0-5.2Z" />,
  map: <><path {...P} strokeWidth={1.6} d="M9 4.2 3.5 6.4v13.4L9 17.6l6 2.2 5.5-2.2V4.2L15 6.4 9 4.2Z" /><path {...P} strokeWidth={1.6} d="M9 4.2v13.4M15 6.4v13.4" /></>,
  nav: <path {...P} strokeWidth={1.7} d="M20.5 3.5 3.5 10.6l7 2.9 2.9 7 7.1-17Z" />,
  home: <path {...P} strokeWidth={1.7} d="M3.5 10.5 12 3.5l8.5 7M5.6 12.4V20h12.8v-7.6" />,
  gear: <><circle {...P} strokeWidth={1.7} cx="12" cy="12" r="3" /><path {...P} strokeWidth={1.7} d="M12 2.8v2.6M12 18.6v2.6M4.4 12H1.8M22.2 12h-2.6M6.2 6.2 4.4 4.4M19.6 19.6l-1.8-1.8M17.8 6.2l1.8-1.8M4.4 19.6l1.8-1.8" /></>,
  moon: <path {...P} strokeWidth={1.7} d="M20 14.4A8.6 8.6 0 0 1 9.6 4 8.6 8.6 0 1 0 20 14.4Z" />,
  pin: <><path {...P} strokeWidth={1.7} d="M12 21.5S5 14.9 5 10a7 7 0 0 1 14 0c0 4.9-7 11.5-7 11.5Z" /><circle {...P} strokeWidth={1.7} cx="12" cy="10" r="2.4" /></>,
} as const;

export function Icon({ kind, ui, className }: { kind?: StopKind; ui?: keyof typeof UI; className?: string }) {
  const body = ui ? UI[ui] : GLYPHS[kind ?? 'city'];
  return <svg viewBox="0 0 24 24" className={className} aria-hidden="true">{body}</svg>;
}
