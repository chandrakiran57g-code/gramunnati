import { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Users, Heart, CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SKILLS = ['Teaching', 'Agriculture', 'Engineering', 'Healthcare', 'IT', 'Environment', 'Construction', 'Social Work', 'Legal', 'Finance', 'Marketing', 'Photography'];
const STATES = ['Andhra Pradesh','Telangana','Karnataka','Tamil Nadu','Maharashtra','Gujarat','Rajasthan','Uttar Pradesh','Madhya Pradesh','West Bengal','Bihar','Odisha','Kerala','Punjab','Haryana','Delhi','Other'];

export default function Volunteer() {
  const [form, setForm] = useState({ full_name: '', email: '', mobile: '', state: '', district: '', skills: [], occupation: '', availability: 'flexible', experience: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.mobile || !form.state) return;
    setLoading(true);
    await base44.entities.Volunteer.create(form);
    setLoading(false);
    setSubmitted(true);
  };

  const benefits = [
    { icon: '🌱', title: 'Make Real Impact', desc: 'Your skills directly help rural communities and schools' },
    { icon: '🤝', title: 'Build Connections', desc: 'Network with thousands of like-minded change-makers' },
    { icon: '📜', title: 'Get Recognized', desc: 'Earn certificates and recognition for your contributions' },
    { icon: '🎯', title: 'Flexible Commitment', desc: 'Volunteer on your own schedule, weekends or weekdays' },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center bg-white rounded-3xl p-10 shadow-2xl border border-border">
          <div className="w-20 h-20 bg-volunteer/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-volunteer" />
          </div>
          <h2 className="font-heading text-3xl font-bold mb-3">Welcome, Volunteer! 🎉</h2>
          <p className="text-muted-foreground mb-6">Thank you for joining our mission. We'll match you with projects that fit your skills and availability.</p>
          <Button onClick={() => setSubmitted(false)} variant="outline" className="border-village text-village hover:bg-village hover:text-white">Register Another</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div style={{ background: 'linear-gradient(135deg, #22C55E, #16a34a)' }} className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Users className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Become a Volunteer</h1>
            <p className="text-white/80 max-w-xl mx-auto">Join thousands of volunteers transforming rural India. Your skills, time, and passion can change lives.</p>
          </motion.div>
        </div>
      </div>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {benefits.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center p-5 rounded-2xl border border-border hover:shadow-md transition-all">
                <div className="text-3xl mb-3">{b.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{b.title}</h3>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Badge Tiers + Leaderboard */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
            <h2 className="font-heading text-2xl font-bold mb-2">Volunteer Achievement Tiers</h2>
            <p className="text-muted-foreground text-sm">Earn badges and recognition as you contribute more hours</p>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-5 mb-12">
            {[
              { level: 'bronze', label: 'Bronze', hours: '10+ hours', icon: '🥉', desc: 'Active volunteer contributing regularly to one or more projects', color: 'border-amber-300 bg-amber-50' },
              { level: 'silver', label: 'Silver', hours: '50+ hours', icon: '🥈', desc: 'Dedicated volunteer leading projects and mentoring new volunteers', color: 'border-gray-300 bg-gray-50' },
              { level: 'gold', label: 'Gold', hours: '100+ hours', icon: '🥇', desc: 'Champion volunteer with extraordinary community impact', color: 'border-yellow-400 bg-yellow-50' },
            ].map(tier => (
              <motion.div key={tier.level} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className={`rounded-2xl border-2 ${tier.color} p-6 text-center`}>
                <div className="text-4xl mb-3">{tier.icon}</div>
                <h3 className="font-heading font-bold text-lg">{tier.label} Volunteer</h3>
                <div className="text-xs text-muted-foreground mt-1 mb-3">{tier.hours}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{tier.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-12 bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-2xl border border-border p-8 shadow-sm">
            <h2 className="font-heading text-2xl font-bold mb-6 text-center">Join as a Volunteer</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input id="full_name" value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))} placeholder="Your full name" className="mt-1 rounded-xl" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="your@email.com" className="mt-1 rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile *</Label>
                  <Input id="mobile" value={form.mobile} onChange={e => setForm(f => ({...f, mobile: e.target.value}))} placeholder="10-digit number" className="mt-1 rounded-xl" required />
                </div>
                <div>
                  <Label>State *</Label>
                  <Select value={form.state} onValueChange={v => setForm(f => ({...f, state: v}))}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Select State" /></SelectTrigger>
                    <SelectContent>{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="district">District</Label>
                  <Input id="district" value={form.district} onChange={e => setForm(f => ({...f, district: e.target.value}))} placeholder="Your district" className="mt-1 rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input id="occupation" value={form.occupation} onChange={e => setForm(f => ({...f, occupation: e.target.value}))} placeholder="Your profession" className="mt-1 rounded-xl" />
                </div>
                <div>
                  <Label>Availability</Label>
                  <Select value={form.availability} onValueChange={v => setForm(f => ({...f, availability: v}))}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekdays">Weekdays</SelectItem>
                      <SelectItem value="weekends">Weekends</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Skills (select all that apply)</Label>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map(skill => (
                    <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        form.skills.includes(skill)
                          ? 'bg-volunteer border-volunteer text-white'
                          : 'border-border text-muted-foreground hover:border-volunteer'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="experience">Experience / About You</Label>
                <Textarea id="experience" value={form.experience} onChange={e => setForm(f => ({...f, experience: e.target.value}))} placeholder="Share your background and why you want to volunteer..." className="mt-1 rounded-xl h-24" />
              </div>

              <Button type="submit" disabled={loading || !form.full_name || !form.mobile || !form.state} className="w-full py-3 rounded-xl font-semibold text-base text-white border-0" style={{ background: '#22C55E' }}>
                {loading ? 'Submitting...' : '🌱 Register as Volunteer'}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}