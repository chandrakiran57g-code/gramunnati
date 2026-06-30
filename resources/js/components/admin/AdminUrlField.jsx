import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { slugifyTitle, buildPublicPath } from '@/lib/adminSlug';
import { Link2, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Auto URL from title; optional advanced slug edit for every admin create form.
 */
export default function AdminUrlField({
  title,
  slug,
  onSlugChange,
  publicBase = '/page',
  disabled = false,
}) {
  const [advanced, setAdvanced] = useState(Boolean(slug && slug !== slugifyTitle(title)));

  const autoSlug = slugifyTitle(title);
  const effectiveSlug = slug || autoSlug;
  const publicPath = buildPublicPath(publicBase, effectiveSlug);

  const handleTitleDerivedSlug = (nextTitle, isEditing) => {
    if (!isEditing && !advanced) {
      onSlugChange(slugifyTitle(nextTitle));
    }
  };

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Link2 className="h-3.5 w-3.5" />
            Public page URL
          </Label>
          <p className="mt-1 truncate font-mono text-sm text-foreground">{publicPath}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Auto-generated from title. Visitors reach this page from the navbar section.</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-xs"
          onClick={() => setAdvanced((v) => !v)}
        >
          {advanced ? <ChevronUp className="mr-1 h-3.5 w-3.5" /> : <ChevronDown className="mr-1 h-3.5 w-3.5" />}
          {advanced ? 'Hide advanced' : 'Edit URL'}
        </Button>
      </div>
      {advanced && (
        <div className="mt-3 border-t border-border pt-3">
          <Label className="text-xs">Custom URL slug (advanced)</Label>
          <Input
            value={slug}
            disabled={disabled}
            onChange={(e) => onSlugChange(slugifyTitle(e.target.value))}
            placeholder={autoSlug || 'custom-slug'}
            className="mt-1 font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
}

export { slugifyTitle };
