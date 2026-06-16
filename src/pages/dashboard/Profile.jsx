import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { User, Mail, Phone, MapPin, Save, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATES = ['Andhra Pradesh','Telangana','Karnataka','Tamil Nadu','Maharashtra','Gujarat','Rajasthan','Uttar Pradesh','Madhya Pradesh','West Bengal','Bihar','Odisha','Kerala','Punjab','Haryana','Delhi','Other'];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setForm({ full_name: u.full_name || '', state: u.state || '', district: u.district || '', occupation: u.occupation || '' });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.auth.updateMe(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-village/30 border-t-village rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold mb-8">My Profile</h1>

          <div className="bg-white rounded-2xl border border-border p-8 mb-6">
            {/* Avatar */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
              <div className="relative">
                <div className="w-20 h-20 bg-village/10 rounded-2xl flex items-center justify-center text-3xl font-bold text-village">
                  {user?.full_name?.charAt(0) || '?'}
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-school rounded-full flex items-center justify-center">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <div>
                <div className="font-heading text-xl font-bold">{user?.full_name}</div>
                <div className="text-muted-foreground text-sm flex items-center gap-1 mt-1"><Mail className="w-3.5 h-3.5" />{user?.email}</div>
                <div className="mt-2"><span className="text-xs bg-village/10 text-village px-2.5 py-1 rounded-full font-medium">Member</span></div>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" value={form.full_name || ''} onChange={e => setForm(f => ({...f, full_name: e.target.value}))} className="mt-1 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>State</Label>
                  <Select value={form.state || ''} onValueChange={v => setForm(f => ({...f, state: v}))}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Select State" /></SelectTrigger>
                    <SelectContent>{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="district">District</Label>
                  <Input id="district" value={form.district || ''} onChange={e => setForm(f => ({...f, district: e.target.value}))} placeholder="Your district" className="mt-1 rounded-xl" />
                </div>
              </div>
              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input id="occupation" value={form.occupation || ''} onChange={e => setForm(f => ({...f, occupation: e.target.value}))} placeholder="Your occupation" className="mt-1 rounded-xl" />
              </div>
              <Button type="submit" disabled={saving} className="w-full village-gradient text-white border-0 rounded-xl py-3">
                <Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}