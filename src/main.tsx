import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './theme.css';

/* Restore the saved theme before first paint so there is no flash. */
try {
  const saved = localStorage.getItem('gt-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
} catch { /* private mode */ }

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
);
