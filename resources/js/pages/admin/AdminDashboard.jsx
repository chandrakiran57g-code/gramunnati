import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminService } from '@/api/admin';
import {
  Users, MapPin, School, FolderOpen, Heart, TrendingUp, MessageSquare,
  Activity, Settings, Bell, Handshake, UserPlus,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

function formatArea(profile) {
  const district = profile.districts?.name || profile.district;
  const state = profile.states?.name || profile.state;
  const parts = [district, state].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
}

function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [donationTrend, setDonationTrend] = useState([]);
  const [projectDist, setProjectDist] = useState([]);
  const [activity, setActivity] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminService.getDashboardBundle()
      .then(({ stats: s, donationTrend: trend, projectDist: dist, activity: feed, recentMembers: members }) => {
        setStats(s);
        setDonationTrend(trend);
        setProjectDist(dist);
        setActivity(feed);
        setRecentMembers(members);
      })
      .catch((err) => setError(err.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Villages', value: stats?.totalVillages ?? 0, icon: MapPin, color: 'text-primary', bg: 'bg-primary/10', link: '/admin/villages' },
    { label: 'Schools', value: stats?.totalSchools ?? 0, icon: School, color: 'text-school', bg: 'bg-school/10', link: '/admin/schools' },
    { label: 'Projects', value: stats?.totalProjects ?? 0, icon: FolderOpen, color: 'text-projects', bg: 'bg-projects/10', link: '/admin/projects' },
    { label: 'Donations', value: stats?.totalDonations ?? 0, icon: Heart, color: 'text-donation', bg: 'bg-donation/10', link: '/admin/donations', sub: stats ? formatCurrency(stats.totalDonationAmount) : null },
    { label: 'Members', value: stats?.totalMembers ?? 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/admin/users' },
    { label: 'Volunteers', value: stats?.totalVolunteers ?? 0, icon: UserPlus, color: 'text-volunteer', bg: 'bg-volunteer/10', link: '/admin/volunteers' },
    { label: 'Partners', value: stats?.totalPartners ?? 0, icon: Handshake, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/admin/partners' },
    { label: 'Messages', value: stats?.totalMessages ?? 0, icon: MessageSquare, color: 'text-school', bg: 'bg-school/10', link: '/admin/messages', badge: stats?.unreadMessages },
  ];

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="compact">
        <div className="brand-gradient py-8 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-white/70 text-sm mt-1">GramUnnati platform overview — live from database</p>
            </div>
            <div className="flex gap-3">
              <Link to="/admin/settings">
                <button type="button" className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </Link>
              <Link to="/admin/messages">
                <button type="button" className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors relative">
                  <Bell className="w-5 h-5" />
                  {(stats?.unreadMessages ?? 0) > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-donation rounded-full text-[10px] font-bold flex items-center justify-center">
                      {stats.unreadMessages}
                    </span>
                  )}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Could not load some dashboard data: {error}. Check Supabase connection in `.env.local`.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {statCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to={card.link} className="block bg-white rounded-2xl border border-border p-4 hover:shadow-lg transition-all hover:-translate-y-0.5 relative">
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="text-2xl font-bold">{loading ? '…' : card.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
                {card.sub && <div className="text-[10px] text-donation font-medium mt-1">{card.sub}</div>}
                {card.badge > 0 && (
                  <span className="absolute top-3 right-3 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                    {card.badge} new
                  </span>
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg">Donation Trends (last 6 months)</h3>
              <TrendingUp className="w-5 h-5 text-donation" />
            </div>
            {loading ? (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">Loading chart…</div>
            ) : (
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
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => [formatCurrency(v), 'Donations']} />
                  <Area type="monotone" dataKey="amount" stroke="#F59E0B" fill="url(#donGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="font-heading font-bold text-lg mb-4">Projects by Category</h3>
            {loading ? (
              <div className="h-[160px] flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={projectDist} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                      {projectDist.map((entry, i) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v}%`, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2 max-h-24 overflow-y-auto">
                  {projectDist.map((d) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                        <span className="truncate">{d.name}</span>
                      </div>
                      <span className="font-medium shrink-0 ml-2">{d.count ?? d.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="font-heading font-bold text-lg mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Manage Villages', icon: '🏘️', link: '/admin/villages', color: 'hover:bg-primary/5 hover:text-primary' },
                { label: 'Manage Schools', icon: '🏫', link: '/admin/schools', color: 'hover:bg-school/5 hover:text-school' },
                { label: 'Manage Projects', icon: '📋', link: '/admin/projects', color: 'hover:bg-projects/5 hover:text-projects' },
                { label: 'View Donations', icon: '💰', link: '/admin/donations', color: 'hover:bg-donation/5 hover:text-donation' },
                { label: 'Member Directory', icon: '👥', link: '/admin/member-directory', color: 'hover:bg-emerald-50 hover:text-emerald-700' },
                { label: 'Website CMS', icon: '📝', link: '/admin/cms', color: 'hover:bg-muted' },
                { label: 'Settings', icon: '⚙️', link: '/admin/settings', color: 'hover:bg-muted' },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.link}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground transition-colors ${item.color}`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-heading font-bold text-lg">Recent Activity</h3>
              <span className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            {loading ? (
              <div className="text-sm text-muted-foreground py-8 text-center">Loading activity…</div>
            ) : activity.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">No recent activity yet.</div>
            ) : (
              <div className="space-y-3">
                {activity.slice(0, 8).map((item, i) => (
                  <motion.div
                    key={`${item.text}-${i}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-9 h-9 ${item.color || 'bg-muted'} rounded-xl flex items-center justify-center text-base flex-shrink-0`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.text}</div>
                      <div className="text-xs text-muted-foreground">{item.time}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-lg">Latest Registrations</h3>
            <Link to="/admin/users" className="text-sm text-primary hover:underline">View all members</Link>
          </div>
          {loading ? (
            <div className="text-sm text-muted-foreground py-6 text-center">Loading…</div>
          ) : recentMembers.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">No registered members yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold">Name</th>
                    <th className="text-left px-4 py-3 font-semibold">Mobile</th>
                    <th className="text-left px-4 py-3 font-semibold">Area</th>
                    <th className="text-left px-4 py-3 font-semibold">Profession</th>
                    <th className="text-left px-4 py-3 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{m.full_name || 'Member'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.mobile || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatArea(m)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.occupation || m.profession || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {m.created_at ? new Date(m.created_at).toLocaleDateString('en-IN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
