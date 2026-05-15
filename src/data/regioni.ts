/**
 * Addizionale regionale IRPEF 2026 — all Italian regions and autonomous provinces.
 *
 * Sources: official regional deliberations for anno fiscale 2026.
 *
 * Notes:
 * - 21 entries: 19 regions + 2 autonomous provinces (Bolzano, Trento)
 * - ISO 3166-2:IT codes without the "IT-" prefix
 * - Addizionale is calculated PROGRESSIVELY per bracket (like IRPEF):
 *   each bracket's rate applies only to income within that bracket
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScaglioneRegionale {
  /** Upper bound of the bracket (EUR). `null` = no upper limit. */
  limiteSuperiore: number | null;
  /** Tax rate expressed as a decimal (e.g. 0.0123 = 1.23%). */
  aliquota: number;
}

export interface Regione {
  /** ISO 3166-2:IT code without "IT-" prefix (e.g. "LOM", "BZ"). */
  codice: string;
  /** Full Italian name. */
  nome: string;
  /** URL-friendly slug (lowercase, ASCII-safe). */
  slug: string;
  /** Progressive tax brackets ordered by ascending income. */
  scaglioni: ScaglioneRegionale[];
  /** `true` for regions / provinces with special fiscal autonomy. */
  autonoma?: boolean;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

export const regioni: readonly Regione[] = [
  // --- Flat-rate regions ---------------------------------------------------

  {
    codice: 'ABR',
    nome: 'Abruzzo',
    slug: 'abruzzo',
    scaglioni: [{ limiteSuperiore: null, aliquota: 0.0173 }],
  },
  {
    codice: 'BAS',
    nome: 'Basilicata',
    slug: 'basilicata',
    scaglioni: [{ limiteSuperiore: null, aliquota: 0.0123 }],
  },
  {
    codice: 'LIG',
    nome: 'Liguria',
    slug: 'liguria',
    scaglioni: [{ limiteSuperiore: null, aliquota: 0.0123 }],
  },
  {
    codice: 'SAR',
    nome: 'Sardegna',
    slug: 'sardegna',
    scaglioni: [{ limiteSuperiore: null, aliquota: 0.0123 }],
    autonoma: true,
  },
  {
    codice: 'VEN',
    nome: 'Veneto',
    slug: 'veneto',
    scaglioni: [{ limiteSuperiore: null, aliquota: 0.0123 }],
  },
  {
    codice: 'VDA',
    nome: "Valle d'Aosta",
    slug: 'valle-d-aosta',
    scaglioni: [{ limiteSuperiore: null, aliquota: 0.0123 }],
    autonoma: true,
  },

  // --- Progressive regions -------------------------------------------------

  {
    codice: 'BZ',
    nome: 'Bolzano',
    slug: 'bolzano',
    scaglioni: [
      { limiteSuperiore: 28_000, aliquota: 0.0123 },
      { limiteSuperiore: 50_000, aliquota: 0.0123 },
      { limiteSuperiore: null, aliquota: 0.0173 },
    ],
    autonoma: true,
  },
  {
    codice: 'CAL',
    nome: 'Calabria',
    slug: 'calabria',
    scaglioni: [
      { limiteSuperiore: 15_000, aliquota: 0.0173 },
      { limiteSuperiore: 28_000, aliquota: 0.0173 },
      { limiteSuperiore: 50_000, aliquota: 0.0203 },
      { limiteSuperiore: null, aliquota: 0.0203 },
    ],
  },
  {
    codice: 'CAM',
    nome: 'Campania',
    slug: 'campania',
    scaglioni: [
      { limiteSuperiore: 15_000, aliquota: 0.0203 },
      { limiteSuperiore: 28_000, aliquota: 0.0203 },
      { limiteSuperiore: 50_000, aliquota: 0.0213 },
      { limiteSuperiore: null, aliquota: 0.0233 },
    ],
  },
  {
    codice: 'EMR',
    nome: 'Emilia-Romagna',
    slug: 'emilia-romagna',
    scaglioni: [
      { limiteSuperiore: 15_000, aliquota: 0.0133 },
      { limiteSuperiore: 28_000, aliquota: 0.0153 },
      { limiteSuperiore: 50_000, aliquota: 0.0173 },
      { limiteSuperiore: null, aliquota: 0.0193 },
    ],
  },
  {
    codice: 'FVG',
    nome: 'Friuli-Venezia Giulia',
    slug: 'friuli-venezia-giulia',
    scaglioni: [
      { limiteSuperiore: 15_000, aliquota: 0.0070 },
      { limiteSuperiore: 28_000, aliquota: 0.0123 },
      { limiteSuperiore: 50_000, aliquota: 0.0123 },
      { limiteSuperiore: null, aliquota: 0.0123 },
    ],
    autonoma: true,
  },
  {
    codice: 'LAZ',
    nome: 'Lazio',
    slug: 'lazio',
    scaglioni: [
      { limiteSuperiore: 15_000, aliquota: 0.0173 },
      { limiteSuperiore: 28_000, aliquota: 0.0273 },
      { limiteSuperiore: 50_000, aliquota: 0.0293 },
      { limiteSuperiore: null, aliquota: 0.0333 },
    ],
  },
  {
    codice: 'LOM',
    nome: 'Lombardia',
    slug: 'lombardia',
    scaglioni: [
      { limiteSuperiore: 15_000, aliquota: 0.0123 },
      { limiteSuperiore: 28_000, aliquota: 0.0158 },
      { limiteSuperiore: 50_000, aliquota: 0.0172 },
      { limiteSuperiore: null, aliquota: 0.0174 },
    ],
  },
  {
    codice: 'MAR',
    nome: 'Marche',
    slug: 'marche',
    scaglioni: [
      { limiteSuperiore: 15_000, aliquota: 0.0123 },
      { limiteSuperiore: 28_000, aliquota: 0.0153 },
      { limiteSuperiore: 50_000, aliquota: 0.0170 },
      { limiteSuperiore: null, aliquota: 0.0173 },
    ],
  },
  {
    codice: 'MOL',
    nome: 'Molise',
    slug: 'molise',
    scaglioni: [
      { limiteSuperiore: 15_000, aliquota: 0.0173 },
      { limiteSuperiore: 28_000, aliquota: 0.0193 },
      { limiteSuperiore: 50_000, aliquota: 0.0213 },
      { limiteSuperiore: null, aliquota: 0.0233 },
    ],
  },
  {
    codice: 'PIE',
    nome: 'Piemonte',
    slug: 'piemonte',
    scaglioni: [
      { limiteSuperiore: 15_000, aliquota: 0.0162 },
      { limiteSuperiore: 28_000, aliquota: 0.0162 },
      { limiteSuperiore: 50_000, aliquota: 0.0162 },
      { limiteSuperiore: null, aliquota: 0.0162 },
    ],
  },
  {
    codice: 'PUG',
    nome: 'Puglia',
    slug: 'puglia',
    scaglioni: [
      { limiteSuperiore: 15_000, aliquota: 0.0133 },
      { limiteSuperiore: 28_000, aliquota: 0.0143 },
      { limiteSuperiore: 50_000, aliquota: 0.0171 },
      { limiteSuperiore: null, aliquota: 0.0173 },
    ],
  },
  {
    codice: 'SIC',
    nome: 'Sicilia',
    slug: 'sicilia',
    scaglioni: [
      { limiteSuperiore: 15_000, aliquota: 0.0123 },
      { limiteSuperiore: 28_000, aliquota: 0.0143 },
      { limiteSuperiore: 50_000, aliquota: 0.0153 },
      { limiteSuperiore: null, aliquota: 0.0173 },
    ],
    autonoma: true,
  },
  {
    codice: 'TOS',
    nome: 'Toscana',
    slug: 'toscana',
    scaglioni: [
      { limiteSuperiore: 15_000, aliquota: 0.0142 },
      { limiteSuperiore: 28_000, aliquota: 0.0143 },
      { limiteSuperiore: 50_000, aliquota: 0.0168 },
      { limiteSuperiore: null, aliquota: 0.0173 },
    ],
  },
  {
    codice: 'TN',
    nome: 'Trento',
    slug: 'trento',
    scaglioni: [
      { limiteSuperiore: 28_000, aliquota: 0.0123 },
      { limiteSuperiore: 50_000, aliquota: 0.0123 },
      { limiteSuperiore: null, aliquota: 0.0173 },
    ],
    autonoma: true,
  },
  {
    codice: 'UMB',
    nome: 'Umbria',
    slug: 'umbria',
    scaglioni: [
      { limiteSuperiore: 15_000, aliquota: 0.0123 },
      { limiteSuperiore: 28_000, aliquota: 0.0123 },
      { limiteSuperiore: 50_000, aliquota: 0.0143 },
      { limiteSuperiore: null, aliquota: 0.0163 },
    ],
  },
] as const;

// ---------------------------------------------------------------------------
// Lookup maps
// ---------------------------------------------------------------------------

/** Map from region code to URL-friendly slug. */
export const regioniSlugs: ReadonlyMap<string, string> = new Map(
  regioni.map((r) => [r.codice, r.slug]),
);

/** Map from region code to full `Regione` object for O(1) lookups. */
export const regioniByCode: ReadonlyMap<string, Regione> = new Map(
  regioni.map((r) => [r.codice, r]),
);

// ---------------------------------------------------------------------------
// Calculation
// ---------------------------------------------------------------------------

/**
 * Calculate the addizionale regionale IRPEF for a given taxable income.
 *
 * The tax is computed **progressively**: each bracket's rate applies only to
 * the portion of income that falls within that bracket, exactly like the
 * national IRPEF brackets.
 *
 * @param imponibile - Taxable income in EUR (must be >= 0).
 * @param codiceRegione - ISO 3166-2:IT region code without "IT-" prefix.
 * @returns The addizionale regionale amount in EUR, rounded to 2 decimals.
 * @throws {Error} If the region code is not found.
 */
export function calcolaAddizionaleRegionale(
  imponibile: number,
  codiceRegione: string,
): number {
  const regione = regioniByCode.get(codiceRegione);
  if (!regione) {
    throw new Error(
      `Codice regione "${codiceRegione}" non trovato. ` +
        `Codici validi: ${regioni.map((r) => r.codice).join(', ')}`,
    );
  }

  if (imponibile <= 0) {
    return 0;
  }

  const { scaglioni } = regione;
  let imposta = 0;
  let limiteInferiore = 0;

  for (const scaglione of scaglioni) {
    const limiteSuperioreBracket = scaglione.limiteSuperiore ?? Infinity;

    if (imponibile <= limiteInferiore) {
      break;
    }

    const imponibileInScaglione =
      Math.min(imponibile, limiteSuperioreBracket) - limiteInferiore;

    if (imponibileInScaglione > 0) {
      imposta += imponibileInScaglione * scaglione.aliquota;
    }

    limiteInferiore = limiteSuperioreBracket;
  }

  return Math.round(imposta * 100) / 100;
}
