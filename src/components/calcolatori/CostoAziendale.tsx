import { useState, useMemo, useEffect } from 'react';
import CampoInput from '../ui/CampoInput';
import SelettoreRegione from '../ui/SelettoreRegione';
import SelettoreMensilita from '../ui/SelettoreMensilita';
import BarraScomposizione from '../ui/BarraScomposizione';
import { calcolaStipendio } from '../../lib/irpef-engine';
import { formatCurrency, formatPercent, formatNumber } from '../../lib/format-it';

const ORE_ANNO_STANDARD = 1720;

export default function CostoAziendale() {
  const [ral, setRal] = useState(30_000);
  const [regione, setRegione] = useState('LOM');
  const [mensilita, setMensilita] = useState<12 | 13 | 14>(13);
  const [aliquotaINAIL, setAliquotaINAIL] = useState(0.4);

  // URL state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const r = params.get('ral');
    if (r) setRal(parseInt(r, 10) || 30_000);
    const reg = params.get('regione');
    if (reg) setRegione(reg);
    const m = params.get('mensilita');
    if (m && [12, 13, 14].includes(Number(m))) setMensilita(Number(m) as 12 | 13 | 14);
    const inail = params.get('inail');
    if (inail) setAliquotaINAIL(parseFloat(inail) || 0.4);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('ral', String(ral));
    if (regione !== 'LOM') url.searchParams.set('regione', regione);
    else url.searchParams.delete('regione');
    if (mensilita !== 13) url.searchParams.set('mensilita', String(mensilita));
    else url.searchParams.delete('mensilita');
    if (aliquotaINAIL !== 0.4) url.searchParams.set('inail', String(aliquotaINAIL));
    else url.searchParams.delete('inail');
    window.history.replaceState({}, '', url.toString());
  }, [ral, regione, mensilita, aliquotaINAIL]);

  const risultato = useMemo(() => {
    if (ral <= 0) return null;

    const stipendio = calcolaStipendio({ ral, regione, mensilita });

    const inailAnnuo = Math.round(ral * (aliquotaINAIL / 100) * 100) / 100;
    const costoTotale = Math.round((ral + stipendio.contributiINPSDatore + stipendio.tfrAnnuo + inailAnnuo) * 100) / 100;
    const costoMensile = Math.round((costoTotale / 12) * 100) / 100;
    const costoOrario = Math.round((costoTotale / ORE_ANNO_STANDARD) * 100) / 100;

    // Percentages
    const percINPS = stipendio.contributiINPSDatore / costoTotale;
    const percTFR = stipendio.tfrAnnuo / costoTotale;
    const percINAIL = inailAnnuo / costoTotale;
    const percRAL = ral / costoTotale;

    // Difference: employer cost vs netto
    const differenzaCostoNetto = costoTotale - stipendio.nettoAnnuo;
    const moltiplicatore = ral > 0 ? costoTotale / ral : 0;

    return {
      ...stipendio,
      inailAnnuo,
      costoTotale,
      costoMensile,
      costoOrario,
      percINPS,
      percTFR,
      percINAIL,
      percRAL,
      differenzaCostoNetto,
      moltiplicatore,
    };
  }, [ral, regione, mensilita, aliquotaINAIL]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Inserisci i dati del dipendente
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CampoInput
            label="RAL (Retribuzione Annua Lorda)"
            value={ral}
            onChange={setRal}
            min={0}
            max={300_000}
            suffix="€"
            helpText="Stipendio lordo annuale del dipendente"
          />
          <SelettoreRegione value={regione} onChange={setRegione} />
          <SelettoreMensilita value={mensilita} onChange={setMensilita} />
          <CampoInput
            label="Aliquota INAIL"
            value={aliquotaINAIL}
            onChange={setAliquotaINAIL}
            min={0.1}
            max={3}
            step={0.1}
            suffix="%"
            helpText="Variabile per settore: ufficio ~0,4%, industria ~2,5%"
          />
        </div>
      </div>

      {/* Results */}
      {risultato && (
        <>
          {/* Hero Result Card */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Costo aziendale totale annuo
            </p>
            <p className="text-4xl sm:text-5xl font-bold text-brand tracking-tight leading-tight">
              {formatCurrency(risultato.costoTotale)}
            </p>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
              {formatCurrency(risultato.costoMensile)}/mese
              <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
              {formatCurrency(risultato.costoOrario)}/ora
              <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
              {mensilita} mensilita
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-brand/10 dark:bg-brand/20 px-3 py-1 text-sm font-semibold text-brand">
                Moltiplicatore: x{formatNumber(risultato.moltiplicatore, 2)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                rispetto alla RAL di {formatCurrency(ral)}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Costo mensile</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(risultato.costoMensile)}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Costo orario</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(risultato.costoOrario)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatNumber(ORE_ANNO_STANDARD)} ore/anno</p>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Netto dipendente</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(risultato.nettoMensile)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">/mese</p>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Cuneo fiscale</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(risultato.differenzaCostoNetto)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">costo - netto annuo</p>
            </div>
          </div>

          {/* Breakdown Bar */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Composizione del costo aziendale
            </h3>
            <BarraScomposizione
              total={risultato.costoTotale}
              items={[
                { label: 'RAL', value: ral, color: '#3b82f6' },
                { label: 'INPS datore', value: risultato.contributiINPSDatore, color: '#E63946' },
                { label: 'TFR', value: risultato.tfrAnnuo, color: '#f59e0b' },
                { label: 'INAIL', value: risultato.inailAnnuo, color: '#8b5cf6' },
              ]}
            />
          </div>

          {/* Detail Table */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Dettaglio completo dei costi
            </h3>
            <div className="space-y-1">
              {/* RAL */}
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-gray-900 dark:text-white font-medium">RAL (Retribuzione Annua Lorda)</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Stipendio lordo contrattuale</p>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(ral)}</span>
              </div>

              {/* INPS Datore */}
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Contributi INPS datore (23,81%)</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatPercent(risultato.percINPS)} del costo totale</p>
                </div>
                <span className="font-semibold text-red-600 dark:text-red-400">+ {formatCurrency(risultato.contributiINPSDatore)}</span>
              </div>

              {/* TFR */}
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">TFR (RAL / 13,5)</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatPercent(risultato.percTFR)} del costo totale</p>
                </div>
                <span className="font-semibold text-red-600 dark:text-red-400">+ {formatCurrency(risultato.tfrAnnuo)}</span>
              </div>

              {/* INAIL */}
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Premio INAIL ({formatNumber(aliquotaINAIL, 1)}% della RAL)</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatPercent(risultato.percINAIL)} del costo totale</p>
                </div>
                <span className="font-semibold text-red-600 dark:text-red-400">+ {formatCurrency(risultato.inailAnnuo)}</span>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-4 bg-brand/5 dark:bg-brand/10 -mx-6 px-6 rounded-lg mt-2">
                <span className="font-bold text-gray-900 dark:text-white text-lg">Costo aziendale totale</span>
                <span className="text-2xl font-bold text-brand">{formatCurrency(risultato.costoTotale)}</span>
              </div>
            </div>

            {/* Monthly and hourly summary */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Costo mensile</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(risultato.costoMensile)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Costo totale / 12 mesi</p>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Costo orario</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(risultato.costoOrario)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Basato su {formatNumber(ORE_ANNO_STANDARD)} ore/anno standard</p>
              </div>
            </div>
          </div>

          {/* Cost vs Net comparison */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Dal costo aziendale al netto in busta
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Quanto arriva effettivamente al dipendente rispetto a quanto spende l'azienda
            </p>
            <div className="space-y-1">
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Costo aziendale totale</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(risultato.costoTotale)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Contributi INPS (datore + dipendente)</span>
                <span className="font-semibold text-red-600 dark:text-red-400">- {formatCurrency(risultato.contributiINPSDatore + risultato.contributiINPS)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">TFR accantonato</span>
                <span className="font-semibold text-red-600 dark:text-red-400">- {formatCurrency(risultato.tfrAnnuo)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">INAIL</span>
                <span className="font-semibold text-red-600 dark:text-red-400">- {formatCurrency(risultato.inailAnnuo)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">IRPEF netta + addizionali</span>
                <span className="font-semibold text-red-600 dark:text-red-400">- {formatCurrency(risultato.irpefNetta + risultato.totaleAddizionali)}</span>
              </div>
              {risultato.trattamentoIntegrativo > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Trattamento integrativo</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">+ {formatCurrency(risultato.trattamentoIntegrativo)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-4 bg-green-50 dark:bg-green-900/20 -mx-6 px-6 rounded-lg mt-2">
                <span className="font-bold text-gray-900 dark:text-white">Netto annuo dipendente</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(risultato.nettoAnnuo)}</span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-5">
            <div className="flex gap-3">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                  Nota sul costo orario
                </p>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                  Il costo orario di {formatCurrency(risultato.costoOrario)} e' calcolato su {formatNumber(ORE_ANNO_STANDARD)} ore
                  lavorative annue standard (convenzione internazionale). Questo valore include ferie, permessi e
                  festivita' gia' retribuite. Il costo effettivo per ora "produttiva" puo' essere
                  significativamente superiore, in base al tasso di assenteismo e alle ore effettivamente lavorate.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
