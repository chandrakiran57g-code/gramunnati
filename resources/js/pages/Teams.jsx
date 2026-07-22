import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Users, ArrowRight } from 'lucide-react';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { useLanguage } from '@/i18n/LanguageContext';
import { localize } from '@/lib/localizedContent';
import { stripHtml } from '@/lib/stripHtml';

function bannerSrc(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url) || url.startsWith('blob:') || url.startsWith('data:')) return url;
  return `/storage/${String(url).replace(/^\/+/, '').replace(/^storage\//, '')}`;
}

export default function Teams() {
  const { lang } = useLanguage();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.TeamGroup.filter({ status: 'active' }, 'display_order', 50)
      .then(setGroups).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Prefer the first category that has a banner; otherwise any group banner.
  const pageBanner = groups.find((g) => g.banner_image)?.banner_image || null;

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="page">
        {pageBanner ? (
          <section className="relative h-64 sm:h-80 overflow-hidden">
            <img src={bannerSrc(pageBanner)} alt="Our Teams" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
            <div className="relative z-10 flex h-full items-end">
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-10 text-center sm:text-left">
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
                  Our Teams
                </motion.h1>
                <p className="text-white/80 text-lg max-w-2xl mx-auto sm:mx-0">
                  Meet the dedicated individuals driving change across rural India
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="hero-gradient py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
                Our Teams
              </motion.h1>
              <p className="text-white/70 text-lg max-w-2xl mx-auto">
                Meet the dedicated individuals driving change across rural India
              </p>
            </div>
          </section>
        )}
      </HeroScrollSection>

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-border p-8 animate-pulse">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group, i) => {
                const banner = bannerSrc(group.banner_image);
                return (
                  <motion.div key={group.id}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  >
                    <Link to={`/teams/${group.slug}`}
                      className="block group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                    >
                      {banner ? (
                        <div className="h-40 overflow-hidden bg-muted">
                          <img
                            src={banner}
                            alt={group.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="h-40 bg-primary/10 flex items-center justify-center">
                          <Users className="w-12 h-12 text-primary/60" />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="font-heading text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {localize(group, 'name', lang) || group.name}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                          {stripHtml(localize(group, 'description', lang) || group.description)}
                        </p>
                        <span className="inline-flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                          View Members <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}