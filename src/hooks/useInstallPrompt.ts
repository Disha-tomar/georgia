/**
 * Install-to-home-screen.
 *
 * Chrome and Edge fire `beforeinstallprompt`, which we stash and replay from a
 * button. Safari on iOS has no such event — installing there is Share → Add to
 * Home Screen — so we detect iOS and give the instructions instead of showing
 * a button that would do nothing.
 */
import { useEffect, useState } from 'react';

type InstallEvent = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(
    () => typeof matchMedia !== 'undefined' && matchMedia('(display-mode: standalone)').matches,
  );

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault(); // keep it for our own button
      setDeferred(e as InstallEvent);
    };
    const onInstalled = () => { setInstalled(true); setDeferred(null); };
    addEventListener('beforeinstallprompt', onPrompt);
    addEventListener('appinstalled', onInstalled);
    return () => {
      removeEventListener('beforeinstallprompt', onPrompt);
      removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferred(null); // a prompt can only be used once
  };

  return { canInstall: !!deferred, installed, isIOS, install };
}
