import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TreePine, School, FolderOpen, Users, Heart, Leaf } from 'lucide-react';

const stats = [
  { label: 'Villages Registered', value: 1200, suffix: '+', icon: TreePine, color: 'text-village', bg: 'bg-village/10' },
  { label: 'Schools Empowered', value: 450, suffix: '+', icon: School, color: 'text-school', bg: 'bg-school/10' },
  { label: 'Active Projects', value: 320, suffix: '+', icon: FolderOpen, color: 'text-projects', bg: 'bg-projects/10' },
  { label: 'Volunteers', value: 5000, suffix: '+', icon: Users, color: 'text-volunteer', bg: 'bg-volunteer/10' },
  { label: 'Donors', value: 2800, suffix: '+', icon: Heart, color: 'text-donation', bg: 'bg-donation/10' },
  { label: 'Beneficiaries', value: 150000, suffix: '+', icon: Leaf, color: 'text-village', bg: 'bg-village/10' },
];

function CountUp({ end, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, end, duration]);

  return <span ref={ref}>{count.toLocaleString('en-IN')}</span>;
}

export default function ImpactCounter() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-xs font-semibold tracking-widest text-village uppercase mb-3 block">Our Reach</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Our Impact in Numbers
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Together we're creating measurable change across rural India — one village, one school, one project at a time.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center p-5 rounded-2xl border border-border hover:shadow-md transition-all duration-300 group"
            >
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-bold ${stat.color} font-heading`}>
                <CountUp end={stat.value} />
                {stat.suffix}
              </div>
              <div className="text-xs text-muted-foreground mt-1 leading-tight">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}