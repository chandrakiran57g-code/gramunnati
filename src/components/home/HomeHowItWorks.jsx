import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Heart, Users, ArrowRight } from 'lucide-react';
import SafeImage from '@/components/shared/SafeImage';
import { VILLAGE_HERO_PHOTOS } from '@/lib/villageImages';
import { useLanguage } from '@/i18n/LanguageContext';

export default function HomeHowItWorks() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Search,
      step: '01',
      title: t('home.stepDiscover'),
      desc: t('home.stepDiscoverDesc'),
      link: '/villages',
      label: t('home.explore'),
    },
    {
      icon: Heart,
      step: '02',
      title: t('home.stepSupport'),
      desc: t('home.stepSupportDesc'),
      link: '/donate',
      label: t('home.donate'),
    },
    {
      icon: Users,
      step: '03',
      title: t('home.stepTransform'),
      desc: t('home.stepTransformDesc'),
      link: '/volunteer',
      label: t('home.join'),
    },
  ];

  return (
    <section className="py-24 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 home-vision-bg pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="font-heading font-bold text-[#3D2914] mb-4 text-balance"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', letterSpacing: '-0.03em' }}
            >
              {t('home.howTitle1')}
              <br />
              {t('home.howTitle2')}
            </h2>
            <p className="text-[#5C4033]/75 text-lg leading-relaxed font-body max-w-md">
              {t('home.howSubtitle')}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-xl overflow-hidden aspect-[4/3] home-vision-image"
          >
            <SafeImage
              src={VILLAGE_HERO_PHOTOS[0].url}
              alt="Village fields at golden hour"
              fallbackIndex={0}
              width={800}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3D2914]/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-amber-50 font-heading text-xl font-bold italic">
                {t('home.visionQuote')}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="home-step-card group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="home-step-icon">
                  <s.icon className="w-5 h-5 text-[#8B6914]" />
                </div>
                <span className="text-4xl font-heading font-bold text-[#D4B896]/40 leading-none">{s.step}</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-[#3D2914] mb-2">{s.title}</h3>
              <p className="text-sm text-[#5C4033]/75 leading-relaxed mb-6 font-body flex-1">{s.desc}</p>
              <Link
                to={s.link}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8B6914] group-hover:gap-2.5 transition-all"
              >
                {s.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
