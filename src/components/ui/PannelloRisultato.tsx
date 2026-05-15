import type { ReactNode } from 'react';
import { formatCurrency, formatPercent } from '../../lib/format-it';

interface PannelloRisultatoProps {
  nettoMensile: number;
  nettoAnnuo: number;
  mensilita: number;
  ral: number;
  children?: ReactNode;
}

export default function PannelloRisultato({
  nettoMensile,
  nettoAnnuo,
  mensilita,
  ral,
  children,
}: PannelloRisultatoProps) {
  const aliquotaEffettiva = ral > 0 ? (ral - nettoAnnuo) / ral : 0;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
      {/* Top label */}
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
        Stipendio netto mensile
      </p>

      {/* Headline monthly net */}
      <p className="text-4xl sm:text-5xl font-bold text-brand tracking-tight leading-tight">
        {formatCurrency(nettoMensile)}
      </p>

      {/* Subtitle: annual net and mensilita */}
      <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
        {formatCurrency(nettoAnnuo)} netti/anno
        <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
        {mensilita} mensilita
      </p>

      {/* Effective tax rate badge */}
      <div className="mt-4 flex items-center gap-3">
        <span className="inline-flex items-center rounded-full bg-brand/10 dark:bg-brand/20 px-3 py-1 text-sm font-semibold text-brand">
          Aliquota effettiva: {formatPercent(aliquotaEffettiva)}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          su RAL {formatCurrency(ral)}
        </span>
      </div>

      {/* Optional additional details */}
      {children && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-5">
          {children}
        </div>
      )}
    </div>
  );
}
