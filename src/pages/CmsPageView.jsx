import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';

export default function CmsPageView() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    base44.entities.CmsPage.filter({ slug, status: 'published' }, undefined, 1)
      .then(r => setPage(r[0] || null))
      .catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-2/3" />
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    </div>
  );

  if (!page) return (
    <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-4">The page you're looking for doesn't exist or has been unpublished.</p>
        <Link to="/"><Button>Go Home</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <HeroScrollSection size="detail">
        {page.featured_image && (
          <div className="h-48 sm:h-64 bg-muted overflow-hidden">
            <img src={page.featured_image} alt={page.title} className="w-full h-full object-cover" />
          </div>
        )}

        <section className={`${page.featured_image ? '-mt-8' : 'hero-gradient py-16'}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Link to="/" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`font-heading text-3xl sm:text-4xl font-bold mb-4 ${page.featured_image ? 'text-foreground' : 'text-white'}`}>
              {page.title}
            </motion.h1>
            {page.short_description && (
              <p className={`text-lg ${page.featured_image ? 'text-muted-foreground' : 'text-white/70'}`}>
                {page.short_description}
              </p>
            )}
          </div>
        </section>
      </HeroScrollSection>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-border p-8">
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown>{page.content || page.short_description || ''}</ReactMarkdown>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}