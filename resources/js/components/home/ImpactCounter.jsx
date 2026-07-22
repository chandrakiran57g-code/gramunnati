import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { TreePine, School, Users, Heart, BookOpen, HelpCircle } from 'lucide-react';
import { homeService } from '@/api/home';
import { useLanguage } from '@/i18n/LanguageContext';
import { VILLAGE_HERO_PHOTOS } from '@/lib/villageImages';
import SafeImage from '@/components/shared/SafeImage';

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
    <section className="py-12 sm:py-16 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h2
            className="font-heading font-bold text-gray-900 mb-3"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.025em' }}
          >
            {t('home.impactTitle')}
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto font-body">
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
              className="text-center p-5 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-bold ${stat.color} font-heading`}>
                {loading ? '…' : (
                  (stats?.[stat.key] || 0) > 0 ? (
                    <>
                      <CountUp end={stats[stat.key]} />
                      +
                    </>
                  ) : (
                    '0'
                  )
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1 leading-tight font-body">{t(`home.${stat.labelKey}`)}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mt-10 overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0">
            <SafeImage
              src={VILLAGE_HERO_PHOTOS[5].url}
              alt="Farmers in village fields"
              fallbackIndex={5}
              width={1920}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-blue-800/80 to-indigo-900/90" />
          </div>

          <div className="relative z-10 w-full px-4 sm:px-6 py-10 text-center">
            <h2
              className="font-heading font-bold text-white mb-5 whitespace-nowrap"
              style={{ fontSize: 'clamp(1.1rem, 5.5vw, 2.5rem)', letterSpacing: '-0.02em' }}
            >
              Today&apos;s step &mdash; Tomorrow&apos;s village
            </h2>
            <div className="flex flex-wrap gap-2.5 justify-center">
              <Link
                to="/donate"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#E8C547] text-[#1e3a5f] font-semibold text-sm hover:bg-[#F5D76E] transition-colors shadow-md shadow-black/20"
              >
                <Heart className="w-4 h-4" />
                Donate Now
              </Link>
              <Link
                to="/volunteer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                <Users className="w-4 h-4" />
                Become a Volunteer
              </Link>
              <Link
                to="/stories"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Success Stories
              </Link>
              <Link
                to="/faqs"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                FAQs
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
