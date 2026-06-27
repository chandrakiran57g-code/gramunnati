import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ROTATING_WORDS = [
  'Empowering',
  'Transforming',
  'Strengthening',
  'Building',
  'Nurturing',
  'Uplifting',
  'Advancing',
  'Inspiring',
  'Supporting',
  'Developing',
];

const WIDTH_ANCHOR = 'Strengthening';
const DISPLAY_MS = 2600;
const TRANSITION = { duration: 0.65, ease: [0.22, 1, 0.36, 1] };

export default function RotatingHeroWord({ className = '', color = '#ffffff' }) {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % ROTATING_WORDS.length);
    }, DISPLAY_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  if (reduceMotion) {
    return (
      <span className={className} style={{ color }}>
        {ROTATING_WORDS[0]}
      </span>
    );
  }

  const word = ROTATING_WORDS[index];

  return (
    <span
      className={`hero-rotating-word inline-grid place-items-center ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="invisible [grid-area:1/1] whitespace-nowrap select-none leading-none" aria-hidden="true">
        {WIDTH_ANCHOR}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={word}
          className="[grid-area:1/1] whitespace-nowrap leading-none"
          style={{ color }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={TRANSITION}
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
