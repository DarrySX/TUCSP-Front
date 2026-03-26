'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { NotificationPanel } from '@/components/notifications/notification-panel';
import { getCurrentUser, signOut, supabase } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkRole() {
      const user = await getCurrentUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      setIsSuperAdmin(data?.role === 'super_admin');
      setIsAdmin(data?.role === 'super_admin' || data?.role === 'tuno_admin');
    }
    checkRole();
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push('/');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Inicio' },
    { href: '/dashboard/events', label: 'Eventos' },
    { href: '/dashboard/profile', label: 'Mi Perfil' },
    ...(isSuperAdmin ? [
      { href: '/dashboard/admin/users', label: 'Administración' },
      { href: '/dashboard/admin/estadisticas', label: 'Estadísticas' },
    ] : []),
    ...(isAdmin ? [
      { href: '/dashboard/admin/inventario', label: 'Inventario' },
    ] : []),
  ];

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">♪</span>
            </div>
            <span className="font-bold text-lg">UCSP Tuna</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition ${
                  isActive(href)
                    ? 'text-primary'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {userId && <NotificationPanel userId={userId} />}
            <Button
              onClick={handleSignOut}
              disabled={isSigningOut}
              variant="outline"
              size="sm"
              className="hidden md:flex"
            >
              {isSigningOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
            </Button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-secondary/50"
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label="Menú"
            >
              <div className="space-y-1.5">
                <span className={`block w-5 h-0.5 bg-foreground transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block w-5 h-0.5 bg-foreground transition-all ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-5 h-0.5 bg-foreground transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive(href)
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-secondary/50'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="mt-1 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 text-left transition"
              >
                {isSigningOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t py-4">
        <p className="text-center text-xs text-muted-foreground/50">
          Creado por{' '}
          <a
            href="https://www.linkedin.com/in/brandon-valenciac/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors duration-200 underline underline-offset-2 decoration-muted-foreground/30 hover:decoration-muted-foreground/60"
          >
            Brandon Valencia Calderón
          </a>
        </p>
      </footer>
    </div>
  );
}
