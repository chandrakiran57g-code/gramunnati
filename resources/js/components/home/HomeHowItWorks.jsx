import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Heart, Users, ArrowRight } from 'lucide-react';
import VisionVideo from '@/components/home/VisionVideo';
import { useLanguage } from '@/i18n/LanguageContext';

export default function HomeHowItWorks() {
  const { t } = useLanguage();
  const navigate = useNavigate();

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
    <section className="py-12 sm:py-16 relative overflow-hidden">
      <div className="absolute inset-0 home-vision-bg pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center mb-8">
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
            className="relative rounded-xl overflow-hidden aspect-[4/3] home-vision-image bg-[#2d4a3e]"
          >
            <VisionVideo className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3D2914]/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
              <p className="text-amber-50 font-heading text-xl font-bold italic drop-shadow-md">
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
              onClick={() => navigate(s.link)}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate(s.link); }}
              className="home-step-card group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="home-step-icon shrink-0">
                    <s.icon className="w-5 h-5 text-[#8B6914]" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-[#3D2914]">{s.title}</h3>
                </div>
                <span className="text-4xl font-heading font-bold text-[#D4B896]/40 leading-none shrink-0">{s.step}</span>
              </div>
              <p className="text-sm text-[#5C4033]/75 leading-relaxed mb-6 font-body flex-1">{s.desc}</p>
              <Link
                to={s.link}
                onClick={(e) => e.stopPropagation()}
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
