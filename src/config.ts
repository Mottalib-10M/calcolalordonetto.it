/** Central site configuration — single source of truth for brand values */
export const SITE = {
  name: 'Calcola Lordo Netto',
  nameEn: 'Italian Tax Calculator',
  domain: 'calcolalordonetto.it',
  url: 'https://calcolalordonetto.it',
  tagline: 'Dal lordo al netto in pochi secondi',
  taglineEn: 'From gross to net in seconds',
  locale: 'it-IT',
  localeEn: 'en-US',
  annoFiscale: 2026,
  author: {
    name: 'Mottalib Radif',
    title: 'MBA INSEAD, Esperto di finanza personale e fiscalità',
    url: 'https://calcolalordonetto.it/chi-siamo/',
    email: 'contact@calcolalordonetto.it',
  },
  colors: {
    primary: '#E63946',
    white: '#FFFFFF',
    charcoal: '#1F2937',
    lightGray: '#F3F4F6',
  },
} as const;

export type SiteConfig = typeof SITE;
