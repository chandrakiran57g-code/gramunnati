import RichContent from '@/components/shared/RichContent';

/**
 * Renders structured page body: optional top heading + sections
 * (each with heading / body). Falls back to rich HTML/Markdown for legacy content.
 */
export default function StructuredContent({
  title,
  heading,
  sections = [],
  fallbackMarkdown = '',
  className = '',
}) {
  const hasSections = Array.isArray(sections) && sections.some((s) => (s?.heading || s?.subheading || s?.body || '').trim());
  const legacy = String(fallbackMarkdown || '').trim();

  if (!hasSections && !legacy && !heading && !title) return null;

  return (
    <div className={`structured-content space-y-8 ${className}`}>
      {(title || heading) && (
        <header className="space-y-2">
          {title && (
            <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wide text-foreground">
              {title}
            </h2>
          )}
          {heading && heading !== title && (
            <h3 className="font-heading text-xl font-bold text-foreground">{heading}</h3>
          )}
        </header>
      )}

      {hasSections ? (
        sections
          .filter((s) => (s?.heading || s?.subheading || s?.body || '').trim())
          .map((section, idx) => (
            <section key={section.id || idx} className="space-y-3">
              {section.heading && (
                <h3 className="font-heading text-lg font-bold text-foreground">{section.heading}</h3>
              )}
              {section.subheading && (
                <h4 className="font-heading text-base font-semibold text-foreground/90">{section.subheading}</h4>
              )}
              {section.body && <RichContent content={section.body} />}
            </section>
          ))
      ) : (
        legacy && <RichContent content={legacy} />
      )}
    </div>
  );
}
