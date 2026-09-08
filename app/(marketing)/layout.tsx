import type { ReactNode } from 'react';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { SitePreloader } from '@/components/preloader/site-preloader';
import { AuthRedirectHandler } from '@/components/auth/auth-redirect-handler';

/**
 * Shell for the public marketing pages (`/` and `/about`).
 *
 * The preloader lives here rather than in the root layout so it never covers the
 * dashboard or the auth screens, which have their own loading states.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SitePreloader />
      <AuthRedirectHandler />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
