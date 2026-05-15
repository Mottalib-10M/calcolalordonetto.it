import { useState, useMemo, useEffect, useRef } from 'react';
import CampoInput from '../ui/CampoInput';
import BarraScomposizione from '../ui/BarraScomposizione';
import { calcolaTFRAnnuo, calcolaTFRAccumulato } from '../../lib/irpef-engine';
import { formatCurrency, formatRate, formatNumber } from '../../lib/format-it';

/**
 * TFR taxation uses "tassazione separata":
 * average rate = IRPEF on (TFR / years × 12) applied to total TFR
 */
function calcolaTassazioneSeparataTFR(tfrLordo: number, anni: number): {
  aliquotaMedia: number;
  impostaTFR: number;
  tfrNetto: number;
} {
  if (tfrLordo <= 0 || anni <= 0) {
    return { aliquotaMedia: 0, impostaTFR: 0, tfrNetto: 0 };
  }

  // Reddito di riferimento = TFR / anni × 12
  const redditoRiferimento = (tfrLordo / anni) * 12;

  // Calculate IRPEF on reddito di riferimento to find average rate
  let irpefRif = 0;
  const scaglioni = [
    { limite: 28_000, aliquota: 0.23 },
    { limite: 50_000, aliquota: 0.35 },
    { limite: Infinity, aliquota: 0.43 },
  ];
  let limInf = 0;
  for (const s of scaglioni) {
    if (redditoRiferimento <= limInf) break;
    const base = Math.min(redditoRiferimento, s.limite) - limInf;
    if (base > 0) irpefRif += base * s.aliquota;
    limInf = s.limite;
  }

  const aliquotaMedia = irpefRif / redditoRiferimento;
  const impostaTFR = Math.round(tfrLordo * aliquotaMedia * 100) / 100;
  const tfrNetto = Math.round((tfrLordo - impostaTFR) * 100) / 100;

  return { aliquotaMedia, impostaTFR, tfrNetto };
}

export default function TFR() {
  const [ral, setRal] = useState(30_000);
  const [anni, setAnni] = useState(5);
  const [tassoRivalutazione, setTassoRivalutazione] = useState(3);
  const isInitialMount = useRef(true);

  // URL state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const r = params.get('ral');
    if (r) setRal(parseInt(r, 10) || 30_000);
    const a = params.get('anni');
    if (a) setAnni(Math.max(1, parseInt(a, 10) || 5));
    const t = params.get('tasso');
    if (t) setTassoRivalutazione(parseFloat(t) || 3);
    if (window.location.search) window.history.replaceState({}, '', window.location.pathname);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set('ral', String(ral));
    url.searchParams.set('anni', String(anni));
    if (tassoRivalutazione !== 3) url.searchParams.set('tasso', String(tassoRivalutazione));
    else url.searchParams.delete('tasso');
    window.history.replaceState({}, '', url.toString());
  }, [ral, anni, tassoRivalutazione]);

  const risultato = useMemo(() => {
    if (ral <= 0 || anni <= 0) return null;

    const tfrAnnuo = calcolaTFRAnnuo(ral);
    const tfrAccumulato = calcolaTFRAccumulato(ral, anni, tassoRivalutazione / 100);

    // TFR senza rivalutazione (scenario base)
    const tfrSenzaRivalutazione = tfrAnnuo * anni;

    // Rivalutazione totale
    const rivalutazioneTotale = Math.round((tfrAccumulato - tfrSenzaRivalutazione) * 100) / 100;

    // Tassazione separata
    const tassazione = calcolaTassazioneSeparataTFR(tfrAccumulato, anni);

    // Confronto fondo pensione: rendimento stimato 4% annuo, tassazione ridotta (max 15%, min 9%)
    const aliquotaFP = Math.max(0.09, 0.15 - (Math.min(anni, 35) - 15) * 0.003);
    const aliquotaFondoPensione = Math.max(0.09, Math.min(0.15, aliquotaFP));
    let tfrFondoPensione = 0;
    for (let i = 0; i < anni; i++) {
      tfrFondoPensione = tfrFondoPensione * 1.04 + tfrAnnuo;
    }
    tfrFondoPensione = Math.round(tfrFondoPensione * 100) / 100;
    const impostaFP = Math.round(tfrFondoPensione * aliquotaFondoPensione * 100) / 100;
    const nettoFP = Math.round((tfrFondoPensione - impostaFP) * 100) / 100;

    return {
      tfrAnnuo,
      tfrAccumulato,
      tfrSenzaRivalutazione,
      rivalutazioneTotale,
      ...tassazione,
      // Fondo pensione
      tfrFondoPensione,
      aliquotaFondoPensione,
      impostaFP,
      nettoFP,
    };
  }, [ral, anni, tassoRivalutazione]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Inserisci i tuoi dati
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <CampoInput
            label="RAL (Retribuzione Annua Lorda)"
            value={ral}
            onChange={setRal}
            min={0}
            max={300_000}
            suffix="€"
            helpText="Il tuo stipendio lordo annuale"
          />
          <CampoInput
            label="Anni di servizio"
            value={anni}
            onChange={(v) => setAnni(Math.max(1, Math.round(v)))}
            min={1}
            max={50}
            helpText="Numero di anni lavorati"
          />
          <CampoInput
            label="Tasso di rivalutazione (%)"
            value={tassoRivalutazione}
            onChange={setTassoRivalutazione}
            min={0}
            max={10}
            step={0.1}
            suffix="%"
            helpText="Default: 1,5% + 75% inflazione ISTAT"
          />
        </div>
      </div>

      {/* Results Section */}
      {risultato && (
        <>
          {/* Hero Result */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                TFR annuo maturato
              </p>
              <p className="text-3xl sm:text-4xl font-bold text-brand tracking-tight leading-tight">
                {formatCurrency(risultato.tfrAnnuo)}
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {formatCurrency(risultato.tfrAnnuo / 12)}/mese
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                TFR accumulato dopo {anni} ann{anni === 1 ? 'o' : 'i'}
              </p>
              <p className="text-3xl sm:text-4xl font-bold text-brand tracking-tight leading-tight">
                {formatCurrency(risultato.tfrAccumulato)}
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                di cui rivalutazione: {formatCurrency(risultato.rivalutazioneTotale)}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Tassazione del TFR (tassazione separata)
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">TFR lordo accumulato</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(risultato.tfrAccumulato)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Aliquota media (tassazione separata)</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatRate(risultato.aliquotaMedia)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Imposta sul TFR</span>
                <span className="font-semibold text-red-600 dark:text-red-400">- {formatCurrency(risultato.impostaTFR)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-green-50 dark:bg-green-900/20 -mx-6 px-6 rounded-lg">
                <span className="font-semibold text-gray-900 dark:text-white">TFR netto</span>
                <span className="text-xl font-bold text-brand">{formatCurrency(risultato.tfrNetto)}</span>
              </div>
            </div>
          </div>

          {/* Comparison: Azienda vs Fondo Pensione */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Confronto: TFR in azienda vs fondo pensione
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Stima con rendimento fondo pensione al 4% annuo (media storica bilanciato)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* In Azienda */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                    TFR in azienda
                  </span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Lordo accumulato</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(risultato.tfrAccumulato)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Rivalutazione ({formatNumber(tassoRivalutazione, 1)}%/anno)</span>
                    <span className="font-medium text-green-600 dark:text-green-400">+{formatCurrency(risultato.rivalutazioneTotale)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Imposta ({formatRate(risultato.aliquotaMedia)})</span>
                    <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(risultato.impostaTFR)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-semibold text-gray-900 dark:text-white">Netto</span>
                    <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(risultato.tfrNetto)}</span>
                  </div>
                </div>
              </div>

              {/* Fondo Pensione */}
              <div className="rounded-xl border-2 border-brand p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center rounded-full bg-brand/10 dark:bg-brand/20 px-3 py-1 text-xs font-semibold text-brand">
                    TFR nel fondo pensione
                  </span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Lordo accumulato</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(risultato.tfrFondoPensione)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Rendimento (4%/anno stima)</span>
                    <span className="font-medium text-green-600 dark:text-green-400">+{formatCurrency(risultato.tfrFondoPensione - risultato.tfrSenzaRivalutazione)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Imposta ({formatRate(risultato.aliquotaFondoPensione)})</span>
                    <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(risultato.impostaFP)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-semibold text-gray-900 dark:text-white">Netto</span>
                    <span className="font-bold text-brand">{formatCurrency(risultato.nettoFP)}</span>
                  </div>
                </div>
              </div>
            </div>

            {risultato.nettoFP > risultato.tfrNetto && (
              <div className="mt-4 rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Con il fondo pensione guadagneresti circa{' '}
                  <strong>{formatCurrency(risultato.nettoFP - risultato.tfrNetto)}</strong> in piu
                  dopo {anni} ann{anni === 1 ? 'o' : 'i'}, grazie al maggiore rendimento e alla tassazione agevolata.
                </p>
              </div>
            )}
          </div>

          {/* Visual Breakdown */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Composizione del TFR in azienda
            </h3>
            <BarraScomposizione
              total={risultato.tfrAccumulato}
              items={[
                { label: 'TFR netto', value: risultato.tfrNetto, color: '#22c55e' },
                { label: 'Imposta', value: risultato.impostaTFR, color: '#E63946' },
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
}
