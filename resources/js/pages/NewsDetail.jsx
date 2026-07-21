import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Calendar, Tag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { useLanguage } from '@/i18n/LanguageContext';
import { localize } from '@/lib/localizedContent';
import RichContent from '@/components/shared/RichContent';

export default function NewsDetail() {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const [article, setArticle] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.NewsItem.list('-created_date', 50)
      .then(data => {
        setNews(data);
        const found = data.find(n => n.slug === slug || n.id === slug);
        setArticle(found || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-school/30 border-t-school rounded-full animate-spin" /></div>;
  if (!article) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-4">📰</div><h2 className="font-heading text-2xl font-bold mb-2">Article Not Found</h2><Link to="/news"><Button className="school-gradient text-white border-0">Back to News</Button></Link></div></div>;

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="detail">
        <div className="relative h-64 sm:h-96 overflow-hidden">
          <img src={article.featured_image || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80'} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            {article.category && <span className="bg-school text-white text-xs px-3 py-1 rounded-full font-medium mb-3 inline-block">{article.category}</span>}
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">{localize(article, 'title', lang) || article.title}</h1>
            {article.published_at && <div className="text-white/60 text-sm flex items-center gap-1 mt-2"><Calendar className="w-3.5 h-3.5" />{article.published_at}</div>}
          </div>
        </div>
      </HeroScrollSection>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <RichContent
            content={localize(article, 'content', lang) || article.content || article.summary || article.description || 'Full article content coming soon.'}
            className="text-sm leading-relaxed"
          />

          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border">
              {article.tags.map(tag => (
                <span key={tag} className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground flex items-center gap-1"><Tag className="w-3 h-3" />{tag}</span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Related */}
        {news.length > 1 && (
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="font-heading font-bold text-lg mb-4">More News</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {news.filter(n => n.id !== article.id).slice(0, 3).map(n => (
                <Link key={n.id} to={`/news/${n.slug || n.id}`} className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-all">
                  <div className="text-xs text-school font-medium mb-1">{n.category}</div>
                  <div className="font-semibold text-sm line-clamp-2">{localize(n, 'title', lang) || n.title}</div>
                  <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Calendar className="w-3 h-3" />{n.published_at}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}