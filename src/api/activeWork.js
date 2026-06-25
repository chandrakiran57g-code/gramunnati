import { supabase } from './supabaseClient';
import { adminDbMutation } from '@/lib/adminDb';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';

const STORE_KEY = 'active_work_store';

const DEFAULT_CATEGORIES = [
  { id: 'cat-villages', name: 'Active Villages', slug: 'active-villages', view_all_link: '/villages', display_order: 0, status: 'active', entity_type: 'village' },
  { id: 'cat-schools', name: 'Active Schools', slug: 'active-schools', view_all_link: '/schools', display_order: 1, status: 'active', entity_type: 'school' },
];

function slugify(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function readStore() {
  const { data } = await supabase.from('settings').select('value').eq('key', STORE_KEY).maybeSingle();
  if (data?.value) {
    try { return JSON.parse(data.value); } catch { /* fall through */ }
  }
  return { categories: DEFAULT_CATEGORIES, items: [] };
}

async function writeStore(store) {
  return adminDbMutation(async () => {
    const { error } = await supabase.from('settings').upsert(
      { key: STORE_KEY, value: JSON.stringify(store) },
      { onConflict: 'key' }
    );
    if (error) throw error;
    notifyPlatformDataChanged();
  });
}

function uid() {
  return `aw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const activeWorkService = {
  async getStore() {
    return readStore();
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
    return items.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  },

  async getItem(slug) {
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
  async getHomeSections() {
    const categories = await this.listCategories({ activeOnly: true });
    const sections = [];

    for (const cat of categories) {
      let items = [];

      const cmsItems = await this.listItems({ categoryId: cat.id, activeOnly: true });

      if (cat.entity_type) {
        const entityItems = await this._entityCards(cat, 3);
        if (cmsItems.length > 0) {
          const seen = new Set(cmsItems.map((i) => String(i.id)));
          items = [...cmsItems];
          for (const row of entityItems) {
            if (items.length >= 3) break;
            if (!seen.has(String(row.id))) items.push(row);
          }
        } else {
          items = entityItems;
        }
      } else {
        items = cmsItems;
      }

      items = items.slice(0, 3);
      if (items.length > 0) sections.push({ category: cat, items });
    }

    return sections;
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
        description: v.short_description,
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
        description: s.short_description,
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
        description: p.short_description,
        badge: p.is_featured ? 'Featured' : 'Active',
        category_id: cat.id,
        link: `/projects/${p.slug}`,
        donate_link: `/donate?project_id=${p.id}`,
        card: { enable_donate: true, enable_details: true },
      }));
    }
    return [];
  },
};
