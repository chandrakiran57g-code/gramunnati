import { useEffect } from 'react';
import { rememberHomeExitAnchor } from '@/lib/homeSectionAnchors';

export default function HomeExitTracker() {
  useEffect(() => {
    const handleClick = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      if (href === '/' || href.startsWith('/#') || href.startsWith('#')) return;

      const section = link.closest('[data-home-section]');
      if (!section) return;

      const anchorId = section.getAttribute('data-home-section');
      if (anchorId) rememberHomeExitAnchor(anchorId);
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return null;
}
