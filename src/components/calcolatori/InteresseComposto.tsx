import { useState, useMemo } from 'react';
import CampoInput from '../ui/CampoInput';
import { calcolaInteresseComposto } from '../../lib/finanz-engine';
import { formatCurrency, formatPercent } from '../../lib/format-it';

const FREQUENZE: { value: 1 | 2 | 4 | 12; label: string }[] = [
  { value: 1, label: 'Annuale' },
  { value: 2, label: 'Semestrale' },
  { value: 4, label: 'Trimestrale' },
  { value: 12, label: 'Mensile' },
];

export default function InteresseComposto() {
  const [capitaleIniziale, setCapitaleIniziale] = useState(10_000);
  const [tassoPercent, setTassoPercent] = useState(5);
  const [durataAnni, setDurataAnni] = useState(20);
  const [versamentoMensile, setVersamentoMensile] = useState(200);
  const [frequenzaComposta, setFrequenzaComposta] = useState<1 | 2 | 4 | 12>(12);
  const [tabellaAperta, setTabellaAperta] = useState(false);

  const risultato = useMemo(
    () =>
      calcolaInteresseComposto({
        capitaleIniziale,
        tassoAnnuo: tassoPercent / 100,
        durataAnni,
        frequenzaComposta,
        versamentoperiodico: versamentoMensile,
        frequenzaVersamento: 12,
      }),
    [capitaleIniziale, tassoPercent, durataAnni, versamentoMensile, frequenzaComposta],
  );

  // Max value for bar chart scaling
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
            Parametri dell'investimento
          </h2>

          <div className="space-y-4">
            <CampoInput
              label="Capitale iniziale"
              value={capitaleIniziale}
              onChange={setCapitaleIniziale}
              min={0}
              max={10_000_000}
              step={1000}
              prefix="€"
            />

            <CampoInput
              label="Tasso di interesse annuo"
              value={tassoPercent}
              onChange={setTassoPercent}
              min={0}
              max={50}
              step={0.1}
              suffix="%"
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
              label="Versamento periodico mensile"
              value={versamentoMensile}
              onChange={setVersamentoMensile}
              min={0}
              max={50_000}
              step={50}
              prefix="€"
              helpText="Importo aggiuntivo versato ogni mese"
            />

            {/* Frequenza composta dropdown */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="frequenza-composta"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Frequenza di capitalizzazione
              </label>
              <select
                id="frequenza-composta"
                value={frequenzaComposta}
                onChange={(e) =>
                  setFrequenzaComposta(Number(e.target.value) as 1 | 2 | 4 | 12)
                }
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2.5 px-3 text-sm font-medium text-gray-900 dark:text-gray-100 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                {FREQUENZE.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right column: Results ── */}
      <div className="space-y-6">
        {/* Capitale finale prominente */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Capitale finale
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
              <p className="text-xs text-gray-500 dark:text-gray-400">Totale interessi</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(risultato.totaleInteressi)}
              </p>
            </div>
          </div>

          {/* Percentage bar */}
          <div className="mt-4">
            <div className="flex h-3 w-full overflow-hidden rounded-full">
              <div
                className="bg-brand transition-all duration-500"
                style={{
                  width: `${(risultato.totaleVersato / risultato.capitaleFinale) * 100}%`,
                }}
              />
              <div
                className="bg-green-500 dark:bg-green-400 transition-all duration-500"
                style={{
                  width: `${(risultato.totaleInteressi / risultato.capitaleFinale) * 100}%`,
                }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand" />
                Versato: {formatPercent(risultato.totaleVersato / risultato.capitaleFinale)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-500 dark:bg-green-400" />
                Interessi: {formatPercent(risultato.totaleInteressi / risultato.capitaleFinale)}
              </span>
            </div>
          </div>
        </div>

        {/* Chart: evoluzione nel tempo */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Evoluzione del capitale nel tempo
          </h3>
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {risultato.evoluzione.map((e) => {
              const versatoPct = ((e.versato / maxCapitale) * 100).toFixed(1);
              const interessiPct = ((e.interessi / maxCapitale) * 100).toFixed(1);
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
                      style={{ width: interessiPct + '%' }}
                      title={`Interessi: ${formatCurrency(e.interessi)}`}
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
              Interessi maturati
            </span>
          </div>
        </div>

        {/* Tabella evoluzione annuale collapsible */}
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
                    <th className="pb-2 pr-3 font-medium text-right">Totale versato</th>
                    <th className="pb-2 pr-3 font-medium text-right">Interessi maturati</th>
                    <th className="pb-2 font-medium text-right">Capitale totale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {risultato.evoluzione.map((e) => (
                    <tr key={e.anno} className="text-gray-700 dark:text-gray-300">
                      <td className="py-1.5 pr-3">{e.anno}</td>
                      <td className="py-1.5 pr-3 text-right">{formatCurrency(e.versato)}</td>
                      <td className="py-1.5 pr-3 text-right text-green-600 dark:text-green-400">
                        {formatCurrency(e.interessi)}
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
