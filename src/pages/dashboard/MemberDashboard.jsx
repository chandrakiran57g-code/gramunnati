import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Heart, Users, Bell, Settings, User, MapPin, School, Activity, TrendingUp, BookOpen, Award, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BADGES = [
  { id: 'first_donation', label: 'First Donor', icon: '💛', color: 'bg-donation/10 text-donation' },
  { id: 'volunteer', label: 'Volunteer', icon: '🌱', color: 'bg-volunteer/10 text-volunteer' },
  { id: 'village_supporter', label: 'Village Supporter', icon: '🏘️', color: 'bg-village/10 text-village' },
];

export default function MemberDashboard() {
  const [user, setUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      if (u) {
        const d = await base44.entities.Donation.filter({ email: u.email }, '-created_date', 10).catch(() => []);
        setDonations(d);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-village/30 border-t-village rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="font-heading text-2xl font-bold mb-2">Login Required</h2>
        <p className="text-muted-foreground mb-6">Please login to access your member dashboard.</p>
        <Link to="/login"><Button className="village-gradient text-white border-0">Login</Button></Link>
      </div>
    </div>
  );

  const totalDonated = donations.filter(d => d.payment_status === 'success').reduce((sum, d) => sum + (d.amount || 0), 0);
  const successDonations = donations.filter(d => d.payment_status === 'success');

  const widgets = [
    { label: 'Total Donated', value: `₹${totalDonated.toLocaleString('en-IN')}`, icon: Heart, color: 'text-donation', bg: 'bg-donation/10' },
    { label: 'Donations Made', value: successDonations.length, icon: TrendingUp, color: 'text-village', bg: 'bg-village/10' },
    { label: 'Villages Followed', value: 0, icon: MapPin, color: 'text-school', bg: 'bg-school/10' },
    { label: 'Schools Followed', value: 0, icon: School, color: 'text-projects', bg: 'bg-projects/10' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="village-gradient py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white border-2 border-white/30">
            {user.full_name?.charAt(0) || '?'}
          </div>
          <div className="text-white">
            <h1 className="font-heading text-3xl font-bold">{user.full_name || 'Member'}</h1>
            <p className="text-white/70 text-sm mt-1">{user.email}</p>
            <div className="flex gap-2 mt-3">
              {BADGES.map(b => (
                <span key={b.id} className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full">{b.icon} {b.label}</span>
              ))}
            </div>
          </div>
          <div className="sm:ml-auto flex gap-3 flex-wrap">
            <Link to="/profile"><Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20"><User className="w-4 h-4 mr-1" />Profile</Button></Link>
            <Link to="/my-villages"><Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20"><MapPin className="w-4 h-4 mr-1" />Villages</Button></Link>
            <Link to="/my-schools"><Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20"><School className="w-4 h-4 mr-1" />Schools</Button></Link>
            <Link to="/settings"><Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20"><Settings className="w-4 h-4 mr-1" />Settings</Button></Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {widgets.map((w, i) => (
            <motion.div key={w.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl border border-border p-5">
              <div className={`w-10 h-10 ${w.bg} rounded-xl flex items-center justify-center mb-3`}>
                <w.icon className={`w-5 h-5 ${w.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground">{w.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{w.label}</div>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="donations" className="w-full">
          <TabsList className="mb-6 bg-muted rounded-xl p-1">
            <TabsTrigger value="donations" className="rounded-lg">My Donations</TabsTrigger>
            <TabsTrigger value="villages" className="rounded-lg">Followed Villages</TabsTrigger>
            <TabsTrigger value="schools" className="rounded-lg">Followed Schools</TabsTrigger>
            <TabsTrigger value="volunteer" className="rounded-lg">Volunteer</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="donations">
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg">Donation History</h3>
                <Link to="/my-donations"><Button size="sm" variant="outline">View All</Button></Link>
              </div>
              {successDonations.length === 0 ? (
                <div className="text-center py-16">
                  <Heart className="w-12 h-12 text-donation/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No donations yet. Be the first to make an impact!</p>
                  <Link to="/donate" className="mt-4 inline-block">
                    <Button className="donation-gradient text-white border-0 mt-3">Donate Now</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {successDonations.slice(0, 5).map(d => (
                    <div key={d.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <div className="font-medium text-sm">{d.target_type === 'village' ? d.village_name : d.target_type === 'school' ? d.school_name : d.target_type === 'project' ? d.project_name : 'General Fund'}</div>
                        <div className="text-xs text-muted-foreground">{new Date(d.created_date).toLocaleDateString('en-IN')}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-donation">₹{d.amount?.toLocaleString('en-IN')}</div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Success</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="villages">
            <div className="bg-white rounded-2xl border border-border p-8 text-center">
              <MapPin className="w-12 h-12 text-village/30 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">No Villages Followed Yet</h3>
              <p className="text-muted-foreground text-sm mb-4">Follow villages to get updates on their development progress.</p>
              <Link to="/my-villages"><Button variant="outline" className="border-village text-village">View My Villages</Button></Link>
            </div>
          </TabsContent>

          <TabsContent value="schools">
            <div className="bg-white rounded-2xl border border-border p-8 text-center">
              <School className="w-12 h-12 text-school/30 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">No Schools Followed Yet</h3>
              <p className="text-muted-foreground text-sm mb-4">Follow schools to track their improvement journey.</p>
              <Link to="/my-schools"><Button variant="outline" className="border-school text-school">View My Schools</Button></Link>
            </div>
          </TabsContent>

          <TabsContent value="volunteer">
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-lg">Volunteer Profile</h3>
                <Link to="/volunteer-profile"><Button size="sm" className="bg-volunteer text-white border-0">View Profile</Button></Link>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center bg-volunteer/5 rounded-xl p-4">
                  <div className="text-2xl font-bold text-volunteer">0</div>
                  <div className="text-xs text-muted-foreground">Projects Joined</div>
                </div>
                <div className="text-center bg-village/5 rounded-xl p-4">
                  <div className="text-2xl font-bold text-village">0</div>
                  <div className="text-xs text-muted-foreground">Hours Contributed</div>
                </div>
                <div className="text-center bg-donation/5 rounded-xl p-4">
                  <div className="text-2xl font-bold text-donation">0</div>
                  <div className="text-xs text-muted-foreground">Certificates</div>
                </div>
              </div>
              <div className="text-center py-8 border-t border-border">
                <Award className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Start volunteering to earn badges and certificates!</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="bg-white rounded-2xl border border-border p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">No Notifications</h3>
              <p className="text-muted-foreground text-sm">You're all caught up! Notifications will appear here.</p>
              <Link to="/notifications"><Button variant="outline" size="sm" className="mt-3">View All Notifications</Button></Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}