import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * The one browser-side Supabase client for the whole app.
 *
 * There must be exactly one instance: a second `createClient` call in the same
 * browser context spins up a second GoTrueClient over the same storage key,
 * which races on token refresh and logs the "Multiple GoTrueClient instances"
 * warning. `lib/auth` and `lib/session` both re-export this module.
 */
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

/**
 * Lazily instantiated: the proxy defers `createClient` until a property is
 * actually read, so importing this module during a server render (where the
 * public env vars may not be inlined yet) can't throw.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const instance = getInstance();
    const value = instance[prop as keyof SupabaseClient];
    return typeof value === 'function' ? (value as Function).bind(instance) : value;
  },
});
