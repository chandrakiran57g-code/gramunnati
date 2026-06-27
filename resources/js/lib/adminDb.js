import { supabase } from '@/api/supabaseClient';
import { ADMIN_CREDENTIALS } from '@/lib/adminAuth';

/** Sign in to Supabase so RLS allows admin writes. Called before mutations. */
export async function ensureAdminDbAccess() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) return { ok: true };

  const { error } = await supabase.auth.signInWithPassword({
    email: ADMIN_CREDENTIALS.email,
    password: ADMIN_CREDENTIALS.password,
  });

  if (error) {
    throw new Error(
      `Database access denied: ${error.message}. Create admin user "${ADMIN_CREDENTIALS.email}" in Supabase Auth and run supabase/admin-policies.sql.`
    );
  }
  return { ok: true };
}

export async function adminDbMutation(fn) {
  await ensureAdminDbAccess();
  return fn();
}
