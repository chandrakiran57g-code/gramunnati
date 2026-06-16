import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import VillageCard from '@/components/shared/VillageCard';
import { Search, Filter, MapPin, Grid, Map } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATES = ['Andhra Pradesh','Telangana','Karnataka','Tamil Nadu','Maharashtra','Gujarat','Rajasthan','Uttar Pradesh','Madhya Pradesh','West Bengal','Bihar','Odisha','Kerala','Punjab','Haryana','Delhi','Other'];

export default function Villages() {
  const [villages, setVillages] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('all');

  useEffect(() => {
    base44.entities.Village.list('-created_date', 50)
      .then(data => { setVillages(data); setFiltered(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = villages;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(v =>
        v.village_name?.toLowerCase().includes(q) ||
        v.district?.toLowerCase().includes(q) ||
        v.mandal?.toLowerCase().includes(q) ||
        v.pincode?.includes(q)
      );
    }
    if (stateFilter && stateFilter !== 'all') result = result.filter(v => v.state === stateFilter);
    setFiltered(result);
  }, [search, stateFilter, villages]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="village-gradient py-16 px-4">
        <div className="max-w-7xl mx-auto text-center text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center gap-2 mb-3 text-white/70 text-sm">
              <MapPin className="w-4 h-4" /> Villages Directory
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Explore Villages Across India</h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              Every village deserves a digital identity. Discover, support, and connect with rural communities building a better tomorrow.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-border sticky top-[88px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search village, district, mandal, pincode..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-full sm:w-44 rounded-xl">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1">
            <Filter className="w-4 h-4" />
            {filtered.length} villages
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
                <div className="h-44 bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🏘️</div>
            <h3 className="font-heading text-xl font-semibold mb-2">No Villages Found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters. Village data will appear once added to the platform.</p>
            <Button onClick={() => { setSearch(''); setStateFilter('all'); }} variant="outline">Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((v, i) => <VillageCard key={v.id} village={v} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}