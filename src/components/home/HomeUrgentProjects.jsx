import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Heart } from 'lucide-react';
import SafeImage from '@/components/shared/SafeImage';
import { resolveImageUrl } from '@/lib/villageImages';
import { homeService } from '@/api/home';
import { useLanguage } from '@/i18n/LanguageContext';

function ProjectCard({ project }) {
  const { t } = useLanguage();
  const slug = project.slug || project.id;
  const name = project.project_name || project.title;
  const image = resolveImageUrl(project.cover_image || project.featured_image, 0, 600);
  const progress = project.progress ?? 0;
  const village = project.villages?.village_name;

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="home-urgent-card home-feature-card flex flex-col h-full min-h-[380px]"
    >
      <div className="relative h-44 overflow-hidden rounded-t-xl">
        <SafeImage src={image} alt={name} fallbackIndex={0} width={600} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3D2914]/90 to-transparent" />
        {progress < 100 && (
          <span className="absolute top-3 left-3 home-urgent-badge">{t('home.needsSupport')}</span>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-heading font-bold text-amber-50 text-lg leading-tight line-clamp-2">{name}</h3>
          {village && <p className="text-amber-100/60 text-xs mt-1">{village}</p>}
        </div>
      </div>
      <div className="p-4 bg-[#FFF8E7] border border-t-0 border-[#D4B896] rounded-b-xl flex flex-col flex-1">
        <div className="flex justify-between text-xs text-[#5C4033]/70 mb-2 font-body">
          <span>{t('home.raised')} {homeService.formatINR(project.raised || 0)}</span>
          {project.target > 0 && <span>{t('home.goal')} {homeService.formatINR(project.target)}</span>}
        </div>
        <div className="home-progress-bar mb-4">
          <div className="home-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <Link
          to={`/donate?project_id=${project.id}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#8B6914] text-amber-50 text-sm font-semibold hover:bg-[#6B5344] transition-colors"
        >
          <Heart className="w-4 h-4" />
          {t('home.supportNow')}
        </Link>
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
          to="/projects"
          className="inline-flex items-center gap-2 text-amber-200 hover:text-amber-100 font-semibold text-sm transition-colors group shrink-0"
        >
          {t('home.allProjects')}
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? [...Array(3)].map((_, i) => (
                <div key={i} className="home-feature-card min-h-[380px] bg-[#3D2914] rounded-xl animate-pulse" />
              ))
            : projects.slice(0, 3).map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      </div>
    </section>
  );
}
