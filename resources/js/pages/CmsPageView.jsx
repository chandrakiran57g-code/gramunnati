import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cmsService } from '@/api/cms';
import { serviceDirectoryApi } from '@/api/serviceDirectory';
import { CMS_STATUS, isCmsPagePublic } from '@/lib/cmsStatus';
import { isServiceDirectorySlug, getServiceDirectoryConfig } from '@/lib/serviceDirectory';
import { PLATFORM_DATA_CHANGED } from '@/lib/platformRefresh';
import ReactMarkdown from 'react-markdown';
import ServiceDirectoryTable from '@/components/cms/ServiceDirectoryTable';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { useLocalizedRecord } from '@/lib/localizedContent';

export default function CmsPageView() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [directoryRows, setDirectoryRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const isDirectory = isServiceDirectorySlug(slug);
  const dirConfig = getServiceDirectoryConfig(slug);

  const loadPage = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const row = await cmsService.getPage(slug);
      setPage(row && isCmsPagePublic(row.status) ? row : (isDirectory ? { title: dirConfig?.title || slug, slug } : null));
      if (isDirectory) {
        const rows = await serviceDirectoryApi.loadRows(slug);
        setDirectoryRows(rows);
      }
    } catch {
      if (isDirectory) {
        setPage({ title: dirConfig?.title || slug, slug });
        const rows = await serviceDirectoryApi.loadRows(slug).catch(() => []);
        setDirectoryRows(rows);
      } else {
        setPage(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
    const onChange = () => loadPage();
    window.addEventListener(PLATFORM_DATA_CHANGED, onChange);
    return () => window.removeEventListener(PLATFORM_DATA_CHANGED, onChange);
  }, [slug]);

  const localized = useLocalizedRecord(page, ['title', 'short_description', 'content']);

  if (loading) return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-64 bg-muted rounded-lg" />
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
            <img src={page.featured_image} alt={localized?.title || page.title} className="w-full h-full object-cover" />
          </div>
        )}

        <section className={`${page.featured_image ? '-mt-8' : 'hero-gradient py-16'}`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <Link to="/" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`font-heading text-3xl sm:text-4xl font-bold mb-4 ${page.featured_image ? 'text-foreground' : 'text-white'}`}>
              {localized?.title || page.title}
            </motion.h1>
            {(localized?.short_description || page.short_description) && (
              <p className={`text-lg ${page.featured_image ? 'text-muted-foreground' : 'text-white/70'}`}>
                {localized?.short_description || page.short_description}
              </p>
            )}
          </div>
        </section>
      </HeroScrollSection>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {isDirectory ? (
            <ServiceDirectoryTable
              rows={directoryRows}
              getLink={(row) => dirConfig?.linkPattern?.(row)}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-border p-8">
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown>{localized?.content || page.content || localized?.short_description || page.short_description || ''}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
