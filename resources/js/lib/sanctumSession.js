import { apiFetch } from '@/api/apiClient';

/**
 * Confirm the Laravel Sanctum cookie session (required for /api/upload).
 * Requires the admin to already be logged in — no credentials are held here.
 */
export async function ensureSanctumAdminSession() {
  try {
    const json = await apiFetch('/auth/user');
    if (json?.user) return json.user;
  } catch (err) {
    if (err.status && err.status !== 401) throw err;
  }
  throw new Error('Your admin session has expired. Please log in again to upload files.');
}
