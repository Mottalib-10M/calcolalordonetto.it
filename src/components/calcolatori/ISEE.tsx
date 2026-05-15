import { useState, useMemo } from 'react';
import CampoInput from '../ui/CampoInput';
import { calcolaISEE } from '../../lib/finanz-engine';
import { formatCurrency, formatNumber } from '../../lib/format-it';

export default function ISEE() {
  const [redditoComplessivo, setRedditoComplessivo] = useState(28_000);
  const [patrimonioMobiliare, setPatrimonioMobiliare] = useState(12_000);
  const [patrimonioImmobiliare, setPatrimonioImmobiliare] = useState(120_000);
  const [mutuoResiduo, setMutuoResiduo] = useState(80_000);
  const [affittoAnnuo, setAffittoAnnuo] = useState(0);
  const [componentiFamiglia, setComponentiFamiglia] = useState(4);
  const [figliMinorenni, setFigliMinorenni] = useState(2);
  const [figliMaggioriConviventi, setFigliMaggioriConviventi] = useState(0);
  const [disabili, setDisabili] = useState(0);
  const [genitoreUnico, setGenitoreUnico] = useState(false);

  const risultato = useMemo(
    () =>
      calcolaISEE({
        redditoComplessivo,
        patrimonioMobiliare,
        patrimonioImmobiliare,
        mutuoResiduo,
        affittoAnnuo,
        componentiFamiglia,
        figliMinorenni,
        figliMaggioriConviventi,
        disabili,
        genitoreUnico,
      }),
    [
      redditoComplessivo,
      patrimonioMobiliare,
      patrimonioImmobiliare,
      mutuoResiduo,
      affittoAnnuo,
      componentiFamiglia,
      figliMinorenni,
      figliMaggioriConviventi,
      disabili,
      genitoreUnico,
    ],
  );

  // Determine fascia color
  const fasciaColor = useMemo(() => {
    if (risultato.isee <= 6_000) return 'text-green-600 dark:text-green-400';
    if (risultato.isee <= 9_530) return 'text-green-600 dark:text-green-400';
    if (risultato.isee <= 15_000) return 'text-blue-600 dark:text-blue-400';
    if (risultato.isee <= 20_000) return 'text-blue-600 dark:text-blue-400';
    if (risultato.isee <= 40_000) return 'text-amber-600 dark:text-amber-400';
    return 'text-gray-600 dark:text-gray-400';
  }, [risultato.isee]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* ── Left column: Inputs ── */}
      <div className="space-y-6">
        {/* Redditi */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            Redditi del nucleo familiare
          </h2>
          <div className="space-y-4">
            <CampoInput
              label="Reddito complessivo del nucleo"
              value={redditoComplessivo}
              onChange={setRedditoComplessivo}
              min={0}
              max={500_000}
              step={500}
              prefix="€"
              helpText="Somma di tutti i redditi dei componenti del nucleo (da lavoro, pensione, autonomo, ecc.)"
            />
            <CampoInput
              label="Canone di affitto annuo"
              value={affittoAnnuo}
              onChange={setAffittoAnnuo}
              min={0}
              max={30_000}
              step={100}
              prefix="€"
              helpText="Solo se in locazione. Lasciare a 0 se proprietari."
            />
          </div>
        </div>

        {/* Patrimonio */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            Patrimonio
          </h2>
          <div className="space-y-4">
            <CampoInput
              label="Patrimonio mobiliare"
              value={patrimonioMobiliare}
              onChange={setPatrimonioMobiliare}
              min={0}
              max={5_000_000}
              step={500}
              prefix="€"
              helpText="Conti correnti, depositi, titoli, fondi, azioni, obbligazioni, polizze vita, ecc."
            />
            <CampoInput
              label="Patrimonio immobiliare (valore catastale)"
              value={patrimonioImmobiliare}
              onChange={setPatrimonioImmobiliare}
              min={0}
              max={5_000_000}
              step={1000}
              prefix="€"
              helpText="Valore catastale degli immobili di proprieta' del nucleo (per la prima casa, inserire il valore catastale rivalutato)"
            />
            <CampoInput
              label="Mutuo residuo prima casa"
              value={mutuoResiduo}
              onChange={setMutuoResiduo}
              min={0}
              max={1_000_000}
              step={1000}
              prefix="€"
              helpText="Debito residuo del mutuo sull'abitazione principale"
            />
          </div>
        </div>

        {/* Nucleo familiare */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            Nucleo familiare
          </h2>
          <div className="space-y-4">
            <CampoInput
              label="Componenti del nucleo"
              value={componentiFamiglia}
              onChange={(v) => setComponentiFamiglia(Math.max(1, Math.round(v)))}
              min={1}
              max={15}
              step={1}
              helpText="Numero totale di persone nel nucleo familiare"
            />
            <CampoInput
              label="Figli minorenni"
              value={figliMinorenni}
              onChange={(v) => setFigliMinorenni(Math.max(0, Math.round(v)))}
              min={0}
              max={10}
              step={1}
            />
            <CampoInput
              label="Figli maggiorenni conviventi"
              value={figliMaggioriConviventi}
              onChange={(v) => setFigliMaggioriConviventi(Math.max(0, Math.round(v)))}
              min={0}
              max={10}
              step={1}
            />
            <CampoInput
              label="Componenti con disabilita'"
              value={disabili}
              onChange={(v) => setDisabili(Math.max(0, Math.round(v)))}
              min={0}
              max={10}
              step={1}
            />

            {/* Genitore unico toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={genitoreUnico}
                onClick={() => setGenitoreUnico(!genitoreUnico)}
                className={[
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                  genitoreUnico ? 'bg-brand' : 'bg-gray-200 dark:bg-gray-700',
                ].join(' ')}
              >
                <span
                  className={[
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                    genitoreUnico ? 'translate-x-5' : 'translate-x-0',
                  ].join(' ')}
                />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Genitore unico (monogenitore)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right column: Results ── */}
      <div className="space-y-6">
        {/* ISEE prominente */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            ISEE stimato
          </p>
          <p className="text-4xl sm:text-5xl font-bold text-brand tracking-tight leading-tight">
            {formatCurrency(risultato.isee)}
          </p>

          <div className="mt-4">
            <p className={`text-sm font-medium ${fasciaColor}`}>
              {risultato.fasciaISEE}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-5">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">ISR (Redditi)</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(risultato.isr)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">ISP (Patrimonio)</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(risultato.isp)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">ISE (ISR + 20% ISP)</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(risultato.ise)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Scala equivalenza</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatNumber(risultato.scalaEquivalenza, 2)}
              </p>
            </div>
          </div>
        </div>

        {/* Dettaglio franchigie e patrimoni */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Dettaglio calcolo patrimoniale
          </h3>
          <div className="space-y-3">
            <Row label="Patrimonio mobiliare dichiarato" value={patrimonioMobiliare} />
            <Row label="Franchigia mobiliare applicata" value={-risultato.franchigiaMobiliare} highlight />
            <Row label="Patrimonio mobiliare netto (ISP)" value={risultato.patrimonioMobiliareNetto} bold />
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3" />
            <Row label="Patrimonio immobiliare dichiarato" value={patrimonioImmobiliare} />
            <Row label="Franchigia prima casa applicata" value={-risultato.franchigiaImmobiliare} highlight />
            <Row label="Patrimonio immobiliare netto (2/3)" value={risultato.patrimonioImmobiliareNetto} bold />
          </div>
        </div>

        {/* Fasce ISEE reference */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Fasce ISEE e agevolazioni principali
          </h3>
          <div className="space-y-2">
            <FasciaRow
              fascia="Fino a 6.000 €"
              descrizione="Bonus sociali (luce, gas, acqua), carta acquisti"
              attiva={risultato.isee <= 6_000}
            />
            <FasciaRow
              fascia="Fino a 9.530 €"
              descrizione="Sussidi sociali, contributi affitto"
              attiva={risultato.isee > 6_000 && risultato.isee <= 9_530}
            />
            <FasciaRow
              fascia="Fino a 15.000 €"
              descrizione="Agevolazioni universitarie massime, bonus vari"
              attiva={risultato.isee > 9_530 && risultato.isee <= 15_000}
            />
            <FasciaRow
              fascia="Fino a 20.000 €"
              descrizione="Agevolazioni universitarie parziali, bandi regionali"
              attiva={risultato.isee > 15_000 && risultato.isee <= 20_000}
            />
            <FasciaRow
              fascia="Fino a 40.000 €"
              descrizione="Fondo Garanzia Prima Casa under 36"
              attiva={risultato.isee > 20_000 && risultato.isee <= 40_000}
            />
            <FasciaRow
              fascia="Oltre 40.000 €"
              descrizione="Nessuna agevolazione ISEE"
              attiva={risultato.isee > 40_000}
            />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>Nota:</strong> Questo e' un calcolo semplificato a scopo informativo.
            L'ISEE ufficiale richiede la DSU (Dichiarazione Sostitutiva Unica) presentata
            tramite CAF, patronato o direttamente sul portale INPS. Il valore effettivo
            puo' differire per la presenza di rendite, trattamenti assistenziali, patrimoni
            all'estero e altre variabili non considerate in questa simulazione.
          </p>
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

function FasciaRow({
  fascia,
  descrizione,
  attiva,
}: {
  fascia: string;
  descrizione: string;
  attiva: boolean;
}) {
  return (
    <div
      className={[
        'flex items-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        attiva
          ? 'bg-brand/10 dark:bg-brand/20 ring-1 ring-brand/30'
          : 'bg-gray-50 dark:bg-gray-800/50',
      ].join(' ')}
    >
      <div className="flex-1">
        <p
          className={[
            'font-medium',
            attiva
              ? 'text-brand'
              : 'text-gray-700 dark:text-gray-300',
          ].join(' ')}
        >
          {fascia}
          {attiva && (
            <span className="ml-2 inline-flex items-center rounded-full bg-brand/20 px-2 py-0.5 text-xs font-medium text-brand">
              La tua fascia
            </span>
          )}
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
          {descrizione}
        </p>
      </div>
    </div>
  );
}
