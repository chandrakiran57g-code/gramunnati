import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TreePine, School, Users, Heart } from 'lucide-react';
import { homeService } from '@/api/home';
import { useLanguage } from '@/i18n/LanguageContext';

const STAT_META = [
  { key: 'villages', labelKey: 'statGaon', icon: TreePine, color: 'text-[#8B6914]', bg: 'bg-[#8B6914]/10' },
  { key: 'schools', labelKey: 'statSchoolsShort', icon: School, color: 'text-[#6B5344]', bg: 'bg-[#6B5344]/10' },
  { key: 'donations', labelKey: 'statDonationsShort', icon: Heart, color: 'text-[#D4A017]', bg: 'bg-[#D4A017]/10' },
  { key: 'volunteers', labelKey: 'statVolunteersShort', icon: Users, color: 'text-[#6B8E23]', bg: 'bg-[#6B8E23]/10' },
];

function CountUp({ end, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !end) return;
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

export default function ImpactCounter({ stats, loading }) {
  const { t } = useLanguage();
  return (
    <section className="py-20 bg-[#FFF8E7] border-y border-[#D4B896]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2
            className="font-heading font-bold text-[#3D2914] mb-3"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.025em' }}
          >
            {t('home.impactTitle')}
          </h2>
          <p className="text-[#5C4033]/70 max-w-xl mx-auto font-body">
            {loading ? '…' : `${homeService.formatINR(stats?.totalAmount || 0)} ${t('home.impactSubtitle')}`}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_META.map((stat, i) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="text-center p-5 rounded-lg border border-[#D4B896]/50 bg-[#F5E6C8]/50 hover:shadow-md transition-all duration-300 group"
            >
              <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-bold ${stat.color} font-heading`}>
                {loading ? '…' : (
                  <>
                    <CountUp end={stats?.[stat.key] || 0} />
                    +
                  </>
                )}
              </div>
              <div className="text-xs text-[#5C4033]/65 mt-1 leading-tight font-body">{t(`home.${stat.labelKey}`)}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
