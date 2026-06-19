import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import ProjectCard from '@/components/shared/ProjectCard';
import { Search, Filter, FolderOpen, LayoutGrid, Columns } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

const CATEGORIES = ['Village Development','School Development','Tree Plantation','Water Conservation','Agriculture','Healthcare','Skill Development','Women SHG','Infrastructure','Employment Generation'];
const STATUSES = ['upcoming', 'active', 'completed', 'cancelled'];
const STATES = ['Andhra Pradesh','Telangana','Karnataka','Tamil Nadu','Maharashtra','Gujarat','Rajasthan','Uttar Pradesh','Madhya Pradesh','West Bengal','Bihar','Odisha','Kerala','Punjab','Haryana','Delhi','Other'];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    base44.entities.Project.list('-created_date', 50)
      .then(data => { setProjects(data); setFiltered(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = projects;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.project_name?.toLowerCase().includes(q) || p.village_name?.toLowerCase().includes(q) || p.district?.toLowerCase().includes(q));
    }
    if (categoryFilter && categoryFilter !== 'all') result = result.filter(p => p.category === categoryFilter);
    if (statusFilter && statusFilter !== 'all') result = result.filter(p => p.status === statusFilter);
    if (stateFilter && stateFilter !== 'all') result = result.filter(p => p.state === stateFilter);
    setFiltered(result);
  }, [search, categoryFilter, statusFilter, stateFilter, projects]);

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="page">
        <div style={{ background: 'linear-gradient(135deg, #7C3AED, #9333EA)' }} className="py-16 px-4">
          <div className="max-w-7xl mx-auto text-center text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-center gap-2 mb-3 text-white/70 text-sm">
                <FolderOpen className="w-4 h-4" /> Development Projects
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Development Projects</h1>
              <p className="text-white/80 max-w-2xl mx-auto">Every project is a step towards a better rural India. Support the ones that matter to you.</p>
            </motion.div>
          </div>
        </div>
      </HeroScrollSection>

      <div className="bg-white border-b border-border sticky top-[88px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-52 rounded-xl">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36 rounded-xl capitalize">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-full sm:w-44 rounded-xl">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Filter className="w-4 h-4" /> {filtered.length} projects
          </div>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-muted-foreground hover:bg-muted'}`}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('kanban')} className={`p-2 ${viewMode === 'kanban' ? 'bg-primary text-white' : 'bg-white text-muted-foreground hover:bg-muted'}`}><Columns className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Kanban View */}
        {viewMode === 'kanban' && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {['upcoming','active','completed','cancelled'].map(col => {
              const colProjects = filtered.filter(p => p.status === col);
              return (
                <div key={col} className="bg-muted/40 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-3 px-2">
                    <span className="capitalize text-sm font-semibold">{col}</span>
                    <span className="text-xs bg-white px-2 py-0.5 rounded-full font-medium">{colProjects.length}</span>
                  </div>
                  <div className="space-y-2">
                    {colProjects.map(p => (
                      <Link key={p.id} to={`/projects/${p.slug || p.id}`} className="block bg-white rounded-xl border border-border p-3 hover:shadow-md transition-all">
                        <div className="text-sm font-semibold mb-1 line-clamp-2">{p.project_name}</div>
                        <div className="text-xs text-muted-foreground mb-2">{p.village_name}</div>
                        {p.budget_amount > 0 && (
                          <div>
                            <div className="flex justify-between text-xs mb-0.5"><span>₹{p.raised_amount?.toLocaleString('en-IN') || 0}</span><span>{Math.round((p.raised_amount || 0) / p.budget_amount * 100)}%</span></div>
                            <div className="w-full bg-muted rounded-full h-1"><div className="bg-primary h-1 rounded-full" style={{ width: `${Math.min(100, Math.round((p.raised_amount || 0) / p.budget_amount * 100))}%` }} /></div>
                          </div>
                        )}
                      </Link>
                    ))}
                    {colProjects.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">No projects</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
                  <div className="h-44 bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-2 bg-muted rounded" />
                    <div className="h-8 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="font-heading text-xl font-semibold mb-2">No Projects Found</h3>
              <p className="text-muted-foreground mb-6">Try different filters or check back later for new projects.</p>
              <Button onClick={() => { setSearch(''); setCategoryFilter('all'); setStatusFilter('all'); setStateFilter('all'); }} variant="outline">Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
            </div>
          )
        )}
      </div>
    </div>
  );
}