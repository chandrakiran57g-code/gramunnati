import { useState, useEffect, useCallback, useMemo } from 'react';
import { adminService } from '@/api/admin';
import { adminDbMutation } from '@/lib/adminDb';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminShell from '@/components/admin/AdminShell';
import DirectoryTable from '@/components/cms/DirectoryTable';
import { ADMIN_SECTIONS } from '@/lib/adminSections';

function formatArea(user) {
  const parts = [user.village_name, user.districts?.name || user.district, user.states?.name || user.state].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
}

function isAdminMember(user) {
  return (user.user_roles || []).some((r) => ['Super Admin', 'SuperAdmin'].includes(r?.roles?.name));
}

export default function AdminMemberDirectory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    adminService.listUsers({ limit: 500 })
      .then(({ data }) => {
        const sorted = [...(data || [])].sort((a, b) => {
          const da = new Date(a.created_at || 0).getTime();
          const db = new Date(b.created_at || 0).getTime();
          return da - db;
        });
        setRows(
          sorted.map((u, index) => ({
            id: u.id,
            memberNo: index + 1,
            name: u.full_name || 'Member',
            area: formatArea(u),
            profession: u.occupation || u.profession || '—',
            mobile: u.mobile || '—',
            joined: u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
            isAdmin: isAdminMember(u),
          }))
        );
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (m) => {
    if (m.isAdmin) {
      toast.error('Admin accounts cannot be deleted from the member list.');
      return;
    }
    if (!confirm(`Delete member "${m.name}"? They will be removed from the member list. This cannot be undone.`)) return;
    try {
      await adminDbMutation(async () => {
        await adminService.deleteRecord('profiles', m.id);
      });
      toast.success('Member deleted');
      load();
    } catch (e) {
      toast.error(e.message || 'Delete failed');
    }
  };

  const columns = useMemo(() => [
    { key: 'sno', label: 'S.No.', sortable: false, width: 'w-16' },
    { key: 'name', label: 'Name' },
    { key: 'joined', label: 'Joined' },
    { key: 'area', label: 'Area' },
    { key: 'profession', label: 'Profession' },
    { key: 'mobile', label: 'Mobile', sortable: false },
    {
      key: 'actions',
      label: '',
      sortable: false,
      width: 'w-16',
      render: (row) => (
        row.isAdmin ? (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">Admin</span>
        ) : (
          <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )
      ),
    },
  ], []);

  return (
    <AdminShell
      title="Member List"
      section={ADMIN_SECTIONS.members.label}
      description="Registered platform members in join order. Shown publicly at /members."
      breadcrumbs={[{ label: 'Navbar Manager' }, { label: 'Member List' }]}
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
        </div>
      ) : (
        <DirectoryTable
          rows={rows}
          columns={columns}
          searchKeys={['name', 'area', 'profession', 'mobile', 'joined']}
        />
      )}
    </AdminShell>
  );
}
