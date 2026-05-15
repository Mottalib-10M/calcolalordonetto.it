/**
 * IRPEF Engine — core Italian salary calculation functions.
 *
 * Pure typed functions for computing RAL → Netto, IRPEF, detrazioni,
 * trattamento integrativo, addizionali, TFR, and more.
 *
 * All monetary inputs/outputs in EUR. Rates as decimals.
 */

import {
  SCAGLIONI_IRPEF_2026,
  DETRAZIONE_LAVORO_DIP_2026,
  TRATTAMENTO_INTEGRATIVO_2026,
  FASCE_CUNEO_FISCALE_2026,
  CUNEO_FISCALE_PHASE_OUT_2026,
  DETRAZIONE_CONIUGE_2026,
  DETRAZIONE_FIGLI_2026,
  CONTRIBUTI_INPS_2026,
} from '../data/irpef-2026';
import { calcolaAddizionaleRegionale, regioniByCode } from '../data/regioni';
import { ADDIZIONALE_COMUNALE_MEDIA } from '../data/comuni-top200';

// ─── Interfaces ──────────────────────────────────────────────────

export interface InputStipendio {
  /** Retribuzione Annua Lorda (gross annual salary) */
  ral: number;
  /** Region code (ISO 3166-2:IT without prefix) */
  regione: string;
  /** Addizionale comunale rate as decimal (e.g. 0.008 = 0.8%) */
  aliquotaComunale?: number;
  /** Number of pay periods: 12, 13 (default), or 14 */
  mensilita?: 12 | 13 | 14;
  /** Spouse dependent (coniuge a carico) */
  coniugeACarico?: boolean;
  /** Number of dependent children aged 21+ */
  figliACarico21plus?: number;
  /** Working days in year (default 365) */
  giorniLavoro?: number;
  /** Contract type for minimum detrazione */
  tipoContratto?: 'indeterminato' | 'determinato';
}

export interface RisultatoStipendio {
  // Gross
  ral: number;
  ralMensile: number;

  // INPS contributions
  contributiINPS: number;
  contributiINPSMensili: number;

  // Taxable income
  imponibileFiscale: number;

  // Cuneo fiscale
  cuneoFiscaleSommaEsente: number;
  cuneoFiscaleDetrazione: number;

  // IRPEF
  irpefLorda: number;
  detrazioneLavoroDipendente: number;
  detrazioneConiuge: number;
  detrazioneFigli: number;
  totalDetrazioni: number;
  irpefNetta: number;

  // Addizionali
  addizionaleRegionale: number;
  addizionaleComunale: number;
  totaleAddizionali: number;

  // Trattamento integrativo
  trattamentoIntegrativo: number;

  // Final net
  nettoAnnuo: number;
  nettoMensile: number;
  mensilita: number;

  // Cost to employer (costo azienda)
  contributiINPSDatore: number;
  costoAzienda: number;

  // TFR accrual
  tfrAnnuo: number;

  // Tax rate analysis
  aliquotaMedia: number;
  aliquotaMarginale: number;
  cuneoFiscaleTotale: number;
}

export interface RisultatoIRPEF {
  irpefLorda: number;
  dettaglioScaglioni: {
    scaglione: string;
    aliquota: number;
    imponibileInScaglione: number;
    impostaScaglione: number;
  }[];
}

// ─── IRPEF Calculation ────────────────────────────────────────────

/**
 * Calculate IRPEF lorda (gross income tax) from taxable income.
 * Uses the 2026 three-bracket progressive system.
 */
export function calcolaIRPEF(imponibile: number): RisultatoIRPEF {
  if (imponibile <= 0) {
    return { irpefLorda: 0, dettaglioScaglioni: [] };
  }

  let irpefLorda = 0;
  let limiteInferiore = 0;
  const dettaglioScaglioni: RisultatoIRPEF['dettaglioScaglioni'] = [];

  for (const scaglione of SCAGLIONI_IRPEF_2026) {
    const limiteSuperioreBracket = scaglione.limiteSuperiore ?? Infinity;

    if (imponibile <= limiteInferiore) break;

    const imponibileInScaglione =
      Math.min(imponibile, limiteSuperioreBracket) - limiteInferiore;

    if (imponibileInScaglione > 0) {
      const impostaScaglione = imponibileInScaglione * scaglione.aliquota;
      irpefLorda += impostaScaglione;

      const limSup = scaglione.limiteSuperiore;
      const label =
        limSup === null
          ? `Oltre ${limiteInferiore.toLocaleString('it-IT')} €`
          : `${limiteInferiore.toLocaleString('it-IT')} – ${limSup.toLocaleString('it-IT')} €`;

      dettaglioScaglioni.push({
        scaglione: label,
        aliquota: scaglione.aliquota,
        imponibileInScaglione,
        impostaScaglione,
      });
    }

    limiteInferiore = limiteSuperioreBracket;
  }

  return {
    irpefLorda: Math.round(irpefLorda * 100) / 100,
    dettaglioScaglioni,
  };
}

// ─── Detrazione Lavoro Dipendente ──────────────────────────────────

/**
 * Calculate the employment income tax credit (detrazione lavoro dipendente).
 *
 * @param reddito - Total taxable income
 * @param giorniLavoro - Working days in the year (for proration)
 * @param tipoContratto - Contract type (affects minimum credit amount)
 */
export function calcolaDetrazioneLavoroDipendente(
  reddito: number,
  giorniLavoro: number = 365,
  tipoContratto: 'indeterminato' | 'determinato' = 'indeterminato'
): number {
  if (reddito <= 0) return 0;

  const d = DETRAZIONE_LAVORO_DIP_2026;
  let detrazione: number;

  if (reddito <= d.fasciaBase.limiteSuperiore) {
    // Band 1: ≤ €15,000
    detrazione = d.fasciaBase.importo;
    const minimo =
      tipoContratto === 'determinato'
        ? d.fasciaBase.minimoDeterminato
        : d.fasciaBase.minimoIndeterminato;
    detrazione = Math.max(detrazione, minimo);
  } else if (reddito <= d.fasciaMedia.limiteSuperiore) {
    // Band 2: €15,001–€28,000
    detrazione =
      d.fasciaMedia.base +
      d.fasciaMedia.incremento *
        ((d.fasciaMedia.limiteSuperiore - reddito) / d.fasciaMedia.denominatore);
  } else if (reddito <= d.fasciaAlta.limiteSuperiore) {
    // Band 3: €28,001–€50,000
    detrazione =
      d.fasciaAlta.base *
      ((d.fasciaAlta.limiteSuperiore - reddito) / d.fasciaAlta.denominatore);
  } else {
    // Band 4: > €50,000
    return 0;
  }

  // Prorate by working days
  detrazione = detrazione * (giorniLavoro / 365);

  return Math.max(0, Math.round(detrazione * 100) / 100);
}

// ─── Cuneo Fiscale ──────────────────────────────────────────────────

/**
 * Calculate the cuneo fiscale benefit for 2026.
 * Returns both components: somma esente (exempt income) and detrazione.
 */
export function calcolaCuneoFiscale(reddito: number): {
  sommaEsente: number;
  detrazione: number;
} {
  if (reddito <= 0 || reddito > 40_000) {
    return { sommaEsente: 0, detrazione: 0 };
  }

  // Tier 1: Somma esente (≤ €20,000)
  if (reddito <= 8_500) {
    return { sommaEsente: reddito * 0.071, detrazione: 0 };
  }
  if (reddito <= 15_000) {
    return { sommaEsente: reddito * 0.053, detrazione: 0 };
  }
  if (reddito <= 20_000) {
    return { sommaEsente: reddito * 0.048, detrazione: 0 };
  }

  // Tier 2: Detrazione (€20,001–€40,000)
  if (reddito <= 32_000) {
    return { sommaEsente: 0, detrazione: 1_000 };
  }

  // Phase-out (€32,001–€40,000)
  const po = CUNEO_FISCALE_PHASE_OUT_2026;
  const detrazione =
    po.valoreBase *
    ((po.limiteSuperiore - reddito) / po.denominatore);

  return { sommaEsente: 0, detrazione: Math.max(0, Math.round(detrazione * 100) / 100) };
}

// ─── Trattamento Integrativo ────────────────────────────────────────

/**
 * Calculate the trattamento integrativo (ex bonus Renzi).
 *
 * For incomes between €15,001–€28,000, the benefit is granted only if the
 * sum of qualifying detrazioni exceeds the IRPEF lorda. The amount is
 * min(€1,200, sum_detrazioni − irpef_lorda).
 */
export function calcolaTrattamentoIntegrativo(
  reddito: number,
  irpefLorda: number,
  totalDetrazioni: number
): number {
  const t = TRATTAMENTO_INTEGRATIVO_2026;

  if (reddito <= 0) return 0;

  if (reddito <= t.sogliaCompleta) {
    // Full amount for income ≤ €15,000
    // But only if there's actual IRPEF to pay (the person must have tax liability)
    if (irpefLorda <= 0) return 0;
    return t.importoAnnuo;
  }

  if (reddito <= t.sogliaParziale) {
    // Reduced amount: granted only if detrazioni exceed IRPEF lorda
    const eccedenza = totalDetrazioni - irpefLorda;
    if (eccedenza <= 0) return 0;
    return Math.min(t.importoAnnuo, Math.round(eccedenza * 100) / 100);
  }

  // > €28,000: no benefit
  return 0;
}

// ─── Detrazione Coniuge ────────────────────────────────────────────

/**
 * Calculate the tax credit for dependent spouse.
 */
export function calcolaDetrazioneConiuge(reddito: number): number {
  if (reddito <= 0) return 0;

  const c = DETRAZIONE_CONIUGE_2026;

  if (reddito <= 15_000) {
    // Formula: 800 − 110 × (reddito / 15,000), min €690
    const detrazione = c.formulaBassa.base -
      c.formulaBassa.coefficiente * (reddito / c.formulaBassa.denominatore);
    return Math.max(c.formulaBassa.minimo, Math.round(detrazione * 100) / 100);
  }

  // Use the fixed-amount bands for the central section
  for (const fascia of c.fasce) {
    if (reddito >= fascia.limiteInferiore && reddito <= fascia.limiteSuperiore) {
      if (fascia.importoFisso !== null) {
        return fascia.importoFisso;
      }
    }
  }

  if (reddito <= 80_000) {
    // Formula: 690 × (80,000 − reddito) / 40,000
    const detrazione =
      c.formulaAlta.base *
      ((c.formulaAlta.limiteSuperiore - reddito) / c.formulaAlta.denominatore);
    return Math.max(0, Math.round(detrazione * 100) / 100);
  }

  return 0;
}

// ─── Detrazione Figli ──────────────────────────────────────────────

/**
 * Calculate the tax credit for dependent children aged 21+.
 * Children under 21 are covered by Assegno Unico Universale.
 *
 * @param reddito - Total taxable income
 * @param numFigli - Number of dependent children aged 21+
 * @param percentualeCarico - Share of the credit (default 0.5 = 50%)
 */
export function calcolaDetrazioneFigli(
  reddito: number,
  numFigli: number = 0,
  percentualeCarico: number = 0.5
): number {
  if (numFigli <= 0 || reddito <= 0) return 0;

  const f = DETRAZIONE_FIGLI_2026;
  const redditoRiferimento = f.redditoRiferimento + (numFigli - 1) * 15_000;

  if (reddito >= redditoRiferimento) return 0;

  const detrazioneSingolo =
    f.importoBase * ((redditoRiferimento - reddito) / redditoRiferimento);

  const detrazioneTotale = detrazioneSingolo * numFigli * percentualeCarico;

  return Math.max(0, Math.round(detrazioneTotale * 100) / 100);
}

// ─── INPS Contributions ────────────────────────────────────────────

/**
 * Calculate INPS social security contributions (employee share).
 */
export function calcolaContributiINPS(
  ral: number,
  tipo: 'standard' | 'apprendistato' = 'standard'
): number {
  if (ral <= 0) return 0;

  const aliquota =
    tipo === 'apprendistato'
      ? CONTRIBUTI_INPS_2026.aliquotaApprendista
      : CONTRIBUTI_INPS_2026.aliquotaDipendente;

  const imponibile = Math.min(ral, CONTRIBUTI_INPS_2026.massimaleAnnuo);
  return Math.round(imponibile * aliquota * 100) / 100;
}

/**
 * Calculate employer INPS contributions.
 */
export function calcolaContributiINPSDatore(ral: number): number {
  if (ral <= 0) return 0;
  const imponibile = Math.min(ral, CONTRIBUTI_INPS_2026.massimaleAnnuo);
  return Math.round(imponibile * 0.2381 * 100) / 100;
}

// ─── Addizionale Comunale ──────────────────────────────────────────

/**
 * Calculate municipal IRPEF surcharge.
 * Simple flat-rate calculation (comuni don't use progressive brackets).
 */
export function calcolaAddizionaleComunale(
  imponibile: number,
  aliquota: number = ADDIZIONALE_COMUNALE_MEDIA
): number {
  if (imponibile <= 0) return 0;
  return Math.round(imponibile * aliquota * 100) / 100;
}

// ─── TFR ────────────────────────────────────────────────────────────

/**
 * Calculate annual TFR (Trattamento di Fine Rapporto) accrual.
 * TFR = RAL / 13.5 (approximately 6.91% + ISTAT revaluation)
 */
export function calcolaTFRAnnuo(ral: number): number {
  if (ral <= 0) return 0;
  // Contribution to INPS Fondo Garanzia (0.50%) is deducted
  const tfrLordo = ral / 13.5;
  const contributoFondoGaranzia = tfrLordo * 0.005;
  return Math.round((tfrLordo - contributoFondoGaranzia) * 100) / 100;
}

/**
 * Calculate accumulated TFR over multiple years.
 *
 * @param ral - Annual RAL (assumed constant)
 * @param anni - Number of years
 * @param tassoRivalutazione - Annual revaluation rate (default: 1.5% + 75% of ISTAT inflation)
 */
export function calcolaTFRAccumulato(
  ral: number,
  anni: number,
  tassoRivalutazione: number = 0.03 // ~3% as conservative estimate
): number {
  let tfr = 0;
  for (let i = 0; i < anni; i++) {
    // Each year adds a new tranche and revalues existing balance
    tfr = tfr * (1 + tassoRivalutazione) + calcolaTFRAnnuo(ral);
  }
  return Math.round(tfr * 100) / 100;
}

// ─── Marginal Rate ──────────────────────────────────────────────────

/**
 * Determine the marginal IRPEF rate for a given income.
 */
export function aliquotaMarginale(imponibile: number): number {
  for (const scaglione of SCAGLIONI_IRPEF_2026) {
    const limiteSup = scaglione.limiteSuperiore ?? Infinity;
    if (imponibile <= limiteSup) {
      return scaglione.aliquota;
    }
  }
  return SCAGLIONI_IRPEF_2026[SCAGLIONI_IRPEF_2026.length - 1].aliquota;
}

// ─── Main Orchestrator: RAL → Netto ─────────────────────────────────

/**
 * Calculate full salary breakdown: RAL → Stipendio Netto.
 *
 * This is the central function that orchestrates all components:
 * 1. RAL → deduct INPS (9.19%) → imponibile fiscale
 * 2. Apply cuneo fiscale (somma esente reduces imponibile)
 * 3. Calculate IRPEF lorda on imponibile
 * 4. Apply detrazioni (lavoro dipendente, coniuge, figli)
 * 5. IRPEF netta = IRPEF lorda − detrazioni (min 0)
 * 6. Apply cuneo fiscale detrazione
 * 7. Calculate addizionali (regionale + comunale)
 * 8. Calculate trattamento integrativo
 * 9. Netto = RAL − INPS − IRPEF netta − addizionali + trattamento integrativo
 */
export function calcolaStipendio(input: InputStipendio): RisultatoStipendio {
  const {
    ral,
    regione,
    aliquotaComunale = ADDIZIONALE_COMUNALE_MEDIA,
    mensilita = 13,
    coniugeACarico = false,
    figliACarico21plus = 0,
    giorniLavoro = 365,
    tipoContratto = 'indeterminato',
  } = input;

  // 1. INPS contributions (employee share)
  const contributiINPS = calcolaContributiINPS(ral);
  const contributiINPSDatore = calcolaContributiINPSDatore(ral);

  // 2. Imponibile fiscale = RAL − INPS dipendente
  let imponibileFiscale = ral - contributiINPS;

  // 3. Cuneo fiscale — somma esente (reduces the taxable base)
  const cuneoFiscale = calcolaCuneoFiscale(imponibileFiscale);
  const imponibilePerIRPEF = imponibileFiscale - cuneoFiscale.sommaEsente;

  // 4. IRPEF lorda
  const { irpefLorda } = calcolaIRPEF(imponibilePerIRPEF);

  // 5. Detrazioni
  const detrazioneLavoroDipendente = calcolaDetrazioneLavoroDipendente(
    imponibileFiscale,
    giorniLavoro,
    tipoContratto
  );

  const detrazioneConiuge = coniugeACarico
    ? calcolaDetrazioneConiuge(imponibileFiscale)
    : 0;

  const detrazioneFigli = calcolaDetrazioneFigli(
    imponibileFiscale,
    figliACarico21plus
  );

  const totalDetrazioni =
    detrazioneLavoroDipendente +
    detrazioneConiuge +
    detrazioneFigli +
    cuneoFiscale.detrazione;

  // 6. IRPEF netta = max(0, IRPEF lorda − total detrazioni)
  const irpefNetta = Math.max(0, Math.round((irpefLorda - totalDetrazioni) * 100) / 100);

  // 7. Addizionali (calculated on imponibile fiscale)
  const addizionaleRegionale = calcolaAddizionaleRegionale(imponibileFiscale, regione);
  const addizionaleComunale = calcolaAddizionaleComunale(imponibileFiscale, aliquotaComunale);
  const totaleAddizionali = addizionaleRegionale + addizionaleComunale;

  // 8. Trattamento integrativo
  const trattamentoIntegrativo = calcolaTrattamentoIntegrativo(
    imponibileFiscale,
    irpefLorda,
    detrazioneLavoroDipendente + detrazioneConiuge + detrazioneFigli
  );

  // 9. Netto annuo
  const nettoAnnuo = Math.round(
    (ral - contributiINPS - irpefNetta - totaleAddizionali + trattamentoIntegrativo) * 100
  ) / 100;

  // Monthly net (divided by mensilità)
  const nettoMensile = Math.round((nettoAnnuo / mensilita) * 100) / 100;

  // TFR
  const tfrAnnuo = calcolaTFRAnnuo(ral);

  // Cost to employer
  const costoAzienda = Math.round((ral + contributiINPSDatore + tfrAnnuo) * 100) / 100;

  // Tax rates
  const aliquotaMediaCalc = ral > 0 ? (ral - nettoAnnuo) / ral : 0;
  const aliquotaMarg = aliquotaMarginale(imponibilePerIRPEF);
  const cuneoFiscaleTotale = ral > 0 ? (costoAzienda - nettoAnnuo) / costoAzienda : 0;

  return {
    ral,
    ralMensile: Math.round((ral / mensilita) * 100) / 100,
    contributiINPS,
    contributiINPSMensili: Math.round((contributiINPS / mensilita) * 100) / 100,
    imponibileFiscale: Math.round(imponibileFiscale * 100) / 100,
    cuneoFiscaleSommaEsente: Math.round(cuneoFiscale.sommaEsente * 100) / 100,
    cuneoFiscaleDetrazione: cuneoFiscale.detrazione,
    irpefLorda,
    detrazioneLavoroDipendente,
    detrazioneConiuge,
    detrazioneFigli,
    totalDetrazioni,
    irpefNetta,
    addizionaleRegionale,
    addizionaleComunale,
    totaleAddizionali,
    trattamentoIntegrativo,
    nettoAnnuo,
    nettoMensile,
    mensilita,
    contributiINPSDatore,
    costoAzienda,
    tfrAnnuo,
    aliquotaMedia: Math.round(aliquotaMediaCalc * 10000) / 10000,
    aliquotaMarginale: aliquotaMarg,
    cuneoFiscaleTotale: Math.round(cuneoFiscaleTotale * 10000) / 10000,
  };
}

// ─── Reverse Calculator: Netto → Lordo ──────────────────────────────

/**
 * Find the RAL that produces a target monthly net salary.
 * Uses binary search since the relationship is monotonic.
 */
export function calcolaLordoDaNetto(
  nettoMensileTarget: number,
  regione: string,
  options: Omit<InputStipendio, 'ral' | 'regione'> = {}
): { ral: number; risultato: RisultatoStipendio } {
  const mensilita = options.mensilita ?? 13;
  let low = nettoMensileTarget * mensilita;
  let high = low * 3;
  let best: RisultatoStipendio | null = null;

  // Expand search range if needed
  for (let i = 0; i < 5; i++) {
    const result = calcolaStipendio({ ...options, ral: high, regione });
    if (result.nettoMensile >= nettoMensileTarget) break;
    high *= 1.5;
  }

  // Binary search
  for (let i = 0; i < 50; i++) {
    const mid = Math.round((low + high) / 2);
    const result = calcolaStipendio({ ...options, ral: mid, regione });
    best = result;

    if (Math.abs(result.nettoMensile - nettoMensileTarget) < 1) {
      break;
    }

    if (result.nettoMensile < nettoMensileTarget) {
      low = mid;
    } else {
      high = mid;
    }
  }

  // Fine-tune to nearest 100
  const ral = Math.round((low + high) / 200) * 100;
  const risultato = calcolaStipendio({ ...options, ral, regione });

  return { ral, risultato };
}

// ─── Forfettario Regime ─────────────────────────────────────────────

export interface InputForfettario {
  /** Gross revenue (fatturato) */
  ricavi: number;
  /** Profitability coefficient (coefficiente di redditività) */
  coefficienteRedditivita: number;
  /** Whether this is within the first 5 years (startup rate: 5%) */
  primiCinqueAnni: boolean;
  /** INPS gestione separata rate */
  aliquotaINPS?: number;
}

export interface RisultatoForfettario {
  ricavi: number;
  redditoImponibile: number;
  impostaSostitutiva: number;
  aliquotaImpostaSostitutiva: number;
  contributiINPS: number;
  nettoAnnuo: number;
  nettoMensile: number;
  percentualeTassazione: number;
}

/**
 * Calculate taxes for Partita IVA with regime forfettario.
 */
export function calcolaForfettario(input: InputForfettario): RisultatoForfettario {
  const {
    ricavi,
    coefficienteRedditivita,
    primiCinqueAnni,
    aliquotaINPS = 0.2607,
  } = input;

  const redditoImponibile = ricavi * coefficienteRedditivita;

  // INPS on reddito imponibile
  const contributiINPS = Math.round(redditoImponibile * aliquotaINPS * 100) / 100;

  // The tax base for the flat tax is reddito − INPS
  const baseImponibile = redditoImponibile - contributiINPS;

  // Flat tax rate: 5% for first 5 years, 15% otherwise
  const aliquota = primiCinqueAnni ? 0.05 : 0.15;
  const impostaSostitutiva = Math.round(baseImponibile * aliquota * 100) / 100;

  const nettoAnnuo = Math.round(
    (ricavi - impostaSostitutiva - contributiINPS) * 100
  ) / 100;

  return {
    ricavi,
    redditoImponibile: Math.round(redditoImponibile * 100) / 100,
    impostaSostitutiva,
    aliquotaImpostaSostitutiva: aliquota,
    contributiINPS,
    nettoAnnuo,
    nettoMensile: Math.round((nettoAnnuo / 12) * 100) / 100,
    percentualeTassazione: ricavi > 0
      ? Math.round(((ricavi - nettoAnnuo) / ricavi) * 10000) / 10000
      : 0,
  };
}

// ─── Regime Impatriati ──────────────────────────────────────────────

export interface InputImpatriati {
  /** Full RAL before exemption */
  ral: number;
  /** Exemption percentage (0.5 = 50% for current regime, 0.7 for old) */
  percentualeEsenzione?: number;
  /** Region code */
  regione: string;
  /** Other options from InputStipendio */
  aliquotaComunale?: number;
  mensilita?: 12 | 13 | 14;
  coniugeACarico?: boolean;
  figliACarico21plus?: number;
}

export interface RisultatoImpatriati {
  /** Result with impatriati regime */
  conRegime: RisultatoStipendio;
  /** Result without impatriati regime (standard taxation) */
  senzaRegime: RisultatoStipendio;
  /** Annual savings from the regime */
  risparmiAnnuo: number;
  /** Monthly savings */
  risparmiMensile: number;
}

/**
 * Calculate salary with regime impatriati.
 * The exemption reduces the taxable income by the given percentage.
 */
export function calcolaRegimeImpatriati(input: InputImpatriati): RisultatoImpatriati {
  const {
    ral,
    percentualeEsenzione = 0.5,
    regione,
    aliquotaComunale,
    mensilita,
    coniugeACarico,
    figliACarico21plus,
  } = input;

  // Standard calculation (without regime)
  const senzaRegime = calcolaStipendio({
    ral,
    regione,
    aliquotaComunale,
    mensilita,
    coniugeACarico,
    figliACarico21plus,
  });

  // With regime: the taxable RAL is reduced by the exemption percentage
  const ralTassabile = ral * (1 - percentualeEsenzione);
  const ralEsente = ral * percentualeEsenzione;

  // Calculate taxes on the reduced RAL
  const conRegimeBase = calcolaStipendio({
    ral: ralTassabile,
    regione,
    aliquotaComunale,
    mensilita,
    coniugeACarico,
    figliACarico21plus,
  });

  // The actual net is: full RAL − taxes calculated on reduced RAL
  const conRegime: RisultatoStipendio = {
    ...conRegimeBase,
    ral,
    ralMensile: Math.round((ral / (mensilita ?? 13)) * 100) / 100,
    nettoAnnuo: ral - conRegimeBase.contributiINPS - conRegimeBase.irpefNetta -
      conRegimeBase.totaleAddizionali + conRegimeBase.trattamentoIntegrativo,
    nettoMensile: 0, // will be recalculated
  };
  conRegime.nettoMensile = Math.round(
    (conRegime.nettoAnnuo / (mensilita ?? 13)) * 100
  ) / 100;

  return {
    conRegime,
    senzaRegime,
    risparmiAnnuo: Math.round((conRegime.nettoAnnuo - senzaRegime.nettoAnnuo) * 100) / 100,
    risparmiMensile: Math.round(
      ((conRegime.nettoAnnuo - senzaRegime.nettoAnnuo) / (mensilita ?? 13)) * 100
    ) / 100,
  };
}

// ─── Hourly Rate ────────────────────────────────────────────────────

/**
 * Calculate hourly rate from RAL.
 */
export function calcolaPagaOraria(
  ral: number,
  oreSettimanali: number = 40,
  settimaneAnno: number = 52
): { lordoOrario: number; nettoOrario: number; oreAnnue: number } {
  const oreAnnue = oreSettimanali * settimaneAnno;
  const lordoOrario = Math.round((ral / oreAnnue) * 100) / 100;

  // Quick netto estimate using average tax burden
  const netto = calcolaStipendio({ ral, regione: 'LOM' }); // Use Lombardia as reference
  const nettoOrario = Math.round((netto.nettoAnnuo / oreAnnue) * 100) / 100;

  return { lordoOrario, nettoOrario, oreAnnue };
}

// ─── Ferie e Permessi Non Goduti ────────────────────────────────────

export interface InputFeriePermessi {
  ral: number;
  giorniFerieNonGodute: number;
  orePermessiNonGoduti: number;
  mensilita: 12 | 13 | 14;
  oreSettimanali: number; // default 40
}

export interface RisultatoFeriePermessi {
  retribuzioneGiornaliera: number;
  retribuzioneOraria: number;
  lordoFerie: number;
  lordoPermessi: number;
  lordoTotale: number;
  inpsDipendente: number;
  irpefStimata: number;
  nettoStimato: number;
}

/**
 * Calculate the payment for unused vacation days and leave hours.
 *
 * Daily rate = RAL / mensilita / 26 (26 working days/month convention).
 * Hourly rate = daily / (oreSettimanali / 5).
 * INPS employee = 9.19% of gross total.
 * IRPEF estimated at the marginal rate on the taxable base.
 */
export function calcolaFeriePermessi(input: InputFeriePermessi): RisultatoFeriePermessi {
  const {
    ral,
    giorniFerieNonGodute,
    orePermessiNonGoduti,
    mensilita,
    oreSettimanali,
  } = input;

  if (ral <= 0) {
    return {
      retribuzioneGiornaliera: 0,
      retribuzioneOraria: 0,
      lordoFerie: 0,
      lordoPermessi: 0,
      lordoTotale: 0,
      inpsDipendente: 0,
      irpefStimata: 0,
      nettoStimato: 0,
    };
  }

  const retribuzioneMensile = ral / mensilita;
  const retribuzioneGiornaliera = Math.round((retribuzioneMensile / 26) * 100) / 100;
  const oreGiornaliere = oreSettimanali / 5;
  const retribuzioneOraria = Math.round((retribuzioneGiornaliera / oreGiornaliere) * 100) / 100;

  const lordoFerie = Math.round(retribuzioneGiornaliera * giorniFerieNonGodute * 100) / 100;
  const lordoPermessi = Math.round(retribuzioneOraria * orePermessiNonGoduti * 100) / 100;
  const lordoTotale = Math.round((lordoFerie + lordoPermessi) * 100) / 100;

  // INPS employee share: 9.19%
  const inpsDipendente = Math.round(lordoTotale * 0.0919 * 100) / 100;

  // Taxable base for IRPEF estimate
  const imponibileIRPEF = lordoTotale - inpsDipendente;

  // Use the marginal IRPEF rate based on the worker's annual taxable income
  const contributiINPSAnnui = calcolaContributiINPS(ral);
  const imponibileAnnuo = ral - contributiINPSAnnui;
  const aliquota = aliquotaMarginale(imponibileAnnuo);
  const irpefStimata = Math.round(imponibileIRPEF * aliquota * 100) / 100;

  const nettoStimato = Math.round((lordoTotale - inpsDipendente - irpefStimata) * 100) / 100;

  return {
    retribuzioneGiornaliera,
    retribuzioneOraria,
    lordoFerie,
    lordoPermessi,
    lordoTotale,
    inpsDipendente,
    irpefStimata,
    nettoStimato,
  };
}

// ─── Buonuscita / Incentivo all'Esodo ────────────────────────────────

export interface InputBuonuscita {
  importoLordo: number;
  anniServizio: number;
  tipoTassazione: 'separata' | 'ordinaria';
  ralUltimoAnno?: number;
}

export interface RisultatoBuonuscita {
  importoLordo: number;
  aliquotaTassazioneSeparata: number;
  impostaTassazioneSeparata: number;
  nettoTassazioneSeparata: number;
  aliquotaTassazioneOrdinaria: number;
  impostaTassazioneOrdinaria: number;
  nettoTassazioneOrdinaria: number;
}

/**
 * Calculate buonuscita / incentivo all'esodo taxation.
 *
 * Tassazione separata (art. 17 e 19 TUIR):
 *   Average IRPEF rate based on RAL ultimo anno:
 *     1. Compute IRPEF on (RAL - INPS) = gross tax
 *     2. Average rate = gross tax / imponibile
 *     3. Apply that rate to the buonuscita amount
 *
 * Tassazione ordinaria:
 *   Add buonuscita to current year income (RAL) and calculate
 *   the incremental IRPEF on the combined amount.
 */
export function calcolaBuonuscita(input: InputBuonuscita): RisultatoBuonuscita {
  const {
    importoLordo,
    anniServizio,
    ralUltimoAnno = 35_000,
  } = input;

  if (importoLordo <= 0) {
    return {
      importoLordo: 0,
      aliquotaTassazioneSeparata: 0,
      impostaTassazioneSeparata: 0,
      nettoTassazioneSeparata: 0,
      aliquotaTassazioneOrdinaria: 0,
      impostaTassazioneOrdinaria: 0,
      nettoTassazioneOrdinaria: 0,
    };
  }

  // --- Tassazione separata ---
  // Step 1: calculate IRPEF on RAL ultimo anno to find average rate
  const inpsRAL = calcolaContributiINPS(ralUltimoAnno);
  const imponibileRAL = Math.max(0, ralUltimoAnno - inpsRAL);
  const { irpefLorda: irpefRAL } = calcolaIRPEF(imponibileRAL);
  const aliquotaMedia = imponibileRAL > 0 ? irpefRAL / imponibileRAL : 0;

  // Step 2: apply average rate to buonuscita
  const impostaSeparata = Math.round(importoLordo * aliquotaMedia * 100) / 100;
  const nettoSeparata = Math.round((importoLordo - impostaSeparata) * 100) / 100;

  // --- Tassazione ordinaria ---
  // IRPEF on RAL alone
  const irpefSoloRAL = irpefRAL;

  // IRPEF on RAL + buonuscita (combined)
  const imponibileCombinato = imponibileRAL + importoLordo;
  const { irpefLorda: irpefCombinata } = calcolaIRPEF(imponibileCombinato);

  // Incremental IRPEF = IRPEF on combined - IRPEF on RAL alone
  const impostaOrdinaria = Math.round((irpefCombinata - irpefSoloRAL) * 100) / 100;
  const aliquotaOrdinaria = importoLordo > 0 ? impostaOrdinaria / importoLordo : 0;
  const nettoOrdinaria = Math.round((importoLordo - impostaOrdinaria) * 100) / 100;

  return {
    importoLordo,
    aliquotaTassazioneSeparata: Math.round(aliquotaMedia * 10000) / 10000,
    impostaTassazioneSeparata: impostaSeparata,
    nettoTassazioneSeparata: nettoSeparata,
    aliquotaTassazioneOrdinaria: Math.round(aliquotaOrdinaria * 10000) / 10000,
    impostaTassazioneOrdinaria: impostaOrdinaria,
    nettoTassazioneOrdinaria: nettoOrdinaria,
  };
}
