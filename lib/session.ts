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

export async function getSession() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function getUserRole(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}
