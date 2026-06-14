/**
 * Locale-aware number and currency formatting.
 *
 * IT: 1.234,56 €   (period = thousands, comma = decimal, € after)
 * EN: €1,234.56    (comma = thousands, period = decimal, € before)
 */
import type { Lang } from '../i18n/types';

// ── Italian formatters (re-export existing behavior) ─────────────────────────

const itNumber = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const itCurrency = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const itCurrencyNoDec = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const itPercent = new Intl.NumberFormat('it-IT', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── English formatters ───────────────────────────────────────────────────────

const enNumber = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const enCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const enCurrencyNoDec = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const enPercent = new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Public API ───────────────────────────────────────────────────────────────

export function formatNumber(value: number, lang: Lang, decimals?: number): string {
  if (decimals !== undefined) {
    return new Intl.NumberFormat(lang === 'it' ? 'it-IT' : 'en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
  return (lang === 'it' ? itNumber : enNumber).format(value);
}

export function formatCurrency(value: number, lang: Lang): string {
  return (lang === 'it' ? itCurrency : enCurrency).format(value);
}

export function formatCurrencyRound(value: number, lang: Lang): string {
  return (lang === 'it' ? itCurrencyNoDec : enCurrencyNoDec).format(value);
}

export function formatPercent(value: number, lang: Lang): string {
  return (lang === 'it' ? itPercent : enPercent).format(value);
}

export function formatRate(rate: number, lang: Lang): string {
  return (lang === 'it' ? itPercent : enPercent).format(rate);
}

/** Parse a user-entered number string (handles both IT and EN formats) */
export function parseNumber(str: string, lang: Lang): number {
  const cleaned = str.replace(/\s/g, '').replace(/€/g, '');
  if (lang === 'it') {
    const num = parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
    return isNaN(num) ? 0 : num;
  }
  const num = parseFloat(cleaned.replace(/,/g, ''));
  return isNaN(num) ? 0 : num;
}
