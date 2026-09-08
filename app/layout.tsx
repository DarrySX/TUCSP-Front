import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { LanguageProvider } from '@/app/providers';
import './globals.css';

// `variable` exposes each font as a CSS custom property that globals.css maps
// onto --font-sans / --font-mono. Without it the generated family name never
// reaches the stylesheet and the browser silently falls back to a system font.
const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  // Resolves relative Open Graph image paths to absolute URLs.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Tuna Universitaria UCSP — Música en vivo para tus eventos',
    template: '%s | Tuna Universitaria UCSP',
  },
  description:
    'La Tuna de la Universidad Católica San Pablo lleva música en vivo, tradición y energía a bodas, ceremonias, serenatas y celebraciones en Arequipa.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/LogoTUCSP.png', type: 'image/png' },
    ],
    apple: '/LogoTUCSP.png',
  },
  openGraph: {
    title: 'Tuna Universitaria UCSP',
    description: 'Música en vivo, tradición y espíritu estudiantil desde Arequipa.',
    type: 'website',
    locale: 'es_PE',
    images: ['/Grupal1.jpg'],
  },
};

export const viewport: Viewport = {
  // Matches the hero/preloader backdrop so mobile browser chrome blends in.
  themeColor: '#1f1f1f',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
