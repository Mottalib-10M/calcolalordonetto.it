import { useState, useMemo } from 'react';
import CampoInput from '../ui/CampoInput';
import { calcolaMutuo } from '../../lib/finanz-engine';
import { formatCurrency, formatNumber, formatPercent } from '../../lib/format-it';

export default function Mutuo() {
  const [importo, setImporto] = useState(200_000);
  const [tassoPercent, setTassoPercent] = useState(3.5);
  const [durataAnni, setDurataAnni] = useState(25);
  const [tipoTasso, setTipoTasso] = useState<'fisso' | 'variabile'>('fisso');
  const [pianoAperto, setPianoAperto] = useState(false);

  const risultato = useMemo(
    () =>
      calcolaMutuo({
        importo,
        tassoAnnuo: tassoPercent / 100,
        durataAnni,
        tipoTasso,
      }),
    [importo, tassoPercent, durataAnni, tipoTasso],
  );

  // Yearly summaries for the chart and table
  const annuali = useMemo(() => {
    const anni: {
      anno: number;
      quotaCapitale: number;
      quotaInteressi: number;
      debitoResiduo: number;
    }[] = [];
    const piano = risultato.pianoAmmortamento;
    const totAnni = Math.ceil(piano.length / 12);

    for (let a = 0; a < totAnni; a++) {
      const start = a * 12;
      const end = Math.min(start + 12, piano.length);
      let capAnno = 0;
      let intAnno = 0;
      for (let m = start; m < end; m++) {
        capAnno += piano[m].quotaCapitale;
        intAnno += piano[m].quotaInteressi;
      }
      anni.push({
        anno: a + 1,
        quotaCapitale: capAnno,
        quotaInteressi: intAnno,
        debitoResiduo: piano[end - 1].debitoResiduo,
      });
    }
    return anni;
  }, [risultato]);

  // Find max yearly payment for bar chart scaling
  const maxAnnuale = useMemo(
    () =>
      Math.max(
        ...annuali.map((a) => a.quotaCapitale + a.quotaInteressi),
        1,
      ),
    [annuali],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* ── Left column: Inputs ── */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            Parametri del mutuo
          </h2>

          <div className="space-y-4">
            <CampoInput
              label="Importo del prestito"
              value={importo}
              onChange={setImporto}
              min={1000}
              max={5_000_000}
              step={1000}
              prefix="€"
            />

            <CampoInput
              label="Tasso di interesse annuo"
              value={tassoPercent}
              onChange={setTassoPercent}
              min={0}
              max={30}
              step={0.1}
              suffix="%"
            />

            <CampoInput
              label="Durata in anni"
              value={durataAnni}
              onChange={(v) => setDurataAnni(Math.round(v))}
              min={1}
              max={40}
              step={1}
              suffix="anni"
            />

            {/* Tipo tasso toggle */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo di tasso
              </span>
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setTipoTasso('fisso')}
                  className={[
                    'flex-1 py-2.5 text-sm font-medium transition-colors',
                    tipoTasso === 'fisso'
                      ? 'bg-brand text-white'
                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                  ].join(' ')}
                >
                  Fisso
                </button>
                <button
                  type="button"
                  onClick={() => setTipoTasso('variabile')}
                  className={[
                    'flex-1 py-2.5 text-sm font-medium transition-colors border-l border-gray-300 dark:border-gray-600',
                    tipoTasso === 'variabile'
                      ? 'bg-brand text-white'
                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                  ].join(' ')}
                >
                  Variabile
                </button>
              </div>
              {tipoTasso === 'variabile' && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Con tasso variabile la rata potrebbe cambiare nel tempo. Il calcolo
                  mostra la rata iniziale.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right column: Results ── */}
      <div className="space-y-6">
        {/* Rata mensile prominente */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Rata mensile
          </p>
          <p className="text-4xl sm:text-5xl font-bold text-brand tracking-tight leading-tight">
            {formatCurrency(risultato.rataMensile)}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-5">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Totale interessi</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(risultato.totaleInteressi)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Totale pagato</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(risultato.totalePagato)}
              </p>
            </div>
          </div>

          {/* Percentage bar: capitale vs interessi */}
          <div className="mt-4">
            <div className="flex h-3 w-full overflow-hidden rounded-full">
              <div
                className="bg-brand transition-all duration-500"
                style={{
                  width: `${(importo / risultato.totalePagato) * 100}%`,
                }}
                title="Capitale"
              />
              <div
                className="bg-amber-400 dark:bg-amber-500 transition-all duration-500"
                style={{
                  width: `${(risultato.totaleInteressi / risultato.totalePagato) * 100}%`,
                }}
                title="Interessi"
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand" />
                Capitale: {formatPercent(importo / risultato.totalePagato)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400 dark:bg-amber-500" />
                Interessi: {formatPercent(risultato.totaleInteressi / risultato.totalePagato)}
              </span>
            </div>
          </div>
        </div>

        {/* Chart: quota capitale vs quota interessi per anno */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Evoluzione quota capitale e interessi
          </h3>
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {annuali.map((a) => {
              const capPct = ((a.quotaCapitale / maxAnnuale) * 100).toFixed(1);
              const intPct = ((a.quotaInteressi / maxAnnuale) * 100).toFixed(1);
              return (
                <div key={a.anno} className="flex items-center gap-2 text-xs">
                  <span className="w-10 text-right text-gray-500 dark:text-gray-400 shrink-0">
                    A{a.anno}
                  </span>
                  <div className="flex flex-1 h-4 rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <div
                      className="bg-brand transition-all duration-300"
                      style={{ width: capPct + '%' }}
                      title={`Capitale: ${formatCurrency(a.quotaCapitale)}`}
                    />
                    <div
                      className="bg-amber-400 dark:bg-amber-500 transition-all duration-300"
                      style={{ width: intPct + '%' }}
                      title={`Interessi: ${formatCurrency(a.quotaInteressi)}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand" />
              Quota capitale
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400 dark:bg-amber-500" />
              Quota interessi
            </span>
          </div>
        </div>

        {/* Piano di ammortamento collapsible */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <button
            type="button"
            onClick={() => setPianoAperto(!pianoAperto)}
            className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 dark:text-white"
          >
            Piano di ammortamento
            <svg
              className={`h-5 w-5 transition-transform ${pianoAperto ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {pianoAperto && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                    <th className="pb-2 pr-3 font-medium">Mese</th>
                    <th className="pb-2 pr-3 font-medium text-right">Rata</th>
                    <th className="pb-2 pr-3 font-medium text-right">Capitale</th>
                    <th className="pb-2 pr-3 font-medium text-right">Interessi</th>
                    <th className="pb-2 font-medium text-right">Debito residuo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {/* First 12 months */}
                  {risultato.pianoAmmortamento.slice(0, 12).map((r) => (
                    <tr key={r.mese} className="text-gray-700 dark:text-gray-300">
                      <td className="py-1.5 pr-3">{r.mese}</td>
                      <td className="py-1.5 pr-3 text-right">{formatCurrency(r.rata)}</td>
                      <td className="py-1.5 pr-3 text-right">{formatCurrency(r.quotaCapitale)}</td>
                      <td className="py-1.5 pr-3 text-right">{formatCurrency(r.quotaInteressi)}</td>
                      <td className="py-1.5 text-right">{formatCurrency(r.debitoResiduo)}</td>
                    </tr>
                  ))}

                  {/* Yearly summaries */}
                  {annuali.length > 1 && (
                    <>
                      <tr>
                        <td
                          colSpan={5}
                          className="py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Riepilogo annuale
                        </td>
                      </tr>
                      {annuali.map((a) => (
                        <tr
                          key={`anno-${a.anno}`}
                          className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50"
                        >
                          <td className="py-1.5 pr-3 font-medium">Anno {a.anno}</td>
                          <td className="py-1.5 pr-3 text-right">
                            {formatCurrency(a.quotaCapitale + a.quotaInteressi)}
                          </td>
                          <td className="py-1.5 pr-3 text-right">{formatCurrency(a.quotaCapitale)}</td>
                          <td className="py-1.5 pr-3 text-right">{formatCurrency(a.quotaInteressi)}</td>
                          <td className="py-1.5 text-right">{formatCurrency(a.debitoResiduo)}</td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
