import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Layers } from 'lucide-react';
import { activeWorkService } from '@/api/activeWork';
import { ActiveWorkCard } from '@/components/home/HomeActiveWorks';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { PROGRAMS } from '@/lib/programs';
import { usePlatformRefresh } from '@/hooks/usePlatformRefresh';

function categoryTitle(category, t) {
  if (!category) return 'Active Works';
  if (category.slug === 'active-villages' || category.entity_type === 'village') {
    return t('home.activeVillages');
  }
  if (category.slug === 'active-schools' || category.entity_type === 'school') {
    return t('home.activeSchools');
  }
  if (category.entity_type === 'custom') {
    return category.icon ? `${category.icon} ${category.name}` : category.name;
  }
  const slug = category.program_slug || category.template_type;
  const prog = PROGRAMS.find((p) => p.slug === slug);
  if (prog) return `${prog.icon} ${prog.title}`;
  return category.name;
}

export default function ActiveWorksCategory() {
  const { slug } = useParams();
  const { t } = useLanguage();
  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(({ soft = false } = {}) => {
    if (!soft) setLoading(true);
    activeWorkService.getCategoryItems(slug, { bustCache: soft })
      .then(({ category: cat, items: rows }) => {
        setCategory(cat);
        setItems(rows);
      })
      .catch(() => {
        if (!soft) {
          setCategory(null);
          setItems([]);
        }
      })
      .finally(() => { if (!soft) setLoading(false); });
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  usePlatformRefresh(() => load({ soft: true }));

  const title = categoryTitle(category, t);
  const showSkeleton = loading && items.length === 0;

  return (
    <div className="min-h-screen bg-cream-50">
      <HeroScrollSection size="page">
        <div className="brand-gradient py-16 px-4">
          <div className="max-w-7xl mx-auto text-white">
            <Link to="/" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4">
              <ArrowLeft className="w-4 h-4" /> {t('nav.home') || 'Home'}
            </Link>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-2 text-white/70 text-sm">
                <Layers className="w-4 h-4" /> {t('home.featuredTitle')}
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-3">{title}</h1>
              {category?.description && (
                <p className="text-white/80 max-w-2xl">{category.description}</p>
              )}
            </motion.div>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {showSkeleton ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="min-h-[380px] rounded-2xl bg-[#E8DFD0] animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D4B896] bg-white py-16 text-center">
            <p className="text-[#5C4033]/70">{t('home.emptyActiveWorks')}</p>
            <Link to="/" className="mt-4 inline-block">
              <Button variant="outline">{t('nav.home') || 'Back to home'}</Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-[#5C4033]/70">
              {items.length} {items.length === 1 ? 'card' : 'cards'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item, i) => (
                <ActiveWorkCard key={item.id || item.slug} item={item} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
