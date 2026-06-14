import { formatCurrency as formatCurrencyIt } from '../../lib/format-it';
import { formatCurrency as formatCurrencyLocale } from '../../lib/format';
import type { Lang } from '../../i18n/types';
import { t } from '../../i18n/index';

interface TabellaItem {
  label: string;
  value: number;
  tipo: 'positivo' | 'negativo' | 'neutro' | 'risultato';
}

interface TabellaDettaglioProps {
  items: TabellaItem[];
  lang?: Lang;
}

export default function TabellaDettaglio({ items, lang = 'it' }: TabellaDettaglioProps) {
  const fmtCurrency = (v: number) => lang === 'it' ? formatCurrencyIt(v) : formatCurrencyLocale(v, 'en');

  return (
    <div className="overflow-x-auto -mx-2 sm:mx-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200 dark:border-gray-700">
            <th className="py-2 pr-4 text-left font-semibold text-gray-700 dark:text-gray-300">
              {t('ui.tableHeaderItem', lang)}
            </th>
            <th className="py-2 pl-4 text-right font-semibold text-gray-700 dark:text-gray-300">
              {t('ui.tableHeaderAmount', lang)}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const isRisultato = item.tipo === 'risultato';
            const isNegativo = item.tipo === 'negativo';

            return (
              <tr
                key={i}
                className={[
                  'border-b',
                  isRisultato
                    ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
                    : 'border-gray-100 dark:border-gray-800',
                ].join(' ')}
              >
                <td
                  className={[
                    'py-2.5 pr-4 text-left',
                    isRisultato
                      ? 'font-bold text-gray-900 dark:text-gray-100'
                      : 'text-gray-700 dark:text-gray-300',
                  ].join(' ')}
                >
                  {item.label}
                </td>
                <td
                  className={[
                    'py-2.5 pl-4 text-right whitespace-nowrap tabular-nums',
                    isRisultato
                      ? 'font-bold text-brand'
                      : isNegativo
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-900 dark:text-gray-100',
                  ].join(' ')}
                >
                  {isNegativo && item.value > 0 ? '- ' : ''}
                  {fmtCurrency(isNegativo ? item.value : item.value)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
