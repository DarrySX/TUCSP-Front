import { supabase } from '@/lib/supabase-client';

// Re-exported so existing `import { supabase } from '@/lib/auth'` call sites keep working.
export { supabase };

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function sendPasswordReset(email: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${base}/auth/reset-password`,
  });
  if (error) throw error;
  return { exists: true };
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error };
}
