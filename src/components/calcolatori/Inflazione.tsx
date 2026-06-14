import { useState, useMemo } from 'react';
import CampoInput from '../ui/CampoInput';
import { calcolaInflazione } from '../../lib/finanz-engine';
import { formatCurrency, formatPercent } from '../../lib/format-it';
import type { Lang } from '../../i18n/types';

export default function Inflazione({ lang = 'it' }: { lang?: Lang }) {
  const [importo, setImporto] = useState(1_000);
  const [tassoPercent, setTassoPercent] = useState(2);
  const [durataAnni, setDurataAnni] = useState(10);

  const risultato = useMemo(
    () =>
      calcolaInflazione({
        importo,
        tassoInflazione: tassoPercent / 100,
        durataAnni,
      }),
    [importo, tassoPercent, durataAnni],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* ── Left column: Inputs ── */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            Parametri dell'inflazione
          </h2>

          <div className="space-y-4">
            <CampoInput
              lang={lang}
              label="Importo odierno"
              value={importo}
              onChange={setImporto}
              min={1}
              max={10_000_000}
              step={100}
              prefix="€"
              helpText="Il valore in euro che vuoi proiettare nel futuro"
            />

            <CampoInput
              lang={lang}
              label="Tasso di inflazione annuo"
              value={tassoPercent}
              onChange={setTassoPercent}
              min={0}
              max={30}
              step={0.1}
              suffix="%"
              helpText="In Italia il tasso medio e intorno al 2% annuo"
            />

            <CampoInput
              lang={lang}
              label="Durata in anni"
              value={durataAnni}
              onChange={(v) => setDurataAnni(Math.round(v))}
              min={1}
              max={50}
              step={1}
              suffix="anni"
            />
          </div>
        </div>
      </div>

      {/* ── Right column: Results ── */}
      <div className="space-y-6">
        {/* Valore reale prominente */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Potere d'acquisto tra {durataAnni} anni
          </p>
          <p className="text-4xl sm:text-5xl font-bold text-brand tracking-tight leading-tight">
            {formatCurrency(risultato.valoreReale)}
          </p>

          <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
            {formatCurrency(importo)} di oggi varranno come{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(risultato.valoreReale)}
            </span>{' '}
            tra {durataAnni} anni
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-5">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Perdita potere d'acquisto</p>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                -{formatCurrency(risultato.perditaPotereAcquisto)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Percentuale perdita</p>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                -{formatPercent(risultato.percentualePerdita)}
              </p>
            </div>
          </div>
        </div>

        {/* Visual bar: valore reale vs perdita */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Composizione del valore
          </h3>
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            <div
              className="bg-brand transition-all duration-500"
              style={{ width: `${((risultato.valoreReale / importo) * 100)}%` }}
            />
            <div
              className="bg-red-400 dark:bg-red-500 transition-all duration-500"
              style={{ width: `${(risultato.percentualePerdita * 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand" />
              Potere d'acquisto residuo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-400 dark:bg-red-500" />
              Perso per inflazione
            </span>
          </div>
        </div>

        {/* Tabella evoluzione */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Evoluzione anno per anno
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                  <th className="pb-2 pr-3 font-medium">Anno</th>
                  <th className="pb-2 pr-3 font-medium text-right">Valore nominale</th>
                  <th className="pb-2 pr-3 font-medium text-right">Valore reale</th>
                  <th className="pb-2 font-medium text-right">Perdita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {risultato.evoluzione.map((e) => {
                  const perdita = e.valoreNominale - e.valoreReale;
                  return (
                    <tr key={e.anno} className="text-gray-700 dark:text-gray-300">
                      <td className="py-1.5 pr-3">{e.anno}</td>
                      <td className="py-1.5 pr-3 text-right">{formatCurrency(e.valoreNominale)}</td>
                      <td className="py-1.5 pr-3 text-right font-medium">{formatCurrency(e.valoreReale)}</td>
                      <td className="py-1.5 text-right text-red-600 dark:text-red-400">
                        -{formatCurrency(perdita)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
