import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Users, MapPin, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function MemberDirectory() {
  const [members, setMembers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.User.list(undefined, 200)
      .then(users => {
        const publicUsers = users.map(u => ({
          id: u.id, full_name: u.full_name, profile_photo: u.profile_photo,
          state: u.state, district: u.district, village_name: u.village_name, role: u.role
        }));
        setMembers(publicUsers);
        setFiltered(publicUsers);
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(members); return; }
    const q = search.toLowerCase();
    setFiltered(members.filter(m =>
      m.full_name?.toLowerCase().includes(q) ||
      m.state?.toLowerCase().includes(q) ||
      m.village_name?.toLowerCase().includes(q)
    ));
  }, [search, members]);

  return (
    <div className="min-h-screen bg-background">
      <section className="hero-gradient py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">Member Directory</motion.h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">Registered members contributing to village and school development</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-md mx-auto mb-10 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search members by name, state, or village..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl" />
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-border p-5 animate-pulse">
                  <div className="w-14 h-14 bg-muted rounded-full mx-auto mb-3" />
                  <div className="h-4 bg-muted rounded w-2/3 mx-auto mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((member, i) => (
                <motion.div key={member.id}
                  initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-xl border border-border p-5 text-center hover:shadow-md transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-village/10 mx-auto mb-3 overflow-hidden flex items-center justify-center">
                    {member.profile_photo ? (
                      <img src={member.profile_photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-village">{member.full_name?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-foreground">{member.full_name || 'Member'}</h3>
                  <Badge className="mt-1.5 text-xs bg-village/10 text-village border-0">{member.role || 'Member'}</Badge>
                  {(member.village_name || member.state) && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3" /> {[member.village_name, member.state].filter(Boolean).join(', ')}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
              <p className="text-muted-foreground">No members found matching your search.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}