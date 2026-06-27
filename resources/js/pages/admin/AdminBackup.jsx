import { Database, HardDrive, Activity } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { Button } from '@/components/ui/button';

export default function AdminBackup() {
  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <AdminPageHeader title="Backup & Maintenance" subtitle="Data backup and platform health monitoring" gradient="bg-slate-700" />
      </HeroScrollSection>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Database className="w-6 h-6 text-primary" /></div>
            <div className="flex-1">
              <h3 className="font-heading font-bold mb-1">Database backup</h3>
              <p className="text-sm text-muted-foreground mb-4">Export and restore Supabase data via the Supabase dashboard or scheduled backups.</p>
              <Button variant="outline" className="rounded-xl" disabled>Configure in Supabase →</Button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center"><HardDrive className="w-6 h-6 text-amber-600" /></div>
            <div className="flex-1">
              <h3 className="font-heading font-bold mb-1">Storage backup</h3>
              <p className="text-sm text-muted-foreground mb-4">Gallery images and documents live in Supabase Storage buckets.</p>
              <Button variant="outline" className="rounded-xl" disabled>Manage storage →</Button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center"><Activity className="w-6 h-6 text-green-600" /></div>
            <div className="flex-1">
              <h3 className="font-heading font-bold mb-1">Platform activity</h3>
              <p className="text-sm text-muted-foreground">Monitor login history and admin actions in Audit Logs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
