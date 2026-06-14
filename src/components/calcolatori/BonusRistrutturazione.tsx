import { useState, useMemo } from 'react';
import CampoInput from '../ui/CampoInput';
import { calcolaBonusRistrutturazione } from '../../lib/finanz-engine';
import { formatCurrency, formatPercent } from '../../lib/format-it';
import type { Lang } from '../../i18n/types';

/** Bonus types with their deduction %, ceiling, and duration */
const TIPI_BONUS = [
  { id: '50_rist', label: 'Ristrutturazione edilizia 50% (prima casa)', aliquota: '50' as const, tetto: 96_000, anni: 10 },
  { id: '36_rist', label: 'Ristrutturazione edilizia 36% (altri immobili)', aliquota: '36' as const, tetto: 96_000, anni: 10 },
  { id: '50_eco', label: 'Ecobonus 50% (infissi, caldaie, schermature)', aliquota: '50' as const, tetto: 60_000, anni: 10 },
  { id: '65_eco', label: 'Ecobonus 65% (cappotto, pompa di calore)', aliquota: '65' as const, tetto: 100_000, anni: 10 },
  { id: '70_sisma', label: 'Sismabonus 70% (riduzione 1 classe rischio)', aliquota: '70' as const, tetto: 96_000, anni: 5 },
  { id: '80_sisma', label: 'Sismabonus 80% (riduzione 2 classi rischio)', aliquota: '80' as const, tetto: 96_000, anni: 5 },
  { id: '85_sisma', label: 'Sismabonus 85% (parti comuni, 2 classi)', aliquota: '85' as const, tetto: 96_000, anni: 5 },
  { id: '50_mobili', label: 'Bonus mobili 50% (con ristrutturazione)', aliquota: '50' as const, tetto: 5_000, anni: 10 },
  { id: '36_verde', label: 'Bonus verde 36% (giardini, terrazze)', aliquota: '36' as const, tetto: 5_000, anni: 10 },
];

/** Estimate gross IRPEF from RAL using 2026 brackets */
function stimaIRPEFAnnua(ral: number): number {
  const contributiINPS = ral * 0.0919;
  const imponibile = Math.max(0, ral - contributiINPS);
  let irpef = 0;
  if (imponibile <= 28_000) {
    irpef = imponibile * 0.23;
  } else if (imponibile <= 50_000) {
    irpef = 28_000 * 0.23 + (imponibile - 28_000) * 0.33;
  } else {
    irpef = 28_000 * 0.23 + 22_000 * 0.33 + (imponibile - 50_000) * 0.43;
  }
  return irpef;
}

export default function BonusRistrutturazione({ lang = 'it' }: { lang?: Lang }) {
  const [costoLavori, setCostoLavori] = useState(40_000);
  const [tipoBonusIdx, setTipoBonusIdx] = useState(0);
  const [ral, setRal] = useState(35_000);

  const tipoSelezionato = TIPI_BONUS[tipoBonusIdx];

  const irpefAnnua = useMemo(() => stimaIRPEFAnnua(ral), [ral]);

  const risultato = useMemo(
    () =>
      calcolaBonusRistrutturazione({
        costoLavori,
        tipoBonus: tipoSelezionato.aliquota,
        anniDetrazione: tipoSelezionato.anni,
        aliquotaIRPEFMarginale: irpefAnnua,
        tettoMassimo: tipoSelezionato.tetto,
      }),
    [costoLavori, tipoSelezionato, irpefAnnua],
  );

  const speseAmmesse = Math.min(costoLavori, tipoSelezionato.tetto);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* ── Left column: Inputs ── */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            Parametri del bonus
          </h2>

          <div className="space-y-4">
            {/* Tipo di bonus dropdown */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="tipo-bonus"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Tipo di bonus edilizio
              </label>
              <select
                id="tipo-bonus"
                value={tipoBonusIdx}
                onChange={(e) => setTipoBonusIdx(Number(e.target.value))}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2.5 px-3 text-sm font-medium text-gray-900 dark:text-gray-100 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                {TIPI_BONUS.map((b, i) => (
                  <option key={b.id} value={i}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            <CampoInput
              lang={lang}
              label="Costo totale dei lavori"
              value={costoLavori}
              onChange={setCostoLavori}
              min={0}
              max={1_000_000}
              step={1000}
              prefix="€"
            />

            {/* Tetto massimo (auto-filled, read-only display) */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tetto massimo di spesa
              </span>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 text-right">
                {formatCurrency(tipoSelezionato.tetto)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Detrazione in {tipoSelezionato.anni} quote annuali
              </p>
            </div>

            <CampoInput
              lang={lang}
              label="RAL (Reddito Annuo Lordo)"
              value={ral}
              onChange={setRal}
              min={0}
              max={500_000}
              step={1000}
              prefix="€"
              helpText="Serve per stimare la capienza IRPEF annua"
            />
          </div>
        </div>
      </div>

      {/* ── Right column: Results ── */}
      <div className="space-y-6">
        {/* Detrazione totale prominente */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Detrazione totale
          </p>
          <p className="text-4xl sm:text-5xl font-bold text-brand tracking-tight leading-tight">
            {formatCurrency(risultato.importoDetraibile)}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-5">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Detrazione annua</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(risultato.detrazioneAnnua)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                per {tipoSelezionato.anni} anni
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Risparmio annuo effettivo</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(risultato.risparmiAnnuoEffettivo)}
              </p>
            </div>
          </div>

          {/* Percentage bar: bonus vs costo reale */}
          <div className="mt-4">
            <div className="flex h-3 w-full overflow-hidden rounded-full">
              <div
                className="bg-green-500 dark:bg-green-400 transition-all duration-500"
                style={{
                  width: `${costoLavori > 0 ? (risultato.risparmiTotale / costoLavori) * 100 : 0}%`,
                }}
                title="Risparmio fiscale"
              />
              <div
                className="bg-brand transition-all duration-500"
                style={{
                  width: `${costoLavori > 0 ? (risultato.costoEffettivo / costoLavori) * 100 : 0}%`,
                }}
                title="Costo effettivo"
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-500 dark:bg-green-400" />
                Risparmio: {formatCurrency(risultato.risparmiTotale)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand" />
                Costo reale: {formatCurrency(Math.max(0, risultato.costoEffettivo))}
              </span>
            </div>
          </div>
        </div>

        {/* Riepilogo dettagliato */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Riepilogo dettagliato
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Costo totale lavori</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(costoLavori)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Spese ammesse (entro il tetto)</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(speseAmmesse)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Aliquota detrazione</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatPercent(risultato.percentualeDetrazione)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
              <span className="text-gray-600 dark:text-gray-400">Detrazione totale</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(risultato.importoDetraibile)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Quota annua ({tipoSelezionato.anni} anni)</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(risultato.detrazioneAnnua)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">IRPEF annua stimata</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(irpefAnnua)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
              <span className="text-gray-600 dark:text-gray-400">Risparmio totale effettivo</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(risultato.risparmiTotale)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Costo effettivo al netto del bonus</span>
              <span className="font-semibold text-brand">{formatCurrency(Math.max(0, risultato.costoEffettivo))}</span>
            </div>
          </div>
        </div>

        {/* Warning: capienza fiscale */}
        {!risultato.capienzaSufficiente && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5">
            <div className="flex gap-3">
              <svg className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                  Attenzione: capienza IRPEF insufficiente
                </p>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                  La detrazione annua ({formatCurrency(risultato.detrazioneAnnua)}) supera la tua IRPEF annua stimata
                  ({formatCurrency(irpefAnnua)}). Ogni anno perdi {formatCurrency(risultato.quotaPersa)} di
                  detrazione che non puoi recuperare negli anni successivi. La quota eccedente non e' rimborsabile
                  ne' trasferibile.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning: tetto superato */}
        {costoLavori > tipoSelezionato.tetto && (
          <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-5">
            <div className="flex gap-3">
              <svg className="h-5 w-5 shrink-0 text-blue-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-blue-800 dark:text-blue-300 text-sm">
                  Tetto massimo superato
                </p>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                  Il costo dei lavori ({formatCurrency(costoLavori)}) supera il tetto massimo
                  di {formatCurrency(tipoSelezionato.tetto)}. La detrazione si applica solo
                  fino al limite previsto dalla normativa. La parte eccedente
                  ({formatCurrency(costoLavori - tipoSelezionato.tetto)}) resta interamente a tuo carico.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Piano detrazioni annuali */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Piano delle detrazioni annuali
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                  <th className="pb-2 pr-3 font-medium">Anno</th>
                  <th className="pb-2 pr-3 font-medium text-right">Detrazione</th>
                  <th className="pb-2 pr-3 font-medium text-right">Effettivo</th>
                  <th className="pb-2 font-medium text-right">Cumulato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {Array.from({ length: tipoSelezionato.anni }, (_, i) => {
                  const anno = i + 1;
                  const effettivo = risultato.risparmiAnnuoEffettivo;
                  const cumulato = effettivo * anno;
                  return (
                    <tr key={anno} className="text-gray-700 dark:text-gray-300">
                      <td className="py-1.5 pr-3">Anno {anno}</td>
                      <td className="py-1.5 pr-3 text-right">{formatCurrency(risultato.detrazioneAnnua)}</td>
                      <td className="py-1.5 pr-3 text-right text-green-600 dark:text-green-400">
                        {formatCurrency(effettivo)}
                      </td>
                      <td className="py-1.5 text-right font-medium">{formatCurrency(cumulato)}</td>
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
