import { useState, useMemo, useEffect, useRef } from 'react';
import type { Lang } from '../../i18n/types';
import { t } from '../../i18n/index';
import CampoInput from '../ui/CampoInput';
import BarraScomposizione from '../ui/BarraScomposizione';
import { calcolaBuonuscita } from '../../lib/irpef-engine';
import { formatCurrency, formatRate } from '../../lib/format-it';
import { formatCurrency as formatCurrencyLocale, formatPercent as formatPercentLocale } from '../../lib/format';

export default function Buonuscita({ lang = 'it' }: { lang?: Lang }) {
  const [importoLordo, setImportoLordo] = useState(20_000);
  const [anniServizio, setAnniServizio] = useState(5);
  const [ralUltimoAnno, setRalUltimoAnno] = useState(35_000);
  const isInitialMount = useRef(true);

  // URL state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const imp = params.get('importo');
    if (imp) setImportoLordo(parseInt(imp, 10) || 20_000);
    const anni = params.get('anni');
    if (anni) setAnniServizio(parseInt(anni, 10) || 5);
    const ral = params.get('ral');
    if (ral) setRalUltimoAnno(parseInt(ral, 10) || 35_000);
    if (window.location.search) window.history.replaceState({}, '', window.location.pathname);
    setTimeout(() => { isInitialMount.current = false; }, 0);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isInitialMount.current) return;
    const url = new URL(window.location.href);
    url.searchParams.set('importo', String(importoLordo));
    url.searchParams.set('anni', String(anniServizio));
    url.searchParams.set('ral', String(ralUltimoAnno));
    window.history.replaceState({}, '', url.toString());
  }, [importoLordo, anniServizio, ralUltimoAnno]);

  const risultato = useMemo(() => {
    if (importoLordo <= 0) return null;

    return calcolaBuonuscita({
      importoLordo,
      anniServizio,
      tipoTassazione: 'separata',
      ralUltimoAnno,
    });
  }, [importoLordo, anniServizio, ralUltimoAnno]);

  const risparmio = useMemo(() => {
    if (!risultato) return 0;
    return Math.round((risultato.nettoTassazioneSeparata - risultato.nettoTassazioneOrdinaria) * 100) / 100;
  }, [risultato]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Inserisci i tuoi dati
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <CampoInput
            lang={lang}
            label="Importo lordo incentivo"
            value={importoLordo}
            onChange={setImportoLordo}
            min={0}
            max={500_000}
            suffix="&euro;"
            helpText="L'importo lordo della buonuscita offerta"
          />
          <CampoInput
            lang={lang}
            label="Anni di servizio"
            value={anniServizio}
            onChange={(v) => setAnniServizio(Math.max(1, Math.round(v)))}
            min={1}
            max={50}
            helpText="Anni lavorati presso l'azienda"
          />
          <CampoInput
            lang={lang}
            label="RAL ultimo anno"
            value={ralUltimoAnno}
            onChange={setRalUltimoAnno}
            min={0}
            max={300_000}
            suffix="&euro;"
            helpText="Serve per calcolare l'aliquota media"
          />
        </div>
      </div>

      {/* Results Section */}
      {risultato && (
        <>
          {/* Hero Result */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Netto con tassazione separata (piu' conveniente)
            </p>
            <p className="text-4xl sm:text-5xl font-bold text-brand tracking-tight leading-tight">
              {formatCurrency(risultato.nettoTassazioneSeparata)}
            </p>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
              Importo lordo: {formatCurrency(risultato.importoLordo)}
              <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
              Aliquota media: {formatRate(risultato.aliquotaTassazioneSeparata)}
            </p>
            {risparmio > 0 && (
              <div className="mt-4">
                <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-sm font-semibold text-green-700 dark:text-green-400">
                  Risparmio vs tassazione ordinaria: {formatCurrency(risparmio)}
                </span>
              </div>
            )}
          </div>

          {/* Side by side comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tassazione Separata */}
            <div className="rounded-2xl border-2 border-green-300 dark:border-green-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
                  Consigliata
                </span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tassazione separata
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Importo lordo</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(risultato.importoLordo)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Aliquota media IRPEF</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatRate(risultato.aliquotaTassazioneSeparata)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Imposta</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">- {formatCurrency(risultato.impostaTassazioneSeparata)}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-green-50 dark:bg-green-900/20 -mx-6 px-6 rounded-lg">
                  <span className="font-semibold text-gray-900 dark:text-white">Netto</span>
                  <span className="text-xl font-bold text-brand">{formatCurrency(risultato.nettoTassazioneSeparata)}</span>
                </div>
              </div>
            </div>

            {/* Tassazione Ordinaria */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Tassazione ordinaria
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Importo lordo</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(risultato.importoLordo)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Aliquota marginale IRPEF</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatRate(risultato.aliquotaTassazioneOrdinaria)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Imposta</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">- {formatCurrency(risultato.impostaTassazioneOrdinaria)}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-gray-50 dark:bg-gray-800 -mx-6 px-6 rounded-lg">
                  <span className="font-semibold text-gray-900 dark:text-white">Netto</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(risultato.nettoTassazioneOrdinaria)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Breakdown — Tassazione Separata */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Composizione con tassazione separata
            </h3>
            <BarraScomposizione
              lang={lang}
              total={risultato.importoLordo}
              items={[
                { label: 'Netto', value: risultato.nettoTassazioneSeparata, color: '#22c55e' },
                { label: 'Imposta', value: risultato.impostaTassazioneSeparata, color: '#E63946' },
              ]}
            />
          </div>

          {/* Info Box */}
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-5">
            <div className="flex gap-3">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                  Tassazione separata vs ordinaria
                </p>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                  La tassazione separata (art. 17 TUIR) applica l'aliquota media degli ultimi anni ed
                  e' quasi sempre piu' conveniente. L'Agenzia delle Entrate puo' successivamente
                  riliquidare l'imposta applicando l'aliquota media effettiva degli ultimi 2 anni.
                  Il calcolo qui presentato e' una stima basata sulla RAL dell'ultimo anno.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
