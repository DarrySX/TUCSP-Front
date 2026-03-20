'use client';

import React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { signIn } from '@/lib/auth';
import Link from 'next/link';
import { useLanguage } from '@/app/providers';

export function LoginForm() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError(t.auth.login.error);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(signInError.message);
      } else if (data.user) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(t.auth.login.errorMatch);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/15 border border-destructive/50 rounded-xl p-4 text-sm text-destructive animate-in fade-in">
          <div className="font-medium mb-1">Error</div>
          {error}
        </div>
      )}

      <div className="space-y-2.5">
        <label htmlFor="email" className="text-sm font-semibold text-foreground">
          {t.auth.login.email}
        </label>
        <Input
          id="email"
          type="email"
          placeholder={t.auth.login.placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="h-11 rounded-lg bg-secondary/40 border-border/60 focus-visible:bg-background transition-colors"
        />
      </div>

      <div className="space-y-2.5">
        <label htmlFor="password" className="text-sm font-semibold text-foreground">
          {t.auth.login.password}
        </label>
        <PasswordInput
          id="password"
          placeholder={t.auth.login.passwordPlaceholder}
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
        {isLoading ? t.auth.login.signing : t.auth.login.submit}
      </Button>
    </form>
  );
}
