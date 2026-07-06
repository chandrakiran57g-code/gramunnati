import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { adminService } from '@/api/admin';
import { adminDbMutation } from '@/lib/adminDb';
import { toast } from 'sonner';
import { Search, Download, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { aggregateDonationsByType } from '@/hooks/useGeoPickers';

const statusColor = {
  success: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
};

export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = useCallback(() => {
    setLoading(true);
    adminService.listAllDonations({ limit: 200 })
      .then(({ data }) => setDonations(data || []))
      .catch(() => setDonations([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (d) => {
    const name = d.is_anonymous ? 'Anonymous' : d.donor_name;
    if (!confirm(`Delete donation of ₹${(d.amount || 0).toLocaleString('en-IN')} from "${name}"? Its receipt will also be removed. This cannot be undone.`)) return;
    try {
      await adminDbMutation(async () => {
        await adminService.deleteRecord('donations', d.id);
      });
      toast.success('Donation deleted');
      load();
    } catch (e) {
      toast.error(e.message || 'Delete failed');
    }
  };

  const filtered = donations.filter(d => {
    const matchQ = !query || d.donor_name?.toLowerCase().includes(query.toLowerCase()) || d.email?.toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.payment_status === statusFilter;
    return matchQ && matchStatus;
  });

  const totalSuccess = donations.filter(d => d.payment_status === 'success').reduce((sum, d) => sum + (d.amount || 0), 0);
  const byType = useMemo(() => aggregateDonationsByType(donations), [donations]);

  const exportCsv = () => {
    const headers = ['Donor', 'Email', 'Target', 'Amount', 'Status', 'Date'];
    const rows = filtered.map((d) => [
      d.is_anonymous ? 'Anonymous' : d.donor_name,
      d.email || '',
      d.target_type,
      d.amount,
      d.payment_status,
      d.created_at || d.created_date || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'donations.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <div className="donation-gradient py-8 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">Donations</h1>
              <p className="text-white/80 text-sm mt-1">Total: ₹{totalSuccess.toLocaleString('en-IN')} received</p>
            </div>
            <div className="flex gap-3">
              <Link to="/admin"><Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">← Dashboard</Button></Link>
              <Button size="sm" className="bg-white text-donation font-semibold" onClick={exportCsv}><Download className="w-4 h-4 mr-1" />Export CSV</Button>
            </div>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {byType.map(t => (
            <div key={t.type} className="bg-white rounded-2xl border border-border p-5">
              <div className="text-xs text-muted-foreground mb-1">{t.type} Fund</div>
              <div className="text-xl font-bold text-donation">₹{t.amount >= 100000 ? `${(t.amount / 100000).toFixed(1)}L` : t.amount >= 1000 ? `${(t.amount / 1000).toFixed(1)}k` : t.amount.toLocaleString('en-IN')}</div>
              <div className="text-xs text-muted-foreground mt-1">{t.count} donations</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl border border-border p-6 mb-8">
          <h3 className="font-heading font-bold text-lg mb-4">Donations by Fund Type</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="type" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Amount']} />
              <Bar dataKey="amount" fill="#F59E0B" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name or email..." value={query} onChange={e => setQuery(e.target.value)} className="pl-10 rounded-xl" />
          </div>
          {['all','success','pending','failed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === s ? 'bg-primary text-white' : 'bg-white border border-border text-muted-foreground hover:border-primary'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-border h-14 animate-pulse" />)}</div>
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Donor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Target</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Date</th>
                  <th className="w-14 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((d, i) => (
                  <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-muted/20">
                    <td className="px-5 py-3">
                      <div className="font-medium text-sm">{d.is_anonymous ? 'Anonymous' : d.donor_name}</div>
                      <div className="text-xs text-muted-foreground">{d.email || d.mobile || '—'}</div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs font-medium capitalize bg-muted px-2 py-0.5 rounded-full">{d.target_type}</span>
                      {d.target_type !== 'general' && <div className="text-xs text-muted-foreground mt-0.5">{d.village_name || d.school_name || d.project_name || '—'}</div>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="font-bold text-donation">₹{d.amount?.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[d.payment_status] || ''}`}>{d.payment_status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                      {new Date(d.created_at || d.created_date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(d)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-16 text-muted-foreground">No donations found</div>}
          </div>
        )}
      </div>
    </div>
  );
}