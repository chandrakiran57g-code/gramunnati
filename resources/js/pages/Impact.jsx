import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TreePine, School, Heart, Users, Droplets, Wheat, MapPin } from 'lucide-react';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

function CountUp({ end, suffix = '', prefix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStarted(true);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, end, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString('en-IN')}{suffix}</span>;
}

const metrics = [
  { label: 'Villages with Digital Profiles', value: 1200, suffix: '+', icon: TreePine, color: 'text-primary', bg: 'bg-primary/10', gradient: 'from-village/20 to-village/5' },
  { label: 'Schools Empowered', value: 450, suffix: '+', icon: School, color: 'text-school', bg: 'bg-school/10', gradient: 'from-school/20 to-school/5' },
  { label: 'Donations Raised (₹)', value: 25000000, prefix: '₹', suffix: '+', icon: Heart, color: 'text-donation', bg: 'bg-donation/10', gradient: 'from-donation/20 to-donation/5' },
  { label: 'Trees Planted', value: 50000, suffix: '+', icon: TreePine, color: 'text-green-600', bg: 'bg-green-100', gradient: 'from-green-100 to-green-50' },
  { label: 'Farmers Benefited', value: 8500, suffix: '+', icon: Wheat, color: 'text-yellow-600', bg: 'bg-yellow-100', gradient: 'from-yellow-100 to-yellow-50' },
  { label: 'Students Benefited', value: 150000, suffix: '+', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100', gradient: 'from-purple-100 to-purple-50' },
  { label: 'Volunteers Active', value: 5000, suffix: '+', icon: Users, color: 'text-volunteer', bg: 'bg-volunteer/10', gradient: 'from-volunteer/20 to-volunteer/5' },
  { label: 'Water Projects', value: 320, suffix: '+', icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-100', gradient: 'from-cyan-100 to-cyan-50' },
];

const stateStats = [
  { state: 'Andhra Pradesh', villages: 230, schools: 85, donations: '₹48L' },
  { state: 'Telangana', villages: 195, schools: 72, donations: '₹42L' },
  { state: 'Karnataka', villages: 165, schools: 60, donations: '₹35L' },
  { state: 'Tamil Nadu', villages: 142, schools: 55, donations: '₹31L' },
  { state: 'Maharashtra', villages: 128, schools: 48, donations: '₹28L' },
  { state: 'Gujarat', villages: 98, schools: 38, donations: '₹22L' },
  { state: 'Uttar Pradesh', villages: 87, schools: 34, donations: '₹19L' },
  { state: 'Rajasthan', villages: 76, schools: 29, donations: '₹17L' },
];

export default function Impact() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeroScrollSection size="page">
        <div style={{ background: 'linear-gradient(135deg, #0F766E, #2D6A4F)' }} className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Our Impact Dashboard</h1>
              <p className="text-white/80 max-w-2xl mx-auto">Real numbers. Real change. Track the measurable impact of GramUnnati's work across India.</p>
            </motion.div>
          </div>
        </div>
      </HeroScrollSection>

      {/* Key Metrics */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-3">National Statistics</h2>
            <p className="text-muted-foreground">Cumulative impact since platform launch</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {metrics.map((m, i) => (
              <motion.div key={m.label} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className={`bg-gradient-to-br ${m.gradient} rounded-2xl p-5 border border-border`}
              >
                <div className={`w-10 h-10 ${m.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <m.icon className={`w-5 h-5 ${m.color}`} />
                </div>
                <div className={`text-2xl font-bold ${m.color} font-heading`}>
                  <CountUp end={m.value} prefix={m.prefix || ''} suffix={m.suffix || ''} />
                </div>
                <div className="text-xs text-muted-foreground mt-1 leading-tight">{m.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* State-wise breakdown */}
      <section className="py-16 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="font-heading text-2xl font-bold">Impact by State</h2>
            </div>
            <p className="text-muted-foreground text-sm">Top states driving rural transformation through GramUnnati</p>
          </motion.div>

          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 bg-muted/50 px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
              <span>State</span>
              <span className="text-center">Villages</span>
              <span className="text-center">Schools</span>
              <span className="text-right">Donations</span>
            </div>
            {stateStats.map((s, i) => (
              <motion.div key={s.state} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="grid grid-cols-4 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors items-center"
              >
                <span className="font-medium text-sm">{s.state}</span>
                <span className="text-center text-primary font-semibold text-sm">{s.villages}</span>
                <span className="text-center text-school font-semibold text-sm">{s.schools}</span>
                <span className="text-right text-donation font-semibold text-sm">{s.donations}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-3">How We Measure Impact</h2>
          </motion.div>
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Identify Village Needs', desc: 'Village reps assess local infrastructure and development needs', color: 'bg-primary' },
              { step: '2', title: 'Secure Funding', desc: 'Donors and CSR partners fund specific projects and requirements', color: 'bg-school' },
              { step: '3', title: 'Build & Operate', desc: 'Community and contractors implement approved projects', color: 'bg-projects' },
              { step: '4', title: 'Measure Success', desc: 'Track progress, beneficiaries, and long-term community impact', color: 'bg-donation' },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3`}>{item.step}</div>
                <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}