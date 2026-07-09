import { useState } from 'react';
import SplashScreen from '@/components/splash/SplashScreen';

const SESSION_KEY = 'cmsr_splash_shown';

/**
 * Splash only on:
 * - Hard refresh (F5 / reload) in this tab
 * - First full document entry for this tab (open site / new tab)
 *
 * Never on:
 * - SPA route changes (including returning to home)
 * - Browser back / forward
 */
function shouldPlaySplash() {
  if (typeof window === 'undefined') return false;

  let navType;
  try {
    navType = performance.getEntriesByType('navigation')[0]?.type;
  } catch {
    navType = undefined;
  }

  if (navType === 'back_forward') return false;

  try {
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      // Already introduced this tab — only show again on hard refresh
      return navType === 'reload';
    }
  } catch {
    /* sessionStorage unavailable: fall through */
  }

  // First entry in this tab (or refresh before key was set)
  return true;
}

export default function SplashGate({ children }) {
  const [splashDone, setSplashDone] = useState(() => !shouldPlaySplash());

  const finish = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* ignore */
    }
    setSplashDone(true);
  };

  return (
    <>
      {!splashDone && <SplashScreen onComplete={finish} />}
      <div className={splashDone ? undefined : 'invisible'} aria-hidden={!splashDone}>
        {children}
      </div>
    </>
  );
}
