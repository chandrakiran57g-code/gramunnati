import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import CMSRLeaf from '@/components/splash/CmsrLeaf';
import { BRAND_COLORS, BRAND_LOGO_URL, BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand';

export const HOLD_AFTER_REVEAL_MS = 800;
export const SPLASH_DURATION_MS = 4200;
const EASE = [0.645, 0.045, 0.355, 1]; // easeInOutCubic
const TAGLINE_AT = 2500;
const TAGLINE_FADE_MS = 450;
const EXIT_FADE_MS = 450;

/** Three leaves — start off-screen, end in pinwheel logo formation */
const LEAVES = [
  {
    id: 'leaf-a',
    gradientId: 'splash-leaf-a',
    start: { x: '-110%', y: '-120%', rotate: -55, scale: 1.25, opacity: 0 },
    end: { x: '0%', y: '-6%', rotate: -30, scale: 1, opacity: 1 },
  },
  {
    id: 'leaf-b',
    gradientId: 'splash-leaf-b',
    start: { x: '115%', y: '-15%', rotate: 65, scale: 1.2, opacity: 0 },
    end: { x: '8%', y: '10%', rotate: 90, scale: 1, opacity: 1 },
  },
  {
    id: 'leaf-c',
    gradientId: 'splash-leaf-c',
    start: { x: '-20%', y: '125%', rotate: 145, scale: 1.22, opacity: 0 },
    end: { x: '-6%', y: '12%', rotate: 210, scale: 1, opacity: 1 },
  },
];

export default function SplashScreen({ onComplete }) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState(reduceMotion ? 'exit' : 'enter');

  const timeline = useMemo(
    () => ({
      merge: 450,
      form: 1100,
      settle: 1500,
      light: 1650,
      title: 2100,
      tagline: TAGLINE_AT,
      hold: TAGLINE_AT + TAGLINE_FADE_MS,
      exit: TAGLINE_AT + TAGLINE_FADE_MS + HOLD_AFTER_REVEAL_MS,
      complete: TAGLINE_AT + TAGLINE_FADE_MS + HOLD_AFTER_REVEAL_MS + EXIT_FADE_MS,
    }),
    []
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      const id = window.setTimeout(() => onComplete?.(), 350);
      return () => window.clearTimeout(id);
    }

    const timers = [
      window.setTimeout(() => setPhase('merge'), timeline.merge),
      window.setTimeout(() => setPhase('form'), timeline.form),
      window.setTimeout(() => setPhase('settle'), timeline.settle),
      window.setTimeout(() => setPhase('light'), timeline.light),
      window.setTimeout(() => setPhase('title'), timeline.title),
      window.setTimeout(() => setPhase('tagline'), timeline.tagline),
      window.setTimeout(() => setPhase('hold'), timeline.hold),
      window.setTimeout(() => setPhase('exit'), timeline.exit),
      window.setTimeout(() => onComplete?.(), timeline.complete),
    ];

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [onComplete, reduceMotion, timeline]);

  const showLeaves = ['enter', 'merge', 'form'].includes(phase);
  const showLogoImage = ['settle', 'light', 'title', 'tagline', 'hold'].includes(phase);
  const isLightBg = !['enter', 'merge', 'form', 'exit'].includes(phase);
  const showPeachRing = ['settle', 'light', 'title', 'tagline', 'hold'].includes(phase);
  const showTitle = ['title', 'tagline', 'hold'].includes(phase);
  const showTagline = ['tagline', 'hold'].includes(phase);
  const isExiting = phase === 'exit';

  return (
    <motion.div
      className="splash-screen fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: EXIT_FADE_MS / 1000, ease: EASE }}
      role="dialog"
      aria-label="CMSR brand introduction"
    >
      {/* Step 1–3: deep green intro */}
      <motion.div
        className="splash-bg-dark absolute inset-0"
        animate={{ opacity: isLightBg || isExiting ? 0 : 1 }}
        transition={{ duration: 0.7, ease: EASE }}
      />

      {/* Step 4+: light background */}
      <motion.div
        className="splash-bg-light absolute inset-0"
        animate={{ opacity: isLightBg && !isExiting ? 1 : 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-7 px-6"
        animate={{ y: showTitle ? -20 : 0 }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        {/* Logo stage */}
        <div className="relative flex h-[min(168px,38vw)] w-[min(168px,38vw)] items-center justify-center">
          {/* Soft glow on settle */}
          <motion.div
            className="splash-logo-glow pointer-events-none absolute inset-0 m-auto rounded-full"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: showLogoImage ? 0.55 : phase === 'form' ? 0.35 : 0,
              scale: phase === 'settle' ? 1.15 : showLogoImage ? 1 : 0.6,
            }}
            transition={{ duration: 0.65, ease: EASE }}
            aria-hidden="true"
          />

          {/* Peach accent ring */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-full border-2"
            style={{ borderColor: BRAND_COLORS.peach }}
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{
              opacity: showPeachRing ? 1 : 0,
              scale: showPeachRing ? 1 : 0.82,
            }}
            transition={{ duration: 0.55, ease: EASE }}
            aria-hidden="true"
          />

          {/* Animated SVG leaves */}
          {LEAVES.map((leaf, i) => (
            <motion.div
              key={leaf.id}
              className="pointer-events-none absolute h-[min(100px,22vw)] w-[min(68px,15vw)] origin-bottom"
              style={{ left: '50%', top: '50%', marginLeft: '-34px', marginTop: '-90px' }}
              initial={leaf.start}
              animate={
                !showLeaves
                  ? { opacity: 0, scale: 0.85 }
                  : phase === 'enter'
                    ? { ...leaf.start, opacity: 1 }
                    : { ...leaf.end, opacity: phase === 'form' ? 0.9 : 1 }
              }
              transition={{
                duration: phase === 'enter' ? 0.55 : 0.95,
                delay: i * 0.05,
                ease: EASE,
              }}
            >
              <CMSRLeaf gradientId={leaf.gradientId} className="h-full w-full drop-shadow-md" />
            </motion.div>
          ))}

          {/* Your logo — reveals after leaves converge */}
          <motion.img
            src={BRAND_LOGO_URL}
            alt={BRAND_NAME}
            className="pointer-events-none absolute h-[72%] w-[72%] rounded-full object-contain"
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{
              opacity: showLogoImage ? 1 : 0,
              scale: phase === 'settle' ? 1.06 : showLogoImage ? 1 : 0.86,
            }}
            transition={{ duration: 0.55, ease: EASE }}
          />
        </div>

        {/* Brand reveal text */}
        <div className="splash-text-stack flex min-h-[4.5rem] flex-col items-center gap-3 text-center">
          <motion.h1
            className="splash-brand-name font-heading font-bold"
            style={{ color: BRAND_COLORS.text }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: showTitle ? 1 : 0, y: showTitle ? 0 : 14 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {BRAND_NAME}
          </motion.h1>

          <motion.p
            className="splash-tagline font-body font-medium"
            style={{ color: `${BRAND_COLORS.text}e6` }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: showTagline ? 1 : 0, y: showTagline ? 0 : 10 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {BRAND_TAGLINE}
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}
