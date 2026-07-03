import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart } from 'lucide-react';
import { needsSupportService } from '@/api/needsSupport';
import { homeService } from '@/api/home';
import SafeImage from '@/components/shared/SafeImage';
import { resolveImageUrl } from '@/lib/villageImages';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { localize } from '@/lib/localizedContent';
import { usePlatformRefresh } from '@/hooks/usePlatformRefresh';

function NeedSupportCard({ project, index = 0 }) {
  const { t, lang } = useLanguage();
  const name = localize(project, 'project_name', lang) || localize(project, 'title', lang) || localize(project, 'name', lang);
  const description = localize(project, 'short_description', lang) || localize(project, 'description', lang);
  const image = resolveImageUrl(project.cover_image || project.featured_image, index, 600);
  const target = Number(project.target || 0);
  const raised = Number(project.raised || 0);
  const progress = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
  const village = project.villages?.village_name;
  const donateHref = project.slug
    ? `/donate?project_slug=${encodeURIComponent(project.slug)}`
    : `/donate?project_id=${project.id}`;

  return (
    <motion.article
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="home-feature-card flex flex-col h-full min-h-[320px] bg-[#FFF8E7] rounded-2xl border border-[#D4B896] overflow-hidden"
    >
      <div className="relative h-40 overflow-hidden">
        <SafeImage src={image} alt={name} fallbackIndex={index} width={480} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3D2914]/90 to-transparent" />
        <span className="absolute top-2 left-2 home-urgent-badge text-[10px] px-2 py-0.5">{t('home.needsSupport')}</span>
        <div className="absolute bottom-2 left-2 right-2">
          <h3 className="font-heading font-bold text-amber-50 text-base leading-tight line-clamp-2">{name}</h3>
          {village && <p className="text-amber-100/60 text-xs mt-0.5 truncate">{village}</p>}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        {description && (
          <p className="text-sm text-[#5C4033]/75 line-clamp-2 mb-3 flex-1">{description}</p>
        )}
        <div className="flex justify-between text-xs text-[#5C4033]/70 mb-1.5 gap-1">
          <span className="truncate">{t('home.raised')} {homeService.formatINR(raised)}</span>
          {target > 0 && (
            <span className="truncate shrink-0">{t('home.goal')} {homeService.formatINR(target)}</span>
          )}
        </div>
        <div className="home-progress-bar mb-4">
          <div className="home-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <Link
          to={donateHref}
          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg bg-[#8B6914] text-amber-50 text-sm font-semibold hover:bg-[#6B5344] transition-colors mt-auto"
        >
          <Heart className="w-4 h-4" />
          {t('home.supportNow')}
        </Link>
      </div>
    </motion.article>
  );
}

export default function NeedSupport() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(({ soft = false } = {}) => {
    if (!soft) setLoading(true);
    needsSupportService.getHomepageItems(null)
      .then(setProjects)
      .catch(() => { if (!soft) setProjects([]); })
      .finally(() => { if (!soft) setLoading(false); });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePlatformRefresh(() => load({ soft: true }));

  const showSkeleton = loading && projects.length === 0;

  return (
    <div className="min-h-screen bg-cream-50">
      <HeroScrollSection size="page">
        <div className="brand-gradient py-16 px-4">
          <div className="max-w-7xl mx-auto text-white">
            <Link to="/" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4">
              <ArrowLeft className="w-4 h-4" /> {t('nav.home') || 'Home'}
            </Link>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-3">{t('home.urgentTitle')}</h1>
              <p className="text-white/80 max-w-2xl">{t('home.urgentSubtitle')}</p>
            </motion.div>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {showSkeleton ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="min-h-[320px] rounded-2xl bg-[#E8DFD0] animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D4B896] bg-white py-16 text-center text-[#5C4033]/70">
            <p>No projects need support right now.</p>
            <Link to="/" className="mt-4 inline-block">
              <Button variant="outline">{t('nav.home') || 'Back to home'}</Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-[#5C4033]/70">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {projects.map((p, i) => (
                <NeedSupportCard key={p.id || p.slug || i} project={p} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
