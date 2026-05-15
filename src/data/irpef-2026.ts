/**
 * IRPEF 2026 — Italian Personal Income Tax Data
 *
 * Sources:
 * - TUIR (Testo Unico delle Imposte sui Redditi), D.P.R. 917/1986, Art. 11, 13
 * - Legge di Bilancio 2026 (L. 207/2025)
 * - D.Lgs. 216/2023 (riforma fiscale) reso strutturale
 *
 * All monetary values are in EUR. All rates are expressed as decimals (0.23 = 23%).
 */

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

/** A single IRPEF tax bracket (scaglione). */
export interface ScaglioneIRPEF {
  /** Upper income limit in EUR. `null` means no upper limit (last bracket). */
  limiteSuperiore: number | null;
  /** Marginal tax rate as a decimal (e.g. 0.23 = 23%). */
  aliquota: number;
}

/** A band within the Cuneo Fiscale system. */
export interface FasciaCuneoFiscale {
  /** Lower income bound (inclusive), EUR. */
  limiteInferiore: number;
  /** Upper income bound (inclusive), EUR. */
  limiteSuperiore: number;
  /** Whether this band grants a tax-exempt sum or an IRPEF deduction. */
  tipo: 'somma_esente' | 'detrazione';
  /**
   * For `somma_esente`: percentage of income (as decimal, e.g. 0.071 = 7.1%).
   * For `detrazione`: fixed yearly EUR value (may phase out — see `fasciaCuneoFiscalePhaseOut`).
   */
  percentualeOValore: number;
}

/** A band for the spouse tax credit (detrazione coniuge a carico). */
export interface FasciaDetrazioneConiuge {
  /** Lower income bound (inclusive), EUR. */
  limiteInferiore: number;
  /** Upper income bound (inclusive), EUR. `Infinity` for the last open band. */
  limiteSuperiore: number;
  /**
   * Fixed deduction amount in EUR, or `null` when the deduction is computed
   * via formula (see `calcolaDetrazioneConiuge` for boundary bands).
   */
  importoFisso: number | null;
}

/** A band for the employment tax credit (detrazione lavoro dipendente). */
export interface FasciaDetrazioneLavoroDipendente {
  /** Lower income bound (inclusive), EUR. */
  limiteInferiore: number;
  /** Upper income bound (inclusive), EUR. */
  limiteSuperiore: number;
  /**
   * Description of the formula applied in this band.
   * The actual computation is in `calcolaDetrazioneLavoroDipendente`.
   */
  descrizione: string;
}

// ---------------------------------------------------------------------------
// IRPEF Scaglioni (Tax Brackets) 2026
// ---------------------------------------------------------------------------

/**
 * IRPEF tax brackets for 2026.
 *
 * Three-bracket system, confirmed by Legge di Bilancio 2026:
 * - Up to €28,000 → 23%
 * - €28,001–€50,000 → 33% (reduced from 35% by L. 207/2025)
 * - Above €50,000 → 43%
 *
 * @see TUIR Art. 11 as amended by Legge di Bilancio 2026
 */
export const SCAGLIONI_IRPEF_2026: readonly ScaglioneIRPEF[] = [
  { limiteSuperiore: 28_000, aliquota: 0.23 },
  { limiteSuperiore: 50_000, aliquota: 0.33 },
  { limiteSuperiore: null, aliquota: 0.43 },
] as const;

// ---------------------------------------------------------------------------
// Detrazione Lavoro Dipendente (Employment Tax Credit) 2026
// ---------------------------------------------------------------------------

/**
 * Employment income tax credit — piecewise formula.
 *
 * The raw credit must be prorated: `detrazione × (giorni_lavoro / 365)`.
 *
 * Bands:
 * 1. Reddito ≤ €15,000 → €1,955 (min €690 permanent / €1,380 fixed-term)
 * 2. €15,001–€28,000 → 1,910 + 1,190 × (28,000 − reddito) / 13,000
 * 3. €28,001–€50,000 → 1,910 × (50,000 − reddito) / 22,000
 * 4. > €50,000 → €0
 *
 * No-tax area: employees earning up to €8,500 pay zero IRPEF because the
 * credit fully offsets the gross tax.
 *
 * @see TUIR Art. 13, comma 1, as amended by Legge di Bilancio 2026
 */
export const DETRAZIONE_LAVORO_DIP_2026 = {
  /** Band 1: income ≤ €15,000. */
  fasciaBase: {
    limiteSuperiore: 15_000,
    importo: 1_955,
    /** Minimum credit for contratto a tempo indeterminato. */
    minimoIndeterminato: 690,
    /** Minimum credit for contratto a tempo determinato. */
    minimoDeterminato: 1_380,
  },
  /** Band 2: €15,001–€28,000. Linear phase-out. */
  fasciaMedia: {
    limiteInferiore: 15_001,
    limiteSuperiore: 28_000,
    /**
     * Formula: 1,910 + 1,190 × (28,000 − reddito) / (28,000 − 15,000)
     * At €15,001 the credit is ~€3,100; at €28,000 it is €1,910.
     */
    base: 1_910,
    incremento: 1_190,
    denominatore: 13_000, // 28,000 − 15,000
  },
  /** Band 3: €28,001–€50,000. Linear phase-out. */
  fasciaAlta: {
    limiteInferiore: 28_001,
    limiteSuperiore: 50_000,
    /**
     * Formula: 1,910 × (50,000 − reddito) / (50,000 − 28,000)
     * At €28,001 the credit is ~€1,910; at €50,000 it is €0.
     */
    base: 1_910,
    denominatore: 22_000, // 50,000 − 28,000
  },
  /** Band 4: above €50,000. No credit. */
  fasciaZero: {
    limiteInferiore: 50_001,
    importo: 0,
  },
  /** Income threshold below which IRPEF is effectively zero (no-tax area). */
  noTaxArea: 8_500,
} as const;

// ---------------------------------------------------------------------------
// Trattamento Integrativo 2026
// ---------------------------------------------------------------------------

/**
 * Trattamento integrativo (ex bonus Renzi / bonus €100).
 *
 * - Reddito ≤ €15,000 → €1,200/year (€100/month), full amount
 * - €15,001–€28,000 → reduced: min(€1,200, somma_detrazioni − IRPEF_lorda)
 *   Granted only if the sum of qualifying detrazioni exceeds IRPEF lorda.
 * - > €28,000 → €0
 *
 * @see D.L. 3/2020 Art. 1, as amended; Legge di Bilancio 2026
 */
export const TRATTAMENTO_INTEGRATIVO_2026 = {
  /** Maximum annual benefit, EUR. */
  importoAnnuo: 1_200,
  /** Maximum monthly benefit, EUR. */
  importoMensile: 100,
  /** Full benefit up to this income threshold. */
  sogliaCompleta: 15_000,
  /** Reduced benefit between €15,001 and this threshold. */
  sogliaParziale: 28_000,
} as const;

// ---------------------------------------------------------------------------
// Cuneo Fiscale 2026
// ---------------------------------------------------------------------------

/**
 * Cuneo fiscale 2026 — two-tier system replacing the old contributivo cuts.
 *
 * Tier 1 — Somma esente (income ≤ €20,000):
 *   A tax-exempt sum proportional to income, varying by sub-band:
 *   - Up to €8,500 → 7.1% of income
 *   - €8,501–€15,000 → 5.3% of income
 *   - €15,001–€20,000 → 4.8% of income
 *
 * Tier 2 — Detrazione IRPEF (€20,001–€40,000):
 *   - €20,001–€32,000 → fixed €1,000/year
 *   - €32,001–€40,000 → €1,000 × (40,000 − reddito) / 8,000 (phase-out)
 *
 * Above €40,000: nothing.
 *
 * @see Legge di Bilancio 2026, Art. 1, commi relativi al cuneo fiscale
 */
export const FASCE_CUNEO_FISCALE_2026: readonly FasciaCuneoFiscale[] = [
  // Tier 1 — Somma esente
  {
    limiteInferiore: 0,
    limiteSuperiore: 8_500,
    tipo: 'somma_esente',
    percentualeOValore: 0.071, // 7.1%
  },
  {
    limiteInferiore: 8_501,
    limiteSuperiore: 15_000,
    tipo: 'somma_esente',
    percentualeOValore: 0.053, // 5.3%
  },
  {
    limiteInferiore: 15_001,
    limiteSuperiore: 20_000,
    tipo: 'somma_esente',
    percentualeOValore: 0.048, // 4.8%
  },
  // Tier 2 — Detrazione IRPEF
  {
    limiteInferiore: 20_001,
    limiteSuperiore: 32_000,
    tipo: 'detrazione',
    percentualeOValore: 1_000, // fixed €1,000/year
  },
  {
    limiteInferiore: 32_001,
    limiteSuperiore: 40_000,
    tipo: 'detrazione',
    percentualeOValore: 1_000, // base value, subject to phase-out
  },
] as const;

/**
 * Phase-out parameters for the cuneo fiscale deduction in the €32,001–€40,000 band.
 *
 * Formula: €1,000 × (40,000 − reddito) / (40,000 − 32,000)
 */
export const CUNEO_FISCALE_PHASE_OUT_2026 = {
  /** Upper income limit at which the deduction reaches zero. */
  limiteSuperiore: 40_000,
  /** Lower income limit of the phase-out band. */
  limiteInferiore: 32_000,
  /** Denominator: 40,000 − 32,000. */
  denominatore: 8_000,
  /** Base deduction value in EUR. */
  valoreBase: 1_000,
} as const;

// ---------------------------------------------------------------------------
// Detrazione Coniuge a Carico 2026
// ---------------------------------------------------------------------------

/**
 * Tax credit for dependent spouse (coniuge a carico).
 *
 * The spouse qualifies if their annual income is ≤ €2,840.51
 * (or ≤ €4,000.00 if under 24 years of age).
 *
 * Piecewise schedule based on the *taxpayer's* total income:
 *
 * | Reddito              | Detrazione                                          |
 * |----------------------|-----------------------------------------------------|
 * | ≤ €15,000            | 800 − 110 × (reddito / 15,000), min €690            |
 * | €15,001–€29,000      | €690                                                |
 * | €29,001–€29,200      | €700                                                |
 * | €29,201–€34,700      | €710                                                |
 * | €34,701–€35,000      | €720                                                |
 * | €35,001–€35,100      | €710                                                |
 * | €35,101–€35,200      | €700                                                |
 * | €35,201–€40,000      | €690                                                |
 * | €40,001–€80,000      | 690 × (80,000 − reddito) / 40,000                   |
 * | > €80,000             | €0                                                  |
 *
 * @see TUIR Art. 12, comma 1, lett. a)
 */
export const DETRAZIONE_CONIUGE_2026 = {
  /** Income limit for the dependent spouse to qualify (general). */
  limiteRedditoConiuge: 2_840.51,
  /** Income limit for the dependent spouse under 24 years of age. */
  limiteRedditoConiugeUnder24: 4_000,

  /** Fixed-amount bands (central plateau and bump region). */
  fasce: [
    { limiteInferiore: 0, limiteSuperiore: 15_000, importoFisso: null },
    { limiteInferiore: 15_001, limiteSuperiore: 29_000, importoFisso: 690 },
    { limiteInferiore: 29_001, limiteSuperiore: 29_200, importoFisso: 700 },
    { limiteInferiore: 29_201, limiteSuperiore: 34_700, importoFisso: 710 },
    { limiteInferiore: 34_701, limiteSuperiore: 35_000, importoFisso: 720 },
    { limiteInferiore: 35_001, limiteSuperiore: 35_100, importoFisso: 710 },
    { limiteInferiore: 35_101, limiteSuperiore: 35_200, importoFisso: 700 },
    { limiteInferiore: 35_201, limiteSuperiore: 40_000, importoFisso: 690 },
    { limiteInferiore: 40_001, limiteSuperiore: 80_000, importoFisso: null },
    { limiteInferiore: 80_001, limiteSuperiore: Infinity, importoFisso: 0 },
  ] as const satisfies readonly FasciaDetrazioneConiuge[],

  /**
   * Formula for band 1 (reddito ≤ €15,000):
   *   detrazione = 800 − 110 × (reddito / 15,000), minimo €690
   */
  formulaBassa: {
    base: 800,
    coefficiente: 110,
    denominatore: 15_000,
    minimo: 690,
  },

  /**
   * Formula for band 9 (€40,001–€80,000):
   *   detrazione = 690 × (80,000 − reddito) / 40,000
   */
  formulaAlta: {
    base: 690,
    limiteSuperiore: 80_000,
    denominatore: 40_000,
  },
} as const;

// ---------------------------------------------------------------------------
// Detrazione Figli a Carico 2026
// ---------------------------------------------------------------------------

/**
 * Tax credit for dependent children (figli a carico) aged 21 and over.
 *
 * Since March 2022, the Assegno Unico Universale (AUU) replaced most child
 * detrazioni for children under 21. For children aged 21+, the IRPEF
 * deduction still applies.
 *
 * Formula per child (21+):
 *   detrazione = 950 × (95,000 − reddito) / 95,000
 *
 * If the result is ≤ 0, the deduction is zero.
 * The deduction is normally split 50/50 between parents, unless they agree
 * otherwise (100% to the higher-income parent).
 *
 * Children qualify as dependents if their income is ≤ €2,840.51
 * (or ≤ €4,000 if under 24 years of age).
 *
 * @see TUIR Art. 12, comma 1, lett. c); D.Lgs. 230/2021 (AUU)
 */
export const DETRAZIONE_FIGLI_2026 = {
  /** Age from which the traditional IRPEF deduction applies (AUU covers under this). */
  etaMinima: 21,
  /** Base deduction per child, EUR. */
  importoBase: 950,
  /** Income ceiling: deduction reaches zero at this income. */
  redditoRiferimento: 95_000,
  /** Income threshold for a child to qualify as dependent (general). */
  limiteRedditoFiglio: 2_840.51,
  /** Income threshold for a child under 24 to qualify as dependent. */
  limiteRedditoFiglioUnder24: 4_000,
  /** Default split between two parents (each gets 50%). */
  splitDefault: 0.5,
} as const;

// ---------------------------------------------------------------------------
// Contributi INPS Lavoro Dipendente 2026
// ---------------------------------------------------------------------------

/**
 * INPS social security contribution rates for employees, 2026.
 *
 * The employee's share (quota a carico del lavoratore) is deducted from
 * gross salary before computing IRPEF.
 *
 * @see Legge di Bilancio 2026; INPS Circolare
 */
export const CONTRIBUTI_INPS_2026 = {
  /** Employee's INPS rate (standard, for monthly payroll ≤ ceiling). */
  aliquotaDipendente: 0.0919, // 9.19%
  /** Employee's INPS rate for apprentices (apprendisti). */
  aliquotaApprendista: 0.0569, // 5.69%
  /** Annual ceiling for INPS contributions (massimale). */
  massimaleAnnuo: 119_650,
} as const;

// ---------------------------------------------------------------------------
// Addizionali IRPEF 2026 (defaults)
// ---------------------------------------------------------------------------

/**
 * Regional and municipal IRPEF surcharges — default indicative rates.
 *
 * Actual rates vary by Regione and Comune. These are common reference values.
 * A full implementation should allow the user to select their location.
 */
export const ADDIZIONALI_DEFAULT_2026 = {
  /** Indicative regional surcharge rate (varies by Regione, 1.23%–3.33%). */
  regionaleIndicativa: 0.0173, // 1.73% — approximate national midpoint
  /** Indicative municipal surcharge rate (varies by Comune, 0%–0.9%). */
  comunaleIndicativa: 0.008, // 0.8%
} as const;

// ---------------------------------------------------------------------------
// Anno Fiscale
// ---------------------------------------------------------------------------

/** The fiscal year these constants refer to. */
export const ANNO_FISCALE = 2026 as const;

/** Standard number of working days used for proration of detrazioni. */
export const GIORNI_ANNO = 365 as const;

/** Number of monthly pay periods in a standard year. */
export const MENSILITA_STANDARD = 12 as const;

/** Number of monthly pay periods including thirteenth (tredicesima). */
export const MENSILITA_CON_TREDICESIMA = 13 as const;

/** Number of monthly pay periods including tredicesima + quattordicesima. */
export const MENSILITA_CON_QUATTORDICESIMA = 14 as const;
