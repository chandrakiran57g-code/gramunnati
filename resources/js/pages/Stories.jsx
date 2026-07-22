import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cmsService } from '@/api/cms';
import { Quote, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { useLanguage } from '@/i18n/LanguageContext';
import { localize } from '@/lib/localizedContent';

export default function Stories() {
  const { lang } = useLanguage();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cmsService.listStories({ limit: 20, publishedOnly: true })
      .then(({ data }) => setStories(data || []))
      .catch(() => setStories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="page">
        <div className="brand-gradient py-10 sm:py-12 px-4">
          <div className="max-w-7xl mx-auto text-center text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Quote className="w-12 h-12 mx-auto mb-4 opacity-60" />
              <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Success Stories</h1>
              <p className="text-white/80 max-w-2xl mx-auto">Real transformations. Real impact. Stories of change from across rural India.</p>
            </motion.div>
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story, i) => (
              <motion.div key={story.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <Link
                to={`/stories/${story.slug || story.id}`}
                className="group block bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={story.featured_image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80'} alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {story.is_featured && (
                    <span className="absolute top-3 left-3 bg-donation text-white text-xs font-semibold px-2.5 py-1 rounded-full">Featured</span>
                  )}
                  {(story.village_name || story.villages?.village_name) && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-primary/80 text-white text-xs px-2 py-1 rounded-full">
                      <MapPin className="w-3 h-3" />{story.village_name || story.villages?.village_name}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-heading font-bold text-base mb-2 leading-tight line-clamp-2">{localize(story, 'title', lang)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{localize(story, 'summary', lang)}</p>
                  <div className="mt-4 flex items-center gap-1 text-primary font-medium text-sm group-hover:gap-2 transition-all">
                    Read Story <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
              </motion.div>
            ))}
          </div>
        )}
        {!loading && stories.length === 0 && (
          <div className="text-center py-20"><p className="text-muted-foreground">Success stories will appear here soon.</p></div>
        )}
      </div>
    </div>
  );
}