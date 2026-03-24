import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _instance: SupabaseClient | undefined;

function getInstance(): SupabaseClient {
  if (!_instance) {
    _instance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _instance;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const instance = getInstance();
    const value = instance[prop as keyof SupabaseClient];
    return typeof value === 'function' ? (value as Function).bind(instance) : value;
  },
});

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
  // Check if the email belongs to a registered user first
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('correo_electronico', email.toLowerCase().trim())
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) return { exists: false };

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  if (error) throw error;
  return { exists: true };
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error };
}
