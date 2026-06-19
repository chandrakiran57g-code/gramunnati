import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/i18n/LanguageContext';

function ScrollMouseIcon() {
  return (
    <svg
      width="24"
      height="38"
      viewBox="0 0 24 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-white/75"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="22"
        height="36"
        rx="11"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect x="10.25" y="8" width="3.5" height="7" rx="1.75" fill="currentColor" />
    </svg>
  );
}

export default function HeroScrollHint() {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();

  const handleClick = () => {
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: 1,
        y: reducedMotion ? 0 : [0, -10, 0],
      }}
      transition={{
        opacity: { delay: 2.6, duration: 0.6 },
        y: reducedMotion
          ? { delay: 2.6, duration: 0.3 }
          : { delay: 2.6, duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
      }}
      className="mt-8 flex flex-col items-center gap-2.5 border-0 bg-transparent p-2 text-white/70 transition-colors hover:text-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      aria-label={t('home.scrollToExplore')}
    >
      <span className="font-body text-sm tracking-wide">{t('home.scrollToExplore')}</span>
      <ScrollMouseIcon />
    </motion.button>
  );
}
