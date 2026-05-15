import { useState, useMemo } from 'react';
import CampoInput from '../ui/CampoInput';
import { calcolaBudget } from '../../lib/finanz-engine';
import { formatCurrency, formatPercent } from '../../lib/format-it';

const SALUTE_CONFIG: Record<string, { label: string; colore: string; bg: string }> = {
  ottima: {
    label: 'Ottima',
    colore: 'text-green-700 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
  },
  buona: {
    label: 'Buona',
    colore: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
  },
  attenzione: {
    label: 'Attenzione',
    colore: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700',
  },
  critica: {
    label: 'Critica',
    colore: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
  },
};

export default function Budget() {
  const [nettoMensile, setNettoMensile] = useState(1_800);
  const [speseNecessarie, setSpeseNecessarie] = useState(900);
  const [spesePersonali, setSpesePersonali] = useState(450);
  const [risparmio, setRisparmio] = useState(350);

  const risultato = useMemo(
    () =>
      calcolaBudget({
        nettoMensile,
        speseNecessarie,
        spesePersonali,
        risparmio,
      }),
    [nettoMensile, speseNecessarie, spesePersonali, risparmio],
  );

  const totaleSpeseInserite = speseNecessarie + spesePersonali + risparmio;
  const residuo = nettoMensile - totaleSpeseInserite;

  const saluteInfo = SALUTE_CONFIG[risultato.salute];

  // Donut chart data
  const totale = nettoMensile || 1;
  const pctNec = Math.min((speseNecessarie / totale) * 100, 100);
  const pctPers = Math.min((spesePersonali / totale) * 100, 100);
  const pctRisp = Math.min((risparmio / totale) * 100, 100);
  const pctRes = Math.max(0, 100 - pctNec - pctPers - pctRisp);

  // SVG donut segments
  const circumference = 2 * Math.PI * 40;
  const seg1 = (pctNec / 100) * circumference;
  const seg2 = (pctPers / 100) * circumference;
  const seg3 = (pctRisp / 100) * circumference;
  const seg4 = (pctRes / 100) * circumference;

  const offset1 = 0;
  const offset2 = seg1;
  const offset3 = seg1 + seg2;
  const offset4 = seg1 + seg2 + seg3;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* ── Left column: Inputs ── */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            Il tuo budget mensile
          </h2>

          <div className="space-y-4">
            <CampoInput
              label="Stipendio netto mensile"
              value={nettoMensile}
              onChange={setNettoMensile}
              min={0}
              max={50_000}
              step={50}
              prefix="€"
              helpText="Importo netto che ricevi ogni mese in busta paga"
            />

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Spese necessarie (50%)
              </p>
              <CampoInput
                label="Affitto/mutuo, bollette, spesa, trasporti"
                value={speseNecessarie}
                onChange={setSpeseNecessarie}
                min={0}
                max={nettoMensile}
                step={50}
                prefix="€"
                helpText="Tutte le spese fisse e indispensabili"
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Spese personali (30%)
              </p>
              <CampoInput
                label="Svago, abbigliamento, ristoranti, vacanze"
                value={spesePersonali}
                onChange={setSpesePersonali}
                min={0}
                max={nettoMensile}
                step={50}
                prefix="€"
                helpText="Spese discrezionali e per il tempo libero"
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Risparmio e investimenti (20%)
              </p>
              <CampoInput
                label="Fondo emergenza, PAC, pensione integrativa"
                value={risparmio}
                onChange={setRisparmio}
                min={0}
                max={nettoMensile}
                step={50}
                prefix="€"
                helpText="Quota destinata al risparmio e investimenti"
              />
            </div>

            {residuo !== 0 && (
              <div className={`rounded-lg p-3 text-sm ${
                residuo > 0
                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
              }`}>
                {residuo > 0
                  ? `Hai ${formatCurrency(residuo)} non allocati nel budget`
                  : `Il budget supera il netto di ${formatCurrency(Math.abs(residuo))}`
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right column: Results ── */}
      <div className="space-y-6">
        {/* Health indicator */}
        <div className={`rounded-2xl border p-6 sm:p-8 ${saluteInfo.bg}`}>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Salute finanziaria
          </p>
          <p className={`text-4xl sm:text-5xl font-bold tracking-tight leading-tight ${saluteInfo.colore}`}>
            {saluteInfo.label}
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {risultato.salute === 'ottima' && 'Il tuo budget rispetta la regola del 50/30/20. Ottimo lavoro!'}
            {risultato.salute === 'buona' && 'Il tuo budget e\' quasi in linea con la regola 50/30/20. Piccoli aggiustamenti possibili.'}
            {risultato.salute === 'attenzione' && 'Il budget si discosta dalla regola 50/30/20. Valuta di ridurre le spese o aumentare il risparmio.'}
            {risultato.salute === 'critica' && 'Il budget e\' lontano dalla regola 50/30/20. Le spese necessarie sono troppo alte o il risparmio troppo basso.'}
          </p>
        </div>

        {/* Donut chart */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Distribuzione del budget
          </h3>
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-48 h-48">
              {/* Necessarie */}
              <circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke="#E63946"
                strokeWidth="16"
                strokeDasharray={`${seg1} ${circumference - seg1}`}
                strokeDashoffset={-offset1}
                transform="rotate(-90 50 50)"
                className="transition-all duration-500"
              />
              {/* Personali */}
              <circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="16"
                strokeDasharray={`${seg2} ${circumference - seg2}`}
                strokeDashoffset={-offset2}
                transform="rotate(-90 50 50)"
                className="transition-all duration-500"
              />
              {/* Risparmio */}
              <circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke="#22C55E"
                strokeWidth="16"
                strokeDasharray={`${seg3} ${circumference - seg3}`}
                strokeDashoffset={-offset3}
                transform="rotate(-90 50 50)"
                className="transition-all duration-500"
              />
              {/* Residuo */}
              {pctRes > 0 && (
                <circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke="#D1D5DB"
                  strokeWidth="16"
                  strokeDasharray={`${seg4} ${circumference - seg4}`}
                  strokeDashoffset={-offset4}
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-500"
                />
              )}
            </svg>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#E63946' }} />
              Necessarie: {formatPercent(risultato.percentualeNecessarie)}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#3B82F6' }} />
              Personali: {formatPercent(risultato.percentualePersonali)}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#22C55E' }} />
              Risparmio: {formatPercent(risultato.percentualeRisparmio)}
            </span>
            {pctRes > 0 && (
              <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-gray-300 dark:bg-gray-600" />
                Non allocato: {formatPercent(residuo / totale)}
              </span>
            )}
          </div>
        </div>

        {/* Comparison: ideal vs actual */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Regola 50/30/20 vs il tuo budget
          </h3>

          <div className="space-y-5">
            {/* Necessarie */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Necessita' (50%)</span>
                <span className="text-gray-500 dark:text-gray-400">
                  Ideale: {formatCurrency(risultato.regola50)} | Attuale: {formatCurrency(speseNecessarie)}
                </span>
              </div>
              <div className="relative h-6 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {/* Ideal bar */}
                <div
                  className="absolute inset-y-0 left-0 bg-red-200 dark:bg-red-900/40 transition-all duration-500"
                  style={{ width: `${Math.min((risultato.regola50 / totale) * 100, 100)}%` }}
                />
                {/* Actual bar */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(pctNec, 100)}%`,
                    backgroundColor: pctNec <= 55 ? '#E63946' : '#DC2626',
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white mix-blend-difference">
                  {formatPercent(risultato.percentualeNecessarie)}
                </span>
              </div>
              {risultato.scostamento50 > 0 && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                  +{formatCurrency(risultato.scostamento50)} sopra il budget ideale
                </p>
              )}
            </div>

            {/* Personali */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Desideri (30%)</span>
                <span className="text-gray-500 dark:text-gray-400">
                  Ideale: {formatCurrency(risultato.regola30)} | Attuale: {formatCurrency(spesePersonali)}
                </span>
              </div>
              <div className="relative h-6 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-blue-200 dark:bg-blue-900/40 transition-all duration-500"
                  style={{ width: `${Math.min((risultato.regola30 / totale) * 100, 100)}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(pctPers, 100)}%`,
                    backgroundColor: pctPers <= 35 ? '#3B82F6' : '#2563EB',
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white mix-blend-difference">
                  {formatPercent(risultato.percentualePersonali)}
                </span>
              </div>
              {risultato.scostamento30 > 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                  +{formatCurrency(risultato.scostamento30)} sopra il budget ideale
                </p>
              )}
            </div>

            {/* Risparmio */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Risparmio (20%)</span>
                <span className="text-gray-500 dark:text-gray-400">
                  Ideale: {formatCurrency(risultato.regola20)} | Attuale: {formatCurrency(risparmio)}
                </span>
              </div>
              <div className="relative h-6 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-green-200 dark:bg-green-900/40 transition-all duration-500"
                  style={{ width: `${Math.min((risultato.regola20 / totale) * 100, 100)}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(pctRisp, 100)}%`,
                    backgroundColor: pctRisp >= 20 ? '#22C55E' : '#F59E0B',
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white mix-blend-difference">
                  {formatPercent(risultato.percentualeRisparmio)}
                </span>
              </div>
              {risultato.scostamento20 < 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                  {formatCurrency(Math.abs(risultato.scostamento20))} sotto l'obiettivo del 20%
                </p>
              )}
              {risultato.scostamento20 >= 0 && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                  +{formatCurrency(risultato.scostamento20)} sopra l'obiettivo del 20%
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Summary detail */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Riepilogo mensile
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Stipendio netto</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{formatCurrency(nettoMensile)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Spese necessarie</dt>
              <dd className="font-medium" style={{ color: '#E63946' }}>-{formatCurrency(speseNecessarie)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Spese personali</dt>
              <dd className="font-medium text-blue-600 dark:text-blue-400">-{formatCurrency(spesePersonali)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Risparmio</dt>
              <dd className="font-medium text-green-600 dark:text-green-400">{formatCurrency(risparmio)}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
              <dt className="font-medium text-gray-900 dark:text-white">Residuo non allocato</dt>
              <dd className={`font-bold ${residuo >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(residuo)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Annualized view */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Proiezione annua
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Reddito netto annuo</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{formatCurrency(nettoMensile * 12)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Risparmio annuo</dt>
              <dd className="font-medium text-green-600 dark:text-green-400">{formatCurrency(risparmio * 12)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Fondo emergenza consigliato (3-6 mesi)</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(speseNecessarie * 3)} - {formatCurrency(speseNecessarie * 6)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
