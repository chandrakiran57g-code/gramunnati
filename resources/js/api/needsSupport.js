import { supabase } from './supabaseClient';
import { adminDbMutation } from '@/lib/adminDb';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';
import { parseSettingsValue, serializeSettingsValue } from '@/lib/settingsStore';
import { PROGRAM_CATEGORY_OPTIONS, loadProgramCategoryOptions, clearProgramCategoryCache } from '@/lib/programCategoryOptions';

const STORE_KEY = 'needs_support_store';

export { PROGRAM_CATEGORY_OPTIONS, loadProgramCategoryOptions, clearProgramCategoryCache };

function slugify(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function uid() {
  return `ns-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readStore() {
  const { data } = await supabase.from('settings').select('value').eq('key', STORE_KEY).maybeSingle();
  const parsed = parseSettingsValue(data?.value);
  if (parsed && typeof parsed === 'object') return parsed;
  return { items: [] };
}

async function writeStore(store) {
  return adminDbMutation(async () => {
    const { error } = await supabase.from('settings').upsert(
      { key: STORE_KEY, value: serializeSettingsValue(store) },
      { onConflict: 'key' },
    );
    if (error) throw error;
    notifyPlatformDataChanged({ type: 'needs_support' });
  });
}

function parseAmounts(p) {
  const funding_goal = parseFloat(p.budget_amount || p.funding_goal || p.target_amount || 0);
  const raised_amount = parseFloat(p.raised_amount || p.amount_raised || 0);
  return { funding_goal, raised_amount };
}

function toCard(item, project) {
  const target = parseFloat(item.funding_goal ?? project?.budget_amount ?? project?.funding_goal ?? 0);
  const raised = parseFloat(item.raised_amount ?? project?.raised_amount ?? 0);
  const progress = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
  return {
    id: item.project_id || item.entity_id || item.id,
    slug: item.slug,
    project_name: item.name,
    project_name_te: item.name_te,
    name: item.name,
    name_te: item.name_te,
    title: item.name,
    title_te: item.name_te,
    cover_image: item.cover_image,
    featured_image: item.cover_image,
    short_description: item.description,
    short_description_te: item.description_te,
    description: item.description,
    description_te: item.description_te,
    progress,
    target,
    raised,
    villages: item.village_name ? { village_name: item.village_name, slug: item.village_slug } : project?.villages,
    _needsSupportId: item.id,
  };
}

export const needsSupportService = {
  async getStore() {
    return readStore();
  },

  async listItems({ activeOnly = false, programCategory = null } = {}) {
    const store = await readStore();
    let items = store.items || [];
    if (activeOnly) items = items.filter((i) => i.status === 'active');
    if (programCategory) items = items.filter((i) => i.program_category === programCategory);
    items = items.filter((i) => String(i.name || '').trim().length >= 2);
    return items.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  },

  /** All admin cards — store is the single source of truth (no auto-import of projects) */
  async listAllAdminItems() {
    const storeItems = (await this.listItems()).map((i) => ({
      ...i,
      _source: 'store',
      _adminKey: `store:${i.id}`,
    }));
    return storeItems.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  },

  async saveItem(item) {
    const store = await readStore();
    const row = {
      id: item.id?.startsWith('project-') ? uid() : (item.id || uid()),
      name: item.name,
      name_te: item.name_te || '',
      slug: item.slug || slugify(item.name),
      cover_image: item.cover_image || '',
      description: item.description || '',
      description_te: item.description_te || '',
      village_name: item.village_name || '',
      village_slug: item.village_slug || '',
      funding_goal: Number(item.funding_goal) || 0,
      raised_amount: Number(item.raised_amount) || 0,
      project_id: item.project_id || item.entity_id || null,
      program_category: item.program_category || '',
      status: item.status || 'active',
      display_order: Number(item.display_order) || 0,
    };

    const idx = store.items.findIndex(
      (i) => (item.id && i.id === item.id) || (row.project_id && i.project_id === row.project_id),
    );
    if (idx >= 0) {
      row.id = store.items[idx].id;
      store.items[idx] = row;
    } else {
      store.items.push(row);
    }

    await writeStore(store);

    if (row.project_id) {
      await adminDbMutation(async () => {
        const { error } = await supabase
          .from('projects')
          .update({
            project_name: row.name,
            slug: row.slug,
            short_description: row.description || null,
            cover_image: row.cover_image || null,
            budget_amount: row.funding_goal,
            raised_amount: row.raised_amount,
            status: row.status === 'active' ? 'active' : 'cancelled',
          })
          .eq('id', row.project_id);
        if (error) throw error;
        notifyPlatformDataChanged();
      });
    }

    return row;
  },

  async saveAdminItem(item) {
    if (item._source === 'project' && item.entity_id) {
      const store = await readStore();
      const existing = store.items.find((i) => String(i.project_id) === String(item.entity_id));
      return this.saveItem({ ...item, id: existing?.id, project_id: item.entity_id });
    }
    return this.saveItem(item);
  },

  async deleteItem(id) {
    const store = await readStore();
    store.items = store.items.filter((i) => i.id !== id);
    await writeStore(store);
  },

  async deleteAdminItem(item) {
    if (item._source === 'project' && item.entity_id) {
      return adminDbMutation(async () => {
        const { error } = await supabase
          .from('projects')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', item.entity_id);
        if (error) throw error;
        notifyPlatformDataChanged();
      });
    }
    return this.deleteItem(item.id);
  },

  /** Cards shown on homepage "Needs support now" section — admin-curated only */
  async getHomepageItems(limit = 4) {
    const items = await this.listItems({ activeOnly: true });
    if (!items.length) return [];

    const projectIds = items.filter((i) => i.project_id).map((i) => i.project_id);
    let projectsMap = {};
    if (projectIds.length) {
      const { data } = await supabase
        .from('projects')
        .select('*, villages(village_name, slug)')
        .in('id', projectIds);
      (data || []).forEach((p) => {
        projectsMap[p.id] = p;
      });
    }

    const mapped = items.map((item) => toCard(item, projectsMap[item.project_id]));
    return limit ? mapped.slice(0, limit) : mapped;
  },
};
