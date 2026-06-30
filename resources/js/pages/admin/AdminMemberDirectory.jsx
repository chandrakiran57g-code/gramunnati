import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminService } from '@/api/admin';
import { Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import AdminShell from '@/components/admin/AdminShell';
import { ADMIN_SECTIONS } from '@/lib/adminSections';

function formatArea(user) {
  const parts = [user.village_name, user.districts?.name || user.district, user.states?.name || user.state].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
}

export default function AdminMemberDirectory() {
  const [members, setMembers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.listUsers({ limit: 500 })
      .then(({ data }) => {
        const sorted = [...(data || [])].sort((a, b) => {
          const da = new Date(a.created_at || 0).getTime();
          const db = new Date(b.created_at || 0).getTime();
          return da - db;
        });
        const mapped = sorted.map((u, index) => ({
          memberNo: index + 1,
          id: u.id,
          name: u.full_name || 'Member',
          area: formatArea(u),
          profession: u.occupation || u.profession || '—',
          mobile: u.mobile || '—',
          joined: u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '—',
        }));
        setMembers(mapped);
        setFiltered(mapped);
      })
      .catch(() => {
        setMembers([]);
        setFiltered([]);
      })
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
    <AdminShell
      title="Member List"
      section={ADMIN_SECTIONS.members.label}
      description="Registered platform members in join order. Shown publicly at /members."
      breadcrumbs={[{ label: 'Navbar Manager' }, { label: 'Member List' }]}
    >
      <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search members…" className="pl-10 rounded-xl" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-semibold w-16">S.No</th>
                  <th className="text-left px-4 py-3 font-semibold">Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Area</th>
                  <th className="text-left px-4 py-3 font-semibold">Profession</th>
                  <th className="text-left px-4 py-3 font-semibold">Mobile</th>
                  <th className="text-left px-4 py-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((m, i) => (
                  <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.015 }} className="hover:bg-muted/20">
                    <td className="px-4 py-3 text-muted-foreground">{m.memberNo}</td>
                    <td className="px-4 py-3 font-medium">{m.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.area}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.profession}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.mobile}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.joined}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No members match your search.</div>
            )}
          </div>
        )}
    </AdminShell>
  );
}
