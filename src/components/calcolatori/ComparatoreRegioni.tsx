import { useState, useEffect, useMemo, useCallback } from 'react';
import { regioni } from '../../data/regioni';
import { calcolaStipendio } from '../../lib/irpef-engine';
import { formatCurrency, formatCurrencyRound } from '../../lib/format-it';
import { decodeState, pushState } from '../../lib/url-state';
import CampoInput from '../ui/CampoInput';

type SortKey = 'netto' | 'nome';

interface RegionRow {
  codice: string;
  nome: string;
  nettoMensile: number;
  nettoAnnuo: number;
  addRegionale: number;
  addComunale: number;
  totaleAddizionali: number;
}

export default function ComparatoreRegioni() {
  const [ral, setRal] = useState(35_000);
  const [sortBy, setSortBy] = useState<SortKey>('netto');
  const [sortAsc, setSortAsc] = useState(false);

  // Load from URL
  useEffect(() => {
    const params = decodeState(window.location.search);
    if (params.ral) setRal(params.ral);
  }, []);

  const handleRalChange = useCallback((val: number) => {
    setRal(val);
    pushState({ ral: val });
  }, []);

  // Compute all regions
  const rows = useMemo<RegionRow[]>(() => {
    return regioni.map((r) => {
      const result = calcolaStipendio({ ral, regione: r.codice });
      return {
        codice: r.codice,
        nome: r.nome,
        nettoMensile: result.nettoMensile,
        nettoAnnuo: result.nettoAnnuo,
        addRegionale: result.addizionaleRegionale,
        addComunale: result.addizionaleComunale,
        totaleAddizionali: result.totaleAddizionali,
      };
    });
  }, [ral]);

  // Sort
  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let cmp: number;
      if (sortBy === 'nome') {
        cmp = a.nome.localeCompare(b.nome, 'it');
      } else {
        cmp = a.nettoMensile - b.nettoMensile;
      }
      return sortAsc ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortBy, sortAsc]);

  // Stats
  const maxNetto = useMemo(
    () => Math.max(...rows.map((r) => r.nettoMensile)),
    [rows],
  );
  const minNetto = useMemo(
    () => Math.min(...rows.map((r) => r.nettoMensile)),
    [rows],
  );
  const bestRegion = rows.find((r) => r.nettoMensile === maxNetto);
  const worstRegion = rows.find((r) => r.nettoMensile === minNetto);
  const diff = maxNetto - minNetto;

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(key);
      setSortAsc(key === 'nome');
    }
  };

  const SortIcon = ({ active, asc }: { active: boolean; asc: boolean }) => (
    <svg
      className={`inline-block h-3.5 w-3.5 ml-1 transition-colors ${active ? 'text-brand' : 'text-gray-400 dark:text-gray-600'}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      {asc ? (
        <path
          fillRule="evenodd"
          d="M10 18a.75.75 0 0 1-.75-.75V4.66l-3.22 3.22a.75.75 0 1 1-1.06-1.06l4.5-4.5a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06L10.75 4.66v12.59A.75.75 0 0 1 10 18Z"
          clipRule="evenodd"
        />
      ) : (
        <path
          fillRule="evenodd"
          d="M10 2a.75.75 0 0 1 .75.75v12.59l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V2.75A.75.75 0 0 1 10 2Z"
          clipRule="evenodd"
        />
      )}
    </svg>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          Confronto Stipendio Netto per Regione
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Scopri come cambia il tuo stipendio netto in base alla regione di
          residenza. Le addizionali regionali IRPEF variano significativamente.
        </p>
      </div>

      {/* Input */}
      <div className="max-w-sm">
        <CampoInput
          label="RAL (Retribuzione Annua Lorda)"
          value={ral}
          onChange={handleRalChange}
          min={0}
          max={500_000}
          step={1000}
          suffix="€"
        />
      </div>

      {ral > 0 && (
        <div className="space-y-8">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-5">
              <p className="text-sm text-green-700 dark:text-green-400 font-medium mb-1">
                Regione piu' conveniente
              </p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {bestRegion?.nome}
              </p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400 mt-1">
                {formatCurrency(maxNetto)}/mese
              </p>
            </div>
            <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-5">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium mb-1">
                Regione piu' costosa
              </p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {worstRegion?.nome}
              </p>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400 mt-1">
                {formatCurrency(minNetto)}/mese
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                Differenza massima
              </p>
              <p className="text-2xl font-bold text-brand">
                {formatCurrency(diff)}/mese
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatCurrencyRound(diff * 13)}/anno
              </p>
            </div>
          </div>

          {/* Bar chart visualization */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Netto mensile per regione
            </h2>
            <div className="space-y-2">
              {sorted.map((r) => {
                const pct =
                  maxNetto > 0
                    ? ((r.nettoMensile - minNetto) / (maxNetto - minNetto || 1)) * 100
                    : 0;
                const isBest = r.nettoMensile === maxNetto;
                const isWorst = r.nettoMensile === minNetto;

                return (
                  <div key={r.codice} className="group">
                    <div className="flex items-center gap-3">
                      <span
                        className={[
                          'w-40 sm:w-48 text-sm truncate shrink-0',
                          isBest
                            ? 'font-semibold text-green-700 dark:text-green-400'
                            : isWorst
                              ? 'font-semibold text-red-700 dark:text-red-400'
                              : 'text-gray-700 dark:text-gray-300',
                        ].join(' ')}
                      >
                        {r.nome}
                      </span>
                      <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                        <div
                          className={[
                            'h-full rounded transition-all duration-500',
                            isBest
                              ? 'bg-green-500'
                              : isWorst
                                ? 'bg-red-500'
                                : 'bg-brand/70',
                          ].join(' ')}
                          style={{
                            width: `${Math.max(5, 20 + pct * 0.8)}%`,
                          }}
                        />
                      </div>
                      <span
                        className={[
                          'w-24 text-right text-sm font-medium tabular-nums shrink-0',
                          isBest
                            ? 'text-green-700 dark:text-green-400'
                            : isWorst
                              ? 'text-red-700 dark:text-red-400'
                              : 'text-gray-900 dark:text-gray-100',
                        ].join(' ')}
                      >
                        {formatCurrency(r.nettoMensile)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail table */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tabella dettagliata
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th
                      className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-brand transition-colors"
                      onClick={() => toggleSort('nome')}
                    >
                      Regione
                      <SortIcon active={sortBy === 'nome'} asc={sortAsc} />
                    </th>
                    <th
                      className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-brand transition-colors"
                      onClick={() => toggleSort('netto')}
                    >
                      Netto mensile
                      <SortIcon active={sortBy === 'netto'} asc={sortAsc} />
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                      Netto annuo
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">
                      Add. regionale
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                      Diff. dal migliore
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {sorted.map((r) => {
                    const isBest = r.nettoMensile === maxNetto;
                    const isWorst = r.nettoMensile === minNetto;
                    const diffFromBest = r.nettoMensile - maxNetto;

                    return (
                      <tr
                        key={r.codice}
                        className={[
                          'transition-colors',
                          isBest
                            ? 'bg-green-50/50 dark:bg-green-900/10'
                            : isWorst
                              ? 'bg-red-50/50 dark:bg-red-900/10'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800/30',
                        ].join(' ')}
                      >
                        <td
                          className={[
                            'px-4 py-3',
                            isBest
                              ? 'font-semibold text-green-700 dark:text-green-400'
                              : isWorst
                                ? 'font-semibold text-red-700 dark:text-red-400'
                                : 'text-gray-700 dark:text-gray-300',
                          ].join(' ')}
                        >
                          {isBest && (
                            <span className="inline-block mr-1.5 text-xs">&#x2B06;</span>
                          )}
                          {isWorst && (
                            <span className="inline-block mr-1.5 text-xs">&#x2B07;</span>
                          )}
                          {r.nome}
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums text-gray-900 dark:text-gray-100">
                          {formatCurrency(r.nettoMensile)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                          {formatCurrency(r.nettoAnnuo)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300 hidden md:table-cell">
                          {formatCurrency(r.addRegionale)}
                        </td>
                        <td
                          className={[
                            'px-4 py-3 text-right font-medium tabular-nums',
                            diffFromBest === 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400',
                          ].join(' ')}
                        >
                          {diffFromBest === 0
                            ? '--'
                            : formatCurrency(diffFromBest)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
