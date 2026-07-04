import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TreePine, School, Heart, Users, Droplets, Wheat, MapPin } from 'lucide-react';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { apiFetch } from '@/api/apiClient';

function formatINRShort(amount) {
  const n = Number(amount) || 0;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

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

const METRIC_META = [
  { key: 'villages', label: 'Villages with Digital Profiles', suffix: '+', icon: TreePine, color: 'text-primary', bg: 'bg-primary/10', gradient: 'from-village/20 to-village/5' },
  { key: 'schools', label: 'Schools Empowered', suffix: '+', icon: School, color: 'text-school', bg: 'bg-school/10', gradient: 'from-school/20 to-school/5' },
  { key: 'donations_total', label: 'Donations Raised (₹)', prefix: '₹', suffix: '+', icon: Heart, color: 'text-donation', bg: 'bg-donation/10', gradient: 'from-donation/20 to-donation/5' },
  { key: 'trees_planted', label: 'Trees Planted', suffix: '+', icon: TreePine, color: 'text-green-600', bg: 'bg-green-100', gradient: 'from-green-100 to-green-50' },
  { key: 'farmers_benefited', label: 'Farmers Benefited', suffix: '+', icon: Wheat, color: 'text-yellow-600', bg: 'bg-yellow-100', gradient: 'from-yellow-100 to-yellow-50' },
  { key: 'students_benefited', label: 'Students Benefited', suffix: '+', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100', gradient: 'from-purple-100 to-purple-50' },
  { key: 'volunteers', label: 'Volunteers Active', suffix: '+', icon: Users, color: 'text-volunteer', bg: 'bg-volunteer/10', gradient: 'from-volunteer/20 to-volunteer/5' },
  { key: 'water_projects', label: 'Water Projects', suffix: '+', icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-100', gradient: 'from-cyan-100 to-cyan-50' },
];

export default function Impact() {
  const [metrics, setMetrics] = useState({});
  const [stateStats, setStateStats] = useState([]);

  useEffect(() => {
    apiFetch('/home/impact')
      .then((res) => {
        setMetrics(res?.metrics || {});
        setStateStats(Array.isArray(res?.stateStats) ? res.stateStats : []);
      })
      .catch(() => {
        setMetrics({});
        setStateStats([]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeroScrollSection size="page">
        <div style={{ background: 'linear-gradient(135deg, #0F766E, #2D6A4F)' }} className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Our Impact Dashboard</h1>
              <p className="text-white/80 max-w-2xl mx-auto">Real numbers. Real change. Track the measurable impact of CMSR's work across India.</p>
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
            {METRIC_META.map((m, i) => {
              const value = Number(metrics[m.key]) || 0;
              return (
              <motion.div key={m.label} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className={`bg-gradient-to-br ${m.gradient} rounded-2xl p-5 border border-border`}
              >
                <div className={`w-10 h-10 ${m.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <m.icon className={`w-5 h-5 ${m.color}`} />
                </div>
                <div className={`text-2xl font-bold ${m.color} font-heading`}>
                  {value > 0 ? (
                    <CountUp end={value} prefix={m.prefix || ''} suffix={m.suffix || ''} />
                  ) : (
                    <span>{m.prefix || ''}0</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1 leading-tight">{m.label}</div>
              </motion.div>
              );
            })}
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
            <p className="text-muted-foreground text-sm">Top states driving rural transformation through CMSR</p>
          </motion.div>

          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 bg-muted/50 px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
              <span>State</span>
              <span className="text-center">Villages</span>
              <span className="text-center">Schools</span>
              <span className="text-right">Donations</span>
            </div>
            {stateStats.length === 0 && (
              <div className="px-5 py-10 text-center text-muted-foreground text-sm">No state data yet.</div>
            )}
            {stateStats.map((s, i) => (
              <motion.div key={s.state} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="grid grid-cols-4 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors items-center"
              >
                <span className="font-medium text-sm">{s.state}</span>
                <span className="text-center text-primary font-semibold text-sm">{s.villages}</span>
                <span className="text-center text-school font-semibold text-sm">{s.schools}</span>
                <span className="text-right text-donation font-semibold text-sm">{formatINRShort(s.donations)}</span>
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