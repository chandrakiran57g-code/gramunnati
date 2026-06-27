import { supabase } from './supabaseClient';
import { adminDbMutation } from '@/lib/adminDb';
import { DEFAULT_NAV_CONFIG } from '@/lib/navConfig';

/**
 * CMS Service — Pages, Programs, News, Events, Stories, FAQs, Testimonials
 */
export const cmsService = {
  // ─── CMS Pages ─────────────────────────
  async getPage(slug) {
    const { data, error } = await supabase
      .from('cms_pages')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async listPages({ publishedOnly = false } = {}) {
    let query = supabase.from('cms_pages').select('*').order('display_order', { ascending: true });
    if (publishedOnly) query = query.eq('status', 'active');
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async listPublishedPages() {
    return this.listPages({ publishedOnly: true });
  },

  async createPage(pageData) {
    return adminDbMutation(async () => {
      const { data, error } = await supabase.from('cms_pages').insert(pageData).select().single();
      if (error) throw error;
      return data;
    });
  },

  async updatePage(id, updates) {
    return adminDbMutation(async () => {
      const { data, error } = await supabase.from('cms_pages').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    });
  },

  async deletePage(id) {
    return adminDbMutation(async () => {
      const { error } = await supabase.from('cms_pages').delete().eq('id', id);
      if (error) throw error;
    });
  },

  async getCmsNavGroups() {
    const raw = await this.getSetting('cms_nav_groups');
    if (!raw) return {};
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      return {};
    }
  },

  async setPageNavGroup(pageId, navGroup) {
    return adminDbMutation(async () => {
      const groups = await this.getCmsNavGroups();
      groups[pageId] = navGroup;
      const { error } = await supabase.from('settings').upsert(
        { key: 'cms_nav_groups', value: JSON.stringify(groups) },
        { onConflict: 'key' }
      );
      if (error) throw error;
    });
  },

  async removePageNavGroup(pageId) {
    return adminDbMutation(async () => {
      const groups = await this.getCmsNavGroups();
      delete groups[pageId];
      const { error } = await supabase.from('settings').upsert(
        { key: 'cms_nav_groups', value: JSON.stringify(groups) },
        { onConflict: 'key' }
      );
      if (error) throw error;
    });
  },

  async getNavConfig() {
    const raw = await this.getSetting('nav_config');
    if (!raw) return DEFAULT_NAV_CONFIG;
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return parsed?.items?.length ? parsed : DEFAULT_NAV_CONFIG;
    } catch {
      return DEFAULT_NAV_CONFIG;
    }
  },

  async saveNavConfig(config) {
    return adminDbMutation(async () => {
      const { error } = await supabase.from('settings').upsert(
        { key: 'nav_config', value: JSON.stringify(config) },
        { onConflict: 'key' }
      );
      if (error) throw error;
    });
  },

  async listPrograms({ activeOnly = false } = {}) {
    let query = supabase.from('programs').select('*').order('sort_order', { ascending: true });
    if (activeOnly) query = query.eq('status', 'active');
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createProgram(data) {
    return adminDbMutation(async () => {
      const { data: row, error } = await supabase.from('programs').insert(data).select().single();
      if (error) throw error;
      return row;
    });
  },

  async updateProgram(id, updates) {
    return adminDbMutation(async () => {
      const { data, error } = await supabase.from('programs').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    });
  },

  async deleteProgram(id) {
    return adminDbMutation(async () => {
      const { error } = await supabase.from('programs').delete().eq('id', id);
      if (error) throw error;
    });
  },

  async listTeamGroups({ activeOnly = false } = {}) {
    let query = supabase.from('team_groups').select('*, team_members(*)').order('display_order', { ascending: true });
    if (activeOnly) query = query.eq('status', 'active');
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createTeamGroup(data) {
    return adminDbMutation(async () => {
      const { data: row, error } = await supabase.from('team_groups').insert(data).select().single();
      if (error) throw error;
      return row;
    });
  },

  async updateTeamGroup(id, updates) {
    return adminDbMutation(async () => {
      const { data, error } = await supabase.from('team_groups').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    });
  },

  async deleteTeamGroup(id) {
    return adminDbMutation(async () => {
      const { error } = await supabase.from('team_groups').delete().eq('id', id);
      if (error) throw error;
    });
  },

  async createTeamMember(data) {
    return adminDbMutation(async () => {
      const { data: row, error } = await supabase.from('team_members').insert(data).select().single();
      if (error) throw error;
      return row;
    });
  },

  async updateTeamMember(id, updates) {
    return adminDbMutation(async () => {
      const { data, error } = await supabase.from('team_members').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    });
  },

  async deleteTeamMember(id) {
    return adminDbMutation(async () => {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
    });
  },

  async updateSettings(settingsObj) {
    return adminDbMutation(async () => {
      const rows = Object.entries(settingsObj).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''),
      }));
      const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' });
      if (error) throw error;
    });
  },

  async getProgram(slug) {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  },

  // ─── News ──────────────────────────────
  async listNews({ limit = 20, offset = 0, publishedOnly = false } = {}) {
    let query = supabase
      .from('news')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (publishedOnly) query = query.eq('is_published', true);

    const { data, error, count } = await query
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return { data, count };
  },

  async getNewsItem(slug) {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();
    if (error) throw error;
    return data;
  },

  // ─── Events ────────────────────────────
  async listEvents({ limit = 20, offset = 0, upcoming = false, publishedOnly = false } = {}) {
    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (publishedOnly) query = query.eq('is_published', true);
    if (upcoming) query = query.gte('start_date', new Date().toISOString());

    query = query.order('start_date', { ascending: upcoming }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  async getEvent(slug) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();
    if (error) throw error;
    return data;
  },

  // ─── Success Stories ───────────────────
  async listStories({ limit = 20, offset = 0, featured } = {}) {
    let query = supabase
      .from('success_stories')
      .select('*, villages(village_name), schools(school_name)', { count: 'exact' })
      .is('deleted_at', null);

    if (featured) query = query.eq('is_featured', true);

    query = query.order('published_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  async getStory(slug) {
    const { data, error } = await supabase
      .from('success_stories')
      .select('*, villages(village_name, slug), schools(school_name, slug)')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();
    if (error) throw error;
    return data;
  },

  // ─── FAQs ─────────────────────────────
  async listFaqs() {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  // ─── Testimonials ─────────────────────
  async listTestimonials({ featured } = {}) {
    let query = supabase.from('testimonials').select('*');
    if (featured) query = query.eq('is_featured', true);
    query = query.order('sort_order', { ascending: true });
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // ─── Teams ────────────────────────────
  async listTeamGroupsPublic() {
    return this.listTeamGroups({ activeOnly: true });
  },

  async getTeamGroup(slug) {
    const { data, error } = await supabase
      .from('team_groups')
      .select('*, team_members(*)')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  },

  // ─── Partners ─────────────────────────
  async listPartners() {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getPartner(slug) {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  },

  // ─── Beneficiaries ────────────────────
  async listBeneficiaries() {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*, villages(village_name), schools(school_name)')
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getBeneficiary(slug) {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*, villages(village_name, slug), schools(school_name, slug)')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  },

  // ─── Contact Messages ─────────────────
  async submitContact(messageData) {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert(messageData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ─── Gallery ──────────────────────────
  async listGallery({ type, limit = 50 } = {}) {
    let query = supabase.from('galleries').select('*');
    if (type) query = query.eq('galleryable_type', type);
    query = query.order('sort_order', { ascending: true }).limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // ─── Settings ─────────────────────────
  async getSettings() {
    const { data, error } = await supabase.from('settings').select('key, value');
    if (error) throw error;
    // Convert array to key-value object
    return data?.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}) || {};
  },

  async getSetting(key) {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    if (error) return null;
    return data?.value ?? null;
  },

  // ─── Impact Metrics ───────────────────
  async getImpactMetrics() {
    const { data, error } = await supabase.from('impact_metrics').select('*');
    if (error) throw error;
    return data;
  },
};

/**
 * Geography Service — States, Districts, Mandals
 */
export const geographyService = {
  async listStates() {
    const { data, error } = await supabase
      .from('states')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return data;
  },

  async listDistricts(stateId) {
    const { data, error } = await supabase
      .from('districts')
      .select('*')
      .eq('state_id', stateId)
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return data;
  },

  async listMandals(districtId) {
    const { data, error } = await supabase
      .from('mandals')
      .select('*')
      .eq('district_id', districtId)
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return data;
  },
};

/**
 * Search Service — Global search across entities
 */
export const searchService = {
  async search(query, { limit = 20 } = {}) {
    const searchTerm = `%${query}%`;

    const [villages, schools, projects, programs, news] = await Promise.allSettled([
      supabase.from('villages').select('id, village_name, slug, short_description, cover_image, states(name)')
        .ilike('village_name', searchTerm).is('deleted_at', null).limit(limit),
      supabase.from('schools').select('id, school_name, slug, school_type, cover_image, villages(village_name)')
        .ilike('school_name', searchTerm).is('deleted_at', null).limit(limit),
      supabase.from('projects').select('id, project_name, slug, short_description, cover_image, status')
        .ilike('project_name', searchTerm).is('deleted_at', null).limit(limit),
      supabase.from('programs').select('id, title, slug, description, icon')
        .ilike('title', searchTerm).limit(limit),
      supabase.from('news').select('id, title, slug, featured_image, published_at')
        .ilike('title', searchTerm).is('deleted_at', null).limit(limit),
    ]);

    return {
      villages: villages.status === 'fulfilled' ? villages.value.data || [] : [],
      schools: schools.status === 'fulfilled' ? schools.value.data || [] : [],
      projects: projects.status === 'fulfilled' ? projects.value.data || [] : [],
      programs: programs.status === 'fulfilled' ? programs.value.data || [] : [],
      news: news.status === 'fulfilled' ? news.value.data || [] : [],
    };
  },
};

/**
 * Notifications Service
 */
export const notificationsService = {
  async list(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async markAsRead(id) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async markAllAsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
  },

  async getUnreadCount(userId) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) return 0;
    return count || 0;
  },
};
