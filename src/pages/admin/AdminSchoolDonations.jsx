import { useState, useEffect } from 'react';
import { adminService } from '@/api/admin';
import { Heart, Loader2 } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

export default function AdminSchoolDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.listAllDonations({ limit: 200, targetType: 'school' })
      .then(({ data }) => setDonations(data || []))
      .catch(() => setDonations([]))
      .finally(() => setLoading(false));
  }, []);

  const total = donations.filter((d) => d.payment_status === 'success').reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <AdminPageHeader title="School Donations" subtitle={`₹${total.toLocaleString('en-IN')} received across schools`} gradient="school-gradient" />
      </HeroScrollSection>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-border overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : donations.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground"><Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />No school donations yet</div>
          ) : (
            <table className="w-full text-sm min-w-[640px]">
              <thead><tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3">Donor</th>
                <th className="text-left px-4 py-3">School</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Date</th>
              </tr></thead>
              <tbody className="divide-y">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">{d.donor_name || 'Anonymous'}</td>
                    <td className="px-4 py-3">{d.schools?.school_name || '—'}</td>
                    <td className="px-4 py-3 font-medium">₹{Number(d.amount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 capitalize">{d.payment_status}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.created_at ? new Date(d.created_at).toLocaleDateString('en-IN') : '—'}</td>
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
