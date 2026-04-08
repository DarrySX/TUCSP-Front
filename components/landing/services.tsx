'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function Services() {
  const [name, setName]         = useState('');
  const [details, setDetails]   = useState('');
  const [status, setStatus]     = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
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
        body: JSON.stringify({ name: name.trim(), details: details.trim() }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Error al enviar');

      setStatus('success');
      setName('');
      setDetails('');

      // Open WhatsApp in new tab with pre-filled message
      if (data.waUrl) {
        window.open(data.waUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Error al enviar el mensaje');
    }
  }

  return (
    <section id="contact-form" className="py-20 md:py-28 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
                Contáctanos
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                ¿Tienes un evento especial?
              </h2>
              <p className="text-muted-foreground text-lg">
                Cuéntanos los detalles y nos pondremos en contacto contigo a la brevedad.
              </p>
            </div>

            {status === 'success' ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center space-y-3">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-800">¡Mensaje enviado!</h3>
                <p className="text-green-700 text-sm leading-relaxed">
                  Tu solicitud llegó a nuestro correo y se abrió WhatsApp con los detalles para que puedas enviarlo directamente.
                  <br/>Te responderemos a la brevedad.
                </p>
                <Button
                  variant="outline"
                  className="mt-2 border-green-300 text-green-700 hover:bg-green-50"
                  onClick={() => setStatus('idle')}
                >
                  Enviar otra solicitud
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-background border rounded-2xl p-8 shadow-sm space-y-5">
                {status === 'error' && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-sm text-destructive">
                    {errorMsg || 'Ocurrió un error. Intenta de nuevo.'}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold" htmlFor="contact-name">
                    Nombre de contacto <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="contact-name"
                    placeholder="Tu nombre completo o empresa"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={status === 'loading'}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold" htmlFor="contact-details">
                    Detalles del evento <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    id="contact-details"
                    placeholder="Cuéntanos el tipo de evento, fecha aproximada, lugar, cantidad de personas, ocasión especial..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    required
                    disabled={status === 'loading'}
                    rows={5}
                    className="resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <Button
                    type="submit"
                    disabled={status === 'loading' || !name.trim() || !details.trim()}
                    className="flex-1 h-11 text-base font-semibold"
                  >
                    {status === 'loading' ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                        </svg>
                        Enviando...
                      </span>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                        </svg>
                        Enviar solicitud
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center pt-1">
                  Al enviar, recibiremos tu solicitud por correo y WhatsApp para responderte rápidamente.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
  );
}
