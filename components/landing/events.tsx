'use client';

import { useLanguage } from '@/app/providers';

export function Events() {
  const { t } = useLanguage();

  const testimonials = [
    {
      id: 1,
      name: 'María García',
      event: t.testimonials.testimonial1Event,
      text: t.testimonials.testimonial1Text,
      rating: 5,
    },
    {
      id: 2,
      name: 'Carlos López',
      event: t.testimonials.testimonial2Event,
      text: t.testimonials.testimonial2Text,
      rating: 5,
    },
    {
      id: 3,
      name: 'Ana Martínez',
      event: t.testimonials.testimonial3Event,
      text: t.testimonials.testimonial3Text,
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">{t.testimonials.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.testimonials.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="mb-4 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-primary text-lg">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-foreground mb-4 text-sm italic">"{testimonial.text}"</p>
              <div>
                <p className="font-semibold text-sm">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
