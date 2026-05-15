import { SITE } from '../config';

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

/** Generate FAQPage schema */
export function faqSchema(
  faqs: { question: string; answer: string }[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/** Generate WebApplication schema for calculator pages */
export function webAppSchema(
  name: string,
  description: string,
  url: string
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    inLanguage: 'it-IT',
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
