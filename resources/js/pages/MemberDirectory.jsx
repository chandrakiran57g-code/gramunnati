import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

function formatArea(user) {
  const parts = [
    user.village_name,
    user.districts?.name || user.district,
    user.states?.name || user.state,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '—';
}

export default function MemberDirectory() {
  const [members, setMembers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.User.list(undefined, 500)
      .then((users) => {
        const sorted = [...users].sort((a, b) => {
          const da = new Date(a.created_date || a.created_at || 0).getTime();
          const db = new Date(b.created_date || b.created_at || 0).getTime();
          return da - db;
        });

        const mapped = sorted.map((u, index) => ({
          memberNo: index + 1,
          id: u.id,
          name: u.full_name || 'Member',
          joined: (u.created_at || u.created_date)
            ? new Date(u.created_at || u.created_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : '—',
          area: formatArea(u),
          profession: u.occupation || u.profession || '',
        }));

        setMembers(mapped);
        setFiltered(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(members);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      members.filter(
        (m) =>
          m.name?.toLowerCase().includes(q) ||
          m.area?.toLowerCase().includes(q) ||
          m.profession?.toLowerCase().includes(q) ||
          String(m.memberNo).includes(q)
      )
    );
  }, [search, members]);

  return (
    <div className="min-h-screen bg-background">
      <section className="brand-gradient py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl sm:text-5xl font-bold text-cream-50 mb-4"
          >
            Member List
          </motion.h1>
          <p className="text-cream-100/80 text-lg max-w-2xl mx-auto">
            Registered members of the CMSR platform — numbered by join order
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="max-w-md mx-auto mb-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, area, profession, or member no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-white border-brown-300"
            />
          </div>

          <div className="bg-white rounded-2xl border border-brown-300 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream-100 border-b border-brown-300">
                    <th className="text-left py-3.5 px-4 font-semibold text-brown-900 w-24">S.No.</th>
                    <th className="text-left py-3.5 px-4 font-semibold text-brown-900">Name</th>
                    <th className="text-left py-3.5 px-4 font-semibold text-brown-900 hidden sm:table-cell">Joined</th>
                    <th className="text-left py-3.5 px-4 font-semibold text-brown-900">Area</th>
                    <th className="text-left py-3.5 px-4 font-semibold text-brown-900 hidden sm:table-cell">Profession</th>
                  </tr>
                </thead>
                <tbody>
                  {loading &&
                    [...Array(8)].map((_, i) => (
                      <tr key={i} className="border-b border-cream-200 animate-pulse">
                        <td className="py-4 px-4"><div className="h-4 bg-cream-200 rounded w-8" /></td>
                        <td className="py-4 px-4"><div className="h-4 bg-cream-200 rounded w-32" /></td>
                        <td className="py-4 px-4 hidden sm:table-cell"><div className="h-4 bg-cream-200 rounded w-20" /></td>
                        <td className="py-4 px-4"><div className="h-4 bg-cream-200 rounded w-40" /></td>
                        <td className="py-4 px-4 hidden sm:table-cell"><div className="h-4 bg-cream-200 rounded w-24" /></td>
                      </tr>
                    ))}

                  {!loading &&
                    filtered.map((member, i) => (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-cream-200 hover:bg-cream-50 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-semibold text-primary">
                          {String(member.memberNo).padStart(4, '0')}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-foreground">{member.name}</td>
                        <td className="py-3.5 px-4 text-muted-foreground hidden sm:table-cell">{member.joined}</td>
                        <td className="py-3.5 px-4 text-muted-foreground">{member.area}</td>
                        <td className="py-3.5 px-4 text-muted-foreground hidden sm:table-cell">
                          {member.profession || '—'}
                        </td>
                      </motion.tr>
                    ))}
                </tbody>
              </table>
            </div>

            {!loading && filtered.length === 0 && (
              <div className="text-center py-16 px-4">
                <Users className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-40" />
                <p className="text-muted-foreground">No members found matching your search.</p>
              </div>
            )}
          </div>

          {!loading && filtered.length > 0 && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Showing {filtered.length} of {members.length} registered members
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
