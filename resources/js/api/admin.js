import { supabase } from './supabaseClient';
import { apiFetch, ensureCsrf } from './apiClient';
import { adminDbMutation, ensureAdminDbAccess } from '@/lib/adminDb';
import { ensureSanctumAdminSession } from '@/lib/sanctumSession';

const PROJECT_CHART_COLORS = ['#2D6A4F', '#2563EB', '#22C55E', '#06B6D4', '#EF4444', '#6B7280', '#F59E0B', '#8B5CF6'];

function monthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(date) {
  return new Date(date).toLocaleString('en-IN', { month: 'short' });
}

/**
 * Gallery / Storage Service — Laravel public disk for file uploads
 */
const BASE64_FALLBACK_MAX_BYTES = 12 * 1024 * 1024;
/** Prefer base64 for smaller files — avoids broken multipart uploads on many cPanel hosts. */
const BASE64_PREFERRED_MAX_BYTES = 6 * 1024 * 1024;

async function fileToBase64(file) {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function uploadViaBase64(bucket, file, path = '') {
  const data = await fileToBase64(file);
  const json = await apiFetch('/admin/upload-base64', {
    method: 'POST',
    body: {
      filename: file.name || 'upload.bin',
      data,
      bucket: bucket || 'uploads',
      path: path || '',
      mime: file.type || undefined,
    },
  });
  const url = json?.url || json?.publicUrl;
  if (!url) throw new Error('Upload failed — no URL returned from server');
  return { path: json.path, url };
}

export const galleryService = {
  /**
   * Upload image or video to storage
   * @param {string} bucket - 'avatars' | 'villages' | 'schools' | 'projects' | 'gallery' | 'documents'
   * @param {File} file - The file object
   * @param {string} path - Optional subfolder path
   */
  async uploadFile(bucket, file, path = '') {
    await ensureSanctumAdminSession();
    await ensureCsrf();

    const isVideo = /^video\//i.test(file?.type || '') || /\.(mp4|webm|mov|m4v|mkv|avi)$/i.test(file?.name || '');
    const maxBytes = isVideo ? 500 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file?.size > maxBytes) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      const cap = (maxBytes / (1024 * 1024)).toFixed(0);
      throw new Error(
        isVideo
          ? `Video is ${mb}MB (max ${cap}MB). Compress it or paste a YouTube link instead.`
          : `Image is ${mb}MB (max ${cap}MB). Use a smaller file or paste an image URL.`
      );
    }

    const fd = new FormData();
    fd.append('file', file);
    fd.append('bucket', bucket || 'uploads');
    fd.append('path', path || '');

    const tryBase64 = file?.size > 0 && file.size <= BASE64_FALLBACK_MAX_BYTES;
    const preferBase64 = file?.size > 0 && file.size <= BASE64_PREFERRED_MAX_BYTES;

    if (preferBase64) {
      try {
        return await uploadViaBase64(bucket, file, path);
      } catch {
        /* fall through to multipart */
      }
    }

    try {
      const json = await apiFetch('/upload', { method: 'POST', body: fd });
      const url = json?.url || json?.publicUrl;
      if (!url) throw new Error('Upload failed — no URL returned from server');
      return { path: json.path, url };
    } catch (err) {
      if (!tryBase64 || preferBase64) throw err;

      return uploadViaBase64(bucket, file, path);
    }
  },

  /**
   * Delete a file from storage
   */
  async deleteFile(bucket, path) {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },

  /**
   * Upload profile photo
   */
  async uploadAvatar(file, userId) {
    return this.uploadFile('avatars', file, userId);
  },

  /**
   * Upload village image
   */
  async uploadVillageImage(file, villageId) {
    return this.uploadFile('villages', file, `${villageId}`);
  },

  /**
   * Upload school image
   */
  async uploadSchoolImage(file, schoolId) {
    return this.uploadFile('schools', file, `${schoolId}`);
  },

  /**
   * Upload gallery image and create record
   */
  async addGalleryItem({ type, entityId, title, file, videoUrl }) {
    return adminDbMutation(async () => {
      let imagePath = null;
      if (file) {
        const result = await this.uploadFile('gallery', file, `${type}/${entityId || 0}`);
        imagePath = result.url;
      }

      const { data, error } = await supabase
        .from('galleries')
        .insert({
          galleryable_type: type,
          galleryable_id: Number(entityId) || 0,
          title,
          image_path: imagePath,
          video_url: videoUrl || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  },

  /**
   * Delete gallery item and its file
   */
  async deleteGalleryItem(id) {
    const { data: item } = await supabase.from('galleries').select('image_path').eq('id', id).single();
    if (item?.image_path) {
      try { await this.deleteFile('gallery', item.image_path); } catch (e) { /* ignore */ }
    }
    const { error } = await supabase.from('galleries').delete().eq('id', id);
    if (error) throw error;
  },

  /**
   * Upload document and create record
   */
  async addDocument({ type, entityId, title, file, fileType }) {
    const result = await this.uploadFile('documents', file, `${type}/${entityId}`);

    const { data, error } = await supabase
      .from('documents')
      .insert({
        documentable_type: type,
        documentable_id: entityId,
        title,
        file_path: result.url,
        file_type: fileType || 'other',
        file_size: file.size,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

/**
 * Admin Service — admin-only CRUD operations
 */
export const adminService = {
  // ─── Dashboard Stats ──────────────────
  async getDashboardStats() {
    const [
      villages,
      schools,
      projects,
      donations,
      volunteers,
      users,
      partners,
      messages,
      unreadMessages,
    ] = await Promise.allSettled([
      supabase.from('villages').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('schools').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('projects').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('donations').select('amount', { count: 'exact' }).eq('payment_status', 'success'),
      supabase.from('volunteers').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('partners').select('*', { count: 'exact', head: true }),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    ]);

    const donationsData = donations.status === 'fulfilled' ? donations.value : { count: 0, data: [] };
    const totalDonationAmount = donationsData.data?.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0) || 0;

    return {
      totalVillages: villages.status === 'fulfilled' ? villages.value.count || 0 : 0,
      totalSchools: schools.status === 'fulfilled' ? schools.value.count || 0 : 0,
      totalProjects: projects.status === 'fulfilled' ? projects.value.count || 0 : 0,
      totalDonations: donationsData.count || 0,
      totalDonationAmount,
      totalVolunteers: volunteers.status === 'fulfilled' ? volunteers.value.count || 0 : 0,
      totalMembers: users.status === 'fulfilled' ? users.value.count || 0 : 0,
      totalPartners: partners.status === 'fulfilled' ? partners.value.count || 0 : 0,
      totalMessages: messages.status === 'fulfilled' ? messages.value.count || 0 : 0,
      unreadMessages: unreadMessages.status === 'fulfilled' ? unreadMessages.value.count || 0 : 0,
      // legacy aliases
      totalUsers: users.status === 'fulfilled' ? users.value.count || 0 : 0,
    };
  },

  async getDonationTrend(monthsBack = 6) {
    const start = new Date();
    start.setMonth(start.getMonth() - (monthsBack - 1));
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const buckets = [];
    for (let i = 0; i < monthsBack; i += 1) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      buckets.push({ key: monthKey(d), month: formatMonthLabel(d), amount: 0 });
    }

    const { data, error } = await supabase
      .from('donations')
      .select('amount, created_at')
      .eq('payment_status', 'success')
      .gte('created_at', start.toISOString());

    if (error) return buckets.map(({ month, amount }) => ({ month, amount }));

    (data || []).forEach((row) => {
      const key = monthKey(row.created_at);
      const bucket = buckets.find((b) => b.key === key);
      if (bucket) bucket.amount += parseFloat(row.amount) || 0;
    });

    return buckets.map(({ month, amount }) => ({ month, amount }));
  },

  async getProjectCategoryStats() {
    const { data, error } = await supabase
      .from('projects')
      .select('category, project_categories(name)')
      .is('deleted_at', null);

    if (error || !data?.length) {
      return [{ name: 'No projects', value: 100, color: PROJECT_CHART_COLORS[0] }];
    }

    const counts = {};
    data.forEach((p) => {
      const name = p.project_categories?.name || p.category || 'Other';
      counts[name] = (counts[name] || 0) + 1;
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts).map(([name, count], i) => ({
      name,
      value: Math.round((count / total) * 100),
      count,
      color: PROJECT_CHART_COLORS[i % PROJECT_CHART_COLORS.length],
    }));
  },

  async getRecentRegistrations(limit = 8) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, mobile, occupation, profession, created_at, districts(name), states(name)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return data || [];
  },

  async getDashboardBundle() {
    const { homeService } = await import('./home');
    const [stats, donationTrend, projectDist, activity, recentMembers] = await Promise.all([
      this.getDashboardStats(),
      this.getDonationTrend(),
      this.getProjectCategoryStats(),
      homeService.getLiveActivity().catch(() => []),
      this.getRecentRegistrations(),
    ]);

    return { stats, donationTrend, projectDist, activity, recentMembers };
  },

  // ─── Users ────────────────────────────
  async listUsers({ limit = 50, offset = 0, search } = {}) {
    let query = supabase
      .from('profiles')
      .select('*, user_roles(roles(name))', { count: 'exact' });
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,mobile.ilike.%${search}%`);
    }
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  async assignRole(userId, roleId) {
    const { error } = await supabase.from('user_roles').insert({ user_id: userId, role_id: roleId });
    if (error) throw error;
  },

  async removeRole(userId, roleId) {
    const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role_id', roleId);
    if (error) throw error;
  },

  // ─── Contact Messages ─────────────────
  async listMessages({ limit = 50, offset = 0, status } = {}) {
    let query = supabase.from('contact_messages').select('*', { count: 'exact' });
    if (status) query = query.eq('status', status);
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  async updateMessageStatus(id, status) {
    const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
    if (error) throw error;
  },

  // ─── Settings ─────────────────────────
  async updateSetting(key, value) {
    const { error } = await supabase.from('settings').update({ value }).eq('key', key);
    if (error) throw error;
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

  // ─── Audit Logs ───────────────────────
  async listAuditLogs({ limit = 50, offset = 0, module } = {}) {
    let query = supabase.from('audit_logs').select('*, profiles(full_name)', { count: 'exact' });
    if (module) query = query.eq('module', module);
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  async logAction({ action, module, recordId, oldValues, newValues }) {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      action,
      module,
      record_id: recordId,
      old_values: oldValues,
      new_values: newValues,
    });
  },

  // ─── Generic CRUD helpers ─────────────
  async createRecord(table, data) {
    const { data: result, error } = await supabase.from(table).insert(data).select().single();
    if (error) throw error;
    return result;
  },

  async updateRecord(table, id, updates) {
    const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteRecord(table, id) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },

  async softDeleteRecord(table, id) {
    const { error } = await supabase.from(table).update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  },

  // ─── All Donations (admin view) ──────
  async listAllDonations({ limit = 50, offset = 0, status, targetType } = {}) {
    let query = supabase
      .from('donations')
      .select('*, villages(village_name), schools(school_name), projects(project_name)', { count: 'exact' });
    if (status) query = query.eq('payment_status', status);
    if (targetType) query = query.eq('target_type', targetType);
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  // ─── All Volunteers (admin view) ─────
  async listAllVolunteers({ limit = 50, offset = 0 } = {}) {
    const { data, error, count } = await supabase
      .from('volunteers')
      .select('*, profiles(full_name, profile_photo, mobile)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return { data, count };
  },

  // ─── Notifications ────────────────────
  async sendNotification({ userId, title, message }) {
    const { error } = await supabase.from('notifications').insert({ user_id: userId, title, message });
    if (error) throw error;
  },

  async sendBulkNotification({ userIds, title, message }) {
    const records = userIds.map(userId => ({ user_id: userId, title, message }));
    const { error } = await supabase.from('notifications').insert(records);
    if (error) throw error;
  },

  // ─── Activity logs ────────────────────
  async listActivityLogs({ loggableType, limit = 200 } = {}) {
    let query = supabase.from('activity_logs').select('*').order('activity_date', { ascending: false }).limit(limit);
    if (loggableType) query = query.eq('loggable_type', loggableType);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createActivityLog(entry) {
    const { data, error } = await supabase.from('activity_logs').insert(entry).select().single();
    if (error) throw error;
    return data;
  },

  // ─── Project categories ───────────────
  async listProjectCategories() {
    const { data, error } = await supabase.from('project_categories').select('*').order('name');
    if (error) throw error;
    return data || [];
  },

  async upsertProjectCategory(record) {
    if (record.id) {
      const { data, error } = await supabase.from('project_categories').update(record).eq('id', record.id).select().single();
      if (error) throw error;
      return data;
    }
    const { data, error } = await supabase.from('project_categories').insert(record).select().single();
    if (error) throw error;
    return data;
  },

  async deleteProjectCategory(id) {
    const { error } = await supabase.from('project_categories').delete().eq('id', id);
    if (error) throw error;
  },

  // ─── Impact metrics ───────────────────
  async listImpactMetrics() {
    const { data, error } = await supabase.from('impact_metrics').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async upsertImpactMetric(record) {
    if (record.id) {
      const { data, error } = await supabase.from('impact_metrics').update(record).eq('id', record.id).select().single();
      if (error) throw error;
      return data;
    }
    const { data, error } = await supabase.from('impact_metrics').insert(record).select().single();
    if (error) throw error;
    return data;
  },

  // ─── Donation receipts ────────────────
  async listReceipts({ limit = 200 } = {}) {
    const { data, error } = await supabase
      .from('donation_receipts')
      .select('*, donations(id, amount, donor_name, payment_status, created_at)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  // ─── Roles ────────────────────────────
  async listRoles() {
    const { data, error } = await supabase.from('roles').select('*').order('name');
    if (error) throw error;
    return data || [];
  },
};
