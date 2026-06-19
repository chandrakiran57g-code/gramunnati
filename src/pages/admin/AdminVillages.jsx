import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Search, Plus, Edit, Eye, MapPin, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

export default function AdminVillages() {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    base44.entities.Village.list('-created_date', 100)
      .then(setVillages).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = villages.filter(v => {
    const matchQ = !query || v.village_name?.toLowerCase().includes(query.toLowerCase()) || v.district?.toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? v.is_active : !v.is_active) || (statusFilter === 'featured' ? v.is_featured : false);
    return matchQ && matchStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <div className="brand-gradient py-8 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">Villages</h1>
              <p className="text-white/70 text-sm mt-1">{villages.length} villages registered</p>
            </div>
            <div className="flex gap-3">
              <Link to="/administrator"><Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">← Dashboard</Button></Link>
              <Button size="sm" className="donation-gradient text-white border-0"><Plus className="w-4 h-4 mr-1" />Add Village</Button>
            </div>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search villages..." value={query} onChange={e => setQuery(e.target.value)} className="pl-10 rounded-xl" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-border h-16 animate-pulse" />)}</div>
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Village</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">District</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">State</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Population</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((v, i) => (
                  <motion.tr key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{v.village_name}</div>
                          {v.mandal && <div className="text-xs text-muted-foreground">{v.mandal}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{v.district}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{v.state}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">{v.population?.toLocaleString('en-IN') || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${v.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {v.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                      {v.is_featured && <span className="ml-1.5 text-xs px-2 py-0.5 rounded-full bg-donation/10 text-donation">Featured</span>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Link to={`/villages/${v.slug || v.id}`}>
                          <button className="p-1.5 rounded-lg hover:bg-school/10 text-muted-foreground hover:text-school transition-colors"><Eye className="w-4 h-4" /></button>
                        </Link>
                        <button className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"><Edit className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">No villages found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}