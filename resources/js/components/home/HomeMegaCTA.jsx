import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Users, BookOpen, HelpCircle } from 'lucide-react';
import { VILLAGE_HERO_PHOTOS } from '@/lib/villageImages';
import SafeImage from '@/components/shared/SafeImage';

export default function HomeMegaCTA() {
  return (
    <section className="relative min-h-[220px] flex items-center overflow-hidden">
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

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="font-heading font-bold text-white mb-5 whitespace-nowrap"
            style={{ fontSize: 'clamp(1.1rem, 5.5vw, 2.75rem)', letterSpacing: '-0.02em' }}
          >
            Today&apos;s step. Tomorrow&apos;s village
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
        </motion.div>
      </div>
    </section>
  );
}
