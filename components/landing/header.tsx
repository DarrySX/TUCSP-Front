'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/app/providers';
import { supabase } from '@/lib/supabase-client';
import { LOGO_SRC } from '@/lib/site-assets';
import { cn } from '@/lib/utils';

export function Header() {
  const { language, toggleLanguage, t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hash links are absolute (`/#...`) so the nav also works from /about.
  const navLinks = [
    { href: '/about', label: t.header.about },
    { href: '/#servicios', label: t.header.services },
    { href: '/#galeria', label: t.header.gallery },
    { href: '/#testimonios', label: t.header.testimonials },
    { href: '/#contacto', label: t.header.contact },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    void checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Swap from transparent-over-hero to solid once the page has scrolled.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile sheet on navigation.
  useEffect(() => setMenuOpen(false), [pathname]);

  // Every page in the marketing layout opens on a full-bleed dark hero, so at
  // scroll zero the header sits on dark imagery and needs light-on-dark styling.
  const isOverHero = !isScrolled && !menuOpen;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out-expo',
        isScrolled || menuOpen
          ? 'border-b border-border/60 bg-background/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      )}
    >
      <nav
        className={cn(
          'container mx-auto flex items-center justify-between px-4 transition-all duration-500',
          isScrolled ? 'h-16' : 'h-20 md:h-24'
        )}
      >
        <Link href="/" className="group flex items-center" aria-label="Tuna Universitaria UCSP">
          <Image
            src={LOGO_SRC}
            alt="Tuna Universitaria UCSP"
            width={200}
            height={100}
            priority
            className={cn(
              // The source PNG carries a lot of transparent padding, so it needs
              // more height than usual to read at the same optical size.
              'w-auto object-contain transition-all duration-500 group-hover:scale-105',
              isScrolled ? 'h-14' : 'h-18 md:h-22',
              isOverHero && 'brightness-0 invert'
            )}
          />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'group relative text-sm font-medium transition-colors',
                isOverHero ? 'text-white/80 hover:text-white' : 'text-foreground/75 hover:text-foreground'
              )}
            >
              {label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all duration-300 ease-out-expo group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            aria-label={language === 'en' ? 'Cambiar a español' : 'Switch to English'}
            className={cn('font-mono text-xs tracking-widest', isOverHero && 'text-white hover:bg-white/10 hover:text-white')}
          >
            {language === 'en' ? 'ES' : 'EN'}
          </Button>

          {isAuthenticated ? (
            <Button size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/dashboard">{t.header.dashboard}</Link>
            </Button>
          ) : (
            <Button
              variant={isOverHero ? 'outline' : 'default'}
              size="sm"
              asChild
              className={cn('hidden sm:inline-flex', isOverHero && 'border-white/40 bg-transparent text-white hover:bg-white hover:text-black')}
            >
              <Link href="/auth/login">{t.header.login}</Link>
            </Button>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors lg:hidden',
              isOverHero ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-muted'
            )}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile sheet — grid-rows trick animates to auto height without a fixed max. */}
      <div
        className={cn(
          'grid overflow-hidden transition-[grid-template-rows] duration-500 ease-out-expo lg:hidden',
          menuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="min-h-0">
          <div className="container mx-auto flex flex-col gap-1 px-4 pb-6">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-3 py-3 text-base font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
              >
                {label}
              </Link>
            ))}
            <Button asChild className="mt-3 w-full">
              <Link href={isAuthenticated ? '/dashboard' : '/auth/login'}>
                {isAuthenticated ? t.header.dashboard : t.header.login}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
