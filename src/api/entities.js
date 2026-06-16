import { supabase } from './supabaseClient';

/**
 * Villages Service — CRUD + search + filters
 */
export const villagesService = {
  /**
   * List villages with optional filters
   */
  async list({ limit = 50, offset = 0, stateId, districtId, mandalId, featured, search, orderBy = 'created_at', ascending = false } = {}) {
    let query = supabase
      .from('villages')
      .select(`
        *,
        states(id, name, code),
        districts(id, name),
        mandals(id, name)
      `, { count: 'exact' })
      .is('deleted_at', null)
      .eq('is_active', true);

    if (stateId) query = query.eq('state_id', stateId);
    if (districtId) query = query.eq('district_id', districtId);
    if (mandalId) query = query.eq('mandal_id', mandalId);
    if (featured) query = query.eq('is_featured', true);
    if (search) {
      query = query.or(`village_name.ilike.%${search}%,short_description.ilike.%${search}%,pincode.ilike.%${search}%`);
    }

    query = query.order(orderBy, { ascending }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  /**
   * Get single village by slug
   */
  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('villages')
      .select(`
        *,
        states(id, name, code),
        districts(id, name),
        mandals(id, name),
        profiles!villages_primary_representative_id_fkey(id, full_name, profile_photo)
      `)
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Get village needs
   */
  async getNeeds(villageId) {
    const { data, error } = await supabase
      .from('village_needs')
      .select('*')
      .eq('village_id', villageId)
      .order('priority', { ascending: true });
    if (error) throw error;
    return data;
  },

  /**
   * Get schools in a village
   */
  async getSchools(villageId) {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('village_id', villageId)
      .eq('is_active', true)
      .is('deleted_at', null);
    if (error) throw error;
    return data;
  },

  /**
   * Get projects for a village
   */
  async getProjects(villageId) {
    const { data, error } = await supabase
      .from('projects')
      .select('*, project_categories(name, icon)')
      .eq('village_id', villageId)
      .is('deleted_at', null);
    if (error) throw error;
    return data;
  },

  /**
   * Get gallery for a village
   */
  async getGallery(villageId) {
    const { data, error } = await supabase
      .from('galleries')
      .select('*')
      .eq('galleryable_type', 'village')
      .eq('galleryable_id', villageId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  /**
   * Get activity timeline for a village
   */
  async getTimeline(villageId) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('loggable_type', 'village')
      .eq('loggable_id', villageId)
      .order('activity_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  /**
   * Follow / unfollow a village
   */
  async follow(villageId, userId) {
    const { error } = await supabase
      .from('village_followers')
      .insert({ village_id: villageId, user_id: userId });
    if (error) throw error;
  },

  async unfollow(villageId, userId) {
    const { error } = await supabase
      .from('village_followers')
      .delete()
      .eq('village_id', villageId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  async isFollowing(villageId, userId) {
    const { data, error } = await supabase
      .from('village_followers')
      .select('id')
      .eq('village_id', villageId)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) return false;
    return !!data;
  },

  /**
   * Admin: create village
   */
  async create(villageData) {
    const { data, error } = await supabase.from('villages').insert(villageData).select().single();
    if (error) throw error;
    return data;
  },

  /**
   * Admin: update village
   */
  async update(id, updates) {
    const { data, error } = await supabase.from('villages').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  /**
   * Admin: soft delete village
   */
  async delete(id) {
    const { error } = await supabase.from('villages').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  },
};

/**
 * Schools Service
 */
export const schoolsService = {
  async list({ limit = 50, offset = 0, villageId, schoolType, search, orderBy = 'created_at', ascending = false } = {}) {
    let query = supabase
      .from('schools')
      .select(`
        *,
        villages(id, village_name, slug, states(name), districts(name))
      `, { count: 'exact' })
      .is('deleted_at', null)
      .eq('is_active', true);

    if (villageId) query = query.eq('village_id', villageId);
    if (schoolType) query = query.eq('school_type', schoolType);
    if (search) {
      query = query.or(`school_name.ilike.%${search}%,udise_code.ilike.%${search}%`);
    }

    query = query.order(orderBy, { ascending }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('schools')
      .select(`
        *,
        villages(id, village_name, slug, states(name), districts(name), mandals(name))
      `)
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();
    if (error) throw error;
    return data;
  },

  async getRequirements(schoolId) {
    const { data, error } = await supabase
      .from('school_requirements')
      .select('*')
      .eq('school_id', schoolId)
      .order('priority', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getGallery(schoolId) {
    const { data, error } = await supabase
      .from('galleries')
      .select('*')
      .eq('galleryable_type', 'school')
      .eq('galleryable_id', schoolId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getTimeline(schoolId) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('loggable_type', 'school')
      .eq('loggable_id', schoolId)
      .order('activity_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async follow(schoolId, userId) {
    const { error } = await supabase.from('school_followers').insert({ school_id: schoolId, user_id: userId });
    if (error) throw error;
  },

  async unfollow(schoolId, userId) {
    const { error } = await supabase.from('school_followers').delete().eq('school_id', schoolId).eq('user_id', userId);
    if (error) throw error;
  },

  async create(data) {
    const { data: result, error } = await supabase.from('schools').insert(data).select().single();
    if (error) throw error;
    return result;
  },

  async update(id, updates) {
    const { data, error } = await supabase.from('schools').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('schools').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  },
};

/**
 * Projects Service
 */
export const projectsService = {
  async list({ limit = 50, offset = 0, categoryId, villageId, status, search, orderBy = 'created_at', ascending = false } = {}) {
    let query = supabase
      .from('projects')
      .select(`
        *,
        project_categories(id, name, slug, icon),
        villages(id, village_name, slug, states(name))
      `, { count: 'exact' })
      .is('deleted_at', null);

    if (categoryId) query = query.eq('project_category_id', categoryId);
    if (villageId) query = query.eq('village_id', villageId);
    if (status) query = query.eq('status', status);
    if (search) {
      query = query.or(`project_name.ilike.%${search}%,short_description.ilike.%${search}%`);
    }

    query = query.order(orderBy, { ascending }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_categories(id, name, slug, icon),
        villages(id, village_name, slug, states(name), districts(name)),
        schools(id, school_name, slug)
      `)
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();
    if (error) throw error;
    return data;
  },

  async getUpdates(projectId) {
    const { data, error } = await supabase
      .from('project_updates')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getCategories() {
    const { data, error } = await supabase.from('project_categories').select('*').order('name');
    if (error) throw error;
    return data;
  },

  async create(projectData) {
    const { data, error } = await supabase.from('projects').insert(projectData).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('projects').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  },
};

/**
 * Donations Service
 */
export const donationsService = {
  async create(donationData) {
    const { data, error } = await supabase.from('donations').insert(donationData).select().single();
    if (error) throw error;
    return data;
  },

  async getMyDonations(userId) {
    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        villages(id, village_name),
        schools(id, school_name),
        projects(id, project_name),
        donation_receipts(id, receipt_number, receipt_path)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        villages(id, village_name),
        schools(id, school_name),
        projects(id, project_name),
        donation_receipts(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
};

/**
 * Volunteers Service
 */
export const volunteersService = {
  async register(volunteerData) {
    const { data, error } = await supabase.from('volunteers').insert(volunteerData).select().single();
    if (error) throw error;
    return data;
  },

  async getProfile(userId) {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase.from('volunteers').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async getActivities(volunteerId) {
    const { data, error } = await supabase
      .from('volunteer_activities')
      .select('*, projects(id, project_name)')
      .eq('volunteer_id', volunteerId)
      .order('activity_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async list({ limit = 50, offset = 0 } = {}) {
    const { data, error, count } = await supabase
      .from('volunteers')
      .select('*, profiles(full_name, profile_photo)', { count: 'exact' })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return { data, count };
  },
};
