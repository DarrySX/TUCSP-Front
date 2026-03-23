'use client';

import { LoginForm } from '@/components/auth/login-form';
import { useLanguage } from '@/app/providers';

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center justify-center">
          <div className="w-12 h-12 bg-linear-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">♪</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground">{t.auth.login.title}</h1>
        <p className="text-muted-foreground text-sm">{t.auth.login.subtitle}</p>
      </div>
      <LoginForm />
    </div>
  );
}
