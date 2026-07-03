import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/**
 * English + Telugu pair for admin content fields.
 * Saves to `name` (English) and `name_te` (Telugu) on the form object.
 */
export function BilingualInput({
  name,
  label,
  form,
  setForm,
  required = false,
  placeholderEn = '',
  placeholderTe = 'తెలుగు లో టైప్ చేయండి…',
  className = '',
  onEnChange,
}) {
  const teKey = `${name}_te`;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">English</p>
          <Input
            value={form[name] ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              setForm((f) => ({ ...f, [name]: value }));
              onEnChange?.(value);
            }}
            placeholder={placeholderEn || `${label} (English)`}
            required={required}
          />
        </div>
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-primary">తెలుగు (Telugu)</p>
          <Input
            value={form[teKey] ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, [teKey]: e.target.value }))}
            placeholder={placeholderTe}
            className="font-[system-ui]"
          />
        </div>
      </div>
    </div>
  );
}

export function BilingualTextarea({
  name,
  label,
  form,
  setForm,
  required = false,
  rows = 4,
  placeholderTe = 'తెలుగు లో టైప్ చేయండి…',
  className = '',
}) {
  const teKey = `${name}_te`;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">English</p>
          <Textarea
            value={form[name] ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
            rows={rows}
            required={required}
          />
        </div>
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-primary">తెలుగు (Telugu)</p>
          <Textarea
            value={form[teKey] ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, [teKey]: e.target.value }))}
            rows={rows}
            placeholder={placeholderTe}
            className="font-[system-ui]"
          />
        </div>
      </div>
    </div>
  );
}

/** Settings table uses flat keys: site_name + site_name_te */
export function BilingualSettingsField({ enKey, label, values, onChange, multiline = false, rows = 3 }) {
  const teKey = `${enKey}_te`;
  const form = { [enKey]: values[enKey] ?? '', [teKey]: values[teKey] ?? '' };
  const setForm = (updater) => {
    const next = typeof updater === 'function' ? updater(form) : updater;
    if (next[enKey] !== undefined) onChange(enKey, next[enKey]);
    if (next[teKey] !== undefined) onChange(teKey, next[teKey]);
  };

  if (multiline) {
    return <BilingualTextarea name={enKey} label={label} form={form} setForm={setForm} rows={rows} />;
  }

  return <BilingualInput name={enKey} label={label} form={form} setForm={setForm} />;
}

/** Nested object fields e.g. overview.about + overview.about_te */
export function BilingualNestedTextarea({ parent, name, label, form, setForm, rows = 3, className = '' }) {
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
    <BilingualTextarea name={name} label={label} form={nestedForm} setForm={setNestedForm} rows={rows} className={className} />
  );
}

export function BilingualNestedInput({ parent, name, label, form, setForm, required = false, className = '' }) {
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
    <BilingualInput name={name} label={label} form={nestedForm} setForm={setNestedForm} required={required} className={className} />
  );
}
