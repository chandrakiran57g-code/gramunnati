import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Search, MapPin, School, FolderOpen, TreePine } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { safeText } from '@/lib/safeText';

export default function SearchPage() {
  const initParams = new URLSearchParams(window.location.search);
  const [query, setQuery] = useState(initParams.get('q') || '');
  const [results, setResults] = useState({ villages: [], schools: [], projects: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async (q) => {
    if (!q || q.length < 2) return;
    setLoading(true);
    setSearched(true);
    const lq = q.toLowerCase();
    const [villages, schools, projects] = await Promise.all([
      base44.entities.Village.list('-created_date', 100).then(data => data.filter(v =>
        v.village_name?.toLowerCase().includes(lq) ||
        v.district?.toLowerCase().includes(lq) ||
        v.state?.toLowerCase().includes(lq)
      ).slice(0, 5)).catch(() => []),
      base44.entities.School.list('-created_date', 100).then(data => data.filter(s =>
        s.school_name?.toLowerCase().includes(lq) ||
        s.village_name?.toLowerCase().includes(lq) ||
        s.district?.toLowerCase().includes(lq)
      ).slice(0, 5)).catch(() => []),
      base44.entities.Project.list('-created_date', 100).then(data => data.filter(p =>
        p.project_name?.toLowerCase().includes(lq) ||
        p.village_name?.toLowerCase().includes(lq) ||
        p.category?.toLowerCase().includes(lq)
      ).slice(0, 5)).catch(() => []),
    ]);
    setResults({ villages, schools, projects });
    setLoading(false);
  };

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) doSearch(q);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    doSearch(query);
  };

  const total = results.villages.length + results.schools.length + results.projects.length;

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="page">
        <div className="brand-gradient py-16 px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-heading text-4xl font-bold mb-6">Search CMSR Platform</h1>
              <form onSubmit={handleSearch} className="flex gap-3 bg-white rounded-xl p-2 shadow-xl">
                <div className="flex-1 flex items-center gap-2 px-3">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="Search villages, schools, projects..."
                    className="flex-1 outline-none text-foreground text-sm bg-transparent"
                  />
                </div>
                <Button type="submit" className="brand-gradient text-white border-0 rounded-lg px-6 font-semibold">
                  Search
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {loading && (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground">Searching...</p>
          </div>
        )}

        {!loading && searched && total === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-heading text-xl font-bold mb-2">No Results Found</h3>
            <p className="text-muted-foreground">Try different keywords or explore our directories.</p>
            <div className="flex gap-3 justify-center mt-6">
              <Link to="/villages"><Button variant="outline" className="border-primary text-primary">Browse Villages</Button></Link>
              <Link to="/schools"><Button variant="outline" className="border-school text-school">Browse Schools</Button></Link>
            </div>
          </div>
        )}

        {!loading && searched && total > 0 && (
          <div className="space-y-8">
            <p className="text-muted-foreground text-sm">{total} results found for "<span className="font-semibold text-foreground">{query}</span>"</p>

            {results.villages.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TreePine className="w-5 h-5 text-primary" />
                  <h3 className="font-heading font-bold text-lg">Villages ({results.villages.length})</h3>
                </div>
                <div className="space-y-3">
                  {results.villages.map(v => (
                    <Link key={v.id} to={`/villages/${v.slug || v.id}`} className="flex items-center gap-4 bg-white rounded-xl border border-border p-4 hover:shadow-md hover:border-primary/30 transition-all group">
                      <div className="w-12 h-12 brand-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                        <TreePine className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{v.village_name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />{safeText(v.district)}, {safeText(v.state)}
                        </div>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Village</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.schools.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <School className="w-5 h-5 text-school" />
                  <h3 className="font-heading font-bold text-lg">Schools ({results.schools.length})</h3>
                </div>
                <div className="space-y-3">
                  {results.schools.map(s => (
                    <Link key={s.id} to={`/schools/${s.slug || s.id}`} className="flex items-center gap-4 bg-white rounded-xl border border-border p-4 hover:shadow-md hover:border-school/30 transition-all group">
                      <div className="w-12 h-12 school-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                        <School className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground group-hover:text-school transition-colors">{s.school_name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />{safeText(s.village_name)}, {safeText(s.district)}
                        </div>
                      </div>
                      <span className="text-xs bg-school/10 text-school px-2 py-1 rounded-full font-medium capitalize">{s.school_type}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.projects.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FolderOpen className="w-5 h-5 text-projects" />
                  <h3 className="font-heading font-bold text-lg">Projects ({results.projects.length})</h3>
                </div>
                <div className="space-y-3">
                  {results.projects.map(p => (
                    <Link key={p.id} to={`/projects/${p.slug || p.id}`} className="flex items-center gap-4 bg-white rounded-xl border border-border p-4 hover:shadow-md hover:border-projects/30 transition-all group">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-projects/10">
                        <FolderOpen className="w-6 h-6 text-projects" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground group-hover:text-projects transition-colors">{p.project_name}</div>
                        <div className="text-sm text-muted-foreground mt-0.5">{p.category} · {p.village_name}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>{p.status}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!searched && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-heading text-xl font-bold mb-2">Search the Platform</h3>
            <p className="text-muted-foreground">Enter a village name, school, or project to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}