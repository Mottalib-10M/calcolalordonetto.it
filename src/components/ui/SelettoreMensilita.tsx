import type { Lang } from '../../i18n/types';
import { t } from '../../i18n/index';

interface SelettoreMensilitaProps {
  value: 12 | 13 | 14;
  onChange: (m: 12 | 13 | 14) => void;
  lang?: Lang;
}

export default function SelettoreMensilita({
  value,
  onChange,
  lang = 'it',
}: SelettoreMensilitaProps) {
  const options: { value: 12 | 13 | 14; labelKey: string; tooltipKey: string }[] = [
    { value: 12, labelKey: 'ui.months12', tooltipKey: 'ui.months12Tip' },
    { value: 13, labelKey: 'ui.months13', tooltipKey: 'ui.months13Tip' },
    { value: 14, labelKey: 'ui.months14', tooltipKey: 'ui.months14Tip' },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('ui.monthlyPayments', lang)}
      </span>
      <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 p-0.5" role="radiogroup" aria-label={t('ui.monthlyPayments', lang)}>
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              title={t(opt.tooltipKey, lang)}
              onClick={() => onChange(opt.value)}
              className={[
                'flex-1 relative rounded-md px-3 py-3 text-sm font-medium transition-all duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                isActive
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
              ].join(' ')}
            >
              {t(opt.labelKey, lang)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
