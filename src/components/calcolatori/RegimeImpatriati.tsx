import { useState, useMemo, useEffect, useRef } from 'react';
import CampoInput from '../ui/CampoInput';
import SelettoreRegione from '../ui/SelettoreRegione';
import { calcolaRegimeImpatriati } from '../../lib/irpef-engine';
import { formatCurrency, formatRate } from '../../lib/format-it';

export default function RegimeImpatriati() {
  const [ral, setRal] = useState(50_000);
  const [regione, setRegione] = useState('LOM');
  const [percentualeEsenzione, setPercentualeEsenzione] = useState(50);
  const isInitialMount = useRef(true);

  // URL state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const r = params.get('ral');
    if (r) setRal(parseInt(r, 10) || 50_000);
    const reg = params.get('regione');
    if (reg) setRegione(reg.toUpperCase());
    const pct = params.get('esenzione');
    if (pct) setPercentualeEsenzione(parseInt(pct, 10) || 50);
    if (window.location.search) window.history.replaceState({}, '', window.location.pathname);
    setTimeout(() => { isInitialMount.current = false; }, 0);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isInitialMount.current) return;
    const url = new URL(window.location.href);
    url.searchParams.set('ral', String(ral));
    url.searchParams.set('regione', regione);
    if (percentualeEsenzione !== 50) url.searchParams.set('esenzione', String(percentualeEsenzione));
    else url.searchParams.delete('esenzione');
    window.history.replaceState({}, '', url.toString());
  }, [ral, regione, percentualeEsenzione]);

  const risultato = useMemo(() => {
    if (ral <= 0 || !regione) return null;

    return calcolaRegimeImpatriati({
      ral,
      regione,
      percentualeEsenzione: percentualeEsenzione / 100,
    });
  }, [ral, regione, percentualeEsenzione]);

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
            max={500_000}
            suffix="€"
            helpText="Lo stipendio lordo annuale completo"
          />
          <SelettoreRegione
            value={regione}
            onChange={setRegione}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Percentuale esenzione
            </label>
            <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 p-0.5">
              {[50, 70].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setPercentualeEsenzione(pct)}
                  className={[
                    'relative rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-150',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                    percentualeEsenzione === pct
                      ? 'bg-brand text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
                  ].join(' ')}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              50% regime attuale (dal 2024) &middot; 70% vecchio regime
            </p>
          </div>
        </div>
      </div>

      {/* Side by Side Comparison */}
      {risultato && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Con Regime */}
            <div className="rounded-2xl border-2 border-brand bg-white dark:bg-gray-900 shadow-lg shadow-brand/10 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center rounded-full bg-brand/10 dark:bg-brand/20 px-3 py-1 text-xs font-semibold text-brand">
                  Con Regime Impatriati
                </span>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Netto mensile
              </p>
              <p className="text-3xl sm:text-4xl font-bold text-brand tracking-tight">
                {formatCurrency(risultato.conRegime.nettoMensile)}
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {formatCurrency(risultato.conRegime.nettoAnnuo)} netti/anno
              </p>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">RAL</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(ral)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Reddito tassabile ({100 - percentualeEsenzione}%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(ral * (1 - percentualeEsenzione / 100))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">INPS</span>
                  <span className="font-medium text-red-600 dark:text-red-400">- {formatCurrency(risultato.conRegime.contributiINPS)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">IRPEF netta</span>
                  <span className="font-medium text-red-600 dark:text-red-400">- {formatCurrency(risultato.conRegime.irpefNetta)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Addizionali</span>
                  <span className="font-medium text-red-600 dark:text-red-400">- {formatCurrency(risultato.conRegime.totaleAddizionali)}</span>
                </div>
              </div>
            </div>

            {/* Senza Regime */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Senza Regime (tassazione ordinaria)
                </span>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Netto mensile
              </p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                {formatCurrency(risultato.senzaRegime.nettoMensile)}
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {formatCurrency(risultato.senzaRegime.nettoAnnuo)} netti/anno
              </p>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">RAL</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(ral)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Reddito tassabile (100%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(ral)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">INPS</span>
                  <span className="font-medium text-red-600 dark:text-red-400">- {formatCurrency(risultato.senzaRegime.contributiINPS)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">IRPEF netta</span>
                  <span className="font-medium text-red-600 dark:text-red-400">- {formatCurrency(risultato.senzaRegime.irpefNetta)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Addizionali</span>
                  <span className="font-medium text-red-600 dark:text-red-400">- {formatCurrency(risultato.senzaRegime.totaleAddizionali)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Highlight */}
          <div className="rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                  Risparmio annuo con regime impatriati
                </p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                  +{formatCurrency(risultato.risparmiAnnuo)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                  Risparmio mensile
                </p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                  +{formatCurrency(risultato.risparmiMensile)}
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5">
            <div className="flex gap-3">
              <svg className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Requisiti di eleggibilita
                </p>
                <ul className="mt-2 text-sm text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
                  <li>Non essere stato residente fiscalmente in Italia nei 3 periodi d'imposta precedenti</li>
                  <li>Impegno a mantenere la residenza fiscale in Italia per almeno 4 anni</li>
                  <li>Attivita lavorativa prevalentemente svolta in Italia</li>
                  <li>Possesso di requisiti di elevata qualificazione o specializzazione (dal 2024)</li>
                  <li>Reddito da lavoro dipendente, assimilato o autonomo</li>
                  <li>Limite massimo di reddito agevolabile: 600.000 euro annui (dal 2024)</li>
                </ul>
                <p className="mt-3 text-xs text-amber-600 dark:text-amber-500">
                  Questo calcolo e' indicativo. Consulta un commercialista per verificare la tua situazione specifica
                  e i requisiti aggiornati del regime impatriati.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
