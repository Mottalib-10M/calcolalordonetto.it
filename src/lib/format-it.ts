/**
 * Italian number and currency formatting utilities.
 *
 * Conventions:
 * - Comma as decimal separator
 * - Period as thousands separator
 * - Currency symbol AFTER the number with non-breaking space: 1.234,56 €
 */

const itNumberFormat = new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const itCurrencyFormat = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const itCurrencyNoDecFormat = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const itPercentFormat = new Intl.NumberFormat('it-IT', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a number with Italian conventions: 1.234,56 */
export function formatNumber(value: number, decimals?: number): string {
  if (decimals !== undefined) {
    return new Intl.NumberFormat('it-IT', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
  return itNumberFormat.format(value);
}

/** Format currency: 1.234,56 € */
export function formatCurrency(value: number): string {
  return itCurrencyFormat.format(value);
}

/** Format currency without decimals: 1.235 € */
export function formatCurrencyRound(value: number): string {
  return itCurrencyNoDecFormat.format(value);
}

/** Format as percentage: 23,00% */
export function formatPercent(value: number): string {
  return itPercentFormat.format(value);
}

/** Format percentage from a rate (0.23 → "23,00%") */
export function formatRate(rate: number): string {
  return itPercentFormat.format(rate);
}

/** Parse an Italian-formatted number string back to a number */
export function parseItNumber(str: string): number {
  const cleaned = str
    .replace(/\s/g, '')
    .replace(/€/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
