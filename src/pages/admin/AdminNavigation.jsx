import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cmsService } from '@/api/cms';
import { Navigation, GripVertical, Eye, EyeOff, ArrowUp, ArrowDown, Save, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CMS_STATUS, isCmsPagePublic } from '@/lib/cmsStatus';
import { DEFAULT_NAV_CONFIG } from '@/lib/navConfig';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';
import { adminRoutes } from '@/lib/adminRoutes';

export default function AdminNavigation() {
  const [navConfig, setNavConfig] = useState(DEFAULT_NAV_CONFIG);
  const [cmsPages, setCmsPages] = useState([]);
  const [cmsNavGroups, setCmsNavGroups] = useState({});
  const [teamGroups, setTeamGroups] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [itemSaving, setItemSaving] = useState({});

  const loadAll = async () => {
    setLoading(true);
    try {
      const [config, pages, groups, teams, progs] = await Promise.all([
        cmsService.getNavConfig(),
        cmsService.listPages(),
        cmsService.getCmsNavGroups(),
        cmsService.listTeamGroups(),
        cmsService.listPrograms(),
      ]);
      setNavConfig(config?.items ? config : DEFAULT_NAV_CONFIG);
      setCmsPages(pages);
      setCmsNavGroups(groups);
      setTeamGroups(teams);
      setPrograms(progs);
    } catch (err) {
      toast.error(err.message || 'Failed to load navigation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const aboutPages = cmsPages.filter((p) => {
    const g = cmsNavGroups[p.id];
    return g === 'about_us' || g === undefined;
  });

  const saveNavConfig = async (nextConfig) => {
    setSaving(true);
    try {
      await cmsService.saveNavConfig(nextConfig);
      setNavConfig(nextConfig);
      notifyPlatformDataChanged({ type: 'nav_config' });
      toast.success('Navigation updated — live on website');
    } catch (err) {
      toast.error(err.message || 'Failed to save navigation');
    } finally {
      setSaving(false);
    }
  };

  const toggleTopLevel = async (key) => {
    const items = navConfig.items.map((item) =>
      item.key === key ? { ...item, enabled: !item.enabled } : item
    );
    await saveNavConfig({ items });
  };

  const moveItem = async (key, direction) => {
    const items = [...navConfig.items].sort((a, b) => a.order - b.order);
    const idx = items.findIndex((i) => i.key === key);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const a = items[idx].order;
    items[idx].order = items[swapIdx].order;
    items[swapIdx].order = a;
    await saveNavConfig({ items });
  };

  const togglePageStatus = async (page) => {
    setItemSaving((p) => ({ ...p, [page.id]: true }));
    try {
      const newStatus = isCmsPagePublic(page.status) ? CMS_STATUS.INACTIVE : CMS_STATUS.ACTIVE;
      await cmsService.updatePage(page.id, { status: newStatus });
      notifyPlatformDataChanged({ type: 'cms_pages' });
      toast.success(`${page.title} ${newStatus === CMS_STATUS.ACTIVE ? 'enabled' : 'disabled'}`);
      loadAll();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setItemSaving((p) => ({ ...p, [page.id]: false }));
    }
  };

  const toggleEntityStatus = async (entity, item, activeValue, inactiveValue) => {
    setItemSaving((p) => ({ ...p, [item.id]: true }));
    try {
      const isActive = item.status === activeValue;
      const newStatus = isActive ? inactiveValue : activeValue;
      if (entity === 'team') await cmsService.updateTeamGroup(item.id, { status: newStatus });
      if (entity === 'program') await cmsService.updateProgram(item.id, { status: newStatus });
      notifyPlatformDataChanged({ type: entity });
      toast.success('Updated — live on website');
      loadAll();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setItemSaving((p) => ({ ...p, [item.id]: false }));
    }
  };

  const sortedItems = [...(navConfig.items || [])].sort((a, b) => a.order - b.order);

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Navigation className="w-6 h-6 text-primary" />
            Navigation Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            Control About Us, Teams, What We Do, Member List, and all navbar items. Changes reflect on the public site immediately.
          </p>
        </div>
        <Link to={adminRoutes.pages}>
          <Button className="brand-gradient text-white border-0"><Plus className="w-4 h-4 mr-2" />New About Page</Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-6">
          {sortedItems.map((nav, idx) => (
            <motion.div key={nav.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
              className="bg-white rounded-xl border border-border overflow-hidden"
            >
              <div className="bg-muted/30 px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="font-semibold text-sm">{nav.label}</span>
                    <span className="text-xs text-muted-foreground ml-2 capitalize">{nav.type}{nav.path ? ` → ${nav.path}` : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" disabled={idx === 0 || saving} onClick={() => moveItem(nav.key, 'up')}><ArrowUp className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" disabled={idx === sortedItems.length - 1 || saving} onClick={() => moveItem(nav.key, 'down')}><ArrowDown className="w-4 h-4" /></Button>
                  <Button size="sm" variant={nav.enabled ? 'outline' : 'default'} disabled={saving} onClick={() => toggleTopLevel(nav.key)}>
                    {nav.enabled ? <><EyeOff className="w-3.5 h-3.5 mr-1" />Hide</> : <><Eye className="w-3.5 h-3.5 mr-1" />Show</>}
                  </Button>
                </div>
              </div>

              {nav.source === 'cms' && (
                <div className="divide-y divide-border">
                  {aboutPages.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                      No About Us pages. <Link to={adminRoutes.pages} className="text-primary font-medium">Create pages →</Link>
                    </div>
                  ) : aboutPages.map((page) => (
                    <div key={page.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isCmsPagePublic(page.status) ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-sm font-medium">{page.title}</span>
                        <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">/page/{page.slug}</code>
                      </div>
                      <Button size="sm" variant="ghost" disabled={itemSaving[page.id]} onClick={() => togglePageStatus(page)}>
                        {itemSaving[page.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isCmsPagePublic(page.status) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {nav.source === 'team_groups' && (
                <div className="divide-y divide-border">
                  {teamGroups.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                      No teams. <Link to={adminRoutes.teams} className="text-primary font-medium">Manage teams →</Link>
                    </div>
                  ) : teamGroups.map((group) => (
                    <div key={group.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${group.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-sm font-medium">{group.name}</span>
                      </div>
                      <Button size="sm" variant="ghost" disabled={itemSaving[group.id]} onClick={() => toggleEntityStatus('team', group, 'active', 'inactive')}>
                        {itemSaving[group.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : group.status === 'active' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {nav.source === 'programs' && (
                <div className="divide-y divide-border">
                  {programs.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                      No programs. <Link to={adminRoutes.programs} className="text-primary font-medium">Add programs →</Link>
                    </div>
                  ) : programs.map((prog) => (
                    <div key={prog.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${prog.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-sm font-medium">{prog.title}</span>
                      </div>
                      <Button size="sm" variant="ghost" disabled={itemSaving[prog.id]} onClick={() => toggleEntityStatus('program', prog, 'active', 'inactive')}>
                        {itemSaving[prog.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : prog.status === 'active' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {nav.type === 'link' && (
                <div className="px-5 py-3 text-sm text-muted-foreground flex items-center justify-between">
                  <span>Static link — toggle visibility with Hide/Show above</span>
                  {nav.key === 'member-list' && (
                    <Link to={adminRoutes.memberDirectory} className="text-xs text-primary hover:underline">Manage members →</Link>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {saving && (
        <div className="fixed bottom-6 right-6 bg-primary text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Saving navigation…
        </div>
      )}
    </div>
  );
}
