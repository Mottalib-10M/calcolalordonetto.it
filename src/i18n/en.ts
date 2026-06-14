/**
 * English dictionary — translations for expats in Italy.
 * Italian fiscal terms are kept with English explanations in parentheses.
 */
import type { Dictionary } from './it';

const en: Dictionary = {
  // ── Site-wide ──────────────────────────────────────────────────────────────
  site: {
    name: 'Calcola Lordo Netto',
    tagline: 'From gross to net in seconds',
    locale: 'en-US',
    langLabel: 'EN',
    langSwitchLabel: 'IT',
    langSwitchAriaLabel: 'Passa all\'italiano',
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    calculators: 'Calculators',
    workAndTaxes: 'Work & Taxes',
    financeAndInvestments: 'Finance & Investments',
    guides: 'Guides',
    about: 'About',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    calculators: 'Calculators',
    resources: 'Resources',
    legal: 'Legal',
    allGuides: 'All Guides',
    contact: 'Contact',
    legalNotice: 'Legal Notice',
    privacy: 'Privacy Policy',
    cookies: 'Cookie Policy',
    terms: 'Terms of Service',
    disclaimer: 'Calculations are indicative. Consult a commercialista (tax advisor) for your specific situation.',
    dataSources: 'Tax data based on current legislation',
    sources: 'Sources:',
  },

  // ── Layout: CalcolatoreLayout ──────────────────────────────────────────────
  calc: {
    updatedFor: 'Updated for fiscal year',
    sources: 'Sources',
    sourceAE: 'IRPEF rates, deductions, tax legislation',
    sourceINPS: 'contribution rates, ceilings, benefits',
  },

  // ── Layout: GuidaLayout ────────────────────────────────────────────────────
  guide: {
    toc: 'Contents',
    tocAriaLabel: 'Table of contents',
    publishedOn: 'Published on',
    updatedOn: 'Updated on',
    editorial: 'Editorial team',
  },

  // ── UI components ──────────────────────────────────────────────────────────
  ui: {
    region: 'Region',
    selectRegion: 'Select region',
    ordinaryRegions: 'Ordinary regions',
    autonomousRegions: 'Autonomous regions/provinces',
    municipality: 'Municipality',
    searchMunicipality: 'Search your municipality...',
    otherMunicipality: 'Other municipality (average',
    monthlyPayments: 'Pay periods',
    months12: '12 months',
    months13: '13 months',
    months14: '14 months',
    months12Tip: 'Base salary only',
    months13Tip: 'With tredicesima (13th-month bonus)',
    months14Tip: 'With tredicesima and quattordicesima (13th & 14th-month bonus)',
    familySituation: 'Family situation',
    spouseDependent: 'Dependent spouse',
    childrenDependent: 'Dependent children (21+ years)',
    removeChild: 'Remove child',
    addChild: 'Add child',
    childrenNote: 'For children under 21, the Assegno Unico Universale (universal child benefit) applies',
    faq: 'Frequently Asked Questions',
    tableHeaderItem: 'Item',
    tableHeaderAmount: 'Amount',
  },

  // ── StipendioNetto calculator ──────────────────────────────────────────────
  stipendioNetto: {
    ralLabel: 'RAL - Gross Annual Salary',
    ralHelp: 'Enter your gross annual salary (RAL) from your contract',
    monthlyNetSalary: 'Monthly net salary',
    netPerYear: 'net/year',
    effectiveRate: 'Effective tax rate:',
    onRal: 'on RAL',
    share: 'Share',
    copied: 'Copied!',
    ralBreakdown: 'RAL breakdown',
    annualPayslipDetail: 'Annual payslip breakdown',
    additionalInfo: 'Additional information',
    net: 'Net',
    irpef: 'IRPEF',
    inps: 'INPS',
    surcharges: 'Surcharges',
    ral: 'RAL (Gross Annual Salary)',
    inpsContributions: 'INPS contributions (9.19%)',
    taxableIncome: 'Taxable income',
    grossIrpef: 'Gross IRPEF',
    employmentDeduction: 'Employment income deduction',
    spouseDeduction: 'Spouse deduction',
    childrenDeduction: 'Children deduction',
    taxWedgeDeduction: 'Tax wedge (deduction)',
    taxWedgeExempt: 'Tax wedge (exempt amount)',
    netIrpef: 'Net IRPEF',
    regionalSurcharge: 'Regional surcharge',
    municipalSurcharge: 'Municipal surcharge',
    supplementaryBenefit: 'Trattamento integrativo (supplementary benefit)',
    annualNet: 'ANNUAL NET',
    monthlyNet: 'Monthly net ({n} pay periods)',
    employerCost: 'Employer cost',
    employerCostDesc: 'Total cost to employer',
    annualTfr: 'Annual TFR',
    annualTfrDesc: 'Annual TFR (severance pay) accrual',
    averageRate: 'Average rate',
    averageRateDesc: 'Effective tax rate',
    marginalRate: 'Marginal rate',
    marginalRateDesc: 'Tax rate on the last euro earned',
    placeholder: 'Enter your RAL to calculate your net salary',
  },

  // ── IRPEF calculator ──────────────────────────────────────────────────────
  irpef: {
    incomeLabel: 'Taxable income',
    incomeHelp: 'Enter your total annual income',
    bracketBreakdown: 'IRPEF calculation by bracket',
    bracket: 'Bracket',
    rate: 'Rate',
    taxableBase: 'Taxable base',
    tax: 'Tax',
    grossIrpef: 'Gross IRPEF',
    deductionsTitle: 'Deductions and net IRPEF',
    employmentDeduction: 'Employment income deduction',
    taxWedgeDeduction: 'Tax wedge (deduction)',
    taxWedgeExempt: 'Tax wedge (exempt amount)',
    netIrpef: 'Net IRPEF',
    surchargesTitle: 'Surcharges',
    regionalSurcharge: 'Regional surcharge',
    municipalSurcharge: 'Municipal surcharge',
    supplementaryBenefit: 'Trattamento integrativo (supplementary benefit)',
    totalTaxBurden: 'Total tax burden',
    effectiveRate: 'Effective rate',
    effectiveRateDesc: 'Effective tax rate on income',
    marginalRate: 'Marginal rate',
    marginalRateDesc: 'Rate applied to the last euro of income',
    breakdown: 'Income breakdown',
    netIncome: 'Net income',
  },

  // ── StipendioLordo calculator ──────────────────────────────────────────────
  stipendioLordo: {
    netLabel: 'Desired monthly net salary',
    netHelp: 'Enter the monthly net you want to take home',
    resultTitle: 'Required RAL',
    grossMonthly: 'Monthly gross',
    detail: 'Calculation details',
  },

  // ── BustaPaga calculator ───────────────────────────────────────────────────
  bustaPaga: {
    title: 'Monthly payslip simulation',
    month: 'Month',
    isTredicesima: 'Tredicesima (13th month)',
    isQuattordicesima: 'Quattordicesima (14th month)',
    monthlyGross: 'Monthly gross',
    monthlyNet: 'Monthly net',
    detail: 'Payslip line items',
  },

  // ── Tredicesima calculator ─────────────────────────────────────────────────
  tredicesima: {
    monthsWorked: 'Months worked',
    monthsHelp: 'Months worked in the current year',
    grossTredicesima: 'Gross tredicesima',
    netTredicesima: 'Net tredicesima',
    detail: 'Tredicesima calculation details',
  },

  // ── Quattordicesima calculator ─────────────────────────────────────────────
  quattordicesima: {
    monthsWorked: 'Months worked',
    monthsHelp: 'Months worked in the current year (July to June)',
    grossQuattordicesima: 'Gross quattordicesima',
    netQuattordicesima: 'Net quattordicesima',
    detail: 'Quattordicesima calculation details',
  },

  // ── TFR calculator ────────────────────────────────────────────────────────
  tfr: {
    yearsWorked: 'Years of service',
    yearsHelp: 'Total years of employment',
    grossTfr: 'Gross TFR (severance)',
    netTfr: 'Net TFR',
    detail: 'TFR calculation details',
    taxRate: 'Average tax rate',
    separateTax: 'Separate taxation',
  },

  // ── PagaOraria calculator ──────────────────────────────────────────────────
  pagaOraria: {
    hoursPerWeek: 'Hours per week',
    hoursHelp: 'Weekly work hours per contract',
    grossHourly: 'Gross hourly rate',
    netHourly: 'Net hourly rate',
    detail: 'Calculation details',
  },

  // ── CostoAziendale calculator ──────────────────────────────────────────────
  costoAziendale: {
    employerCost: 'Total employer cost',
    employerContributions: 'Employer contributions',
    detail: 'Employer cost breakdown',
    irap: 'IRAP',
    inail: 'INAIL',
  },

  // ── FeriePermessi calculator ───────────────────────────────────────────────
  feriePermessi: {
    contractType: 'Contract type (CCNL)',
    hoursPerDay: 'Hours per day',
    vacationDays: 'Annual vacation days',
    leaveHours: 'Annual leave hours',
    totalDaysOff: 'Total days off',
    dailyRate: 'Daily rate',
    detail: 'Leave and vacation details',
  },

  // ── Buonuscita calculator ──────────────────────────────────────────────────
  buonuscita: {
    monthlyGross: 'Monthly gross salary',
    yearsService: 'Years of service',
    grossBuonuscita: 'Gross buonuscita (public sector severance)',
    netBuonuscita: 'Net buonuscita',
    detail: 'Buonuscita calculation details',
  },

  // ── DetrazioniFamiliari calculator ─────────────────────────────────────────
  detrazioniFamiliari: {
    title: 'Family dependent deductions',
    spouseIncome: 'Spouse income',
    childAge: 'Child age',
    totalDeductions: 'Total deductions',
    detail: 'Deduction details',
  },

  // ── Forfettari calculator ──────────────────────────────────────────────────
  forfettari: {
    revenueLabel: 'Annual revenue',
    revenueHelp: 'Gross annual turnover',
    atecoLabel: 'ATECO code / Coefficient',
    yearsActivity: 'Years of activity',
    substituteTax: 'Substitute tax (imposta sostitutiva)',
    inpsContributions: 'INPS contributions',
    netIncome: 'Net income',
    detail: 'Flat-rate regime details',
    taxableIncome: 'Taxable income',
    rate5: 'Reduced rate 5%',
    rate15: 'Standard rate 15%',
  },

  // ── RegimeImpatriati calculator ────────────────────────────────────────────
  impatriati: {
    grossIncome: 'Gross annual income',
    exemptionRate: 'Exemption percentage',
    taxableIncome: 'Taxable income (after exemption)',
    netIncome: 'Net income',
    taxSavings: 'Tax savings',
    detail: 'Impatriati regime details',
  },

  // ── ConfrontoDipendentePIVA calculator ─────────────────────────────────────
  confronto: {
    grossAmount: 'Gross annual amount',
    employee: 'Employee',
    freelancer: 'Freelancer (Flat-rate regime)',
    netEmployee: 'Net (employee)',
    netFreelancer: 'Net (freelancer)',
    difference: 'Difference',
    detail: 'Comparison details',
  },

  // ── ComparatoreRegioni calculator ──────────────────────────────────────────
  comparatore: {
    compareTitle: 'Net salary comparison by region',
    selectRegions: 'Select regions to compare',
    allRegions: 'All regions',
    regionName: 'Region',
    netSalary: 'Annual net',
    difference: 'Difference',
    bestRegion: 'Best region',
    worstRegion: 'Worst region',
  },

  // ── ISEE calculator ────────────────────────────────────────────────────────
  isee: {
    iseValue: 'ISE value',
    iseeValue: 'ISEE value',
    familyMembers: 'Family members',
    income: 'Total income',
    assets: 'Financial assets',
    property: 'Real estate assets',
    detail: 'ISEE calculation details',
    scaleEquivalence: 'Equivalence scale',
  },

  // ── Mutuo calculator ───────────────────────────────────────────────────────
  mutuo: {
    loanAmount: 'Mortgage amount',
    interestRate: 'Annual interest rate',
    duration: 'Duration (years)',
    monthlyPayment: 'Monthly payment',
    totalInterest: 'Total interest',
    totalCost: 'Total cost',
    amortizationSchedule: 'Amortization schedule',
    year: 'Year',
    principal: 'Principal',
    interest: 'Interest',
    remainingDebt: 'Remaining balance',
  },

  // ── InteresseComposto calculator ───────────────────────────────────────────
  interesseComposto: {
    initialCapital: 'Initial capital',
    monthlyContribution: 'Monthly contribution',
    annualReturn: 'Annual return',
    duration: 'Duration (years)',
    finalCapital: 'Final capital',
    totalContributions: 'Total contributions',
    totalInterest: 'Total interest earned',
    detail: 'Capital growth',
  },

  // ── Pensione calculator ────────────────────────────────────────────────────
  pensione: {
    currentAge: 'Current age',
    retirementAge: 'Retirement age',
    contributionYears: 'Years of contributions',
    estimatedPension: 'Estimated pension (monthly)',
    replacementRate: 'Replacement rate',
    detail: 'Pension calculation details',
  },

  // ── FIRE calculator ────────────────────────────────────────────────────────
  fire: {
    annualExpenses: 'Annual expenses',
    currentSavings: 'Current savings',
    annualSavings: 'Annual savings',
    expectedReturn: 'Expected return',
    fireNumber: 'FIRE number',
    yearsToFire: 'Years to FIRE',
    detail: 'FIRE projection',
    withdrawalRate: 'Withdrawal rate',
  },

  // ── TassazioneInvestimenti calculator ──────────────────────────────────────
  tassazioneInvestimenti: {
    capitalGain: 'Capital gain',
    investmentType: 'Investment type',
    grossReturn: 'Gross return',
    tax: 'Tax',
    netReturn: 'Net return',
    detail: 'Tax details',
  },

  // ── AffittoVsAcquisto calculator ───────────────────────────────────────────
  affittoVsAcquisto: {
    propertyValue: 'Property value',
    monthlyRent: 'Monthly rent',
    downPayment: 'Down payment',
    mortgageRate: 'Mortgage rate',
    duration: 'Duration (years)',
    buyTotal: 'Total cost to buy',
    rentTotal: 'Total cost to rent',
    recommendation: 'Recommendation',
    detail: 'Comparison details',
  },

  // ── BonusRistrutturazione calculator ───────────────────────────────────────
  bonusRistrutturazione: {
    expenseAmount: 'Expense amount',
    bonusType: 'Bonus type',
    annualDeduction: 'Annual deduction',
    totalDeduction: 'Total deduction',
    detail: 'Renovation bonus details',
  },

  // ── PlusvalenzaImmobiliare calculator ──────────────────────────────────────
  plusvalenza: {
    purchasePrice: 'Purchase price',
    salePrice: 'Sale price',
    yearsBetween: 'Years owned',
    capitalGain: 'Capital gain',
    tax: 'Substitute tax (26%)',
    netGain: 'Net gain',
    detail: 'Capital gains details',
  },

  // ── Budget calculator ─────────────────────────────────────────────────────
  budget: {
    monthlyIncome: 'Monthly net income',
    needs: 'Needs (50%)',
    wants: 'Wants (30%)',
    savings: 'Savings (20%)',
    detail: '50/30/20 budget plan',
  },

  // ── Prestito calculator ────────────────────────────────────────────────────
  prestito: {
    loanAmount: 'Loan amount',
    interestRate: 'Interest rate (TAN)',
    duration: 'Duration (months)',
    monthlyPayment: 'Monthly payment',
    totalInterest: 'Total interest',
    totalCost: 'Total cost',
    taeg: 'APR (TAEG)',
    detail: 'Loan details',
  },

  // ── PianoAccumulo calculator ───────────────────────────────────────────────
  pianoAccumulo: {
    monthlyInvestment: 'Monthly investment',
    annualReturn: 'Expected annual return',
    duration: 'Duration (years)',
    finalCapital: 'Final capital',
    totalInvested: 'Total invested',
    totalReturn: 'Total return',
    detail: 'Savings plan evolution',
  },

  // ── Inflazione calculator ──────────────────────────────────────────────────
  inflazione: {
    amount: 'Amount',
    inflationRate: 'Annual inflation rate',
    years: 'Years',
    futureValue: 'Future nominal value',
    realValue: 'Real purchasing power',
    purchasingPowerLoss: 'Purchasing power loss',
    detail: 'Inflation impact over time',
  },

  // ── Navigation labels ──────────────────────────────────────────────────────
  nav: {
    netSalary: 'Net Salary',
    grossSalary: 'Gross Salary',
    irpef: 'IRPEF Calculator',
    payslip: 'Payslip',
    regionComparison: 'Region Comparison',
    thirteenth: '13th & 14th Month',
    tfr: 'TFR (Severance)',
    hourlyRate: 'Hourly Rate',
    employerCost: 'Employer Cost',
    leaveCalc: 'Leave & Vacation',
    severance: 'Public Sector Severance',
    familyDeductions: 'Family Deductions',
    flatRate: 'Flat-Rate Regime',
    impatriati: 'Impatriati Regime',
    employeeVsFreelancer: 'Employee vs Freelancer',
    isee: 'ISEE',
    mortgage: 'Mortgage',
    compoundInterest: 'Compound Interest',
    pension: 'Pension',
    fire: 'FIRE',
    investmentTax: 'Investment Tax',
    rentVsBuy: 'Rent vs Buy',
    renovationBonus: 'Renovation Bonus',
    propertyGains: 'Property Capital Gains',
    budget: 'Budget 50/30/20',
    loan: 'Loan',
    savingsPlan: 'Savings Plan',
    inflation: 'Inflation',
    salaryGuide: 'Salary Guide',
    irpefBrackets: 'IRPEF Brackets 2026',
    taxWedge: 'Tax Wedge 2026',
    payslipGuide: 'Payslip Guide',
    flatRateGuide: 'Flat-Rate Regime',
  },
} satisfies Dictionary;

export default en;
