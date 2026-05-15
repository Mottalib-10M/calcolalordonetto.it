import { useState, useMemo } from 'react';
import CampoInput from '../ui/CampoInput';
import {
  calcolaStipendio,
  calcolaDetrazioneConiuge,
  calcolaDetrazioneFigli,
  calcolaContributiINPS,
} from '../../lib/irpef-engine';
import { formatCurrency, formatNumber } from '../../lib/format-it';

export default function DetrazioniFamiliari() {
  const [ral, setRal] = useState(35_000);
  const [coniugeACarico, setConiugeACarico] = useState(false);
  const [numFigli, setNumFigli] = useState(1);
  const [percentualeCarico, setPercentualeCarico] = useState<50 | 100>(50);

  const risultato = useMemo(() => {
    // Calculate with detrazioni familiari
    const conDetrazioni = calcolaStipendio({
      ral,
      regione: 'LOM',
      coniugeACarico,
      figliACarico21plus: numFigli,
    });

    // Calculate without detrazioni familiari
    const senzaDetrazioni = calcolaStipendio({
      ral,
      regione: 'LOM',
      coniugeACarico: false,
      figliACarico21plus: 0,
    });

    // Individual detrazioni
    const contributiINPS = calcolaContributiINPS(ral);
    const imponibile = ral - contributiINPS;

    const detrazioneConiuge = coniugeACarico
      ? calcolaDetrazioneConiuge(imponibile)
      : 0;

    const detrazioneFigliTotale = calcolaDetrazioneFigli(
      imponibile,
      numFigli,
      percentualeCarico / 100,
    );

    const detrazioneFiglioSingolo = numFigli > 0
      ? calcolaDetrazioneFigli(imponibile, 1, percentualeCarico / 100)
      : 0;

    const totaleDetrazioni = detrazioneConiuge + detrazioneFigliTotale;

    // Impact on monthly net
    const differenzaNettaAnnua = conDetrazioni.nettoAnnuo - senzaDetrazioni.nettoAnnuo;
    const differenzaNettaMensile = Math.round((differenzaNettaAnnua / 13) * 100) / 100;

    return {
      conDetrazioni,
      senzaDetrazioni,
      detrazioneConiuge,
      detrazioneFigliTotale,
      detrazioneFiglioSingolo,
      totaleDetrazioni,
      differenzaNettaAnnua: Math.round(differenzaNettaAnnua * 100) / 100,
      differenzaNettaMensile,
      imponibile: Math.round(imponibile * 100) / 100,
    };
  }, [ral, coniugeACarico, numFigli, percentualeCarico]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* ── Left column: Inputs ── */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            Dati del contribuente
          </h2>
          <div className="space-y-4">
            <CampoInput
              label="RAL (Retribuzione Annua Lorda)"
              value={ral}
              onChange={setRal}
              min={0}
              max={500_000}
              step={500}
              prefix="€"
              helpText="Reddito annuo lordo da lavoro dipendente"
            />

            {/* Coniuge a carico toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={coniugeACarico}
                onClick={() => setConiugeACarico(!coniugeACarico)}
                className={[
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                  coniugeACarico ? 'bg-brand' : 'bg-gray-200 dark:bg-gray-700',
                ].join(' ')}
              >
                <span
                  className={[
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                    coniugeACarico ? 'translate-x-5' : 'translate-x-0',
                  ].join(' ')}
                />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Coniuge a carico (reddito &le; 2.840,51 €)
              </span>
            </div>

            <CampoInput
              label="Figli a carico (21+ anni)"
              value={numFigli}
              onChange={(v) => setNumFigli(Math.max(0, Math.min(5, Math.round(v))))}
              min={0}
              max={5}
              step={1}
              helpText="Solo figli di 21 anni o piu'. Sotto i 21 si applica l'Assegno Unico Universale."
            />

            {/* Percentuale a carico */}
            {numFigli > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Percentuale a tuo carico per figlio
                </span>
                <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setPercentualeCarico(50)}
                    className={[
                      'flex-1 py-2.5 text-sm font-medium transition-colors',
                      percentualeCarico === 50
                        ? 'bg-brand text-white'
                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                    ].join(' ')}
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setPercentualeCarico(100)}
                    className={[
                      'flex-1 py-2.5 text-sm font-medium transition-colors border-l border-gray-300 dark:border-gray-600',
                      percentualeCarico === 100
                        ? 'bg-brand text-white'
                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                    ].join(' ')}
                  >
                    100%
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Il 50% e' lo standard quando entrambi i genitori lavorano. Il 100% si applica se l'altro genitore non ha reddito sufficiente.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Nota AUU */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Figli sotto i 21 anni:</strong> Dal marzo 2022, i figli minorenni e
            quelli fino a 20 anni sono coperti dall'Assegno Unico Universale (AUU) erogato
            dall'INPS. Le detrazioni IRPEF per figli a carico si applicano solo ai figli
            di 21 anni compiuti o piu'.
          </p>
        </div>
      </div>

      {/* ── Right column: Results ── */}
      <div className="space-y-6">
        {/* Totale detrazioni prominente */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Totale detrazioni familiari annue
          </p>
          <p className="text-4xl sm:text-5xl font-bold text-brand tracking-tight leading-tight">
            {formatCurrency(risultato.totaleDetrazioni)}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-5">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Detrazione coniuge</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {coniugeACarico
                  ? formatCurrency(risultato.detrazioneConiuge)
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Detrazione figli (totale)</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {numFigli > 0
                  ? formatCurrency(risultato.detrazioneFigliTotale)
                  : 'N/A'}
              </p>
            </div>
          </div>

          {numFigli > 1 && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Detrazione per singolo figlio: {formatCurrency(risultato.detrazioneFiglioSingolo)}
            </p>
          )}
        </div>

        {/* Impatto su netto */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Impatto sullo stipendio netto
          </h3>
          <div className="space-y-3">
            <Row label="Netto annuo senza detrazioni familiari" value={risultato.senzaDetrazioni.nettoAnnuo} />
            <Row label="Netto annuo con detrazioni familiari" value={risultato.conDetrazioni.nettoAnnuo} />
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <Row label="Differenza annua" value={risultato.differenzaNettaAnnua} highlight bold />
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <Row label="Differenza mensile (su 13 mensilita')" value={risultato.differenzaNettaMensile} highlight bold />
            </div>
          </div>
        </div>

        {/* Dettaglio calcolo */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Dettaglio del calcolo
          </h3>
          <div className="space-y-3">
            <Row label="RAL" value={ral} />
            <Row label="Imponibile fiscale (RAL meno INPS)" value={risultato.imponibile} />

            {coniugeACarico && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Formula coniuge applicata
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {risultato.imponibile <= 15_000
                      ? '800 - 110 x (reddito / 15.000)'
                      : risultato.imponibile <= 40_000
                        ? 'Importo fisso per fascia'
                        : risultato.imponibile <= 80_000
                          ? '690 x (80.000 - reddito) / 40.000'
                          : 'Nessuna (reddito > 80.000)'}
                  </span>
                </div>
                <Row label="Detrazione coniuge" value={risultato.detrazioneConiuge} highlight />
              </>
            )}

            {numFigli > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Formula figli 21+
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    950 x (95.000 - reddito) / 95.000
                  </span>
                </div>
                <Row label={`Detrazione per ${numFigli} figlio/i al ${percentualeCarico}%`} value={risultato.detrazioneFigliTotale} highlight />
              </>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <Row label="Totale detrazioni familiari" value={risultato.totaleDetrazioni} bold />
            </div>
          </div>
        </div>

        {/* Reference table */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Detrazioni per fascia di reddito (imponibile)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                  <th className="pb-2 pr-3 font-medium">Reddito</th>
                  <th className="pb-2 pr-3 font-medium text-right">Coniuge</th>
                  <th className="pb-2 font-medium text-right">Figlio 21+ (50%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {[15_000, 20_000, 25_000, 30_000, 35_000, 40_000, 50_000, 60_000, 70_000, 80_000].map(
                  (reddito) => (
                    <tr key={reddito} className="text-gray-700 dark:text-gray-300">
                      <td className="py-1.5 pr-3">{formatCurrency(reddito)}</td>
                      <td className="py-1.5 pr-3 text-right">
                        {formatCurrency(calcolaDetrazioneConiuge(reddito))}
                      </td>
                      <td className="py-1.5 text-right">
                        {formatCurrency(calcolaDetrazioneFigli(reddito, 1, 0.5))}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper sub-components ---

function Row({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: number;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={[
          'text-sm',
          bold
            ? 'font-semibold text-gray-900 dark:text-white'
            : 'text-gray-600 dark:text-gray-400',
        ].join(' ')}
      >
        {label}
      </span>
      <span
        className={[
          'text-sm font-medium tabular-nums',
          bold
            ? 'text-lg font-bold text-gray-900 dark:text-white'
            : highlight
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-900 dark:text-gray-100',
        ].join(' ')}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}
