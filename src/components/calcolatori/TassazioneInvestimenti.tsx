import { useState, useMemo } from 'react';
import CampoInput from '../ui/CampoInput';
import { calcolaTassazioneInvestimenti } from '../../lib/finanz-engine';
import type { InputTassazioneInvestimenti } from '../../lib/finanz-engine';
import { formatCurrency, formatPercent } from '../../lib/format-it';
import { t } from '../../i18n';
import type { Lang } from '../../i18n/types';

const STRUMENTI_IT: { value: InputTassazioneInvestimenti['tipoStrumento']; label: string; aliquota: string }[] = [
  { value: 'azioni_etf', label: 'Azioni / ETF azionari', aliquota: '26%' },
  { value: 'obbligazioni_corporate', label: 'Obbligazioni corporate', aliquota: '26%' },
  { value: 'titoli_stato', label: 'Titoli di Stato (BTP, BOT, CCT)', aliquota: '12,5%' },
  { value: 'conti_deposito', label: 'Conti deposito', aliquota: '26%' },
  { value: 'crypto', label: 'Criptovalute', aliquota: '26%' },
  { value: 'fondi', label: 'Fondi comuni / OICR armonizzati', aliquota: '26%' },
];

const STRUMENTI_EN: { value: InputTassazioneInvestimenti['tipoStrumento']; label: string; aliquota: string }[] = [
  { value: 'azioni_etf', label: 'Stocks / Equity ETFs', aliquota: '26%' },
  { value: 'obbligazioni_corporate', label: 'Corporate bonds', aliquota: '26%' },
  { value: 'titoli_stato', label: 'Government bonds (BTP, BOT, CCT)', aliquota: '12.5%' },
  { value: 'conti_deposito', label: 'Savings accounts', aliquota: '26%' },
  { value: 'crypto', label: 'Cryptocurrency', aliquota: '26%' },
  { value: 'fondi', label: 'Mutual funds / UCITS', aliquota: '26%' },
];

interface Props { lang?: Lang; }

export default function TassazioneInvestimenti({ lang = 'it' }: Props) {
  const [capitaleInvestito, setCapitaleInvestito] = useState(50_000);
  const [valoreAttuale, setValoreAttuale] = useState(65_000);
  const [tipoStrumento, setTipoStrumento] = useState<InputTassazioneInvestimenti['tipoStrumento']>('azioni_etf');
  const [anniDetenzione, setAnniDetenzione] = useState(3);
  const [minusvalenzePregresse, setMinusvalenzePregresse] = useState(0);

  const STRUMENTI = lang === 'en' ? STRUMENTI_EN : STRUMENTI_IT;

  const risultato = useMemo(
    () =>
      calcolaTassazioneInvestimenti({
        capitaleInvestito,
        valoreAttuale,
        tipoStrumento,
        anniDetenzione,
        minusvalenzePregresse,
      }),
    [capitaleInvestito, valoreAttuale, tipoStrumento, anniDetenzione, minusvalenzePregresse],
  );

  // Comparison table: same plusvalenza across different instruments
  const confronto = useMemo(() => {
    const tipi: InputTassazioneInvestimenti['tipoStrumento'][] = [
      'azioni_etf',
      'obbligazioni_corporate',
      'titoli_stato',
      'conti_deposito',
      'crypto',
      'fondi',
    ];
    return tipi.map((tipo) => {
      const r = calcolaTassazioneInvestimenti({
        capitaleInvestito,
        valoreAttuale,
        tipoStrumento: tipo,
        anniDetenzione,
        minusvalenzePregresse,
      });
      const label = STRUMENTI.find((s) => s.value === tipo)?.label ?? tipo;
      return { tipo, label, ...r };
    });
  }, [capitaleInvestito, valoreAttuale, anniDetenzione, minusvalenzePregresse]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* ── Left column: Inputs ── */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            {lang === 'en' ? 'Investment data' : "Dati dell'investimento"}
          </h2>

          <div className="space-y-4">
            <CampoInput
              lang={lang}
              label={lang === 'en' ? 'Capital invested (purchase cost)' : "Capitale investito (costo d'acquisto)"}
              value={capitaleInvestito}
              onChange={setCapitaleInvestito}
              min={0}
              max={10_000_000}
              step={1000}
              prefix="€"
              helpText={lang === 'en' ? 'Total purchase price of positions' : 'Prezzo totale di acquisto delle posizioni'}
            />

            <CampoInput
              lang={lang}
              label={lang === 'en' ? 'Current market value' : 'Valore attuale di mercato'}
              value={valoreAttuale}
              onChange={setValoreAttuale}
              min={0}
              max={10_000_000}
              step={1000}
              prefix="€"
              helpText={lang === 'en' ? 'Current portfolio value' : 'Valore corrente del portafoglio'}
            />

            {/* Tipo strumento dropdown */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="tipo-strumento"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {lang === 'en' ? 'Instrument type' : 'Tipo di strumento'}
              </label>
              <select
                id="tipo-strumento"
                value={tipoStrumento}
                onChange={(e) =>
                  setTipoStrumento(e.target.value as InputTassazioneInvestimenti['tipoStrumento'])
                }
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2.5 px-3 text-sm font-medium text-gray-900 dark:text-gray-100 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                {STRUMENTI.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label} ({s.aliquota})
                  </option>
                ))}
              </select>
            </div>

            <CampoInput
              lang={lang}
              label={lang === 'en' ? 'Years held' : 'Anni di detenzione'}
              value={anniDetenzione}
              onChange={(v) => setAnniDetenzione(Math.round(v))}
              min={0}
              max={50}
              step={1}
              suffix={lang === 'en' ? 'years' : 'anni'}
            />

            <CampoInput
              lang={lang}
              label={lang === 'en' ? 'Prior capital losses' : 'Minusvalenze pregresse'}
              value={minusvalenzePregresse}
              onChange={setMinusvalenzePregresse}
              min={0}
              max={10_000_000}
              step={500}
              prefix="€"
              helpText={lang === 'en' ? 'Realized losses in the last 4 years (offsettable only against redditi diversi, not funds/harmonized ETFs)' : 'Perdite realizzate negli ultimi 4 anni (compensabili solo con redditi diversi, non fondi/ETF armonizzati)'}
            />
          </div>
        </div>
      </div>

      {/* ── Right column: Results ── */}
      <div className="space-y-6">
        {/* Main result */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {lang === 'en' ? 'Net after taxes' : 'Netto dopo tasse'}
          </p>
          <p className="text-4xl sm:text-5xl font-bold text-brand tracking-tight leading-tight">
            {formatCurrency(risultato.nettoDopoTasse)}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-5">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{lang === 'en' ? 'Capital gain' : 'Plusvalenza'}</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(risultato.plusvalenza)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{lang === 'en' ? 'Applied tax rate' : 'Aliquota applicata'}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatPercent(risultato.aliquota)}
              </p>
            </div>
          </div>
        </div>

        {/* Tax breakdown */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {lang === 'en' ? 'Tax breakdown' : 'Dettaglio tassazione'}
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">{lang === 'en' ? 'Capital invested' : 'Capitale investito'}</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(capitaleInvestito)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">{lang === 'en' ? 'Current value' : 'Valore attuale'}</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(valoreAttuale)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
              <dt className="text-gray-500 dark:text-gray-400">{lang === 'en' ? 'Gross capital gain' : 'Plusvalenza lorda'}</dt>
              <dd className="font-medium text-green-600 dark:text-green-400">
                {formatCurrency(risultato.plusvalenza)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">
                {lang === 'en' ? 'Gross tax' : 'Imposta lorda'} ({formatPercent(risultato.aliquota)})
              </dt>
              <dd className="font-medium text-red-600 dark:text-red-400">
                -{formatCurrency(risultato.impostaLorda)}
              </dd>
            </div>
            {risultato.creditoMinusvalenze > 0 && (
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">{lang === 'en' ? 'Capital loss credit' : 'Credito minusvalenze'}</dt>
                <dd className="font-medium text-green-600 dark:text-green-400">
                  +{formatCurrency(risultato.creditoMinusvalenze)}
                </dd>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
              <dt className="font-medium text-gray-900 dark:text-white">{lang === 'en' ? 'Net tax' : 'Imposta netta'}</dt>
              <dd className="font-bold text-red-600 dark:text-red-400">
                -{formatCurrency(risultato.impostaNetta)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
              <dt className="font-medium text-gray-900 dark:text-white">{lang === 'en' ? 'Net received' : 'Netto incassato'}</dt>
              <dd className="font-bold text-brand">
                {formatCurrency(risultato.nettoDopoTasse)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Rendimento lordo vs netto */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {lang === 'en' ? 'Gross vs net return' : 'Rendimento lordo vs netto'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{lang === 'en' ? 'Gross return' : 'Rendimento lordo'}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatPercent(risultato.rendimentoLordoPercent)}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{lang === 'en' ? 'Net return' : 'Rendimento netto'}</p>
              <p className="text-2xl font-bold text-brand">
                {formatPercent(risultato.rendimentoNettoPercent)}
              </p>
            </div>
          </div>
        </div>

        {/* Comparison table */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            {lang === 'en' ? 'Tax comparison by instrument type' : 'Confronto tassazione per tipo di strumento'}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                  <th className="pb-2 pr-3 font-medium">{lang === 'en' ? 'Instrument' : 'Strumento'}</th>
                  <th className="pb-2 pr-3 font-medium text-right">{lang === 'en' ? 'Rate' : 'Aliquota'}</th>
                  <th className="pb-2 pr-3 font-medium text-right">{lang === 'en' ? 'Tax' : 'Imposta'}</th>
                  <th className="pb-2 font-medium text-right">{lang === 'en' ? 'Net' : 'Netto'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {confronto.map((c) => (
                  <tr
                    key={c.tipo}
                    className={
                      c.tipo === tipoStrumento
                        ? 'bg-brand/5 dark:bg-brand/10 text-gray-900 dark:text-white font-medium'
                        : 'text-gray-700 dark:text-gray-300'
                    }
                  >
                    <td className="py-1.5 pr-3">{c.label}</td>
                    <td className="py-1.5 pr-3 text-right">{formatPercent(c.aliquota)}</td>
                    <td className="py-1.5 pr-3 text-right text-red-600 dark:text-red-400">
                      -{formatCurrency(c.impostaNetta)}
                    </td>
                    <td className="py-1.5 text-right font-medium">
                      {formatCurrency(c.nettoDopoTasse)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warning for fondi */}
        {tipoStrumento === 'fondi' && minusvalenzePregresse > 0 && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              {lang === 'en' ? (
                <>
                  <strong>Warning:</strong> mutual funds and harmonized ETFs (UCITS) generate &apos;capital income&apos; (redditi da capitale), which <strong>cannot be offset</strong>{' '}
                  against prior capital losses (&apos;redditi diversi&apos;). The indicated capital losses are not applied for this instrument.
                </>
              ) : (
                <>
                  <strong>Attenzione:</strong> i fondi comuni e gli ETF armonizzati (OICR UCITS)
                  generano &quot;redditi da capitale&quot;, che <strong>non possono essere compensati</strong>{' '}
                  con le minusvalenze pregresse (&quot;redditi diversi&quot;). Le minusvalenze indicate
                  non vengono applicate per questo strumento.
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
