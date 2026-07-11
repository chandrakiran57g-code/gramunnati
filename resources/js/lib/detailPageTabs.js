/** Public detail-page tab definitions — admin editors must mirror these exactly. */
import { isProgramTemplate } from '@/lib/activeWorkTemplates';

export const PROGRAM_STYLE_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'objectives', label: 'Objectives' },
  { id: 'activities', label: 'Activities' },
  { id: 'impact', label: 'Impact' },
  { id: 'gallery', label: 'Gallery' },
];

export const VILLAGE_DETAIL_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'location', label: 'Location' },
  { id: 'statistics', label: 'Statistics' },
  { id: 'development', label: 'Development' },
  { id: 'crops', label: 'Crops' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'donations', label: 'Donations' },
  { id: 'insights', label: 'Insights' },
];

export const SCHOOL_DETAIL_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'academics', label: 'Academics' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'donations', label: 'Donations' },
];

export const CMS_ACTIVE_WORK_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'statistics', label: 'Statistics' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'donations', label: 'Donations' },
  { id: 'insights', label: 'Insights' },
];

/** Resolve which public page type an Active Works detail form maps to. */
export function resolveActiveWorkPageType(form) {
  if (form?._source === 'village') return 'village';
  if (form?._source === 'school') return 'school';
  if (isProgramTemplate(form?.template_type)) return 'program';
  if (form?._source === 'cms') return 'cms_active_work';
  if (form?.template_type === 'school') return 'school';
  if (form?.template_type === 'village') return 'village';
  return 'cms_active_work';
}

export function getActiveWorkAdminTabs(form) {
  const pageType = resolveActiveWorkPageType(form);
  if (pageType === 'village') return VILLAGE_DETAIL_TABS;
  if (pageType === 'school') return SCHOOL_DETAIL_TABS;
  if (pageType === 'program') return PROGRAM_STYLE_TABS;
  return CMS_ACTIVE_WORK_TABS;
}

export function getActiveWorkPreviewPath(form) {
  const pageType = resolveActiveWorkPageType(form);
  const slug = form?.slug || '';
  if (pageType === 'village') return `/villages/${slug}`;
  if (pageType === 'school') return `/schools/${slug}`;
  if (pageType === 'program') return `/programs/${form.template_type}`;
  return form?.link || `/active-work/${slug}`;
}
