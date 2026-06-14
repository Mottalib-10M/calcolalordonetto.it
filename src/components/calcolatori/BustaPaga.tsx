import { useState, useEffect, useCallback, useMemo } from 'react';
import { calcolaStipendio } from '../../lib/irpef-engine';
import type { RisultatoStipendio } from '../../lib/irpef-engine';
import { formatCurrency } from '../../lib/format-it';
import { formatCurrency as formatCurrencyLocale } from '../../lib/format';
import { decodeState, pushState } from '../../lib/url-state';
import type { Lang } from '../../i18n/types';
import { t } from '../../i18n/index';
import CampoInput from '../ui/CampoInput';
import SelettoreRegione from '../ui/SelettoreRegione';

export default function BustaPaga({ lang = 'it' }: { lang?: Lang }) {
  const [ral, setRal] = useState(30_000);
  const [regione, setRegione] = useState('LOM');

  // Load from URL
  useEffect(() => {
    const params = decodeState(window.location.search);
    if (params.ral) setRal(params.ral);
    if (params.regione) setRegione(params.regione);
    if (window.location.search) window.history.replaceState({}, '', window.location.pathname);
  }, []);

  const handleRalChange = useCallback(
    (val: number) => {
      setRal(val);
      pushState({ ral: val, regione });
    },
    [regione],
  );

  const handleRegioneChange = useCallback(
    (val: string) => {
      setRegione(val);
      pushState({ ral, regione: val });
    },
    [ral],
  );

  // Full calculation
  const r = useMemo<RisultatoStipendio | null>(() => {
    if (ral <= 0) return null;
    return calcolaStipendio({ ral, regione });
  }, [ral, regione]);

  if (!r) return null;

  // Monthly breakdown values
  const mensilita = r.mensilita; // 13
  const retribuzioneBaseMensile = ral / 12; // The base monthly pay (12 equal installments)
  const rateoTredicesima = ral / 12 / 12; // 1/12 of the monthly pay, accrued monthly
  // But for the payslip, the standard monthly gross is RAL/13 (since 1 month is tredicesima)
  const lordoMensile = ral / 13; // Each of the 13 "payments"
  const contributiINPSMensile = r.contributiINPS / 13;
  const imponibileFiscaleMensile = (r.imponibileFiscale) / 12; // monthly IRPEF is withheld over 12 months
  const irpefMensile = r.irpefNetta / 12; // IRPEF is withheld in 12 installments
  const addRegionaleMensile = r.addizionaleRegionale / 11; // withheld March–January (11 installments)
  const addComunaleMensile = r.addizionaleComunale / 11;
  const trattamentoMensile = r.trattamentoIntegrativo / 12;

  // Net monthly payslip (ordinary month)
  const nettoInBusta =
    lordoMensile -
    contributiINPSMensile -
    irpefMensile -
    addRegionaleMensile -
    addComunaleMensile +
    trattamentoMensile;

  // Tredicesima netta
  const lordoTredicesima = ral / 13;
  const inpsTredicesima = r.contributiINPS / 13;
  const irpefTredicesima = r.irpefNetta / 13;
  // Addizionali are not withheld on tredicesima
  const nettoTredicesima = lordoTredicesima - inpsTredicesima - irpefTredicesima;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          Simulatore Busta Paga {new Date().getFullYear()}
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Inserisci la tua RAL per visualizzare un cedolino mensile dettagliato,
          con tutte le trattenute calcolate sulla base della normativa vigente.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <CampoInput
          label="RAL (Retribuzione Annua Lorda)"
          value={ral}
          onChange={handleRalChange}
          min={0}
          max={500_000}
          step={500}
          suffix="€"
          lang={lang}
        />
        <SelettoreRegione value={regione} onChange={handleRegioneChange} lang={lang} />
      </div>

      {ral > 0 && (
        <div className="space-y-8">
          {/* Payslip card */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 overflow-hidden">
            {/* Payslip header */}
            <div className="bg-gray-900 dark:bg-gray-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-bold text-lg">
                    Cedolino Paga
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Mese ordinario (marzo-dicembre)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs">Anno fiscale</p>
                  <p className="text-white font-semibold">
                    {new Date().getFullYear()}
                  </p>
                </div>
              </div>
            </div>

            {/* Competenze (earnings) */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Competenze
              </h3>
              <PayslipRow
                label="Retribuzione base mensile"
                description="RAL / 13"
                value={lordoMensile}
              />
              <PayslipRow
                label="Rateo tredicesima (1/12)"
                description="Maturazione mensile"
                value={rateoTredicesima}
                muted
              />
            </div>

            {/* Trattenute previdenziali */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Trattenute previdenziali
              </h3>
              <PayslipRow
                label="Contributi INPS dipendente (9,19%)"
                value={-contributiINPSMensile}
                negative
              />
            </div>

            {/* Imponibile fiscale */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <PayslipRow
                label="Imponibile IRPEF mensile"
                value={lordoMensile - contributiINPSMensile}
                bold
              />
            </div>

            {/* Trattenute fiscali */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Trattenute fiscali
              </h3>
              <PayslipRow
                label="IRPEF trattenuta mensile"
                description="IRPEF netta annua / 12"
                value={-irpefMensile}
                negative
              />
              <PayslipRow
                label="Addizionale regionale IRPEF"
                description="Trattenuta in 11 rate (mar-gen)"
                value={-addRegionaleMensile}
                negative
              />
              <PayslipRow
                label="Addizionale comunale IRPEF"
                description="Trattenuta in 11 rate (mar-gen)"
                value={-addComunaleMensile}
                negative
              />
            </div>

            {/* Trattamento integrativo */}
            {trattamentoMensile > 0 && (
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Bonus e integrazioni
                </h3>
                <PayslipRow
                  label="Trattamento integrativo (ex bonus Renzi)"
                  description="Art. 1 D.L. 3/2020"
                  value={trattamentoMensile}
                  positive
                />
              </div>
            )}

            {/* Netto in busta */}
            <div className="px-6 py-5 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-green-800 dark:text-green-300 uppercase tracking-wider">
                    Netto in busta
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                    Mese ordinario con addizionali
                  </p>
                </div>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300 tabular-nums">
                  {formatCurrency(nettoInBusta)}
                </p>
              </div>
            </div>
          </div>

          {/* Tredicesima section */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 overflow-hidden">
            <div className="bg-amber-600 dark:bg-amber-700 px-6 py-4">
              <h2 className="text-white font-bold text-lg">
                Tredicesima Mensilita
              </h2>
              <p className="text-amber-100 text-sm">
                Erogata a dicembre, senza addizionali
              </p>
            </div>

            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <PayslipRow
                label="Lordo tredicesima"
                description="RAL / 13"
                value={lordoTredicesima}
              />
              <PayslipRow
                label="Contributi INPS"
                value={-inpsTredicesima}
                negative
              />
              <PayslipRow
                label="IRPEF trattenuta"
                value={-irpefTredicesima}
                negative
              />
            </div>

            <div className="px-6 py-5 bg-amber-50 dark:bg-amber-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                    Netto tredicesima
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                    Senza trattenuta addizionali
                  </p>
                </div>
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-300 tabular-nums">
                  {formatCurrency(nettoTredicesima)}
                </p>
              </div>
            </div>
          </div>

          {/* Annual summary */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Riepilogo annuale
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <SummaryCard label="RAL" value={formatCurrency(r.ral)} />
              <SummaryCard
                label="Netto annuo"
                value={formatCurrency(r.nettoAnnuo)}
              />
              <SummaryCard
                label="Netto mensile medio"
                value={formatCurrency(r.nettoMensile)}
                sublabel="su 13 mensilita"
              />
              <SummaryCard
                label="TFR maturato"
                value={formatCurrency(r.tfrAnnuo)}
                sublabel="annuo"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-5">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
              Note sulla busta paga
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1.5 list-disc list-inside">
              <li>
                Le addizionali regionali e comunali vengono trattenute in 11
                rate mensili, solitamente da marzo a gennaio dell'anno
                successivo.
              </li>
              <li>
                Nei mesi di gennaio e febbraio la busta paga puo' essere
                leggermente piu' alta, perche' le addizionali dell'anno
                precedente sono terminate e quelle nuove non sono ancora
                iniziate.
              </li>
              <li>
                La tredicesima non prevede la trattenuta delle addizionali
                regionali e comunali.
              </li>
              <li>
                L'addizionale comunale utilizzata e' la media nazionale
                (0,8%). Verifica il tuo comune per il valore esatto.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---

function PayslipRow({
  label,
  description,
  value,
  negative,
  positive,
  bold,
  muted,
}: {
  label: string;
  description?: string;
  value: number;
  negative?: boolean;
  positive?: boolean;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start justify-between py-1.5">
      <div className="flex-1 min-w-0">
        <p
          className={[
            'text-sm',
            bold
              ? 'font-semibold text-gray-900 dark:text-white'
              : muted
                ? 'text-gray-400 dark:text-gray-500 italic'
                : 'text-gray-700 dark:text-gray-300',
          ].join(' ')}
        >
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {description}
          </p>
        )}
      </div>
      <span
        className={[
          'text-sm font-medium tabular-nums ml-4 whitespace-nowrap',
          bold
            ? 'text-base font-bold text-gray-900 dark:text-white'
            : negative
              ? 'text-red-600 dark:text-red-400'
              : positive
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-900 dark:text-gray-100',
        ].join(' ')}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="text-center p-3">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </p>
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      {sublabel && (
        <p className="text-xs text-gray-400 dark:text-gray-500">{sublabel}</p>
      )}
    </div>
  );
}
