import { useEffect } from 'react';
import { PLATFORM_DATA_CHANGED, PLATFORM_STORAGE_KEY } from '@/lib/platformRefresh';

/** Re-run callback when admin saves content (same tab or another tab). */
export function usePlatformRefresh(callback) {
  useEffect(() => {
    const onEvent = (event) => callback(event?.detail || {});
    const onStorage = (event) => {
      if (event.key === PLATFORM_STORAGE_KEY) callback({});
    };
    window.addEventListener(PLATFORM_DATA_CHANGED, onEvent);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(PLATFORM_DATA_CHANGED, onEvent);
      window.removeEventListener('storage', onStorage);
    };
  }, [callback]);
}
