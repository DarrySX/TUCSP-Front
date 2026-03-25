'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Handles Supabase auth redirects that land on the root page.
 * When Supabase redirects after email link click, the hash contains either:
 *  - #access_token=...&type=recovery  → send to reset-password page
 *  - #error=...                       → send to login with error notice
 */
export function AuthRedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.slice(1));

    if (params.get('type') === 'recovery' && params.get('access_token')) {
      router.replace(`/auth/reset-password${hash}`);
      return;
    }

    if (params.get('error')) {
      const desc = params.get('error_description') ?? 'El enlace es inválido o ha expirado';
      router.replace(`/auth/login?reset_error=${encodeURIComponent(desc)}`);
    }
  }, [router]);

  return null;
}
