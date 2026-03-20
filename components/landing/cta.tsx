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

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" asChild>
            <a href="mailto:info@ucsp-tuna.edu?subject=Event Booking Inquiry">
              {t.cta.button1}
            </a>
          </Button>
          <Button size="lg" variant="outline" className="border-white hover:bg-white/10 bg-transparent" asChild>
            <Link href="#packages">
              {t.cta.button2}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
