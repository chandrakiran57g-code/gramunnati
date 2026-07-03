import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { User, Lock, Globe, Bell, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    villageUpdates: true,
    schoolUpdates: true,
    donationReceipts: true,
    newsletter: false,
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u.preferences) setPrefs(u.preferences);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const togglePref = async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    await base44.auth.updateMe({ preferences: updated }).catch(() => {});
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold mb-8">Settings</h1>

          {/* Profile Section */}
          <div className="bg-white rounded-2xl border border-border p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-bold text-lg">Profile</h2>
            </div>
            <Link to="/profile/edit">
              <Button variant="outline" className="w-full justify-start border-border rounded-xl py-5 text-left">
                <span>Edit profile information</span>
                <span className="ml-auto text-muted-foreground text-sm">{user?.full_name}</span>
              </Button>
            </Link>
          </div>

          {/* Password Section */}
          <div className="bg-white rounded-2xl border border-border p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-school" />
              <h2 className="font-heading font-bold text-lg">Security</h2>
            </div>
            <Button variant="outline" className="w-full justify-start border-border rounded-xl py-5 text-left" disabled>
              <span>Change password</span>
              <span className="ml-auto text-muted-foreground text-sm">Coming soon</span>
            </Button>
          </div>

          {/* Language */}
          <div className="bg-white rounded-2xl border border-border p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-projects" />
              <h2 className="font-heading font-bold text-lg">Language</h2>
            </div>
            <div className="flex gap-2">
              {['English', 'తెలుగు', 'हिंदी'].map(lang => (
                <button key={lang} className={`px-4 py-2 rounded-lg text-sm border transition-all ${lang === 'English' ? 'bg-primary text-white border-primary' : 'bg-white border-border hover:border-primary text-muted-foreground'}`}>
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-2xl border border-border p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-donation" />
              <h2 className="font-heading font-bold text-lg">Notification Preferences</h2>
            </div>
            <div className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                { key: 'villageUpdates', label: 'Village Updates', desc: 'Get updates about your followed villages' },
                { key: 'schoolUpdates', label: 'School Updates', desc: 'Get updates about your followed schools' },
                { key: 'donationReceipts', label: 'Donation Receipts', desc: 'Receive receipts for your donations' },
                { key: 'newsletter', label: 'Newsletter', desc: 'Monthly CMSR newsletter' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={prefs[item.key]} onCheckedChange={() => togglePref(item.key)} />
                </div>
              ))}
            </div>
          </div>

          {/* Logout */}
          <div className="bg-white rounded-2xl border border-red-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-red-500" />
              <h2 className="font-heading font-bold text-lg text-red-600">Account</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-4">Logout from your account on this device.</p>
            <Button variant="destructive" onClick={() => base44.auth.logout('/')} className="w-full">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}