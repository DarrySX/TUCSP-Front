'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import { useLanguage } from '@/app/providers';
import { LOGO_SRC } from '@/lib/site-assets';

const SOCIALS = [
  { href: 'https://www.instagram.com/', label: 'Instagram', Icon: Instagram },
  { href: 'https://www.facebook.com/', label: 'Facebook', Icon: Facebook },
  { href: 'https://www.youtube.com/', label: 'YouTube', Icon: Youtube },
] as const;

export function Footer() {
  const { t } = useLanguage();

  const columns = [
    {
      heading: t.footer.navigate,
      links: [
        { href: '/', label: t.footer.home },
        { href: '/about', label: t.footer.about },
        { href: '/#servicios', label: t.footer.services },
        { href: '/#galeria', label: t.footer.gallery },
      ],
    },
    {
      heading: t.footer.contact,
      links: [
        { href: '/#contacto', label: t.footer.bookUs },
        { href: '/#testimonios', label: t.footer.testimonials },
        { href: '/auth/login', label: t.footer.memberAccess },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-[oklch(0.12_0_0)] text-white">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-[0.05]" />

      <div className="relative container mx-auto px-4 py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center" aria-label="Tuna Universitaria UCSP">
              <Image
                src={LOGO_SRC}
                alt="Tuna Universitaria UCSP"
                width={200}
                height={100}
                className="h-20 w-auto object-contain brightness-0 invert transition-transform duration-500 hover:scale-105"
              />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
              {t.footer.tagline}
            </p>

            <div className="mt-7 flex items-center gap-3">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map(({ heading, links }) => (
            <nav key={heading} aria-label={heading}>
              <h2 className="font-mono text-[0.65rem] tracking-[0.25em] text-white/40 uppercase">
                {heading}
              </h2>
              <ul className="mt-5 space-y-3 text-sm">
                {links.map(({ href, label }) => (
                  <li key={`${heading}-${href}`}>
                    <Link
                      href={href}
                      className="inline-block text-white/70 transition-all duration-300 hover:translate-x-1 hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-xs text-white/45 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} Tuna Universitaria UCSP. {t.footer.rights}
          </p>
          <p>
            {t.footer.builtBy}{' '}
            <a
              href="https://www.linkedin.com/in/brandon-valenciac/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white hover:decoration-white/70"
            >
              Brandon Valencia Calderón
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
