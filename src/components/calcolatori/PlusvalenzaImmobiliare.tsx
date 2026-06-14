import { useState, useMemo } from 'react';
import CampoInput from '../ui/CampoInput';
import { calcolaPlusvalenzaImmobiliare } from '../../lib/finanz-engine';
import { formatCurrency, formatPercent } from '../../lib/format-it';
import type { Lang } from '../../i18n/types';

/** IRPEF 2026 marginal rates for the dropdown */
const ALIQUOTE_IRPEF = [
  { label: '23% (reddito fino a 28.000 €)', value: 0.23 },
  { label: '33% (reddito 28.001 - 50.000 €)', value: 0.33 },
  { label: '43% (reddito oltre 50.000 €)', value: 0.43 },
];

export default function PlusvalenzaImmobiliare({ lang = 'it' }: { lang?: Lang }) {
  const [prezzoVendita, setPrezzoVendita] = useState(280_000);
  const [prezzoAcquisto, setPrezzoAcquisto] = useState(200_000);
  const [costiAcquisto, setCostiAcquisto] = useState(15_000);
  const [costiRistrutturazione, setCostiRistrutturazione] = useState(10_000);
  const [anniPossesso, setAnniPossesso] = useState(3);
  const [aliquotaIdx, setAliquotaIdx] = useState(1);

  const aliquotaIRPEF = ALIQUOTE_IRPEF[aliquotaIdx].value;

  const risultato = useMemo(
    () =>
      calcolaPlusvalenzaImmobiliare({
        prezzoVendita,
        prezzoAcquisto,
        costiAcquisto,
        costiRistrutturazione,
        anniPossesso,
        tipoTassazione: 'sostitutiva',
        aliquotaIRPEFMarginale: aliquotaIRPEF,
      }),
    [prezzoVendita, prezzoAcquisto, costiAcquisto, costiRistrutturazione, anniPossesso, aliquotaIRPEF],
  );

  const convieneSostitutiva = risultato.risparmioSostitutiva > 0;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* ── Left column: Inputs ── */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            Dati della compravendita
          </h2>

          <div className="space-y-4">
            <CampoInput
              lang={lang}
              label="Prezzo di vendita"
              value={prezzoVendita}
              onChange={setPrezzoVendita}
              min={0}
              max={10_000_000}
              step={1000}
              prefix="€"
            />

            <CampoInput
              lang={lang}
              label="Prezzo di acquisto originale"
              value={prezzoAcquisto}
              onChange={setPrezzoAcquisto}
              min={0}
              max={10_000_000}
              step={1000}
              prefix="€"
            />

            <CampoInput
              lang={lang}
              label="Costi di acquisto documentati"
              value={costiAcquisto}
              onChange={setCostiAcquisto}
              min={0}
              max={500_000}
              step={500}
              prefix="€"
              helpText="Notaio, agenzia, imposte di registro, IVA"
            />

            <CampoInput
              lang={lang}
              label="Costi di ristrutturazione documentati"
              value={costiRistrutturazione}
              onChange={setCostiRistrutturazione}
              min={0}
              max={1_000_000}
              step={500}
              prefix="€"
              helpText="Solo interventi con fattura e pagamento tracciabile"
            />

            <CampoInput
              lang={lang}
              label="Anni di possesso"
              value={anniPossesso}
              onChange={(v) => setAnniPossesso(Math.round(v))}
              min={0}
              max={50}
              step={1}
              suffix="anni"
            />

            {/* Aliquota IRPEF marginale dropdown */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="aliquota-irpef"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Aliquota IRPEF marginale
              </label>
              <select
                id="aliquota-irpef"
                value={aliquotaIdx}
                onChange={(e) => setAliquotaIdx(Number(e.target.value))}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2.5 px-3 text-sm font-medium text-gray-900 dark:text-gray-100 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                {ALIQUOTE_IRPEF.map((a, i) => (
                  <option key={a.value} value={i}>
                    {a.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Per confrontare la tassazione ordinaria con l'imposta sostitutiva
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right column: Results ── */}
      <div className="space-y-6">
        {/* Esenzione per 5 anni */}
        {risultato.esentePer5Anni && (
          <div className="rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-5">
            <div className="flex gap-3">
              <svg className="h-5 w-5 shrink-0 text-green-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-green-800 dark:text-green-300 text-sm">
                  Plusvalenza ESENTE da imposte
                </p>
                <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                  Hai posseduto l'immobile per piu' di 5 anni ({anniPossesso} anni).
                  La plusvalenza e' completamente esente da imposte ai sensi dell'art. 67,
                  comma 1, lett. b) del TUIR. Non devi pagare nessuna imposta sulla vendita.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plusvalenza prominente */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Plusvalenza imponibile
          </p>
          <p className="text-4xl sm:text-5xl font-bold text-brand tracking-tight leading-tight">
            {formatCurrency(risultato.plusvalenza)}
          </p>

          {risultato.plusvalenza === 0 && !risultato.esentePer5Anni && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Nessuna plusvalenza: il prezzo di vendita non supera il costo complessivo di acquisto.
            </p>
          )}

          {!risultato.esentePer5Anni && risultato.plusvalenza > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-5">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Imposta sostitutiva (26%)</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(risultato.impostaSostitutiva)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tassazione ordinaria ({formatPercent(aliquotaIRPEF)})</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(risultato.impostaOrdinaria)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Confronto sostitutiva vs ordinaria */}
        {!risultato.esentePer5Anni && risultato.plusvalenza > 0 && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Confronto opzioni di tassazione
            </h3>
            <div className="space-y-3">
              {/* Opzione sostitutiva */}
              <div className={[
                'rounded-xl border p-4',
                convieneSostitutiva
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800',
              ].join(' ')}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Imposta sostitutiva 26%
                  </span>
                  {convieneSostitutiva && (
                    <span className="text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full">
                      Piu' conveniente
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Imposta da pagare</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(risultato.impostaSostitutiva)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600 dark:text-gray-400">Netto dopo imposte</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(risultato.nettoDopoImpostaSostitutiva)}</span>
                </div>
              </div>

              {/* Opzione ordinaria */}
              <div className={[
                'rounded-xl border p-4',
                !convieneSostitutiva
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800',
              ].join(' ')}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Tassazione ordinaria IRPEF ({formatPercent(aliquotaIRPEF)})
                  </span>
                  {!convieneSostitutiva && (
                    <span className="text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full">
                      Piu' conveniente
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Imposta da pagare</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(risultato.impostaOrdinaria)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600 dark:text-gray-400">Netto dopo imposte</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(risultato.nettoDopoImpostaOrdinaria)}</span>
                </div>
              </div>

              {/* Differenza */}
              {risultato.risparmioSostitutiva !== 0 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Scegliendo l'opzione {convieneSostitutiva ? 'sostitutiva' : 'ordinaria'} risparmi
                  </p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(Math.abs(risultato.risparmioSostitutiva))}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Riepilogo dettagliato */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Dettaglio calcolo plusvalenza
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Prezzo di vendita</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(prezzoVendita)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Prezzo di acquisto</span>
              <span className="font-medium text-gray-900 dark:text-white">- {formatCurrency(prezzoAcquisto)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Costi di acquisto documentati</span>
              <span className="font-medium text-gray-900 dark:text-white">- {formatCurrency(costiAcquisto)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Costi di ristrutturazione documentati</span>
              <span className="font-medium text-gray-900 dark:text-white">- {formatCurrency(costiRistrutturazione)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
              <span className="font-semibold text-gray-900 dark:text-white">Plusvalenza</span>
              <span className="font-bold text-brand">{formatCurrency(risultato.plusvalenza)}</span>
            </div>
            {risultato.esentePer5Anni && (
              <div className="flex justify-between">
                <span className="text-green-600 dark:text-green-400 font-medium">Esente (possesso &gt; 5 anni)</span>
                <span className="font-semibold text-green-600 dark:text-green-400">0,00 €</span>
              </div>
            )}
          </div>
        </div>

        {/* Warning: prima casa */}
        {!risultato.esentePer5Anni && anniPossesso <= 5 && (
          <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-5">
            <div className="flex gap-3">
              <svg className="h-5 w-5 shrink-0 text-blue-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-blue-800 dark:text-blue-300 text-sm">
                  Esenzione per abitazione principale
                </p>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                  Se l'immobile e' stato adibito ad abitazione principale per la maggior parte
                  del periodo di possesso, la plusvalenza e' esente anche entro i 5 anni.
                  Questa esenzione si applica automaticamente se hai avuto la residenza
                  nell'immobile per oltre la meta' del tempo di possesso. Il calcolatore mostra
                  lo scenario peggiore (senza esenzione prima casa).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
