import { useState, useMemo } from 'react';
import CampoInput from '../ui/CampoInput';
import { calcolaPensione } from '../../lib/finanz-engine';
import { formatCurrency, formatPercent, formatNumber } from '../../lib/format-it';

export default function Pensione() {
  const [etaAttuale, setEtaAttuale] = useState(35);
  const [etaPensionamento, setEtaPensionamento] = useState(67);
  const [ralAttuale, setRalAttuale] = useState(35000);
  const [crescitaRALPercent, setCrescitaRALPercent] = useState(2);
  const [anniContributi, setAnniContributi] = useState(10);
  const [tabellaAperta, setTabellaAperta] = useState(false);

  const risultato = useMemo(
    () =>
      calcolaPensione({
        etaAttuale,
        etaPensionamento,
        ralAttuale,
        crescitaRALAnnua: crescitaRALPercent / 100,
        anniContributiVersati: anniContributi,
        montanteAccumulato: 0, // will be estimated
        aliquotaContributiva: 0.33,
      }),
    [etaAttuale, etaPensionamento, ralAttuale, crescitaRALPercent, anniContributi],
  );

  // Max montante for chart scaling
  const maxMontante = useMemo(
    () => Math.max(...risultato.evoluzioneMontante.map((e) => e.montante), 1),
    [risultato],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* ── Left column: Inputs ── */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            I tuoi dati previdenziali
          </h2>

          <div className="space-y-4">
            <CampoInput
              label="Eta' attuale"
              value={etaAttuale}
              onChange={(v) => setEtaAttuale(Math.round(v))}
              min={18}
              max={70}
              step={1}
              suffix="anni"
            />

            <CampoInput
              label="Eta' pensionamento"
              value={etaPensionamento}
              onChange={(v) => setEtaPensionamento(Math.round(v))}
              min={57}
              max={71}
              step={1}
              suffix="anni"
              helpText="Requisito pensione di vecchiaia: 67 anni"
            />

            <CampoInput
              label="RAL attuale (lordo annuo)"
              value={ralAttuale}
              onChange={setRalAttuale}
              min={8000}
              max={300000}
              step={500}
              prefix="€"
              helpText="Retribuzione Annua Lorda"
            />

            <CampoInput
              label="Crescita RAL annua"
              value={crescitaRALPercent}
              onChange={setCrescitaRALPercent}
              min={0}
              max={10}
              step={0.5}
              suffix="%"
              helpText="Aumento medio annuo previsto dello stipendio"
            />

            <CampoInput
              label="Anni di contributi gia' versati"
              value={anniContributi}
              onChange={(v) => setAnniContributi(Math.round(v))}
              min={0}
              max={50}
              step={1}
              suffix="anni"
              helpText="Anni di lavoro con contributi INPS gia' versati"
            />
          </div>

          <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-xs text-amber-700 dark:text-amber-300">
            <strong>Nota:</strong> stima basata su ipotesi semplificative (sistema contributivo puro,
            rivalutazione PIL 1,5%, aliquota contributiva 33%). Il risultato reale puo' variare
            in base a molti fattori. Per una stima ufficiale consulta il servizio "La mia pensione futura" su inps.it.
          </div>
        </div>
      </div>

      {/* ── Right column: Results ── */}
      <div className="space-y-6">
        {/* Pensione prominente */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 sm:p-8">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Pensione netta mensile stimata
          </p>
          <p className="text-4xl sm:text-5xl font-bold text-brand tracking-tight leading-tight">
            {formatCurrency(risultato.pensioneMensileNetta)}
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            su 13 mensilita' — a {etaPensionamento} anni
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-5">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pensione lorda mensile</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(risultato.pensioneMensileLorda)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tasso di sostituzione</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatPercent(risultato.tassoSostituzione)}
              </p>
            </div>
          </div>
        </div>

        {/* Dettaglio calcolo */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Dettaglio del calcolo
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Montante contributivo finale</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(risultato.montanteFinale)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">
                Coefficiente di trasformazione ({etaPensionamento} anni)
              </dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {formatPercent(risultato.coefficienteTrasformazione)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
              <dt className="text-gray-500 dark:text-gray-400">Pensione annua lorda</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(risultato.pensioneAnnuaLorda)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Pensione annua netta (stima)</dt>
              <dd className="font-bold text-green-600 dark:text-green-400">
                {formatCurrency(risultato.pensioneAnnuaNetta)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
              <dt className="text-gray-500 dark:text-gray-400">Anni di contribuzione totali</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {risultato.anniContribuzioneFinali} anni
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Tasso di sostituzione</dt>
              <dd className={`font-bold ${risultato.tassoSostituzione < 0.5 ? 'text-red-600 dark:text-red-400' : risultato.tassoSostituzione < 0.65 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                {formatPercent(risultato.tassoSostituzione)}
              </dd>
            </div>
          </dl>

          {risultato.tassoSostituzione < 0.6 && (
            <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-xs text-red-700 dark:text-red-300">
              Il tasso di sostituzione e' inferiore al 60%. Valuta l'adesione a un fondo pensione
              complementare per integrare la pensione pubblica.
            </div>
          )}
        </div>

        {/* Chart: evoluzione montante */}
        {risultato.evoluzioneMontante.length > 0 && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Crescita del montante contributivo
            </h3>
            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {risultato.evoluzioneMontante.map((e) => {
                const pct = ((e.montante / maxMontante) * 100).toFixed(1);
                return (
                  <div key={e.anno} className="flex items-center gap-2 text-xs">
                    <span className="w-8 text-right text-gray-500 dark:text-gray-400 shrink-0">
                      {e.eta}
                    </span>
                    <div className="flex flex-1 h-4 rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <div
                        className="bg-brand transition-all duration-300"
                        style={{ width: pct + '%' }}
                        title={`Montante: ${formatCurrency(e.montante)}`}
                      />
                    </div>
                    <span className="w-24 text-right text-gray-700 dark:text-gray-300 shrink-0">
                      {formatCurrency(e.montante)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand" />
                Montante contributivo
              </span>
              <span>Eta' mostrata sull'asse verticale</span>
            </div>
          </div>
        )}

        {/* Tabella evoluzione collapsible */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <button
            type="button"
            onClick={() => setTabellaAperta(!tabellaAperta)}
            className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 dark:text-white"
          >
            Tabella evoluzione annuale
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

          {tabellaAperta && risultato.evoluzioneMontante.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                    <th className="pb-2 pr-3 font-medium">Eta'</th>
                    <th className="pb-2 pr-3 font-medium text-right">RAL</th>
                    <th className="pb-2 pr-3 font-medium text-right">Contributo annuo</th>
                    <th className="pb-2 font-medium text-right">Montante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {risultato.evoluzioneMontante
                    .filter((_, i) => i % Math.max(1, Math.floor(risultato.evoluzioneMontante.length / 20)) === 0 || i === risultato.evoluzioneMontante.length - 1)
                    .map((e) => (
                    <tr key={e.anno} className="text-gray-700 dark:text-gray-300">
                      <td className="py-1.5 pr-3">{e.eta}</td>
                      <td className="py-1.5 pr-3 text-right">{formatCurrency(e.ral)}</td>
                      <td className="py-1.5 pr-3 text-right text-brand">
                        {formatCurrency(e.ral * 0.33)}
                      </td>
                      <td className="py-1.5 text-right font-medium">{formatCurrency(e.montante)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Coefficienti di trasformazione reference */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Coefficienti di trasformazione (2024-2025)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                  <th className="pb-2 pr-3 font-medium">Eta'</th>
                  <th className="pb-2 font-medium text-right">Coefficiente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {[57,58,59,60,61,62,63,64,65,66,67,68,69,70,71].map((eta) => {
                  const coeff: Record<number, number> = {57:4.270,58:4.382,59:4.504,60:4.636,61:4.781,62:4.940,63:5.115,64:5.308,65:5.523,66:5.723,67:5.931,68:6.154,69:6.395,70:6.655,71:6.938};
                  const isSelected = eta === etaPensionamento;
                  return (
                    <tr key={eta} className={isSelected ? 'bg-brand/5 dark:bg-brand/10 font-bold text-brand' : 'text-gray-700 dark:text-gray-300'}>
                      <td className="py-1 pr-3">{eta} anni</td>
                      <td className="py-1 text-right">{formatNumber(coeff[eta], 3)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Fonte: Decreto MEF 20 novembre 2023, Gazzetta Ufficiale.
          </p>
        </div>
      </div>
    </div>
  );
}
