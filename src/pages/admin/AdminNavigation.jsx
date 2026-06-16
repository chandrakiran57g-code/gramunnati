import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Navigation, GripVertical, Eye, EyeOff, ArrowUp, ArrowDown, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminNavigation() {
  const [cmsPages, setCmsPages] = useState([]);
  const [teamGroups, setTeamGroups] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  const navStructure = [
    { key: 'about-us', label: 'About Us', source: 'cms', type: 'dropdown' },
    { key: 'teams', label: 'Teams', source: 'teamGroups', type: 'dropdown' },
    { key: 'what-we-do', label: 'What We Do', source: 'programs', type: 'dropdown' },
    { key: 'partners', label: 'Partner Organizations', source: null, type: 'link' },
    { key: 'beneficiaries', label: 'Beneficiary', source: null, type: 'link' },
    { key: 'member-list', label: 'Member List', source: null, type: 'link' },
    { key: 'gallery', label: 'Gallery', source: null, type: 'link' },
    { key: 'contact-us', label: 'Contact Us', source: null, type: 'link' },
  ];

  useEffect(() => {
    Promise.all([
      base44.entities.CmsPage.list('display_order', 50).catch(() => []),
      base44.entities.TeamGroup.list('display_order', 50).catch(() => []),
      base44.entities.Program.list('sort_order', 50).catch(() => []),
    ]).then(([pages, teams, progs]) => {
      setCmsPages(pages);
      setTeamGroups(teams);
      setPrograms(progs);
      setLoading(false);
    });
  }, []);

  const toggleItemStatus = async (entity, item) => {
    setSaving(prev => ({ ...prev, [item.id]: true }));
    const newStatus = item.status === 'active' || item.status === 'published' ? 'inactive' : 'active';
    const entityMap = { CmsPage: base44.entities.CmsPage, TeamGroup: base44.entities.TeamGroup, Program: base44.entities.Program };
    await entityMap[entity].update(item.id, { status: newStatus });
    // Refresh
    const res = await entityMap[entity].list();
    if (entity === 'CmsPage') setCmsPages(res);
    else if (entity === 'TeamGroup') setTeamGroups(res);
    else setPrograms(res);
    setSaving(prev => ({ ...prev, [item.id]: false }));
    toast.success(`${item.title || item.name} ${newStatus === 'active' || newStatus === 'published' ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <Navigation className="w-6 h-6 text-village" /> Navigation Manager
        </h1>
        <p className="text-muted-foreground mt-1">Control what appears in the website navbar and their order</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(8)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-8">
          {navStructure.map((nav, idx) => (
            <motion.div key={nav.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl border border-border overflow-hidden"
            >
              <div className="bg-muted/30 px-5 py-3 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="font-semibold text-sm">{nav.label}</span>
                    <span className="text-xs text-muted-foreground ml-2 capitalize">{nav.type} — {nav.source ? 'Dynamic' : 'Static Link'}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">Position: #{idx + 1}</span>
              </div>

              {nav.source === 'cms' && (
                <div className="divide-y divide-border">
                  {cmsPages.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                      No CMS pages yet. <a href="/administrator/pages" className="text-village font-medium">Create pages →</a>
                    </div>
                  ) : (
                    cmsPages.map((page, pi) => (
                      <div key={page.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${page.status === 'published' ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-sm font-medium">{page.title}</span>
                          <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">/{page.slug}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" disabled={saving[page.id]}
                            onClick={() => toggleItemStatus('CmsPage', page)}
                            title={page.status === 'published' ? 'Disable' : 'Enable'}>
                            {saving[page.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                              page.status === 'published' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {nav.source === 'teamGroups' && (
                <div className="divide-y divide-border">
                  {teamGroups.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                      No team groups yet. <a href="/administrator/teams" className="text-village font-medium">Create teams →</a>
                    </div>
                  ) : (
                    teamGroups.map((group, gi) => (
                      <div key={group.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${group.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-sm font-medium">{group.name}</span>
                        </div>
                        <Button size="sm" variant="ghost" disabled={saving[group.id]}
                          onClick={() => toggleItemStatus('TeamGroup', group)}>
                          {saving[group.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                            group.status === 'active' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {nav.source === 'programs' && (
                <div className="divide-y divide-border">
                  {programs.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                      No programs yet. <a href="/administrator/programs" className="text-village font-medium">Add programs →</a>
                    </div>
                  ) : (
                    programs.map((prog, pi) => (
                      <div key={prog.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${prog.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-sm font-medium">{prog.title}</span>
                        </div>
                        <Button size="sm" variant="ghost" disabled={saving[prog.id]}
                          onClick={() => toggleItemStatus('Program', prog)}>
                          {saving[prog.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                            prog.status === 'active' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {!nav.source && (
                <div className="px-5 py-3 text-sm text-muted-foreground flex items-center justify-between">
                  <span>Static page — always visible</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">Active</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}