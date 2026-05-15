/**
 * Financial calculation engine — pure functions for credit, savings,
 * and investment calculators.
 *
 * All monetary values in EUR. All rates as decimals (e.g., 0.05 = 5%).
 */

// ─── Mortgage / Mutuo ─────────────────────────────────────────────

export interface InputMutuo {
  importo: number;          // loan principal
  tassoAnnuo: number;       // annual interest rate (decimal)
  durataAnni: number;       // loan term in years
  tipoTasso: 'fisso' | 'variabile';
}

export interface RisultatoMutuo {
  rataMensile: number;
  totaleInteressi: number;
  totalePagato: number;
  pianoAmmortamento: RataAmmortamento[];
}

export interface RataAmmortamento {
  mese: number;
  rata: number;
  quotaCapitale: number;
  quotaInteressi: number;
  debitoResiduo: number;
}

/**
 * Calculate mortgage monthly payment using French amortization
 * (rata costante — standard in Italy).
 */
export function calcolaMutuo(input: InputMutuo): RisultatoMutuo {
  const { importo, tassoAnnuo, durataAnni } = input;
  const tassoMensile = tassoAnnuo / 12;
  const numRate = durataAnni * 12;

  let rataMensile: number;
  if (tassoMensile === 0) {
    rataMensile = importo / numRate;
  } else {
    rataMensile =
      (importo * tassoMensile * Math.pow(1 + tassoMensile, numRate)) /
      (Math.pow(1 + tassoMensile, numRate) - 1);
  }

  const pianoAmmortamento: RataAmmortamento[] = [];
  let debitoResiduo = importo;

  for (let mese = 1; mese <= numRate; mese++) {
    const quotaInteressi = debitoResiduo * tassoMensile;
    const quotaCapitale = rataMensile - quotaInteressi;
    debitoResiduo = Math.max(0, debitoResiduo - quotaCapitale);

    pianoAmmortamento.push({
      mese,
      rata: rataMensile,
      quotaCapitale,
      quotaInteressi,
      debitoResiduo,
    });
  }

  const totalePagato = rataMensile * numRate;
  const totaleInteressi = totalePagato - importo;

  return {
    rataMensile,
    totaleInteressi,
    totalePagato,
    pianoAmmortamento,
  };
}

// ─── Personal Loan / Prestito Personale ───────────────────────────

export interface InputPrestito {
  importo: number;
  tassoAnnuo: number;       // TAN (Tasso Annuo Nominale)
  durataMesi: number;
  speseIstruttoria?: number;
  speseIncassoMensili?: number;
}

export interface RisultatoPrestito {
  rataMensile: number;
  totaleInteressi: number;
  totalePagato: number;
  taeg: number;             // Tasso Annuo Effettivo Globale
}

/**
 * Calculate personal loan with TAN and approximate TAEG.
 */
export function calcolaPrestito(input: InputPrestito): RisultatoPrestito {
  const { importo, tassoAnnuo, durataMesi } = input;
  const speseIstruttoria = input.speseIstruttoria ?? 0;
  const speseIncassoMensili = input.speseIncassoMensili ?? 0;

  const tassoMensile = tassoAnnuo / 12;

  let rataMensile: number;
  if (tassoMensile === 0) {
    rataMensile = importo / durataMesi;
  } else {
    rataMensile =
      (importo * tassoMensile * Math.pow(1 + tassoMensile, durataMesi)) /
      (Math.pow(1 + tassoMensile, durataMesi) - 1);
  }

  rataMensile += speseIncassoMensili;
  const totalePagato = rataMensile * durataMesi + speseIstruttoria;
  const totaleInteressi = totalePagato - importo;

  // Approximate TAEG using Newton-Raphson on the effective rate
  const taeg = calcolaTAEG(importo - speseIstruttoria, rataMensile, durataMesi);

  return {
    rataMensile,
    totaleInteressi,
    totalePagato,
    taeg,
  };
}

/** Approximate TAEG (APR) using Newton-Raphson method */
function calcolaTAEG(
  importoNetto: number,
  rataMensile: number,
  numRate: number
): number {
  // Initial guess
  let r = 0.01; // monthly rate guess

  for (let i = 0; i < 100; i++) {
    const pv =
      r === 0
        ? rataMensile * numRate
        : (rataMensile * (1 - Math.pow(1 + r, -numRate))) / r;
    const dpv =
      r === 0
        ? 0
        : (rataMensile *
            (numRate * Math.pow(1 + r, -numRate - 1) * r -
              (1 - Math.pow(1 + r, -numRate)))) /
          (r * r);

    const diff = pv - importoNetto;
    if (Math.abs(diff) < 0.01) break;

    r = r - diff / dpv;
    if (r <= 0) r = 0.0001;
  }

  return r * 12; // annualize
}

// ─── Compound Interest / Interesse Composto ───────────────────────

export interface InputInteresseComposto {
  capitaleIniziale: number;
  tassoAnnuo: number;
  durataAnni: number;
  frequenzaComposta: 1 | 2 | 4 | 12 | 365; // annual, semi, quarterly, monthly, daily
  versamentoperiodico?: number;
  frequenzaVersamento?: 1 | 12; // annual or monthly
}

export interface RisultatoInteresseComposto {
  capitaleFinale: number;
  totaleVersato: number;
  totaleInteressi: number;
  evoluzione: { anno: number; capitale: number; versato: number; interessi: number }[];
}

/**
 * Calculate compound interest with optional periodic contributions.
 */
export function calcolaInteresseComposto(
  input: InputInteresseComposto
): RisultatoInteresseComposto {
  const {
    capitaleIniziale,
    tassoAnnuo,
    durataAnni,
    frequenzaComposta,
    versamentoperiodico = 0,
    frequenzaVersamento = 12,
  } = input;

  const evoluzione: RisultatoInteresseComposto['evoluzione'] = [];
  let capitale = capitaleIniziale;
  let totaleVersato = capitaleIniziale;

  const tassoPerPeriodo = tassoAnnuo / frequenzaComposta;
  const periodiPerAnno = frequenzaComposta;

  for (let anno = 1; anno <= durataAnni; anno++) {
    // Compound within the year
    for (let p = 0; p < periodiPerAnno; p++) {
      capitale *= 1 + tassoPerPeriodo;

      // Add periodic contributions at the right frequency
      if (versamentoperiodico > 0) {
        if (frequenzaVersamento === 12 && periodiPerAnno >= 12) {
          // Monthly contributions with monthly or more frequent compounding
          capitale += versamentoperiodico;
          totaleVersato += versamentoperiodico;
        } else if (frequenzaVersamento === 1 && p === periodiPerAnno - 1) {
          // Annual contribution at end of year
          capitale += versamentoperiodico;
          totaleVersato += versamentoperiodico;
        } else if (frequenzaVersamento === 12 && periodiPerAnno < 12) {
          // Monthly contributions with less frequent compounding
          const mesiPerPeriodo = 12 / periodiPerAnno;
          capitale += versamentoperiodico * mesiPerPeriodo;
          totaleVersato += versamentoperiodico * mesiPerPeriodo;
        }
      }
    }

    evoluzione.push({
      anno,
      capitale,
      versato: totaleVersato,
      interessi: capitale - totaleVersato,
    });
  }

  return {
    capitaleFinale: capitale,
    totaleVersato,
    totaleInteressi: capitale - totaleVersato,
    evoluzione,
  };
}

// ─── Savings Plan / Piano di Accumulo (PAC) ───────────────────────

export interface InputPAC {
  versamentoMensile: number;
  tassoAnnuoAtteso: number;   // expected annual return
  durataAnni: number;
  capitaleIniziale?: number;
  costoIngressoPercent?: number; // entry fee as decimal
  costoGestioneAnnuoPercent?: number; // annual management fee
}

export interface RisultatoPAC {
  capitaleFinale: number;
  totaleVersato: number;
  rendimentoLordo: number;
  rendimentoNetto: number;    // after 26% Italian capital gains tax
  imposteCapitalGain: number;
  evoluzione: { anno: number; capitale: number; versato: number }[];
}

/**
 * Calculate PAC (Piano di Accumulo Capitale) — systematic investment plan.
 * Applies Italian 26% capital gains tax on the gain at the end.
 */
export function calcolaPAC(input: InputPAC): RisultatoPAC {
  const {
    versamentoMensile,
    tassoAnnuoAtteso,
    durataAnni,
    capitaleIniziale = 0,
    costoIngressoPercent = 0,
    costoGestioneAnnuoPercent = 0,
  } = input;

  const tassoMensileNetto = (tassoAnnuoAtteso - costoGestioneAnnuoPercent) / 12;
  const evoluzione: RisultatoPAC['evoluzione'] = [];
  let capitale = capitaleIniziale;
  let totaleVersato = capitaleIniziale;

  for (let anno = 1; anno <= durataAnni; anno++) {
    for (let mese = 0; mese < 12; mese++) {
      const versamentoNetto = versamentoMensile * (1 - costoIngressoPercent);
      capitale = (capitale + versamentoNetto) * (1 + tassoMensileNetto);
      totaleVersato += versamentoMensile;
    }

    evoluzione.push({
      anno,
      capitale,
      versato: totaleVersato,
    });
  }

  const rendimentoLordo = capitale - totaleVersato;
  const ALIQUOTA_CAPITAL_GAIN = 0.26; // 26% Italian rate
  const imposteCapitalGain = Math.max(0, rendimentoLordo * ALIQUOTA_CAPITAL_GAIN);
  const rendimentoNetto = rendimentoLordo - imposteCapitalGain;

  return {
    capitaleFinale: capitale,
    totaleVersato,
    rendimentoLordo,
    rendimentoNetto,
    imposteCapitalGain,
    evoluzione,
  };
}

// ─── Inflation / Inflazione ────────────────────────────────────────

export interface InputInflazione {
  importo: number;
  tassoInflazione: number;   // annual inflation rate as decimal
  durataAnni: number;
}

export interface RisultatoInflazione {
  valoreReale: number;       // purchasing power after N years
  perditaPotereAcquisto: number;
  percentualePerdita: number;
  evoluzione: { anno: number; valoreNominale: number; valoreReale: number }[];
}

/**
 * Calculate inflation impact on purchasing power.
 */
export function calcolaInflazione(input: InputInflazione): RisultatoInflazione {
  const { importo, tassoInflazione, durataAnni } = input;

  const evoluzione: RisultatoInflazione['evoluzione'] = [];

  for (let anno = 1; anno <= durataAnni; anno++) {
    const valoreReale = importo / Math.pow(1 + tassoInflazione, anno);
    evoluzione.push({
      anno,
      valoreNominale: importo,
      valoreReale,
    });
  }

  const valoreRealeFinale = importo / Math.pow(1 + tassoInflazione, durataAnni);
  const perditaPotereAcquisto = importo - valoreRealeFinale;

  return {
    valoreReale: valoreRealeFinale,
    perditaPotereAcquisto,
    percentualePerdita: perditaPotereAcquisto / importo,
    evoluzione,
  };
}

// ─── FIRE / Indipendenza Finanziaria ─────────────────────────────

export interface InputFIRE {
  speseAnnue: number;              // annual expenses
  tassoPrelievo: number;           // safe withdrawal rate (default 0.04 = 4%)
  patrimoniAttuale: number;
  risparmiAnnui: number;
  rendimentoAtteso: number;        // expected return (default 0.07)
  inflazioneAttesa: number;        // expected inflation (default 0.02)
  tassazioneRendimenti: number;    // Italian capital gains tax (default 0.26)
}

export interface RisultatoFIRE {
  patrimonioObiettivo: number;     // speseAnnue / tassoPrelievo
  anniAlFIRE: number;              // years until FIRE number reached
  savingsRate: number;             // risparmiAnnui / (risparmiAnnui + speseAnnue)
  rendimentoRealeNetto: number;    // after inflation and taxes
  evoluzione: { anno: number; patrimonio: number; obiettivo: number }[];
  renditaMensile: number;          // patrimonio x tassoPrelievo / 12
}

/**
 * Calculate FIRE (Financial Independence, Retire Early) projections.
 *
 * Uses the "FIRE number" approach: patrimonio obiettivo = speseAnnue / tassoPrelievo.
 * Iterates year-by-year accounting for net real returns (after inflation and taxes).
 */
export function calcolaFIRE(input: InputFIRE): RisultatoFIRE {
  const {
    speseAnnue,
    tassoPrelievo,
    patrimoniAttuale,
    risparmiAnnui,
    rendimentoAtteso,
    inflazioneAttesa,
    tassazioneRendimenti,
  } = input;

  const patrimonioObiettivo = tassoPrelievo > 0 ? speseAnnue / tassoPrelievo : 0;

  // Net real return: (nominal return - inflation) x (1 - tax rate)
  const rendimentoRealeNetto =
    (rendimentoAtteso - inflazioneAttesa) * (1 - tassazioneRendimenti);

  const savingsRate =
    risparmiAnnui + speseAnnue > 0
      ? risparmiAnnui / (risparmiAnnui + speseAnnue)
      : 0;

  const evoluzione: RisultatoFIRE['evoluzione'] = [];
  let patrimonio = patrimoniAttuale;
  let anniAlFIRE = -1;
  const maxAnni = 80; // cap iteration

  for (let anno = 1; anno <= maxAnni; anno++) {
    patrimonio = patrimonio * (1 + rendimentoRealeNetto) + risparmiAnnui;

    evoluzione.push({
      anno,
      patrimonio: Math.round(patrimonio * 100) / 100,
      obiettivo: patrimonioObiettivo,
    });

    if (anniAlFIRE < 0 && patrimonio >= patrimonioObiettivo) {
      anniAlFIRE = anno;
    }

    // Stop 10 years after reaching FIRE or at max
    if (anniAlFIRE > 0 && anno >= anniAlFIRE + 10) break;
  }

  // If never reached, set to maxAnni + 1 to indicate "not reachable"
  if (anniAlFIRE < 0) {
    anniAlFIRE = maxAnni + 1;
  }

  const renditaMensile =
    Math.round(((patrimonioObiettivo * tassoPrelievo) / 12) * 100) / 100;

  return {
    patrimonioObiettivo: Math.round(patrimonioObiettivo * 100) / 100,
    anniAlFIRE,
    savingsRate: Math.round(savingsRate * 10000) / 10000,
    rendimentoRealeNetto: Math.round(rendimentoRealeNetto * 10000) / 10000,
    evoluzione,
    renditaMensile,
  };
}

// ─── Pensione INPS (sistema contributivo) ────────────────────────

export interface InputPensione {
  etaAttuale: number;
  etaPensionamento: number;        // default 67
  ralAttuale: number;
  crescitaRALAnnua: number;        // default 0.02 (2%)
  anniContributiVersati: number;   // years already contributed
  montanteAccumulato: number;      // accumulated contribution fund (0 if unknown)
  aliquotaContributiva: number;    // 33% for dipendenti (IVS totale datore+dipendente)
}

export interface RisultatoPensione {
  montanteFinale: number;
  coefficienteTrasformazione: number;
  pensioneAnnuaLorda: number;
  pensioneMensileLorda: number;    // su 13 mensilita'
  pensioneAnnuaNetta: number;      // after IRPEF
  pensioneMensileNetta: number;
  tassoSostituzione: number;       // pensione netta / ultimo stipendio netto
  anniContribuzioneFinali: number;
  evoluzioneMontante: { anno: number; eta: number; montante: number; ral: number }[];
}

/**
 * Coefficienti di trasformazione del montante contributivo in pensione annua.
 * Validi per il biennio 2024-2025 (Decreto MEF 20 novembre 2023).
 * Fonte: INPS, Gazzetta Ufficiale.
 */
const COEFFICIENTI_TRASFORMAZIONE: Record<number, number> = {
  57: 0.04270,
  58: 0.04382,
  59: 0.04504,
  60: 0.04636,
  61: 0.04781,
  62: 0.04940,
  63: 0.05115,
  64: 0.05308,
  65: 0.05523,
  66: 0.05723,
  67: 0.05931,
  68: 0.06154,
  69: 0.06395,
  70: 0.06655,
  71: 0.06938,
};

/** Average GDP nominal growth rate for montante revaluation */
const TASSO_RIVALUTAZIONE_PIL = 0.015; // 1.5% conservative estimate

/**
 * Calculate estimated INPS pension using the contributivo method.
 *
 * Steps:
 * 1. Project future RAL growth
 * 2. Each year: montante += RAL x aliquota contributiva (33%)
 * 3. Revalue existing montante by GDP growth rate
 * 4. At retirement age: pensione lorda = montante x coefficiente trasformazione
 * 5. Apply IRPEF to get pensione netta
 */
export function calcolaPensione(input: InputPensione): RisultatoPensione {
  const {
    etaAttuale,
    etaPensionamento,
    ralAttuale,
    crescitaRALAnnua,
    anniContributiVersati,
    montanteAccumulato,
    aliquotaContributiva,
  } = input;

  const anniFuturi = Math.max(0, etaPensionamento - etaAttuale);
  const anniContribuzioneFinali = anniContributiVersati + anniFuturi;

  // If montante not provided, estimate from past contributions
  let montante = montanteAccumulato;
  if (montante <= 0 && anniContributiVersati > 0) {
    // Rough estimate: average RAL over past years x aliquota x years
    // Assume RAL grew at the same rate, so average is roughly current RAL adjusted
    let ralPassata = ralAttuale;
    for (let i = 0; i < anniContributiVersati; i++) {
      ralPassata = ralPassata / (1 + crescitaRALAnnua);
    }
    // Build montante from past contributions
    let ral = ralPassata;
    montante = 0;
    for (let i = 0; i < anniContributiVersati; i++) {
      montante = montante * (1 + TASSO_RIVALUTAZIONE_PIL) + ral * aliquotaContributiva;
      ral = ral * (1 + crescitaRALAnnua);
    }
  }

  const evoluzioneMontante: RisultatoPensione['evoluzioneMontante'] = [];
  let ral = ralAttuale;

  // Project future montante growth
  for (let i = 1; i <= anniFuturi; i++) {
    montante = montante * (1 + TASSO_RIVALUTAZIONE_PIL) + ral * aliquotaContributiva;
    evoluzioneMontante.push({
      anno: i,
      eta: etaAttuale + i,
      montante: Math.round(montante * 100) / 100,
      ral: Math.round(ral * 100) / 100,
    });
    ral = ral * (1 + crescitaRALAnnua);
  }

  const montanteFinale = Math.round(montante * 100) / 100;

  // Get coefficiente di trasformazione
  const etaClamp = Math.max(57, Math.min(71, etaPensionamento));
  const coefficienteTrasformazione = COEFFICIENTI_TRASFORMAZIONE[etaClamp] ?? 0.05931;

  // Pensione lorda annua
  const pensioneAnnuaLorda = Math.round(montanteFinale * coefficienteTrasformazione * 100) / 100;
  const pensioneMensileLorda = Math.round((pensioneAnnuaLorda / 13) * 100) / 100;

  // Calculate pensione netta (apply IRPEF + detrazioni pensionati)
  const pensioneAnnuaNetta = calcolaPensioneNetta(pensioneAnnuaLorda);
  const pensioneMensileNetta = Math.round((pensioneAnnuaNetta / 13) * 100) / 100;

  // Tasso di sostituzione: pensione netta mensile / ultimo stipendio netto mensile
  const ultimaRAL = ralAttuale * Math.pow(1 + crescitaRALAnnua, anniFuturi);
  const contributiINPSUltimi = ultimaRAL * 0.0919;
  const imponibileStipendio = ultimaRAL - contributiINPSUltimi;
  const { irpefLorda: irpefStipendio } = calcolaIRPEFPensione(imponibileStipendio);
  const detrazioniStipendio = calcolaDetrazioneLavDipPensione(imponibileStipendio);
  const nettoStipendioAnnuo = ultimaRAL - contributiINPSUltimi - Math.max(0, irpefStipendio - detrazioniStipendio);
  const nettoStipendioMensile = nettoStipendioAnnuo / 13;
  const tassoSostituzione = nettoStipendioMensile > 0
    ? Math.round((pensioneMensileNetta / nettoStipendioMensile) * 10000) / 10000
    : 0;

  return {
    montanteFinale,
    coefficienteTrasformazione,
    pensioneAnnuaLorda,
    pensioneMensileLorda,
    pensioneAnnuaNetta,
    pensioneMensileNetta,
    tassoSostituzione,
    anniContribuzioneFinali,
    evoluzioneMontante,
  };
}

/** Simplified IRPEF calculation for pension engine (avoids circular deps) */
function calcolaIRPEFPensione(imponibile: number): { irpefLorda: number } {
  if (imponibile <= 0) return { irpefLorda: 0 };

  const scaglioni = [
    { limite: 28_000, aliquota: 0.23 },
    { limite: 50_000, aliquota: 0.35 },
    { limite: Infinity, aliquota: 0.43 },
  ];

  let irpef = 0;
  let base = 0;
  for (const s of scaglioni) {
    if (imponibile <= base) break;
    const tassabile = Math.min(imponibile, s.limite) - base;
    if (tassabile > 0) irpef += tassabile * s.aliquota;
    base = s.limite;
  }

  return { irpefLorda: Math.round(irpef * 100) / 100 };
}

/** Simplified detrazione lavoro dipendente for pension engine */
function calcolaDetrazioneLavDipPensione(reddito: number): number {
  if (reddito <= 0) return 0;
  if (reddito <= 15_000) return 1_955;
  if (reddito <= 28_000) return 1_910 + 1_190 * ((28_000 - reddito) / 13_000);
  if (reddito <= 50_000) return 1_910 * ((50_000 - reddito) / 22_000);
  return 0;
}

/** Simplified detrazioni for pensionati */
function calcolaDetrazioniPensionati(reddito: number): number {
  if (reddito <= 0) return 0;
  if (reddito <= 8_500) return 1_955;
  if (reddito <= 28_000) return 700 + 1_255 * ((28_000 - reddito) / 19_500);
  if (reddito <= 50_000) return 700 * ((50_000 - reddito) / 22_000);
  return 0;
}

/** Calculate net pension after IRPEF with pensioner deductions */
function calcolaPensioneNetta(pensioneLorda: number): number {
  const { irpefLorda } = calcolaIRPEFPensione(pensioneLorda);
  const detrazioni = calcolaDetrazioniPensionati(pensioneLorda);
  const irpefNetta = Math.max(0, irpefLorda - detrazioni);
  // Add approximate addizionali (regional ~1.5% + municipal ~0.8%)
  const addizionali = pensioneLorda * 0.023;
  return Math.round((pensioneLorda - irpefNetta - addizionali) * 100) / 100;
}

// ─── ISEE / Indicatore Situazione Economica Equivalente ──────────

export interface InputISEE {
  redditoComplessivo: number;       // ISR: redditi complessivi nucleo
  patrimonioMobiliare: number;      // depositi, investimenti, etc.
  patrimonioImmobiliare: number;    // valore catastale immobili
  mutuoResiduo: number;             // debito residuo mutuo prima casa
  affittoAnnuo: number;             // canone annuo locazione
  componentiFamiglia: number;       // numero componenti nucleo
  figliMinorenni: number;
  figliMaggioriConviventi: number;
  disabili: number;
  genitoreUnico: boolean;           // monogenitore
}

export interface RisultatoISEE {
  isr: number;                      // Indicatore Situazione Reddituale
  isp: number;                      // Indicatore Situazione Patrimoniale
  ise: number;                      // ISR + 20% ISP
  scalaEquivalenza: number;         // scale factor
  isee: number;                     // ISE / scala equivalenza
  fasciaISEE: string;               // description of what benefits they qualify for
  patrimonioMobiliareNetto: number;
  patrimonioImmobiliareNetto: number;
  franchigiaMobiliare: number;
  franchigiaImmobiliare: number;
}

/**
 * Scala di equivalenza base DPCM 159/2013, art. 4.
 *
 * N. componenti | Parametro
 * 1             | 1,00
 * 2             | 1,57
 * 3             | 2,04
 * 4             | 2,46
 * 5             | 2,85
 * > 5           | 2,85 + 0,35 per ogni componente aggiuntivo
 *
 * Maggiorazioni:
 * +0,2 per ogni figlio minorenne
 * +0,35 se ci sono almeno 3 figli minorenni
 * +0,5 per ogni componente con disabilita'
 * +0,2 per genitore unico con almeno un figlio minorenne
 */
const SCALA_EQUIVALENZA_BASE: Record<number, number> = {
  1: 1.00,
  2: 1.57,
  3: 2.04,
  4: 2.46,
  5: 2.85,
};

/** Franchigia patrimonio mobiliare base (1 componente) */
const FRANCHIGIA_MOBILIARE_BASE = 15_493.71;

/** Incremento franchigia per figlio (fino a max definito da DPCM) */
const FRANCHIGIA_MOBILIARE_PER_FIGLIO = 1_000;

/** Franchigia massima patrimonio immobiliare prima casa */
const FRANCHIGIA_IMMOBILIARE_PRIMA_CASA = 52_500;

/**
 * Calculate ISEE (Indicatore della Situazione Economica Equivalente).
 *
 * Simplified model based on DPCM 159/2013 and successive modifiche.
 * The official ISEE requires a DSU submitted through CAF or INPS.
 */
export function calcolaISEE(input: InputISEE): RisultatoISEE {
  const {
    redditoComplessivo,
    patrimonioMobiliare,
    patrimonioImmobiliare,
    mutuoResiduo,
    affittoAnnuo,
    componentiFamiglia,
    figliMinorenni,
    figliMaggioriConviventi,
    disabili,
    genitoreUnico,
  } = input;

  // ── ISR (Indicatore Situazione Reddituale) ──
  // Simplified: the reddito complessivo is already considered net of standard deductions.
  // In the real DSU, ISR includes redditi + trattamenti assistenziali − some deductions.
  const isr = Math.max(0, redditoComplessivo - affittoAnnuo * 0.0);
  // Note: affitto is deducted from patrimonio immobiliare side, not ISR in simplified model

  // ── Franchigia patrimonio mobiliare ──
  const totaleFigli = figliMinorenni + figliMaggioriConviventi;
  const franchigiaMobiliare =
    FRANCHIGIA_MOBILIARE_BASE + totaleFigli * FRANCHIGIA_MOBILIARE_PER_FIGLIO;
  const patrimonioMobiliareNetto = Math.max(0, patrimonioMobiliare - franchigiaMobiliare);

  // ── Franchigia patrimonio immobiliare ──
  // Per la prima casa: sottrarre la franchigia (max 52.500) o il mutuo residuo (se inferiore)
  const franchigiaImmobiliare = Math.min(
    FRANCHIGIA_IMMOBILIARE_PRIMA_CASA,
    mutuoResiduo > 0 ? mutuoResiduo : FRANCHIGIA_IMMOBILIARE_PRIMA_CASA,
    patrimonioImmobiliare,
  );
  const patrimonioImmobiliarePostFranchigia = Math.max(
    0,
    patrimonioImmobiliare - franchigiaImmobiliare,
  );
  // Si considera il 2/3 del patrimonio immobiliare al netto della franchigia
  const patrimonioImmobiliareNetto = patrimonioImmobiliarePostFranchigia * (2 / 3);

  // ── ISP (Indicatore Situazione Patrimoniale) ──
  const isp = patrimonioMobiliareNetto + patrimonioImmobiliareNetto;

  // ── ISE (Indicatore Situazione Economica) ──
  const ise = isr + 0.20 * isp;

  // ── Scala di equivalenza ──
  const componentiClamp = Math.max(1, Math.min(componentiFamiglia, 99));
  let scalaBase: number;
  if (componentiClamp <= 5) {
    scalaBase = SCALA_EQUIVALENZA_BASE[componentiClamp];
  } else {
    scalaBase = SCALA_EQUIVALENZA_BASE[5] + (componentiClamp - 5) * 0.35;
  }

  // Maggiorazioni
  let maggiorazioni = 0;
  maggiorazioni += figliMinorenni * 0.2;
  if (figliMinorenni >= 3) {
    maggiorazioni += 0.35;
  }
  maggiorazioni += disabili * 0.5;
  if (genitoreUnico && figliMinorenni > 0) {
    maggiorazioni += 0.2;
  }

  const scalaEquivalenza = Math.round((scalaBase + maggiorazioni) * 100) / 100;

  // ── ISEE ──
  const isee = scalaEquivalenza > 0
    ? Math.round((ise / scalaEquivalenza) * 100) / 100
    : 0;

  // ── Fascia ISEE ──
  let fasciaISEE: string;
  if (isee <= 6_000) {
    fasciaISEE = 'Fascia minima: accesso a bonus sociali (elettricita\', gas, acqua), carta acquisti, bonus asilo nido massimo';
  } else if (isee <= 9_530) {
    fasciaISEE = 'Accesso a sussidi sociali, agevolazioni tariffarie, contributi per affitto';
  } else if (isee <= 15_000) {
    fasciaISEE = 'Accesso a bonus vari, agevolazioni universitarie massime, riduzione mense scolastiche';
  } else if (isee <= 20_000) {
    fasciaISEE = 'Agevolazioni universitarie parziali, riduzioni tariffarie, accesso a bandi regionali';
  } else if (isee <= 40_000) {
    fasciaISEE = 'Agevolazioni universitarie ridotte, accesso a Fondo Garanzia Prima Casa giovani under 36';
  } else {
    fasciaISEE = 'Nessuna agevolazione legata all\'ISEE. Possibili comunque detrazioni fiscali ordinarie';
  }

  return {
    isr: Math.round(isr * 100) / 100,
    isp: Math.round(isp * 100) / 100,
    ise: Math.round(ise * 100) / 100,
    scalaEquivalenza,
    isee,
    fasciaISEE,
    patrimonioMobiliareNetto: Math.round(patrimonioMobiliareNetto * 100) / 100,
    patrimonioImmobiliareNetto: Math.round(patrimonioImmobiliareNetto * 100) / 100,
    franchigiaMobiliare: Math.round(franchigiaMobiliare * 100) / 100,
    franchigiaImmobiliare: Math.round(franchigiaImmobiliare * 100) / 100,
  };
}

// ─── Bonus Ristrutturazione ──────────────────────────────────────

export interface InputBonusRistrutturazione {
  costoLavori: number;
  tipoBonus: '36' | '50' | '65' | '70' | '75' | '80' | '85' | '90';
  anniDetrazione: number;         // 10 years standard, 5 for sismabonus
  aliquotaIRPEFMarginale: number; // to calculate actual savings (decimal)
  tettoMassimo: number;           // max deductible expense
}

export interface RisultatoBonusRistrutturazione {
  costoLavori: number;
  percentualeDetrazione: number;
  importoDetraibile: number;
  detrazioneAnnua: number;
  risparmiAnnuoEffettivo: number;
  risparmiTotale: number;
  costoEffettivo: number;
  capienzaSufficiente: boolean;
  irpefAnnuaStimata: number;
  quotaPersa: number;
}

/**
 * Calculate renovation bonus (bonus ristrutturazione) tax deduction.
 *
 * The deduction is spread evenly across N years (typically 10).
 * The effective saving depends on the taxpayer's IRPEF capacity.
 */
export function calcolaBonusRistrutturazione(
  input: InputBonusRistrutturazione
): RisultatoBonusRistrutturazione {
  const {
    costoLavori,
    tipoBonus,
    anniDetrazione,
    aliquotaIRPEFMarginale,
    tettoMassimo,
  } = input;

  const percentualeDetrazione = parseInt(tipoBonus, 10) / 100;
  const speseAmmesse = Math.min(costoLavori, tettoMassimo);
  const importoDetraibile = speseAmmesse * percentualeDetrazione;
  const detrazioneAnnua = importoDetraibile / anniDetrazione;

  // Estimate annual IRPEF from the marginal rate and RAL
  // We use marginal rate as a proxy passed in EUR (annual IRPEF amount)
  const irpefAnnuaStimata = aliquotaIRPEFMarginale;
  const capienzaSufficiente = detrazioneAnnua <= irpefAnnuaStimata;

  const risparmiAnnuoEffettivo = Math.min(detrazioneAnnua, irpefAnnuaStimata);
  const quotaPersa = Math.max(0, detrazioneAnnua - irpefAnnuaStimata);
  const risparmiTotale = risparmiAnnuoEffettivo * anniDetrazione;
  const costoEffettivo = costoLavori - risparmiTotale;

  return {
    costoLavori,
    percentualeDetrazione,
    importoDetraibile,
    detrazioneAnnua,
    risparmiAnnuoEffettivo,
    risparmiTotale,
    costoEffettivo,
    capienzaSufficiente,
    irpefAnnuaStimata,
    quotaPersa,
  };
}

// ─── Plusvalenza Immobiliare ─────────────────────────────────────

export interface InputPlusvalenzaImmobiliare {
  prezzoVendita: number;
  prezzoAcquisto: number;
  costiAcquisto: number;          // notaio, agenzia, imposte
  costiRistrutturazione: number;  // documented renovation costs
  anniPossesso: number;
  tipoTassazione: 'ordinaria' | 'sostitutiva';
  aliquotaIRPEFMarginale: number; // for ordinaria comparison (decimal)
}

export interface RisultatoPlusvalenzaImmobiliare {
  plusvalenza: number;
  esentePer5Anni: boolean;
  impostaSostitutiva: number;
  impostaOrdinaria: number;
  risparmioSostitutiva: number;
  nettoDopoImpostaSostitutiva: number;
  nettoDopoImpostaOrdinaria: number;
}

/**
 * Calculate capital gains tax on real estate sale (plusvalenza immobiliare).
 *
 * Rules:
 * - Plusvalenza = prezzoVendita - prezzoAcquisto - costiAcquisto - costiRistrutturazione
 * - Exempt if ownership > 5 years OR primary residence for majority of ownership
 * - Imposta sostitutiva: 26% flat on the capital gain
 * - Tassazione ordinaria: added to total income, taxed at IRPEF marginal rate
 */
export function calcolaPlusvalenzaImmobiliare(
  input: InputPlusvalenzaImmobiliare
): RisultatoPlusvalenzaImmobiliare {
  const {
    prezzoVendita,
    prezzoAcquisto,
    costiAcquisto,
    costiRistrutturazione,
    anniPossesso,
    aliquotaIRPEFMarginale,
  } = input;

  const plusvalenzaLorda = prezzoVendita - prezzoAcquisto - costiAcquisto - costiRistrutturazione;
  const plusvalenza = Math.max(0, plusvalenzaLorda);
  const esentePer5Anni = anniPossesso > 5;

  const ALIQUOTA_SOSTITUTIVA = 0.26; // 26%

  const impostaSostitutiva = esentePer5Anni ? 0 : plusvalenza * ALIQUOTA_SOSTITUTIVA;
  const impostaOrdinaria = esentePer5Anni ? 0 : plusvalenza * aliquotaIRPEFMarginale;

  const risparmioSostitutiva = impostaOrdinaria - impostaSostitutiva;

  const nettoDopoImpostaSostitutiva = prezzoVendita - impostaSostitutiva;
  const nettoDopoImpostaOrdinaria = prezzoVendita - impostaOrdinaria;

  return {
    plusvalenza,
    esentePer5Anni,
    impostaSostitutiva,
    impostaOrdinaria,
    risparmioSostitutiva,
    nettoDopoImpostaSostitutiva,
    nettoDopoImpostaOrdinaria,
  };
}

// ─── Tassazione Investimenti / Capital Gain ──────────────────────

export interface InputTassazioneInvestimenti {
  capitaleInvestito: number;
  valoreAttuale: number;
  tipoStrumento: 'azioni_etf' | 'obbligazioni_corporate' | 'titoli_stato' | 'conti_deposito' | 'crypto' | 'fondi';
  anniDetenzione: number;
  minusvalenzePregresse: number;
}

export interface RisultatoTassazioneInvestimenti {
  plusvalenza: number;
  aliquota: number;
  impostaLorda: number;
  creditoMinusvalenze: number;
  impostaNetta: number;
  nettoDopoTasse: number;
  rendimentoLordoPercent: number;
  rendimentoNettoPercent: number;
}

/** Map instrument type to applicable tax rate */
function aliquotaPerStrumento(
  tipo: InputTassazioneInvestimenti['tipoStrumento'],
): number {
  switch (tipo) {
    case 'titoli_stato':
      return 0.125; // 12.5%
    case 'azioni_etf':
    case 'obbligazioni_corporate':
    case 'conti_deposito':
    case 'crypto':
    case 'fondi':
    default:
      return 0.26; // 26%
  }
}

/**
 * Calculate Italian investment taxation (capital gains tax).
 *
 * Rules:
 * - Standard rate: 26% on capital gains (azioni, ETF, obbligazioni corporate,
 *   fondi, crypto, conti deposito)
 * - Reduced rate: 12.5% on Italian/EU government bonds (BTP, BOT, CCT)
 * - Minusvalenze pregresse: can offset plusvalenze within 4 years
 *   (only for "redditi diversi", not for OICR/fondi armonizzati)
 *
 * Reference: TUIR art. 44, 67; DPR 917/86
 */
export function calcolaTassazioneInvestimenti(
  input: InputTassazioneInvestimenti,
): RisultatoTassazioneInvestimenti {
  const {
    capitaleInvestito,
    valoreAttuale,
    tipoStrumento,
    minusvalenzePregresse,
  } = input;

  const plusvalenza = Math.max(0, valoreAttuale - capitaleInvestito);
  const aliquota = aliquotaPerStrumento(tipoStrumento);

  const impostaLorda = plusvalenza * aliquota;

  // Minusvalenze can only offset "redditi diversi" (plusvalenze).
  // Fondi/ETF armonizzati generate "redditi da capitale" and CANNOT be offset.
  const puoCompensare = tipoStrumento !== 'fondi';
  const creditoMinusvalenze = puoCompensare
    ? Math.min(minusvalenzePregresse * aliquota, impostaLorda)
    : 0;

  const impostaNetta = Math.max(0, impostaLorda - creditoMinusvalenze);
  const nettoDopoTasse = valoreAttuale - impostaNetta;

  const rendimentoLordoPercent =
    capitaleInvestito > 0 ? plusvalenza / capitaleInvestito : 0;
  const rendimentoNettoPercent =
    capitaleInvestito > 0
      ? (plusvalenza - impostaNetta) / capitaleInvestito
      : 0;

  return {
    plusvalenza,
    aliquota,
    impostaLorda,
    creditoMinusvalenze,
    impostaNetta,
    nettoDopoTasse,
    rendimentoLordoPercent,
    rendimentoNettoPercent,
  };
}

// ─── Affitto vs Acquisto ─────────────────────────────────────────

export interface InputAffittoVsAcquisto {
  valoreImmobile: number;
  anticipoAcquisto: number;
  tassoMutuo: number;
  durataMutuo: number;
  affittoMensile: number;
  crescitaAffitto: number;
  crescitaValore: number;
  costiAcquisto: number;
  speseCondominiali: number;
  imu: number;
  manutenzioneAnnua: number;
  rendimentoAlternativo: number;
  orizzonteAnni: number;
}

export interface RisultatoAffittoVsAcquisto {
  costoTotaleAffitto: number;
  costoTotaleAcquisto: number;
  risparmiAcquisto: number;
  breakevenAnni: number;
  evoluzione: {
    anno: number;
    costoAffitto: number;
    costoAcquisto: number;
    valoreImmobile: number;
  }[];
}

/**
 * Compare the total cost of renting vs buying over a given time horizon.
 *
 * Renting cost = cumulative rent + lost opportunity cost on the down payment
 * (invested at the alternative return rate) minus the final value of the
 * invested down payment.
 *
 * Buying cost = down payment + purchase costs + mortgage total +
 * maintenance + IMU + condo fees - final property value.
 *
 * A positive `risparmiAcquisto` means buying is cheaper.
 */
export function calcolaAffittoVsAcquisto(
  input: InputAffittoVsAcquisto,
): RisultatoAffittoVsAcquisto {
  const {
    valoreImmobile,
    anticipoAcquisto,
    tassoMutuo,
    durataMutuo,
    affittoMensile,
    crescitaAffitto,
    crescitaValore,
    costiAcquisto,
    speseCondominiali,
    imu,
    manutenzioneAnnua,
    rendimentoAlternativo,
    orizzonteAnni,
  } = input;

  // Calculate the mortgage payment
  const importoMutuo = valoreImmobile - anticipoAcquisto;
  let rataMutuo = 0;
  if (importoMutuo > 0 && durataMutuo > 0) {
    const tassoMensile = tassoMutuo / 12;
    const numRate = durataMutuo * 12;
    if (tassoMensile === 0) {
      rataMutuo = importoMutuo / numRate;
    } else {
      rataMutuo =
        (importoMutuo * tassoMensile * Math.pow(1 + tassoMensile, numRate)) /
        (Math.pow(1 + tassoMensile, numRate) - 1);
    }
  }

  const evoluzione: RisultatoAffittoVsAcquisto['evoluzione'] = [];

  let costoAffittoCumulato = 0;
  let costoAcquistoCumulato = anticipoAcquisto + valoreImmobile * costiAcquisto;
  let valoreImmobileCorrente = valoreImmobile;
  let capitaleInvestito = anticipoAcquisto + valoreImmobile * costiAcquisto;

  let breakevenAnni = 0;
  let breakevenTrovato = false;

  for (let anno = 1; anno <= orizzonteAnni; anno++) {
    // Rent costs this year (rent grows annually)
    const affittoAnnuo = affittoMensile * 12 * Math.pow(1 + crescitaAffitto, anno - 1);
    costoAffittoCumulato += affittoAnnuo;

    // Opportunity cost: the down payment + purchase costs grow at alternative rate
    capitaleInvestito *= 1 + rendimentoAlternativo;

    // Buying costs this year
    const rateMutuoAnnue = anno <= durataMutuo ? rataMutuo * 12 : 0;
    const speseCondominialiAnnue = speseCondominiali * 12;
    const manutenzione = manutenzioneAnnua > 0 ? manutenzioneAnnua : valoreImmobileCorrente * 0.01;
    costoAcquistoCumulato += rateMutuoAnnue + speseCondominialiAnnue + imu + manutenzione;

    // Property appreciation
    valoreImmobileCorrente = valoreImmobile * Math.pow(1 + crescitaValore, anno);

    // Net cost comparison:
    // Renting: what you spent - what you'd have if you invested the down payment
    const nettoAffitto = costoAffittoCumulato - (capitaleInvestito - (anticipoAcquisto + valoreImmobile * costiAcquisto));
    // Buying: what you spent - current property value
    const nettoAcquisto = costoAcquistoCumulato - valoreImmobileCorrente;

    evoluzione.push({
      anno,
      costoAffitto: nettoAffitto,
      costoAcquisto: nettoAcquisto,
      valoreImmobile: valoreImmobileCorrente,
    });

    if (!breakevenTrovato && nettoAcquisto < nettoAffitto) {
      breakevenAnni = anno;
      breakevenTrovato = true;
    }
  }

  const ultimo = evoluzione[evoluzione.length - 1];
  const costoTotaleAffitto = ultimo?.costoAffitto ?? 0;
  const costoTotaleAcquisto = ultimo?.costoAcquisto ?? 0;
  const risparmiAcquisto = costoTotaleAffitto - costoTotaleAcquisto;

  if (!breakevenTrovato) {
    breakevenAnni = 0; // never breaks even
  }

  return {
    costoTotaleAffitto,
    costoTotaleAcquisto,
    risparmiAcquisto,
    breakevenAnni,
    evoluzione,
  };
}

// ─── Budget 50/30/20 ─────────────────────────────────────────────

export interface InputBudget {
  nettoMensile: number;
  speseNecessarie: number;
  spesePersonali: number;
  risparmio: number;
}

export interface RisultatoBudget {
  regola50: number;
  regola30: number;
  regola20: number;
  scostamento50: number;
  scostamento30: number;
  scostamento20: number;
  percentualeNecessarie: number;
  percentualePersonali: number;
  percentualeRisparmio: number;
  salute: 'ottima' | 'buona' | 'attenzione' | 'critica';
}

/**
 * Calculate budget health based on the 50/30/20 rule.
 *
 * The 50/30/20 rule (Elizabeth Warren, "All Your Worth"):
 * - 50% of net income → necessities (rent, utilities, groceries, transport)
 * - 30% of net income → wants (dining out, entertainment, clothing)
 * - 20% of net income → savings (emergency fund, investments, pension)
 *
 * Scostamento: actual minus target. Negative = under budget (good for
 * necessities/wants), positive = over budget.
 */
export function calcolaBudget(input: InputBudget): RisultatoBudget {
  const { nettoMensile, speseNecessarie, spesePersonali, risparmio } = input;

  const regola50 = nettoMensile * 0.5;
  const regola30 = nettoMensile * 0.3;
  const regola20 = nettoMensile * 0.2;

  const scostamento50 = speseNecessarie - regola50;
  const scostamento30 = spesePersonali - regola30;
  const scostamento20 = risparmio - regola20;

  const percentualeNecessarie = nettoMensile > 0 ? speseNecessarie / nettoMensile : 0;
  const percentualePersonali = nettoMensile > 0 ? spesePersonali / nettoMensile : 0;
  const percentualeRisparmio = nettoMensile > 0 ? risparmio / nettoMensile : 0;

  // Health assessment
  let salute: RisultatoBudget['salute'];
  const totaleSpeso = speseNecessarie + spesePersonali + risparmio;
  const budgetBilanciato = Math.abs(totaleSpeso - nettoMensile) < nettoMensile * 0.05;

  if (
    budgetBilanciato &&
    percentualeRisparmio >= 0.20 &&
    percentualeNecessarie <= 0.55
  ) {
    salute = 'ottima';
  } else if (percentualeRisparmio >= 0.15 && percentualeNecessarie <= 0.60) {
    salute = 'buona';
  } else if (percentualeRisparmio >= 0.05 && percentualeNecessarie <= 0.70) {
    salute = 'attenzione';
  } else {
    salute = 'critica';
  }

  return {
    regola50,
    regola30,
    regola20,
    scostamento50,
    scostamento30,
    scostamento20,
    percentualeNecessarie,
    percentualePersonali,
    percentualeRisparmio,
    salute,
  };
}
