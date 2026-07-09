import { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Label } from '@/components/ui/label';

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link'],
  ['clean'],
];

/**
 * Simple rich text editor for admin content (headings, lists, spacing).
 */
export default function RichTextEditor({
  label,
  value = '',
  onChange,
  required = false,
  className = '',
  hint = 'Use headings, bold text, and lists for structured pages.',
}) {
  const modules = useMemo(() => ({ toolbar: TOOLBAR }), []);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="rounded-lg border border-border overflow-hidden bg-white [&_.ql-container]:min-h-[180px] [&_.ql-editor]:min-h-[180px] [&_.ql-editor]:text-sm [&_.ql-toolbar]:border-border [&_.ql-container]:border-border">
        <ReactQuill
          theme="snow"
          value={value || ''}
          onChange={(html) => onChange?.(html === '<p><br></p>' ? '' : html)}
          modules={modules}
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** English + Telugu rich text pair — mirrors BilingualTextarea API. */
export function BilingualRichText({
  name,
  label,
  form,
  setForm,
  required = false,
  className = '',
}) {
  const teKey = `${name}_te`;

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">English</p>
        <RichTextEditor
          label={label}
          value={form[name] ?? ''}
          onChange={(html) => setForm((f) => ({ ...f, [name]: html }))}
          required={required}
          hint=""
        />
      </div>
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-primary">తెలుగు (Telugu)</p>
        <RichTextEditor
          label=""
          value={form[teKey] ?? ''}
          onChange={(html) => setForm((f) => ({ ...f, [teKey]: html }))}
          hint="Use Heading 1–3, bullet/numbered lists, and paragraphs for Vision / Mission style layout."
        />
      </div>
    </div>
  );
}

/** Nested object rich text e.g. overview.about + overview.about_te */
export function BilingualNestedRichText({ parent, name, label, form, setForm, className = '' }) {
  const parentObj = form[parent] || {};
  const teKey = `${name}_te`;
  const nestedForm = { [name]: parentObj[name] ?? '', [teKey]: parentObj[teKey] ?? '' };
  const setNestedForm = (updater) => {
    setForm((f) => {
      const prev = f[parent] || {};
      const base = { [name]: prev[name] ?? '', [teKey]: prev[teKey] ?? '' };
      const next = typeof updater === 'function' ? updater(base) : updater;
      return {
        ...f,
        [parent]: {
          ...prev,
          [name]: next[name] ?? '',
          [teKey]: next[teKey] ?? '',
        },
      };
    });
  };
  return (
    <BilingualRichText name={name} label={label} form={nestedForm} setForm={setNestedForm} className={className} />
  );
}
