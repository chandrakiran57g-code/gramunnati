import { useState } from 'react';
import SplashScreen from '@/components/splash/SplashScreen';

/** Shows brand splash on every page load / refresh */
export default function SplashGate({ children }) {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}
      <div className={splashDone ? undefined : 'invisible'} aria-hidden={!splashDone}>
        {children}
      </div>
    </>
  );
}
