import { useState, useEffect, useCallback, useRef } from 'react';
import { calcolaStipendio, type RisultatoStipendio } from '../../lib/irpef-engine';
import { formatCurrency, formatPercent } from '../../lib/format-it';
import { decodeState, pushState } from '../../lib/url-state';
import { regioniByCode } from '../../data/regioni';
import { comuniBySlug, ADDIZIONALE_COMUNALE_MEDIA } from '../../data/comuni-top200';
import CampoInput from '../ui/CampoInput';
import PannelloRisultato from '../ui/PannelloRisultato';
import BarraScomposizione from '../ui/BarraScomposizione';
import SelettoreRegione from '../ui/SelettoreRegione';
import SelettoreComune from '../ui/SelettoreComune';
import SelettoreMensilita from '../ui/SelettoreMensilita';
import SelettoreSituazioneFamiliare from '../ui/SelettoreSituazioneFamiliare';
import TabellaDettaglio from '../ui/TabellaDettaglio';

export default function StipendioNetto() {
  // ---- State ---------------------------------------------------------------
  const [ral, setRal] = useState(30_000);
  const [regione, setRegione] = useState('LOM');
  const [aliquotaComunale, setAliquotaComunale] = useState(ADDIZIONALE_COMUNALE_MEDIA);
  const [comuneSlug, setComuneSlug] = useState('');
  const [mensilita, setMensilita] = useState<12 | 13 | 14>(13);
  const [coniugeACarico, setConiugeACarico] = useState(false);
  const [figliACarico, setFigliACarico] = useState(0);
  const [risultato, setRisultato] = useState<RisultatoStipendio | null>(null);
  const [copied, setCopied] = useState(false);
  const isInitialMount = useRef(true);

  // ---- Hydrate from URL on mount -------------------------------------------
  useEffect(() => {
    const params = decodeState(window.location.search);
    if (params.ral !== undefined) setRal(params.ral);
    if (params.regione) setRegione(params.regione);
    if (params.mensilita) setMensilita(params.mensilita);
    if (params.coniugeACarico !== undefined) setConiugeACarico(params.coniugeACarico);
    if (params.figli !== undefined) setFigliACarico(params.figli);
    if (params.comune) {
      setComuneSlug(params.comune);
      const c = comuniBySlug.get(params.comune);
      if (c) setAliquotaComunale(c.aliquota);
    }
    if (window.location.search) window.history.replaceState({}, '', window.location.pathname);
  }, []);

  // ---- Recalculate whenever inputs change ----------------------------------
  useEffect(() => {
    if (ral <= 0) {
      setRisultato(null);
      return;
    }

    const res = calcolaStipendio({
      ral,
      regione,
      aliquotaComunale,
      mensilita,
      coniugeACarico,
      figliACarico21plus: figliACarico,
    });
    setRisultato(res);

    // Sync URL (only after first user interaction)
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      pushState({
        ral,
        regione,
        comune: comuneSlug || undefined,
        mensilita,
        coniugeACarico,
        figli: figliACarico,
      });
    }
  }, [ral, regione, aliquotaComunale, mensilita, coniugeACarico, figliACarico, comuneSlug]);

  // ---- Handlers ------------------------------------------------------------
  const handleComuneChange = useCallback((slug: string, aliquota: number) => {
    setComuneSlug(slug);
    setAliquotaComunale(aliquota);
  }, []);

  const handleRegioneChange = useCallback((codice: string) => {
    setRegione(codice);
    // Reset comune when region changes
    setComuneSlug('');
    setAliquotaComunale(ADDIZIONALE_COMUNALE_MEDIA);
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  // ---- Derived: regione slug for SelettoreComune ---------------------------
  const regioneSlug = regioniByCode.get(regione)?.slug ?? '';

  // ---- Render --------------------------------------------------------------
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ── INPUT SECTION ─────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* RAL input -- large, prominent */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <CampoInput
            label="RAL - Retribuzione Annua Lorda"
            value={ral}
            onChange={setRal}
            min={0}
            max={500_000}
            step={500}
            prefix="€"
            helpText="Inserisci la tua retribuzione annua lorda (RAL) dal contratto"
          />
        </div>

        {/* Regione + Comune */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelettoreRegione value={regione} onChange={handleRegioneChange} />
            <SelettoreComune
              value={comuneSlug}
              onChange={handleComuneChange}
              regione={regioneSlug}
            />
          </div>
        </div>

        {/* Mensilita */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <SelettoreMensilita value={mensilita} onChange={setMensilita} />
        </div>

        {/* Family situation */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <SelettoreSituazioneFamiliare
            coniugeACarico={coniugeACarico}
            figli={figliACarico}
            onChangeConiuge={setConiugeACarico}
            onChangeFigli={setFigliACarico}
          />
        </div>
      </div>

      {/* ── RESULT SECTION ────────────────────────────────────────── */}
      <div className="space-y-6">
        {risultato ? (
          <>
            {/* Main result panel */}
            <PannelloRisultato
              nettoMensile={risultato.nettoMensile}
              nettoAnnuo={risultato.nettoAnnuo}
              mensilita={risultato.mensilita}
              ral={risultato.ral}
            />

            {/* Share button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 active:scale-95"
              >
                {copied ? (
                  <>
                    <svg className="h-4 w-4 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-600 dark:text-green-400">Copiato!</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .792l6.733 3.367a2.5 2.5 0 1 1-.671 1.341l-6.733-3.367a2.5 2.5 0 1 1 0-3.474l6.733-3.367A2.52 2.52 0 0 1 13 4.5Z" />
                    </svg>
                    Condividi
                  </>
                )}
              </button>
            </div>

            {/* Visual breakdown bar */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Scomposizione della RAL
              </h3>
              <BarraScomposizione
                items={[
                  {
                    label: 'Netto',
                    value: risultato.nettoAnnuo,
                    color: '#22c55e',
                  },
                  {
                    label: 'IRPEF',
                    value: risultato.irpefNetta,
                    color: '#E63946',
                  },
                  {
                    label: 'INPS',
                    value: risultato.contributiINPS,
                    color: '#3b82f6',
                  },
                  {
                    label: 'Addizionali',
                    value: risultato.totaleAddizionali,
                    color: '#f59e0b',
                  },
                ]}
                total={risultato.ral}
              />
            </div>

            {/* Detailed breakdown table */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Dettaglio busta paga annuale
              </h3>
              <TabellaDettaglio
                items={buildTabellaItems(risultato)}
              />
            </div>

            {/* Extra info */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Informazioni aggiuntive
              </h3>
              <dl className="grid grid-cols-2 gap-4">
                <InfoBox
                  label="Costo azienda"
                  value={formatCurrency(risultato.costoAzienda)}
                  sublabel="Costo totale per il datore di lavoro"
                />
                <InfoBox
                  label="TFR annuo"
                  value={formatCurrency(risultato.tfrAnnuo)}
                  sublabel="Accantonamento annuo del TFR"
                />
                <InfoBox
                  label="Aliquota media"
                  value={formatPercent(risultato.aliquotaMedia)}
                  sublabel="Percentuale effettiva di tassazione"
                />
                <InfoBox
                  label="Aliquota marginale"
                  value={formatPercent(risultato.aliquotaMarginale)}
                  sublabel="Tassazione sull'ultimo euro guadagnato"
                />
              </dl>
            </div>
          </>
        ) : (
          /* Placeholder when no valid input */
          <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Inserisci la tua RAL per calcolare lo stipendio netto
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helper: build TabellaDettaglio items ───────────────────────────────────

function buildTabellaItems(r: RisultatoStipendio) {
  const items: {
    label: string;
    value: number;
    tipo: 'positivo' | 'negativo' | 'neutro' | 'risultato';
  }[] = [
    { label: 'RAL (Retribuzione Annua Lorda)', value: r.ral, tipo: 'neutro' },
    { label: 'Contributi INPS (9,19%)', value: r.contributiINPS, tipo: 'negativo' },
    { label: 'Imponibile fiscale', value: r.imponibileFiscale, tipo: 'neutro' },
    { label: 'IRPEF lorda', value: r.irpefLorda, tipo: 'negativo' },
    { label: 'Detrazione lavoro dipendente', value: r.detrazioneLavoroDipendente, tipo: 'positivo' },
  ];

  if (r.detrazioneConiuge > 0) {
    items.push({
      label: 'Detrazione coniuge a carico',
      value: r.detrazioneConiuge,
      tipo: 'positivo',
    });
  }

  if (r.detrazioneFigli > 0) {
    items.push({
      label: 'Detrazione figli a carico',
      value: r.detrazioneFigli,
      tipo: 'positivo',
    });
  }

  if (r.cuneoFiscaleDetrazione > 0) {
    items.push({
      label: 'Cuneo fiscale (detrazione)',
      value: r.cuneoFiscaleDetrazione,
      tipo: 'positivo',
    });
  }

  if (r.cuneoFiscaleSommaEsente > 0) {
    items.push({
      label: 'Cuneo fiscale (somma esente)',
      value: r.cuneoFiscaleSommaEsente,
      tipo: 'positivo',
    });
  }

  items.push(
    { label: 'IRPEF netta', value: r.irpefNetta, tipo: 'negativo' },
    { label: 'Addizionale regionale', value: r.addizionaleRegionale, tipo: 'negativo' },
    { label: 'Addizionale comunale', value: r.addizionaleComunale, tipo: 'negativo' },
  );

  if (r.trattamentoIntegrativo > 0) {
    items.push({
      label: 'Trattamento integrativo',
      value: r.trattamentoIntegrativo,
      tipo: 'positivo',
    });
  }

  items.push(
    { label: 'NETTO ANNUO', value: r.nettoAnnuo, tipo: 'risultato' },
    {
      label: `Netto mensile (su ${r.mensilita} mensilita)`,
      value: r.nettoMensile,
      tipo: 'risultato',
    },
  );

  return items;
}

// ── InfoBox sub-component ──────────────────────────────────────────────────

function InfoBox({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </dt>
      <dd className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
        {value}
      </dd>
      <dd className="text-xs text-gray-400 dark:text-gray-500">{sublabel}</dd>
    </div>
  );
}
