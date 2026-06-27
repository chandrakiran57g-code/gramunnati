import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildHeroSlides, CATEGORY_LABELS } from '@/lib/villageImages';
import SafeImage from '@/components/shared/SafeImage';

const SLIDE_MS = 5000;

export default function VillagePhotoHero({ className = '', photos }) {
  const slides = useMemo(() => buildHeroSlides(photos), [photos]);

  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const [failedUrls, setFailedUrls] = useState(() => new Set());

  const activeSlides = useMemo(
    () => slides.filter((s) => !failedUrls.has(s.url)),
    [slides, failedUrls],
  );

  const safeSlides = activeSlides.length > 0 ? activeSlides : slides;

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % safeSlides.length);
  }, [safeSlides.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + safeSlides.length) % safeSlides.length);
  }, [safeSlides.length]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (index >= safeSlides.length) setIndex(0);
  }, [index, safeSlides.length]);

  useEffect(() => {
    if (reducedMotion || paused || safeSlides.length < 2) return;
    const timer = setInterval(goNext, SLIDE_MS);
    return () => clearInterval(timer);
  }, [reducedMotion, paused, safeSlides.length, goNext]);

  const current = safeSlides[index] || safeSlides[0];
  if (!current) return null;

  const categoryLabel = CATEGORY_LABELS[current.category] || 'Gaon';

  const handleImageError = () => {
    setFailedUrls((prev) => {
      const next = new Set(prev);
      next.add(current.url);
      return next;
    });
    if (safeSlides.length > 1) goNext();
  };

  return (
    <div
      className={`${className} absolute inset-0 overflow-hidden bg-[#3D2914]`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        key={current.url}
        initial={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute inset-0"
      >
        <SafeImage
          src={current.url}
          alt={current.alt}
          fallbackIndex={index}
          width={1920}
          onError={handleImageError}
          className="absolute inset-0 w-full h-full object-cover object-center home-hero-kenburns"
          loading={index === 0 ? 'eager' : 'lazy'}
          style={
            reducedMotion
              ? undefined
              : { animation: `home-kenburns ${SLIDE_MS}ms linear forwards` }
          }
        />
      </motion.div>

      <div className="absolute inset-0 bg-amber-900/10 mix-blend-multiply pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#3D2914]/85 via-[#3D2914]/20 to-[#3D2914]/5 pointer-events-none" />

      <div className="absolute top-28 left-4 sm:left-8 z-[2]">
        <span className="home-hero-category-badge">{categoryLabel}</span>
      </div>

      <div className="absolute bottom-28 right-4 sm:right-8 z-[2] hidden sm:block max-w-sm text-right">
        <p className="text-sm text-amber-50/90 italic font-body leading-snug">{current.caption}</p>
        <p className="text-[10px] text-amber-100/45 mt-1 font-body">
          {index + 1} / {safeSlides.length}
          {paused && ' · paused'}
        </p>
      </div>

      {safeSlides.length > 1 && (
        <>
          <button type="button" aria-label="Previous village photo" onClick={goPrev} className="home-hero-nav home-hero-nav-prev">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button type="button" aria-label="Next village photo" onClick={goNext} className="home-hero-nav home-hero-nav-next">
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-[2] flex items-center gap-2">
        {safeSlides.map((slide, i) => (
          <button
            key={slide.url + i}
            type="button"
            aria-label={`Show ${slide.category || 'village'} photo ${i + 1}`}
            aria-current={i === index ? 'true' : undefined}
            onClick={() => setIndex(i)}
            className={`home-hero-dot ${i === index ? 'home-hero-dot-active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
