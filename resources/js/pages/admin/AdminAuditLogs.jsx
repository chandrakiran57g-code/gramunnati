import { useState, useEffect } from 'react';
import { adminService } from '@/api/admin';
import { ScrollText, Loader2 } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.listAuditLogs({ limit: 200 })
      .then(({ data }) => setLogs(data || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <AdminPageHeader title="Audit Logs" subtitle="Who created, edited, or deleted records" gradient="bg-slate-800" />
      </HeroScrollSection>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-border overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              No audit logs recorded yet.
            </div>
          ) : (
            <table className="w-full text-sm min-w-[720px]">
              <thead><tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3">When</th>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Module</th>
                <th className="text-left px-4 py-3">Record</th>
              </tr></thead>
              <tbody className="divide-y">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {log.created_at ? new Date(log.created_at).toLocaleString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-3">{log.profiles?.full_name || 'System'}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium capitalize">{log.action}</span></td>
                    <td className="px-4 py-3 capitalize">{log.module || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{log.record_id?.slice?.(0, 8) || '—'}…</td>
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
