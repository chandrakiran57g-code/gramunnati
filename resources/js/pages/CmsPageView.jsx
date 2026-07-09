import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cmsService } from '@/api/cms';
import { serviceDirectoryApi } from '@/api/serviceDirectory';
import { CMS_STATUS, isCmsPagePublic } from '@/lib/cmsStatus';
import { isServiceDirectorySlug, getServiceDirectoryConfig } from '@/lib/serviceDirectory';
import { PLATFORM_DATA_CHANGED } from '@/lib/platformRefresh';
import ServiceDirectoryTable from '@/components/cms/ServiceDirectoryTable';
import StructuredContent from '@/components/shared/StructuredContent';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroScrollSection } from '@/components/ui/container-scroll-animation';
import { localize, useLocalizedRecord } from '@/lib/localizedContent';
import { useLanguage } from '@/i18n/LanguageContext';

/** Map page_type values to the service directory slug used by serviceDirectoryApi */
const PAGE_TYPE_TO_DIR_SLUG = {
  about_villages: 'about-villages',
  about_schools: 'about-schools',
  about_volunteers: 'about-volunteers',
};

export default function CmsPageView() {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const [page, setPage] = useState(null);
  const [directoryRows, setDirectoryRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPage = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const row = await cmsService.getPage(slug);

      // Determine if this page should show a directory listing.
      // Check both: the new page_type column AND the legacy slug-based detection.
      const dirSlug = row?.page_type ? PAGE_TYPE_TO_DIR_SLUG[row.page_type] : null;
      const legacyDir = isServiceDirectorySlug(slug);
      const isDirectory = !!dirSlug || legacyDir;
      const effectiveDirSlug = dirSlug || (legacyDir ? slug : null);

      if (row && isCmsPagePublic(row.status)) {
        setPage(row);
      } else if (isDirectory) {
        const dirConfig = getServiceDirectoryConfig(effectiveDirSlug);
        setPage({ title: dirConfig?.title || slug, slug, page_type: row?.page_type });
      } else {
        setPage(null);
      }

      if (isDirectory && effectiveDirSlug) {
        const rows = await serviceDirectoryApi.loadRows(effectiveDirSlug).catch(() => []);
        setDirectoryRows(rows);
      } else {
        setDirectoryRows([]);
      }
    } catch {
      // Fallback: try legacy slug-based directory
      const legacyDir = isServiceDirectorySlug(slug);
      if (legacyDir) {
        const dirConfig = getServiceDirectoryConfig(slug);
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

  const localized = useLocalizedRecord(page, ['title', 'short_description', 'content', 'content_title', 'content_heading']);
  const adminContent = (localize(page, 'content', lang) || page?.content || '').trim();
  const contentTitle = localize(page, 'content_title', lang) || page?.content_title;
  const contentHeading = localize(page, 'content_heading', lang) || page?.content_heading;
  const contentSections = Array.isArray(page?.content_sections)
    ? page.content_sections.map((s) => ({
        ...s,
        heading: localize(s, 'heading', lang) || s.heading,
        subheading: localize(s, 'subheading', lang) || s.subheading,
        body: localize(s, 'body', lang) || s.body,
      }))
    : [];
  const hasStructured = contentSections.some((s) => (s?.heading || s?.subheading || s?.body || '').trim())
    || Boolean(contentTitle)
    || Boolean(contentHeading);

  // Determine directory info from page_type or slug
  const dirSlug = page?.page_type ? PAGE_TYPE_TO_DIR_SLUG[page.page_type] : (isServiceDirectorySlug(slug) ? slug : null);
  const dirConfig = dirSlug ? getServiceDirectoryConfig(dirSlug) : null;
  const isDirectory = !!dirSlug && directoryRows.length >= 0;

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
        {page.featured_image ? (
          <section className="relative h-64 sm:h-80 overflow-hidden">
            <img src={page.featured_image} alt={localized?.title || page.title} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            <div className="relative z-10 flex h-full items-end">
              <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pb-8">
                <Link to="/" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="font-heading text-3xl sm:text-4xl font-bold mb-3 text-white">
                  {localized?.title || page.title}
                </motion.h1>
                {(localized?.short_description || page.short_description) && (
                  <p className="text-lg text-white/80">
                    {localized?.short_description || page.short_description}
                  </p>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="hero-gradient py-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <Link to="/" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </Link>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="font-heading text-3xl sm:text-4xl font-bold mb-4 text-white">
                {localized?.title || page.title}
              </motion.h1>
              {(localized?.short_description || page.short_description) && (
                <p className="text-lg text-white/70">
                  {localized?.short_description || page.short_description}
                </p>
              )}
            </div>
          </section>
        )}
      </HeroScrollSection>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Admin-entered content — appears above directory list on directory pages */}
          {(hasStructured || adminContent) && (
            <div className="bg-white rounded-2xl border border-border p-8">
              <StructuredContent
                title={contentTitle}
                heading={contentHeading}
                sections={contentSections}
                fallbackMarkdown={adminContent}
              />
            </div>
          )}

          {dirSlug ? (
            <ServiceDirectoryTable
              rows={directoryRows}
              getLink={(row) => dirConfig?.linkPattern?.(row)}
              variant={dirSlug === 'about-volunteers' ? 'volunteers' : 'default'}
            />
          ) : (
            !(hasStructured || adminContent) && (
              <div className="bg-white rounded-2xl border border-border p-8 text-center text-muted-foreground">
                {localized?.short_description || page.short_description || 'Content coming soon.'}
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
