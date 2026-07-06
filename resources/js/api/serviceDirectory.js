import { supabase } from './supabaseClient';
import { getServiceDirectoryConfig } from '@/lib/serviceDirectory';
import { parseSettingsValue } from '@/lib/settingsStore';

/** API may return a plain string or a nested { name } relation object. */
function relationName(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value.name != null) return String(value.name);
  return '';
}

function mapVillageRow(v) {
  return {
    id: v.id,
    name: v.village_name,
    slug: v.slug,
    mandal: relationName(v.mandal) || relationName(v.mandals),
    district: relationName(v.district) || relationName(v.districts),
    date_of_entry: v.created_at,
  };
}

function mapSchoolRow(s) {
  const village = s.village || s.villages;
  return {
    id: s.id,
    name: s.school_name,
    slug: s.slug,
    mandal: relationName(village?.mandal) || relationName(village?.mandals),
    district: relationName(village?.district) || relationName(village?.districts),
    date_of_entry: s.created_at,
  };
}

function mapVolunteerRow(v) {
  return {
    id: v.id,
    name: v.full_name,
    state: v.state || '',
    mandal: '',
    district: v.district || '',
    date_of_entry: v.created_at,
  };
}

function mapProjectRow(p) {
  const village = p.village || p.villages;
  return {
    id: p.id,
    name: p.project_name,
    slug: p.slug,
    mandal: relationName(village?.mandal) || relationName(village?.mandals),
    district: relationName(village?.district) || relationName(village?.districts),
    date_of_entry: p.created_at,
    category: relationName(p.project_categories) || relationName(p.category),
  };
}

function matchesCategory(project, patterns = []) {
  const cat = (project.category || '').toLowerCase();
  return patterns.some((p) => cat.includes(p.toLowerCase()));
}

/** Active-work item ids look like `aw-<timestamp>-xxxx` — recover the creation date. */
function activeWorkItemDate(item) {
  const ts = Number(String(item.id || '').split('-')[1]);
  return Number.isFinite(ts) && ts > 0 ? new Date(ts).toISOString() : null;
}

/**
 * Cards created in Active Works with the "village"/"school" template (stored in
 * the active_work_store settings JSON) also belong in the About Villages /
 * About Schools directory lists.
 */
async function activeWorkTemplateRows(templateType) {
  try {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'active_work_store')
      .maybeSingle();
    const store = parseSettingsValue(data?.value);
    const items = Array.isArray(store?.items) ? store.items : [];
    return items
      .filter((i) => i.status === 'active')
      .filter((i) => (i.template_type || 'village') === templateType)
      .filter((i) => String(i.name || '').trim().length >= 2)
      .map((i) => ({
        id: `aw-${i.id}`,
        name: i.name,
        slug: i.slug,
        mandal: i.location?.mandal || '',
        district: i.location?.district || '',
        state: i.location?.state || '',
        date_of_entry: activeWorkItemDate(i),
        link: i.link || `/active-work/${i.slug}`,
      }));
  } catch {
    return [];
  }
}

/** Append extra rows, skipping any that duplicate a DB row by slug or name. */
function mergeDirectoryRows(dbRows, extraRows) {
  const slugs = new Set(dbRows.map((r) => r.slug).filter(Boolean));
  const names = new Set(dbRows.map((r) => String(r.name || '').trim().toLowerCase()));
  return [
    ...dbRows,
    ...extraRows.filter(
      (r) => !slugs.has(r.slug) && !names.has(String(r.name || '').trim().toLowerCase()),
    ),
  ];
}

export const serviceDirectoryApi = {
  async loadRows(slug) {
    const config = getServiceDirectoryConfig(slug);
    if (!config) return [];

    if (config.type === 'villages') {
      const { data } = await supabase
        .from('villages')
        .select('id, slug, village_name, mandal, district, created_at, mandals(name), districts(name)')
        .is('deleted_at', null)
        .order('village_name');
      return mergeDirectoryRows((data || []).map(mapVillageRow), await activeWorkTemplateRows('village'));
    }

    if (config.type === 'schools') {
      const { data } = await supabase
        .from('schools')
        .select('id, slug, school_name, mandal, district, created_at, villages(mandal, district, mandals(name), districts(name))')
        .is('deleted_at', null)
        .order('school_name');
      return mergeDirectoryRows((data || []).map(mapSchoolRow), await activeWorkTemplateRows('school'));
    }

    if (config.type === 'volunteers') {
      const { data } = await supabase
        .from('volunteers')
        .select('id, full_name, state, district, created_at, status')
        .eq('status', 'active')
        .order('full_name');
      return (data || []).map(mapVolunteerRow);
    }

    if (config.type === 'projects') {
      const { data } = await supabase
        .from('projects')
        .select('id, slug, project_name, mandal, district, created_at, project_categories(name), villages(mandals(name), districts(name))')
        .is('deleted_at', null)
        .eq('status', 'active')
        .order('project_name');
      let rows = (data || []).map(mapProjectRow);
      if (config.categoryMatch?.length) {
        rows = rows.filter((r) => matchesCategory(r, config.categoryMatch));
      }
      return rows;
    }

    return [];
  },
};
