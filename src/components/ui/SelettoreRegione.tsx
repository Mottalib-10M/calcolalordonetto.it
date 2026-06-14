import { useId } from 'react';
import { regioni } from '../../data/regioni';
import type { Lang } from '../../i18n/types';
import { t } from '../../i18n/index';

interface SelettoreRegioneProps {
  value: string;
  onChange: (code: string) => void;
  lang?: Lang;
}

const regioniOrdinarie = regioni.filter((r) => !r.autonoma);
const regioniAutonome = regioni.filter((r) => r.autonoma);

export default function SelettoreRegione({
  value,
  onChange,
  lang = 'it',
}: SelettoreRegioneProps) {
  const selectId = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={selectId}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {t('ui.region', lang)}
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={[
            'w-full appearance-none rounded-lg border bg-white dark:bg-gray-900 py-2.5 pl-3 pr-10',
            'text-base font-medium outline-none transition-colors',
            'text-gray-900 dark:text-gray-100',
            'border-gray-300 dark:border-gray-600',
            'hover:border-gray-400 dark:hover:border-gray-500',
            'focus:border-brand focus:ring-2 focus:ring-brand/20',
          ].join(' ')}
        >
          <option value="">{t('ui.selectRegion', lang)}</option>
          <optgroup label={t('ui.ordinaryRegions', lang)}>
            {regioniOrdinarie.map((r) => (
              <option key={r.codice} value={r.codice}>
                {r.nome}
              </option>
            ))}
          </optgroup>
          <optgroup label={t('ui.autonomousRegions', lang)}>
            {regioniAutonome.map((r) => (
              <option key={r.codice} value={r.codice}>
                {r.nome}
              </option>
            ))}
          </optgroup>
        </select>
        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-4 w-4 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
