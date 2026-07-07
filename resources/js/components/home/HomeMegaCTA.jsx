import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Users, ArrowRight, BookOpen, HelpCircle } from 'lucide-react';
import { homeService } from '@/api/home';
import { VILLAGE_HERO_PHOTOS } from '@/lib/villageImages';
import SafeImage from '@/components/shared/SafeImage';
import { useLanguage } from '@/i18n/LanguageContext';

export default function HomeMegaCTA({ stats, loading }) {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[480px] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <SafeImage
          src={VILLAGE_HERO_PHOTOS[5].url}
          alt="Farmers in village fields"
          fallbackIndex={5}
          width={1920}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[#3D2914]/75" />
        <div className="absolute inset-0 home-mega-cta-gradient" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-amber-200/80 text-sm font-semibold tracking-wide mb-4 font-body">
            {loading
              ? '…'
              : `${(stats?.villages || 0).toLocaleString('en-IN')}+ ${t('home.statGaon')} · ${homeService.formatINR(stats?.totalAmount || 0)} ${t('home.ctaRaised')}`}
          </p>
          <h2
            className="font-heading font-bold text-amber-50 mb-5 text-balance"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', letterSpacing: '-0.03em' }}
          >
            One step today —
            <br />
            a transformed village tomorrow
          </h2>
          <p className="text-amber-100/70 text-lg max-w-xl mx-auto mb-10 font-body text-pretty">
            Donors and volunteers worldwide on one platform. Join us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Donate Now + Success Stories */}
            <div className="flex flex-col items-center gap-2">
              <Link
                to="/donate"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-[#E8C547] text-[#3D2914] font-bold text-base hover:bg-[#F5D76E] transition-colors shadow-lg shadow-black/20"
              >
                <Heart className="w-5 h-5" />
                Donate Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/stories"
                className="inline-flex items-center gap-1.5 text-amber-200/70 text-sm hover:text-amber-100 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Success Stories
              </Link>
            </div>

            {/* Become a Volunteer + FAQs */}
            <div className="flex flex-col items-center gap-2">
              <Link
                to="/volunteer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border-2 border-amber-200/40 text-amber-50 font-bold text-base hover:bg-amber-50/10 transition-colors"
              >
                <Users className="w-5 h-5" />
                Become a Volunteer
              </Link>
              <Link
                to="/faqs"
                className="inline-flex items-center gap-1.5 text-amber-200/70 text-sm hover:text-amber-100 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                FAQs
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
