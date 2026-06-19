import { useQuery } from '@tanstack/react-query';
import { homeService } from '@/api/home';

export function useHomeData() {
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
