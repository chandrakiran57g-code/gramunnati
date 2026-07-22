import { apiFetch } from './apiClient';

const ADMIN_ROLE_NAMES = ['Super Admin', 'SuperAdmin'];

function isAdminRoles(roles) {
  return Array.isArray(roles) && roles.some((name) => ADMIN_ROLE_NAMES.includes(name));
}

export const authService = {
  async signUp({ email, password, fullName, mobile, firstName, lastName, profession, stateId, districtId, mandalName }) {
    const cleanMobile = String(mobile || '').replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) throw new Error('Valid mobile number is required');
    const payload = await apiFetch('/auth/register', {
      method: 'POST',
      body: {
        email: email?.trim() || undefined,
        password,
        full_name: fullName || `${firstName || ''} ${lastName || ''}`.trim(),
        mobile: cleanMobile,
        first_name: firstName,
        last_name: lastName,
        profession: profession?.trim() || undefined,
        state_id: stateId,
        district_id: districtId,
        mandal_name: mandalName?.trim() || undefined,
      },
    });
    return payload;
  },

  async signInWithMobile(mobile, password) {
    return apiFetch('/auth/login', {
      method: 'POST',
      body: { mobile, password },
    });
  },

  async signInWithPassword(email, password) {
    return apiFetch('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  async signInWithGoogle() {
    throw new Error('Google sign-in is not configured yet.');
  },

  async signOut() {
    return apiFetch('/auth/logout', { method: 'POST' });
  },

  async getSession() {
    try {
      const payload = await apiFetch('/auth/user');
      if (!payload?.user) return null;
      // Admin credentials must never leak into the public site / member area.
      // Treat an admin session as logged-out everywhere outside /admin (the
      // admin panel authenticates through its own dedicated flow).
      if (isAdminRoles(payload?.roles)) return null;
      return { user: payload.user };
    } catch {
      return null;
    }
  },

  async getUser() {
    const session = await this.getSession();
    return session?.user ?? null;
  },

  async getProfile(_userId) {
    const payload = await apiFetch('/auth/user');
    return payload?.profile ?? null;
  },

  async updateProfile(_userId, updates) {
    const payload = await apiFetch('/auth/profile', { method: 'PUT', body: updates });
    return payload?.profile;
  },

  async resetPassword(email) {
    return apiFetch('/auth/forgot-password', { method: 'POST', body: { email } });
  },

  async submitPasswordReset({ email, token, password }) {
    return apiFetch('/auth/reset-password', {
      method: 'POST',
      body: { email, token, password, password_confirmation: password },
    });
  },

  async updatePassword(_newPassword) {
    throw new Error('Use email reset flow when configured.');
  },

  onAuthStateChange(callback) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  },

  async hasRole(userId, roleName) {
    const roles = await this.getUserRoles(userId);
    return roles.includes(roleName);
  },

  async getUserRoles(_userId) {
    try {
      const payload = await apiFetch('/auth/user');
      return payload?.roles ?? [];
    } catch {
      return [];
    }
  },
};
