import { apiFetch, ensureCsrf } from '@/api/apiClient';
import { ADMIN_CREDENTIALS } from '@/lib/adminCredentials';

/** Ensure Laravel Sanctum cookie session (required for /api/upload). */
export async function ensureSanctumAdminSession() {
  try {
    const json = await apiFetch('/auth/user');
    if (json?.user) return json.user;
  } catch (err) {
    if (err.status && err.status !== 401) throw err;
  }
  await ensureCsrf();
  const login = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email: ADMIN_CREDENTIALS.email, password: ADMIN_CREDENTIALS.password },
  });
  return login?.user;
}
