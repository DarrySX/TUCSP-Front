'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/providers';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-foreground text-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <span className="text-foreground font-bold">♪</span>
              </div>
              <span className="font-bold">UCSP Tuna</span>
            </div>
            <p className="text-sm text-white/70">Professional live music for your events</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-white/70 hover:text-white transition">Home</Link></li>
              <li><Link href="#services" className="text-white/70 hover:text-white transition">{t.footer.services}</Link></li>
              <li><Link href="#packages" className="text-white/70 hover:text-white transition">{t.header.packages}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Info</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#about" className="text-white/70 hover:text-white transition">{t.footer.about}</Link></li>
              <li><Link href="#contact" className="text-white/70 hover:text-white transition">{t.footer.contact}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t.footer.followUs}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-white/70 hover:text-white transition">Instagram</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-white transition">Facebook</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-white transition">Twitter</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-sm text-white/70 space-y-2">
          <p>&copy; 2025 UCSP Tuna. {t.footer.rights} Built with passion for music.</p>
          <p>
            Creado por{' '}
            <Link
              href="https://www.linkedin.com/in/brandon-valenciac/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white transition-colors duration-200 underline underline-offset-2 decoration-white/30 hover:decoration-white/70"
            >
              Brandon Valencia Calderón
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
