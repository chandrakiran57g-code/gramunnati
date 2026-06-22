import { useState, useEffect } from 'react';
import { adminService } from '@/api/admin';
import { PieChart, Loader2 } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

export default function AdminImpactMetrics() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.listImpactMetrics()
      .then(setMetrics)
      .catch(() => setMetrics([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <AdminPageHeader title="Impact Metrics" subtitle="Platform-wide impact counters shown on the website" gradient="bg-teal-700" />
      </HeroScrollSection>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : metrics.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-12 text-center text-muted-foreground">
            <PieChart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            No impact metrics in database. Add rows to the `impact_metrics` table.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl border border-border p-5">
                <div className="text-3xl font-bold text-primary">{m.value ?? m.count ?? '—'}</div>
                <div className="font-medium mt-1">{m.label || m.name || m.metric_key}</div>
                {m.description && <p className="text-xs text-muted-foreground mt-2">{m.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
