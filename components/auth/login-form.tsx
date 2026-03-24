'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { signIn, sendPasswordReset } from '@/lib/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Mode = 'login' | 'forgot';

export function LoginForm() {
  const [mode, setMode] = useState<Mode>('login');
  const router = useRouter();

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // ── Login ──────────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('El correo y la contraseña son requeridos');
      return;
    }
    setIsLoading(true);
    try {
      const { data, error: signInError } = await signIn(email, password);
      if (signInError) {
        setError('Correo o contraseña incorrectos');
      } else if (data.user) {
        router.push('/dashboard');
      }
    } catch {
      setError('Ocurrió un error inesperado. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot password ────────────────────────────────────────────────────────

  const handleReset = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetError(null);

    if (!resetEmail.trim()) {
      setResetError('Ingresa tu correo electrónico');
      return;
    }
    if (!EMAIL_REGEX.test(resetEmail.trim())) {
      setResetError('El formato del correo no es válido');
      return;
    }

    setResetLoading(true);
    try {
      const { exists } = await sendPasswordReset(resetEmail.trim());
      if (!exists) {
        setResetError('No encontramos ninguna cuenta con ese correo. Verifica que sea el correo con el que fuiste registrado.');
        return;
      }
      setResetSent(true);
    } catch {
      setResetError('Ocurrió un error al enviar el correo. Intenta de nuevo.');
    } finally {
      setResetLoading(false);
    }
  };

  const switchToForgot = () => {
    setResetEmail(email); // pre-fill with whatever they typed
    setResetError(null);
    setResetSent(false);
    setMode('forgot');
  };

  const switchToLogin = () => {
    setError(null);
    setResetSent(false);
    setMode('login');
  };

  // ── Render: forgot password ────────────────────────────────────────────────

  if (mode === 'forgot') {
    if (resetSent) {
      return (
        <div className="space-y-6 text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">📧</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Revisa tu correo</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Si existe una cuenta registrada con<br />
              <span className="font-medium text-foreground">{resetEmail}</span><br />
              recibirás un enlace de recuperación en breve.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Si no lo ves, revisa tu carpeta de spam.
            </p>
          </div>
          <Button variant="outline" className="w-full" onClick={switchToLogin}>
            Volver al inicio de sesión
          </Button>
        </div>
      );
    }

    return (
      <form onSubmit={handleReset} className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Restablecer contraseña</h2>
          <p className="text-sm text-muted-foreground">
            Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
          </p>
        </div>

        {resetError && (
          <div className="bg-destructive/15 border border-destructive/50 rounded-xl p-4 text-sm text-destructive">
            <div className="font-medium mb-1">Error</div>
            {resetError}
          </div>
        )}

        <div className="space-y-2.5">
          <label htmlFor="resetEmail" className="text-sm font-semibold text-foreground">
            Correo Electrónico
          </label>
          <Input
            id="resetEmail"
            type="email"
            placeholder="tu@ejemplo.com"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            disabled={resetLoading}
            className="h-11 rounded-lg bg-secondary/40 border-border/60 focus-visible:bg-background transition-colors"
            autoFocus
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 rounded-lg font-semibold text-base shadow-sm hover:shadow-md transition-all"
          disabled={resetLoading}
        >
          {resetLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
        </Button>

        <button
          type="button"
          onClick={switchToLogin}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition"
        >
          ← Volver al inicio de sesión
        </button>
      </form>
    );
  }

  // ── Render: login ──────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      {error && (
        <div className="bg-destructive/15 border border-destructive/50 rounded-xl p-4 text-sm text-destructive animate-in fade-in">
          <div className="font-medium mb-1">Error</div>
          {error}
        </div>
      )}

      <div className="space-y-2.5">
        <label htmlFor="email" className="text-sm font-semibold text-foreground">
          Correo Electrónico
        </label>
        <Input
          id="email"
          type="email"
          placeholder="tu@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="h-11 rounded-lg bg-secondary/40 border-border/60 focus-visible:bg-background transition-colors"
        />
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-semibold text-foreground">
            Contraseña
          </label>
          <button
            type="button"
            onClick={switchToForgot}
            className="text-xs text-primary hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <PasswordInput
          id="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="h-11 rounded-lg bg-secondary/40 border-border/60 focus-visible:bg-background transition-colors"
        />
      </div>

      <Button
        type="submit"
        className="w-full h-11 rounded-lg font-semibold text-base shadow-sm hover:shadow-md transition-all"
        disabled={isLoading}
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>
    </form>
  );
}
