import { useState, useMemo } from 'react';
import CampoInput from '../ui/CampoInput';
import { calcolaFIRE } from '../../lib/finanz-engine';
import { formatCurrency, formatPercent } from '../../lib/format-it';
import { t } from '../../i18n';
import type { Lang } from '../../i18n/types';

interface Props { lang?: Lang; }

export default function FIRE({ lang = 'it' }: Props) {
  const [speseMensili, setSpeseMensili] = useState(2000);
  const [patrimonioAttuale, setPatrimonioAttuale] = useState(50000);
  const [risparmioMensile, setRisparmioMensile] = useState(1000);
  const [rendimentoPercent, setRendimentoPercent] = useState(7);
  const [tassoPrelievoPercent, setTassoPrelievoPercent] = useState(4);
  const [tabellaAperta, setTabellaAperta] = useState(false);
  const [tabellaSavingsAperta, setTabellaSavingsAperta] = useState(false);

  const risultato = useMemo(
    () =>
      calcolaFIRE({
        speseAnnue: speseMensili * 12,
        tassoPrelievo: tassoPrelievoPercent / 100,
        patrimoniAttuale: patrimonioAttuale,
        risparmiAnnui: risparmioMensile * 12,
        rendimentoAtteso: rendimentoPercent / 100,
        inflazioneAttesa: 0.02,
        tassazioneRendimenti: 0.26,
      }),
    [speseMensili, patrimonioAttuale, risparmioMensile, rendimentoPercent, tassoPrelievoPercent],
  );

  // Savings rate impact table
  const tabellaImpatto = useMemo(() => {
    const rates = [20, 30, 40, 50, 60, 70];
    const redditoTotale = speseMensili * 12 + risparmioMensile * 12;
    return rates.map((sr) => {
      const risparmiAnnuiCalc = redditoTotale * (sr / 100);
      const speseAnnueCalc = redditoTotale - risparmiAnnuiCalc;
      const res = calcolaFIRE({
        speseAnnue: speseAnnueCalc,
        tassoPrelievo: tassoPrelievoPercent / 100,
        patrimoniAttuale: patrimonioAttuale,
        risparmiAnnui: risparmiAnnuiCalc,
        rendimentoAtteso: rendimentoPercent / 100,
        inflazioneAttesa: 0.02,
        tassazioneRendimenti: 0.26,
      });
      return {
        savingsRate: sr,
        anni: res.anniAlFIRE,
        fireNumber: res.patrimonioObiettivo,
        speseMensili: Math.round(speseAnnueCalc / 12),
      };
    });
  }, [speseMensili, patrimonioAttuale, risparmioMensile, rendimentoPercent, tassoPrelievoPercent]);

  // Max patrimonio for chart scaling
  const maxPatrimonio = useMemo(
    () => Math.max(...risultato.evoluzione.map((e) => Math.max(e.patrimonio, e.obiettivo)), 1),
    [risultato],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* ── Left column: Inputs ── */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            {lang === 'en' ? 'Your data' : 'I tuoi dati'}
          </h2>

          <div className="space-y-4">
            <CampoInput
              lang={lang}
              label={lang === 'en' ? 'Monthly expenses' : 'Spese mensili'}
              value={speseMensili}
              onChange={setSpeseMensili}
              min={200}
              max={20000}
              step={100}
              prefix="€"
              helpText={lang === 'en' ? 'How much you spend per month (rent, bills, food, leisure...)' : 'Quanto spendi al mese (affitto, bollette, cibo, svago...)'}
            />

            <CampoInput
              lang={lang}
              label={lang === 'en' ? 'Current savings' : 'Patrimonio attuale'}
              value={patrimonioAttuale}
              onChange={setPatrimonioAttuale}
              min={0}
              max={10_000_000}
              step={1000}
              prefix="€"
              helpText={lang === 'en' ? 'Savings and investments already accumulated' : "Risparmi e investimenti gia' accumulati"}
            />

            <CampoInput
              lang={lang}
              label={lang === 'en' ? 'Monthly savings' : 'Risparmio mensile'}
              value={risparmioMensile}
              onChange={setRisparmioMensile}
              min={0}
              max={50000}
              step={100}
              prefix="€"
              helpText={lang === 'en' ? 'How much you can save each month' : 'Quanto riesci a mettere da parte ogni mese'}
            />

            <CampoInput
              lang={lang}
              label={lang === 'en' ? 'Expected return' : 'Rendimento atteso'}
              value={rendimentoPercent}
              onChange={setRendimentoPercent}
              min={0}
              max={20}
              step={0.5}
              suffix="%"
              helpText={lang === 'en' ? 'Nominal gross annual return on investments' : 'Rendimento nominale lordo annuo degli investimenti'}
            />

            <CampoInput
              lang={lang}
              label={lang === 'en' ? 'Withdrawal rate (SWR)' : 'Tasso di prelievo (SWR)'}
              value={tassoPrelievoPercent}
              onChange={setTassoPrelievoPercent}
              min={1}
              max={10}
              step={0.25}
              suffix="%"
              helpText={lang === 'en' ? 'Safe Withdrawal Rate (4% rule = standard)' : 'Safe Withdrawal Rate (regola del 4% = standard)'}
            />
          </div>

          <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-xs text-blue-700 dark:text-blue-300">
            {lang === 'en' ? 'Fixed assumptions: 2% inflation, 26% tax on returns (Italian standard rate).' : 'Ipotesi fisse: inflazione 2%, tassazione rendimenti 26% (aliquota italiana standard).'}
          </div>
        </div>
      </div>

      {/* ── Right column: Results ── */}
      <div className="space-y-6">
        {/* FIRE number prominente */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {lang === 'en' ? 'Your FIRE Number' : 'Il tuo FIRE Number'}
          </p>
          <p className="text-4xl sm:text-5xl font-bold text-brand tracking-tight leading-tight">
            {formatCurrency(risultato.patrimonioObiettivo)}
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {lang === 'en' ? 'The wealth needed to live off investments' : 'Il patrimonio necessario per vivere di rendita'}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-5">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{lang === 'en' ? 'Years to FIRE' : 'Anni al FIRE'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {risultato.anniAlFIRE > 80 ? '80+' : risultato.anniAlFIRE}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{lang === 'en' ? 'Estimated monthly income' : 'Rendita mensile stimata'}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(risultato.renditaMensile)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Savings Rate</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatPercent(risultato.savingsRate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{lang === 'en' ? 'Real net return' : 'Rendimento reale netto'}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatPercent(risultato.rendimentoRealeNetto)}
              </p>
            </div>
          </div>
        </div>

        {/* Chart: evoluzione patrimonio vs obiettivo */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            {lang === 'en' ? 'Wealth growth vs FIRE target' : 'Crescita del patrimonio vs obiettivo FIRE'}
          </h3>
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {risultato.evoluzione.map((e) => {
              const patriPct = ((e.patrimonio / maxPatrimonio) * 100).toFixed(1);
              const obietPct = ((e.obiettivo / maxPatrimonio) * 100).toFixed(1);
              const raggiunto = e.patrimonio >= e.obiettivo;
              return (
                <div key={e.anno} className="flex items-center gap-2 text-xs">
                  <span className="w-10 text-right text-gray-500 dark:text-gray-400 shrink-0">
                    A{e.anno}
                  </span>
                  <div className="relative flex-1 h-4">
                    <div className="absolute inset-0 rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <div
                        className={`h-full transition-all duration-300 ${raggiunto ? 'bg-green-500 dark:bg-green-400' : 'bg-brand'}`}
                        style={{ width: patriPct + '%' }}
                        title={`${lang === 'en' ? 'Wealth' : 'Patrimonio'}: ${formatCurrency(e.patrimonio)}`}
                      />
                    </div>
                    {/* Target line */}
                    <div
                      className="absolute top-0 h-full w-0.5 bg-gray-900 dark:bg-white opacity-40"
                      style={{ left: obietPct + '%' }}
                      title={`${lang === 'en' ? 'Target' : 'Obiettivo'}: ${formatCurrency(e.obiettivo)}`}
                    />
                  </div>
                  <span className="w-24 text-right text-gray-700 dark:text-gray-300 shrink-0">
                    {formatCurrency(e.patrimonio)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand" />
              {lang === 'en' ? 'Wealth' : 'Patrimonio'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-500 dark:bg-green-400" />
              {lang === 'en' ? 'Target reached' : 'Obiettivo raggiunto'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-0.5 bg-gray-900 dark:bg-white opacity-40" />
              FIRE Number
            </span>
          </div>
        </div>

        {/* Impatto savings rate */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <button
            type="button"
            onClick={() => setTabellaSavingsAperta(!tabellaSavingsAperta)}
            className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 dark:text-white"
          >
            {lang === 'en' ? 'Impact of savings rate on years to FIRE' : 'Impatto del savings rate sugli anni al FIRE'}
            <svg
              className={`h-5 w-5 transition-transform ${tabellaSavingsAperta ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {tabellaSavingsAperta && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                    <th className="pb-2 pr-3 font-medium">Savings Rate</th>
                    <th className="pb-2 pr-3 font-medium text-right">{lang === 'en' ? 'Expenses/month' : 'Spese/mese'}</th>
                    <th className="pb-2 pr-3 font-medium text-right">FIRE Number</th>
                    <th className="pb-2 font-medium text-right">{lang === 'en' ? 'Years to FIRE' : 'Anni al FIRE'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {tabellaImpatto.map((r) => (
                    <tr key={r.savingsRate} className="text-gray-700 dark:text-gray-300">
                      <td className="py-1.5 pr-3 font-medium">{r.savingsRate}%</td>
                      <td className="py-1.5 pr-3 text-right">{formatCurrency(r.speseMensili)}</td>
                      <td className="py-1.5 pr-3 text-right">{formatCurrency(r.fireNumber)}</td>
                      <td className="py-1.5 text-right font-semibold">
                        {r.anni > 80 ? '80+' : r.anni}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {lang === 'en' ? 'Based on your total income of' : 'Basato sul tuo reddito totale di'} {formatCurrency((speseMensili + risparmioMensile) * 12)}{lang === 'en' ? '/year with initial wealth of' : '/anno con patrimonio iniziale di'} {formatCurrency(patrimonioAttuale)}.
              </p>
            </div>
          )}
        </div>

        {/* Tabella evoluzione collapsible */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <button
            type="button"
            onClick={() => setTabellaAperta(!tabellaAperta)}
            className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 dark:text-white"
          >
            {lang === 'en' ? 'Annual evolution table' : 'Tabella evoluzione annuale'}
            <svg
              className={`h-5 w-5 transition-transform ${tabellaAperta ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {tabellaAperta && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                    <th className="pb-2 pr-3 font-medium">{lang === 'en' ? 'Year' : 'Anno'}</th>
                    <th className="pb-2 pr-3 font-medium text-right">{lang === 'en' ? 'Wealth' : 'Patrimonio'}</th>
                    <th className="pb-2 pr-3 font-medium text-right">{lang === 'en' ? 'Target' : 'Obiettivo'}</th>
                    <th className="pb-2 font-medium text-right">{lang === 'en' ? 'Difference' : 'Differenza'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {risultato.evoluzione.map((e) => {
                    const diff = e.patrimonio - e.obiettivo;
                    return (
                      <tr key={e.anno} className="text-gray-700 dark:text-gray-300">
                        <td className="py-1.5 pr-3">{e.anno}</td>
                        <td className="py-1.5 pr-3 text-right">{formatCurrency(e.patrimonio)}</td>
                        <td className="py-1.5 pr-3 text-right">{formatCurrency(e.obiettivo)}</td>
                        <td className={`py-1.5 text-right font-medium ${diff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
