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
 * - L.R. Lazio 31 dicembre 2025, n. 20, art. 2, c. 2 e 3 (Regione Lazio, Addizionale-regionale-2026.pdf, e
 *   Dipartimento delle Finanze, addregirpef.php?reg=08, letti il 2026-11-02): 1,73 % su tutto il reddito fino a
 *   28.000 €; oltre, 1,73 % fino a 15.000 € e 3,33 % sul resto; detrazione di 60 € da 28.001 a 30.000 €
 * - Roma: delibera A.C. 186/2024 (Dipartimento delle Finanze, H501; Roma Capitale, INF41403, letti il 2026-11-02):
 *   0,9 %, esenzione fino a 14.000 € di imponibile, "senza che il limite ... costituisca una franchigia"
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
  calcolaAddizionaleComunale,
} from './irpef-engine';
import { calcolaAddizionaleRegionale } from '../data/regioni';
import { COMUNI, comuniBySlug } from '../data/comuni-top200';

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

describe('Addizionale regionale del Lazio 2026 (L.R. 20/2025, art. 2)', () => {
  const lazio = (imponibile: number) => calcolaAddizionaleRegionale(imponibile, 'LAZ');

  it('fino a 28.000 €: 1,73 % su tutto il reddito', () => {
    expect(lazio(15_000)).toBe(259.5); // 15.000 × 1,73 %
    expect(lazio(20_000)).toBe(346); // 20.000 × 1,73 %
    expect(lazio(28_000)).toBe(484.4); // 28.000 × 1,73 %
  });

  it('da 28.001 a 30.000 €: scaglioni meno 60 €', () => {
    expect(lazio(28_001)).toBe(632.43); // 259,50 + 13.001 × 3,33 % − 60
    expect(lazio(30_000)).toBe(699); // 259,50 + 15.000 × 3,33 % − 60
  });

  it('oltre 30.000 €: 1,73 % sui primi 15.000 €, 3,33 % sul resto, senza detrazione', () => {
    expect(lazio(30_001)).toBe(759.03); // 259,50 + 15.001 × 3,33 %
    expect(lazio(60_000)).toBe(1_758); // 259,50 + 45.000 × 3,33 %
  });

  it('reddito nullo', () => {
    expect(lazio(0)).toBe(0);
  });
});

describe('Addizionale comunale: soglia di esenzione', () => {
  it('Roma: esente fino a 14.000 €, oltre 0,9 % su tutto il reddito (non è una franchigia)', () => {
    const roma = comuniBySlug.get('roma')!;
    expect(roma.aliquota).toBe(0.009);
    expect(roma.sogliaEsenzione).toBe(14_000);
    expect(calcolaAddizionaleComunale(14_000, roma.aliquota, roma.sogliaEsenzione)).toBe(0);
    expect(calcolaAddizionaleComunale(14_001, roma.aliquota, roma.sogliaEsenzione)).toBe(126.01); // 14.001 × 0,9 %
    expect(calcolaAddizionaleComunale(20_000, roma.aliquota, roma.sogliaEsenzione)).toBe(180); // 20.000 × 0,9 %
  });

  it('senza soglia l\'aliquota si applica da subito, e nessun altro comune ha una soglia', () => {
    expect(calcolaAddizionaleComunale(10_000, 0.008)).toBe(80);
    expect(COMUNI.filter((c) => c.sogliaEsenzione !== undefined).map((c) => c.nome)).toEqual(['Roma']);
  });
});

describe('Netto a Roma (Lazio, 0,9 %, soglia 14.000 €, 13 mensilità)', () => {
  const roma = (ral: number) =>
    calcolaStipendio({ ral, regione: 'LAZ', aliquotaComunale: 0.009, sogliaEsenzioneComunale: 14_000 });

  it('RAL 15.000: sotto la soglia, addizionale comunale zero', () => {
    // INPS 1.378,50; imponibile 13.621,50; IRPEF lorda 3.132,945; detrazione 1.955; regionale 235,65;
    // comunale 0; trattamento integrativo 1.200; somma esente 5,3 % = 721,94
    const r = roma(15_000);
    expect(r.addizionaleRegionale).toBe(235.65);
    expect(r.addizionaleComunale).toBe(0);
    expect(r.nettoAnnuo).toBeCloseTo(15_000 - 1_378.5 - (3_132.945 - 1_955) - 235.65 + 1_200 + 721.94, 1);
  });

  it('RAL 26.000', () => {
    // INPS 2.389,40; imponibile 23.610,60; IRPEF lorda 5.430,44; detrazioni 1.910 + 1.190 × 4.389,40 / 13.000
    // = 2.311,80 e cuneo 1.000: IRPEF netta 2.118,64; regionale 1,73 % = 408,46; comunale 0,9 % = 212,50
    const r = roma(26_000);
    expect(r.addizionaleRegionale).toBe(408.46);
    expect(r.addizionaleComunale).toBe(212.5);
    expect(r.nettoAnnuo).toBeCloseTo(26_000 - 2_389.4 - 2_118.64 - 408.46 - 212.5, 1);
  });

  it('RAL 60.000', () => {
    // INPS 5.514 + 1 % × 3.776 = 5.551,76; imponibile 54.448,24; IRPEF 6.440 + 7.260 + 43 % × 4.448,24 = 15.612,74;
    // regionale 259,50 + 3,33 % × 39.448,24 = 1.573,13; comunale 490,03
    const r = roma(60_000);
    expect(r.addizionaleRegionale).toBe(1_573.13);
    expect(r.addizionaleComunale).toBe(490.03);
    expect(r.nettoAnnuo).toBeCloseTo(60_000 - 5_551.76 - 15_612.74 - 1_573.13 - 490.03, 1);
  });
});

describe('Fuori dal Lazio nulla cambia', () => {
  it('Lombardia: scaglioni progressivi e comunale senza soglia', () => {
    // RAL 30.000, imponibile 27.243: regionale 15.000 × 1,23 % + 12.243 × 1,58 % = 377,94
    const r = calcolaStipendio({ ral: 30_000, regione: 'LOM', aliquotaComunale: 0.008 });
    expect(r.addizionaleRegionale).toBe(377.94);
    expect(r.addizionaleComunale).toBe(217.94); // 27.243 × 0,8 %
    expect(r.nettoAnnuo).toBe(23_425.52); // stesso valore del motore prima di questa correzione
    // Sotto 14.000 € la comunale di un comune senza soglia resta dovuta
    expect(calcolaStipendio({ ral: 15_000, regione: 'LOM', aliquotaComunale: 0.008 }).addizionaleComunale).toBe(108.97);
  });

  it('Lazio fuori Roma: regionale nuova, comunale senza soglia', () => {
    const latina = comuniBySlug.get('latina')!;
    const r = calcolaStipendio({ ral: 15_000, regione: 'LAZ', aliquotaComunale: latina.aliquota });
    expect(r.addizionaleRegionale).toBe(235.65);
    expect(r.addizionaleComunale).toBe(108.97); // 13.621,50 × 0,8 %
  });
});
