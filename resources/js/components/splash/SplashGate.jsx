import { useEffect, useState } from 'react';
import { useNavigationType } from 'react-router-dom';
import SplashScreen from '@/components/splash/SplashScreen';

const SESSION_KEY = 'cmsr_splash_shown';
const SESSION_STARTED_KEY = 'cmsr_splash_started';

function readStorage(key) {
  try {
    return sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function writeStorage(key) {
  try {
    sessionStorage.setItem(key, '1');
  } catch {
    /* ignore */
  }
}

function markSplashIntroduced() {
  writeStorage(SESSION_KEY);
  writeStorage(SESSION_STARTED_KEY);
}

function hasSplashIntroducedThisTab() {
  return readStorage(SESSION_KEY) || readStorage(SESSION_STARTED_KEY);
}

function getDocumentNavType() {
  try {
    return performance.getEntriesByType('navigation')[0]?.type;
  } catch {
    return undefined;
  }
}

/**
 * Splash only on:
 * - Hard refresh (F5 / reload) in this tab
 * - First full document entry for this tab (open site / new tab)
 *
 * Never on:
 * - SPA route changes (including back to home)
 * - Browser back / forward
 * - Back pressed while splash is still animating
 */
function shouldPlaySplash(routerNavType) {
  if (typeof window === 'undefined') return false;

  const docNavType = getDocumentNavType();

  if (docNavType === 'back_forward') return false;

  // React Router remount after history navigation — skip if tab already saw splash
  if (routerNavType === 'POP' && hasSplashIntroducedThisTab()) return false;

  if (docNavType === 'reload') return true;

  if (hasSplashIntroducedThisTab()) return false;

  // Mark immediately so back during the animation cannot replay splash this tab
  writeStorage(SESSION_STARTED_KEY);
  return true;
}

export default function SplashGate({ children }) {
  const routerNavType = useNavigationType();
  const [splashDone, setSplashDone] = useState(() => !shouldPlaySplash(routerNavType));

  const finish = () => {
    markSplashIntroduced();
    setSplashDone(true);
  };

  const dismissSplash = () => {
    markSplashIntroduced();
    setSplashDone(true);
  };

  useEffect(() => {
    const onPageShow = (event) => {
      if (event.persisted || hasSplashIntroducedThisTab()) {
        dismissSplash();
      }
    };

    const onPopState = () => {
      dismissSplash();
    };

    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  return (
    <>
      {!splashDone && <SplashScreen onComplete={finish} />}
      {splashDone && children}
    </>
  );
}
