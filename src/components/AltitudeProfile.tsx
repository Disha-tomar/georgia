/**
 * The day's altitude profile, doubling as the route ribbon.
 *
 * On this trip altitude is not decoration: Day 3 climbs 1,945 m to Jvari Pass,
 * Day 5 drops 2.2 km into the Imereti lowlands. Seeing the shape of the day
 * answers "do I need a jacket in the boot" at a glance.
 */
import type { Stop } from '../data/types';
import { elevationOf, fmtAlt, profileStops } from '../lib/stops';
import { GLYPHS } from './StopIcon';

const W = 730, PAD_L = 26, PAD_R = 26, TOP = 20, BOT = 74, H = 106;

export function AltitudeProfile({
  stops, activeId, visited, onPick,
}: {
  stops: Stop[];
  activeId: string | null;
  visited: Set<string>;
  onPick: (id: string) => void;
}) {
  const pts = profileStops(stops);
  if (pts.length < 2) return null;

  const elevs = pts.map(s => elevationOf(s.id) ?? 0);
  const maxE = Math.max(...elevs) * 1.08;
  const xs = pts.map((_, i) => PAD_L + i * ((W - PAD_L - PAD_R) / (pts.length - 1)));
  const ys = elevs.map(e => BOT - (e / maxE) * (BOT - TOP));

  const line = xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const area = `${PAD_L},${BOT} ${line} ${W - PAD_R},${BOT}`;

  const activeIdx = Math.max(0, pts.findIndex(s => s.id === activeId));
  const cx = xs[activeIdx], cy = ys[activeIdx];
  const peak = Math.max(...elevs);

  return (
    <section className="ribbon">
      <div className="rh">
        <h4>Altitude profile</h4>
        <span>{fmtAlt(elevs[0])} → {fmtAlt(peak)} → {fmtAlt(elevs[elevs.length - 1])}</span>
      </div>
      <div className="ribwrap">
        <svg
          viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: W, height: H }}
          role="img"
          aria-label={`Altitude profile: starts at ${fmtAlt(elevs[0])}, peaks at ${fmtAlt(peak)}, ends at ${fmtAlt(elevs[elevs.length - 1])}`}
        >
          <defs>
            <linearGradient id="altfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--terracotta)" stopOpacity=".30" />
              <stop offset="1" stopColor="var(--terracotta)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={area} fill="url(#altfill)" />
          <polyline points={line} fill="none" stroke="var(--terracotta)" strokeWidth="2.4"
            strokeLinejoin="round" strokeLinecap="round" />
          <line x1={PAD_L - 8} y1={BOT} x2={W - PAD_R + 8} y2={BOT} stroke="var(--line-2)" strokeWidth="1" />

          {pts.map((s, i) => {
            const done = visited.has(s.id), now = s.id === activeId;
            const fill = now ? 'var(--saffron)' : done ? 'var(--enamel)' : 'var(--paper-2)';
            const stroke = now ? 'var(--saffron)' : done ? 'var(--enamel)' : 'var(--line-2)';
            const tf = now ? '#3A2A0A' : done ? '#FFFFFF' : 'var(--ink-faint)';
            return (
              <g key={s.id} className="rdot" role="button" tabIndex={0}
                aria-label={`${s.title}, ${fmtAlt(elevs[i])}`}
                onClick={() => onPick(s.id)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(s.id); } }}
              >
                <circle cx={xs[i]} cy={ys[i]} r={now ? 9 : 7.5} fill={fill} stroke={stroke} strokeWidth="2" />
                <text x={xs[i]} y={ys[i] + 3.2} textAnchor="middle" fill={tf}>{i + 1}</text>
                <text x={xs[i]} y={BOT + 17} textAnchor="middle" fill="var(--ink-faint)"
                  style={{ fontSize: 8.5, fontWeight: 600 }}>{elevs[i].toLocaleString('en-US')}</text>
                <text x={xs[i]} y={BOT + 28} textAnchor="middle" fill="var(--ink-faint)"
                  style={{ fontSize: 8, fontWeight: 500, opacity: .75 }}>{s.time}</text>
              </g>
            );
          })}

          <g className="ribcar" transform={`translate(${cx.toFixed(1)},${(cy - 21).toFixed(1)})`}>
            <circle cx="0" cy="0" r="11.5" fill="var(--paper)" stroke="var(--saffron)" strokeWidth="2.2" />
            <g transform="translate(-8,-8) scale(.666)" style={{ color: 'var(--terracotta)' }}>{GLYPHS.car}</g>
          </g>
        </svg>
      </div>
    </section>
  );
}
