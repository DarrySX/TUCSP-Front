'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/app/providers';

export function CTA() {
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-20 md:py-32 bg-primary text-white">
      <div className="container mx-auto px-4 text-center space-y-8">
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">{t.cta.title}</h2>
          <p className="text-lg text-white/90">
            {t.cta.subtitle}
          </p>
        </div>

        <div className="flex justify-center">
          <Button size="lg" variant="secondary" asChild>
            <Link href="#contact-form">
              {t.cta.button1}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
