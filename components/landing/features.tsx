'use client';

import { Award, Clock, Guitar, Music4, Sparkles, Users } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { SpotlightCard } from '@/components/landing/spotlight-card';
import { SectionHeading } from '@/components/landing/section-heading';
import { useLanguage } from '@/app/providers';

export function Features() {
  const { t } = useLanguage();

  const features = [
    { icon: Music4, title: t.features.feature1Title, description: t.features.feature1Desc },
    { icon: Sparkles, title: t.features.feature2Title, description: t.features.feature2Desc },
    { icon: Guitar, title: t.features.feature3Title, description: t.features.feature3Desc },
    { icon: Users, title: t.features.feature4Title, description: t.features.feature4Desc },
    { icon: Clock, title: t.features.feature5Title, description: t.features.feature5Desc },
    { icon: Award, title: t.features.feature6Title, description: t.features.feature6Desc },
  ];

  return (
    <section id="servicios" className="relative scroll-mt-24 overflow-hidden py-24 md:py-36">
      {/* Ambient wash anchored to the section's top edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-160 w-280 -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,oklch(0.6_0.18_307/0.1),transparent_70%)] blur-3xl"
      />
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-[0.35] mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="relative container mx-auto px-4">
        <SectionHeading
          eyebrow={t.features.eyebrow}
          title={t.features.title}
          subtitle={t.features.subtitle}
        />

        <ul className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }, index) => (
            <Reveal as="li" key={title} delay={index * 90}>
              <SpotlightCard className="h-full">
                <div className="flex h-full flex-col p-7">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-transform duration-500 ease-out-expo group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <span className="font-mono text-xs text-muted-foreground/50 tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
