import { useState, useMemo, useEffect, useRef } from 'react';
import CampoInput from '../ui/CampoInput';
import SelettoreRegione from '../ui/SelettoreRegione';
import BarraScomposizione from '../ui/BarraScomposizione';
import { calcolaStipendio, calcolaForfettario, calcolaTFRAnnuo } from '../../lib/irpef-engine';
import { formatCurrency, formatRate } from '../../lib/format-it';

const COEFFICIENTI = [
  { label: 'IT, consulenza, ingegneria (86%)', value: 0.86 },
  { label: 'Professionisti (78%)', value: 0.78 },
  { label: 'Attivita dei servizi (67%)', value: 0.67 },
  { label: 'Intermediari del commercio (62%)', value: 0.62 },
  { label: 'Commercio ambulante non alimentari (54%)', value: 0.54 },
  { label: 'Commercio ingrosso e dettaglio (40%)', value: 0.40 },
  { label: 'Alloggio e ristorazione (40%)', value: 0.40 },
];

export default function ConfrontoDipendentePIVA() {
  const [ral, setRal] = useState(35_000);
  const [fatturato, setFatturato] = useState(35_000);
  const [coefficienteIndex, setCoefficienteIndex] = useState(0);
  const [primiCinqueAnni, setPrimiCinqueAnni] = useState(false);
  const [regione, setRegione] = useState('LOM');
  const isInitialMount = useRef(true);

  // URL state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const r = params.get('ral');
    if (r) setRal(parseInt(r, 10) || 35_000);
    const f = params.get('fatturato');
    if (f) setFatturato(parseInt(f, 10) || 35_000);
    const c = params.get('coeff');
    if (c) {
      const idx = COEFFICIENTI.findIndex((x) => x.value === parseFloat(c));
      if (idx >= 0) setCoefficienteIndex(idx);
    }
    if (params.get('startup') === '1') setPrimiCinqueAnni(true);
    const reg = params.get('regione');
    if (reg) setRegione(reg);
    if (window.location.search) window.history.replaceState({}, '', window.location.pathname);
    setTimeout(() => { isInitialMount.current = false; }, 0);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isInitialMount.current) return;
    const url = new URL(window.location.href);
    url.searchParams.set('ral', String(ral));
    url.searchParams.set('fatturato', String(fatturato));
    url.searchParams.set('coeff', String(COEFFICIENTI[coefficienteIndex].value));
    url.searchParams.set('regione', regione);
    if (primiCinqueAnni) url.searchParams.set('startup', '1');
    else url.searchParams.delete('startup');
    window.history.replaceState({}, '', url.toString());
  }, [ral, fatturato, coefficienteIndex, primiCinqueAnni, regione]);

  const coefficiente = COEFFICIENTI[coefficienteIndex];

  const risultati = useMemo(() => {
    if (ral <= 0 && fatturato <= 0) return null;

    const dipendente = calcolaStipendio({
      ral,
      regione,
      mensilita: 13,
    });

    const piva = calcolaForfettario({
      ricavi: fatturato,
      coefficienteRedditivita: coefficiente.value,
      primiCinqueAnni,
    });

    const tfrAnnuo = calcolaTFRAnnuo(ral);

    return { dipendente, piva, tfrAnnuo };
  }, [ral, fatturato, coefficiente.value, primiCinqueAnni, regione]);

  const differenzaNetto = risultati
    ? Math.round((risultati.dipendente.nettoAnnuo - risultati.piva.nettoAnnuo) * 100) / 100
    : 0;

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Inserisci i tuoi dati
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <CampoInput
            label="RAL dipendente"
            value={ral}
            onChange={setRal}
            min={0}
            max={300_000}
            suffix="&euro;"
            helpText="Retribuzione annua lorda come dipendente"
          />
          <CampoInput
            label="Fatturato annuo P.IVA"
            value={fatturato}
            onChange={setFatturato}
            min={0}
            max={85_000}
            suffix="&euro;"
            helpText="Ricavi annui come partita IVA (max 85.000 &euro;)"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Coefficiente di redditivita'
            </label>
            <div className="relative">
              <select
                value={coefficienteIndex}
                onChange={(e) => setCoefficienteIndex(Number(e.target.value))}
                className={[
                  'w-full appearance-none rounded-lg border bg-white dark:bg-gray-900 py-2.5 pl-3 pr-10',
                  'text-base font-medium outline-none transition-colors',
                  'text-gray-900 dark:text-gray-100',
                  'border-gray-300 dark:border-gray-600',
                  'hover:border-gray-400 dark:hover:border-gray-500',
                  'focus:border-brand focus:ring-2 focus:ring-brand/20',
                ].join(' ')}
              >
                {COEFFICIENTI.map((c, i) => (
                  <option key={i} value={i}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <SelettoreRegione value={regione} onChange={setRegione} />
        </div>

        <div className="mt-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Primi 5 anni di attivita' (P.IVA)?
            </label>
            <button
              type="button"
              onClick={() => setPrimiCinqueAnni(!primiCinqueAnni)}
              className={[
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2',
                primiCinqueAnni ? 'bg-brand' : 'bg-gray-200 dark:bg-gray-700',
              ].join(' ')}
              role="switch"
              aria-checked={primiCinqueAnni}
            >
              <span
                className={[
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  primiCinqueAnni ? 'translate-x-5' : 'translate-x-0',
                ].join(' ')}
              />
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {primiCinqueAnni ? 'Aliquota agevolata 5%' : 'Aliquota ordinaria 15%'}
            </p>
          </div>
        </div>
      </div>

      {fatturato > 85_000 && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-5">
          <div className="flex gap-3">
            <svg className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-400">
              Attenzione: il limite di fatturato per il regime forfettario e' di <strong>85.000 &euro;</strong> annui.
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {risultati && (
        <>
          {/* Hero comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dipendente card */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                  </svg>
                </span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dipendente</h3>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Netto annuo
              </p>
              <p className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 tracking-tight leading-tight">
                {formatCurrency(risultati.dipendente.nettoAnnuo)}
              </p>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                {formatCurrency(risultati.dipendente.nettoMensile)}/mese &times; 13
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                  RAL {formatCurrency(ral)}
                </span>
                <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Tassazione eff. {formatRate(risultati.dipendente.aliquotaMedia)}
                </span>
              </div>
            </div>

            {/* P.IVA card */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30">
                  <svg className="h-4 w-4 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M1 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4Zm12 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM4 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm13-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM1.75 14.5a.75.75 0 0 0 0 1.5c4.417 0 8.693.603 12.749 1.73 1.111.309 2.251-.512 2.251-1.696v-.784a.75.75 0 0 0-1.5 0v.784a.272.272 0 0 1-.35.25A49.043 49.043 0 0 0 1.75 14.5Z" clipRule="evenodd" />
                  </svg>
                </span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Partita IVA</h3>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Netto annuo
              </p>
              <p className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400 tracking-tight leading-tight">
                {formatCurrency(risultati.piva.nettoAnnuo)}
              </p>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                {formatCurrency(risultati.piva.nettoMensile)}/mese &times; 12
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                  Fatturato {formatCurrency(fatturato)}
                </span>
                <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Tassazione eff. {formatRate(risultati.piva.percentualeTassazione)}
                </span>
              </div>
            </div>
          </div>

          {/* Difference banner */}
          <div className={[
            'rounded-xl border p-5',
            differenzaNetto > 0
              ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
              : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20',
          ].join(' ')}>
            <p className={[
              'text-sm font-semibold',
              differenzaNetto > 0
                ? 'text-blue-800 dark:text-blue-300'
                : 'text-green-800 dark:text-green-300',
            ].join(' ')}>
              A parita' di importi (RAL {formatCurrency(ral)} vs Fatturato {formatCurrency(fatturato)}):
            </p>
            <p className={[
              'mt-1 text-lg font-bold',
              differenzaNetto > 0
                ? 'text-blue-700 dark:text-blue-400'
                : 'text-green-700 dark:text-green-400',
            ].join(' ')}>
              {differenzaNetto > 0
                ? `Il dipendente guadagna ${formatCurrency(differenzaNetto)}/anno in piu' netti`
                : differenzaNetto < 0
                  ? `La P.IVA guadagna ${formatCurrency(Math.abs(differenzaNetto))}/anno in piu' netti`
                  : 'I due netti annui sono equivalenti'
              }
            </p>
          </div>

          {/* Detailed side-by-side comparison */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Confronto dettagliato
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="py-3 pr-4 text-left font-semibold text-gray-900 dark:text-white">Voce</th>
                    <th className="py-3 px-4 text-right font-semibold text-blue-600 dark:text-blue-400">Dipendente</th>
                    <th className="py-3 pl-4 text-right font-semibold text-green-600 dark:text-green-400">P.IVA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">Lordo / Fatturato</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(ral)}</td>
                    <td className="py-3 pl-4 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(fatturato)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">Contributi previdenziali</td>
                    <td className="py-3 px-4 text-right text-red-600 dark:text-red-400">- {formatCurrency(risultati.dipendente.contributiINPS)}</td>
                    <td className="py-3 pl-4 text-right text-red-600 dark:text-red-400">- {formatCurrency(risultati.piva.contributiINPS)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">Imposte (IRPEF / Sostitutiva)</td>
                    <td className="py-3 px-4 text-right text-red-600 dark:text-red-400">- {formatCurrency(risultati.dipendente.irpefNetta + risultati.dipendente.totaleAddizionali)}</td>
                    <td className="py-3 pl-4 text-right text-red-600 dark:text-red-400">- {formatCurrency(risultati.piva.impostaSostitutiva)}</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td className="py-3 pr-4 font-semibold text-gray-900 dark:text-white">Netto annuo</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-600 dark:text-blue-400">{formatCurrency(risultati.dipendente.nettoAnnuo)}</td>
                    <td className="py-3 pl-4 text-right font-bold text-green-600 dark:text-green-400">{formatCurrency(risultati.piva.nettoAnnuo)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">Netto mensile</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(risultati.dipendente.nettoMensile)}</td>
                    <td className="py-3 pl-4 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(risultati.piva.nettoMensile)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">Tassazione effettiva</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">{formatRate(risultati.dipendente.aliquotaMedia)}</td>
                    <td className="py-3 pl-4 text-right font-medium text-gray-900 dark:text-white">{formatRate(risultati.piva.percentualeTassazione)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">Costo azienda / cliente</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(risultati.dipendente.costoAzienda)}</td>
                    <td className="py-3 pl-4 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(fatturato)}</td>
                  </tr>
                  <tr className="border-t-2 border-gray-200 dark:border-gray-700">
                    <td className="py-3 pr-4 font-semibold text-gray-900 dark:text-white" colSpan={3}>
                      Voci aggiuntive dipendente
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">TFR annuo accantonato</td>
                    <td className="py-3 px-4 text-right font-medium text-green-600 dark:text-green-400">+ {formatCurrency(risultati.tfrAnnuo)}</td>
                    <td className="py-3 pl-4 text-right text-gray-400 dark:text-gray-500">n/a</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">Tredicesima</td>
                    <td className="py-3 px-4 text-right font-medium text-green-600 dark:text-green-400">Inclusa nella RAL</td>
                    <td className="py-3 pl-4 text-right text-gray-400 dark:text-gray-500">n/a</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">Ferie retribuite</td>
                    <td className="py-3 px-4 text-right font-medium text-green-600 dark:text-green-400">~26 gg/anno</td>
                    <td className="py-3 pl-4 text-right text-gray-400 dark:text-gray-500">n/a</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">Malattia retribuita</td>
                    <td className="py-3 px-4 text-right font-medium text-green-600 dark:text-green-400">Si'</td>
                    <td className="py-3 pl-4 text-right text-gray-400 dark:text-gray-500">No</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">Maternita' / Paternita'</td>
                    <td className="py-3 px-4 text-right font-medium text-green-600 dark:text-green-400">Si' (retribuita)</td>
                    <td className="py-3 pl-4 text-right text-gray-400 dark:text-gray-500">Solo INPS gestione separata</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">Contributi datore INPS</td>
                    <td className="py-3 px-4 text-right font-medium text-green-600 dark:text-green-400">+ {formatCurrency(risultati.dipendente.contributiINPSDatore)}</td>
                    <td className="py-3 pl-4 text-right text-gray-400 dark:text-gray-500">n/a</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual bar charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Dipendente: composizione RAL
              </h3>
              <BarraScomposizione
                total={ral}
                items={[
                  { label: 'Netto', value: risultati.dipendente.nettoAnnuo, color: '#3b82f6' },
                  { label: 'INPS', value: risultati.dipendente.contributiINPS, color: '#8b5cf6' },
                  { label: 'IRPEF + Add.', value: risultati.dipendente.irpefNetta + risultati.dipendente.totaleAddizionali, color: '#E63946' },
                ]}
              />
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                P.IVA: composizione fatturato
              </h3>
              <BarraScomposizione
                total={fatturato}
                items={[
                  { label: 'Netto', value: risultati.piva.nettoAnnuo, color: '#22c55e' },
                  { label: 'INPS', value: risultati.piva.contributiINPS, color: '#8b5cf6' },
                  { label: 'Imposta sost.', value: risultati.piva.impostaSostitutiva, color: '#E63946' },
                ]}
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5">
            <div className="flex gap-3">
              <svg className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Attenzione: RAL e fatturato non sono la stessa cosa
                </p>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                  Un dipendente con RAL 40.000 &euro; e un freelancer con fatturato 40.000 &euro;
                  non sono equivalenti. Il dipendente riceve anche TFR, tredicesima, ferie pagate,
                  malattia e contributi del datore. Per un confronto equo, il fatturato P.IVA
                  dovrebbe essere almeno il 30&ndash;50% superiore alla RAL.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
