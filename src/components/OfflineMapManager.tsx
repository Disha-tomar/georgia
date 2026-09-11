import { useOfflineMap, fmtMB } from '../hooks/useOfflineMap';
import { Icon } from './StopIcon';

/** The one control that decides whether the map works at Jvari Pass. */
export function OfflineMapManager() {
  const { state, persisted, download, remove } = useOfflineMap();

  const pct = state.kind === 'downloading' && state.total
    ? Math.round((state.received / state.total) * 100)
    : 0;

  return (
    <div className="setrow" style={{ display: 'block' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <b>Georgia basemap</b>
          <small>
            {state.kind === 'checking' && 'Checking…'}
            {state.kind === 'absent' && '64 MB · not downloaded. The map needs a connection until you do this.'}
            {state.kind === 'partial' && `Incomplete — ${state.have} of ${state.chunks} pieces stored. Download again.`}
            {state.kind === 'downloading' && (state.total
              ? `${fmtMB(state.received)} of ${fmtMB(state.total)}`
              : `${fmtMB(state.received)} downloaded`)}
            {state.kind === 'ready' && `${fmtMB(state.bytes)} stored — the map works with the radio off.`}
            {state.kind === 'error' && state.message}
          </small>
        </div>

        {(state.kind === 'absent' || state.kind === 'partial') && (
          <button className="btn p" style={{ flex: 'none', minWidth: 0, padding: '0 14px' }}
            onClick={download}>Download</button>
        )}
        {state.kind === 'error' && (
          <button className="btn" style={{ flex: 'none', minWidth: 0, padding: '0 14px' }}
            onClick={download}>Retry</button>
        )}
        {state.kind === 'ready' && (
          <button className="btn" style={{ flex: 'none', minWidth: 0, padding: '0 14px' }}
            onClick={remove}>Remove</button>
        )}
      </div>

      {state.kind === 'downloading' && (
        <>
          <div className="bar" style={{ marginTop: 12 }}><i style={{ width: pct + '%' }} /></div>
          <div className="barlab">
            <span>{pct}%</span>
            <span>Keep this screen open</span>
          </div>
        </>
      )}

      {state.kind === 'absent' && (
        <div className="warnline">
          <Icon ui="alt" />
          Do this on hotel wifi — not on roaming data.
        </div>
      )}

      {state.kind === 'ready' && persisted === false && (
        <div className="warnline">
          <Icon ui="alt" />
          Storage is not marked persistent, so the phone may evict this if it runs low.
          Worth re-checking the night before you fly.
        </div>
      )}
    </div>
  );
}
