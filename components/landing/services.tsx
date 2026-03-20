'use client';

import { useLanguage } from '@/app/providers';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Services() {
  const { t } = useLanguage();

  const services = [
    {
      title: t.services.serenadeTitle,
      description: t.services.serenadeDesc,
      price: t.services.serenadePrice,
      features: ['2-3 musicians', 'Acoustic setup', '1-2 hours'],
    },
    {
      title: t.services.ceremonyTitle,
      description: t.services.ceremonyDesc,
      price: t.services.ceremonyPrice,
      features: ['3-4 musicians', 'Full setup', '2-3 hours'],
      featured: true,
    },
    {
      title: t.services.celebrationTitle,
      description: t.services.celebrationDesc,
      price: t.services.celebrationPrice,
      features: ['5+ musicians', 'Complete equipment', '3-5 hours'],
    },
    {
      title: t.services.customTitle,
      description: t.services.customDesc,
      price: t.services.customPrice,
      features: ['Custom size', 'Custom duration', 'Full customization'],
    },
  ];

  return (
    <section id="packages" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">{t.services.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.services.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className={`rounded-xl p-8 transition-all ${
                service.featured
                  ? 'bg-primary text-white shadow-lg scale-105'
                  : 'bg-secondary border border-border'
              }`}
            >
              <h3 className={`font-bold text-xl mb-2 ${service.featured ? 'text-white' : ''}`}>
                {service.title}
              </h3>
              <p
                className={`text-sm mb-4 ${
                  service.featured ? 'text-white/90' : 'text-muted-foreground'
                }`}
              >
                {service.description}
              </p>

              <div className="mb-6">
                <p className={`text-2xl font-bold mb-4 ${service.featured ? 'text-white' : 'text-primary'}`}>
                  {service.price}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, fIndex) => (
                    <li
                      key={fIndex}
                      className={`text-sm flex items-center gap-2 ${
                        service.featured ? 'text-white/80' : 'text-foreground'
                      }`}
                    >
                      <span>✓</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                size="sm"
                className="w-full"
                variant={service.featured ? 'secondary' : 'default'}
                asChild
              >
                <Link href="#contact">{t.cta.button1}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
