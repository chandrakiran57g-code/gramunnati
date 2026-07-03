import { useMemo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

/** Pick English or Telugu field; falls back to English if Telugu empty. */
export function localize(record, field, lang = 'en') {
  if (!record) return '';
  if (lang === 'te') {
    const te = record[`${field}_te`];
    if (te != null && String(te).trim() !== '') {
      return te;
    }
  }
  const en = record[field];
  return en != null ? en : '';
}

/** Map multiple fields on a record to localized values. */
export function localizeRecord(record, fields, lang = 'en') {
  if (!record) return null;
  const out = { ...record };
  for (const field of fields) {
    out[field] = localize(record, field, lang);
  }
  return out;
}

export function useLocalizedRecord(record, fields) {
  const { lang } = useLanguage();
  return useMemo(
    () => (record ? localizeRecord(record, fields, lang) : null),
    [record, fields, lang],
  );
}

export function useLocalize() {
  const { lang } = useLanguage();
  return (record, field) => localize(record, field, lang);
}

/** Map an array of records, localizing given fields per current language. */
export function localizeList(records, fields, lang = 'en') {
  if (!Array.isArray(records)) return [];
  return records.map((record) => localizeRecord(record, fields, lang));
}

/** Pick nested object field with optional _te sibling inside the parent object. */
export function localizeNested(record, parent, field, lang = 'en') {
  const obj = record?.[parent];
  if (!obj || typeof obj !== 'object') return '';
  if (lang === 'te') {
    const te = obj[`${field}_te`];
    if (te != null && String(te).trim() !== '') return te;
  }
  const en = obj[field];
  return en != null ? en : '';
}

/** Empty _te keys for admin forms */
export function withTeFields(base, fields) {
  const te = {};
  for (const f of fields) {
    te[`${f}_te`] = base[`${f}_te`] ?? '';
  }
  return { ...base, ...te };
}
