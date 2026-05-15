import { useState, useMemo, useEffect } from 'react';
import CampoInput from '../ui/CampoInput';
import BarraScomposizione from '../ui/BarraScomposizione';
import { calcolaForfettario } from '../../lib/irpef-engine';
import { formatCurrency, formatRate, formatNumber } from '../../lib/format-it';

const COEFFICIENTI = [
  { label: 'IT, consulenza, ingegneria (86%)', value: 0.86, codice: '62, 63, 69, 70, 71, 73, 74' },
  { label: 'Professionisti (78%)', value: 0.78, codice: '69, 71, 74, 75, 85, 86' },
  { label: 'Commercio all\'ingrosso e dettaglio (40%)', value: 0.40, codice: '45, 46, 47' },
  { label: 'Commercio ambulante alimentari (40%)', value: 0.40, codice: '47.81, 47.82, 47.89' },
  { label: 'Commercio ambulante non alimentari (54%)', value: 0.54, codice: '47.82, 47.89' },
  { label: 'Costruzioni e immobiliare (86%)', value: 0.86, codice: '41, 42, 43, 68' },
  { label: 'Intermediari del commercio (62%)', value: 0.62, codice: '46.1' },
  { label: 'Alloggio e ristorazione (40%)', value: 0.40, codice: '55, 56' },
  { label: 'Attivita dei servizi (67%)', value: 0.67, codice: '64-66, 77, 78, 79, 80, 81, 82' },
  { label: 'Industrie alimentari e bevande (40%)', value: 0.40, codice: '10, 11' },
];

export default function Forfettari() {
  const [ricavi, setRicavi] = useState(40_000);
  const [coefficienteIndex, setCoefficienteIndex] = useState(0);
  const [primiCinqueAnni, setPrimiCinqueAnni] = useState(false);

  // URL state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const r = params.get('ricavi');
    if (r) setRicavi(parseInt(r, 10) || 40_000);
    const c = params.get('coeff');
    if (c) {
      const idx = COEFFICIENTI.findIndex((x) => x.value === parseFloat(c));
      if (idx >= 0) setCoefficienteIndex(idx);
    }
    if (params.get('startup') === '1') setPrimiCinqueAnni(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('ricavi', String(ricavi));
    url.searchParams.set('coeff', String(COEFFICIENTI[coefficienteIndex].value));
    if (primiCinqueAnni) url.searchParams.set('startup', '1');
    else url.searchParams.delete('startup');
    window.history.replaceState({}, '', url.toString());
  }, [ricavi, coefficienteIndex, primiCinqueAnni]);

  const coefficiente = COEFFICIENTI[coefficienteIndex];

  const risultato = useMemo(() => {
    if (ricavi <= 0) return null;

    return calcolaForfettario({
      ricavi,
      coefficienteRedditivita: coefficiente.value,
      primiCinqueAnni,
    });
  }, [ricavi, coefficiente.value, primiCinqueAnni]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Inserisci i tuoi dati
        </h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <CampoInput
              label="Fatturato annuo (ricavi)"
              value={ricavi}
              onChange={setRicavi}
              min={0}
              max={85_000}
              suffix="€"
              helpText="Limite massimo: 85.000 € per il regime forfettario"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Primi 5 anni di attivita?
              </label>
              <button
                type="button"
                onClick={() => setPrimiCinqueAnni(!primiCinqueAnni)}
                className={[
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2',
                  primiCinqueAnni ? 'bg-brand' : 'bg-gray-200 dark:bg-gray-700',
                ].join(' ')}
                role="switch"
                aria-checked={primiCinqueAnni}
              >
                <span
                  className={[
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    primiCinqueAnni ? 'translate-x-5' : 'translate-x-0',
                  ].join(' ')}
                />
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {primiCinqueAnni ? 'Aliquota agevolata 5%' : 'Aliquota ordinaria 15%'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Coefficiente di redditivita (codice ATECO)
            </label>
            <div className="relative">
              <select
                value={coefficienteIndex}
                onChange={(e) => setCoefficienteIndex(Number(e.target.value))}
                className={[
                  'w-full appearance-none rounded-lg border bg-white dark:bg-gray-900 py-2.5 pl-3 pr-10',
                  'text-base font-medium outline-none transition-colors',
                  'text-gray-900 dark:text-gray-100',
                  'border-gray-300 dark:border-gray-600',
                  'hover:border-gray-400 dark:hover:border-gray-500',
                  'focus:border-brand focus:ring-2 focus:ring-brand/20',
                ].join(' ')}
              >
                {COEFFICIENTI.map((c, i) => (
                  <option key={i} value={i}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Codici ATECO: {coefficiente.codice}
            </p>
          </div>
        </div>
      </div>

      {ricavi > 85_000 && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-5">
          <div className="flex gap-3">
            <svg className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-400">
              Attenzione: il limite di fatturato per il regime forfettario e' di <strong>85.000 €</strong> annui.
              Con ricavi superiori perdi il diritto al regime forfettario.
            </p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {risultato && (
        <>
          {/* Hero Result */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Netto annuo stimato
            </p>
            <p className="text-4xl sm:text-5xl font-bold text-brand tracking-tight leading-tight">
              {formatCurrency(risultato.nettoAnnuo)}
            </p>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
              {formatCurrency(risultato.nettoMensile)}/mese
              <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
              Tassazione effettiva: {formatRate(risultato.percentualeTassazione)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-brand/10 dark:bg-brand/20 px-3 py-1 text-sm font-semibold text-brand">
                Imposta sostitutiva: {primiCinqueAnni ? '5%' : '15%'}
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-sm font-semibold text-blue-700 dark:text-blue-400">
                Redditivita: {formatRate(coefficiente.value)}
              </span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Dettaglio calcolo
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Fatturato annuo</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(risultato.ricavi)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">
                  Reddito imponibile ({formatRate(coefficiente.value)})
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(risultato.redditoImponibile)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Contributi INPS gestione separata (26,07%)</span>
                <span className="font-semibold text-red-600 dark:text-red-400">- {formatCurrency(risultato.contributiINPS)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">
                  Imposta sostitutiva ({primiCinqueAnni ? '5%' : '15%'})
                </span>
                <span className="font-semibold text-red-600 dark:text-red-400">- {formatCurrency(risultato.impostaSostitutiva)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-green-50 dark:bg-green-900/20 -mx-6 px-6 rounded-lg">
                <span className="font-semibold text-gray-900 dark:text-white">Netto annuo</span>
                <span className="text-xl font-bold text-brand">{formatCurrency(risultato.nettoAnnuo)}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600 dark:text-gray-400">Netto mensile (/ 12)</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(risultato.nettoMensile)}</span>
              </div>
            </div>
          </div>

          {/* Visual Breakdown */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Composizione del fatturato
            </h3>
            <BarraScomposizione
              total={risultato.ricavi}
              items={[
                { label: 'Netto', value: risultato.nettoAnnuo, color: '#22c55e' },
                { label: 'INPS', value: risultato.contributiINPS, color: '#3b82f6' },
                { label: 'Imposta sostitutiva', value: risultato.impostaSostitutiva, color: '#E63946' },
              ]}
            />
          </div>
        </>
      )}

      {/* Info Box */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-5">
        <div className="flex gap-3">
          <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              Il netto indicato non include le spese deducibili
            </p>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              Nel regime forfettario non puoi dedurre le spese effettive (affitto, attrezzature, ecc.),
              perche la deduzione e' gia forfettizzata nel coefficiente di redditivita.
              Il netto reale dipendera dalle tue spese vive non deducibili.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
