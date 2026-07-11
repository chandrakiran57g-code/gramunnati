/**
 * Base44 Compatibility Layer
 * 
 * This module provides a drop-in replacement for `base44.entities.X` calls
 * used throughout the codebase. Instead of rewriting every page individually,
 * this shim maps the old Base44 entity API to Supabase queries.
 * 
 * Usage: Replace `import { base44 } from '@/api/base44Client'` with
 *        `import { base44 } from '@/api/base44Compat'`
 */

import { supabase } from './supabaseClient';
import { ensureAdminDbAccess } from '@/lib/adminDb';
import { notifyPlatformDataChanged } from '@/lib/platformRefresh';

// Helper: build a query proxy for any table
function createEntityProxy(tableName, { slugField = 'slug', nameField = 'name', defaultSelect = '*', softDelete = false } = {}) {
  return {
    /**
     * List records — mirrors base44.entities.X.list(sortField, limit)
     */
    async list(sortField, limit = 50) {
      let query = supabase.from(tableName).select(defaultSelect);
      if (softDelete) query = query.is('deleted_at', null);

      // Parse sort field: '-created_date' → order by created_at desc
      if (sortField) {
        const ascending = !sortField.startsWith('-');
        let col = sortField.replace(/^-/, '');
        // Map common Base44 field names to Supabase column names
        const fieldMap = {
          'created_date': 'created_at',
          'updated_date': 'updated_at',
          'sort_order': 'sort_order',
          'display_order': 'display_order',
          'name': nameField,
        };
        col = fieldMap[col] || col;
        query = query.order(col, { ascending });
      }
      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) { console.error(`Error listing ${tableName}:`, error); return []; }
      return data || [];
    },

    /**
     * Filter records — mirrors base44.entities.X.filter(filters, sortField, limit)
     */
    async filter(filters = {}, sortField, limit = 50) {
      let query = supabase.from(tableName).select(defaultSelect);
      if (softDelete) query = query.is('deleted_at', null);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });

      if (sortField) {
        const ascending = !sortField.startsWith('-');
        let col = sortField.replace(/^-/, '');
        const fieldMap = { 'created_date': 'created_at', 'updated_date': 'updated_at' };
        col = fieldMap[col] || col;
        query = query.order(col, { ascending });
      }
      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) { console.error(`Error filtering ${tableName}:`, error); return []; }
      return data || [];
    },

    /**
     * Get single record — mirrors base44.entities.X.get(id)
     */
    async get(id) {
      // Try by numeric id first, then by slug
      let query;
      if (typeof id === 'number' || /^\d+$/.test(id)) {
        query = supabase.from(tableName).select(defaultSelect).eq('id', id);
      } else {
        query = supabase.from(tableName).select(defaultSelect).eq(slugField, id);
      }
      if (softDelete) query = query.is('deleted_at', null);

      const { data, error } = await query.single();
      if (error) { console.error(`Error getting ${tableName}:`, error); return null; }
      return data;
    },

    /**
     * Create record — mirrors base44.entities.X.create(data)
     */
    async create(recordData) {
      await ensureAdminDbAccess();
      const { data, error } = await supabase.from(tableName).insert(recordData).select().single();
      if (error) throw error;
      notifyPlatformDataChanged({ table: tableName, action: 'create' });
      return data;
    },

    /**
     * Update record — mirrors base44.entities.X.update(id, data)
     */
    async update(id, updates) {
      await ensureAdminDbAccess();
      const { data, error } = await supabase.from(tableName).update(updates).eq('id', id).select().single();
      if (error) throw error;
      notifyPlatformDataChanged({ table: tableName, action: 'update' });
      return data;
    },

    /**
     * Delete record — mirrors base44.entities.X.delete(id)
     */
    async delete(id) {
      await ensureAdminDbAccess();
      if (softDelete) {
        const { error } = await supabase.from(tableName).update({ deleted_at: new Date().toISOString() }).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (error) throw error;
      }
      notifyPlatformDataChanged({ table: tableName, action: 'delete' });
    },
  };
}

// ─── Entity Proxies ─────────────────────
const entities = {
  Village: createEntityProxy('villages', {
    slugField: 'slug',
    nameField: 'village_name',
    defaultSelect: '*, states(id, name, code), districts(id, name), mandals(id, name)',
    softDelete: true,
  }),

  School: createEntityProxy('schools', {
    slugField: 'slug',
    nameField: 'school_name',
    defaultSelect: '*, villages(id, village_name, slug, states(name), districts(name))',
    softDelete: true,
  }),

  Project: createEntityProxy('projects', {
    slugField: 'slug',
    nameField: 'project_name',
    defaultSelect: '*, project_categories(id, name, slug, icon), villages(id, village_name, slug, states(name))',
    softDelete: true,
  }),

  Program: createEntityProxy('programs', {
    slugField: 'slug',
    nameField: 'title',
    defaultSelect: '*',
  }),

  Donation: createEntityProxy('donations', {
    defaultSelect: '*, villages(id, village_name), schools(id, school_name), projects(id, project_name)',
  }),

  Volunteer: createEntityProxy('volunteers', {
    defaultSelect: '*, profiles(id, full_name, profile_photo, mobile)',
  }),

  CmsPage: createEntityProxy('cms_pages', {
    slugField: 'slug',
    nameField: 'title',
  }),

  TeamGroup: createEntityProxy('team_groups', {
    slugField: 'slug',
    nameField: 'name',
    defaultSelect: '*, team_members(*)',
  }),

  TeamMember: createEntityProxy('team_members', {
    nameField: 'full_name',
  }),

  NewsItem: createEntityProxy('news', {
    slugField: 'slug',
    nameField: 'title',
    softDelete: true,
  }),

  EventItem: createEntityProxy('events', {
    slugField: 'slug',
    nameField: 'title',
    softDelete: true,
  }),

  SuccessStory: createEntityProxy('success_stories', {
    slugField: 'slug',
    nameField: 'title',
    defaultSelect: '*, villages(village_name, slug), schools(school_name, slug)',
    softDelete: true,
  }),

  Partner: createEntityProxy('partners', {
    slugField: 'slug',
    nameField: 'name',
  }),

  Beneficiary: createEntityProxy('beneficiaries', {
    slugField: 'slug',
    nameField: 'name',
    defaultSelect: '*, villages(village_name), schools(school_name)',
  }),

  ContactMessage: {
    async create(recordData) {
      const payload = {
        name: recordData.name,
        email: recordData.email,
        mobile: recordData.mobile || null,
        subject: recordData.subject,
        message: recordData.message,
        status: 'new',
      };
      const { data, error } = await supabase.from('contact_messages').insert(payload).select().single();
      if (error) throw error;
      notifyPlatformDataChanged({ table: 'contact_messages', action: 'create' });
      return data;
    },
    list: (...args) => createEntityProxy('contact_messages').list(...args),
    filter: (...args) => createEntityProxy('contact_messages').filter(...args),
    get: (...args) => createEntityProxy('contact_messages').get(...args),
    update: (...args) => createEntityProxy('contact_messages').update(...args),
    delete: (...args) => createEntityProxy('contact_messages').delete(...args),
  },

  Follow: {
    async list() { return []; },
    async filter(filters) {
      if (filters.user_id && (filters.type === 'village' || filters.followable_type === 'village')) {
        const { data } = await supabase.from('village_followers').select('*, villages(*)').eq('user_id', filters.user_id);
        return (data || []).map((row) => ({
          ...row,
          followable_id: row.village_id,
          followable_type: 'village',
        }));
      }
      if (filters.user_id && (filters.type === 'school' || filters.followable_type === 'school')) {
        const { data } = await supabase.from('school_followers').select('*, schools(*)').eq('user_id', filters.user_id);
        return (data || []).map((row) => ({
          ...row,
          followable_id: row.school_id,
          followable_type: 'school',
        }));
      }
      return [];
    },
    async create(data) {
      if (data.type === 'village') {
        await supabase.from('village_followers').insert({ village_id: data.entity_id, user_id: data.user_id });
      } else if (data.type === 'school') {
        await supabase.from('school_followers').insert({ school_id: data.entity_id, user_id: data.user_id });
      }
    },
    async delete(id) {
      await supabase.from('village_followers').delete().eq('id', id);
      await supabase.from('school_followers').delete().eq('id', id);
    },
  },

  User: {
    async list(sort, limit) { 
      const { data } = await supabase.from('profiles').select('*').limit(limit || 50);
      return data || [];
    },
    async filter(filters, sort, limit) {
      let query = supabase.from('profiles').select('*');
      Object.entries(filters).forEach(([k, v]) => { if (v) query = query.eq(k, v); });
      const { data } = await query.limit(limit || 50);
      return data || [];
    },
    async get(id) {
      const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
      return data;
    },
    async update(id, updates) {
      const { data } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
      return data;
    },
  },
};

// ─── Auth Compatibility ─────────────────
const auth = {
  async me() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    return { ...user, ...profile, email: user.email };
  },
  async loginViaEmailPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async register({ email, password }) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },
  loginWithProvider(provider, redirectTo) {
    supabase.auth.signInWithOAuth({ provider, options: { redirectTo: redirectTo || window.location.origin } });
  },
  logout(redirectTo) {
    supabase.auth.signOut().then(() => {
      if (redirectTo) window.location.href = redirectTo;
    });
  },
  setToken() { /* no-op, Supabase handles tokens */ },
  async verifyOtp() { /* handled by Supabase */ },
  async resendOtp() { /* handled by Supabase */ },
  redirectToLogin(returnUrl) {
    window.location.href = `/login?returnTo=${encodeURIComponent(returnUrl || '/')}`;
  },
};

// ─── Export as `base44` for backward compat ─
export const base44 = { entities, auth };
