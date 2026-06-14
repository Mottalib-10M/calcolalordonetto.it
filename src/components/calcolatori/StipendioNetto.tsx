import { useState, useEffect, useCallback, useRef } from 'react';
import { calcolaStipendio, type RisultatoStipendio } from '../../lib/irpef-engine';
import { formatCurrency as formatCurrencyIt, formatPercent as formatPercentIt } from '../../lib/format-it';
import { formatCurrency as formatCurrencyLocale, formatPercent as formatPercentLocale } from '../../lib/format';
import { decodeState, pushState } from '../../lib/url-state';
import { regioniByCode } from '../../data/regioni';
import { comuniBySlug, ADDIZIONALE_COMUNALE_MEDIA } from '../../data/comuni-top200';
import type { Lang } from '../../i18n/types';
import { t } from '../../i18n/index';
import CampoInput from '../ui/CampoInput';
import PannelloRisultato from '../ui/PannelloRisultato';
import BarraScomposizione from '../ui/BarraScomposizione';
import SelettoreRegione from '../ui/SelettoreRegione';
import SelettoreComune from '../ui/SelettoreComune';
import SelettoreMensilita from '../ui/SelettoreMensilita';
import SelettoreSituazioneFamiliare from '../ui/SelettoreSituazioneFamiliare';
import TabellaDettaglio from '../ui/TabellaDettaglio';

interface Props {
  lang?: Lang;
}

export default function StipendioNetto({ lang = 'it' }: Props) {
  const fmtCurrency = (v: number) => lang === 'it' ? formatCurrencyIt(v) : formatCurrencyLocale(v, 'en');
  const fmtPercent = (v: number) => lang === 'it' ? formatPercentIt(v) : formatPercentLocale(v, 'en');

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
    setTimeout(() => { isInitialMount.current = false; }, 0);
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
    if (!isInitialMount.current) {
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
            label={t('stipendioNetto.ralLabel', lang)}
            value={ral}
            onChange={setRal}
            min={0}
            max={500_000}
            step={500}
            prefix="€"
            helpText={t('stipendioNetto.ralHelp', lang)}
            lang={lang}
          />
        </div>

        {/* Regione + Comune */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelettoreRegione value={regione} onChange={handleRegioneChange} lang={lang} />
            <SelettoreComune
              value={comuneSlug}
              onChange={handleComuneChange}
              regione={regioneSlug}
              lang={lang}
            />
          </div>
        </div>

        {/* Mensilita */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <SelettoreMensilita value={mensilita} onChange={setMensilita} lang={lang} />
        </div>

        {/* Family situation */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <SelettoreSituazioneFamiliare
            coniugeACarico={coniugeACarico}
            figli={figliACarico}
            onChangeConiuge={setConiugeACarico}
            onChangeFigli={setFigliACarico}
            lang={lang}
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
              lang={lang}
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
                    <span className="text-green-600 dark:text-green-400">{t('stipendioNetto.copied', lang)}</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .792l6.733 3.367a2.5 2.5 0 1 1-.671 1.341l-6.733-3.367a2.5 2.5 0 1 1 0-3.474l6.733-3.367A2.52 2.52 0 0 1 13 4.5Z" />
                    </svg>
                    {t('stipendioNetto.share', lang)}
                  </>
                )}
              </button>
            </div>

            {/* Visual breakdown bar */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                {t('stipendioNetto.ralBreakdown', lang)}
              </h3>
              <BarraScomposizione
                items={[
                  {
                    label: t('stipendioNetto.net', lang),
                    value: risultato.nettoAnnuo,
                    color: '#22c55e',
                  },
                  {
                    label: t('stipendioNetto.irpef', lang),
                    value: risultato.irpefNetta,
                    color: '#E63946',
                  },
                  {
                    label: t('stipendioNetto.inps', lang),
                    value: risultato.contributiINPS,
                    color: '#3b82f6',
                  },
                  {
                    label: t('stipendioNetto.surcharges', lang),
                    value: risultato.totaleAddizionali,
                    color: '#f59e0b',
                  },
                ]}
                total={risultato.ral}
                lang={lang}
              />
            </div>

            {/* Detailed breakdown table */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                {t('stipendioNetto.annualPayslipDetail', lang)}
              </h3>
              <TabellaDettaglio
                items={buildTabellaItems(risultato, lang)}
                lang={lang}
              />
            </div>

            {/* Extra info */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                {t('stipendioNetto.additionalInfo', lang)}
              </h3>
              <dl className="grid grid-cols-2 gap-4">
                <InfoBox
                  label={t('stipendioNetto.employerCost', lang)}
                  value={fmtCurrency(risultato.costoAzienda)}
                  sublabel={t('stipendioNetto.employerCostDesc', lang)}
                />
                <InfoBox
                  label={t('stipendioNetto.annualTfr', lang)}
                  value={fmtCurrency(risultato.tfrAnnuo)}
                  sublabel={t('stipendioNetto.annualTfrDesc', lang)}
                />
                <InfoBox
                  label={t('stipendioNetto.averageRate', lang)}
                  value={fmtPercent(risultato.aliquotaMedia)}
                  sublabel={t('stipendioNetto.averageRateDesc', lang)}
                />
                <InfoBox
                  label={t('stipendioNetto.marginalRate', lang)}
                  value={fmtPercent(risultato.aliquotaMarginale)}
                  sublabel={t('stipendioNetto.marginalRateDesc', lang)}
                />
              </dl>
            </div>
          </>
        ) : (
          /* Placeholder when no valid input */
          <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t('stipendioNetto.placeholder', lang)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helper: build TabellaDettaglio items ───────────────────────────────────

function buildTabellaItems(r: RisultatoStipendio, lang: Lang) {
  const items: {
    label: string;
    value: number;
    tipo: 'positivo' | 'negativo' | 'neutro' | 'risultato';
  }[] = [
    { label: t('stipendioNetto.ral', lang), value: r.ral, tipo: 'neutro' },
    { label: t('stipendioNetto.inpsContributions', lang), value: r.contributiINPS, tipo: 'negativo' },
    { label: t('stipendioNetto.taxableIncome', lang), value: r.imponibileFiscale, tipo: 'neutro' },
    { label: t('stipendioNetto.grossIrpef', lang), value: r.irpefLorda, tipo: 'negativo' },
    { label: t('stipendioNetto.employmentDeduction', lang), value: r.detrazioneLavoroDipendente, tipo: 'positivo' },
  ];

  if (r.detrazioneConiuge > 0) {
    items.push({
      label: t('stipendioNetto.spouseDeduction', lang),
      value: r.detrazioneConiuge,
      tipo: 'positivo',
    });
  }

  if (r.detrazioneFigli > 0) {
    items.push({
      label: t('stipendioNetto.childrenDeduction', lang),
      value: r.detrazioneFigli,
      tipo: 'positivo',
    });
  }

  if (r.cuneoFiscaleDetrazione > 0) {
    items.push({
      label: t('stipendioNetto.taxWedgeDeduction', lang),
      value: r.cuneoFiscaleDetrazione,
      tipo: 'positivo',
    });
  }

  if (r.cuneoFiscaleSommaEsente > 0) {
    items.push({
      label: t('stipendioNetto.taxWedgeExempt', lang),
      value: r.cuneoFiscaleSommaEsente,
      tipo: 'positivo',
    });
  }

  items.push(
    { label: t('stipendioNetto.netIrpef', lang), value: r.irpefNetta, tipo: 'negativo' },
    { label: t('stipendioNetto.regionalSurcharge', lang), value: r.addizionaleRegionale, tipo: 'negativo' },
    { label: t('stipendioNetto.municipalSurcharge', lang), value: r.addizionaleComunale, tipo: 'negativo' },
  );

  if (r.trattamentoIntegrativo > 0) {
    items.push({
      label: t('stipendioNetto.supplementaryBenefit', lang),
      value: r.trattamentoIntegrativo,
      tipo: 'positivo',
    });
  }

  items.push(
    { label: t('stipendioNetto.annualNet', lang), value: r.nettoAnnuo, tipo: 'risultato' },
    {
      label: t('stipendioNetto.monthlyNet', lang).replace('{n}', String(r.mensilita)),
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
