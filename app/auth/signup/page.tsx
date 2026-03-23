'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/app/providers';

export default function SignUpPage() {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center justify-center">
          <div className="w-12 h-12 bg-linear-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">♪</span>
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'es' ? 'Acceso Restringido' : 'Access Restricted'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {language === 'es'
              ? 'El registro está restringido. Solo el administrador puede crear nuevas cuentas.'
              : 'Registration is restricted. Only administrators can create new accounts.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button asChild className="h-11 font-semibold">
          <Link href="/auth/login">
            {language === 'es' ? 'Volver al Login' : 'Back to Login'}
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-11 font-semibold bg-white/50 hover:bg-white/80">
          <Link href="/">
            {language === 'es' ? 'Ir a la Landing' : 'Go to Landing'}
          </Link>
        </Button>
      </div>
    </div>
  );
}
