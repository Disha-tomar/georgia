import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './theme.css';

/* Restore the saved theme before first paint so there is no flash. */
try {
  const saved = localStorage.getItem('gt-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
} catch { /* private mode */ }

/**
 * Updates are offered, never forced. Reloading unprompted mid-drive — while
 * you are reading the next stop — would be the wrong trade for freshness.
 */
let applyUpdate: (reload?: boolean) => Promise<void> = async () => {};
const updateListeners = new Set<() => void>();

applyUpdate = registerSW({
  onNeedRefresh() { updateListeners.forEach(fn => fn()); },
  onOfflineReady() { console.info('[pwa] ready to work offline'); },
});

function UpdateBar() {
  const [waiting, setWaiting] = useState(false);
  useEffect(() => {
    const fn = () => setWaiting(true);
    updateListeners.add(fn);
    return () => { updateListeners.delete(fn); };
  }, []);
  if (!waiting) return null;
  return (
    <div className="updatebar" role="status">
      <span>A newer version is ready</span>
      <button onClick={() => applyUpdate(true)}>Reload</button>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <UpdateBar />
  </StrictMode>,
);
