import { supabase } from './supabaseClient';
import { adminDbMutation } from '@/lib/adminDb';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';
import { parseSettingsValue, serializeSettingsValue } from '@/lib/settingsStore';
import { emptyActiveWorkPage, isProgramTemplate, PROGRAM_ACTIVE_CATEGORIES, formatActiveCategoryName } from '@/lib/activeWorkTemplates';
import { BEFORE_CMSR_TITLE, AFTER_CMSR_TITLE, groupGalleryRows, normalizeBeforeAfter } from '@/lib/beforeAfterGallery';
import { activityLogToTimelineEvent, timelineEventToActivityLog } from '@/lib/villageTimeline';
import { cropRowToEditor, editorCropToRow } from '@/lib/villageCrops';
import { requirementRowToEditor, editorRequirementToRow } from '@/lib/schoolRequirements';
import { PROGRAMS } from '@/lib/programs';

const STORE_KEY = 'active_work_store';

const DEFAULT_CATEGORIES = [
  { id: 'cat-villages', name: 'Active Villages', slug: 'active-villages', view_all_link: '/active-works/category/active-villages', display_order: 0, status: 'active', entity_type: 'village' },
  { id: 'cat-schools', name: 'Active Schools', slug: 'active-schools', view_all_link: '/active-works/category/active-schools', display_order: 1, status: 'active', entity_type: 'school' },
  ...PROGRAM_ACTIVE_CATEGORIES.map((c, i) => ({ ...c, display_order: 10 + i })),
];

function slugify(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** Before/After CMSR images for a village/school, stored in the `galleries` table */
async function readEntityBeforeAfter(type, entityId) {
  const { data } = await supabase
    .from('galleries')
    .select('*')
    .eq('galleryable_type', type)
    .eq('galleryable_id', entityId)
    .order('sort_order', { ascending: true });
  const grouped = groupGalleryRows(data);
  return { before: grouped.before, after: grouped.after };
}

async function syncEntityBeforeAfter(type, entityId, gallery) {
  const { before, after } = normalizeBeforeAfter(gallery);
  const { data: existing } = await supabase
    .from('galleries')
    .select('id, title')
    .eq('galleryable_type', type)
    .eq('galleryable_id', entityId);

  const stale = (existing || []).filter((r) => r.title === BEFORE_CMSR_TITLE || r.title === AFTER_CMSR_TITLE);
  for (const row of stale) {
    await supabase.from('galleries').delete().eq('id', row.id);
  }

  const rows = [
    ...before.map((url, i) => ({ galleryable_type: type, galleryable_id: entityId, title: BEFORE_CMSR_TITLE, image_path: url, sort_order: i })),
    ...after.map((url, i) => ({ galleryable_type: type, galleryable_id: entityId, title: AFTER_CMSR_TITLE, image_path: url, sort_order: 100 + i })),
  ];
  for (const row of rows) {
    const { error } = await supabase.from('galleries').insert(row);
    if (error) throw error;
  }
}

async function readEntityTimeline(loggableType, entityId) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('loggable_type', loggableType)
    .eq('loggable_id', entityId)
    .order('activity_date', { ascending: false });
  if (error) throw error;
  return (data || []).map(activityLogToTimelineEvent);
}

async function syncEntityTimeline(loggableType, entityId, events) {
  const { error: deleteError } = await supabase
    .from('activity_logs')
    .delete()
    .eq('loggable_type', loggableType)
    .eq('loggable_id', entityId);
  if (deleteError) throw deleteError;

  const rows = (events || [])
    .map((event) => timelineEventToActivityLog(entityId, event, loggableType))
    .filter((row) => row.title);

  if (!rows.length) return;

  const { error: insertError } = await supabase.from('activity_logs').insert(rows);
  if (insertError) throw insertError;
}

async function readVillageTimeline(villageId) {
  return readEntityTimeline('village', villageId);
}

async function syncVillageTimeline(villageId, events) {
  return syncEntityTimeline('village', villageId, events);
}

async function readSchoolTimeline(schoolId) {
  return readEntityTimeline('school', schoolId);
}

async function syncSchoolTimeline(schoolId, events) {
  return syncEntityTimeline('school', schoolId, events);
}

async function readVillageCrops(villageId) {
  const { data, error } = await supabase
    .from('village_crops')
    .select('*')
    .eq('village_id', villageId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []).map(cropRowToEditor);
}

async function syncVillageCrops(villageId, crops) {
  const { error: deleteError } = await supabase
    .from('village_crops')
    .delete()
    .eq('village_id', villageId);
  if (deleteError) throw deleteError;

  const rows = (crops || [])
    .map((crop, index) => editorCropToRow(villageId, crop, index))
    .filter((row) => row.name);

  if (!rows.length) return;

  const { error: insertError } = await supabase.from('village_crops').insert(rows);
  if (insertError) throw insertError;
}

async function readSchoolRequirements(schoolId) {
  const { data, error } = await supabase
    .from('school_requirements')
    .select('*')
    .eq('school_id', schoolId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []).map(requirementRowToEditor);
}

async function syncSchoolRequirements(schoolId, requirements) {
  const { error: deleteError } = await supabase
    .from('school_requirements')
    .delete()
    .eq('school_id', schoolId);
  if (deleteError) throw deleteError;

  const rows = (requirements || [])
    .map((req, index) => editorRequirementToRow(schoolId, req, index))
    .filter((row) => row.title);

  if (!rows.length) return;

  const { error: insertError } = await supabase.from('school_requirements').insert(rows);
  if (insertError) throw insertError;
}

async function readStore() {
  const { data } = await supabase.from('settings').select('value').eq('key', STORE_KEY).maybeSingle();
  const parsed = parseSettingsValue(data?.value);
  if (parsed && typeof parsed === 'object') {
    if (!parsed.entity_templates) parsed.entity_templates = [];
    syncEntityTemplateCategories(parsed);
    return parsed;
  }
  const empty = { categories: DEFAULT_CATEGORIES, items: [], entity_templates: [] };
  syncEntityTemplateCategories(empty);
  return empty;
}

async function writeStore(store) {
  return adminDbMutation(async () => {
    const { error } = await supabase.from('settings').upsert(
      { key: STORE_KEY, value: serializeSettingsValue(store) },
      { onConflict: 'key' }
    );
    if (error) throw error;
    invalidateActiveWorkPublicCache();
    notifyPlatformDataChanged();
  });
}

let publicBundleCache = null;

export function invalidateActiveWorkPublicCache() {
  publicBundleCache = null;
}

function filterActiveCmsItems(items) {
  return (items || [])
    .filter((i) => i.status === 'active')
    .filter((i) => String(i.name || '').trim().length >= 2)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

function entityCardsFromBundle(cat, bundle, limit) {
  if (cat.entity_type === 'village') {
    return bundle.villages
      .filter((v) => v.is_active !== false && String(v.village_name || '').trim().length >= 2)
      .slice(0, limit)
      .map((v) => ({
        id: v.id,
        slug: v.slug,
        name: v.village_name,
        cover_image: v.cover_image,
        description: v.short_description || v.description,
        badge: v.is_featured ? 'Featured' : 'Active',
        display_order: v.display_order ?? 0,
        category_id: cat.id,
        link: `/villages/${v.slug}`,
        donate_link: `/donate?type=village&village_id=${v.id}`,
        card: { enable_donate: true, enable_details: true },
      }));
  }
  if (cat.entity_type === 'school') {
    return bundle.schools
      .filter((s) => s.is_active !== false && String(s.school_name || '').trim().length >= 2)
      .slice(0, limit)
      .map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.school_name,
        cover_image: s.cover_image,
        description: s.description || s.seo_description,
        badge: s.is_featured ? 'Featured' : 'Active',
        display_order: s.display_order ?? 0,
        category_id: cat.id,
        link: `/schools/${s.slug}`,
        donate_link: `/donate?type=school&school_id=${s.id}`,
        card: { enable_donate: true, enable_details: true },
      }));
  }
  return [];
}

function cmsItemsForCategory(item, cat) {
  if (item.category_id === cat.id) return true;
  if (item.category_id) return false;
  if (cat.entity_type === 'village' && item.template_type === 'village') return true;
  if (cat.entity_type === 'school' && item.template_type === 'school') return true;
  if (cat.entity_type === 'custom' && item.template_type === cat.template_type) return true;
  const slug = cat.program_slug || cat.template_type;
  if (slug && item.template_type === slug) return true;
  if (slug && cat.slug === `active-${item.template_type}`) return true;
  return false;
}

function isDbEntityCategory(cat) {
  return cat?.entity_type === 'village' || cat?.entity_type === 'school';
}

function buildCategoryItems(cat, cmsItems, bundle, previewLimit) {
  const cms = cmsItems.filter((i) => cmsItemsForCategory(i, cat));
  const entityLimit = previewLimit ?? 500;
  let items = [];

  if (isDbEntityCategory(cat)) {
    const entityItems = entityCardsFromBundle(cat, bundle, entityLimit);
    if (cms.length > 0) {
      const seen = new Set(cms.map((i) => String(i.id)));
      items = [...cms];
      for (const row of entityItems) {
        if (previewLimit != null && items.length >= previewLimit) break;
        if (!seen.has(String(row.id))) items.push(row);
      }
    } else {
      items = entityItems;
    }
  } else {
    items = cms;
  }

  items = items.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  if (previewLimit != null) items = items.slice(0, previewLimit);
  return items;
}

async function loadPublicBundle({ bustCache = false } = {}) {
  if (!bustCache && publicBundleCache) return publicBundleCache;

  const store = await readStore();
  const { cats } = mergeDefaultCategories(store.categories, store.entity_templates);
  const categories = cats.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  const cmsItems = filterActiveCmsItems(store.items);

  const needsVillages = categories.some((c) => c.entity_type === 'village');
  const needsSchools = categories.some((c) => c.entity_type === 'school');

  const [villagesRes, schoolsRes] = await Promise.all([
    needsVillages
      ? supabase
        .from('villages')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(100)
      : Promise.resolve({ data: [] }),
    needsSchools
      ? supabase
        .from('schools')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(100)
      : Promise.resolve({ data: [] }),
  ]);

  publicBundleCache = {
    categories,
    cmsItems,
    villages: villagesRes.data || [],
    schools: schoolsRes.data || [],
  };
  return publicBundleCache;
}

function resolveCategoryId(categories, templateType) {
  if (!templateType) return null;
  if (templateType === 'village') {
    return categories.find((c) => c.entity_type === 'village')?.id ?? null;
  }
  if (templateType === 'school') {
    return categories.find((c) => c.entity_type === 'school')?.id ?? null;
  }
  return (
    categories.find((c) => c.entity_type === 'custom' && c.template_type === templateType)?.id
    || categories.find((c) => c.program_slug === templateType)?.id
    || categories.find((c) => c.template_type === templateType)?.id
    || categories.find((c) => c.slug === `active-${templateType}`)?.id
    || null
  );
}

function templateUid() {
  return `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const RESERVED_TEMPLATE_SLUGS = new Set([
  'village', 'school', ...PROGRAMS.map((p) => p.slug),
]);

function syncEntityTemplateCategories(store) {
  const templates = (store.entity_templates || []).filter((t) => t.status !== 'deleted');
  if (!store.categories) store.categories = [];
  const activeSlugs = new Set(templates.map((t) => t.slug || slugify(t.name)));

  store.categories = store.categories.filter(
    (c) => c.entity_type !== 'custom' || activeSlugs.has(c.template_type),
  );

  templates.forEach((tpl, index) => {
    const slug = tpl.slug || slugify(tpl.name);
    const catSlug = `active-${slug}`;
    const catRow = {
      id: tpl.category_id || `cat-custom-${slug}`,
      name: formatActiveCategoryName(tpl.name),
      slug: catSlug,
      template_type: slug,
      entity_type: 'custom',
      icon: tpl.icon || '',
      view_all_link: `/active-works/category/${catSlug}`,
      display_order: tpl.display_order ?? (2 + index),
      status: tpl.status || 'active',
    };
    const idx = store.categories.findIndex(
      (c) => c.entity_type === 'custom' && c.template_type === slug,
    );
    if (idx >= 0) {
      store.categories[idx] = { ...store.categories[idx], ...catRow, id: store.categories[idx].id };
      tpl.category_id = store.categories[idx].id;
    } else {
      store.categories.push(catRow);
      tpl.category_id = catRow.id;
    }
  });
}

function mergeDefaultCategories(existing = [], entityTemplates = []) {
  const cats = existing?.length ? [...existing] : [];
  let changed = !existing?.length;

  for (const def of DEFAULT_CATEGORIES) {
    const idx = cats.findIndex((c) => c.slug === def.slug || c.id === def.id);
    if (idx < 0) {
      cats.push({ ...def });
      changed = true;
    } else {
      const merged = { ...cats[idx], ...def, id: cats[idx].id || def.id };
      const before = JSON.stringify(cats[idx]);
      const after = JSON.stringify(merged);
      if (before !== after) {
        cats[idx] = merged;
        changed = true;
      }
    }
  }

  syncEntityTemplateCategories({ categories: cats, entity_templates: entityTemplates });

  return { cats, changed };
}

function uid() {
  return `aw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseAdminKey(key) {
  const [source, id] = String(key).split(':');
  return { source, id };
}

async function defaultGeo() {
  const { data: mandal } = await supabase.from('mandals').select('id, district_id').limit(1).maybeSingle();
  if (!mandal) return { state_id: null, district_id: null, mandal_id: null };
  return { state_id: 24, district_id: mandal.district_id, mandal_id: mandal.id };
}

function villageToCard(v, cat) {
  return {
    id: `village-${v.id}`,
    entity_id: v.id,
    _source: 'village',
    _adminKey: `village:${v.id}`,
    template_type: 'village',
    name: v.village_name,
    slug: v.slug,
    cover_image: v.cover_image,
    description: v.description || v.short_description,
    status: v.is_active !== false ? 'active' : 'inactive',
    featured: Boolean(v.is_featured),
    display_order: v.display_order ?? 0,
    category_id: cat?.id,
    link: `/villages/${v.slug}`,
    donate_link: `/donate?type=village&village_id=${v.id}`,
    badge: v.is_featured ? 'Featured' : 'Active',
    card: { enable_donate: true, enable_details: true },
  };
}

function schoolToCard(s, cat) {
  return {
    id: `school-${s.id}`,
    entity_id: s.id,
    _source: 'school',
    _adminKey: `school:${s.id}`,
    template_type: 'school',
    name: s.school_name,
    slug: s.slug,
    cover_image: s.cover_image,
    description: s.description || s.short_description,
    status: s.is_active !== false ? 'active' : 'inactive',
    featured: Boolean(s.is_featured),
    display_order: s.display_order ?? 0,
    category_id: cat?.id,
    link: `/schools/${s.slug}`,
    donate_link: `/donate?type=school&school_id=${s.id}`,
    badge: s.is_featured ? 'Featured' : 'Active',
    card: { enable_donate: true, enable_details: true },
  };
}

export const activeWorkService = {
  async getStore() {
    return readStore();
  },

  async listEntityTemplates({ activeOnly = false } = {}) {
    const store = await readStore();
    let templates = store.entity_templates || [];
    if (activeOnly) templates = templates.filter((t) => t.status === 'active');
    return templates.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  },

  async saveEntityTemplate(template) {
    const store = await readStore();
    if (!store.entity_templates) store.entity_templates = [];

    const name = String(template.name || '').trim();
    if (name.length < 2) throw new Error('Template name is required');

    const slug = slugify(template.slug || name);
    if (RESERVED_TEMPLATE_SLUGS.has(slug)) {
      throw new Error('This template slug is reserved. Choose a different name.');
    }

    const duplicate = store.entity_templates.find(
      (t) => t.slug === slug && t.id !== template.id,
    );
    if (duplicate) throw new Error('A template with this slug already exists');

    const row = {
      icon: template.icon || '📋',
      display_order: Number(template.display_order) || store.entity_templates.length + 2,
      status: template.status || 'active',
      ...template,
      id: template.id || templateUid(),
      name,
      slug,
    };

    const idx = store.entity_templates.findIndex((t) => t.id === row.id);
    if (idx >= 0) store.entity_templates[idx] = { ...store.entity_templates[idx], ...row };
    else store.entity_templates.push(row);

    syncEntityTemplateCategories(store);
    await writeStore(store);
    return row;
  },

  async deleteEntityTemplate(id) {
    const store = await readStore();
    const tpl = (store.entity_templates || []).find((t) => t.id === id);
    if (!tpl) return;

    store.entity_templates = store.entity_templates.filter((t) => t.id !== id);
    store.categories = (store.categories || []).filter(
      (c) => !(c.entity_type === 'custom' && c.template_type === tpl.slug),
    );
    store.items = (store.items || []).filter(
      (i) => i.template_type !== tpl.slug && i.category_id !== tpl.category_id,
    );
    await writeStore(store);
  },

  async listCategories({ activeOnly = false } = {}) {
    const store = await readStore();
    let cats = store.categories || [];
    if (activeOnly) cats = cats.filter((c) => c.status === 'active');
    return cats.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  },

  async listItems({ categoryId, featuredOnly = false, activeOnly = false } = {}) {
    const store = await readStore();
    let items = store.items || [];
    if (categoryId) items = items.filter((i) => i.category_id === categoryId);
    if (activeOnly) items = items.filter((i) => i.status === 'active');
    if (featuredOnly) items = items.filter((i) => i.featured);
    items = items.filter((i) => String(i.name || '').trim().length >= 2);
    return items.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  },

  async getItem(slug, { bustCache = false } = {}) {
    if (bustCache) invalidateActiveWorkPublicCache();
    const store = await readStore();
    return (store.items || []).find((i) => i.slug === slug) || null;
  },

  async saveCategory(category) {
    const store = await readStore();
    const row = {
      ...category,
      id: category.id || uid(),
      slug: category.slug || slugify(category.name),
      display_order: category.display_order ?? store.categories.length,
      status: category.status || 'active',
    };
    const idx = store.categories.findIndex((c) => c.id === row.id);
    if (idx >= 0) store.categories[idx] = row;
    else store.categories.push(row);
    await writeStore(store);
    return row;
  },

  async deleteCategory(id) {
    const store = await readStore();
    store.categories = store.categories.filter((c) => c.id !== id);
    store.items = store.items.filter((i) => i.category_id !== id);
    await writeStore(store);
  },

  async saveItem(item) {
    const store = await readStore();
    const row = {
      impact: {},
      development_score: {},
      overview: {},
      statistics: {},
      timeline: [],
      gallery: [],
      donations: {},
      programs: [],
      program_details: { objectives: '', activities: '', impact_highlights: '' },
      location: {},
      card: { enable_donate: true, enable_details: true },
      seo: {},
      ...item,
      id: item.id || uid(),
      slug: item.slug || slugify(item.name),
      display_order: item.display_order ?? 0,
      status: item.status || 'active',
      featured: item.featured !== false,
    };
    const idx = store.items.findIndex((i) => i.id === row.id);
    if (idx >= 0) store.items[idx] = row;
    else store.items.push(row);
    await writeStore(store);
    return row;
  },

  async deleteItem(id) {
    const store = await readStore();
    store.items = store.items.filter((i) => i.id !== id);
    await writeStore(store);
  },

  /** First 3 active items per category on home; View All shows the full list */
  async getHomeSections({ bustCache = false } = {}) {
    const bundle = await loadPublicBundle({ bustCache });
    const categories = bundle.categories.filter((c) => c.status === 'active');
    const sections = [];

    for (const cat of categories) {
      const items = buildCategoryItems(cat, bundle.cmsItems, bundle, 3);
      if (items.length > 0) sections.push({ category: cat, items });
    }

    return sections;
  },

  /** All active cards for one Active Works category (CMS + linked entities) */
  async getCategoryItems(categorySlug, { previewLimit = null, bustCache = false } = {}) {
    const bundle = await loadPublicBundle({ bustCache });
    const cat = bundle.categories.find(
      (c) => c.slug === categorySlug || c.id === categorySlug,
    );
    if (!cat) return { category: null, items: [] };

    const items = buildCategoryItems(cat, bundle.cmsItems, bundle, previewLimit);
    return { category: cat, items };
  },

  async _entityCards(cat, limit = 3) {
    if (cat.entity_type === 'village') {
      const { data } = await supabase
        .from('villages')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(limit);
      return (data || []).map((v) => ({
        id: v.id,
        slug: v.slug,
        name: v.village_name,
        cover_image: v.cover_image,
        description: v.description || v.short_description,
        badge: v.is_featured ? 'Featured' : 'Active',
        category_id: cat.id,
        link: `/villages/${v.slug}`,
        donate_link: `/donate?type=village&village_id=${v.id}`,
        card: { enable_donate: true, enable_details: true },
      }));
    }
    if (cat.entity_type === 'school') {
      const { data } = await supabase
        .from('schools')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(limit);
      return (data || []).map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.school_name,
        cover_image: s.cover_image,
        description: s.description || s.short_description,
        badge: s.is_featured ? 'Featured' : 'Active',
        category_id: cat.id,
        link: `/schools/${s.slug}`,
        donate_link: `/donate?type=school&school_id=${s.id}`,
        card: { enable_donate: true, enable_details: true },
      }));
    }
    if (cat.entity_type === 'project') {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(limit);
      return (data || []).map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.project_name,
        cover_image: p.cover_image,
        description: p.description || p.short_description,
        badge: p.is_featured ? 'Featured' : 'Active',
        category_id: cat.id,
        link: `/projects/${p.slug}`,
        donate_link: `/donate?project_id=${p.id}`,
        card: { enable_donate: true, enable_details: true },
      }));
    }
    return [];
  },

  /** Merge default categories in memory; optionally persist (admin only). */
  async ensureCategories({ persist = false } = {}) {
    const store = await readStore();
    const { cats, changed } = mergeDefaultCategories(store.categories, store.entity_templates || []);

    if (persist && changed) {
      store.categories = cats;
      await writeStore(store);
    }

    return cats.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  },

  /** All cards visible on frontend — CMS + villages + schools */
  async listAllAdminCards() {
    const categories = await this.ensureCategories({ persist: true });
    const cmsItems = (await this.listItems()).map((i) => ({
      ...i,
      _source: 'cms',
      _adminKey: `cms:${i.id}`,
      template_type: i.template_type || 'village',
    }));

    const all = [...cmsItems];
    const villageCat = categories.find((c) => c.entity_type === 'village');
    const schoolCat = categories.find((c) => c.entity_type === 'school');

    if (villageCat) {
      const { data } = await supabase.from('villages').select('*').is('deleted_at', null).order('created_at', { ascending: true });
      for (const v of data || []) {
        if (!all.some((x) => x._source === 'village' && String(x.entity_id) === String(v.id))) {
          all.push(villageToCard(v, villageCat));
        }
      }
    }

    if (schoolCat) {
      const { data } = await supabase.from('schools').select('*').is('deleted_at', null).order('created_at', { ascending: true });
      for (const s of data || []) {
        if (!all.some((x) => x._source === 'school' && String(x.entity_id) === String(s.id))) {
          all.push(schoolToCard(s, schoolCat));
        }
      }
    }

    return all.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  },

  async saveAdminCard(item) {
    // New cards built on the village/school template become real village/school
    // records, so they automatically appear everywhere villages and schools are
    // listed — Active Works, /page/about-villages and /page/about-schools.
    if (
      !item.id
      && !item.entity_id
      && (!item._source || item._source === 'cms')
      && (item.template_type === 'village' || item.template_type === 'school')
    ) {
      item = { ...item, _source: item.template_type };
    }

    if (item._source === 'village') {
      const geo = await defaultGeo();
      const payload = {
        village_name: item.name?.trim(),
        slug: item.slug || slugify(item.name),
        short_description: null,
        description: item.description || null,
        description_te: item.description_te || null,
        cover_image: item.cover_image || null,
        is_featured: item.featured !== false,
        is_active: item.status !== 'inactive',
        display_order: Number(item.display_order) || 0,
        ...geo,
      };
      return adminDbMutation(async () => {
        if (item.entity_id) {
          const { data, error } = await supabase.from('villages').update(payload).eq('id', item.entity_id).select().single();
          if (error) throw error;
          invalidateActiveWorkPublicCache();
          notifyPlatformDataChanged();
          const cat = (await this.ensureCategories({ persist: false })).find((c) => c.entity_type === 'village');
          return villageToCard(data, cat);
        }
        const { data, error } = await supabase.from('villages').insert(payload).select().single();
        if (error) throw error;
        invalidateActiveWorkPublicCache();
        notifyPlatformDataChanged();
        const cat = (await this.ensureCategories({ persist: false })).find((c) => c.entity_type === 'village');
        return villageToCard(data, cat);
      });
    }

    if (item._source === 'school') {
      const payload = {
        school_name: item.name?.trim(),
        slug: item.slug || slugify(item.name),
        short_description: item.description || null,
        short_description_te: item.description_te || null,
        cover_image: item.cover_image || null,
        is_featured: item.featured !== false,
        is_active: item.status !== 'inactive',
        display_order: Number(item.display_order) || 0,
        school_type: item.school_type || 'government',
      };
      return adminDbMutation(async () => {
        if (item.entity_id) {
          const { data, error } = await supabase.from('schools').update(payload).eq('id', item.entity_id).select().single();
          if (error) throw error;
          invalidateActiveWorkPublicCache();
          notifyPlatformDataChanged();
          const cat = (await this.ensureCategories({ persist: false })).find((c) => c.entity_type === 'school');
          return schoolToCard(data, cat);
        }
        const { data, error } = await supabase.from('schools').insert({ ...payload, is_active: true }).select().single();
        if (error) throw error;
        invalidateActiveWorkPublicCache();
        notifyPlatformDataChanged();
        const cat = (await this.ensureCategories({ persist: false })).find((c) => c.entity_type === 'school');
        return schoolToCard(data, cat);
      });
    }

    const categories = await this.ensureCategories({ persist: true });
    const category_id = item.category_id || resolveCategoryId(categories, item.template_type);

    return this.saveItem({
      ...item,
      _source: undefined,
      _adminKey: undefined,
      entity_id: undefined,
      category_id,
      program_slug: isProgramTemplate(item.template_type) ? item.template_type : item.program_slug,
      link: item.link || `/active-work/${item.slug || slugify(item.name)}`,
    });
  },

  async deleteAdminCard(item) {
    if (item._source === 'village' && item.entity_id) {
      return adminDbMutation(async () => {
        const { error } = await supabase.from('villages').update({ deleted_at: new Date().toISOString() }).eq('id', item.entity_id);
        if (error) throw error;
        invalidateActiveWorkPublicCache();
        notifyPlatformDataChanged();
      });
    }
    if (item._source === 'school' && item.entity_id) {
      return adminDbMutation(async () => {
        const { error } = await supabase.from('schools').update({ deleted_at: new Date().toISOString() }).eq('id', item.entity_id);
        if (error) throw error;
        invalidateActiveWorkPublicCache();
        notifyPlatformDataChanged();
      });
    }
    return this.deleteItem(item.id);
  },

  async getAdminDetailPage(adminKey) {
    const { source, id } = parseAdminKey(adminKey);

    if (source === 'cms') {
      const store = await readStore();
      return store.items.find((i) => String(i.id) === String(id)) || null;
    }

    if (source === 'village') {
      const { data } = await supabase.from('villages').select('*, districts(name), states(name), mandals(name)').eq('id', id).maybeSingle();
      if (!data) return null;
      return {
        ...emptyActiveWorkPage('village'),
        _source: 'village',
        _adminKey: adminKey,
        entity_id: data.id,
        template_type: 'village',
        name: data.village_name,
        name_te: data.village_name_te || '',
        slug: data.slug,
        cover_image: data.cover_image,
        description: data.description || data.short_description || '',
        description_te: data.description_te || data.short_description_te || '',
        history: data.history || '',
        history_te: data.history_te || '',
        village_code: data.village_code || '',
        status: data.is_active !== false ? 'active' : 'inactive',
        overview: {},
        location: {
          district: data.districts?.name || '',
          state: data.states?.name || '',
          mandal: data.mandals?.name || '',
          pincode: data.pincode || '',
        },
        impact: {
          trees_planted: data.trees_count || 0,
          water_bodies: data.water_bodies_count || 0,
          farmer_count: data.farmer_count || 0,
          schools_count: data.schools_count || 0,
          projects_count: data.projects_count || 0,
          volunteers_count: data.volunteers_count || 0,
        },
        statistics: {
          population: data.population ?? '',
          male_population: data.male_population ?? '',
          female_population: data.female_population ?? '',
          literacy_rate: data.literacy_rate ?? '',
          farmer_count: data.farmer_count ?? '',
          cultivable_land: data.cultivable_land || '',
          major_crops: data.major_crops || '',
          trees_count: data.trees_count ?? '',
          water_bodies_count: data.water_bodies_count ?? '',
        },
        gallery: await readEntityBeforeAfter('village', data.id),
        timeline: await readVillageTimeline(data.id),
        crops: await readVillageCrops(data.id),
        link: `/villages/${data.slug}`,
      };
    }

    if (source === 'school') {
      const { data } = await supabase.from('schools').select('*').eq('id', id).maybeSingle();
      if (!data) return null;
      return {
        ...emptyActiveWorkPage('school'),
        _source: 'school',
        _adminKey: adminKey,
        entity_id: data.id,
        template_type: 'school',
        name: data.school_name,
        slug: data.slug,
        cover_image: data.cover_image,
        description: data.short_description || '',
        description_te: data.short_description_te || '',
        status: data.is_active !== false ? 'active' : 'inactive',
        overview: {},
        impact: {
          students_count: data.student_count || 0,
          teachers_count: data.teacher_count || 0,
          classrooms: data.classroom_count || 0,
        },
        statistics: {
          udise_code: data.udise_code || '',
        },
        infrastructure: {
          library_available: !!data.library_available,
          computer_lab_available: !!data.computer_lab_available,
          playground_available: !!data.playground_available,
          drinking_water_available: !!data.drinking_water_available,
          toilet_available: !!data.toilet_available,
          electricity_available: !!data.electricity_available,
          digital_classroom_available: !!data.digital_classroom_available,
          boundary_wall_available: !!data.boundary_wall_available,
        },
        administration: {
          principal_name: data.principal_name || '',
          contact_number: data.contact_number || '',
          email: data.email || '',
          website: data.website || '',
        },
        gallery: await readEntityBeforeAfter('school', data.id),
        timeline: await readSchoolTimeline(data.id),
        requirements: await readSchoolRequirements(data.id),
        link: `/schools/${data.slug}`,
      };
    }

    return null;
  },

  async saveAdminDetailPage(form) {
    if (form._source === 'village') {
      return adminDbMutation(async () => {
        const stats = form.statistics || {};
        const impact = form.impact || {};
        const payload = {
          village_name: form.name,
          slug: form.slug || slugify(form.name),
          description: form.description || null,
          description_te: form.description_te || null,
          history: form.history || null,
          history_te: form.history_te || null,
          village_code: form.village_code || null,
          pincode: form.location?.pincode || null,
          short_description: null,
          cover_image: form.cover_image || null,
          population: stats.population ? Number(stats.population) : 0,
          male_population: stats.male_population ? Number(stats.male_population) : 0,
          female_population: stats.female_population ? Number(stats.female_population) : 0,
          literacy_rate: stats.literacy_rate ? Number(stats.literacy_rate) : null,
          farmer_count: stats.farmer_count ? Number(stats.farmer_count) : (impact.farmer_count ? Number(impact.farmer_count) : 0),
          cultivable_land: stats.cultivable_land || null,
          major_crops: stats.major_crops || null,
          trees_count: stats.trees_count ? Number(stats.trees_count) : (impact.trees_planted ? Number(impact.trees_planted) : 0),
          water_bodies_count: stats.water_bodies_count ? Number(stats.water_bodies_count) : (impact.water_bodies ? Number(impact.water_bodies) : 0),
          schools_count: impact.schools_count ? Number(impact.schools_count) : 0,
          projects_count: impact.projects_count ? Number(impact.projects_count) : 0,
          volunteers_count: impact.volunteers_count ? Number(impact.volunteers_count) : 0,
          vision: null,
          challenges: null,
          achievements: null,
          is_featured: form.featured !== false,
          is_active: form.status !== 'inactive',
        };
        const { error } = await supabase.from('villages').update(payload).eq('id', form.entity_id);
        if (error) throw error;
        await syncEntityBeforeAfter('village', form.entity_id, form.gallery);
        await syncVillageTimeline(form.entity_id, form.timeline);
        await syncVillageCrops(form.entity_id, form.crops);
        invalidateActiveWorkPublicCache();
        notifyPlatformDataChanged();
      });
    }

    if (form._source === 'school') {
      return adminDbMutation(async () => {
        const infra = form.infrastructure || {};
        const admin = form.administration || {};
        const impact = form.impact || {};
        const payload = {
          school_name: form.name,
          slug: form.slug || slugify(form.name),
          short_description: form.description || null,
          short_description_te: form.description_te || null,
          cover_image: form.cover_image || null,
          udise_code: form.statistics?.udise_code || null,
          principal_name: admin.principal_name || null,
          contact_number: admin.contact_number || null,
          email: admin.email || null,
          website: admin.website || null,
          student_count: Number(impact.students_count) || 0,
          teacher_count: Number(impact.teachers_count) || 0,
          classroom_count: Number(impact.classrooms) || 0,
          library_available: !!infra.library_available,
          computer_lab_available: !!infra.computer_lab_available,
          playground_available: !!infra.playground_available,
          drinking_water_available: !!infra.drinking_water_available,
          toilet_available: !!infra.toilet_available,
          electricity_available: !!infra.electricity_available,
          digital_classroom_available: !!infra.digital_classroom_available,
          boundary_wall_available: !!infra.boundary_wall_available,
          vision: null,
          challenges: null,
          achievements: null,
          is_featured: form.featured !== false,
          is_active: form.status !== 'inactive',
        };
        const { error } = await supabase.from('schools').update(payload).eq('id', form.entity_id);
        if (error) throw error;
        await syncEntityBeforeAfter('school', form.entity_id, form.gallery);
        await syncSchoolTimeline(form.entity_id, form.timeline);
        await syncSchoolRequirements(form.entity_id, form.requirements);
        invalidateActiveWorkPublicCache();
        notifyPlatformDataChanged();
      });
    }

    return this.saveItem({
      ...form,
      overview: {},
    });
  },
};
