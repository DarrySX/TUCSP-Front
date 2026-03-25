import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { Services } from '@/components/landing/services';
import { Events } from '@/components/landing/events';
import { CTA } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';
import { AuthRedirectHandler } from '@/components/auth/auth-redirect-handler';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <AuthRedirectHandler />
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <Services />
        <Events />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
