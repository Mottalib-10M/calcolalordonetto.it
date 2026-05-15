/**
 * Italian social security (INPS) contribution rates for 2026.
 *
 * Sources: INPS circolari; rates are the standard full-time private-sector
 * figures published for the fiscal year 2026.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AliquotaINPS {
  codice: string;
  nome: string;
  aliquotaDipendente: number; // employee share
  aliquotaDatore: number; // employer share
  aliquotaTotale: number;
}

export interface GestioneSeparata {
  codice: string;
  nome: string;
  /** 26.07 % – professionisti senza altra copertura previdenziale */
  aliquota: number;
  /** 24 % – con iscrizione ad altra gestione previdenziale */
  aliquotaConCassa: number;
}

// ---------------------------------------------------------------------------
// Standard private sector  (FPLD – Fondo Pensioni Lavoratori Dipendenti)
// ---------------------------------------------------------------------------

export const INPS_STANDARD: AliquotaINPS = {
  codice: 'FPLD',
  nome: 'Fondo Pensioni Lavoratori Dipendenti',
  aliquotaDipendente: 0.0919, // 9.19 %
  aliquotaDatore: 0.2381, // 23.81 %
  aliquotaTotale: 0.33, // 33 %
};

// ---------------------------------------------------------------------------
// Apprenticeship  (Apprendistato)
// ---------------------------------------------------------------------------

export const INPS_APPRENDISTATO: AliquotaINPS = {
  codice: 'APPR',
  nome: 'Apprendistato',
  aliquotaDipendente: 0.0584, // 5.84 %
  aliquotaDatore: 0.1161, // 11.61 %
  aliquotaTotale: 0.1745, // 17.45 %
};

// ---------------------------------------------------------------------------
// Self-employed  (Gestione Separata) – Partita IVA
// ---------------------------------------------------------------------------

export const INPS_GESTIONE_SEPARATA: GestioneSeparata = {
  codice: 'GS',
  nome: 'Gestione Separata INPS',
  aliquota: 0.2607, // 26.07 % (professionisti senza altra copertura)
  aliquotaConCassa: 0.24, // 24.00 % (con iscrizione ad altra gestione)
};

// ---------------------------------------------------------------------------
// Annual ceiling for workers first enrolled after 01-01-1996
// (massimale contributivo – art. 2, c. 18, L 335/1995)
// ---------------------------------------------------------------------------

export const MASSIMALE_CONTRIBUTIVO_2026 = 120_607;

// ---------------------------------------------------------------------------
// TFR accrual rate  (Trattamento di Fine Rapporto)
// Approximately RAL / 13.5 ≈ 6.91 %
// ---------------------------------------------------------------------------

export const TFR_RATE = 0.0691;

// ---------------------------------------------------------------------------
// Calculation helper
// ---------------------------------------------------------------------------

export interface ContributiINPS {
  dipendente: number;
  datore: number;
  totale: number;
}

/**
 * Calcola i contributi INPS annuali a partire dalla RAL.
 *
 * @param ralAnnuale  Retribuzione Annua Lorda
 * @param tipo        Tipo di contratto (`'standard'` | `'apprendistato'`)
 * @returns           Contributi a carico del dipendente, del datore e totale
 */
export function calcolaContributiINPS(
  ralAnnuale: number,
  tipo: 'standard' | 'apprendistato' = 'standard',
): ContributiINPS {
  const aliquota =
    tipo === 'apprendistato' ? INPS_APPRENDISTATO : INPS_STANDARD;

  const dipendente = Math.round(ralAnnuale * aliquota.aliquotaDipendente * 100) / 100;
  const datore = Math.round(ralAnnuale * aliquota.aliquotaDatore * 100) / 100;
  const totale = Math.round(ralAnnuale * aliquota.aliquotaTotale * 100) / 100;

  return { dipendente, datore, totale };
}
