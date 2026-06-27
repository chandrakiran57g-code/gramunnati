import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Activity, Clock, FolderOpen, MapPin, Award } from 'lucide-react';

export default function MyActivities() {
  const [volunteer, setVolunteer] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!u) { setLoading(false); return; }
      const [v, d] = await Promise.all([
        base44.entities.Volunteer.filter({ email: u.email }, '-created_date', 1).catch(() => []),
        base44.entities.Donation.filter({ email: u.email, payment_status: 'success' }, '-created_date', 20).catch(() => []),
      ]);
      setVolunteer(v.length > 0 ? v[0] : null);
      setDonations(d);
      setLoading(false);
    };
    load();
  }, []);

  // Merge activities
  const activities = [
    ...donations.map(d => ({ type: 'donation', date: d.created_date, data: d, title: `Donated ₹${d.amount?.toLocaleString('en-IN')} to ${d.village_name || d.school_name || d.project_name || 'General Fund'}`, icon: '💛' })),
  ];
  if (volunteer) {
    activities.push({ type: 'volunteer', date: volunteer.created_date, data: volunteer, title: 'Registered as a Volunteer', icon: '🌱' });
    if (volunteer.hours_contributed > 0) activities.push({ type: 'hours', date: volunteer.updated_date, data: volunteer, title: `${volunteer.hours_contributed} hours contributed`, icon: '⏱️' });
    if (volunteer.projects_joined > 0) activities.push({ type: 'project', date: volunteer.updated_date, data: volunteer, title: `Joined ${volunteer.projects_joined} projects`, icon: '📋' });
  }
  activities.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold mb-8">My Activities</h1>

          {activities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-16 text-center">
              <Activity className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <h2 className="font-heading text-xl font-bold mb-2">No Activities Yet</h2>
              <p className="text-muted-foreground mb-6">Your donations and volunteer activities will appear here.</p>
              <div className="flex justify-center gap-3">
                <Link to="/donate"><span className="donation-gradient text-white px-6 py-2.5 rounded-xl font-semibold text-sm">Donate Now</span></Link>
                <Link to="/volunteer"><span className="bg-volunteer text-white px-6 py-2.5 rounded-xl font-semibold text-sm">Volunteer</span></Link>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-primary/15" />
              <div className="space-y-5 pl-14">
                {activities.map((a, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="relative bg-white rounded-xl border border-border p-4">
                    <div className="absolute -left-8 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm border-2 border-white">
                      {a.icon}
                    </div>
                    <div className="font-medium text-sm">{a.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}