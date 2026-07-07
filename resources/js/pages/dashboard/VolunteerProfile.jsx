import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Award, Clock, FolderOpen, MapPin, Download, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { safeText } from '@/lib/safeText';

const ACHIEVEMENTS = [
  { tier: 'bronze', label: 'Bronze Volunteer', icon: '🥉', hours: 10, color: 'from-amber-600 to-amber-700', textColor: 'text-amber-600', bg: 'bg-amber-50' },
  { tier: 'silver', label: 'Silver Volunteer', icon: '🥈', hours: 50, color: 'from-gray-400 to-gray-500', textColor: 'text-brown-400', bg: 'bg-gray-50' },
  { tier: 'gold', label: 'Gold Volunteer', icon: '🥇', hours: 100, color: 'from-yellow-500 to-amber-500', textColor: 'text-yellow-600', bg: 'bg-yellow-50' },
  { tier: 'platinum', label: 'Platinum Volunteer', icon: '💎', hours: 250, color: 'from-cyan-500 to-blue-500', textColor: 'text-cyan-600', bg: 'bg-cyan-50' },
];

export default function VolunteerProfile() {
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!u) { setLoading(false); return; }
      const v = await base44.entities.Volunteer.filter({ email: u.email }, '-created_date', 1).catch(() => []);
      setVolunteer(v.length > 0 ? v[0] : null);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-volunteer/30 border-t-volunteer rounded-full animate-spin" />
    </div>
  );

  if (!volunteer) return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <div className="text-6xl mb-4">🌱</div>
        <h1 className="font-heading text-3xl font-bold mb-3">Not a Volunteer Yet</h1>
        <p className="text-muted-foreground mb-6">Join as a volunteer to track your impact and earn achievements.</p>
        <Link to="/volunteer"><Button className="bg-volunteer text-white border-0 text-lg px-8">Join as Volunteer</Button></Link>
      </div>
    </div>
  );

  const hours = volunteer.hours_contributed || 0;
  const projects = volunteer.projects_joined || 0;
  const currentAchievement = [...ACHIEVEMENTS].reverse().find(a => hours >= a.hours);
  const nextAchievement = ACHIEVEMENTS.find(a => hours < a.hours);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-border p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 bg-volunteer/10 rounded-2xl flex items-center justify-center text-3xl font-bold text-volunteer">
                {volunteer.full_name?.charAt(0) || 'V'}
              </div>
              <div className="flex-grow">
                <h1 className="font-heading text-2xl font-bold">{volunteer.full_name}</h1>
                <p className="text-muted-foreground text-sm">{safeText(volunteer.state)}, {safeText(volunteer.district)}</p>
                {currentAchievement && (
                  <span className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full ${currentAchievement.bg} ${currentAchievement.textColor}`}>
                    {currentAchievement.icon} {currentAchievement.label}
                  </span>
                )}
              </div>
              <Link to="/volunteer"><Button variant="outline" className="border-volunteer text-volunteer">Update Profile</Button></Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Hours Contributed', value: hours, icon: Clock, color: 'text-volunteer', bg: 'bg-volunteer/5' },
              { label: 'Projects Joined', value: projects, icon: FolderOpen, color: 'text-projects', bg: 'bg-projects/5' },
              { label: 'Certificate', value: currentAchievement?.label || '—', icon: Award, color: 'text-donation', bg: 'bg-donation/5' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl border border-border p-4 text-center">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Achievement Tiers */}
          <div className="bg-white rounded-2xl border border-border p-6 mb-6">
            <h2 className="font-heading font-bold text-lg mb-4">Achievement Tiers</h2>
            <div className="space-y-4">
              {ACHIEVEMENTS.map(ach => {
                const achieved = hours >= ach.hours;
                return (
                  <div key={ach.tier} className={`p-4 rounded-xl border ${achieved ? 'bg-green-50 border-green-200' : 'bg-muted/30 border-border'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{ach.icon}</span>
                        <span className={`font-semibold ${achieved ? ach.textColor : 'text-muted-foreground'}`}>{ach.label}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{ach.hours}+ hours</span>
                    </div>
                    <Progress value={Math.min(100, (hours / ach.hours) * 100)} className={`h-1.5 ${achieved ? '[&>div]:bg-green-500' : ''}`} />
                    {achieved && <div className="text-xs text-green-600 mt-1">✓ Achieved!</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certificate Download */}
          {currentAchievement && (
            <div className="bg-white rounded-2xl border border-border p-6 text-center">
              <Award className="w-12 h-12 text-donation/40 mx-auto mb-3" />
              <h3 className="font-heading font-bold text-lg mb-2">Download Certificate</h3>
              <p className="text-muted-foreground text-sm mb-4">Congratulations! You've achieved {currentAchievement.label} status.</p>
              <Button className="bg-donation text-white border-0" onClick={() => {
                const content = `CMSR Volunteer Certificate\n\n${volunteer.full_name}\n${currentAchievement.label}\nHours: ${hours} | Projects: ${projects}\n\nThank you for your service!`;
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `Volunteer-Certificate-${currentAchievement.tier}.txt`; a.click();
                URL.revokeObjectURL(url);
              }}>
                <Download className="w-4 h-4 mr-2" /> Download Certificate
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}