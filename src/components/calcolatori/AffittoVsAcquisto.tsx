import { useState, useMemo } from 'react';
import CampoInput from '../ui/CampoInput';
import { calcolaAffittoVsAcquisto } from '../../lib/finanz-engine';
import { formatCurrency, formatNumber } from '../../lib/format-it';
import type { Lang } from '../../i18n/types';

export default function AffittoVsAcquisto({ lang = 'it' }: { lang?: Lang }) {
  const [valoreImmobile, setValoreImmobile] = useState(250_000);
  const [anticipoAcquisto, setAnticipoAcquisto] = useState(50_000);
  const [tassoMutuoPercent, setTassoMutuoPercent] = useState(3.5);
  const [durataMutuo, setDurataMutuo] = useState(25);
  const [affittoMensile, setAffittoMensile] = useState(1_200);
  const [crescitaAffittoPercent, setCrescitaAffittoPercent] = useState(2);
  const [crescitaValorePercent, setCrescitaValorePercent] = useState(2);
  const [costiAcquistoPercent, setCostiAcquistoPercent] = useState(8);
  const [speseCondominiali, setSpeseCondominiali] = useState(150);
  const [imu, setImu] = useState(0);
  const [manutenzioneAnnua, setManutenzioneAnnua] = useState(2_500);
  const [rendimentoAlternativoPercent, setRendimentoAlternativoPercent] = useState(5);
  const [orizzonteAnni, setOrizzonteAnni] = useState(20);
  const [mostraAvanzate, setMostraAvanzate] = useState(false);

  const risultato = useMemo(
    () =>
      calcolaAffittoVsAcquisto({
        valoreImmobile,
        anticipoAcquisto,
        tassoMutuo: tassoMutuoPercent / 100,
        durataMutuo,
        affittoMensile,
        crescitaAffitto: crescitaAffittoPercent / 100,
        crescitaValore: crescitaValorePercent / 100,
        costiAcquisto: costiAcquistoPercent / 100,
        speseCondominiali,
        imu,
        manutenzioneAnnua,
        rendimentoAlternativo: rendimentoAlternativoPercent / 100,
        orizzonteAnni,
      }),
    [
      valoreImmobile, anticipoAcquisto, tassoMutuoPercent, durataMutuo,
      affittoMensile, crescitaAffittoPercent, crescitaValorePercent,
      costiAcquistoPercent, speseCondominiali, imu, manutenzioneAnnua,
      rendimentoAlternativoPercent, orizzonteAnni,
    ],
  );

  const acquistoPiuConveniente = risultato.risparmiAcquisto > 0;

  // Max value for chart
  const maxCosto = useMemo(
    () =>
      Math.max(
        ...risultato.evoluzione.map((e) => Math.max(Math.abs(e.costoAffitto), Math.abs(e.costoAcquisto))),
        1,
      ),
    [risultato],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* ── Left column: Inputs ── */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            Parametri dell'immobile
          </h2>

          <div className="space-y-4">
            <CampoInput
              lang={lang}
              label="Valore immobile"
              value={valoreImmobile}
              onChange={setValoreImmobile}
              min={30_000}
              max={5_000_000}
              step={5000}
              prefix="€"
            />

            <CampoInput
              lang={lang}
              label="Anticipo (down payment)"
              value={anticipoAcquisto}
              onChange={setAnticipoAcquisto}
              min={0}
              max={valoreImmobile}
              step={5000}
              prefix="€"
              helpText={`${formatNumber(valoreImmobile > 0 ? (anticipoAcquisto / valoreImmobile) * 100 : 0, 1)}% del valore`}
            />

            <CampoInput
              lang={lang}
              label="Tasso mutuo annuo"
              value={tassoMutuoPercent}
              onChange={setTassoMutuoPercent}
              min={0}
              max={15}
              step={0.1}
              suffix="%"
            />

            <CampoInput
              lang={lang}
              label="Durata mutuo"
              value={durataMutuo}
              onChange={(v) => setDurataMutuo(Math.round(v))}
              min={5}
              max={40}
              step={1}
              suffix="anni"
            />

            <CampoInput
              lang={lang}
              label="Affitto mensile"
              value={affittoMensile}
              onChange={setAffittoMensile}
              min={100}
              max={10_000}
              step={50}
              prefix="€"
            />

            <CampoInput
              lang={lang}
              label="Orizzonte di confronto"
              value={orizzonteAnni}
              onChange={(v) => setOrizzonteAnni(Math.round(v))}
              min={1}
              max={40}
              step={1}
              suffix="anni"
            />
          </div>
        </div>

        {/* Advanced parameters */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <button
            type="button"
            onClick={() => setMostraAvanzate(!mostraAvanzate)}
            className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 dark:text-white"
          >
            Parametri avanzati
            <svg
              className={`h-5 w-5 transition-transform ${mostraAvanzate ? 'rotate-180' : ''}`}
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

          {mostraAvanzate && (
            <div className="mt-4 space-y-4">
              <CampoInput
              lang={lang}
                label="Crescita annua affitto"
                value={crescitaAffittoPercent}
                onChange={setCrescitaAffittoPercent}
                min={0}
                max={10}
                step={0.1}
                suffix="%"
                helpText="Tasso annuo di crescita del canone d'affitto"
              />

              <CampoInput
              lang={lang}
                label="Rivalutazione annua immobile"
                value={crescitaValorePercent}
                onChange={setCrescitaValorePercent}
                min={-5}
                max={10}
                step={0.1}
                suffix="%"
                helpText="Apprezzamento annuo del valore dell'immobile"
              />

              <CampoInput
              lang={lang}
                label="Costi di acquisto"
                value={costiAcquistoPercent}
                onChange={setCostiAcquistoPercent}
                min={0}
                max={15}
                step={0.5}
                suffix="%"
                helpText="Notaio, agenzia, imposte registro/IVA (% del valore)"
              />

              <CampoInput
              lang={lang}
                label="Spese condominiali mensili"
                value={speseCondominiali}
                onChange={setSpeseCondominiali}
                min={0}
                max={2000}
                step={10}
                prefix="€"
              />

              <CampoInput
              lang={lang}
                label="IMU annuale"
                value={imu}
                onChange={setImu}
                min={0}
                max={10_000}
                step={100}
                prefix="€"
                helpText="0 per prima casa (escluse categorie di lusso)"
              />

              <CampoInput
              lang={lang}
                label="Manutenzione annua"
                value={manutenzioneAnnua}
                onChange={setManutenzioneAnnua}
                min={0}
                max={50_000}
                step={250}
                prefix="€"
                helpText="Stima delle spese di manutenzione ordinaria annue"
              />

              <CampoInput
              lang={lang}
                label="Rendimento investimento alternativo"
                value={rendimentoAlternativoPercent}
                onChange={setRendimentoAlternativoPercent}
                min={0}
                max={15}
                step={0.5}
                suffix="%"
                helpText="Rendimento atteso se l'anticipo fosse investito"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Right column: Results ── */}
      <div className="space-y-6">
        {/* Verdict */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            In {orizzonteAnni} anni conviene
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-brand tracking-tight leading-tight">
            {acquistoPiuConveniente ? 'Acquistare' : 'Affittare'}
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Risparmio netto stimato:{' '}
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(Math.abs(risultato.risparmiAcquisto))}
            </span>
          </p>

          {risultato.breakevenAnni > 0 && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Punto di pareggio (breakeven):{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                anno {risultato.breakevenAnni}
              </span>
            </p>
          )}
          {risultato.breakevenAnni === 0 && (
            <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
              L'acquisto non raggiunge il pareggio nell'orizzonte considerato
            </p>
          )}
        </div>

        {/* Side-by-side summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`rounded-2xl border p-5 ${
            !acquistoPiuConveniente
              ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
          }`}>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Costo netto affitto
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(risultato.costoTotaleAffitto)}
            </p>
          </div>
          <div className={`rounded-2xl border p-5 ${
            acquistoPiuConveniente
              ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
          }`}>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Costo netto acquisto
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(risultato.costoTotaleAcquisto)}
            </p>
          </div>
        </div>

        {/* Evolution chart */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Evoluzione costo netto nel tempo
          </h3>
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {risultato.evoluzione.map((e) => {
              const affittoPct = maxCosto > 0 ? (Math.abs(e.costoAffitto) / maxCosto) * 100 : 0;
              const acquistoPct = maxCosto > 0 ? (Math.abs(e.costoAcquisto) / maxCosto) * 100 : 0;
              return (
                <div key={e.anno} className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-10 text-right text-gray-500 dark:text-gray-400 shrink-0">
                      A{e.anno}
                    </span>
                    <div className="flex flex-1 h-3 rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <div
                        className="bg-blue-500 dark:bg-blue-400 transition-all duration-300"
                        style={{ width: `${affittoPct.toFixed(1)}%` }}
                        title={`Affitto: ${formatCurrency(e.costoAffitto)}`}
                      />
                    </div>
                    <span className="w-24 text-right text-gray-600 dark:text-gray-400 shrink-0">
                      {formatCurrency(e.costoAffitto)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-10 shrink-0" />
                    <div className="flex flex-1 h-3 rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <div
                        className="bg-brand transition-all duration-300"
                        style={{ width: `${acquistoPct.toFixed(1)}%` }}
                        title={`Acquisto: ${formatCurrency(e.costoAcquisto)}`}
                      />
                    </div>
                    <span className="w-24 text-right text-gray-600 dark:text-gray-400 shrink-0">
                      {formatCurrency(e.costoAcquisto)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500 dark:bg-blue-400" />
              Affitto
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand" />
              Acquisto
            </span>
          </div>
        </div>

        {/* Year-by-year table */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Tabella evoluzione annuale
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                  <th className="pb-2 pr-3 font-medium">Anno</th>
                  <th className="pb-2 pr-3 font-medium text-right">Costo affitto</th>
                  <th className="pb-2 pr-3 font-medium text-right">Costo acquisto</th>
                  <th className="pb-2 font-medium text-right">Valore immobile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {risultato.evoluzione.map((e) => (
                  <tr
                    key={e.anno}
                    className={
                      e.costoAcquisto < e.costoAffitto
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }
                  >
                    <td className="py-1.5 pr-3">{e.anno}</td>
                    <td className="py-1.5 pr-3 text-right">{formatCurrency(e.costoAffitto)}</td>
                    <td className="py-1.5 pr-3 text-right">{formatCurrency(e.costoAcquisto)}</td>
                    <td className="py-1.5 text-right font-medium">{formatCurrency(e.valoreImmobile)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
