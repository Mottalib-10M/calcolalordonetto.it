import { useState, useMemo } from 'react';
import CampoInput from '../ui/CampoInput';
import { calcolaPAC } from '../../lib/finanz-engine';
import { formatCurrency, formatPercent } from '../../lib/format-it';

export default function PianoAccumulo() {
  const [versamentoMensile, setVersamentoMensile] = useState(200);
  const [rendimentoPercent, setRendimentoPercent] = useState(7);
  const [durataAnni, setDurataAnni] = useState(20);
  const [capitaleIniziale, setCapitaleIniziale] = useState(0);
  const [costoIngressoPercent, setCostoIngressoPercent] = useState(0);
  const [costoGestionePercent, setCostoGestionePercent] = useState(0.5);
  const [tabellaAperta, setTabellaAperta] = useState(false);

  const risultato = useMemo(
    () =>
      calcolaPAC({
        versamentoMensile,
        tassoAnnuoAtteso: rendimentoPercent / 100,
        durataAnni,
        capitaleIniziale,
        costoIngressoPercent: costoIngressoPercent / 100,
        costoGestioneAnnuoPercent: costoGestionePercent / 100,
      }),
    [versamentoMensile, rendimentoPercent, durataAnni, capitaleIniziale, costoIngressoPercent, costoGestionePercent],
  );

  const capitaleNettoFinale = risultato.totaleVersato + risultato.rendimentoNetto;

  // Max value for chart scaling
  const maxCapitale = useMemo(
    () => Math.max(...risultato.evoluzione.map((e) => e.capitale), 1),
    [risultato],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* ── Left column: Inputs ── */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            Parametri del PAC
          </h2>

          <div className="space-y-4">
            <CampoInput
              label="Versamento mensile"
              value={versamentoMensile}
              onChange={setVersamentoMensile}
              min={10}
              max={50_000}
              step={50}
              prefix="€"
            />

            <CampoInput
              label="Rendimento annuo atteso"
              value={rendimentoPercent}
              onChange={setRendimentoPercent}
              min={0}
              max={30}
              step={0.1}
              suffix="%"
              helpText="Rendimento medio annuo lordo atteso dall'investimento"
            />

            <CampoInput
              label="Durata in anni"
              value={durataAnni}
              onChange={(v) => setDurataAnni(Math.round(v))}
              min={1}
              max={50}
              step={1}
              suffix="anni"
            />

            <CampoInput
              label="Capitale iniziale"
              value={capitaleIniziale}
              onChange={setCapitaleIniziale}
              min={0}
              max={5_000_000}
              step={1000}
              prefix="€"
              helpText="Eventuale somma iniziale gia investita"
            />

            <CampoInput
              label="Costo di ingresso"
              value={costoIngressoPercent}
              onChange={setCostoIngressoPercent}
              min={0}
              max={10}
              step={0.1}
              suffix="%"
              helpText="Commissione trattenuta su ogni versamento"
            />

            <CampoInput
              label="Costo di gestione annuo"
              value={costoGestionePercent}
              onChange={setCostoGestionePercent}
              min={0}
              max={5}
              step={0.1}
              suffix="%"
              helpText="TER (Total Expense Ratio) annuo del fondo"
            />
          </div>
        </div>
      </div>

      {/* ── Right column: Results ── */}
      <div className="space-y-6">
        {/* Capitale finale prominente */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Capitale finale lordo
          </p>
          <p className="text-4xl sm:text-5xl font-bold text-brand tracking-tight leading-tight">
            {formatCurrency(risultato.capitaleFinale)}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-5">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Totale versato</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(risultato.totaleVersato)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Rendimento lordo</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(risultato.rendimentoLordo)}
              </p>
            </div>
          </div>
        </div>

        {/* Dettaglio fiscale */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Dettaglio fiscale
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Rendimento lordo</dt>
              <dd className="font-medium text-green-600 dark:text-green-400">
                {formatCurrency(risultato.rendimentoLordo)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">
                Imposta capital gain (26%)
              </dt>
              <dd className="font-medium text-red-600 dark:text-red-400">
                -{formatCurrency(risultato.imposteCapitalGain)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
              <dt className="font-medium text-gray-900 dark:text-white">Rendimento netto</dt>
              <dd className="font-bold text-green-600 dark:text-green-400">
                {formatCurrency(risultato.rendimentoNetto)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
              <dt className="font-medium text-gray-900 dark:text-white">
                Capitale netto finale
              </dt>
              <dd className="font-bold text-brand">
                {formatCurrency(capitaleNettoFinale)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Chart: evoluzione nel tempo */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Evoluzione del capitale nel tempo
          </h3>
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {risultato.evoluzione.map((e) => {
              const versatoPct = ((e.versato / maxCapitale) * 100).toFixed(1);
              const rendPct = (((e.capitale - e.versato) / maxCapitale) * 100).toFixed(1);
              return (
                <div key={e.anno} className="flex items-center gap-2 text-xs">
                  <span className="w-10 text-right text-gray-500 dark:text-gray-400 shrink-0">
                    A{e.anno}
                  </span>
                  <div className="flex flex-1 h-4 rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <div
                      className="bg-brand transition-all duration-300"
                      style={{ width: versatoPct + '%' }}
                      title={`Versato: ${formatCurrency(e.versato)}`}
                    />
                    <div
                      className="bg-green-500 dark:bg-green-400 transition-all duration-300"
                      style={{ width: rendPct + '%' }}
                      title={`Rendimento: ${formatCurrency(e.capitale - e.versato)}`}
                    />
                  </div>
                  <span className="w-20 text-right text-gray-700 dark:text-gray-300 shrink-0">
                    {formatCurrency(e.capitale)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand" />
              Versato
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-500 dark:bg-green-400" />
              Rendimento
            </span>
          </div>
        </div>

        {/* Tabella evoluzione collapsible */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <button
            type="button"
            onClick={() => setTabellaAperta(!tabellaAperta)}
            className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 dark:text-white"
          >
            Tabella evoluzione annuale
            <svg
              className={`h-5 w-5 transition-transform ${tabellaAperta ? 'rotate-180' : ''}`}
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

          {tabellaAperta && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                    <th className="pb-2 pr-3 font-medium">Anno</th>
                    <th className="pb-2 pr-3 font-medium text-right">Versato</th>
                    <th className="pb-2 pr-3 font-medium text-right">Rendimento</th>
                    <th className="pb-2 font-medium text-right">Capitale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {risultato.evoluzione.map((e) => (
                    <tr key={e.anno} className="text-gray-700 dark:text-gray-300">
                      <td className="py-1.5 pr-3">{e.anno}</td>
                      <td className="py-1.5 pr-3 text-right">{formatCurrency(e.versato)}</td>
                      <td className="py-1.5 pr-3 text-right text-green-600 dark:text-green-400">
                        {formatCurrency(e.capitale - e.versato)}
                      </td>
                      <td className="py-1.5 text-right font-medium">{formatCurrency(e.capitale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
