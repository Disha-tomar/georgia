/**
 * Every place to eat across the whole trip, in one list.
 *
 * The rail answers "what's at this stop"; this answers the other question —
 * "we're hungry, what did we pick" — without remembering which day Martvili
 * was. Grouped by day so it still reads as a journey, searchable because by
 * day six you will remember the dish and not the name.
 */
import { useMemo, useState } from 'react';
import { DAYS } from '../data/itinerary';
import type { FoodPick } from '../data/types';
import { Icon } from './StopIcon';
import { PriceTier } from './PriceTier';

type Row = {
  food: FoodPick;
  dayN: number;
  dayLabel: string;
  stopId: string;
  stopTitle: string;
  time: string;
};

const ROWS: Row[] = DAYS.flatMap(d =>
  d.stops.flatMap(s =>
    (s.food ?? []).map(food => ({
      food, dayN: d.n, dayLabel: d.label, stopId: s.id, stopTitle: s.title, time: s.time,
    })),
  ),
);

export function FoodList({ onOpen }: { onOpen: (dayN: number, stopId: string) => void }) {
  const [q, setQ] = useState('');
  const [maxPrice, setMaxPrice] = useState(3);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ROWS.filter(r =>
      r.food.price.length <= maxPrice &&
      (!needle ||
        r.food.name.toLowerCase().includes(needle) ||
        r.food.why.toLowerCase().includes(needle) ||
        (r.food.dish ?? '').toLowerCase().includes(needle) ||
        r.stopTitle.toLowerCase().includes(needle)),
    );
  }, [q, maxPrice]);

  const byDay = useMemo(() => {
    const m = new Map<number, Row[]>();
    for (const r of rows) {
      const list = m.get(r.dayN) ?? [];
      list.push(r);
      m.set(r.dayN, list);
    }
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [rows]);

  return (
    <div className="foodtab">
      <div className="foodhead">
        <h2>Where to eat</h2>
        <p>{ROWS.length} picks across the nine days, each one researched and sourced.</p>
      </div>

      <div className="foodfilters">
        <input
          className="foodsearch"
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search khinkali, elarji, a town…"
          aria-label="Search places to eat"
        />
        <div className="pricefilter" role="group" aria-label="Maximum price">
          {[1, 2, 3].map(n => (
            <button
              key={n}
              aria-pressed={maxPrice === n}
              className={maxPrice === n ? 'on' : undefined}
              onClick={() => setMaxPrice(n)}
            >
              {'●'.repeat(n)}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 && (
        <div className="holder" style={{ marginTop: 18 }}>
          <Icon kind="khinkali" />
          <h3>Nothing matches</h3>
          <p>Try a different word, or raise the price filter.</p>
        </div>
      )}

      {byDay.map(([dayN, list]) => (
        <section key={dayN}>
          <div className="slab" style={{ margin: '18px 14px 7px' }}>
            Day {dayN} · {list[0].dayLabel}
          </div>
          {list.map(r => (
            <button
              key={r.dayN + r.stopId + r.food.name}
              className="foodrow"
              onClick={() => onOpen(r.dayN, r.stopId)}
            >
              <span className="fi">
                <Icon kind={r.food.kind === 'winery' || r.food.kind === 'wine-bar' ? 'wine' : 'khinkali'} />
              </span>
              <span className="fb">
                <span className="fn">{r.food.name} <PriceTier price={r.food.price} /></span>
                <span className="fwhere">{r.time} · {r.stopTitle}</span>
                <span className="fw">{r.food.why}</span>
                {r.food.dish && <span className="fd">{r.food.dish}</span>}
              </span>
              <span className="chev"><Icon ui="chev" /></span>
            </button>
          ))}
        </section>
      ))}

      <p className="setnote">
        Researched from Wander-Lush, Culinary Backstreets, Tripadvisor and others — every pick
        carries its source in the data. Places close and change hands; treat these as strong
        starting points, not guarantees.
      </p>
    </div>
  );
}
