import { useState, useEffect, useCallback, useMemo } from 'react';
import { calcolaLordoDaNetto } from '../../lib/irpef-engine';
import { formatCurrency, formatRate } from '../../lib/format-it';
import { formatCurrency as formatCurrencyLocale, formatPercent as formatPercentLocale } from '../../lib/format';
import type { Lang } from '../../i18n/types';
import { t } from '../../i18n/index';
import CampoInput from '../ui/CampoInput';
import SelettoreRegione from '../ui/SelettoreRegione';
import BarraScomposizione from '../ui/BarraScomposizione';

export default function StipendioLordo({ lang = 'it' }: { lang?: Lang }) {
  const [nettoTarget, setNettoTarget] = useState(2_000);
  const [regione, setRegione] = useState('LOM');
  const [mensilita, setMensilita] = useState<12 | 13 | 14>(13);

  // Load from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const n = params.get('netto');
    if (n) setNettoTarget(parseInt(n, 10) || 2_000);
    const r = params.get('regione');
    if (r) setRegione(r.toUpperCase());
    const m = params.get('mensilita');
    if (m) {
      const mv = parseInt(m, 10);
      if (mv === 12 || mv === 13 || mv === 14) setMensilita(mv);
    }
    if (window.location.search) window.history.replaceState({}, '', window.location.pathname);
  }, []);

  // Sync URL
  const syncURL = useCallback(
    (n: number, r: string, m: number) => {
      if (typeof window === 'undefined') return;
      const url = new URL(window.location.href);
      url.searchParams.set('netto', String(n));
      url.searchParams.set('regione', r);
      if (m !== 13) url.searchParams.set('mensilita', String(m));
      else url.searchParams.delete('mensilita');
      window.history.replaceState({}, '', url.toString());
    },
    [],
  );

  const handleNettoChange = useCallback(
    (val: number) => {
      setNettoTarget(val);
      syncURL(val, regione, mensilita);
    },
    [regione, mensilita, syncURL],
  );

  const handleRegioneChange = useCallback(
    (val: string) => {
      setRegione(val);
      syncURL(nettoTarget, val, mensilita);
    },
    [nettoTarget, mensilita, syncURL],
  );

  const handleMensilitaChange = useCallback(
    (val: 12 | 13 | 14) => {
      setMensilita(val);
      syncURL(nettoTarget, regione, val);
    },
    [nettoTarget, regione, syncURL],
  );

  // Calculate
  const result = useMemo(() => {
    if (nettoTarget <= 0 || !regione) return null;
    return calcolaLordoDaNetto(nettoTarget, regione, { mensilita });
  }, [nettoTarget, regione, mensilita]);

  const r = result?.risultato;
  const differenza = r
    ? r.nettoMensile - nettoTarget
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          Calcolo Stipendio Lordo da Netto
        </h2>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Inserisci lo stipendio netto mensile che desideri e scopri quale RAL
          richiedere al tuo datore di lavoro.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <CampoInput
          label="Netto mensile desiderato"
          value={nettoTarget}
          onChange={handleNettoChange}
          min={0}
          max={50_000}
          step={50}
          suffix="€"
          helpText="Lo stipendio netto che vorresti in busta paga"
          lang={lang}
        />
        <SelettoreRegione value={regione} onChange={handleRegioneChange} lang={lang} />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Mensilita
          </span>
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            {([12, 13, 14] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleMensilitaChange(m)}
                className={[
                  'flex-1 py-2.5 text-sm font-medium transition-colors',
                  mensilita === m
                    ? 'bg-brand text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                ].join(' ')}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {r && (
        <div className="space-y-8">
          {/* Main result card */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              RAL necessaria
            </p>
            <p className="text-4xl sm:text-5xl font-bold text-brand tracking-tight">
              {formatCurrency(r.ral)}
            </p>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
              Per ottenere circa{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(nettoTarget)}/mese
              </span>{' '}
              netti su {mensilita} mensilita
            </p>

            {/* Accuracy note */}
            <div className="mt-4 flex items-center gap-2">
              <span
                className={[
                  'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
                  Math.abs(differenza) < 5
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-1 ring-green-200 dark:ring-green-800'
                    : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 ring-1 ring-yellow-200 dark:ring-yellow-800',
                ].join(' ')}
              >
                Netto effettivo: {formatCurrency(r.nettoMensile)}/mese
                {Math.abs(differenza) > 0 && (
                  <span className="ml-1 text-xs">
                    ({differenza > 0 ? '+' : ''}
                    {formatCurrency(differenza)})
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Full breakdown */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Dettaglio completo
            </h2>
            <div className="space-y-3">
              <BreakdownRow label="RAL (lordo annuo)" value={r.ral} bold />
              <BreakdownRow
                label="Contributi INPS dipendente (9,19%)"
                value={-r.contributiINPS}
              />
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                <BreakdownRow
                  label="Imponibile fiscale"
                  value={r.imponibileFiscale}
                />
              </div>
              <BreakdownRow label="IRPEF lorda" value={-r.irpefLorda} />
              <BreakdownRow
                label="Detrazioni lavoro dipendente"
                value={r.detrazioneLavoroDipendente}
                highlight
              />
              {r.cuneoFiscaleDetrazione > 0 && (
                <BreakdownRow
                  label="Detrazione cuneo fiscale"
                  value={r.cuneoFiscaleDetrazione}
                  highlight
                />
              )}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                <BreakdownRow label="IRPEF netta" value={-r.irpefNetta} />
              </div>
              <BreakdownRow
                label="Addizionale regionale"
                value={-r.addizionaleRegionale}
              />
              <BreakdownRow
                label="Addizionale comunale"
                value={-r.addizionaleComunale}
              />
              {r.trattamentoIntegrativo > 0 && (
                <BreakdownRow
                  label="Trattamento integrativo"
                  value={r.trattamentoIntegrativo}
                  highlight
                />
              )}
              <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-3">
                <BreakdownRow label="Netto annuo" value={r.nettoAnnuo} bold />
                <div className="mt-2">
                  <BreakdownRow
                    label={`Netto mensile (su ${mensilita} mensilita)`}
                    value={r.nettoMensile}
                    bold
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tax rates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Aliquota media"
              value={formatRate(r.aliquotaMedia)}
            />
            <StatCard
              label="Aliquota marginale"
              value={formatRate(r.aliquotaMarginale)}
            />
            <StatCard
              label="Costo azienda"
              value={formatCurrency(r.costoAzienda)}
              sublabel="Inclusi contributi datore"
            />
          </div>

          {/* Visual breakdown */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Scomposizione della RAL
            </h2>
            <BarraScomposizione
              lang={lang}
              total={r.ral}
              items={[
                {
                  label: 'Netto',
                  value: r.nettoAnnuo,
                  color: '#22C55E',
                },
                {
                  label: 'INPS dipendente',
                  value: r.contributiINPS,
                  color: '#3B82F6',
                },
                {
                  label: 'IRPEF netta',
                  value: r.irpefNetta,
                  color: '#E63946',
                },
                {
                  label: 'Addizionali',
                  value: r.totaleAddizionali,
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

// --- Sub-components ---

function BreakdownRow({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: number;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={[
          'text-sm',
          bold
            ? 'font-semibold text-gray-900 dark:text-white'
            : 'text-gray-600 dark:text-gray-400',
        ].join(' ')}
      >
        {label}
      </span>
      <span
        className={[
          'text-sm font-medium tabular-nums',
          bold
            ? 'text-lg font-bold text-gray-900 dark:text-white'
            : highlight
              ? 'text-green-600 dark:text-green-400'
              : value < 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-900 dark:text-gray-100',
        ].join(' ')}
      >
        {value > 0 && !bold ? '+' : ''}
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 text-center">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
      {sublabel && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {sublabel}
        </p>
      )}
    </div>
  );
}
