import { supabase } from '@/api/supabaseClient';

export const ADMIN_DB_SETUP_HINT =
  'Log in again from the admin login page. If it keeps failing, your session may have expired.';

/**
 * Confirm an authenticated admin session exists before an admin write/upload.
 * The browser never holds credentials — this simply verifies the server session
 * cookie (established at login) is still valid.
 */
export async function ensureAdminDbAccess() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) return { ok: true };

  throw new Error(`Your admin session has expired. ${ADMIN_DB_SETUP_HINT}`);
}

export async function adminDbMutation(fn) {
  await ensureAdminDbAccess();
  return fn();
}
