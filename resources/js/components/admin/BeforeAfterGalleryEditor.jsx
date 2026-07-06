import { X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { AdminImageUpload } from '@/components/admin/AdminMediaUpload';

function ImageList({ images, onRemove }) {
  if (!images.length) return null;
  return (
    <div className="mb-3 flex flex-wrap gap-3">
      {images.map((url, i) => (
        <div key={`${url}-${i}`} className="relative">
          <img src={url} alt="" className="h-24 w-36 rounded-lg border object-cover" />
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
            aria-label="Remove image"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

function GallerySide({ title, hint, images, onChange, subPath }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <Label className="text-sm font-semibold">{title}</Label>
      <p className="mb-3 mt-0.5 text-xs text-muted-foreground">{hint}</p>
      <ImageList images={images} onRemove={(i) => onChange(images.filter((_, idx) => idx !== i))} />
      <AdminImageUpload
        value=""
        onChange={(url) => { if (url) onChange([...images, url]); }}
        subPath={subPath}
      />
    </div>
  );
}

/**
 * Two upload sections — "Before CMSR" and "After CMSR" — for the visual
 * comparison gallery shown on active work detail pages.
 * `value` is { before: [urls], after: [urls] }.
 */
export default function BeforeAfterGalleryEditor({ value, onChange, subPath = 'active-works/gallery' }) {
  const before = Array.isArray(value?.before) ? value.before : [];
  const after = Array.isArray(value?.after) ? value.after : [];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <GallerySide
        title="Before CMSR"
        hint="Photos of how it looked before CMSR started working here."
        images={before}
        onChange={(next) => onChange({ before: next, after })}
        subPath={subPath}
      />
      <GallerySide
        title="After CMSR"
        hint="Photos showing the change after CMSR's work."
        images={after}
        onChange={(next) => onChange({ before, after: next })}
        subPath={subPath}
      />
    </div>
  );
}
