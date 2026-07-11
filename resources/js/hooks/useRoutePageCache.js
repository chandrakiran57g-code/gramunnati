import { useEffect, useRef, useState } from 'react';
import { getRouteCache, hasRouteCache, setRouteCache } from '@/lib/routeMemoryCache';

/**
 * Restore cached page data on back navigation and avoid fullscreen loading flashes.
 */
export function useRoutePageCache(cacheKey, load, deps = []) {
  const cached = getRouteCache(cacheKey);
  const [data, setData] = useState(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    let active = true;
    const snapshot = getRouteCache(cacheKey);

    if (snapshot) {
      setData(snapshot);
      setLoading(false);
    } else {
      setLoading(true);
    }

    (async () => {
      try {
        const next = await loadRef.current(snapshot);
        if (!active) return;
        setRouteCache(cacheKey, next);
        setData(next);
      } catch {
        if (!active) return;
        if (!hasRouteCache(cacheKey)) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [cacheKey, ...deps]);

  return {
    data,
    loading,
    showBlockingLoader: loading && !data,
    setData: (next) => {
      setRouteCache(cacheKey, next);
      setData(next);
    },
  };
}
