import { useState, useEffect, useCallback } from 'react';
import { getGalleryCollections } from '@/api/gallery';
import { PLATFORM_DATA_CHANGED } from '@/lib/platformRefresh';

export function useGalleryCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getGalleryCollections();
      setCollections(data);
    } catch {
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener(PLATFORM_DATA_CHANGED, onChange);
    return () => window.removeEventListener(PLATFORM_DATA_CHANGED, onChange);
  }, [refresh]);

  return { collections, loading, refresh };
}
