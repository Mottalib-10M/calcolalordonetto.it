import { useState, useMemo, useEffect, useRef } from 'react';
import CampoInput from '../ui/CampoInput';
import { calcolaPagaOraria, calcolaStipendio } from '../../lib/irpef-engine';
import { formatCurrency, formatNumber } from '../../lib/format-it';
import { formatCurrency as formatCurrencyLocale } from '../../lib/format';
import type { Lang } from '../../i18n/types';
import { t } from '../../i18n/index';

const RAL_CONFRONTO = [20_000, 25_000, 30_000, 35_000, 40_000, 45_000, 50_000, 60_000, 70_000, 80_000];

export default function PagaOraria({ lang = 'it' }: { lang?: Lang }) {
  const [ral, setRal] = useState(30_000);
  const [oreSettimanali, setOreSettimanali] = useState(40);
  const [settimaneAnno, setSettimaneAnno] = useState(52);
  const [modalita, setModalita] = useState<'da-ral' | 'da-oraria'>('da-ral');
  const [tariffa, setTariffa] = useState(15);
  const isInitialMount = useRef(true);

  // URL state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const r = params.get('ral');
    if (r) setRal(parseInt(r, 10) || 30_000);
    const h = params.get('ore');
    if (h) setOreSettimanali(parseInt(h, 10) || 40);
    const w = params.get('settimane');
    if (w) setSettimaneAnno(parseInt(w, 10) || 52);
    if (params.get('modalita') === 'oraria') {
      setModalita('da-oraria');
      const t = params.get('tariffa');
      if (t) setTariffa(parseFloat(t) || 15);
    }
    if (window.location.search) window.history.replaceState({}, '', window.location.pathname);
    setTimeout(() => { isInitialMount.current = false; }, 0);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isInitialMount.current) return;
    const url = new URL(window.location.href);
    if (modalita === 'da-ral') {
      url.searchParams.set('ral', String(ral));
      url.searchParams.delete('modalita');
      url.searchParams.delete('tariffa');
    } else {
      url.searchParams.set('modalita', 'oraria');
      url.searchParams.set('tariffa', String(tariffa));
      url.searchParams.delete('ral');
    }
    if (oreSettimanali !== 40) url.searchParams.set('ore', String(oreSettimanali));
    else url.searchParams.delete('ore');
    if (settimaneAnno !== 52) url.searchParams.set('settimane', String(settimaneAnno));
    else url.searchParams.delete('settimane');
    window.history.replaceState({}, '', url.toString());
  }, [ral, oreSettimanali, settimaneAnno, modalita, tariffa]);

  const risultato = useMemo(() => {
    const oreAnnue = oreSettimanali * settimaneAnno;

    if (modalita === 'da-oraria') {
      // Reverse: from hourly rate to RAL
      const ralCalcolata = tariffa * oreAnnue;
      const paga = calcolaPagaOraria(ralCalcolata, oreSettimanali, settimaneAnno);
      const stipendio = calcolaStipendio({ ral: ralCalcolata, regione: 'LOM' });
      return {
        ral: ralCalcolata,
        lordoOrario: paga.lordoOrario,
        nettoOrario: paga.nettoOrario,
        oreAnnue: paga.oreAnnue,
        nettoAnnuo: stipendio.nettoAnnuo,
        nettoMensile: stipendio.nettoMensile,
      };
    }

    const paga = calcolaPagaOraria(ral, oreSettimanali, settimaneAnno);
    const stipendio = calcolaStipendio({ ral, regione: 'LOM' });
    return {
      ral,
      lordoOrario: paga.lordoOrario,
      nettoOrario: paga.nettoOrario,
      oreAnnue: paga.oreAnnue,
      nettoAnnuo: stipendio.nettoAnnuo,
      nettoMensile: stipendio.nettoMensile,
    };
  }, [ral, oreSettimanali, settimaneAnno, modalita, tariffa]);

  const tabellaConfronto = useMemo(() => {
    return RAL_CONFRONTO.map((r) => {
      const paga = calcolaPagaOraria(r, oreSettimanali, settimaneAnno);
      return {
        ral: r,
        ...paga,
      };
    });
  }, [oreSettimanali, settimaneAnno]);

  return (
    <div className="space-y-8">
      {/* Mode Selector */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Scegli la modalita di calcolo
        </h2>

        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setModalita('da-ral')}
            className={[
              'flex-1 rounded-xl border-2 p-4 text-center transition-all',
              modalita === 'da-ral'
                ? 'border-brand bg-brand/5 dark:bg-brand/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
            ].join(' ')}
          >
            <p className={[
              'text-sm font-semibold',
              modalita === 'da-ral' ? 'text-brand' : 'text-gray-900 dark:text-white',
            ].join(' ')}>
              Da RAL a paga oraria
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Inserisci la RAL per calcolare la tariffa oraria
            </p>
          </button>
          <button
            type="button"
            onClick={() => setModalita('da-oraria')}
            className={[
              'flex-1 rounded-xl border-2 p-4 text-center transition-all',
              modalita === 'da-oraria'
                ? 'border-brand bg-brand/5 dark:bg-brand/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
            ].join(' ')}
          >
            <p className={[
              'text-sm font-semibold',
              modalita === 'da-oraria' ? 'text-brand' : 'text-gray-900 dark:text-white',
            ].join(' ')}>
              Da paga oraria a RAL
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Inserisci la tariffa oraria per calcolare la RAL equivalente
            </p>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {modalita === 'da-ral' ? (
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
          ) : (
            <CampoInput
              label="Tariffa oraria lorda"
              value={tariffa}
              onChange={setTariffa}
              min={0}
              max={500}
              suffix="€/h"
              helpText="La tua paga oraria lorda"
              lang={lang}
            />
          )}
          <CampoInput
            label="Ore settimanali"
            value={oreSettimanali}
            onChange={(v) => setOreSettimanali(Math.max(1, Math.round(v)))}
            min={1}
            max={60}
            helpText="Default: 40 ore (full-time)"
            lang={lang}
          />
          <CampoInput
            label="Settimane lavorative/anno"
            value={settimaneAnno}
            onChange={(v) => setSettimaneAnno(Math.max(1, Math.round(v)))}
            min={1}
            max={52}
            helpText="Default: 52 settimane"
            lang={lang}
          />
        </div>
      </div>

      {/* Results */}
      {risultato && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Lordo orario</p>
              <p className="text-2xl font-bold text-brand">{formatCurrency(risultato.lordoOrario)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">per ora lavorata</p>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Netto orario</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(risultato.nettoOrario)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">stima (rif. Lombardia)</p>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ore annue totali</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(risultato.oreAnnue)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{oreSettimanali}h/sett x {settimaneAnno} sett</p>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">RAL equivalente</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(risultato.ral)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">netto: {formatCurrency(risultato.nettoMensile)}/mese</p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Tabella di confronto per livelli RAL
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Basata su {oreSettimanali} ore/settimana e {settimaneAnno} settimane/anno ({formatNumber(oreSettimanali * settimaneAnno)} ore totali)
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">RAL</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Lordo/ora</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Netto/ora</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white hidden sm:table-cell">Ore/anno</th>
                  </tr>
                </thead>
                <tbody>
                  {tabellaConfronto.map((riga) => {
                    const isCurrentRal = modalita === 'da-ral' && Math.abs(riga.ral - ral) < 500;
                    return (
                      <tr
                        key={riga.ral}
                        className={[
                          'border-b border-gray-100 dark:border-gray-800 transition-colors',
                          isCurrentRal ? 'bg-brand/5 dark:bg-brand/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800',
                        ].join(' ')}
                      >
                        <td className={[
                          'py-3 px-4',
                          isCurrentRal ? 'font-bold text-brand' : 'font-medium text-gray-900 dark:text-white',
                        ].join(' ')}>
                          {formatCurrency(riga.ral)}
                          {isCurrentRal && <span className="ml-2 text-xs">← tu</span>}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                          {formatCurrency(riga.lordoOrario)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(riga.nettoOrario)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                          {formatNumber(riga.oreAnnue)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
              Come si calcola la paga oraria?
            </p>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              La paga oraria lorda si ottiene dividendo la RAL per le ore lavorate nell'anno.
              Il netto orario e' una stima che tiene conto di INPS, IRPEF e addizionali (riferimento: Lombardia).
              Il valore effettivo puo variare in base alla regione, alle detrazioni e ad altri fattori.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
