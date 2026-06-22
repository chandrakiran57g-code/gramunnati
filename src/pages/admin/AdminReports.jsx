import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminService } from '@/api/admin';
import { supabase } from '@/api/supabaseClient';
import { Download, TrendingUp, FileText, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

const COLORS = ['#2D6A4F', '#2563EB', '#7C3AED', '#F59E0B', '#22C55E', '#EF4444', '#06B6D4'];

export default function AdminReports() {
  const [stats, setStats] = useState({ villages: 0, schools: 0, projects: 0, donations: 0, volunteers: 0, totalDonated: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getDashboardStats(),
      supabase.from('villages').select('states(name)').is('deleted_at', null).limit(500),
    ]).then(([stats, villagesRes]) => {
      const v = villagesRes.data || [];
      const byState = {};
      v.forEach((x) => {
        const st = x.states?.name || 'Unknown';
        byState[st] = (byState[st] || 0) + 1;
      });
      const stateChart = Object.entries(byState).map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value).slice(0, 8);

      setStats({
        villages: stats.totalVillages,
        schools: stats.totalSchools,
        projects: stats.totalProjects,
        donations: stats.totalDonations,
        volunteers: stats.totalVolunteers,
        totalDonated: stats.totalDonationAmount,
      });
      setChartData(stateChart);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <div className="py-8 px-6" style={{ background: 'linear-gradient(135deg, #0F766E, #2D6A4F)' }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">Reports & Analytics</h1>
              <p className="text-white/70 text-sm mt-1">Exportable summaries and platform insights</p>
            </div>
            <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Download className="w-4 h-4 mr-2" />Export CSV
            </Button>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Villages', value: stats.villages, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Schools', value: stats.schools, color: 'text-school', bg: 'bg-school/10' },
            { label: 'Projects', value: stats.projects, color: 'text-projects', bg: 'bg-projects/10' },
            { label: 'Donations', value: stats.donations, color: 'text-donation', bg: 'bg-donation/10' },
            { label: 'Volunteers', value: stats.volunteers, color: 'text-volunteer', bg: 'bg-volunteer/10' },
            { label: 'Total Donated', value: `₹${(stats.totalDonated / 10000000).toFixed(1)}Cr`, color: 'text-reports', bg: 'bg-reports/10' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-2xl border border-border p-4 text-center">
              <div className={`text-xl font-bold ${card.color}`}>{loading ? '...' : card.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="font-heading font-bold text-lg mb-4">Villages by State</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#2D6A4F" radius={[4,4,0,0]} name="Villages" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="font-heading font-bold text-lg mb-4">Category Distribution</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={[
                  { name: 'Village Dev', value: 35 },
                  { name: 'School Dev', value: 25 },
                  { name: 'Tree Plantation', value: 15 },
                  { name: 'Water', value: 12 },
                  { name: 'Healthcare', value: 8 },
                  { name: 'Others', value: 5 },
                ]} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value">
                  {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip formatter={v => [v + '%']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { title: 'Village Report', desc: 'Detailed village-wise impact and development summary', icon: '🏘️' },
            { title: 'Donation Summary', desc: 'Monthly donation reports with donor breakdown', icon: '💰' },
            { title: 'Volunteer Report', desc: 'Volunteer hours, projects, and retention metrics', icon: '🤝' },
          ].map(r => (
            <div key={r.title} className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">{r.icon}</div>
              <h4 className="font-semibold text-sm mb-1">{r.title}</h4>
              <p className="text-xs text-muted-foreground mb-3">{r.desc}</p>
              <Button size="sm" variant="outline" className="text-xs"><Download className="w-3 h-3 mr-1" />Generate</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}