import { useState } from 'react';
import SplashScreen from '@/components/splash/SplashScreen';

const SESSION_KEY = 'cmsr_splash_shown';

/**
 * Decide whether to play the brand splash for this document load.
 * - First visit in the tab  → show (then remember)
 * - Hard refresh (F5)        → show (reload always replays it)
 * - Back/forward navigation  → skip
 * - In-app (SPA) navigation  → never remounts this gate, so it never replays
 */
function shouldPlaySplash() {
  if (typeof window === 'undefined') return false;

  let navType;
  try {
    navType = performance.getEntriesByType('navigation')[0]?.type;
  } catch {
    navType = undefined;
  }

  if (navType === 'reload') return true;
  if (navType === 'back_forward') return false;

  // First 'navigate' load in this tab shows it; subsequent full loads don't.
  let alreadyShown = false;
  try {
    alreadyShown = sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    alreadyShown = false;
  }
  return !alreadyShown;
}

/** Shows brand splash on refresh / first load only — not on route changes. */
export default function SplashGate({ children }) {
  const [splashDone, setSplashDone] = useState(() => !shouldPlaySplash());

  const finish = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* ignore storage errors */
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
