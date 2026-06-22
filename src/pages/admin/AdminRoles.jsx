import { useState, useEffect } from 'react';
import { adminService } from '@/api/admin';
import { Shield, Loader2 } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

export default function AdminRoles() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.listUsers({ limit: 100 }),
      adminService.listRoles(),
    ])
      .then(([{ data }, roleList]) => {
        setUsers(data || []);
        setRoles(roleList || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <AdminPageHeader title="Roles & Permissions" subtitle="Manage user roles from database" gradient="bg-indigo-700" />
      </HeroScrollSection>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => (
            <div key={role.id} className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className="font-heading font-bold capitalize">{role.name?.replace(/_/g, ' ')}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{role.description || 'Platform role'}</p>
            </div>
          ))}
          {!loading && roles.length === 0 && (
            <p className="text-muted-foreground col-span-3 text-center py-8">No roles in `roles` table yet.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b font-heading font-bold">User role assignments</div>
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Mobile</th>
                <th className="text-left px-4 py-3">Roles</th>
              </tr></thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{u.full_name || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.mobile || '—'}</td>
                    <td className="px-4 py-3">
                      {(u.user_roles?.map((r) => r.roles?.name).filter(Boolean) || ['Member']).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
