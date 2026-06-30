import { useState, useEffect, useCallback } from 'react';
import { cmsService } from '@/api/cms';
import { PLATFORM_DATA_CHANGED, PLATFORM_STORAGE_KEY } from '@/lib/platformRefresh';
import { DEFAULT_NAV_CONFIG } from '@/lib/navConfig';

/** Shared navbar data — used by public Navbar and admin preview */
export function usePlatformNavData() {
  const [navConfig, setNavConfig] = useState(DEFAULT_NAV_CONFIG);
  const [cmsPages, setCmsPages] = useState([]);
  const [cmsNavGroups, setCmsNavGroups] = useState({});
  const [teamGroups, setTeamGroups] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [config, pages, groups, teams, progs] = await Promise.all([
        cmsService.getNavConfig().catch(() => DEFAULT_NAV_CONFIG),
        cmsService.listPublishedPages().catch(() => []),
        cmsService.getCmsNavGroups().catch(() => ({})),
        cmsService.listTeamGroups({ activeOnly: true }).catch(() => []),
        cmsService.listPrograms({ activeOnly: true }).catch(() => []),
      ]);
      setNavConfig(config);
      setCmsPages(pages);
      setCmsNavGroups(groups);
      setTeamGroups(teams);
      setPrograms(progs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    const onStorage = (event) => {
      if (event.key === PLATFORM_STORAGE_KEY) onChange();
    };
    window.addEventListener(PLATFORM_DATA_CHANGED, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(PLATFORM_DATA_CHANGED, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  const aboutPages = cmsPages.filter((p) => {
    const group = cmsNavGroups[p.id];
    if (group === 'hidden' || group === 'standalone') return false;
    return group === 'about_us' || group === undefined;
  });

  return {
    navConfig,
    cmsPages,
    cmsNavGroups,
    aboutPages,
    teamGroups,
    programs,
    loading,
    refresh,
  };
}
