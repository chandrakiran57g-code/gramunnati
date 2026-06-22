import { useState, useEffect, useCallback } from 'react';
import { getGalleryCollections } from '@/api/gallery';
import { galleryCollections as fallbackCollections } from '@/lib/galleryData';
import { PLATFORM_DATA_CHANGED } from '@/lib/platformRefresh';

export function useGalleryCollections() {
  const [collections, setCollections] = useState(fallbackCollections);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getGalleryCollections({ fallback: true });
      setCollections(data);
    } catch {
      setCollections(fallbackCollections);
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
