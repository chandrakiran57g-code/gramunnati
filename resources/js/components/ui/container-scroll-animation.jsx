import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const SCROLL_HEIGHT = {
  home: 'h-[60rem] md:h-[80rem]',
  page: 'h-[36rem] md:h-[48rem]',
  detail: 'h-[32rem] md:h-[44rem]',
  compact: 'h-[22rem] md:h-[26rem]',
};

function HeroScrollSectionAnimated({ children, size = 'page', className = '' }) {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const reducedMotion = useReducedMotion();
  const isHome = size === 'home';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const rotate = useTransform(scrollYProgress, [0, 1], isHome ? [20, 0] : [12, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    isMobile
      ? isHome ? [0.92, 1] : [0.96, 1]
      : isHome ? [1.05, 1] : [1.02, 1]
  );
  const translate = useTransform(scrollYProgress, [0, 1], isHome ? [0, -100] : [0, -60]);

  if (reducedMotion) {
    return <div className={`page-hero-banner w-full ${className}`.trim()}>{children}</div>;
  }

  const panelClass = isHome
    ? 'hero-scroll-panel relative w-full min-h-[100svh] overflow-hidden will-change-transform'
    : 'hero-scroll-panel relative w-full overflow-hidden will-change-transform';

  return (
    <div
      ref={containerRef}
      className={`hero-scroll-track relative flex items-center justify-center ${SCROLL_HEIGHT[size]} ${className}`.trim()}
    >
      <div
        className={`hero-scroll-perspective w-full ${isHome ? 'sticky top-0 min-h-[100svh] flex items-center justify-center px-2 md:px-10 py-8 md:py-16' : 'px-2 md:px-6'}`}
        style={{ perspective: '1000px' }}
      >
        <motion.div
          style={{ rotateX: rotate, scale, translateY: translate }}
          className={panelClass}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Flat full-width page hero wrapper (About-style banner).
 * Pass `animated` only when 3D scroll motion is explicitly needed.
 */
export function HeroScrollSection({
  children,
  size = 'page',
  className = '',
  disabled = false,
  animated = false,
}) {
  if (disabled || !animated) {
    return (
      <div className={`page-hero-banner w-full ${className}`.trim()}>
        {children}
      </div>
    );
  }

  return (
    <HeroScrollSectionAnimated size={size} className={className}>
      {children}
    </HeroScrollSectionAnimated>
  );
}

export function ContainerScroll({ titleComponent, children }) {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({ target: containerRef });

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], isMobile ? [0.7, 0.9] : [1.05, 1]);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className="h-[52rem] md:h-[72rem] flex items-center justify-center relative p-2 md:p-12 lg:p-20"
      ref={containerRef}
    >
      <div className="py-6 md:py-24 w-full relative" style={{ perspective: '1000px' }}>
        <motion.div
          style={reducedMotion ? {} : { translateY: translate }}
          className="max-w-4xl mx-auto text-center px-4"
        >
          {titleComponent}
        </motion.div>
        <motion.div
          style={
            reducedMotion
              ? {}
              : {
                  rotateX: rotate,
                  scale,
                  boxShadow:
                    '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
                }
          }
          className="max-w-4xl -mt-8 md:-mt-12 mx-auto h-[18rem] sm:h-[24rem] md:h-[32rem] w-full border-4 border-white/20 p-2 md:p-4 bg-black/30 rounded-[24px] md:rounded-[30px] shadow-2xl backdrop-blur-sm"
        >
          <div className="h-full w-full overflow-hidden rounded-xl md:rounded-2xl bg-black/20">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
