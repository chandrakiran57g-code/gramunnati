import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Save, ArrowLeft, Camera, User, Phone, MapPin, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const STATES = ['Andhra Pradesh','Telangana','Karnataka','Tamil Nadu','Maharashtra','Gujarat','Rajasthan','Uttar Pradesh','Madhya Pradesh','West Bengal','Bihar','Odisha','Kerala','Punjab','Haryana','Delhi','Other'];
const USER_CATEGORIES = ['Citizen','Villager','Volunteer','Donor','Student','Teacher','Professional','Entrepreneur','Farmer','NRV'];

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setForm({
        full_name: u.full_name || '',
        mobile: u.mobile || '',
        state: u.state || '',
        district: u.district || '',
        occupation: u.occupation || '',
        category: u.category || '',
        bio: u.bio || '',
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.auth.updateMe(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => navigate('/profile'), 800);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-village/30 border-t-village rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/profile" className="flex items-center gap-1 text-muted-foreground hover:text-village text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Profile
          </Link>

          <h1 className="font-heading text-3xl font-bold mb-8">Edit Profile</h1>

          <div className="bg-white rounded-2xl border border-border p-8">
            <form onSubmit={handleSave} className="space-y-5">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="relative">
                  <div className="w-16 h-16 bg-village/10 rounded-2xl flex items-center justify-center text-2xl font-bold text-village">
                    {user?.full_name?.charAt(0) || '?'}
                  </div>
                  <button type="button" className="absolute -bottom-1 -right-1 w-6 h-6 bg-school rounded-full flex items-center justify-center">
                    <Camera className="w-3 h-3 text-white" />
                  </button>
                </div>
                <div>
                  <div className="font-semibold">{user?.email}</div>
                  <div className="text-xs text-muted-foreground">Email cannot be changed</div>
                </div>
              </div>

              <div>
                <Label htmlFor="full_name"><User className="w-3.5 h-3.5 inline mr-1" /> Full Name</Label>
                <Input id="full_name" value={form.full_name || ''} onChange={e => setForm(f => ({...f, full_name: e.target.value}))} className="mt-1 rounded-xl" placeholder="Your full name" />
              </div>

              <div>
                <Label htmlFor="mobile"><Phone className="w-3.5 h-3.5 inline mr-1" /> Mobile Number</Label>
                <Input id="mobile" value={form.mobile || ''} onChange={e => setForm(f => ({...f, mobile: e.target.value}))} className="mt-1 rounded-xl" placeholder="Your mobile number" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label><MapPin className="w-3.5 h-3.5 inline mr-1" /> State</Label>
                  <Select value={form.state || ''} onValueChange={v => setForm(f => ({...f, state: v}))}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Select State" /></SelectTrigger>
                    <SelectContent>{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="district">District</Label>
                  <Input id="district" value={form.district || ''} onChange={e => setForm(f => ({...f, district: e.target.value}))} className="mt-1 rounded-xl" placeholder="Your district" />
                </div>
              </div>

              <div>
                <Label>User Category</Label>
                <Select value={form.category || ''} onValueChange={v => setForm(f => ({...f, category: v}))}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>{USER_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="occupation"><Briefcase className="w-3.5 h-3.5 inline mr-1" /> Occupation</Label>
                <Input id="occupation" value={form.occupation || ''} onChange={e => setForm(f => ({...f, occupation: e.target.value}))} className="mt-1 rounded-xl" placeholder="Your occupation" />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={form.bio || ''} onChange={e => setForm(f => ({...f, bio: e.target.value}))} className="mt-1 rounded-xl h-24" placeholder="Tell us a bit about yourself" />
              </div>

              <Button type="submit" disabled={saving} className="w-full village-gradient text-white border-0 rounded-xl py-3 text-base">
                <Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}