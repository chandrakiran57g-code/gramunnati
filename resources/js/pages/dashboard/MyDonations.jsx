import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Heart, Download, Filter, TrendingUp, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const generateReceipt = (d) => {
  const content = `CMSR — Village Development Platform\nReceipt: ${d.receipt_number || 'N/A'}\nDate: ${new Date(d.created_date).toLocaleDateString('en-IN')}\nDonor: ${d.is_anonymous ? 'Anonymous' : d.donor_name}\nAmount: ₹${(d.amount || 0).toLocaleString('en-IN')}\nType: ${d.target_type} Donation\nPayment: ${d.payment_status}\n\n80G Tax Exempt — PAN: ${d.pan_number || 'N/A'}\nThank you for your contribution!`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `Receipt-${d.receipt_number || 'CMSR'}.txt`; a.click();
  URL.revokeObjectURL(url);
};

const statusColor = {
  success: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
};

export default function MyDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me().catch(() => null);
      if (u) {
        const d = await base44.entities.Donation.filter({ email: u.email }, '-created_date', 50).catch(() => []);
        setDonations(d);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = filter === 'all' ? donations : donations.filter(d => d.payment_status === filter);
  const totalDonated = donations.filter(d => d.payment_status === 'success').reduce((sum, d) => sum + (d.amount || 0), 0);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl font-bold">My Donations</h1>
          <Link to="/donate"><Button className="donation-gradient text-white border-0"><Heart className="w-4 h-4 mr-2" />Donate Again</Button></Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Donated', value: `₹${totalDonated.toLocaleString('en-IN')}`, color: 'text-donation' },
            { label: 'Total Donations', value: donations.filter(d => d.payment_status === 'success').length, color: 'text-primary' },
            { label: 'Pending', value: donations.filter(d => d.payment_status === 'pending').length, color: 'text-yellow-600' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-2xl border border-border p-5 text-center">
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all','success','pending','failed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === f ? 'bg-primary text-white' : 'bg-white border border-border text-muted-foreground hover:border-primary'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Donation List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-border h-20 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-16 text-center">
            <Heart className="w-12 h-12 text-donation/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No donations found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-donation/10 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-donation" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      {d.target_type === 'village' ? d.village_name || 'Village Fund' : 
                       d.target_type === 'school' ? d.school_name || 'School Fund' :
                       d.target_type === 'project' ? d.project_name || 'Project Fund' : 'General Fund'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 capitalize">{d.target_type} • {new Date(d.created_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="font-bold text-lg text-foreground">₹{d.amount?.toLocaleString('en-IN')}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[d.payment_status] || ''}`}>{d.payment_status}</span>
                  </div>
                  {d.payment_status === 'success' && (
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => generateReceipt(d)}><FileText className="w-3 h-3 mr-1" />Receipt</Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}