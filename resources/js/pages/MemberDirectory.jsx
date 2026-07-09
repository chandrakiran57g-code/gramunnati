import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import DirectoryTable, { formatDate } from '@/components/cms/DirectoryTable';

function formatArea(user) {
  const parts = [
    user.village_name,
    user.districts?.name || user.district,
    user.states?.name || user.state,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '—';
}

const MEMBER_COLUMNS = [
  { key: 'sno', label: 'S.No.', sortable: false, width: 'w-16' },
  { key: 'name', label: 'Name' },
  { key: 'joined', label: 'Joined', format: (v) => v || '—' },
  { key: 'area', label: 'Area' },
  { key: 'profession', label: 'Profession' },
];

export default function MemberDirectory() {
  const [members, setMembers] = useState([]);
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
          sno: index + 1,
          id: u.id,
          name: u.full_name || 'Member',
          joined: formatDate(u.created_at || u.created_date),
          joinedRaw: u.created_at || u.created_date || '',
          area: formatArea(u),
          profession: u.occupation || u.profession || '—',
        }));

        setMembers(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
          {loading ? (
            <div className="h-64 rounded-lg bg-muted animate-pulse" />
          ) : (
            <DirectoryTable
              rows={members}
              columns={MEMBER_COLUMNS}
              searchKeys={['name', 'area', 'profession', 'joined']}
            />
          )}
        </div>
      </section>
    </div>
  );
}
