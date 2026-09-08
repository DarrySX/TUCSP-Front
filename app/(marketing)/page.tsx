import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { Gallery } from '@/components/landing/gallery';
import { Testimonials } from '@/components/landing/testimonials';
import { CTA } from '@/components/landing/cta';
import { ContactForm } from '@/components/landing/contact-form';

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Gallery />
      <Testimonials />
      <CTA />
      <ContactForm />
    </>
  );
}
