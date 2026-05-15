import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import CampoInput from '../ui/CampoInput';
import BarraScomposizione from '../ui/BarraScomposizione';
import { calcolaIRPEF, aliquotaMarginale, calcolaContributiINPS, calcolaDetrazioneLavoroDipendente } from '../../lib/irpef-engine';
import { formatCurrency, formatRate } from '../../lib/format-it';

export default function Tredicesima() {
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
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set('ral', String(ral));
    if (mesiLavorati !== 12) url.searchParams.set('mesi', String(mesiLavorati));
    else url.searchParams.delete('mesi');
    window.history.replaceState({}, '', url.toString());
  }, [ral, mesiLavorati]);

  const risultato = useMemo(() => {
    if (ral <= 0) return null;

    // Tredicesima lorda = RAL/12, prorated by months worked
    const tredicesimaPiena = ral / 12;
    const tredicesimeLorda = tredicesimaPiena * (mesiLavorati / 12);

    // INPS on tredicesima (9.19%)
    const inpsTredicesima = Math.round(tredicesimeLorda * 0.0919 * 100) / 100;

    // Imponibile fiscale annuo per determinare scaglione marginale
    const inpsAnnuo = calcolaContributiINPS(ral);
    const imponibileAnnuo = ral - inpsAnnuo;

    // Imponibile della tredicesima
    const imponibileTredicesima = tredicesimeLorda - inpsTredicesima;

    // La tredicesima e' tassata all'aliquota marginale SENZA detrazione lavoro dipendente
    const aliquotaMarg = aliquotaMarginale(imponibileAnnuo);

    // Calcolo IRPEF sulla tredicesima al marginale
    const irpefTredicesima = Math.round(imponibileTredicesima * aliquotaMarg * 100) / 100;

    // Netto tredicesima
    const nettoTredicesima = Math.round((tredicesimeLorda - inpsTredicesima - irpefTredicesima) * 100) / 100;

    return {
      tredicesimeLorda: Math.round(tredicesimeLorda * 100) / 100,
      inpsTredicesima,
      imponibileTredicesima: Math.round(imponibileTredicesima * 100) / 100,
      aliquotaMarginale: aliquotaMarg,
      irpefTredicesima,
      nettoTredicesima,
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
          />
          <CampoInput
            label="Mesi lavorati nell'anno"
            value={mesiLavorati}
            onChange={useCallback((v: number) => setMesiLavorati(Math.min(12, Math.max(1, Math.round(v)))), [])}
            min={1}
            max={12}
            helpText="Per la tredicesima pro-rata (1-12)"
          />
        </div>
      </div>

      {/* Results Section */}
      {risultato && (
        <>
          {/* Hero Result */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Tredicesima netta
            </p>
            <p className="text-4xl sm:text-5xl font-bold text-brand tracking-tight leading-tight">
              {formatCurrency(risultato.nettoTredicesima)}
            </p>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
              Tredicesima lorda: {formatCurrency(risultato.tredicesimeLorda)}
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
                <span className="text-gray-600 dark:text-gray-400">Tredicesima lorda</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(risultato.tredicesimeLorda)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Contributi INPS (9,19%)</span>
                <span className="font-semibold text-red-600 dark:text-red-400">- {formatCurrency(risultato.inpsTredicesima)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Imponibile tredicesima</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(risultato.imponibileTredicesima)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">IRPEF ({formatRate(risultato.aliquotaMarginale)})</span>
                <span className="font-semibold text-red-600 dark:text-red-400">- {formatCurrency(risultato.irpefTredicesima)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-green-50 dark:bg-green-900/20 -mx-6 px-6 rounded-lg">
                <span className="font-semibold text-gray-900 dark:text-white">Tredicesima netta</span>
                <span className="text-xl font-bold text-brand">{formatCurrency(risultato.nettoTredicesima)}</span>
              </div>
            </div>
          </div>

          {/* Visual Breakdown */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Composizione della tredicesima
            </h3>
            <BarraScomposizione
              total={risultato.tredicesimeLorda}
              items={[
                { label: 'Netto', value: risultato.nettoTredicesima, color: '#22c55e' },
                { label: 'INPS', value: risultato.inpsTredicesima, color: '#3b82f6' },
                { label: 'IRPEF', value: risultato.irpefTredicesima, color: '#E63946' },
              ]}
            />
          </div>

          {/* Info Box */}
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5">
            <div className="flex gap-3">
              <svg className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Perche la tredicesima e' tassata di piu?
                </p>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                  Sulla tredicesima non si applicano le detrazioni da lavoro dipendente ne il trattamento integrativo.
                  Viene tassata all'aliquota IRPEF marginale, risultando in una tassazione effettiva piu alta rispetto allo stipendio mensile ordinario.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
