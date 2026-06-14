/**
 * Bidirectional IT ↔ EN URL mapping.
 * Italian paths are the canonical slugs; English paths live under /en/.
 */

/** Map from IT path to EN path */
export const itToEn: Record<string, string> = {
  // Calculators
  '/': '/en/',
  '/calcolo-stipendio-lordo/': '/en/gross-salary-calculator/',
  '/calcolo-irpef/': '/en/irpef-tax-calculator/',
  '/calcolo-busta-paga/': '/en/payslip-calculator/',
  '/comparatore-regioni/': '/en/region-comparison/',
  '/calcolo-tredicesima/': '/en/thirteenth-month-calculator/',
  '/calcolo-quattordicesima/': '/en/fourteenth-month-calculator/',
  '/calcolo-tfr/': '/en/severance-pay-calculator/',
  '/calcolo-paga-oraria/': '/en/hourly-rate-calculator/',
  '/costo-aziendale/': '/en/employer-cost-calculator/',
  '/calcolo-ferie-permessi/': '/en/leave-calculator/',
  '/calcolo-buonuscita/': '/en/public-sector-severance/',
  '/calcolo-detrazioni-familiari/': '/en/family-tax-deductions/',
  '/calcolo-forfettari/': '/en/flat-rate-regime-calculator/',
  '/regime-impatriati-calcolatore/': '/en/impatriati-tax-regime/',
  '/confronto-dipendente-piva/': '/en/employee-vs-freelancer/',
  '/calcolo-isee/': '/en/isee-calculator/',
  '/calcolo-mutuo/': '/en/mortgage-calculator/',
  '/calcolo-interesse-composto/': '/en/compound-interest-calculator/',
  '/calcolo-pensione/': '/en/pension-calculator/',
  '/calcolo-fire/': '/en/fire-calculator/',
  '/calcolo-tassazione-investimenti/': '/en/investment-tax-calculator/',
  '/confronto-affitto-acquisto/': '/en/rent-vs-buy/',
  '/calcolo-bonus-ristrutturazione/': '/en/renovation-bonus-calculator/',
  '/calcolo-plusvalenza-immobiliare/': '/en/property-capital-gains/',
  '/calcolo-budget/': '/en/budget-calculator/',
  '/calcolo-prestito/': '/en/loan-calculator/',
  '/calcolo-piano-accumulo/': '/en/savings-plan-calculator/',
  '/calcolo-inflazione/': '/en/inflation-calculator/',

  // RAL / Salary landing pages
  '/ral/': '/en/salary/',
  '/ral/15000-euro-netto/': '/en/salary/15000-euro-net/',
  '/ral/18000-euro-netto/': '/en/salary/18000-euro-net/',
  '/ral/20000-euro-netto/': '/en/salary/20000-euro-net/',
  '/ral/22000-euro-netto/': '/en/salary/22000-euro-net/',
  '/ral/25000-euro-netto/': '/en/salary/25000-euro-net/',
  '/ral/27000-euro-netto/': '/en/salary/27000-euro-net/',
  '/ral/28000-euro-netto/': '/en/salary/28000-euro-net/',
  '/ral/30000-euro-netto/': '/en/salary/30000-euro-net/',
  '/ral/32000-euro-netto/': '/en/salary/32000-euro-net/',
  '/ral/35000-euro-netto/': '/en/salary/35000-euro-net/',
  '/ral/38000-euro-netto/': '/en/salary/38000-euro-net/',
  '/ral/40000-euro-netto/': '/en/salary/40000-euro-net/',
  '/ral/42000-euro-netto/': '/en/salary/42000-euro-net/',
  '/ral/45000-euro-netto/': '/en/salary/45000-euro-net/',
  '/ral/50000-euro-netto/': '/en/salary/50000-euro-net/',
  '/ral/55000-euro-netto/': '/en/salary/55000-euro-net/',
  '/ral/60000-euro-netto/': '/en/salary/60000-euro-net/',
  '/ral/65000-euro-netto/': '/en/salary/65000-euro-net/',
  '/ral/70000-euro-netto/': '/en/salary/70000-euro-net/',
  '/ral/80000-euro-netto/': '/en/salary/80000-euro-net/',
  '/ral/90000-euro-netto/': '/en/salary/90000-euro-net/',
  '/ral/100000-euro-netto/': '/en/salary/100000-euro-net/',
  '/ral/120000-euro-netto/': '/en/salary/120000-euro-net/',
  '/ral/150000-euro-netto/': '/en/salary/150000-euro-net/',

  // Monthly salary landing pages
  '/stipendio-mensile/': '/en/monthly-salary/',
  '/stipendio-mensile/1000-euro/': '/en/monthly-salary/1000-euro/',
  '/stipendio-mensile/1200-euro/': '/en/monthly-salary/1200-euro/',
  '/stipendio-mensile/1300-euro/': '/en/monthly-salary/1300-euro/',
  '/stipendio-mensile/1400-euro/': '/en/monthly-salary/1400-euro/',
  '/stipendio-mensile/1500-euro/': '/en/monthly-salary/1500-euro/',
  '/stipendio-mensile/1600-euro/': '/en/monthly-salary/1600-euro/',
  '/stipendio-mensile/1700-euro/': '/en/monthly-salary/1700-euro/',
  '/stipendio-mensile/1800-euro/': '/en/monthly-salary/1800-euro/',
  '/stipendio-mensile/2000-euro/': '/en/monthly-salary/2000-euro/',
  '/stipendio-mensile/2200-euro/': '/en/monthly-salary/2200-euro/',
  '/stipendio-mensile/2500-euro/': '/en/monthly-salary/2500-euro/',
  '/stipendio-mensile/2800-euro/': '/en/monthly-salary/2800-euro/',
  '/stipendio-mensile/3000-euro/': '/en/monthly-salary/3000-euro/',
  '/stipendio-mensile/3500-euro/': '/en/monthly-salary/3500-euro/',
  '/stipendio-mensile/4000-euro/': '/en/monthly-salary/4000-euro/',
  '/stipendio-mensile/5000-euro/': '/en/monthly-salary/5000-euro/',

  // Guides
  '/guide/': '/en/guides/',
  '/guide/come-si-calcola-lo-stipendio-netto/': '/en/guides/how-to-calculate-net-salary/',
  '/guide/scaglioni-irpef-2026/': '/en/guides/irpef-tax-brackets-2026/',
  '/guide/cuneo-fiscale-2026/': '/en/guides/tax-wedge-2026/',
  '/guide/busta-paga-come-leggerla/': '/en/guides/how-to-read-italian-payslip/',
  '/guide/regime-forfettario-2026/': '/en/guides/flat-rate-regime-2026/',
  '/guide/regime-impatriati/': '/en/guides/impatriati-tax-regime/',
  '/guide/addizionali-regionali-comunali/': '/en/guides/regional-municipal-surcharges/',
  '/guide/tredicesima-quattordicesima/': '/en/guides/thirteenth-fourteenth-month-pay/',
  '/guide/tfr-come-funziona/': '/en/guides/how-tfr-severance-works/',

  // Static pages
  '/chi-siamo/': '/en/about/',
  '/contatti/': '/en/contact/',
  '/privacy/': '/en/privacy/',
  '/termini/': '/en/terms/',
  '/cookie-policy/': '/en/cookie-policy/',
  '/note-legali/': '/en/legal-notice/',
};

/** Map from EN path to IT path */
export const enToIt: Record<string, string> = Object.fromEntries(
  Object.entries(itToEn).map(([it, en]) => [en, it])
);

/** Get the alternate language URL for a given path */
export function getAlternatePath(path: string, currentLang: 'it' | 'en'): string | null {
  if (currentLang === 'it') return itToEn[path] ?? null;
  return enToIt[path] ?? null;
}
