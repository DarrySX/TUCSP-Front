'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Flame, HeartHandshake, Music, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { CountUp } from '@/components/motion/count-up';
import { SectionHeading } from '@/components/landing/section-heading';
import { SpotlightCard } from '@/components/landing/spotlight-card';
import { useLanguage } from '@/app/providers';
import { LOGO_SRC } from '@/lib/site-assets';

export function AboutContent() {
  const { t } = useLanguage();

  const values = [
    { icon: Music, title: t.about.value1Title, description: t.about.value1Desc },
    { icon: HeartHandshake, title: t.about.value2Title, description: t.about.value2Desc },
    { icon: Users, title: t.about.value3Title, description: t.about.value3Desc },
    { icon: Flame, title: t.about.value4Title, description: t.about.value4Desc },
  ];

  const milestones = [
    { year: t.about.milestone1Year, title: t.about.milestone1Title, description: t.about.milestone1Desc },
    { year: t.about.milestone2Year, title: t.about.milestone2Title, description: t.about.milestone2Desc },
    { year: t.about.milestone3Year, title: t.about.milestone3Title, description: t.about.milestone3Desc },
    { year: t.about.milestone4Year, title: t.about.milestone4Title, description: t.about.milestone4Desc },
  ];

  const stats = [
    { value: 59, suffix: '', label: t.about.stat1Label },
    { value: 500, suffix: '+', label: t.about.stat2Label },
    { value: 15, suffix: '+', label: t.about.stat3Label },
    { value: 8, suffix: '', label: t.about.stat4Label },
  ];

  return (
    <>
      {/* ---------- Page header ---------- */}
      <section className="relative isolate flex min-h-[70vh] items-end overflow-hidden bg-[oklch(0.12_0_0)] text-white">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/Grupal2.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="animate-ken-burns object-cover object-center"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[oklch(0.12_0_0)] via-black/70 to-black/50" />
          <div className="bg-noise absolute inset-0 opacity-[0.14] mix-blend-overlay" />
        </div>

        <div className="relative container mx-auto px-4 pt-40 pb-20">
          <div
            data-enter
            className="animate-enter mb-6 flex items-center gap-4"
            style={{ '--enter-delay': '100ms' } as React.CSSProperties}
          >
            <Image
              src={LOGO_SRC}
              alt=""
              width={100}
              height={100}
              priority
              className="h-18 w-auto object-contain brightness-0 invert drop-shadow-[0_0_24px_oklch(0.6_0.18_307/0.55)]"
            />
            <span className="font-mono text-[0.6rem] tracking-[0.35em] text-white/60 uppercase md:text-xs">
              {t.about.eyebrow}
            </span>
          </div>

          <h1
            data-enter
            className="animate-enter max-w-3xl text-4xl leading-[1.05] font-bold tracking-tight text-balance md:text-6xl lg:text-7xl"
            style={{ '--enter-delay': '240ms' } as React.CSSProperties}
          >
            {t.about.title}{' '}
            <span className="bg-linear-to-r from-[oklch(0.78_0.16_307)] to-[oklch(0.85_0.1_307)] bg-clip-text text-transparent">
              {t.about.titleAccent}
            </span>
          </h1>

          <p
            data-enter
            className="animate-enter mt-6 max-w-xl text-base leading-relaxed text-balance text-white/70 md:text-lg"
            style={{ '--enter-delay': '380ms' } as React.CSSProperties}
          >
            {t.about.subtitle}
          </p>
        </div>
      </section>

      {/* ---------- Story ---------- */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <Reveal className="order-2 lg:order-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 font-mono text-[0.65rem] tracking-[0.25em] text-primary uppercase">
                <span className="h-1 w-1 rounded-full bg-current" />
                {t.about.storyEyebrow}
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-balance md:text-4xl">
                {t.about.storyTitle}
              </h2>
              <div className="mt-6 space-y-4 leading-relaxed text-muted-foreground">
                <p>{t.about.storyP1}</p>
                <p>{t.about.storyP2}</p>
                <p>{t.about.storyP3}</p>
              </div>
            </Reveal>

            <Reveal variant="scale" delay={120} className="order-1 lg:order-2">
              <div className="group relative aspect-4/5 overflow-hidden rounded-3xl">
                <Image
                  src="/TUCSP3.jpg"
                  alt="Integrantes de la Tuna Universitaria UCSP con el traje tradicional"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Stats ---------- */}
      <section className="border-y border-border/60 bg-secondary/40 py-16">
        <div className="container mx-auto px-4">
          <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map(({ value, suffix, label }, index) => (
              <Reveal key={label} delay={index * 90} className="text-center">
                <dt className="sr-only">{label}</dt>
                <dd>
                  <CountUp
                    to={value}
                    suffix={suffix}
                    className="block text-4xl font-bold text-primary tabular-nums md:text-5xl"
                  />
                  <span className="mt-2 block text-xs leading-snug text-muted-foreground md:text-sm">
                    {label}
                  </span>
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- Values ---------- */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-[0.35] mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="relative container mx-auto px-4">
          <SectionHeading
            eyebrow={t.about.valuesEyebrow}
            title={t.about.valuesTitle}
            subtitle={t.about.valuesSubtitle}
          />

          <ul className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, description }, index) => (
              <Reveal as="li" key={title} delay={index * 90}>
                <SpotlightCard className="h-full">
                  <div className="flex h-full flex-col p-7">
                    <span className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-transform duration-500 ease-out-expo group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                  </div>
                </SpotlightCard>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Timeline ---------- */}
      <section className="relative overflow-hidden bg-[oklch(0.14_0_0)] py-24 text-white md:py-32">
        <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-overlay" />
        <div className="relative container mx-auto px-4">
          <SectionHeading
            invert
            eyebrow={t.about.timelineEyebrow}
            title={t.about.timelineTitle}
            subtitle={t.about.timelineSubtitle}
          />

          <ol className="relative mx-auto mt-16 max-w-3xl">
            {/* Spine */}
            <span
              aria-hidden="true"
              className="absolute top-2 bottom-2 left-1.75 w-px bg-linear-to-b from-primary/60 via-white/20 to-transparent"
            />
            {milestones.map(({ year, title, description }, index) => (
              <Reveal as="li" key={year} delay={index * 110} className="relative pb-12 pl-10 last:pb-0">
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 left-0 flex h-4 w-4 items-center justify-center rounded-full border border-primary/60 bg-[oklch(0.14_0_0)]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                <span className="font-mono text-xs tracking-[0.25em] text-primary uppercase">
                  {year}
                </span>
                <h3 className="mt-2 text-xl font-semibold">{title}</h3>
                <p className="mt-2 leading-relaxed text-white/60">{description}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Closing CTA ---------- */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <Reveal variant="scale">
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary px-8 py-16 text-center text-primary-foreground md:px-16 md:py-20">
              <Image
                src={LOGO_SRC}
                alt=""
                aria-hidden="true"
                width={600}
                height={600}
                className="pointer-events-none absolute -top-20 -left-16 w-96 max-w-none opacity-[0.07] mix-blend-overlay select-none"
              />
              <h2 className="relative mx-auto max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-4xl">
                {t.about.ctaTitle}
              </h2>
              <p className="relative mx-auto mt-4 max-w-lg text-balance text-white/80">
                {t.about.ctaSubtitle}
              </p>
              <Button size="lg" variant="secondary" asChild className="group relative mt-9 h-12 px-8 font-semibold">
                <Link href="/#contacto">
                  {t.about.ctaButton}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
