'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/app/providers';

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                {t.hero.title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg text-balance">
                {t.hero.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="#contact">{t.hero.cta1}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#services">{t.hero.cta2}</Link>
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-8 border-t">
              <div>
                <p className="text-2xl font-bold text-primary">{t.hero.stat1}</p>
                <p className="text-sm text-muted-foreground">{t.hero.stat1Label}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{t.hero.stat2}</p>
                <p className="text-sm text-muted-foreground">{t.hero.stat2Label}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{t.hero.stat3}</p>
                <p className="text-sm text-muted-foreground">{t.hero.stat3Label}</p>
              </div>
            </div>
          </div>

          {/* Right side - Visual element */}
          <div className="relative h-96 md:h-full min-h-96 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <div className="text-white text-center space-y-4">
              <div className="text-6xl md:text-7xl animate-bounce">♪</div>
              <p className="text-xl font-semibold">Professional Live Music</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
