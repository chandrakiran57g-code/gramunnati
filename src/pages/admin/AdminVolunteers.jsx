import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Users, Search, MapPin, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function AdminVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    base44.entities.Volunteer.list('-created_date', 100)
      .then(setVolunteers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = volunteers.filter(v =>
    !query || v.full_name?.toLowerCase().includes(query.toLowerCase()) || v.state?.toLowerCase().includes(query.toLowerCase())
  );

  const availColors = { weekdays: 'bg-blue-100 text-blue-700', weekends: 'bg-purple-100 text-purple-700', both: 'bg-green-100 text-green-700', flexible: 'bg-yellow-100 text-yellow-700' };

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8 px-6" style={{ background: 'linear-gradient(135deg, #22C55E, #16a34a)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-white">Volunteers</h1>
            <p className="text-white/70 text-sm mt-1">{volunteers.length} registered volunteers</p>
          </div>
          <Link to="/administrator"><Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">← Dashboard</Button></Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: volunteers.length, color: 'text-volunteer' },
            { label: 'Active', value: volunteers.filter(v => v.is_active !== false).length, color: 'text-green-600' },
            { label: 'Hours (Total)', value: volunteers.reduce((s, v) => s + (v.hours_contributed || 0), 0), color: 'text-school' },
            { label: 'Projects Joined', value: volunteers.reduce((s, v) => s + (v.projects_joined || 0), 0), color: 'text-projects' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-2xl border border-border p-4 text-center">
              <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search volunteers..." value={query} onChange={e => setQuery(e.target.value)} className="pl-10 rounded-xl max-w-sm" />
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-border h-36 animate-pulse" />)}</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((v, i) => (
              <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-border p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-volunteer/10 rounded-xl flex items-center justify-center text-lg">
                      {v.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{v.full_name}</div>
                      <div className="text-xs text-muted-foreground">{v.occupation || 'Volunteer'}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${availColors[v.availability] || 'bg-muted text-muted-foreground'}`}>{v.availability}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3"><MapPin className="w-3 h-3" />{v.district}, {v.state}</div>
                {v.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {v.skills.slice(0, 3).map(s => <span key={s} className="text-xs bg-volunteer/10 text-volunteer px-2 py-0.5 rounded-full">{s}</span>)}
                    {v.skills.length > 3 && <span className="text-xs text-muted-foreground">+{v.skills.length - 3}</span>}
                  </div>
                )}
                <div className="flex gap-4 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                  <span><Clock className="w-3 h-3 inline mr-1" />{v.hours_contributed || 0} hrs</span>
                  <span>📋 {v.projects_joined || 0} projects</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">No volunteers found</div>
        )}
      </div>
    </div>
  );
}