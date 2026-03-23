'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { updatePassword, supabase } from '@/lib/auth';

type State = 'loading' | 'ready' | 'success' | 'invalid';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [state, setState] = useState<State>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase puts the recovery token in the URL hash as an access_token.
    // Calling getSession() after the page loads picks it up automatically.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setState('ready');
      } else {
        // Give the client a moment to exchange the hash token
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          if (event === 'PASSWORD_RECOVERY') {
            setState('ready');
            subscription.unsubscribe();
          } else if (event === 'SIGNED_IN') {
            setState('ready');
            subscription.unsubscribe();
          }
        });

        // Fallback: if no session after 3s, the link is invalid/expired
        const timeout = setTimeout(() => {
          subscription.unsubscribe();
          setState('invalid');
        }, 3000);

        return () => clearTimeout(timeout);
      }
    });
  }, []);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!password || !confirmPassword) {
      setError('Completa ambos campos');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await updatePassword(password);
      if (updateError) throw updateError;
      setState('success');
      setTimeout(() => router.push('/dashboard'), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  // ── States ─────────────────────────────────────────────────────────────────

  if (state === 'loading') {
    return (
      <div className="text-center space-y-3 py-8">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm">Verificando enlace...</p>
      </div>
    );
  }

  if (state === 'invalid') {
    return (
      <div className="text-center space-y-5 py-8">
        <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <span className="text-2xl">⚠</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Enlace inválido o expirado</h2>
          <p className="text-sm text-muted-foreground">
            Este enlace ya no es válido. Los enlaces de recuperación expiran después de 1 hora.
          </p>
        </div>
        <Button className="w-full" onClick={() => router.push('/auth/login')}>
          Solicitar nuevo enlace
        </Button>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="text-center space-y-5 py-8">
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <span className="text-2xl">✓</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">¡Contraseña actualizada!</h2>
          <p className="text-sm text-muted-foreground">
            Tu contraseña fue cambiada exitosamente. Redirigiendo...
          </p>
        </div>
      </div>
    );
  }

  // ── Ready: show form ───────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Nueva contraseña</h2>
        <p className="text-sm text-muted-foreground">
          Elige una contraseña segura de al menos 6 caracteres.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/15 border border-destructive/50 rounded-xl p-4 text-sm text-destructive">
          <div className="font-medium mb-1">Error</div>
          {error}
        </div>
      )}

      <div className="space-y-2.5">
        <label htmlFor="password" className="text-sm font-semibold text-foreground">
          Nueva Contraseña
        </label>
        <PasswordInput
          id="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="h-11 rounded-lg bg-secondary/40 border-border/60 focus-visible:bg-background transition-colors"
          autoFocus
        />
      </div>

      <div className="space-y-2.5">
        <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
          Confirmar Contraseña
        </label>
        <PasswordInput
          id="confirmPassword"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          className="h-11 rounded-lg bg-secondary/40 border-border/60 focus-visible:bg-background transition-colors"
        />
      </div>

      <Button
        type="submit"
        className="w-full h-11 rounded-lg font-semibold text-base shadow-sm hover:shadow-md transition-all"
        disabled={isLoading}
      >
        {isLoading ? 'Guardando...' : 'Guardar nueva contraseña'}
      </Button>
    </form>
  );
}
