import { SITE } from '../config';
import type { Lang } from '../i18n/types';

export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  schema?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Validates SEO constraints per brief:
 * - Title: 50–60 characters, NO brand name
 * - Description: 150–160 characters
 */
export function validateSEO(props: SEOProps): string[] {
  const warnings: string[] = [];

  if (props.title.length < 50)
    warnings.push(`Title too short (${props.title.length}/50-60): "${props.title}"`);
  if (props.title.length > 60)
    warnings.push(`Title too long (${props.title.length}/50-60): "${props.title}"`);
  if (props.title.includes(SITE.name))
    warnings.push(`Title contains brand name: "${props.title}"`);

  if (props.description.length < 150)
    warnings.push(
      `Description too short (${props.description.length}/150-160): "${props.description}"`
    );
  if (props.description.length > 160)
    warnings.push(
      `Description too long (${props.description.length}/150-160): "${props.description}"`
    );

  return warnings;
}

/** Build canonical URL from a path (always with trailing slash) */
export function canonicalURL(path: string): string {
  const base = SITE.url.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${cleanPath}`;
  return url.endsWith('/') ? url : `${url}/`;
}

/** Build default OG image URL */
export function ogImageURL(path?: string): string {
  if (path) return `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`;
  return `${SITE.url}/og-default.png`;
}

/** Generate BreadcrumbList schema */
export function breadcrumbSchema(
  items: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Ce que le balisage déclare : la réponse entière, ou ses premières phrases.
 *
 * Une réponse de 140 mots est utile au lecteur, mais Google tronque l'extrait
 * enrichi bien avant et §7 fixe la limite à 90 mots. Plutôt que d'amputer la
 * page, on ne déclare que les premières phrases complètes, dans cette limite.
 * Le texte déclaré reste alors, mot pour mot, un début du texte servi : la
 * promesse faite au moteur est tenue par la page.
 */
// Marge de deux mots : une entité HTML ou une espace insécable présente dans le
// texte compte pour un mot de plus une fois décodée par le contrôle, si bien
// qu'une coupe à 90 pouvait en donner 91 (2026-09-24).
function estratto(testo: string, massimo = 88): string {
  const parole = testo.trim().split(/\s+/);
  if (parole.length <= massimo) return testo.trim();
  // Une fin de phrase est un point suivi d'une espace et d'une majuscule.
  // Couper sur tout point cassait « 6.91% » en deux et produisait une phrase
  // fausse, absente de la page (calcolalordonetto.it, 2026-09-24).
  const frasi = testo.split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý])/);
  const presi: string[] = [];
  let n = 0;
  for (const frase of frasi) {
    const m = frase.trim().split(/\s+/).length;
    if (n + m > massimo && n >= 40) break;
    presi.push(frase);
    n += m;
  }
  let out = presi.join('').trim();
  // Une énumération peut à elle seule dépasser la limite : on coupe alors à la
  // dernière virgule utile plutôt qu'en plein mot.
  const mots = out.split(/\s+/);
  if (mots.length > massimo) {
    const corto = mots.slice(0, massimo).join(' ');
    const i = Math.max(corto.lastIndexOf(','), corto.lastIndexOf(';'));
    out = (i > 0 ? corto.slice(0, i) : corto).replace(/[,;\s]+$/, '') + '.';
  }
  return out;
}

/** Generate FAQPage schema */
export function faqSchema(
  faqs: { question: string; answer: string }[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    // §7 plafonne à huit questions déclarées : au-delà, l'extrait enrichi n'en
    // retient de toute façon qu'une poignée. La page peut en afficher davantage,
    // on ne déclare que les huit premières — déclarer un sous-ensemble est
    // permis, déclarer ce qui n'est pas sur la page ne l'est pas.
    mainEntity: faqs.slice(0, 8).map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: estratto(faq.answer),
      },
    })),
  };
}

/** Generate WebApplication schema for calculator pages */
export function webAppSchema(
  name: string,
  description: string,
  url: string,
  lang: Lang = 'it'
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    inLanguage: lang === 'en' ? SITE.localeEn : SITE.locale,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    provider: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
  };
}
