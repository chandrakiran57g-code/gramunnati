import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Heart } from 'lucide-react';
import SafeImage from '@/components/shared/SafeImage';
import { resolveImageUrl } from '@/lib/villageImages';
import { homeService } from '@/api/home';
import { useLanguage } from '@/i18n/LanguageContext';
import { localize } from '@/lib/localizedContent';

function ProjectCard({ project }) {
  const { t, lang } = useLanguage();
  const slug = project.slug;
  const name = localize(project, 'project_name', lang) || localize(project, 'title', lang) || localize(project, 'name', lang);
  const image = resolveImageUrl(project.cover_image || project.featured_image, 0, 600);
  const progress = project.progress ?? 0;
  const village = project.villages?.village_name;
  const detailHref = slug ? `/need-support/${slug}` : null;
  const donateHref = slug
    ? `/donate?project_slug=${encodeURIComponent(slug)}`
    : `/donate?project_id=${project.id}`;

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="home-urgent-card home-feature-card flex flex-col h-full min-h-[320px] lg:min-h-[340px]"
    >
      <Link to={detailHref || donateHref} className="relative h-36 lg:h-32 overflow-hidden rounded-t-xl block">
        <SafeImage src={image} alt={name} fallbackIndex={0} width={480} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3D2914]/90 to-transparent" />
        {progress < 100 && (
          <span className="absolute top-2 left-2 home-urgent-badge text-[10px] px-2 py-0.5">{t('home.needsSupport')}</span>
        )}
        <div className="absolute bottom-2 left-2 right-2">
          <h3 className="font-heading font-bold text-amber-50 text-sm lg:text-[15px] leading-tight line-clamp-2">{name}</h3>
          {village && <p className="text-amber-100/60 text-[10px] mt-0.5 truncate">{village}</p>}
        </div>
      </Link>
      <div className="p-3 bg-gray-50 border border-t-0 border-[#D4B896] rounded-b-xl flex flex-col flex-1">
        <div className="flex justify-between text-[10px] lg:text-xs text-[#5C4033]/70 mb-1.5 font-body gap-1">
          <span className="truncate">{t('home.raised')} {homeService.formatINR(project.raised || 0)}</span>
          {project.target > 0 && <span className="truncate shrink-0">{t('home.goal')} {homeService.formatINR(project.target)}</span>}
        </div>
        <div className="home-progress-bar mb-3">
          <div className="home-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-auto flex flex-col gap-2">
          {detailHref && (
            <Link
              to={detailHref}
              className="flex items-center justify-center w-full py-1.5 rounded-lg border border-[#8B6914] text-[#8B6914] text-xs font-semibold hover:bg-white/60 transition-colors"
            >
              Learn More
            </Link>
          )}
          <Link
            to={donateHref}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-[#8B6914] text-amber-50 text-xs font-semibold hover:bg-[#6B5344] transition-colors"
          >
            <Heart className="w-3.5 h-3.5" />
            {t('home.supportNow')}
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function HomeUrgentProjects({ projects = [], loading }) {
  const { t } = useLanguage();
  if (!loading && projects.length === 0) return null;

  return (
    <section className="py-20 sm:py-24 bg-[#2a1c0f] relative overflow-hidden">
      <div className="absolute inset-0 home-urgent-glow pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2
            className="font-heading font-bold text-amber-50 mb-2"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.025em' }}
          >
            {t('home.urgentTitle')}
          </h2>
          <p className="text-amber-100/55 font-body max-w-lg">
            {t('home.urgentSubtitle')}
          </p>
        </div>
        <Link
          to="/need-support"
          className="inline-flex items-center gap-2 text-amber-200 hover:text-amber-100 font-semibold text-sm transition-colors group shrink-0"
        >
          {t('home.allProjects')}
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-3">
          {loading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="home-feature-card min-h-[320px] bg-[#3D2914] rounded-xl animate-pulse" />
              ))
            : projects.slice(0, 4).map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      </div>
    </section>
  );
}
