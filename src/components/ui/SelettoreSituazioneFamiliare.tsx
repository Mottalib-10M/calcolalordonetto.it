import { useId, useCallback } from 'react';
import type { Lang } from '../../i18n/types';
import { t } from '../../i18n/index';

interface SelettoreSituazioneFamiliareProps {
  coniugeACarico: boolean;
  figli: number;
  onChangeConiuge: (b: boolean) => void;
  onChangeFigli: (n: number) => void;
  lang?: Lang;
}

const MIN_FIGLI = 0;
const MAX_FIGLI = 10;

export default function SelettoreSituazioneFamiliare({
  coniugeACarico,
  figli,
  onChangeConiuge,
  onChangeFigli,
  lang = 'it',
}: SelettoreSituazioneFamiliareProps) {
  const switchId = useId();

  const decrement = useCallback(() => {
    onChangeFigli(Math.max(MIN_FIGLI, figli - 1));
  }, [figli, onChangeFigli]);

  const increment = useCallback(() => {
    onChangeFigli(Math.min(MAX_FIGLI, figli + 1));
  }, [figli, onChangeFigli]);

  return (
    <div className="flex flex-col gap-4">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('ui.familySituation', lang)}
      </span>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
        {/* Coniuge toggle */}
        <div className="flex items-center gap-3">
          <button
            id={switchId}
            role="switch"
            type="button"
            aria-checked={coniugeACarico}
            onClick={() => onChangeConiuge(!coniugeACarico)}
            className={[
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2',
              'dark:focus-visible:ring-offset-gray-900',
              coniugeACarico
                ? 'bg-brand'
                : 'bg-gray-300 dark:bg-gray-600',
            ].join(' ')}
          >
            <span
              className={[
                'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
                coniugeACarico ? 'translate-x-5.5' : 'translate-x-0.5',
              ].join(' ')}
              style={{ marginTop: '2px' }}
            />
          </button>
          <label
            htmlFor={switchId}
            className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
          >
            {t('ui.spouseDependent', lang)}
          </label>
        </div>

        {/* Figli counter */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {t('ui.childrenDependent', lang)}
          </span>
          <div className="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900">
            <button
              type="button"
              onClick={decrement}
              disabled={figli <= MIN_FIGLI}
              aria-label={t('ui.removeChild', lang)}
              className={[
                'flex items-center justify-center w-9 h-9 text-lg font-medium rounded-l-lg transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                figli <= MIN_FIGLI
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
              ].join(' ')}
            >
              -
            </button>
            <span className="w-10 text-center text-base font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
              {figli}
            </span>
            <button
              type="button"
              onClick={increment}
              disabled={figli >= MAX_FIGLI}
              aria-label={t('ui.addChild', lang)}
              className={[
                'flex items-center justify-center w-9 h-9 text-lg font-medium rounded-r-lg transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                figli >= MAX_FIGLI
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
              ].join(' ')}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Note about Assegno Unico */}
      <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
        {t('ui.childrenNote', lang)}
      </p>
    </div>
  );
}
