/**
 * Test del motore RAL → netto 2026 (RECETTE §17.4: i casi verificati diventano test).
 *
 * Fonti (testi vigenti nel 2026, letti su normattiva.it il 2026-10-31):
 * - L. 30 dicembre 2024, n. 207, art. 1, c. 4–6: somma che "non concorre alla formazione
 *   del reddito" (≤ 20.000 €) e ulteriore detrazione 1.000 € (20.000–40.000 €)
 * - TUIR art. 13, c. 1 e 1.1: detrazione lavoro dipendente e maggiorazione di 65 €
 *   (reddito complessivo oltre 25.000 e fino a 35.000 €)
 * - TUIR art. 11 come modificato da L. 30 dicembre 2025, n. 199, art. 1, c. 3: 23/33/43 %
 * - D.L. 3/2020, art. 1, c. 1: trattamento integrativo (capienza: imposta lorda > detrazione − 75 €)
 * - Art. 3-ter D.L. 384/1992: contributo aggiuntivo 1 % oltre la prima fascia pensionabile
 *   (56.224 € nel 2026, circolare INPS n. 6/2026 come riportata da ecnews.it)
 * Casi RAL dall'audit di Sami del 2026-10-28 (Lombardia, comune non scelto, 13 mensilità),
 * ricalcolati a mano qui sotto.
 */
import { describe, it, expect } from 'vitest';
import {
  calcolaStipendio,
  calcolaCuneoFiscale,
  calcolaDetrazioneLavoroDipendente,
  calcolaContributiINPS,
  calcolaTrattamentoIntegrativo,
} from './irpef-engine';

describe('Cuneo fiscale (L. 207/2024, art. 1, c. 4–6)', () => {
  it('la somma esente non riduce l\'imponibile IRPEF ed è aggiunta al netto', () => {
    // RAL 20.000: imponibile 20.000 − 9,19 % = 18.162; IRPEF lorda 23 % × 18.162 = 4.177,26
    const r = calcolaStipendio({ ral: 20_000, regione: 'LOM' });
    expect(r.imponibileFiscale).toBe(18_162);
    expect(r.irpefLorda).toBeCloseTo(4_177.26, 2);
    expect(r.cuneoFiscaleSommaEsente).toBeCloseTo(871.78, 2); // 4,8 % × 18.162
    // netto = RAL − INPS − IRPEF netta − addizionali + somma esente
    const atteso = 20_000 - r.contributiINPS - r.irpefNetta - r.totaleAddizionali + 871.776;
    expect(r.nettoAnnuo).toBeCloseTo(atteso, 1);
  });

  it('percentuali per fascia di reddito di lavoro dipendente', () => {
    expect(calcolaCuneoFiscale(8_500).sommaEsente).toBeCloseTo(603.5, 2); // 7,1 %
    expect(calcolaCuneoFiscale(8_501).sommaEsente).toBeCloseTo(450.55, 2); // 5,3 %
    expect(calcolaCuneoFiscale(15_000).sommaEsente).toBeCloseTo(795, 2); // 5,3 %
    expect(calcolaCuneoFiscale(15_001).sommaEsente).toBeCloseTo(720.05, 2); // 4,8 %
    expect(calcolaCuneoFiscale(20_000)).toEqual({ sommaEsente: 960, detrazione: 0 });
  });

  it('ulteriore detrazione 1.000 € fino a 32.000 €, poi decrescente fino a 40.000 €', () => {
    expect(calcolaCuneoFiscale(20_001)).toEqual({ sommaEsente: 0, detrazione: 1_000 });
    expect(calcolaCuneoFiscale(32_000).detrazione).toBe(1_000);
    expect(calcolaCuneoFiscale(36_000).detrazione).toBe(500);
    expect(calcolaCuneoFiscale(40_000).detrazione).toBe(0);
    expect(calcolaCuneoFiscale(40_001)).toEqual({ sommaEsente: 0, detrazione: 0 });
    // rapportata al periodo di lavoro
    expect(calcolaCuneoFiscale(25_000, 182.5).detrazione).toBe(500);
  });
});

describe('Detrazione lavoro dipendente (TUIR art. 13, c. 1 e 1.1)', () => {
  it('maggiorazione di 65 € solo oltre 25.000 e fino a 35.000 €', () => {
    expect(calcolaDetrazioneLavoroDipendente(25_000)).toBeCloseTo(1_910 + 1_190 * 3_000 / 13_000, 2);
    expect(calcolaDetrazioneLavoroDipendente(25_001)).toBeCloseTo(1_910 + 1_190 * 2_999 / 13_000 + 65, 2);
    expect(calcolaDetrazioneLavoroDipendente(30_000)).toBeCloseTo(1_910 * 20_000 / 22_000 + 65, 2);
    expect(calcolaDetrazioneLavoroDipendente(35_000)).toBeCloseTo(1_910 * 15_000 / 22_000 + 65, 2);
    expect(calcolaDetrazioneLavoroDipendente(35_001)).toBeCloseTo(1_910 * 14_999 / 22_000, 2);
  });
});

describe('Trattamento integrativo (D.L. 3/2020, art. 1, c. 1)', () => {
  it('fino a 15.000 €: spetta solo se l\'imposta lorda supera la detrazione ridotta di 75 €', () => {
    expect(calcolaTrattamentoIntegrativo(8_172.9, 1_879.77, 1_955, 1_955)).toBe(0); // 1.879,77 < 1.880
    expect(calcolaTrattamentoIntegrativo(8_200, 1_886, 1_955, 1_955)).toBe(1_200);
  });
});

describe('Contributi INPS (art. 3-ter D.L. 384/1992)', () => {
  it('1 % aggiuntivo oltre la prima fascia pensionabile (56.224 € nel 2026)', () => {
    expect(calcolaContributiINPS(56_224)).toBeCloseTo(56_224 * 0.0919, 2);
    expect(calcolaContributiINPS(60_000)).toBeCloseTo(60_000 * 0.0919 + 3_776 * 0.01, 2);
    // massimale 2026: 122.295 €
    expect(calcolaContributiINPS(200_000)).toBeCloseTo(122_295 * 0.0919 + (122_295 - 56_224) * 0.01, 2);
  });
});

describe('Casi dell\'audit del 2026-10-28 (Lombardia, 13 mensilità)', () => {
  it.each([
    // RAL, netto mensile atteso, calcolo
    [12_000, 915.55], // somma esente 5,3 % × 10.897,20 = 577,55 + trattamento integrativo 1.200
    [20_000, 1_329.79], // IRPEF lorda 4.177,26, somma esente 871,78 aggiunta al netto
    [30_000, 1_801.96], // IRPEF netta 3.221,60 (con +65 €)
    [40_000, 2_150.79], // invariato
  ] as const)('RAL %i € → %f €/mese', (ral, netto) => {
    expect(calcolaStipendio({ ral, regione: 'LOM' }).nettoMensile).toBeCloseTo(netto, 2);
  });

  it('RAL 30.000 €: IRPEF netta 3.221,60 €', () => {
    expect(calcolaStipendio({ ral: 30_000, regione: 'LOM' }).irpefNetta).toBeCloseTo(3_221.6, 2);
  });
});
