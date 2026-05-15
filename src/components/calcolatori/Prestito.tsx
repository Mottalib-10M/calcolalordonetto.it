import { useState, useMemo } from 'react';
import CampoInput from '../ui/CampoInput';
import { calcolaPrestito } from '../../lib/finanz-engine';
import { formatCurrency, formatPercent } from '../../lib/format-it';

export default function Prestito() {
  const [importo, setImporto] = useState(10_000);
  const [tanPercent, setTanPercent] = useState(7);
  const [durataMesi, setDurataMesi] = useState(60);
  const [speseIstruttoria, setSpeseIstruttoria] = useState(0);

  const risultato = useMemo(
    () =>
      calcolaPrestito({
        importo,
        tassoAnnuo: tanPercent / 100,
        durataMesi,
        speseIstruttoria,
      }),
    [importo, tanPercent, durataMesi, speseIstruttoria],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* ── Left column: Inputs ── */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            Parametri del prestito
          </h2>

          <div className="space-y-4">
            <CampoInput
              label="Importo del prestito"
              value={importo}
              onChange={setImporto}
              min={500}
              max={100_000}
              step={500}
              prefix="€"
            />

            <CampoInput
              label="TAN (Tasso Annuo Nominale)"
              value={tanPercent}
              onChange={setTanPercent}
              min={0}
              max={30}
              step={0.1}
              suffix="%"
            />

            <CampoInput
              label="Durata in mesi"
              value={durataMesi}
              onChange={(v) => setDurataMesi(Math.round(v))}
              min={6}
              max={120}
              step={1}
              suffix="mesi"
            />

            <CampoInput
              label="Spese di istruttoria"
              value={speseIstruttoria}
              onChange={setSpeseIstruttoria}
              min={0}
              max={10_000}
              step={50}
              prefix="€"
              helpText="Costi una tantum addebitati dalla banca all'apertura del prestito"
            />
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
        </div>

        {/* TAEG card */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Costo effettivo del prestito
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">TAN</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatPercent(tanPercent / 100)}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Tasso nominale
              </p>
            </div>
            <div className="rounded-xl bg-brand/5 dark:bg-brand/10 p-4 ring-1 ring-brand/20">
              <p className="text-xs text-gray-500 dark:text-gray-400">TAEG</p>
              <p className="text-xl font-bold text-brand">
                {formatPercent(risultato.taeg)}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Tasso effettivo globale
              </p>
            </div>
          </div>

          {risultato.taeg > tanPercent / 100 + 0.001 && (
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Il TAEG e superiore al TAN perche include le spese di istruttoria
              distribuite sulla durata del prestito.
            </p>
          )}
        </div>

        {/* Riepilogo dettagliato */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Riepilogo dettagliato
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Importo richiesto</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{formatCurrency(importo)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Spese di istruttoria</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{formatCurrency(speseIstruttoria)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Numero rate</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{durataMesi}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Rata mensile</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{formatCurrency(risultato.rataMensile)}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
              <dt className="text-gray-500 dark:text-gray-400">Totale interessi</dt>
              <dd className="font-medium text-amber-600 dark:text-amber-400">{formatCurrency(risultato.totaleInteressi)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-900 dark:text-white">Totale da rimborsare</dt>
              <dd className="font-bold text-gray-900 dark:text-white">{formatCurrency(risultato.totalePagato)}</dd>
            </div>
          </dl>
        </div>

        {/* Percentage bar */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            <div
              className="bg-brand transition-all duration-500"
              style={{ width: `${(importo / risultato.totalePagato) * 100}%` }}
            />
            <div
              className="bg-amber-400 dark:bg-amber-500 transition-all duration-500"
              style={{ width: `${(risultato.totaleInteressi / risultato.totalePagato) * 100}%` }}
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
    </div>
  );
}
