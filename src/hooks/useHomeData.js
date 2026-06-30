import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { homeService } from '@/api/home';
import { PLATFORM_DATA_CHANGED, PLATFORM_STORAGE_KEY } from '@/lib/platformRefresh';

export function useHomeData() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const onChange = () => {
      queryClient.invalidateQueries({ queryKey: ['home-page'] });
    };
    const onStorage = (event) => {
      if (event.key === PLATFORM_STORAGE_KEY) onChange();
    };
    window.addEventListener(PLATFORM_DATA_CHANGED, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(PLATFORM_DATA_CHANGED, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['home-page'],
    queryFn: () => homeService.getPageData(),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function formatStat(n, suffix = '+') {
  if (!n) return '0';
  return `${n.toLocaleString('en-IN')}${suffix}`;
}
