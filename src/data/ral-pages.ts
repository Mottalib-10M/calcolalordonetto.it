/** RAL amounts for programmatic SEO pages */
import { formatCurrency, formatRate } from '../lib/format-it';
import type { RisultatoStipendio } from '../lib/irpef-engine';

export const ALL_RALS = [
  15_000, 18_000, 20_000, 22_000,
  25_000, 27_000, 28_000, 30_000, 32_000, 35_000, 38_000,
  40_000, 42_000, 45_000, 50_000, 55_000,
  60_000, 65_000, 70_000, 80_000, 90_000, 100_000, 120_000, 150_000,
];

export interface AdjacentLink {
  ral: number;
  slug: string;
  anchor: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface RegionRow {
  nome: string;
  codice: string;
  nettoMensile: number;
  addizionaleRegionale: number;
  differenza: number;
}

export function ralToSlug(ral: number): string {
  return `${ral}-euro-netto`;
}

export function formatRalLabel(ral: number): string {
  return ral.toLocaleString('it-IT');
}

export function getRangeKey(ral: number): string {
  if (ral <= 22_000) return 'low';
  if (ral <= 32_000) return 'lower-middle';
  if (ral <= 45_000) return 'middle';
  if (ral <= 70_000) return 'upper-middle';
  return 'high';
}

export function getAdjacentLinks(ral: number): AdjacentLink[] {
  const idx = ALL_RALS.indexOf(ral);
  const indices: number[] = [];

  // Pick up to 3 before and 3 after
  for (let i = Math.max(0, idx - 3); i < idx; i++) indices.push(i);
  for (let i = idx + 1; i <= Math.min(ALL_RALS.length - 1, idx + 3); i++) indices.push(i);

  const anchors = [
    'Scopri quanto si guadagna con',
    'Quanto resta netto con',
    'Calcolo stipendio netto per',
    'Vedi il dettaglio di',
    'Netto mensile per',
    'Analisi completa della',
  ];

  return indices.map((i, j) => ({
    ral: ALL_RALS[i],
    slug: ralToSlug(ALL_RALS[i]),
    anchor: `${anchors[j % anchors.length]} RAL ${formatRalLabel(ALL_RALS[i])} €`,
  }));
}

export function buildFaqs(ral: number, result: RisultatoStipendio, best: RegionRow, worst: RegionRow): FaqItem[] {
  const ralF = formatRalLabel(ral);
  const nettoF = formatCurrency(result.nettoMensile);
  const rangeKey = getRangeKey(ral);

  const faqs: FaqItem[] = [
    {
      question: `Quanto si guadagna netto al mese con una RAL di ${ralF} euro?`,
      answer: `Con una RAL di ${ralF} euro e 13 mensilita, lo stipendio netto mensile e di circa ${nettoF} per un lavoratore single residente in Lombardia. L'importo varia in base alla regione di residenza, alla situazione familiare e all'aliquota comunale.`,
    },
    {
      question: `Qual e la regione dove si guadagna di piu con RAL ${ralF} euro?`,
      answer: `Con una RAL di ${ralF} euro, la regione dove il netto mensile e piu alto e ${best.nome} (${formatCurrency(best.nettoMensile)}), grazie ad addizionali regionali piu basse. La regione meno conveniente e ${worst.nome} (${formatCurrency(worst.nettoMensile)}), con una differenza di ${formatCurrency(best.nettoMensile - worst.nettoMensile)} al mese.`,
    },
    {
      question: `Quante tasse si pagano su ${ralF} euro di RAL?`,
      answer: `Su una RAL di ${ralF} euro si paga circa il ${formatRate(result.aliquotaMedia)} di tasse complessive (INPS + IRPEF + addizionali). L'aliquota marginale IRPEF e del ${formatRate(result.aliquotaMarginale)}. Il netto annuo e di circa ${formatCurrency(result.nettoAnnuo)}.`,
    },
  ];

  if (rangeKey === 'low') {
    faqs.push({
      question: `Con RAL ${ralF} euro si ha diritto al trattamento integrativo?`,
      answer: `Si, con una RAL di ${ralF} euro il lavoratore ha generalmente diritto al trattamento integrativo (ex bonus Renzi) di 1.200 euro annui (100 euro al mese), che viene erogato direttamente in busta paga dal datore di lavoro. Questo bonus e previsto per redditi fino a 15.000 euro e, in forma ridotta, fino a 28.000 euro.`,
    });
    faqs.push({
      question: `Come verificare che la busta paga sia corretta con RAL ${ralF} euro?`,
      answer: `Controlla che l'imponibile INPS corrisponda alla RAL, che i contributi siano calcolati al 9,19%, che il trattamento integrativo sia applicato, e che le detrazioni per lavoro dipendente siano presenti. Con stipendi bassi gli errori sono piu frequenti e l'impatto percentuale e maggiore.`,
    });
  } else if (rangeKey === 'lower-middle') {
    faqs.push({
      question: `Con RAL ${ralF} euro come funziona il cuneo fiscale?`,
      answer: `Per redditi tra 20.001 e 32.000 euro, il cuneo fiscale prevede una detrazione aggiuntiva di 1.000 euro annui. Tra 32.001 e 40.000 euro la detrazione si riduce progressivamente fino ad azzerarsi. Questo beneficio si aggiunge alle normali detrazioni per lavoro dipendente.`,
    });
  } else if (rangeKey === 'middle') {
    faqs.push({
      question: `Conviene un fondo pensione con RAL ${ralF} euro?`,
      answer: `Si, con una RAL di ${ralF} euro i contributi al fondo pensione sono deducibili fino a 5.164,57 euro annui. Con un'aliquota marginale del ${formatRate(result.aliquotaMarginale)}, ogni 1.000 euro versati riducono le tasse di circa ${formatCurrency(1000 * result.aliquotaMarginale)}. E una delle strategie di ottimizzazione fiscale piu efficaci a questo livello di reddito.`,
    });
    faqs.push({
      question: `In quale scaglione IRPEF cade una RAL di ${ralF} euro?`,
      answer: `Con una RAL di ${ralF} euro, al netto dei contributi INPS, l'imponibile fiscale ricade principalmente nel secondo scaglione IRPEF (23% fino a 28.000 euro e 33% da 28.001 a 50.000 euro). L'aliquota marginale effettiva e del ${formatRate(result.aliquotaMarginale)}.`,
    });
  } else if (rangeKey === 'upper-middle') {
    faqs.push({
      question: `A ${ralF} euro di RAL si paga il 43% di tasse?`,
      answer: `Non su tutto lo stipendio. Con una RAL di ${ralF} euro, l'aliquota del 43% si applica solo alla parte di imponibile che supera i 50.000 euro. Le prime fasce sono tassate al 23% e al 33%. L'aliquota media effettiva e del ${formatRate(result.aliquotaMedia)}, sensibilmente inferiore al 43%.`,
    });
  } else {
    faqs.push({
      question: `Come funziona il regime impatriati con RAL ${ralF} euro?`,
      answer: `Il regime impatriati prevede un'esenzione del 50% del reddito imponibile per lavoratori che trasferiscono la residenza fiscale in Italia. Con una RAL di ${ralF} euro, il risparmio fiscale annuo puo superare i ${formatCurrency(ral * 0.15)} grazie alla tassazione ridotta. Il regime e disponibile per 5 anni, estendibili in alcuni casi.`,
    });
    faqs.push({
      question: `Esiste un tetto contributivo INPS per RAL ${ralF} euro?`,
      answer: `Si, per il 2026 il massimale contributivo INPS e di circa 119.650 euro. Oltre questa soglia non si versano ulteriori contributi previdenziali INPS. Con una RAL di ${ralF} euro, ${ral > 119_650 ? 'la parte eccedente non e soggetta a contributi INPS dipendente' : 'l\'intera RAL e soggetta a contributi INPS'}.`,
    });
  }

  return faqs;
}
