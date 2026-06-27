import { useState, useEffect } from 'react';
import { adminService } from '@/api/admin';
import { BarChart3, Loader2 } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

export default function AdminVillageActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.listActivityLogs({ loggableType: 'village' })
      .then(setActivities)
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <AdminPageHeader title="Village Activities" subtitle="Timelines from `activity_logs` for villages" />
      </HeroScrollSection>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-border overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : activities.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              No village activities logged yet.
            </div>
          ) : (
            <table className="w-full text-sm min-w-[640px]">
              <thead><tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-left px-4 py-3">Village ID</th>
              </tr></thead>
              <tbody className="divide-y">
                {activities.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 whitespace-nowrap">{a.activity_date ? new Date(a.activity_date).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-4 py-3 font-medium">{a.title || a.activity_type || 'Activity'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.description || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{a.loggable_id?.slice?.(0, 8) || '—'}…</td>
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
