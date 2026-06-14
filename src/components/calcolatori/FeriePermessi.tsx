import { useState, useMemo, useEffect, useRef } from 'react';
import type { Lang } from '../../i18n/types';
import { t } from '../../i18n/index';
import CampoInput from '../ui/CampoInput';
import SelettoreMensilita from '../ui/SelettoreMensilita';
import BarraScomposizione from '../ui/BarraScomposizione';
import { calcolaFeriePermessi } from '../../lib/irpef-engine';
import { formatCurrency, formatNumber, formatPercent } from '../../lib/format-it';
import { formatCurrency as formatCurrencyLocale, formatPercent as formatPercentLocale } from '../../lib/format';

export default function FeriePermessi({ lang = 'it' }: { lang?: Lang }) {
  const [ral, setRal] = useState(30_000);
  const [giorniFerie, setGiorniFerie] = useState(10);
  const [orePermessi, setOrePermessi] = useState(16);
  const [oreSettimanali, setOreSettimanali] = useState(40);
  const [mensilita, setMensilita] = useState<12 | 13 | 14>(13);
  const isInitialMount = useRef(true);

  // URL state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const r = params.get('ral');
    if (r) setRal(parseInt(r, 10) || 30_000);
    const gf = params.get('ferie');
    if (gf) setGiorniFerie(parseInt(gf, 10) || 10);
    const op = params.get('permessi');
    if (op) setOrePermessi(parseInt(op, 10) || 16);
    const os = params.get('ore');
    if (os) setOreSettimanali(parseInt(os, 10) || 40);
    const m = params.get('mensilita');
    if (m && [12, 13, 14].includes(Number(m))) setMensilita(Number(m) as 12 | 13 | 14);
    if (window.location.search) window.history.replaceState({}, '', window.location.pathname);
    setTimeout(() => { isInitialMount.current = false; }, 0);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isInitialMount.current) return;
    const url = new URL(window.location.href);
    url.searchParams.set('ral', String(ral));
    if (giorniFerie !== 10) url.searchParams.set('ferie', String(giorniFerie));
    else url.searchParams.delete('ferie');
    if (orePermessi !== 16) url.searchParams.set('permessi', String(orePermessi));
    else url.searchParams.delete('permessi');
    if (oreSettimanali !== 40) url.searchParams.set('ore', String(oreSettimanali));
    else url.searchParams.delete('ore');
    if (mensilita !== 13) url.searchParams.set('mensilita', String(mensilita));
    else url.searchParams.delete('mensilita');
    window.history.replaceState({}, '', url.toString());
  }, [ral, giorniFerie, orePermessi, oreSettimanali, mensilita]);

  const risultato = useMemo(() => {
    if (ral <= 0) return null;

    return calcolaFeriePermessi({
      ral,
      giorniFerieNonGodute: giorniFerie,
      orePermessiNonGoduti: orePermessi,
      mensilita,
      oreSettimanali,
    });
  }, [ral, giorniFerie, orePermessi, mensilita, oreSettimanali]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Inserisci i tuoi dati
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CampoInput
            lang={lang}
            label="RAL (Retribuzione Annua Lorda)"
            value={ral}
            onChange={setRal}
            min={0}
            max={300_000}
            suffix="€"
            helpText="Il tuo stipendio lordo annuale"
          />
          <CampoInput
            lang={lang}
            label="Giorni ferie non godute"
            value={giorniFerie}
            onChange={(v) => setGiorniFerie(Math.max(0, Math.round(v)))}
            min={0}
            max={60}
            helpText="Giorni lavorativi di ferie residue"
          />
          <CampoInput
            lang={lang}
            label="Ore permessi non goduti"
            value={orePermessi}
            onChange={(v) => setOrePermessi(Math.max(0, Math.round(v)))}
            min={0}
            max={200}
            suffix="h"
            helpText="Ore di ROL/ex festivita' residue"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <CampoInput
            lang={lang}
            label="Ore settimanali"
            value={oreSettimanali}
            onChange={(v) => setOreSettimanali(Math.max(1, Math.round(v)))}
            min={1}
            max={48}
            helpText="Default: 40 ore (full-time)"
          />
          <SelettoreMensilita lang={lang} value={mensilita} onChange={setMensilita} />
        </div>
      </div>

      {/* Results */}
      {risultato && (
        <>
          {/* Hero Result */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Importo lordo totale
              </p>
              <p className="text-3xl sm:text-4xl font-bold text-brand tracking-tight leading-tight">
                {formatCurrency(risultato.lordoTotale)}
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Ferie: {formatCurrency(risultato.lordoFerie)} + Permessi: {formatCurrency(risultato.lordoPermessi)}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Netto stimato in busta
              </p>
              <p className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400 tracking-tight leading-tight">
                {formatCurrency(risultato.nettoStimato)}
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Al netto di INPS e IRPEF (stima)
              </p>
            </div>
          </div>

          {/* Rate Reference */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Retribuzione giornaliera</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(risultato.retribuzioneGiornaliera)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">RAL / {mensilita} / 26</p>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Retribuzione oraria</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(risultato.retribuzioneOraria)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Giornaliera / {formatNumber(oreSettimanali / 5)} ore</p>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Lordo ferie</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(risultato.lordoFerie)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{giorniFerie} giorni</p>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Lordo permessi</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(risultato.lordoPermessi)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{orePermessi} ore</p>
            </div>
          </div>

          {/* Breakdown Bar */}
          {risultato.lordoTotale > 0 && (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Composizione dell'importo lordo
              </h3>
              <BarraScomposizione
                lang={lang}
                total={risultato.lordoTotale}
                items={[
                  { label: 'Netto stimato', value: risultato.nettoStimato, color: '#22c55e' },
                  { label: 'INPS (9,19%)', value: risultato.inpsDipendente, color: '#E63946' },
                  { label: 'IRPEF stimata', value: risultato.irpefStimata, color: '#f59e0b' },
                ]}
              />
            </div>
          )}

          {/* Detail Table */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Calcolo dettagliato
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-gray-900 dark:text-white font-medium">Indennita' ferie non godute</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCurrency(risultato.retribuzioneGiornaliera)} x {giorniFerie} giorni
                  </p>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(risultato.lordoFerie)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-gray-900 dark:text-white font-medium">Indennita' permessi non goduti</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCurrency(risultato.retribuzioneOraria)} x {orePermessi} ore
                  </p>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(risultato.lordoPermessi)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 font-medium">
                <span className="text-gray-900 dark:text-white">Totale lordo</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(risultato.lordoTotale)}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Contributi INPS dipendente (9,19%)</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCurrency(risultato.lordoTotale)} x 9,19%
                  </p>
                </div>
                <span className="font-semibold text-red-600 dark:text-red-400">- {formatCurrency(risultato.inpsDipendente)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">IRPEF stimata (aliquota marginale)</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tassazione ordinaria sull'imponibile
                  </p>
                </div>
                <span className="font-semibold text-red-600 dark:text-red-400">- {formatCurrency(risultato.irpefStimata)}</span>
              </div>

              <div className="flex justify-between items-center py-4 bg-green-50 dark:bg-green-900/20 -mx-6 px-6 rounded-lg mt-2">
                <span className="font-bold text-gray-900 dark:text-white">Netto stimato in busta</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(risultato.nettoStimato)}</span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5">
            <div className="flex gap-3">
              <svg className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Nota importante sulla tassazione
                </p>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                  L'indennita' per ferie e permessi non goduti e' soggetta a <strong>tassazione ordinaria</strong> (non
                  separata), come stabilito dall'art. 51 del TUIR. Viene quindi cumulata con il reddito del mese in
                  cui viene erogata, e l'IRPEF viene calcolata sulla base dell'aliquota marginale del lavoratore.
                  L'importo netto effettivo puo' variare in base al conguaglio fiscale di fine anno.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
