'use client';

import { useState } from 'react';
import { Check, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Reveal } from '@/components/motion/reveal';
import { SectionHeading } from '@/components/landing/section-heading';
import { useLanguage } from '@/app/providers';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function ContactForm() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !details.trim()) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), details: details.trim() }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? t.contact.genericError);

      setStatus('success');
      setName('');
      setPhone('');
      setDetails('');

      // Open WhatsApp in a new tab with the message pre-filled.
      if (data.waUrl) {
        window.open(data.waUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : t.contact.genericError);
    }
  }

  const isLoading = status === 'loading';

  return (
    <section id="contacto" className="relative scroll-mt-24 overflow-hidden py-24 md:py-36">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-[0.35] mask-[radial-gradient(ellipse_at_center,black,transparent_70%)]" />

      <div className="relative container mx-auto px-4">
        <SectionHeading
          eyebrow={t.contact.eyebrow}
          title={t.contact.title}
          subtitle={t.contact.subtitle}
        />

        <Reveal className="mx-auto mt-14 max-w-2xl">
          {status === 'success' ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-10 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Check className="h-7 w-7" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold">{t.contact.successTitle}</h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                {t.contact.successBody}
              </p>
              <Button variant="outline" className="mt-6" onClick={() => setStatus('idle')}>
                {t.contact.sendAnother}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-2xl border border-border/70 bg-card p-7 shadow-[0_24px_70px_-40px_oklch(0.4_0.18_307/0.5)] md:p-9"
            >
              {status === 'error' && (
                <p
                  role="alert"
                  className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                >
                  {errorMsg || t.contact.genericError}
                </p>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold" htmlFor="contact-name">
                  {t.contact.nameLabel} <span className="text-destructive">*</span>
                </label>
                <Input
                  id="contact-name"
                  placeholder={t.contact.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold" htmlFor="contact-phone">
                  {t.contact.phoneLabel}
                </label>
                <Input
                  id="contact-phone"
                  type="tel"
                  placeholder="+51 999 999 999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold" htmlFor="contact-details">
                  {t.contact.detailsLabel} <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="contact-details"
                  placeholder={t.contact.detailsPlaceholder}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  required
                  disabled={isLoading}
                  rows={5}
                  className="resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !name.trim() || !details.trim()}
                className="group h-12 w-full text-base font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.contact.sending}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    {t.contact.submit}
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">{t.contact.disclaimer}</p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
