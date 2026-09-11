import { useState } from 'react';
import type { Stop } from '../data/types';
import { elevationOf, fmtAlt, photoOf } from '../lib/stops';
import { Icon } from './StopIcon';
import { describeCode, type DayWeather } from '../lib/weather';
import { PriceTier } from './PriceTier';

export function StopCard({
  stop, open, isNow, visited, weather, onToggleOpen, onToggleVisited, onToast,
}: {
  stop: Stop;
  weather?: DayWeather;
  open: boolean;
  isNow: boolean;
  visited: boolean;
  onToggleOpen: () => void;
  onToggleVisited: () => void;
  onToast: (msg: string) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);
  const photo = photoOf(stop);
  const elev = elevationOf(stop.id);

  const copyCoords = () => {
    const c = `${stop.lat.toFixed(5)}, ${stop.lon.toFixed(5)}`;
    navigator.clipboard?.writeText(c).then(() => onToast('Copied ' + c), () => onToast(c));
  };

  /*
   * Hand off to whatever mapping app the phone has. geo: is the offline-capable
   * one and is handled natively on Android; iOS ignores it, so fall back to a
   * Google Maps URL. Either way the coordinates are also one tap from the
   * clipboard, which works when both fail.
   */
  const navigateTo = () => {
    const { lat, lon, title } = stop;
    const geo = `geo:${lat},${lon}?q=${lat},${lon}(${encodeURIComponent(title)})`;
    const web = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    const isAndroid = /android/i.test(navigator.userAgent);
    window.open(isAndroid ? geo : web, "_blank", "noopener");
  };

  return (
    <article
      className="stop"
      data-done={visited ? '1' : undefined}
      data-now={isNow ? '1' : undefined}
      data-open={open ? '1' : undefined}
    >
      <span className="node">{visited ? <Icon ui="check" /> : <Icon kind={stop.kind} />}</span>

      <div className="card">
        <button className="chead" aria-expanded={open} onClick={onToggleOpen}>
          <span className="ctime">{stop.time}</span>
          <span className="cbody">
            <span className="ctitle">{stop.title}</span>
            <span className="ckicker">{stop.kicker}</span>
            <span className="chips">
              {stop.drive && (
                <span className="chip drv"><Icon kind="car" />{stop.drive.mins} min · {stop.drive.km} km</span>
              )}
              {elev !== undefined && !stop.transit && (
                <span className="chip alt"><Icon ui="alt" />{fmtAlt(elev)}</span>
              )}
              {weather && (
                <span className="chip wx" title={describeCode(weather.code).label}>
                  <Icon ui={describeCode(weather.code).icon} />
                  {weather.tMax}° / {weather.tMin}°
                </span>
              )}
              {stop.dwell && <span className="chip"><Icon ui="clock" />{stop.dwell}</span>}
              {!!stop.food?.length && (
                <span className="chip food"><Icon kind="khinkali" />{stop.food.length} to eat</span>
              )}
            </span>
          </span>
          <span className="chev"><Icon ui="chev" /></span>
        </button>

        <div className="cwrap"><div><div className="cinner">
          {photo && !broken ? (
            <div className="photo">
              <img
                src={photo.full}
                alt={stop.title}
                loading="lazy"
                className={loaded ? 'on' : undefined}
                onLoad={() => setLoaded(true)}
                onError={() => setBroken(true)}
              />
              <span className="cred">{photo.credit.artist} · {photo.credit.license} · Wikimedia</span>
            </div>
          ) : (
            <div className="nophoto">
              <Icon kind={stop.kind} />
              <span>{stop.photoNote ?? 'No photo available'}</span>
            </div>
          )}

          {stop.blurb.map((p, i) => <p className="blurb" key={i}>{p}</p>)}

          {weather && (
            <div className="wxrow">
              <span><Icon ui={describeCode(weather.code).icon} />{describeCode(weather.code).label}</span>
              <span>{weather.tMax}° / {weather.tMin}°</span>
              {weather.rainChance > 15 && <span>{weather.rainChance}% rain</span>}
              {weather.windMax > 25 && <span>{weather.windMax} km/h wind</span>}
              {weather.sunset && <span>sets {weather.sunset}</span>}
            </div>
          )}

          {stop.ticket && (
            <div className="ticket">
              <Icon ui="ticket" />
              <div>
                {stop.ticket.priceGel !== undefined && <b>{stop.ticket.priceGel} GEL. </b>}
                {stop.ticket.note}
              </div>
            </div>
          )}

          {!!stop.tips?.length && (
            <div className="tips"><ul>{stop.tips.map((t, i) => <li key={i}>{t}</li>)}</ul></div>
          )}

          <div className="slab">Eat here</div>
          {stop.food?.length ? (
            stop.food.map(f => (
              <div className="food-item" key={f.name}>
                <span className="fi"><Icon kind={f.kind === 'winery' || f.kind === 'wine-bar' ? 'wine' : 'khinkali'} /></span>
                <div className="fb">
                  <div className="fn">{f.name} <PriceTier price={f.price} /></div>
                  <div className="fw">{f.why}</div>
                  {f.dish && <div className="fd">{f.dish}</div>}
                </div>
              </div>
            ))
          ) : (
            <div className="food-none">{stop.foodNote}</div>
          )}

          <div className="slab">Where it is</div>
          <div className="acts">
            <button className="btn p" onClick={navigateTo}>
              <Icon ui="nav" />Navigate
            </button>
            <button className="btn" onClick={copyCoords}>
              <Icon ui="pin" />{stop.lat.toFixed(3)}, {stop.lon.toFixed(3)}
            </button>
            <button className={'btn' + (visited ? ' done' : '')} onClick={onToggleVisited}>
              <Icon ui="check" />{visited ? 'Visited' : 'Mark visited'}
            </button>
          </div>
        </div></div></div>
      </div>
    </article>
  );
}
