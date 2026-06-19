import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Users, MapPin, School, FolderOpen, Heart, TrendingUp, MessageSquare, Activity, Settings, BarChart3, Bell } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

const donationTrend = [
  { month: 'Jan', amount: 42000 },
  { month: 'Feb', amount: 68000 },
  { month: 'Mar', amount: 55000 },
  { month: 'Apr', amount: 89000 },
  { month: 'May', amount: 73000 },
  { month: 'Jun', amount: 112000 },
];

const projectDist = [
  { name: 'Village Dev', value: 35, color: '#2D6A4F' },
  { name: 'School Dev', value: 25, color: '#2563EB' },
  { name: 'Tree Plantation', value: 15, color: '#22C55E' },
  { name: 'Water Conservation', value: 12, color: '#06B6D4' },
  { name: 'Healthcare', value: 8, color: '#EF4444' },
  { name: 'Others', value: 5, color: '#6B7280' },
];

const recentActivity = [
  { text: '₹5,000 donated to Kondapur School', time: '2 min ago', icon: '💛', color: 'bg-donation/10' },
  { text: 'New volunteer joined from Hyderabad', time: '15 min ago', icon: '🌱', color: 'bg-volunteer/10' },
  { text: 'Village: Rajapet updated their profile', time: '1 hr ago', icon: '🏘️', color: 'bg-primary/10' },
  { text: 'Library project completed in Warangal', time: '3 hr ago', icon: '✅', color: 'bg-green-100' },
  { text: '20 trees planted in Nalgonda', time: '5 hr ago', icon: '🌳', color: 'bg-green-50' },
  { text: 'New contact message from Priya Sharma', time: '6 hr ago', icon: '📧', color: 'bg-school/10' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ villages: 0, schools: 0, projects: 0, volunteers: 0, donations: 0, messages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Village.list('-created_date', 1).catch(() => []),
      base44.entities.School.list('-created_date', 1).catch(() => []),
      base44.entities.Project.list('-created_date', 1).catch(() => []),
      base44.entities.Volunteer.list('-created_date', 1).catch(() => []),
      base44.entities.Donation.list('-created_date', 1).catch(() => []),
      base44.entities.ContactMessage.list('-created_date', 1).catch(() => []),
    ]).then(([v, s, p, vol, d, m]) => {
      setStats({ villages: v.length, schools: s.length, projects: p.length, volunteers: vol.length, donations: d.length, messages: m.length });
      setLoading(false);
    });
  }, []);

  const statCards = [
    { label: 'Villages', value: stats.villages, icon: MapPin, color: 'text-primary', bg: 'bg-primary/10', link: '/administrator/villages' },
    { label: 'Schools', value: stats.schools, icon: School, color: 'text-school', bg: 'bg-school/10', link: '/administrator/schools' },
    { label: 'Projects', value: stats.projects, icon: FolderOpen, color: 'text-projects', bg: 'bg-projects/10', link: '/administrator/projects' },
    { label: 'Volunteers', value: stats.volunteers, icon: Users, color: 'text-volunteer', bg: 'bg-volunteer/10', link: '/administrator/volunteers' },
    { label: 'Donations', value: stats.donations, icon: Heart, color: 'text-donation', bg: 'bg-donation/10', link: '/administrator/donations' },
    { label: 'Messages', value: stats.messages, icon: MessageSquare, color: 'text-school', bg: 'bg-school/10', link: '/administrator/messages' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeroScrollSection size="compact">
        <div className="brand-gradient py-8 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-white/70 text-sm mt-1">GramUnnati Platform Management</p>
            </div>
            <div className="flex gap-3">
              <Link to="/administrator/settings"><button className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors"><Settings className="w-5 h-5" /></button></Link>
              <button className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-donation rounded-full" />
              </button>
            </div>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Link to={card.link} className="block bg-white rounded-2xl border border-border p-4 hover:shadow-lg transition-all hover:-translate-y-0.5">
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="text-2xl font-bold">{loading ? '...' : card.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Donation Trend */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg">Donation Trends (2026)</h3>
              <TrendingUp className="w-5 h-5 text-donation" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={donationTrend}>
                <defs>
                  <linearGradient id="donGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Donations']} />
                <Area type="monotone" dataKey="amount" stroke="#F59E0B" fill="url(#donGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Project Distribution Pie */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="font-heading font-bold text-lg mb-4">Projects by Category</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={projectDist} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                  {projectDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v + '%', n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {projectDist.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} /><span>{d.name}</span></div>
                  <span className="font-medium">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Admin Quick Actions + Activity Feed */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Links */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="font-heading font-bold text-lg mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Manage Villages', icon: '🏘️', link: '/administrator/villages', color: 'hover:bg-primary/5 hover:text-primary' },
                { label: 'Manage Schools', icon: '🏫', link: '/administrator/schools', color: 'hover:bg-school/5 hover:text-school' },
                { label: 'Manage Projects', icon: '📋', link: '/administrator/projects', color: 'hover:bg-projects/5 hover:text-projects' },
                { label: 'View Donations', icon: '💰', link: '/administrator/donations', color: 'hover:bg-donation/5 hover:text-donation' },
                { label: 'Manage Volunteers', icon: '🤝', link: '/administrator/volunteers', color: 'hover:bg-volunteer/5 hover:text-volunteer' },
                { label: 'Contact Messages', icon: '📧', link: '/administrator/messages', color: 'hover:bg-school/5 hover:text-school' },
                { label: 'CMS / Stories', icon: '📝', link: '/administrator/cms', color: 'hover:bg-muted' },
                { label: 'Settings', icon: '⚙️', link: '/administrator/settings', color: 'hover:bg-muted' },
              ].map(item => (
                <Link key={item.label} to={item.link}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground transition-colors ${item.color}`}>
                  <span className="text-base">{item.icon}</span>{item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-heading font-bold text-lg">Live Activity Feed</h3>
              <span className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3">
                  <div className={`w-9 h-9 ${item.color} rounded-xl flex items-center justify-center text-base flex-shrink-0`}>{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.text}</div>
                    <div className="text-xs text-muted-foreground">{item.time}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}