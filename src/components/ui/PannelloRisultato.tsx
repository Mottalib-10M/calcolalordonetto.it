import type { ReactNode } from 'react';
import { formatCurrency as formatCurrencyIt, formatPercent as formatPercentIt } from '../../lib/format-it';
import { formatCurrency as formatCurrencyLocale, formatPercent as formatPercentLocale } from '../../lib/format';
import type { Lang } from '../../i18n/types';
import { t } from '../../i18n/index';

interface PannelloRisultatoProps {
  nettoMensile: number;
  nettoAnnuo: number;
  mensilita: number;
  ral: number;
  children?: ReactNode;
  lang?: Lang;
}

export default function PannelloRisultato({
  nettoMensile,
  nettoAnnuo,
  mensilita,
  ral,
  children,
  lang = 'it',
}: PannelloRisultatoProps) {
  const aliquotaEffettiva = ral > 0 ? (ral - nettoAnnuo) / ral : 0;
  const fmtCurrency = (v: number) => lang === 'it' ? formatCurrencyIt(v) : formatCurrencyLocale(v, 'en');
  const fmtPercent = (v: number) => lang === 'it' ? formatPercentIt(v) : formatPercentLocale(v, 'en');

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
      {/* Top label */}
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
        {t('stipendioNetto.monthlyNetSalary', lang)}
      </p>

      {/* Headline monthly net */}
      <p className="text-4xl sm:text-5xl font-bold text-brand tracking-tight leading-tight">
        {fmtCurrency(nettoMensile)}
      </p>

      {/* Subtitle: annual net and mensilita */}
      <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
        {fmtCurrency(nettoAnnuo)} {t('stipendioNetto.netPerYear', lang)}
        <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
        {mensilita} {t('ui.monthlyPayments', lang).toLowerCase()}
      </p>

      {/* Effective tax rate badge */}
      <div className="mt-4 flex items-center gap-3">
        <span className="inline-flex items-center rounded-full bg-brand/10 dark:bg-brand/20 px-3 py-1 text-sm font-semibold text-brand">
          {t('stipendioNetto.effectiveRate', lang)} {fmtPercent(aliquotaEffettiva)}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {t('stipendioNetto.onRal', lang)} {fmtCurrency(ral)}
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
