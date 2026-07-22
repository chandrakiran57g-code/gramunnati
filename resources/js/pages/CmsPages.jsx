import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ArrowRight } from 'lucide-react';
import { cmsService } from '@/api/cms';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { stripHtml } from '@/lib/stripHtml';
import { useLocalize } from '@/lib/localizedContent';
import { PLATFORM_DATA_CHANGED } from '@/lib/platformRefresh';

export default function CmsPages() {
  const localize = useLocalize();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    cmsService
      .listPublishedPages()
      .then((rows) => setPages(Array.isArray(rows) ? rows : []))
      .catch(() => setPages([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const onChange = () => load();
    window.addEventListener(PLATFORM_DATA_CHANGED, onChange);
    return () => window.removeEventListener(PLATFORM_DATA_CHANGED, onChange);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="page">
        <section className="hero-gradient py-10 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4"
            >
              Pages
            </motion.h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Explore information pages across our platform.
            </p>
          </div>
        </section>
      </HeroScrollSection>

      <section className="py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-border p-6 animate-pulse">
                  <div className="h-40 bg-muted rounded-xl mb-4" />
                  <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
          ) : pages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No pages yet</h2>
              <p className="text-muted-foreground">Content pages will appear here once they are published.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((p, i) => {
                const title = localize(p, 'title') || p.title;
                const summary = stripHtml(localize(p, 'short_description') || p.short_description || '');
                return (
                  <motion.div
                    key={p.id || p.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(i * 0.05, 0.4) }}
                  >
                    <Link
                      to={`/page/${p.slug}`}
                      className="block group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full"
                    >
                      <div className="h-40 bg-muted overflow-hidden">
                        {p.featured_image ? (
                          <img
                            src={p.featured_image}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                            <FileText className="w-10 h-10 text-primary/30" />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                          {title}
                        </h3>
                        {summary && <p className="text-muted-foreground text-sm line-clamp-2">{summary}</p>}
                        <span className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-3 group-hover:gap-2 transition-all">
                          Read More <ArrowRight className="w-4 h-4" />
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
