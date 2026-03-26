import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center justify-center">
          <div className="w-12 h-12 bg-linear-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">♪</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Bienvenido de Vuelta</h1>
        <p className="text-muted-foreground text-sm">Inicia sesión en tu cuenta de UCSP Tuna</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
