import { supabase } from './supabaseClient';
import { adminDbMutation } from '@/lib/adminDb';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';
import { parseSettingsValue, serializeSettingsValue } from '@/lib/settingsStore';
import { PROGRAM_CATEGORY_OPTIONS } from '@/lib/activeWorkTemplates';

const STORE_KEY = 'needs_support_store';

export { PROGRAM_CATEGORY_OPTIONS };

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

function projectToAdminItem(p, index = 0) {
  const { funding_goal, raised_amount } = parseAmounts(p);
  return {
    id: `project-${p.id}`,
    _adminKey: `project:${p.id}`,
    _source: 'project',
    entity_id: p.id,
    project_id: p.id,
    name: p.project_name,
    slug: p.slug,
    cover_image: p.cover_image || '',
    description: p.short_description || '',
    village_name: p.villages?.village_name || '',
    village_slug: p.villages?.slug || '',
    funding_goal,
    raised_amount,
    status: p.status === 'active' ? 'active' : 'inactive',
    program_category: inferProgramCategory(p),
    display_order: index,
  };
}

function toCard(item, project) {
  const target = parseFloat(item.funding_goal ?? project?.budget_amount ?? project?.funding_goal ?? 0);
  const raised = parseFloat(item.raised_amount ?? project?.raised_amount ?? 0);
  const progress = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
  return {
    id: item.project_id || item.entity_id || item.id,
    slug: item.slug,
    project_name: item.name,
    title: item.name,
    cover_image: item.cover_image,
    featured_image: item.cover_image,
    short_description: item.description,
    progress,
    target,
    raised,
    villages: item.village_name ? { village_name: item.village_name, slug: item.village_slug } : project?.villages,
    _needsSupportId: item.id,
  };
}

async function fetchHomepageProjects(limit = 4) {
  const { data } = await supabase
    .from('projects')
    .select('*, villages(village_name, slug), project_categories(name, icon)')
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(8);

  return (data || [])
    .map((p) => {
      const { funding_goal, raised_amount } = parseAmounts(p);
      const progress = funding_goal > 0 ? Math.min(100, Math.round((raised_amount / funding_goal) * 100)) : 0;
      return { ...p, progress, funding_goal, raised_amount };
    })
    .sort((a, b) => (a.progress < 100 ? 0 : 1) - (b.progress < 100 ? 0 : 1) || a.progress - b.progress)
    .slice(0, limit);
}

function inferProgramCategory(project) {
  const name = `${project.project_name || ''} ${project.short_description || ''}`.toLowerCase();
  if (name.includes('tree') || name.includes('plantation')) return 'tree-plantation';
  if (name.includes('water') || name.includes('harvest')) return 'water-conservation';
  if (name.includes('school') || name.includes('classroom') || name.includes('digital')) return 'school-empowerment';
  if (name.includes('agri') || name.includes('farmer') || name.includes('seed')) return 'agriculture-development';
  if (name.includes('shg') || name.includes('women')) return 'women-shgs';
  if (name.includes('skill') || name.includes('training')) return 'skill-development';
  if (name.includes('health') || name.includes('medical')) return 'healthcare';
  return 'village-development';
}

function storeItemFromProject(p, index) {
  const { funding_goal, raised_amount } = parseAmounts(p);
  return {
    id: uid(),
    name: p.project_name,
    slug: p.slug,
    cover_image: p.cover_image || '',
    description: p.short_description || '',
    village_name: p.villages?.village_name || '',
    village_slug: p.villages?.slug || '',
    funding_goal,
    raised_amount,
    project_id: p.id,
    program_category: inferProgramCategory(p),
    status: 'active',
    display_order: index,
    _source: 'store',
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

  /** Import homepage projects into admin store when empty (one-time bootstrap) */
  async ensureSyncedFromProjects() {
    const store = await readStore();
    if ((store.items || []).length > 0) return store.items;

    const projects = await fetchHomepageProjects(4);
    if (!projects.length) return [];

    store.items = projects.map((p, i) => storeItemFromProject(p, i));
    await writeStore(store);
    return store.items;
  },

  /** All cards visible on homepage — store + live projects not yet in store */
  async listAllAdminItems() {
    await this.ensureSyncedFromProjects();
    const storeItems = (await this.listItems()).map((i) => ({
      ...i,
      _source: 'store',
      _adminKey: `store:${i.id}`,
    }));

    const linkedProjectIds = new Set(
      storeItems.filter((i) => i.project_id).map((i) => String(i.project_id)),
    );
    const projects = await fetchHomepageProjects(4);
    const merged = [...storeItems];

    for (const [index, p] of projects.entries()) {
      if (linkedProjectIds.has(String(p.id))) continue;
      if (storeItems.some((i) => i.slug === p.slug)) continue;
      merged.push(projectToAdminItem(p, storeItems.length + index));
    }

    return merged.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  },

  async saveItem(item) {
    const store = await readStore();
    const row = {
      id: item.id?.startsWith('project-') ? uid() : (item.id || uid()),
      name: item.name,
      slug: item.slug || slugify(item.name),
      cover_image: item.cover_image || '',
      description: item.description || '',
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

  /** Cards shown on homepage "Needs support now" section */
  async getHomepageItems(limit = 4) {
    const items = await this.listItems({ activeOnly: true });
    if (!items.length) {
      const projects = await fetchHomepageProjects(limit || 50);
      const mapped = projects.map((p, i) => toCard(projectToAdminItem(p, i), p));
      return limit ? mapped.slice(0, limit) : mapped;
    }

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
