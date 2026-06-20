import { useState, useEffect, useCallback } from 'react';
import {
  calcolaIRPEF,
  calcolaDetrazioneLavoroDipendente,
  calcolaCuneoFiscale,
  calcolaContributiINPS,
  calcolaAddizionaleComunale,
  aliquotaMarginale,
  calcolaTrattamentoIntegrativo,
} from '../../lib/irpef-engine';
import { calcolaAddizionaleRegionale } from '../../data/regioni';
import { formatCurrency, formatRate } from '../../lib/format-it';
import { formatCurrency as formatCurrencyLocale, formatPercent as formatPercentLocale } from '../../lib/format';
import { decodeState, pushState } from '../../lib/url-state';
import type { Lang } from '../../i18n/types';
import { t } from '../../i18n/index';
import CampoInput from '../ui/CampoInput';
import SelettoreRegione from '../ui/SelettoreRegione';
import BarraScomposizione from '../ui/BarraScomposizione';

export default function IRPEF({ lang = 'it' }: { lang?: Lang }) {
  const [reddito, setReddito] = useState(30_000);
  const [regione, setRegione] = useState('LOM');

  // Load from URL on mount
  useEffect(() => {
    const params = decodeState(window.location.search);
    if (params.ral) setReddito(params.ral);
    if (params.regione) setRegione(params.regione);
    if (window.location.search) window.history.replaceState({}, '', window.location.pathname);
  }, []);

  // Sync to URL
  const syncURL = useCallback(
    (r: number, reg: string) => {
      pushState({ ral: r, regione: reg });
    },
    [],
  );

  const handleRedditoChange = useCallback(
    (val: number) => {
      setReddito(val);
      syncURL(val, regione);
    },
    [regione, syncURL],
  );

  const handleRegioneChange = useCallback(
    (val: string) => {
      setRegione(val);
      syncURL(reddito, val);
    },
    [reddito, syncURL],
  );

  // --- Calculations ---
  const contributiINPS = calcolaContributiINPS(reddito);
  const imponibileFiscale = reddito - contributiINPS;
  const cuneo = calcolaCuneoFiscale(imponibileFiscale);
  const imponibilePerIRPEF = imponibileFiscale - cuneo.sommaEsente;

  const { irpefLorda, dettaglioScaglioni } = calcolaIRPEF(imponibilePerIRPEF);
  const detrazioneLavDip = calcolaDetrazioneLavoroDipendente(imponibileFiscale);

  const totalDetrazioni = detrazioneLavDip + cuneo.detrazione;
  const irpefNetta = Math.max(0, irpefLorda - totalDetrazioni);

  const addRegionale = regione
    ? calcolaAddizionaleRegionale(imponibileFiscale, regione)
    : 0;
  const addComunale = calcolaAddizionaleComunale(imponibileFiscale);

  const trattamentoIntegrativo = calcolaTrattamentoIntegrativo(
    imponibileFiscale,
    irpefLorda,
    detrazioneLavDip,
  );

  const totaleImposte =
    irpefNetta + addRegionale + addComunale - trattamentoIntegrativo;

  const aliquotaMedia = reddito > 0 ? totaleImposte / reddito : 0;
  const aliquotaMarg = aliquotaMarginale(imponibilePerIRPEF);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          Calcolo IRPEF {new Date().getFullYear()}
        </h2>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Inserisci il tuo reddito complessivo annuo per calcolare l'IRPEF
          dovuta con il dettaglio scaglione per scaglione.
        </p>
      </div>

      {/* Input section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <CampoInput
          label="Reddito complessivo annuo"
          value={reddito}
          onChange={handleRedditoChange}
          min={0}
          max={500_000}
          step={500}
          suffix="€"
          helpText="Reddito lordo annuo (RAL o reddito complessivo)"
          lang={lang}
        />
        <SelettoreRegione value={regione} onChange={handleRegioneChange} lang={lang} />
      </div>

      {/* Results */}
      {reddito > 0 && (
        <div className="space-y-8">
          {/* IRPEF breakdown table */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Dettaglio IRPEF per scaglione
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Scaglione
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                      Aliquota
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                      Imponibile
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                      Imposta
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {dettaglioScaglioni.map((s, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-3 text-gray-700 dark:text-gray-300">
                        {s.scaglione}
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-gray-900 dark:text-gray-100">
                        {formatRate(s.aliquota)}
                      </td>
                      <td className="px-6 py-3 text-right text-gray-700 dark:text-gray-300">
                        {formatCurrency(s.imponibileInScaglione)}
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(s.impostaScaglione)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 dark:bg-gray-800/50 font-semibold">
                    <td className="px-6 py-3 text-gray-900 dark:text-white" colSpan={3}>
                      IRPEF lorda
                    </td>
                    <td className="px-6 py-3 text-right text-gray-900 dark:text-white">
                      {formatCurrency(irpefLorda)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Detrazioni + IRPEF netta */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Detrazioni e IRPEF netta
            </h2>
            <div className="space-y-3">
              <Row label="IRPEF lorda" value={irpefLorda} />
              <Row
                label="Detrazione lavoro dipendente"
                value={-detrazioneLavDip}
                highlight
              />
              {cuneo.detrazione > 0 && (
                <Row
                  label="Detrazione cuneo fiscale"
                  value={-cuneo.detrazione}
                  highlight
                />
              )}
              {cuneo.sommaEsente > 0 && (
                <Row
                  label="Somma esente cuneo fiscale"
                  value={cuneo.sommaEsente}
                  note="(riduce l'imponibile)"
                  muted
                />
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <Row label="IRPEF netta" value={irpefNetta} bold />
              </div>
            </div>
          </div>

          {/* Addizionali */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Addizionali e totale imposte
            </h2>
            <div className="space-y-3">
              <Row label="IRPEF netta" value={irpefNetta} />
              <Row label="Addizionale regionale" value={addRegionale} />
              <Row label="Addizionale comunale (media 0,8%)" value={addComunale} />
              {trattamentoIntegrativo > 0 && (
                <Row
                  label="Trattamento integrativo"
                  value={-trattamentoIntegrativo}
                  highlight
                />
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <Row label="Totale imposte" value={totaleImposte} bold />
              </div>
            </div>
          </div>

          {/* Tax rate summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Aliquota media effettiva
              </p>
              <p className="text-3xl font-bold text-brand">
                {formatRate(aliquotaMedia)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Imposte totali / reddito lordo
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Aliquota marginale
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatRate(aliquotaMarg)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Tassazione su ogni euro aggiuntivo
              </p>
            </div>
          </div>

          {/* Visual breakdown */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Scomposizione del reddito
            </h2>
            <BarraScomposizione
              lang={lang}
              total={reddito}
              items={[
                {
                  label: 'Netto disponibile',
                  value: reddito - contributiINPS - totaleImposte,
                  color: '#22C55E',
                },
                {
                  label: 'Contributi INPS',
                  value: contributiINPS,
                  color: '#3B82F6',
                },
                {
                  label: 'IRPEF netta',
                  value: irpefNetta,
                  color: '#E63946',
                },
                {
                  label: 'Addizionali',
                  value: addRegionale + addComunale,
                  color: '#F97316',
                },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// --- Helper sub-components ---

function Row({
  label,
  value,
  bold,
  highlight,
  muted,
  note,
}: {
  label: string;
  value: number;
  bold?: boolean;
  highlight?: boolean;
  muted?: boolean;
  note?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={[
          'text-sm',
          bold
            ? 'font-semibold text-gray-900 dark:text-white'
            : muted
              ? 'text-gray-400 dark:text-gray-500'
              : 'text-gray-600 dark:text-gray-400',
        ].join(' ')}
      >
        {label}
        {note && (
          <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
            {note}
          </span>
        )}
      </span>
      <span
        className={[
          'text-sm font-medium tabular-nums',
          bold
            ? 'text-lg font-bold text-gray-900 dark:text-white'
            : highlight
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-900 dark:text-gray-100',
        ].join(' ')}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}
