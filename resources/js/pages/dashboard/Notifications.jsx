import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { notificationsService } from '@/api/cms';
import { Bell, BellRing, Heart, MapPin, School, FolderOpen, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TYPE_META = {
  village: { icon: MapPin, color: 'text-primary', bg: 'bg-primary/10' },
  donation: { icon: Heart, color: 'text-donation', bg: 'bg-donation/10' },
  school: { icon: School, color: 'text-school', bg: 'bg-school/10' },
  project: { icon: FolderOpen, color: 'text-projects', bg: 'bg-projects/10' },
  system: { icon: Info, color: 'text-cms', bg: 'bg-cms/10' },
};

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function mapRow(row) {
  const type = row.type || 'system';
  const meta = TYPE_META[type] || TYPE_META.system;
  return {
    id: row.id,
    type,
    title: row.title || 'Notification',
    desc: row.message || row.body || '',
    date: formatDate(row.created_at),
    read: Boolean(row.is_read),
    ...meta,
  };
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me().catch(() => null);
      if (!user?.id) {
        setNotifications([]);
        return;
      }
      setUserId(user.id);
      const rows = await notificationsService.list(user.id).catch(() => []);
      setNotifications((rows || []).map(mapRow));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (userId) await notificationsService.markAllAsRead(userId).catch(() => {});
  };

  const markRead = async (id) => {
    const target = notifications.find(n => n.id === id);
    if (!target || target.read) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await notificationsService.markAsRead(id).catch(() => {});
  };

  const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.read) : notifications.filter(n => n.type === filter);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-3xl font-bold">Notifications</h1>
              {unreadCount > 0 && <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread</p>}
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllRead} className="text-xs">
                <BellRing className="w-3.5 h-3.5 mr-1" /> Mark All Read
              </Button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {[{ label: 'All', value: 'all' }, { label: 'Unread', value: 'unread' }, { label: 'Villages', value: 'village' }, { label: 'Schools', value: 'school' }, { label: 'Donations', value: 'donation' }, { label: 'Projects', value: 'project' }].map(f => (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === f.value ? 'bg-primary text-white' : 'bg-white border border-border text-muted-foreground hover:border-primary'}`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-16 text-center">
              <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No notifications yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(n => (
                <motion.div key={n.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-xl border p-4 flex items-start gap-4 cursor-pointer hover:shadow-md transition-all ${!n.read ? 'border-l-4 border-l-primary bg-primary/5' : 'border-border'}`}
                  onClick={() => markRead(n.id)}
                >
                  <div className={`w-10 h-10 ${n.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <n.icon className={`w-5 h-5 ${n.color}`} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className={`text-sm font-semibold ${!n.read ? 'text-foreground' : 'text-foreground/70'}`}>{n.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.desc}</p>
                      </div>
                      {!n.read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">{n.date}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
