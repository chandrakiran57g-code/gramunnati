import { useState } from 'react';
import SplashScreen from '@/components/splash/SplashScreen';

const SESSION_KEY = 'cmsr_splash_shown';

/**
 * Splash plays only when:
 * - Hard refresh (F5) on any page
 * - First full document load of the homepage (/) in this tab
 * Never on: browser back/forward, SPA route changes, revisiting / via in-app links
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
  if (navType === 'reload') return true;

  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path !== '/') return false;

  try {
    return sessionStorage.getItem(SESSION_KEY) !== '1';
  } catch {
    return true;
  }
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
