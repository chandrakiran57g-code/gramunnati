import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BilingualInput } from '@/components/admin/BilingualField';
import RichTextEditor, { BilingualRichText } from '@/components/admin/RichTextEditor';

function uid() {
  return `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function emptySection() {
  return {
    id: uid(),
    heading: '',
    heading_te: '',
    subheading: '',
    subheading_te: '',
    body: '',
    body_te: '',
  };
}

/**
 * Admin editor for structured page content:
 * page title / main heading + repeatable sections (heading, subheading, body with markdown lists).
 */
export default function StructuredContentEditor({
  form,
  setForm,
  titleField = 'content_title',
  headingField = 'content_heading',
  sectionsField = 'content_sections',
  legacyField = 'content',
  showLegacyFallback = true,
}) {
  const sections = Array.isArray(form[sectionsField]) ? form[sectionsField] : [];

  const setSections = (next) => {
    setForm((f) => ({
      ...f,
      [sectionsField]: typeof next === 'function' ? next(f[sectionsField] || []) : next,
    }));
  };

  const updateSection = (idx, patch) => {
    setSections((list) => list.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const addSection = () => setSections((list) => [...list, emptySection()]);

  const removeSection = (idx) => {
    setSections((list) => list.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6 rounded-xl border border-border bg-gray-50/40 p-4 sm:p-5">
      <div>
        <h3 className="font-semibold text-foreground">Page content structure</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Use a main title, then add sections with headings / sub-headings. In body text, use a blank line between paragraphs,
          <code className="mx-1 rounded bg-muted px-1"># Heading</code>,
          <code className="mx-1 rounded bg-muted px-1">## Sub-heading</code>,
          and <code className="mx-1 rounded bg-muted px-1">- bullet</code> lines for lists.
        </p>
      </div>

      <BilingualInput
        name={titleField}
        label="Main title (optional, shown large / uppercase)"
        form={form}
        setForm={setForm}
        placeholderEn="e.g. SMART SCHOOLS EMPOWERMENT"
      />
      <BilingualInput
        name={headingField}
        label="Page heading (optional)"
        form={form}
        setForm={setForm}
        placeholderEn="e.g. Model Village Integration Initiative"
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-sm font-semibold">Content sections</Label>
          <Button type="button" size="sm" variant="outline" onClick={addSection}>
            <Plus className="mr-1.5 h-4 w-4" /> Add section
          </Button>
        </div>

        {sections.length === 0 && (
          <p className="rounded-lg border border-dashed border-border bg-white px-4 py-6 text-center text-sm text-muted-foreground">
            No sections yet. Add Vision, Mission, Key Focus Areas, etc.
          </p>
        )}

        {sections.map((section, idx) => (
          <div key={section.id || idx} className="space-y-3 rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Section {idx + 1}
              </span>
              <Button type="button" size="sm" variant="ghost" className="text-red-500" onClick={() => removeSection(idx)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Heading (English)</Label>
                <Input
                  className="mt-1"
                  value={section.heading || ''}
                  onChange={(e) => updateSection(idx, { heading: e.target.value })}
                  placeholder="e.g. Vision"
                />
              </div>
              <div>
                <Label className="text-xs text-primary">Heading (తెలుగు)</Label>
                <Input
                  className="mt-1"
                  value={section.heading_te || ''}
                  onChange={(e) => updateSection(idx, { heading_te: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Sub-heading (English)</Label>
                <Input
                  className="mt-1"
                  value={section.subheading || ''}
                  onChange={(e) => updateSection(idx, { subheading: e.target.value })}
                  placeholder="e.g. 1. Smart Classrooms"
                />
              </div>
              <div>
                <Label className="text-xs text-primary">Sub-heading (తెలుగు)</Label>
                <Input
                  className="mt-1"
                  value={section.subheading_te || ''}
                  onChange={(e) => updateSection(idx, { subheading_te: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Body (English)</p>
                <RichTextEditor
                  value={section.body || ''}
                  onChange={(html) => updateSection(idx, { body: html })}
                  hint="Use Heading 2–3 and bullet lists for Vision / Mission style layout."
                />
              </div>
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-primary">Body (తెలుగు)</p>
                <RichTextEditor
                  value={section.body_te || ''}
                  onChange={(html) => updateSection(idx, { body_te: html })}
                  hint=""
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {showLegacyFallback && (
        <div className="border-t border-border pt-4">
          <BilingualRichText
            name={legacyField}
            label="Legacy full content (optional fallback if no sections)"
            form={form}
            setForm={setForm}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Prefer sections above. This field still works if you paste one full rich article.
          </p>
        </div>
      )}
    </div>
  );
}
