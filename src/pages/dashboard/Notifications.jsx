import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Bell, BellRing, Heart, MapPin, School, FolderOpen, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEMO_NOTIFICATIONS = [
  { id: 1, type: 'village', title: 'Solar lights installed in your village', desc: '20 solar street lights have been installed in Medaram village.', date: '2 hours ago', icon: MapPin, color: 'text-village', bg: 'bg-village/10', read: false },
  { id: 2, type: 'donation', title: 'Thank you for your donation!', desc: 'Your donation of ₹1,000 to ZPHS Medaram has been received.', date: '1 day ago', icon: Heart, color: 'text-donation', bg: 'bg-donation/10', read: false },
  { id: 3, type: 'school', title: 'New library inaugurated', desc: 'ZPHS Medaram school library with 500 books is now open.', date: '2 days ago', icon: School, color: 'text-school', bg: 'bg-school/10', read: true },
  { id: 4, type: 'project', title: 'Tree plantation drive completed', desc: '500 saplings planted across 3 villages this weekend.', date: '3 days ago', icon: FolderOpen, color: 'text-projects', bg: 'bg-projects/10', read: true },
  { id: 5, type: 'system', title: 'New feature: Compare Villages', desc: 'You can now compare villages side by side on GramUnnati.', date: '1 week ago', icon: Info, color: 'text-cms', bg: 'bg-cms/10', read: true },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
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
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === f.value ? 'bg-village text-white' : 'bg-white border border-border text-muted-foreground hover:border-village'}`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-16 text-center">
              <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No notifications in this category.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(n => (
                <motion.div key={n.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-xl border p-4 flex items-start gap-4 cursor-pointer hover:shadow-md transition-all ${!n.read ? 'border-l-4 border-l-village bg-village/5' : 'border-border'}`}
                  onClick={() => toggleRead(n.id)}
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
                      {!n.read && <span className="w-2 h-2 bg-village rounded-full flex-shrink-0 mt-1.5" />}
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