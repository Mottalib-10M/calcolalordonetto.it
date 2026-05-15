/** Central site configuration — single source of truth for brand values */
export const SITE = {
  name: 'Calcola Lordo Netto',
  domain: 'calcolalordonetto.it',
  url: 'https://calcolalordonetto.it',
  tagline: 'Dal lordo al netto in pochi secondi',
  locale: 'it-IT',
  annoFiscale: 2026,
  colors: {
    primary: '#E63946',
    white: '#FFFFFF',
    charcoal: '#1F2937',
    lightGray: '#F3F4F6',
  },
} as const;

export type SiteConfig = typeof SITE;
