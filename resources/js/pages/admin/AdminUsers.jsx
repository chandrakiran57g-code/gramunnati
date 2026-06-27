import { useState, useEffect, useCallback } from 'react';
import { adminService } from '@/api/admin';
import { motion } from 'framer-motion';
import { Users, Search, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

function formatLocation(user) {
  const district = user.districts?.name || user.district;
  const state = user.states?.name || user.state;
  const village = user.village_name;
  const parts = [village, district, state].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
}

function getRoleLabel(user) {
  const roles = user.user_roles?.map((r) => r.roles?.name).filter(Boolean);
  return roles?.length ? roles.join(', ') : 'Member';
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadUsers = useCallback(async (query = '') => {
    setLoading(true);
    try {
      const { data, count } = await adminService.listUsers({ limit: 200, search: query || undefined });
      setUsers(data || []);
      setTotal(count ?? data?.length ?? 0);
    } catch {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadUsers(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search, loadUsers]);

  const toggleActive = async (user) => {
    const next = user.is_active === false;
    setUpdatingId(user.id);
    try {
      await adminService.updateRecord('profiles', user.id, { is_active: next });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: next } : u)));
    } catch {
      /* ignore — field may not exist in schema */
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <div className="bg-emerald-600 text-white py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-heading text-3xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8" />
              Member Management
            </h1>
            <p className="text-white/70 text-sm mt-1">{total} registered profiles from database</p>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or mobile…"
            className="pl-10 rounded-xl"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">No members found in profiles table.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-semibold">Member</th>
                  <th className="text-left px-4 py-3 font-semibold">Contact</th>
                  <th className="text-left px-4 py-3 font-semibold">Location</th>
                  <th className="text-left px-4 py-3 font-semibold">Role</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
                          {u.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-medium">{u.full_name || 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground">{u.occupation || u.profession || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.mobile || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatLocation(u)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        <Shield className="w-3 h-3" />
                        {getRoleLabel(u)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-xs"
                        disabled={updatingId === u.id}
                        onClick={() => toggleActive(u)}
                      >
                        {u.is_active !== false ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
