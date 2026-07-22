import { normalizeBeforeAfter } from '@/lib/beforeAfterGallery';

function GalleryColumn({ label, badgeClass, images }) {
  if (!images.length) return null;
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${badgeClass}`}>{label}</span>
        <span className="text-xs text-muted-foreground">{images.length} photo{images.length === 1 ? '' : 's'}</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {images.map((src, i) => (
          <div key={`${src}-${i}`} className="aspect-square overflow-hidden rounded-lg">
            <img src={src} alt={label} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Before CMSR / After CMSR visual comparison gallery.
 * `gallery` accepts { before: [urls], after: [urls] } or the legacy array shape.
 */
export default function BeforeAfterGallery({ gallery, emptyMessage = 'Gallery photos appear here once added by the admin.' }) {
  const { before, after } = normalizeBeforeAfter(gallery);

  if (!before.length && !after.length) {
    return <p className="py-8 text-center text-muted-foreground">{emptyMessage}</p>;
  }

  const bothPresent = before.length > 0 && after.length > 0;

  return (
    <div className={`grid gap-6 ${bothPresent ? 'sm:grid-cols-2' : ''}`}>
      <GalleryColumn label="Before CMSR" badgeClass="bg-stone-200 text-stone-700" images={before} />
      <GalleryColumn label="After CMSR" badgeClass="bg-emerald-100 text-emerald-700" images={after} />
    </div>
  );
}
