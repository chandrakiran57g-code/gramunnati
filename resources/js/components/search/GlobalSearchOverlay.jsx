import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Search, X, MapPin, School, FolderOpen, Loader2 } from 'lucide-react';

export default function GlobalSearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ villages: [], schools: [], projects: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    const down = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(o => !o); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (open) { inputRef.current?.focus(); setQuery(''); setResults({ villages: [], schools: [], projects: [] }); }
  }, [open]);

  useEffect(() => {
    if (!query || query.length < 2) { setResults({ villages: [], schools: [], projects: [] }); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      const lq = query.toLowerCase();
      const [v, s, p] = await Promise.all([
        base44.entities.Village.list('-created_date', 100).then(d => d.filter(x => x.village_name?.toLowerCase().includes(lq) || x.district?.toLowerCase().includes(lq) || x.state?.toLowerCase().includes(lq)).slice(0, 4)).catch(() => []),
        base44.entities.School.list('-created_date', 100).then(d => d.filter(x => x.school_name?.toLowerCase().includes(lq) || x.village_name?.toLowerCase().includes(lq)).slice(0, 4)).catch(() => []),
        base44.entities.Project.list('-created_date', 100).then(d => d.filter(x => x.project_name?.toLowerCase().includes(lq) || x.village_name?.toLowerCase().includes(lq) || x.category?.toLowerCase().includes(lq)).slice(0, 4)).catch(() => []),
      ]);
      setResults({ villages: v, schools: s, projects: p });
      setLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const total = results.villages.length + results.schools.length + results.projects.length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="relative bg-white rounded-2xl shadow-2xl border border-border w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              {loading ? <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" /> : <Search className="w-5 h-5 text-muted-foreground" />}
              <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search villages, schools, projects..." className="flex-1 outline-none text-foreground text-sm bg-transparent" />
              <kbd className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono">ESC</kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {query.length < 2 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <div className="text-2xl mb-2">⌘K</div>
                  Type to search across villages, schools, and projects
                </div>
              )}
              {query.length >= 2 && total === 0 && !loading && (
                <div className="p-6 text-center text-sm text-muted-foreground">No results found for "{query}"</div>
              )}
              {results.villages.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground px-3 py-1.5 uppercase">Villages</div>
                  {results.villages.map(v => (
                    <button key={v.id} onClick={() => { setOpen(false); navigate(`/villages/${v.slug || v.id}`); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/5 text-left transition-colors">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                      <div><div className="text-sm font-medium">{v.village_name}</div><div className="text-xs text-muted-foreground">{v.district}, {v.state}</div></div>
                    </button>
                  ))}
                </div>
              )}
              {results.schools.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground px-3 py-1.5 uppercase">Schools</div>
                  {results.schools.map(s => (
                    <button key={s.id} onClick={() => { setOpen(false); navigate(`/schools/${s.slug || s.id}`); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-school/5 text-left transition-colors">
                      <School className="w-4 h-4 text-school flex-shrink-0" />
                      <div><div className="text-sm font-medium">{s.school_name}</div><div className="text-xs text-muted-foreground">{s.village_name}, {s.district}</div></div>
                    </button>
                  ))}
                </div>
              )}
              {results.projects.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground px-3 py-1.5 uppercase">Projects</div>
                  {results.projects.map(p => (
                    <button key={p.id} onClick={() => { setOpen(false); navigate(`/projects/${p.slug || p.id}`); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-projects/5 text-left transition-colors">
                      <FolderOpen className="w-4 h-4 text-projects flex-shrink-0" />
                      <div><div className="text-sm font-medium">{p.project_name}</div><div className="text-xs text-muted-foreground">{p.category} · {p.village_name}</div></div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="px-4 py-2 border-t border-border bg-muted/30 flex gap-2 flex-wrap text-xs text-muted-foreground">
              <span>↑↓ Navigate</span><span>↵ Open</span><span>Esc Close</span>
              <span className="ml-auto">Search: <LinkButton to="/search" onClick={() => setOpen(false)}>Advanced</LinkButton></span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LinkButton({ to, onClick, children }) {
  const navigate = useNavigate();
  return <button type="button" onClick={() => { onClick?.(); navigate(to); }} className="text-primary font-medium hover:underline">{children}</button>;
}