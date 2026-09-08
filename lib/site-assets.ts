/**
 * Single source of truth for the marketing site's imagery.
 *
 * To add a photo to the gallery, drop the file in `public/` and add one entry to
 * `galleryImages`. Nothing else needs to change — the carousel, the preloader
 * budget and the lightbox all read from here.
 */

export const LOGO_SRC = '/LogoTUCSP.png';

export interface GalleryImage {
  src: string;
  /** Describes the photo for screen readers. Keep it specific, not "foto". */
  alt: string;
  /** Short caption rendered over the slide. */
  caption: string;
  /** `true` renders the slide at double width on desktop. */
  wide?: boolean;
}

export const galleryImages: GalleryImage[] = [
  {
    src: '/TUCSP1.jpg',
    alt: 'La Tuna Universitaria UCSP interpretando en un escenario iluminado',
    caption: 'Viajes',
    wide: true,
  },
  {
    src: '/Esce1.jpg',
    alt: 'Integrantes de la tuna tocando bandurria durante una presentación',
    caption: 'Certámenes',
  },
  {
    src: '/Grupal2.jpg',
    alt: 'Fotografía grupal de los integrantes de la Tuna UCSP con sus capas',
    caption: 'Presentaciones',
  },
  {
    src: '/Esce2.jpg',
    alt: 'Presentación de la tuna ante el público universitario',
    caption: 'Certámenes',
  },
  {
    src: '/TUCSP2.jpg',
    alt: 'Integrantes de la tuna durante una serenata nocturna',
    caption: 'Serenatas',
  },
  {
    src: '/Esce3.jpg',
    alt: 'La tuna acompañando una ceremonia institucional',
    caption: 'Ceremonias',
  },
  {
    src: '/TUCSP3.jpg',
    alt: 'Detalle de los instrumentos y el traje tradicional de la tuna',
    caption: 'Premios',
    wide: true,
  },
  {
    src: '/Esce4.jpg',
    alt: 'Cierre de una presentación de la Tuna UCSP',
    caption: 'Pasacalles',
  },
];

/**
 * Assets the preloader waits on before handing the viewport to the page.
 * Deliberately limited to what is visible above the fold — waiting on the whole
 * gallery would hold the curtain for several seconds on a slow connection.
 */
export const criticalAssets: readonly string[] = [
  LOGO_SRC,
  '/Grupal1.jpg',
  '/TUCSP1.jpg',
];
