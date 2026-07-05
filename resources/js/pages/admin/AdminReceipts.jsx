import { useState, useEffect } from 'react';
import { adminService } from '@/api/admin';
import { Receipt, Loader2, Download } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

export default function AdminReceipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.listReceipts()
      .then(setReceipts)
      .catch(() => setReceipts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <AdminPageHeader title="Donation Receipts" subtitle="Receipts and certificates from `donation_receipts`" gradient="donation-gradient" />
      </HeroScrollSection>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-border overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
              No receipts generated yet.
            </div>
          ) : (
            <table className="w-full text-sm min-w-[640px]">
              <thead><tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3">Receipt #</th>
                <th className="text-left px-4 py-3">Donor</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">File</th>
              </tr></thead>
              <tbody className="divide-y">
                {receipts.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs">{r.receipt_number || r.id?.slice(0, 8)}</td>
                    <td className="px-4 py-3">{(() => {
                      const d = r.donation || r.donations;
                      return d?.donor_name || '—';
                    })()}</td>
                    <td className="px-4 py-3">₹{Number((r.donation || r.donations)?.amount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 capitalize">{(r.donation || r.donations)?.payment_status || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {r.receipt_path ? (
                        <a href={r.receipt_path} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1 text-xs hover:underline">
                          <Download className="w-3 h-3" />Download
                        </a>
                      ) : '—'}
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
