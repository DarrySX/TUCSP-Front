'use client';

import React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUp } from '@/lib/auth';
import Link from 'next/link';
import { useLanguage } from '@/app/providers';

export function SignUpForm() {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setError(t.auth.signup.errorRequired);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.auth.signup.errorMatch);
      return;
    }

    if (password.length < 6) {
      setError(t.auth.signup.errorLength);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: signUpError } = await signUp(email, password, fullName);

      if (signUpError) {
        setError(signUpError.message);
      } else if (data.user) {
        setSuccess(true);
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(t.auth.signup.errorServer);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="text-4xl">✓</div>
        <h2 className="text-2xl font-bold">{t.auth.signup.success}</h2>
        <p className="text-muted-foreground">{t.auth.signup.successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm font-medium">
          {t.auth.signup.fullName}
        </label>
        <Input
          id="fullName"
          type="text"
          placeholder={t.auth.signup.fullNamePlaceholder}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          {t.auth.signup.email}
        </label>
        <Input
          id="email"
          type="email"
          placeholder={t.auth.signup.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          {t.auth.signup.password}
        </label>
        <Input
          id="password"
          type="password"
          placeholder={t.auth.signup.passwordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          {t.auth.signup.confirmPassword}
        </label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder={t.auth.signup.passwordPlaceholder}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? t.auth.signup.creating : t.auth.signup.submit}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t.auth.signup.haveAccount}{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          {t.auth.signup.signIn}
        </Link>
      </p>
    </form>
  );
}
