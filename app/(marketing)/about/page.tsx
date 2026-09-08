import type { Metadata } from 'next';
import { AboutContent } from '@/components/about/about-content';

export const metadata: Metadata = {
  title: 'Acerca de | Tuna Universitaria UCSP',
  description:
    'Conoce la historia, los valores y la trayectoria de la Tuna Universitaria de la Universidad Católica San Pablo: música, tradición y hermandad desde Arequipa.',
};

export default function AboutPage() {
  return <AboutContent />;
}
