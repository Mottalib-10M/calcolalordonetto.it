/**
 * Italian dictionary — source of truth for all UI strings.
 * Keys follow the convention: component.element
 */
const it = {
  // ── Site-wide ──────────────────────────────────────────────────────────────
  site: {
    name: 'Calcola Lordo Netto',
    tagline: 'Dal lordo al netto in pochi secondi',
    locale: 'it-IT',
    langLabel: 'IT',
    langSwitchLabel: 'EN',
    langSwitchAriaLabel: 'Switch to English',
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    calculators: 'Calcolatori',
    workAndTaxes: 'Lavoro & Tasse',
    financeAndInvestments: 'Finanza & Investimenti',
    guides: 'Guide',
    about: 'Chi Siamo',
    openMenu: 'Apri menu',
    closeMenu: 'Chiudi menu',
  },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    calculators: 'Calcolatori',
    resources: 'Risorse',
    legal: 'Legale',
    allGuides: 'Tutte le Guide',
    contact: 'Contatti',
    legalNotice: 'Note Legali',
    privacy: 'Privacy Policy',
    cookies: 'Cookie Policy',
    terms: 'Termini di Servizio',
    disclaimer: 'I calcoli sono indicativi. Consulta un commercialista per la tua situazione specifica.',
    dataSources: 'Dati fiscali basati su normativa vigente',
    sources: 'Fonti:',
  },

  // ── Layout: CalcolatoreLayout ──────────────────────────────────────────────
  calc: {
    updatedFor: "Aggiornato per l'anno fiscale",
    by: 'Di',
    verifiedFor: 'Verificato per il',
    sources: 'Fonti',
    sourceAE: 'aliquote IRPEF, detrazioni, normativa fiscale',
    sourceINPS: 'aliquote contributive, massimali, prestazioni',
  },

  // ── Layout: GuidaLayout ────────────────────────────────────────────────────
  guide: {
    toc: 'Indice',
    tocAriaLabel: 'Indice dei contenuti',
    publishedOn: 'Pubblicato il',
    updatedOn: 'Aggiornato il',
    editorial: 'Redazione',
  },

  // ── UI components ──────────────────────────────────────────────────────────
  ui: {
    region: 'Regione',
    selectRegion: 'Seleziona regione',
    ordinaryRegions: 'Regioni ordinarie',
    autonomousRegions: 'Regioni/Province autonome',
    municipality: 'Comune',
    searchMunicipality: 'Cerca il tuo comune...',
    otherMunicipality: 'Altro comune (media',
    monthlyPayments: 'Mensilita',
    months12: '12 mensilita',
    months13: '13 mensilita',
    months14: '14 mensilita',
    months12Tip: 'Solo stipendio base',
    months13Tip: 'Con tredicesima',
    months14Tip: 'Con tredicesima e quattordicesima',
    familySituation: 'Situazione familiare',
    spouseDependent: 'Coniuge a carico',
    childrenDependent: 'Figli a carico (21+ anni)',
    removeChild: 'Riduci figli',
    addChild: 'Aggiungi figlio',
    childrenNote: "Per i figli sotto i 21 anni si applica l'Assegno Unico Universale",
    faq: 'Domande Frequenti',
    tableHeaderItem: 'Voce',
    tableHeaderAmount: 'Importo',
  },

  // ── StipendioNetto calculator ──────────────────────────────────────────────
  stipendioNetto: {
    ralLabel: 'RAL - Retribuzione Annua Lorda',
    ralHelp: 'Inserisci la tua retribuzione annua lorda (RAL) dal contratto',
    monthlyNetSalary: 'Stipendio netto mensile',
    netPerYear: 'netti/anno',
    effectiveRate: 'Aliquota effettiva:',
    onRal: 'su RAL',
    share: 'Condividi',
    copied: 'Copiato!',
    ralBreakdown: 'Scomposizione della RAL',
    annualPayslipDetail: 'Dettaglio busta paga annuale',
    additionalInfo: 'Informazioni aggiuntive',
    net: 'Netto',
    irpef: 'IRPEF',
    inps: 'INPS',
    surcharges: 'Addizionali',
    ral: 'RAL (Retribuzione Annua Lorda)',
    inpsContributions: 'Contributi INPS (9,19%)',
    taxableIncome: 'Imponibile fiscale',
    grossIrpef: 'IRPEF lorda',
    employmentDeduction: 'Detrazione lavoro dipendente',
    spouseDeduction: 'Detrazione coniuge a carico',
    childrenDeduction: 'Detrazione figli a carico',
    taxWedgeDeduction: 'Cuneo fiscale (detrazione)',
    taxWedgeExempt: 'Cuneo fiscale (somma esente)',
    netIrpef: 'IRPEF netta',
    regionalSurcharge: 'Addizionale regionale',
    municipalSurcharge: 'Addizionale comunale',
    supplementaryBenefit: 'Trattamento integrativo',
    annualNet: 'NETTO ANNUO',
    monthlyNet: 'Netto mensile (su {n} mensilita)',
    employerCost: 'Costo azienda',
    employerCostDesc: 'Costo totale per il datore di lavoro',
    annualTfr: 'TFR annuo',
    annualTfrDesc: 'Accantonamento annuo del TFR',
    averageRate: 'Aliquota media',
    averageRateDesc: 'Percentuale effettiva di tassazione',
    marginalRate: 'Aliquota marginale',
    marginalRateDesc: "Tassazione sull'ultimo euro guadagnato",
    placeholder: 'Inserisci la tua RAL per calcolare lo stipendio netto',
  },

  // ── IRPEF calculator ──────────────────────────────────────────────────────
  irpef: {
    incomeLabel: 'Reddito imponibile',
    incomeHelp: 'Inserisci il reddito complessivo annuo',
    bracketBreakdown: "Calcolo IRPEF per scaglione",
    bracket: 'Scaglione',
    rate: 'Aliquota',
    taxableBase: 'Base imponibile',
    tax: 'Imposta',
    grossIrpef: 'IRPEF lorda',
    deductionsTitle: 'Detrazioni e IRPEF netta',
    employmentDeduction: 'Detrazione lavoro dipendente',
    taxWedgeDeduction: 'Cuneo fiscale (detrazione)',
    taxWedgeExempt: 'Cuneo fiscale (somma esente)',
    netIrpef: 'IRPEF netta',
    surchargesTitle: 'Addizionali',
    regionalSurcharge: 'Addizionale regionale',
    municipalSurcharge: 'Addizionale comunale',
    supplementaryBenefit: 'Trattamento integrativo',
    totalTaxBurden: 'Carico fiscale totale',
    effectiveRate: 'Aliquota effettiva',
    effectiveRateDesc: 'Percentuale effettiva di tassazione sul reddito',
    marginalRate: 'Aliquota marginale',
    marginalRateDesc: "Aliquota applicata all'ultimo euro di reddito",
    breakdown: 'Scomposizione del reddito',
    netIncome: 'Reddito netto',
  },

  // ── StipendioLordo calculator ──────────────────────────────────────────────
  stipendioLordo: {
    netLabel: 'Stipendio netto mensile desiderato',
    netHelp: 'Inserisci il netto mensile che vuoi ottenere',
    resultTitle: 'RAL necessaria',
    grossMonthly: 'Lordo mensile',
    detail: 'Dettaglio calcolo',
  },

  // ── BustaPaga calculator ───────────────────────────────────────────────────
  bustaPaga: {
    title: 'Simulazione busta paga mensile',
    month: 'Mese',
    isTredicesima: 'Tredicesima',
    isQuattordicesima: 'Quattordicesima',
    monthlyGross: 'Lordo mensile',
    monthlyNet: 'Netto mensile',
    detail: 'Dettaglio voci busta paga',
  },

  // ── Tredicesima calculator ─────────────────────────────────────────────────
  tredicesima: {
    monthsWorked: 'Mesi lavorati',
    monthsHelp: "Mesi lavorati nell'anno corrente",
    grossTredicesima: 'Tredicesima lorda',
    netTredicesima: 'Tredicesima netta',
    detail: 'Dettaglio calcolo tredicesima',
  },

  // ── Quattordicesima calculator ─────────────────────────────────────────────
  quattordicesima: {
    monthsWorked: 'Mesi lavorati',
    monthsHelp: "Mesi lavorati nell'anno corrente (luglio a giugno)",
    grossQuattordicesima: 'Quattordicesima lorda',
    netQuattordicesima: 'Quattordicesima netta',
    detail: 'Dettaglio calcolo quattordicesima',
  },

  // ── TFR calculator ────────────────────────────────────────────────────────
  tfr: {
    yearsWorked: 'Anni di servizio',
    yearsHelp: 'Anni totali di rapporto di lavoro',
    grossTfr: 'TFR lordo',
    netTfr: 'TFR netto',
    detail: 'Dettaglio calcolo TFR',
    taxRate: 'Aliquota media di tassazione',
    separateTax: 'Tassazione separata',
  },

  // ── PagaOraria calculator ──────────────────────────────────────────────────
  pagaOraria: {
    hoursPerWeek: 'Ore settimanali',
    hoursHelp: 'Ore di lavoro previste dal contratto',
    grossHourly: 'Paga oraria lorda',
    netHourly: 'Paga oraria netta',
    detail: 'Dettaglio calcolo',
  },

  // ── CostoAziendale calculator ──────────────────────────────────────────────
  costoAziendale: {
    employerCost: 'Costo aziendale totale',
    employerContributions: 'Contributi a carico azienda',
    detail: 'Dettaglio costo aziendale',
    irap: 'IRAP',
    inail: 'INAIL',
  },

  // ── FeriePermessi calculator ───────────────────────────────────────────────
  feriePermessi: {
    contractType: 'Tipo di contratto (CCNL)',
    hoursPerDay: 'Ore giornaliere',
    vacationDays: 'Giorni di ferie annui',
    leaveHours: 'Ore di permessi annui',
    totalDaysOff: 'Giorni di assenza totali',
    dailyRate: 'Valore giornaliero',
    detail: 'Dettaglio ferie e permessi',
  },

  // ── Buonuscita calculator ──────────────────────────────────────────────────
  buonuscita: {
    monthlyGross: 'Retribuzione mensile lorda',
    yearsService: 'Anni di servizio',
    grossBuonuscita: 'Buonuscita lorda',
    netBuonuscita: 'Buonuscita netta',
    detail: 'Dettaglio calcolo buonuscita',
  },

  // ── DetrazioniFamiliari calculator ─────────────────────────────────────────
  detrazioniFamiliari: {
    title: 'Detrazioni per familiari a carico',
    spouseIncome: 'Reddito coniuge',
    childAge: 'Eta figlio',
    totalDeductions: 'Totale detrazioni',
    detail: 'Dettaglio detrazioni',
  },

  // ── Forfettari calculator ──────────────────────────────────────────────────
  forfettari: {
    revenueLabel: 'Ricavi/Compensi annui',
    revenueHelp: 'Fatturato annuo lordo',
    atecoLabel: 'Codice ATECO / Coefficiente',
    yearsActivity: 'Anni di attivita',
    substituteTax: 'Imposta sostitutiva',
    inpsContributions: 'Contributi INPS',
    netIncome: 'Reddito netto',
    detail: 'Dettaglio regime forfettario',
    taxableIncome: 'Reddito imponibile',
    rate5: 'Aliquota agevolata 5%',
    rate15: 'Aliquota ordinaria 15%',
  },

  // ── RegimeImpatriati calculator ────────────────────────────────────────────
  impatriati: {
    grossIncome: 'Reddito lordo annuo',
    exemptionRate: 'Percentuale di esenzione',
    taxableIncome: 'Reddito imponibile (dopo esenzione)',
    netIncome: 'Reddito netto',
    taxSavings: 'Risparmio fiscale',
    detail: 'Dettaglio regime impatriati',
  },

  // ── ConfrontoDipendentePIVA calculator ─────────────────────────────────────
  confronto: {
    grossAmount: 'Importo lordo annuo',
    employee: 'Dipendente',
    freelancer: 'Partita IVA (Forfettario)',
    netEmployee: 'Netto dipendente',
    netFreelancer: 'Netto P.IVA',
    difference: 'Differenza',
    detail: 'Dettaglio confronto',
  },

  // ── ComparatoreRegioni calculator ──────────────────────────────────────────
  comparatore: {
    compareTitle: 'Confronto netto per regione',
    selectRegions: 'Seleziona le regioni da confrontare',
    allRegions: 'Tutte le regioni',
    regionName: 'Regione',
    netSalary: 'Netto annuo',
    difference: 'Differenza',
    bestRegion: 'Regione migliore',
    worstRegion: 'Regione peggiore',
  },

  // ── ISEE calculator ────────────────────────────────────────────────────────
  isee: {
    iseValue: 'Valore ISE',
    iseeValue: 'Valore ISEE',
    familyMembers: 'Componenti nucleo familiare',
    income: 'Redditi complessivi',
    assets: 'Patrimonio mobiliare',
    property: 'Patrimonio immobiliare',
    detail: 'Dettaglio calcolo ISEE',
    scaleEquivalence: 'Scala di equivalenza',
  },

  // ── Mutuo calculator ───────────────────────────────────────────────────────
  mutuo: {
    loanAmount: 'Importo mutuo',
    interestRate: 'Tasso di interesse annuo',
    duration: 'Durata (anni)',
    monthlyPayment: 'Rata mensile',
    totalInterest: 'Totale interessi',
    totalCost: 'Costo totale',
    amortizationSchedule: 'Piano di ammortamento',
    year: 'Anno',
    principal: 'Capitale',
    interest: 'Interessi',
    remainingDebt: 'Debito residuo',
  },

  // ── InteresseComposto calculator ───────────────────────────────────────────
  interesseComposto: {
    initialCapital: 'Capitale iniziale',
    monthlyContribution: 'Versamento mensile',
    annualReturn: 'Rendimento annuo',
    duration: 'Durata (anni)',
    finalCapital: 'Capitale finale',
    totalContributions: 'Totale versato',
    totalInterest: 'Totale interessi generati',
    detail: 'Evoluzione del capitale',
  },

  // ── Pensione calculator ────────────────────────────────────────────────────
  pensione: {
    currentAge: 'Eta attuale',
    retirementAge: 'Eta pensionamento',
    contributionYears: 'Anni di contributi',
    estimatedPension: 'Pensione stimata (mensile)',
    replacementRate: 'Tasso di sostituzione',
    detail: 'Dettaglio calcolo pensione',
  },

  // ── FIRE calculator ────────────────────────────────────────────────────────
  fire: {
    annualExpenses: 'Spese annue',
    currentSavings: 'Risparmi attuali',
    annualSavings: 'Risparmio annuo',
    expectedReturn: 'Rendimento atteso',
    fireNumber: 'Numero FIRE',
    yearsToFire: 'Anni al FIRE',
    detail: 'Proiezione FIRE',
    withdrawalRate: 'Tasso di prelievo',
  },

  // ── TassazioneInvestimenti calculator ──────────────────────────────────────
  tassazioneInvestimenti: {
    capitalGain: 'Plusvalenza',
    investmentType: 'Tipo di investimento',
    grossReturn: 'Rendimento lordo',
    tax: 'Imposta',
    netReturn: 'Rendimento netto',
    detail: 'Dettaglio tassazione',
  },

  // ── AffittoVsAcquisto calculator ───────────────────────────────────────────
  affittoVsAcquisto: {
    propertyValue: "Valore dell'immobile",
    monthlyRent: 'Affitto mensile',
    downPayment: 'Anticipo',
    mortgageRate: 'Tasso mutuo',
    duration: 'Durata (anni)',
    buyTotal: 'Costo totale acquisto',
    rentTotal: 'Costo totale affitto',
    recommendation: 'Consiglio',
    detail: 'Dettaglio confronto',
  },

  // ── BonusRistrutturazione calculator ───────────────────────────────────────
  bonusRistrutturazione: {
    expenseAmount: 'Importo spesa',
    bonusType: 'Tipo di bonus',
    annualDeduction: 'Detrazione annua',
    totalDeduction: 'Detrazione totale',
    detail: 'Dettaglio bonus ristrutturazione',
  },

  // ── PlusvalenzaImmobiliare calculator ──────────────────────────────────────
  plusvalenza: {
    purchasePrice: 'Prezzo di acquisto',
    salePrice: 'Prezzo di vendita',
    yearsBetween: 'Anni di possesso',
    capitalGain: 'Plusvalenza',
    tax: 'Imposta sostitutiva (26%)',
    netGain: 'Guadagno netto',
    detail: 'Dettaglio plusvalenza',
  },

  // ── Budget calculator ─────────────────────────────────────────────────────
  budget: {
    monthlyIncome: 'Reddito mensile netto',
    needs: 'Necessita (50%)',
    wants: 'Desideri (30%)',
    savings: 'Risparmio (20%)',
    detail: 'Piano budget 50/30/20',
  },

  // ── Prestito calculator ────────────────────────────────────────────────────
  prestito: {
    loanAmount: 'Importo prestito',
    interestRate: 'Tasso di interesse (TAN)',
    duration: 'Durata (mesi)',
    monthlyPayment: 'Rata mensile',
    totalInterest: 'Totale interessi',
    totalCost: 'Costo totale',
    taeg: 'TAEG',
    detail: 'Dettaglio prestito',
  },

  // ── PianoAccumulo calculator ───────────────────────────────────────────────
  pianoAccumulo: {
    monthlyInvestment: 'Versamento mensile',
    annualReturn: 'Rendimento annuo atteso',
    duration: 'Durata (anni)',
    finalCapital: 'Capitale finale',
    totalInvested: 'Totale versato',
    totalReturn: 'Rendimento totale',
    detail: 'Evoluzione del PAC',
  },

  // ── Inflazione calculator ──────────────────────────────────────────────────
  inflazione: {
    amount: 'Importo',
    inflationRate: 'Tasso di inflazione annuo',
    years: 'Anni',
    futureValue: 'Valore futuro nominale',
    realValue: 'Potere di acquisto reale',
    purchasingPowerLoss: 'Perdita di potere di acquisto',
    detail: 'Impatto dell\'inflazione nel tempo',
  },

  // ── Navigation labels (used in Header/Footer for EN links) ─────────────────
  nav: {
    netSalary: 'Stipendio Netto',
    grossSalary: 'Da Netto a Lordo',
    irpef: 'Calcolo IRPEF',
    payslip: 'Busta Paga',
    regionComparison: 'Confronto Regioni',
    thirteenth: 'Tredicesima e Quattordicesima',
    tfr: 'TFR',
    hourlyRate: 'Paga Oraria',
    employerCost: 'Costo Aziendale',
    leaveCalc: 'Ferie e Permessi',
    severance: 'Buonuscita',
    familyDeductions: 'Detrazioni Familiari',
    flatRate: 'Forfettari',
    impatriati: 'Regime Impatriati',
    employeeVsFreelancer: 'Dipendente vs P.IVA',
    isee: 'ISEE',
    mortgage: 'Mutuo',
    compoundInterest: 'Interesse Composto',
    pension: 'Pensione',
    fire: 'FIRE',
    investmentTax: 'Tassazione Investimenti',
    rentVsBuy: 'Affitto vs Acquisto',
    renovationBonus: 'Bonus Ristrutturazione',
    propertyGains: 'Plusvalenza Immobiliare',
    budget: 'Budget 50/30/20',
    loan: 'Prestito',
    savingsPlan: 'Piano Accumulo',
    inflation: 'Inflazione',
    salaryGuide: 'Guida allo Stipendio',
    irpefBrackets: 'Scaglioni IRPEF 2026',
    taxWedge: 'Cuneo Fiscale 2026',
    payslipGuide: 'Busta Paga',
    flatRateGuide: 'Regime Forfettario',
  },
};

/** Recursive string-keyed structure */
type StringRecord = { [key: string]: string | StringRecord };
export type Dictionary = { [K in keyof typeof it]: typeof it[K] extends string ? string : { [J in keyof typeof it[K]]: string } };
export default it;
