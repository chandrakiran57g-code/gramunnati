import { supabase } from '@/api/supabaseClient';
import { ADMIN_CREDENTIALS } from '@/lib/adminAuth';

export const ADMIN_DB_SETUP_HINT =
  `Create Supabase Auth user "${ADMIN_CREDENTIALS.email}" and run supabase/admin-policies.sql.`;

/** Sign in to Supabase so RLS allows admin writes. Called before mutations. */
export async function ensureAdminDbAccess() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) return { ok: true };

  const { error } = await supabase.auth.signInWithPassword({
    email: ADMIN_CREDENTIALS.email,
    password: ADMIN_CREDENTIALS.password,
  });

  if (error) {
    throw new Error(`Database access denied: ${error.message}. ${ADMIN_DB_SETUP_HINT}`);
  }
  return { ok: true };
}

export async function adminDbMutation(fn) {
  await ensureAdminDbAccess();
  return fn();
}
