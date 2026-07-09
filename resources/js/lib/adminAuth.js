import { supabase } from '@/api/supabaseClient';
import { apiFetch, ensureCsrf } from '@/api/apiClient';

const ADMIN_SESSION_KEY = 'cmsr_admin_session';

export const ADMIN_CREDENTIALS = {
  email: 'test@gmail.com',
  password: 'testadmin123',
};

export function validateAdminCredentials(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  return (
    normalizedEmail === ADMIN_CREDENTIALS.email.toLowerCase()
    && password === ADMIN_CREDENTIALS.password
  );
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
    await ensureCsrf();
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch {
    /* ignore */
  }
}

export async function authenticateAdmin(email, password) {
  if (!validateAdminCredentials(email, password)) {
    return { ok: false, error: 'Invalid admin email or password' };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: ADMIN_CREDENTIALS.email,
    password: ADMIN_CREDENTIALS.password,
  });

  if (error) {
    return {
      ok: false,
      error: `Cannot sign in: ${error.message}. Run php artisan migrate:fresh --seed locally.`,
    };
  }

  setAdminSession();

  try {
    await ensureCsrf();
    await apiFetch('/auth/login', {
      method: 'POST',
      body: { email: email.trim().toLowerCase(), password },
    });
  } catch (err) {
    return {
      ok: false,
      error: err.message || 'Could not start Laravel session — file uploads may fail. Refresh and try again.',
    };
  }

  return { ok: true };
}
