import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DAYS } from './data/itinerary';
import { elevationOf, fmtAlt, currentDayNumber, scheduledStopIndex } from './lib/stops';
import { useTripProgress } from './hooks/useTripProgress';
import { Icon } from './components/StopIcon';
import { AltitudeProfile } from './components/AltitudeProfile';
import { StopCard } from './components/StopCard';
import { TripMap } from './components/TripMap';

type Tab = 'days' | 'map' | 'food' | 'settings';

/**
 * Deep link state in the hash: #/day/3/map
 * Lets a link point at a specific day and pane, and keeps the back button
 * meaningful on a phone without pulling in a router.
 */
function readHash(): { day?: number; tab?: Tab } {
  const m = /^#\/day\/(\d)(?:\/(days|map|food|settings))?$/.exec(location.hash);
  if (!m) return {};
  return { day: +m[1], tab: (m[2] as Tab) ?? 'days' };
}

export default function App() {
  const tripDay = currentDayNumber();
  const initial = readHash();
  const [dayN, setDayN] = useState(initial.day ?? tripDay ?? 1);
  const [tab, setTab] = useState<Tab>(initial.tab ?? 'days');
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');
  const [clock, setClock] = useState(() => new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const { visited, checked, toggleVisited, toggleChecked } = useTripProgress();
  const day = DAYS[dayN - 1];

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  /* Keep the hash in step, and respond to back/forward. */
  useEffect(() => {
    const want = `#/day/${dayN}/${tab}`;
    if (location.hash !== want) history.replaceState(null, '', want);
  }, [dayN, tab]);

  useEffect(() => {
    const onHash = () => {
      const h = readHash();
      if (h.day) setDayN(h.day);
      if (h.tab) setTab(h.tab);
    };
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2600);
  }, []);

  /* Where the schedule says you are. Only meaningful on the actual day —
     otherwise the rail highlights nothing rather than lying about it. */
  const nowIdx = useMemo(
    () => (tripDay === dayN ? scheduledStopIndex(day.stops, clock) : -1),
    [tripDay, dayN, day.stops, clock],
  );
  const nowStop = nowIdx >= 0 ? day.stops[nowIdx] : null;
  const nextStop = nowIdx >= 0 ? day.stops[nowIdx + 1] : null;

  const goDay = (n: number) => {
    setDayN(n);
    setOpenIds(new Set());
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const toggleOpen = (id: string) =>
    setOpenIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const doneCount = day.stops.filter(s => visited.has(s.id)).length;
  const pct = Math.round((doneCount / day.stops.length) * 100);

  return (
    <>
      <div className="grain" />
      <div className="stage">
        <div className="phone">
          <header className="topbar">
            <div className="brand">
              <span className="flag" aria-hidden="true"><i /><i /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1>Georgia</h1>
                <div className="sub">Day {day.n} of 9 · {day.label}</div>
              </div>
              <button className="iconbtn" aria-label="Toggle dark mode" onClick={toggleTheme}>
                <Icon ui="moon" />
              </button>
            </div>

            <div className="daystrip">
              <button className="nav" aria-label="Previous day" disabled={dayN <= 1}
                onClick={() => goDay(dayN - 1)}><Icon ui="left" /></button>
              <div className="days" role="tablist">
                {DAYS.map(d => (
                  <button key={d.n} className="day" role="tab"
                    aria-current={d.n === dayN}
                    data-past={d.n < dayN ? '1' : undefined}
                    aria-label={`Day ${d.n}, ${d.label}, ${d.from} to ${d.to}`}
                    onClick={() => goDay(d.n)}>
                    <b>{d.n}</b><s>{d.dd}</s>
                  </button>
                ))}
              </div>
              <button className="nav" aria-label="Next day" disabled={dayN >= 9}
                onClick={() => goDay(dayN + 1)}><Icon ui="right" /></button>
            </div>
          </header>

          {/* The map fills its pane and manages its own gestures, so it sits
              outside the scroll container rather than inside it. */}
          {tab === 'map' ? (
            <TripMap
              day={day}
              stops={day.stops}
              activeId={nowStop?.id ?? null}
              visited={visited}
              onPick={id => {
                const s = day.stops.find(x => x.id === id);
                if (s) showToast(`${s.time} · ${s.title}`);
              }}
            />
          ) : (
          <div className="scroll" ref={scrollRef}>
            {tab === 'days' ? (
              <>
                <section className="nowbar">
                  <div className="nowtop">
                    <span className="pulse" />
                    <span className="lab">{nowStop ? 'Now' : 'Plan'}</span>
                    <span className="clock">
                      {clock.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="nowmain">
                    <span className="car"><Icon kind="car" /></span>
                    <div className="nowtext">
                      <div className="at">{nowStop ? nowStop.title : `${day.from} → ${day.to}`}</div>
                      <div className="nx">
                        {nextStop ? (
                          <>Next <b>{nextStop.title}</b>
                            {nextStop.drive && <> · {nextStop.drive.mins} min · {nextStop.drive.km} km</>}
                            {' · arrive '}{nextStop.time}</>
                        ) : nowStop ? (
                          <>Final stop of the day — {nowStop.kicker}</>
                        ) : (
                          <>{day.stops.length} stops{day.distanceKm ? ` · ${day.distanceKm} km` : ''}</>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bar"><i style={{ width: pct + '%' }} /></div>
                  <div className="barlab">
                    <span>{doneCount} of {day.stops.length} stops done</span>
                    <span>
                      {nowStop && elevationOf(nowStop.id) !== undefined
                        ? fmtAlt(elevationOf(nowStop.id)!)
                        : day.departAt ? `depart ${day.departAt}` : 'no driving'}
                    </span>
                  </div>
                </section>

                <AltitudeProfile
                  stops={day.stops}
                  activeId={nowStop?.id ?? null}
                  visited={visited}
                  onPick={id => {
                    setOpenIds(new Set([id]));
                    document.querySelector(`[data-stop="${id}"]`)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                />

                <div className="leg">
                  <h2 dangerouslySetInnerHTML={{ __html: day.headline }} />
                  {day.distanceKm && <span className="km">{day.distanceKm} km</span>}
                </div>
                <p className="legsub">{day.sub}</p>

                {!!day.checklist?.length && (
                  <section className="checklist">
                    <h4>Before you leave</h4>
                    {day.checklist.map(c => {
                      const key = `${day.n}:${c}`;
                      return (
                        <label key={key}>
                          <input type="checkbox" checked={checked.has(key)}
                            onChange={() => toggleChecked(key)} />
                          <span>{c}</span>
                        </label>
                      );
                    })}
                  </section>
                )}

                <div className="rail">
                  {day.stops.map((s, i) => (
                    <div key={s.id} data-stop={s.id}>
                      <StopCard
                        stop={s}
                        open={openIds.has(s.id)}
                        isNow={i === nowIdx}
                        visited={visited.has(s.id)}
                        onToggleOpen={() => toggleOpen(s.id)}
                        onToggleVisited={() => {
                          toggleVisited(s.id);
                          showToast(visited.has(s.id) ? `${s.title} — unmarked` : `${s.title} — visited`);
                        }}
                        onToast={showToast}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <Placeholder tab={tab} />
            )}
          </div>
          )}

          <nav className="tabbar">
            {([
              ['days', 'home', 'Days'],
              ['map', 'map', 'Map'],
              ['food', 'khinkali', 'Food'],
              ['settings', 'gear', 'Settings'],
            ] as const).map(([id, icon, label]) => (
              <button key={id} className="tab" aria-current={tab === id} onClick={() => setTab(id as Tab)}>
                {icon === 'khinkali' ? <Icon kind="khinkali" /> : <Icon ui={icon} />}
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className={'toast' + (toast ? ' on' : '')}>{toast}</div>
    </>
  );
}

function Placeholder({ tab }: { tab: Tab }) {
  const copy = {
    map: ['Map', 'Full-screen offline map with your car tracked live. Arrives with the MapLibre and basemap work.'],
    food: ['Food', 'Every restaurant across all nine days in one list, searchable. 27 picks are already in the data.'],
    settings: ['Settings', 'Offline map download, units, wake lock and the full photo credits list.'],
  }[tab as 'map' | 'food' | 'settings'];
  return (
    <div className="holder">
      <Icon ui="map" />
      <h3>{copy[0]}</h3>
      <p>{copy[1]}</p>
    </div>
  );
}

function toggleTheme() {
  const root = document.documentElement;
  const isDark = root.getAttribute('data-theme') === 'dark' ||
    (!root.hasAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
  const next = isDark ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('gt-theme', next); } catch { /* private mode */ }
}
