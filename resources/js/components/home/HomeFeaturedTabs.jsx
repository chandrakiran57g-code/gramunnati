import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import VillageCard from '@/components/shared/VillageCard';
import SchoolCard from '@/components/shared/SchoolCard';
import ProjectCard from '@/components/shared/ProjectCard';
import { useLanguage } from '@/i18n/LanguageContext';

const TAB_KEYS = [
  { id: 'villages', labelKey: 'tabVillages', link: '/villages', emptyKey: 'emptyVillages' },
  { id: 'schools', labelKey: 'tabSchools', link: '/schools', emptyKey: 'emptySchools' },
  { id: 'projects', labelKey: 'tabProjects', link: '/projects', emptyKey: 'emptyProjects' },
];

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="home-skeleton-card">
          <div className="h-44 bg-gray-200 animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomeFeaturedTabs({ villages = [], schools = [], projects = [], loading }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState('villages');

  const data = { villages, schools, projects };
  const current = data[tab] || [];
  const activeTab = TAB_KEYS.find((item) => item.id === tab);

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div>
            <h2
              className="font-heading font-bold text-[#3D2914] mb-2 text-balance"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.025em' }}
            >
              {t('home.featuredTitle')}
            </h2>
            <p className="text-[#5C4033]/75 max-w-lg font-body">
              {t('home.featuredSubtitle')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-lg border border-[#D4B896]/50">
            {TAB_KEYS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`relative px-5 py-2.5 text-sm font-semibold rounded-md transition-colors ${
                  tab === item.id ? 'text-[#3D2914]' : 'text-[#5C4033]/60 hover:text-[#3D2914]'
                }`}
              >
                {tab === item.id && (
                  <motion.div
                    layoutId="home-featured-tab"
                    className="absolute inset-0 bg-white rounded-md shadow-sm border border-[#D4B896]/40"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">{t(`home.${item.labelKey}`)}</span>
                {!loading && (
                  <span className="relative ml-1.5 text-xs opacity-60">({data[item.id]?.length || 0})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              <SkeletonGrid />
            ) : current.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {tab === 'villages' && current.slice(0, 3).map((v, i) => (
                  <VillageCard key={v.id} village={v} index={i} />
                ))}
                {tab === 'schools' && current.slice(0, 3).map((s, i) => (
                  <SchoolCard key={s.id} school={s} index={i} />
                ))}
                {tab === 'projects' && current.slice(0, 3).map((p, i) => (
                  <ProjectCard key={p.id} project={p} index={i} />
                ))}
              </div>
            ) : (
              <div className="home-empty-state">
                <p className="text-[#5C4033]/70 font-body">
                  {t(`home.${activeTab?.emptyKey}`)}
                </p>
                <Link to={activeTab?.link} className="text-[#8B4513] font-semibold text-sm mt-2 inline-flex items-center gap-1">
                  Saare dekhein <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {current.length > 0 && (
          <div className="text-center mt-10">
            <Link
              to={activeTab?.link}
              className="inline-flex items-center gap-2 text-[#8B4513] hover:text-[#6B3410] font-semibold text-sm transition-colors group"
            >
              {t('home.viewAll')} {activeTab ? t(`home.${activeTab.labelKey}`) : ''}
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
