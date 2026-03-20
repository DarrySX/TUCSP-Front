'use client';

import { useLanguage } from '@/app/providers';

export function Features() {
  const { t } = useLanguage();

  const features = [
    {
      title: t.features.feature1Title,
      description: t.features.feature1Desc,
      icon: '🎵',
    },
    {
      title: t.features.feature2Title,
      description: t.features.feature2Desc,
      icon: '🎼',
    },
    {
      title: t.features.feature3Title,
      description: t.features.feature3Desc,
      icon: '💰',
    },
    {
      title: t.features.feature4Title,
      description: t.features.feature4Desc,
      icon: '🎧',
    },
    {
      title: t.features.feature5Title,
      description: t.features.feature5Desc,
      icon: '⏰',
    },
    {
      title: t.features.feature6Title,
      description: t.features.feature6Desc,
      icon: '⭐',
    },
  ];

  return (
    <section id="services" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">{t.features.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
