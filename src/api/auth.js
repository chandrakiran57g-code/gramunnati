import { supabase } from './supabaseClient';

/**
 * Auth Service — wraps Supabase Auth
 */
export const authService = {
  /**
   * Sign up with email + password
   * @param {{ email: string, password: string, firstName?: string, lastName?: string }} data
   */
  async signUp({ email, password, firstName, lastName }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName || '', last_name: lastName || '' },
      },
    });
    if (error) throw error;
    return data;
  },

  /**
   * Sign in with email + password
   */
  async signInWithPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) throw error;
    return data;
  },

  /**
   * Sign out
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  /**
   * Get current user
   */
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  /**
   * Get user profile from profiles table (with role info)
   */
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(role_id, roles(id, name)),
        user_category_user(category_id, user_categories(id, name, slug)),
        states(id, name),
        districts(id, name),
        mandals(id, name),
        villages(id, village_name)
      `)
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Send password reset email
   */
  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Update password (after reset)
   */
  async updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  /**
   * Check if user has a specific role
   */
  async hasRole(userId, roleName) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', userId);
    if (error) return false;
    return data?.some(ur => ur.roles?.name === roleName) || false;
  },

  /**
   * Get all roles for a user
   */
  async getUserRoles(userId) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('roles(id, name)')
      .eq('user_id', userId);
    if (error) return [];
    return data?.map(ur => ur.roles?.name).filter(Boolean) || [];
  },
};
