import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Heart } from 'lucide-react';
import SafeImage from '@/components/shared/SafeImage';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { activeWorkService } from '@/api/activeWork';
import { useLanguage } from '@/i18n/LanguageContext';

export function ActiveWorkCard({ item, index = 0 }) {
  const href = item.link || `/active-work/${item.slug}`;
  const cover = item.cover_image || item.card?.cover_image;
  const badge = item.badge || item.card?.badge || 'Featured';

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="home-feature-card group bg-[#FFF8E7] rounded-2xl border border-[#D4B896] overflow-hidden flex flex-col h-full min-h-[380px]"
    >
      <div className="relative h-44 shrink-0 overflow-hidden">
        <SafeImage src={cover} alt={item.name} fallbackIndex={index} width={600} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3D2914]/70 to-transparent" />
        {badge && (
          <span className="absolute top-3 left-3 bg-[#8B6914] text-amber-50 text-xs font-semibold px-2.5 py-1 rounded-full">{badge}</span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-heading font-bold text-[#3D2914] text-lg leading-tight mb-2">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-[#5C4033]/75 line-clamp-3 flex-1">{item.description}</p>
        )}
        <div className="flex gap-2 mt-4 pt-2">
          {(item.card?.enable_details !== false) && (
            <Link to={href} className="flex-1">
              <Button variant="outline" size="sm" className="w-full border-[#8B6914] text-[#8B6914] hover:bg-[#8B6914] hover:text-white text-xs">
                View Details
              </Button>
            </Link>
          )}
          {(item.card?.enable_donate !== false) && (
            <Link to={item.donate_link || `/donate?village_id=${item.id}`}>
              <Button size="sm" className="donation-gradient text-white border-0 text-xs px-3">
                <Heart className="w-3 h-3 mr-1" /> Donate
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function HomeActiveWorksSection({ section, index = 0 }) {
  const { category, items } = section;
  const viewAll = category.view_all_link || `/programs/${category.slug?.replace('active-', '')}`;

  return (
    <div className={index > 0 ? 'mt-14' : ''}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="font-heading font-bold text-[#3D2914] text-2xl">{category.name}</h3>
          {category.description && <p className="text-[#5C4033]/70 text-sm mt-1">{category.description}</p>}
        </div>
        <Link to={viewAll} className="inline-flex items-center gap-1 text-[#8B4513] font-semibold text-sm hover:text-[#6B3410]">
          View All <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.slice(0, 3).map((item, i) => (
          <ActiveWorkCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="home-feature-card min-h-[380px] bg-[#E8DFD0] animate-pulse rounded-2xl" />
      ))}
    </div>
  );
}

export default function HomeActiveWorks({ loading: parentLoading }) {
  const { t } = useLanguage();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    activeWorkService.getHomeSections()
      .then(setSections)
      .catch(() => setSections([]))
      .finally(() => setLoading(false));
  }, []);

  const isLoading = parentLoading || loading;

  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h2
            className="font-heading font-bold text-[#3D2914] mb-2"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.025em' }}
          >
            {t('home.featuredTitle')}
          </h2>
          <p className="text-[#5C4033]/75 max-w-lg font-body">{t('home.featuredSubtitle')}</p>
        </div>

        {isLoading ? <SkeletonGrid /> : sections.length === 0 ? (
          <p className="text-[#5C4033]/70">No active work sections configured yet.</p>
        ) : (
          sections.map((section, i) => (
            <HomeActiveWorksSection key={section.category.id} section={section} index={i} />
          ))
        )}
      </div>
    </section>
  );
}
