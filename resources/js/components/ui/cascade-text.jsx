import React, { useEffect, useMemo, useState } from 'react';

export const TextReveal = React.memo(function TextReveal({
  text,
  as: Component = 'span',
  href,
  target,
  className = '',
  style,
  fontSize = 'inherit',
  staggerDelay = 25,
  duration = 450,
  easing = 'cubic-bezier(0.22, 1, 0.36, 1)',
  color = 'inherit',
  hoverColor = '#b2c73a',
  direction = 'up',
  onClick,
  animateOnMount = false,
  baseDelay = 0,
  splitBy = 'char',
  hoverEffect = true,
}) {
  const [hovered, setHovered] = useState(false);
  const [entered, setEntered] = useState(!animateOnMount);

  useEffect(() => {
    if (!animateOnMount) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEntered(true);
      return undefined;
    }
    const timer = window.setTimeout(() => setEntered(true), baseDelay);
    return () => window.clearTimeout(timer);
  }, [animateOnMount, baseDelay]);

  const segments = useMemo(() => {
    if (splitBy === 'word') {
      return text.split(/(\s+)/).filter(Boolean);
    }
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
      return Array.from(segmenter.segment(text), (s) => s.segment);
    }
    return [...text];
  }, [text, splitBy]);

  const sign = direction === 'up' ? 1 : -1;
  const isWordMode = splitBy === 'word';

  const rootProps = {
    className: `inline-block relative no-underline font-inherit tracking-normal ${isWordMode ? '' : 'overflow-hidden'} ${hoverEffect ? 'cursor-default' : ''} select-none ${className}`.trim(),
    style: {
      fontSize,
      color: hoverEffect && hovered ? hoverColor : color,
      transition: hoverEffect ? 'color 0.35s ease' : undefined,
      lineHeight: isWordMode ? 'var(--leading-relaxed)' : 'var(--leading-snug)',
      ...style,
    },
    onMouseEnter: hoverEffect ? () => setHovered(true) : undefined,
    onMouseLeave: hoverEffect ? () => setHovered(false) : undefined,
    onClick,
    'aria-label': text,
  };

  if (Component === 'a') {
    rootProps.href = href ?? '#';
    if (target) rootProps.target = target;
    if (target === '_blank') rootProps.rel = 'noopener noreferrer';
  }

  const getTransform = (index) => {
    if (animateOnMount && !entered) {
      return `translateY(${sign * (isWordMode ? 0.55 : 0.85)}em)`;
    }
    if (hoverEffect && hovered && entered) {
      return `translateY(${-sign}em)`;
    }
    return 'translateY(0)';
  };

  const getOpacity = () => {
    if (animateOnMount && !entered) return 0;
    return 1;
  };

  const getTransitionDelay = (index) => {
    if (animateOnMount) {
      return `${index * staggerDelay}ms`;
    }
    return `${index * staggerDelay}ms`;
  };

  const segmentWrapperClass = isWordMode
    ? 'inline-flex flex-wrap justify-center gap-x-[0.28em] gap-y-0.5'
    : 'inline-flex overflow-hidden relative';

  const segmentWrapperStyle = isWordMode ? undefined : { height: '1.15em' };

  return (
    <Component {...rootProps}>
      <span className={segmentWrapperClass} style={segmentWrapperStyle} aria-hidden="true">
        {segments.map((segment, i) => (
          <span
            key={`${segment}-${i}`}
            className={`inline-block relative will-change-transform ${isWordMode && /^\s+$/.test(segment) ? 'w-[0.25em]' : ''}`}
            style={
              isWordMode
                ? {
                    transition: `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`,
                    transitionDelay: getTransitionDelay(i),
                    transform: getTransform(i),
                    opacity: getOpacity(),
                    lineHeight: 'var(--leading-relaxed)',
                    verticalAlign: 'baseline',
                  }
                : {
                    textShadow: hoverEffect ? `0 ${sign}em currentColor` : undefined,
                    transition: `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`,
                    transitionDelay: getTransitionDelay(i),
                    transform: getTransform(i),
                    opacity: getOpacity(),
                    overflow: 'hidden',
                    height: '1.15em',
                  }
            }
          >
            {segment === ' ' ? '\u00A0' : segment}
          </span>
        ))}
      </span>
    </Component>
  );
});

TextReveal.displayName = 'TextReveal';
