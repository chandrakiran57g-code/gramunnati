import { useEffect, useRef } from 'react';
import $ from 'jquery';
import { Label } from '@/components/ui/label';
import { galleryService } from '@/api/admin';
import 'summernote/dist/summernote-lite.min.css';

// Summernote is a jQuery plugin and expects jQuery on the global scope. We set
// it before the (dynamic) plugin import so the UMD wrapper attaches to the same
// jQuery instance we use to drive the editor.
if (typeof window !== 'undefined') {
  window.$ = window.$ || $;
  window.jQuery = window.jQuery || $;
}

let summernotePromise = null;
function loadSummernote() {
  if (typeof window !== 'undefined') {
    window.$ = $;
    window.jQuery = $;
  }
  if (!summernotePromise) {
    summernotePromise = import('summernote/dist/summernote-lite.min.js');
  }
  return summernotePromise;
}

const EMPTY_HTML = '<p><br></p>';
const normalize = (html) => (html === EMPTY_HTML ? '' : html || '');

async function uploadEditorImage(file) {
  const { url } = await galleryService.uploadFile('gallery', file, 'content');
  return url;
}

// Full-featured toolbar: styles, fonts, sizes, colors, lists, alignment,
// line-height, tables, links, images, video, code view and fullscreen.
const TOOLBAR = [
  ['style', ['style']],
  ['font', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
  ['fontname', ['fontname']],
  ['fontsize', ['fontsize']],
  ['color', ['forecolor', 'backcolor']],
  ['para', ['ul', 'ol', 'paragraph']],
  ['height', ['height']],
  ['table', ['table']],
  ['insert', ['link', 'picture', 'video', 'hr']],
  ['view', ['fullscreen', 'codeview', 'help']],
];

const FONT_NAMES = [
  'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia', 'Helvetica',
  'Impact', 'Tahoma', 'Times New Roman', 'Verdana', 'Poppins', 'Roboto', 'Noto Sans Telugu',
];

const FONT_SIZES = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '30', '36', '48'];

/**
 * Summernote-powered rich text editor for admin content. Exposes the same
 * props/exports as before so every admin page keeps working unchanged.
 */
export default function RichTextEditor({
  label,
  value = '',
  onChange,
  required = false,
  className = '',
  hint = 'Format with headings, fonts, colors, lists, tables and images.',
  height = 220,
}) {
  const elRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value || '');
  const initedRef = useRef(false);
  onChangeRef.current = onChange;

  useEffect(() => {
    let destroyed = false;
    const el = elRef.current;

    loadSummernote().then(() => {
      if (destroyed || !el) return;
      const $el = $(el);
      $el.summernote({
        placeholder: '',
        tabsize: 2,
        height,
        disableDragAndDrop: false,
        toolbar: TOOLBAR,
        fontNames: FONT_NAMES,
        fontNamesIgnoreCheck: ['Poppins', 'Roboto', 'Noto Sans Telugu'],
        fontSizes: FONT_SIZES,
        callbacks: {
          onChange: (contents) => {
            const html = normalize(contents);
            valueRef.current = html;
            onChangeRef.current?.(html);
          },
          onImageUpload: (files) => {
            Array.from(files).forEach(async (file) => {
              try {
                const url = await uploadEditorImage(file);
                if (url) $el.summernote('insertImage', url, file.name || '');
              } catch {
                // Fallback to an inline data URL so the editor still works
                // even if the upload endpoint is unavailable.
                const reader = new FileReader();
                reader.onload = (ev) => $el.summernote('insertImage', ev.target.result, file.name || '');
                reader.readAsDataURL(file);
              }
            });
          },
        },
      });
      initedRef.current = true;
      if (valueRef.current) {
        $el.summernote('code', valueRef.current);
      }
    });

    return () => {
      destroyed = true;
      try {
        if (initedRef.current && el) {
          $(el).summernote('destroy');
        }
      } catch {
        /* ignore teardown errors */
      }
      initedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes (e.g. when an edit form loads a record) into
  // the editor, while ignoring echoes of the user's own typing.
  useEffect(() => {
    const next = value || '';
    if (!initedRef.current) {
      valueRef.current = next;
      return;
    }
    if (next === valueRef.current) return;
    valueRef.current = next;
    const el = elRef.current;
    if (el) $(el).summernote('code', next);
  }, [value]);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="cmsr-summernote rounded-lg border border-border bg-white overflow-hidden [&_.note-editor]:border-0 [&_.note-editable]:text-sm">
        <div ref={elRef} />
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
