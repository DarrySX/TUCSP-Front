'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/app/providers';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/session';

export function Header() {
  const { language, toggleLanguage, t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60 border-b">
      <nav className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="-my-2 flex items-center">
          <Image
            src="/LogoTUCSP.png"
            alt="TUCSP Tuna"
            width={160}
            height={80}
            className="h-16 w-auto object-contain"
            priority
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#services" className="text-sm text-foreground hover:text-primary transition">
            {t.header.services}
          </Link>
          <Link href="#packages" className="text-sm text-foreground hover:text-primary transition">
            {t.header.packages}
          </Link>
          <Link href="#about" className="text-sm text-foreground hover:text-primary transition">
            {t.header.about}
          </Link>
          <Link href="#contact" className="text-sm text-foreground hover:text-primary transition">
            {t.header.contact}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={toggleLanguage}>
            {language === 'en' ? 'ES' : 'EN'}
          </Button>
          {!isAuthenticated && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">{t.header.login}</Link>
            </Button>
          )}
          {isAuthenticated && (
            <Button variant="outline" size="sm" asChild className="ml-2 bg-transparent">
              <Link href="/dashboard">Mi Panel</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
