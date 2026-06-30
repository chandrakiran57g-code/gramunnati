import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '@/api/admin';
import { adminRoutes } from '@/lib/adminRoutes';
import AdminShell from '@/components/admin/AdminShell';
import {
  Users, Heart, UserPlus, MessageSquare, BookOpen, Layers, DollarSign, BarChart3,
} from 'lucide-react';

function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardBundle()
      .then(({ stats: s }) => setStats(s))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Members', value: stats?.totalMembers ?? 0, icon: Users, link: adminRoutes.memberDirectory, color: 'text-emerald-600' },
    { label: 'Volunteers', value: stats?.totalVolunteers ?? 0, icon: UserPlus, link: adminRoutes.volunteers, color: 'text-volunteer' },
    { label: 'Donations', value: stats?.totalDonations ?? 0, sub: stats ? formatCurrency(stats.totalDonationAmount) : null, icon: Heart, link: adminRoutes.donations, color: 'text-donation' },
    { label: 'Messages', value: stats?.totalMessages ?? 0, badge: stats?.unreadMessages, icon: MessageSquare, link: adminRoutes.messages, color: 'text-school' },
    { label: 'Programs', value: stats?.totalPrograms ?? '—', icon: BookOpen, link: adminRoutes.programs, color: 'text-primary' },
    { label: 'Partners', value: stats?.totalPartners ?? 0, icon: Users, link: adminRoutes.partners, color: 'text-indigo-600' },
  ];

  const quickLinks = [
    { label: 'Navbar Manager → About Us', to: adminRoutes.aboutUs },
    { label: 'Active Works Cards', to: adminRoutes.activeWorksCards },
    { label: 'All Donations', to: adminRoutes.donations },
    { label: 'Detailed Reports', to: adminRoutes.reports },
    { label: 'Settings', to: adminRoutes.settings },
  ];

  return (
    <AdminShell
      title="Dashboard"
      description="Brief platform overview. Open Reports for detailed analysis and CSV exports."
      actions={
        <Link to={adminRoutes.reports}>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium hover:bg-muted">
            <BarChart3 className="h-4 w-4" />Reports
          </span>
        </Link>
      }
    >
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[...Array(6)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <Link key={c.label} to={c.link} className="rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.label}</p>
                    <p className={`mt-1 text-2xl font-bold ${c.color}`}>{c.value}</p>
                    {c.sub && <p className="text-xs text-muted-foreground">{c.sub} received</p>}
                  </div>
                  <c.icon className={`h-5 w-5 ${c.color} opacity-70`} />
                </div>
                {c.badge > 0 && (
                  <span className="mt-2 inline-block rounded-full bg-donation/15 px-2 py-0.5 text-xs font-semibold text-donation">{c.badge} unread</span>
                )}
              </Link>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-white p-5">
              <h2 className="mb-3 flex items-center gap-2 font-semibold"><Layers className="h-4 w-4 text-primary" />Quick links</h2>
              <ul className="space-y-2">
                {quickLinks.map((q) => (
                  <li key={q.to}>
                    <Link to={q.to} className="text-sm text-primary hover:underline">{q.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-white p-5">
              <h2 className="mb-3 flex items-center gap-2 font-semibold"><DollarSign className="h-4 w-4 text-donation" />Today&apos;s focus</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Manage public content under <strong>Navbar Manager</strong>, build village and school spotlight pages under <strong>Active Works</strong>, and track donations and volunteer profiles from the sidebar.
              </p>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
