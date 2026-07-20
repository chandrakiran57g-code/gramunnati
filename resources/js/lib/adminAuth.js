import { supabase } from '@/api/supabaseClient';
import { apiFetch, ensureCsrf } from '@/api/apiClient';

const ADMIN_SESSION_KEY = 'cmsr_admin_session';

const ADMIN_ROLE_NAMES = ['Super Admin', 'SuperAdmin'];

function hasAdminRole(payload) {
  const roles = payload?.roles || [];
  return roles.some((name) => ADMIN_ROLE_NAMES.includes(name));
}

export function isAdminAuthenticated() {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function setAdminSession() {
  try {
    sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
  } catch {
    /* ignore */
  }
}

export async function clearAdminSession() {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    await supabase.auth.signOut();
  } catch {
    /* ignore */
  }
}

/**
 * Authenticate against the Laravel backend with the operator's own credentials
 * and confirm the account holds a Super Admin role. No credentials are ever
 * stored in the frontend — the server session cookie is the source of truth.
 */
export async function authenticateAdmin(email, password) {
  try {
    await ensureCsrf();
    const payload = await apiFetch('/auth/login', {
      method: 'POST',
      body: { email: email.trim().toLowerCase(), password },
    });

    if (!hasAdminRole(payload)) {
      await apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
      return { ok: false, error: 'This account does not have admin access.' };
    }

    setAdminSession();
    return { ok: true };
  } catch (err) {
    if (err?.status === 422 || err?.status === 401) {
      return { ok: false, error: 'Invalid admin email or password.' };
    }
    return { ok: false, error: err?.message || 'Login failed. Please try again.' };
  }
}
