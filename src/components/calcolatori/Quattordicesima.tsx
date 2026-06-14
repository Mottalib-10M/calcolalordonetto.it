import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import CampoInput from '../ui/CampoInput';
import BarraScomposizione from '../ui/BarraScomposizione';
import { calcolaIRPEF, aliquotaMarginale, calcolaContributiINPS } from '../../lib/irpef-engine';
import { formatCurrency, formatRate } from '../../lib/format-it';
import { formatCurrency as formatCurrencyLocale, formatPercent as formatPercentLocale } from '../../lib/format';
import type { Lang } from '../../i18n/types';
import { t } from '../../i18n/index';

const CCNL_CON_QUATTORDICESIMA = [
  { nome: 'Commercio (Terziario)', descrizione: 'Confcommercio, CCNL Commercio e Terziario' },
  { nome: 'Turismo', descrizione: 'Alberghi, pubblici esercizi, agenzie viaggio' },
  { nome: 'Banche e Credito', descrizione: 'ABI, credito cooperativo' },
  { nome: 'Assicurazioni', descrizione: 'ANIA' },
  { nome: 'Alimentari (Industria)', descrizione: 'Industria alimentare' },
  { nome: 'Autotrasporto e Logistica', descrizione: 'Trasporti e spedizioni' },
  { nome: 'Studi professionali', descrizione: 'Confprofessioni' },
  { nome: 'Chimico-farmaceutico', descrizione: 'Industria chimica e farmaceutica' },
];

export default function Quattordicesima({ lang = 'it' }: { lang?: Lang }) {
  const [ral, setRal] = useState(30_000);
  const [mesiLavorati, setMesiLavorati] = useState(12);
  const isInitialMount = useRef(true);

  // URL state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const r = params.get('ral');
    if (r) setRal(parseInt(r, 10) || 30_000);
    const m = params.get('mesi');
    if (m) setMesiLavorati(Math.min(12, Math.max(1, parseInt(m, 10) || 12)));
    if (window.location.search) window.history.replaceState({}, '', window.location.pathname);
    setTimeout(() => { isInitialMount.current = false; }, 0);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isInitialMount.current) return;
    const url = new URL(window.location.href);
    url.searchParams.set('ral', String(ral));
    if (mesiLavorati !== 12) url.searchParams.set('mesi', String(mesiLavorati));
    else url.searchParams.delete('mesi');
    window.history.replaceState({}, '', url.toString());
  }, [ral, mesiLavorati]);

  const risultato = useMemo(() => {
    if (ral <= 0) return null;

    // Quattordicesima lorda = RAL/12, prorated
    const quattordicesimaPiena = ral / 12;
    const quattordicesimaLorda = quattordicesimaPiena * (mesiLavorati / 12);

    // INPS on quattordicesima (9.19%)
    const inpsQuattordicesima = Math.round(quattordicesimaLorda * 0.0919 * 100) / 100;

    // Imponibile fiscale annuo per scaglione marginale
    const inpsAnnuo = calcolaContributiINPS(ral);
    const imponibileAnnuo = ral - inpsAnnuo;

    // Imponibile della quattordicesima
    const imponibileQuattordicesima = quattordicesimaLorda - inpsQuattordicesima;

    // Tassata all'aliquota marginale SENZA detrazioni
    const aliquotaMarg = aliquotaMarginale(imponibileAnnuo);
    const irpefQuattordicesima = Math.round(imponibileQuattordicesima * aliquotaMarg * 100) / 100;

    // Netto
    const nettoQuattordicesima = Math.round((quattordicesimaLorda - inpsQuattordicesima - irpefQuattordicesima) * 100) / 100;

    return {
      quattordicesimaLorda: Math.round(quattordicesimaLorda * 100) / 100,
      inpsQuattordicesima,
      imponibileQuattordicesima: Math.round(imponibileQuattordicesima * 100) / 100,
      aliquotaMarginale: aliquotaMarg,
      irpefQuattordicesima,
      nettoQuattordicesima,
    };
  }, [ral, mesiLavorati]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Inserisci i tuoi dati
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <CampoInput
            label="RAL (Retribuzione Annua Lorda)"
            value={ral}
            onChange={setRal}
            min={0}
            max={300_000}
            suffix="€"
            helpText="Il tuo stipendio lordo annuale"
            lang={lang}
          />
          <CampoInput
            label="Mesi lavorati nell'anno"
            value={mesiLavorati}
            onChange={useCallback((v: number) => setMesiLavorati(Math.min(12, Math.max(1, Math.round(v)))), [])}
            min={1}
            max={12}
            helpText="Per la quattordicesima pro-rata (1-12)"
            lang={lang}
          />
        </div>
      </div>

      {/* Results Section */}
      {risultato && (
        <>
          {/* Hero Result */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Quattordicesima netta
            </p>
            <p className="text-4xl sm:text-5xl font-bold text-brand tracking-tight leading-tight">
              {formatCurrency(risultato.nettoQuattordicesima)}
            </p>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
              Quattordicesima lorda: {formatCurrency(risultato.quattordicesimaLorda)}
              {mesiLavorati < 12 && (
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-500">
                  (pro-rata {mesiLavorati}/12 mesi)
                </span>
              )}
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center rounded-full bg-brand/10 dark:bg-brand/20 px-3 py-1 text-sm font-semibold text-brand">
                Aliquota marginale: {formatRate(risultato.aliquotaMarginale)}
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
                <span className="text-gray-600 dark:text-gray-400">Quattordicesima lorda</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(risultato.quattordicesimaLorda)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Contributi INPS (9,19%)</span>
                <span className="font-semibold text-red-600 dark:text-red-400">- {formatCurrency(risultato.inpsQuattordicesima)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Imponibile quattordicesima</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(risultato.imponibileQuattordicesima)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">IRPEF ({formatRate(risultato.aliquotaMarginale)})</span>
                <span className="font-semibold text-red-600 dark:text-red-400">- {formatCurrency(risultato.irpefQuattordicesima)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-green-50 dark:bg-green-900/20 -mx-6 px-6 rounded-lg">
                <span className="font-semibold text-gray-900 dark:text-white">Quattordicesima netta</span>
                <span className="text-xl font-bold text-brand">{formatCurrency(risultato.nettoQuattordicesima)}</span>
              </div>
            </div>
          </div>

          {/* Visual Breakdown */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Composizione della quattordicesima
            </h3>
            <BarraScomposizione
              lang={lang}
              total={risultato.quattordicesimaLorda}
              items={[
                { label: 'Netto', value: risultato.nettoQuattordicesima, color: '#22c55e' },
                { label: 'INPS', value: risultato.inpsQuattordicesima, color: '#3b82f6' },
                { label: 'IRPEF', value: risultato.irpefQuattordicesima, color: '#E63946' },
              ]}
            />
          </div>
        </>
      )}

      {/* CCNL Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Quali CCNL prevedono la quattordicesima?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          La quattordicesima non e' prevista per legge ma e' stabilita da alcuni contratti collettivi nazionali di lavoro (CCNL).
          Verifica il tuo contratto per sapere se ne hai diritto.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">CCNL</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Settore</th>
              </tr>
            </thead>
            <tbody>
              {CCNL_CON_QUATTORDICESIMA.map((ccnl) => (
                <tr key={ccnl.nome} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{ccnl.nome}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{ccnl.descrizione}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-5">
        <div className="flex gap-3">
          <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              Quando viene pagata la quattordicesima?
            </p>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              La quattordicesima viene generalmente erogata a giugno o luglio, in corrispondenza delle ferie estive.
              Come la tredicesima, viene tassata all'aliquota marginale IRPEF senza le detrazioni da lavoro dipendente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
