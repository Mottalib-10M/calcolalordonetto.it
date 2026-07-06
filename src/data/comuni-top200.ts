/**
 * Top Italian comuni by population with 2026 addizionale comunale IRPEF rates.
 *
 * Rates are sourced from delibere comunali where available; otherwise the
 * national average of 0.8 % is used as a fallback.  Sorted by population
 * (largest first, ISTAT 2024 data).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Comune {
  nome: string;
  slug: string;
  provincia: string; // abbreviation: "RM", "MI", "NA" …
  regione: string; // region code matching regioni.ts
  aliquota: number; // addizionale comunale rate (e.g. 0.008 = 0.8 %)
}

// ---------------------------------------------------------------------------
// National average
// ---------------------------------------------------------------------------

export const ADDIZIONALE_COMUNALE_MEDIA = 0.008; // 0.8 %

// ---------------------------------------------------------------------------
// Comuni list – top 120 by population
// ---------------------------------------------------------------------------

export const COMUNI: Comune[] = [
  // 1
  { nome: 'Roma', slug: 'roma', provincia: 'RM', regione: 'lazio', aliquota: 0.009 },
  // 2
  { nome: 'Milano', slug: 'milano', provincia: 'MI', regione: 'lombardia', aliquota: 0.008 },
  // 3
  { nome: 'Napoli', slug: 'napoli', provincia: 'NA', regione: 'campania', aliquota: 0.009 },
  // 4
  { nome: 'Torino', slug: 'torino', provincia: 'TO', regione: 'piemonte', aliquota: 0.008 },
  // 5
  { nome: 'Palermo', slug: 'palermo', provincia: 'PA', regione: 'sicilia', aliquota: 0.008 },
  // 6
  { nome: 'Genova', slug: 'genova', provincia: 'GE', regione: 'liguria', aliquota: 0.008 },
  // 7
  { nome: 'Bologna', slug: 'bologna', provincia: 'BO', regione: 'emilia-romagna', aliquota: 0.008 },
  // 8
  { nome: 'Firenze', slug: 'firenze', provincia: 'FI', regione: 'toscana', aliquota: 0.003 },
  // 9
  { nome: 'Bari', slug: 'bari', provincia: 'BA', regione: 'puglia', aliquota: 0.008 },
  // 10
  { nome: 'Catania', slug: 'catania', provincia: 'CT', regione: 'sicilia', aliquota: 0.008 },
  // 11
  { nome: 'Venezia', slug: 'venezia', provincia: 'VE', regione: 'veneto', aliquota: 0.008 },
  // 12
  { nome: 'Verona', slug: 'verona', provincia: 'VR', regione: 'veneto', aliquota: 0.008 },
  // 13
  { nome: 'Messina', slug: 'messina', provincia: 'ME', regione: 'sicilia', aliquota: 0.008 },
  // 14
  { nome: 'Padova', slug: 'padova', provincia: 'PD', regione: 'veneto', aliquota: 0.006 },
  // 15
  { nome: 'Trieste', slug: 'trieste', provincia: 'TS', regione: 'friuli-venezia-giulia', aliquota: 0.008 },
  // 16
  { nome: 'Taranto', slug: 'taranto', provincia: 'TA', regione: 'puglia', aliquota: 0.008 },
  // 17
  { nome: 'Brescia', slug: 'brescia', provincia: 'BS', regione: 'lombardia', aliquota: 0.007 },
  // 18
  { nome: 'Prato', slug: 'prato', provincia: 'PO', regione: 'toscana', aliquota: 0.003 },
  // 19
  { nome: 'Reggio Calabria', slug: 'reggio-calabria', provincia: 'RC', regione: 'calabria', aliquota: 0.008 },
  // 20
  { nome: 'Modena', slug: 'modena', provincia: 'MO', regione: 'emilia-romagna', aliquota: 0.007 },
  // 21
  { nome: 'Parma', slug: 'parma', provincia: 'PR', regione: 'emilia-romagna', aliquota: 0.007 },
  // 22
  { nome: 'Reggio Emilia', slug: 'reggio-emilia', provincia: 'RE', regione: 'emilia-romagna', aliquota: 0.006 },
  // 23
  { nome: 'Perugia', slug: 'perugia', provincia: 'PG', regione: 'umbria', aliquota: 0.008 },
  // 24
  { nome: 'Livorno', slug: 'livorno', provincia: 'LI', regione: 'toscana', aliquota: 0.007 },
  // 25
  { nome: 'Ravenna', slug: 'ravenna', provincia: 'RA', regione: 'emilia-romagna', aliquota: 0.007 },
  // 26
  { nome: 'Cagliari', slug: 'cagliari', provincia: 'CA', regione: 'sardegna', aliquota: 0.006 },
  // 27
  { nome: 'Foggia', slug: 'foggia', provincia: 'FG', regione: 'puglia', aliquota: 0.008 },
  // 28
  { nome: 'Rimini', slug: 'rimini', provincia: 'RN', regione: 'emilia-romagna', aliquota: 0.008 },
  // 29
  { nome: 'Salerno', slug: 'salerno', provincia: 'SA', regione: 'campania', aliquota: 0.008 },
  // 30
  { nome: 'Ferrara', slug: 'ferrara', provincia: 'FE', regione: 'emilia-romagna', aliquota: 0.007 },
  // 31
  { nome: 'Sassari', slug: 'sassari', provincia: 'SS', regione: 'sardegna', aliquota: 0.007 },
  // 32
  { nome: 'Monza', slug: 'monza', provincia: 'MB', regione: 'lombardia', aliquota: 0.007 },
  // 33
  { nome: 'Siracusa', slug: 'siracusa', provincia: 'SR', regione: 'sicilia', aliquota: 0.008 },
  // 34
  { nome: 'Bergamo', slug: 'bergamo', provincia: 'BG', regione: 'lombardia', aliquota: 0.006 },
  // 35
  { nome: 'Pescara', slug: 'pescara', provincia: 'PE', regione: 'abruzzo', aliquota: 0.008 },
  // 36
  { nome: 'Trento', slug: 'trento', provincia: 'TN', regione: 'trentino-alto-adige', aliquota: 0.003 },
  // 37
  { nome: 'Bolzano', slug: 'bolzano', provincia: 'BZ', regione: 'trentino-alto-adige', aliquota: 0.002 },
  // 38
  { nome: 'Vicenza', slug: 'vicenza', provincia: 'VI', regione: 'veneto', aliquota: 0.005 },
  // 39
  { nome: 'Terni', slug: 'terni', provincia: 'TR', regione: 'umbria', aliquota: 0.008 },
  // 40
  { nome: 'Novara', slug: 'novara', provincia: 'NO', regione: 'piemonte', aliquota: 0.008 },
  // 41
  { nome: 'Piacenza', slug: 'piacenza', provincia: 'PC', regione: 'emilia-romagna', aliquota: 0.007 },
  // 42
  { nome: 'Ancona', slug: 'ancona', provincia: 'AN', regione: 'marche', aliquota: 0.008 },
  // 43
  { nome: 'Andria', slug: 'andria', provincia: 'BT', regione: 'puglia', aliquota: 0.008 },
  // 44
  { nome: 'Udine', slug: 'udine', provincia: 'UD', regione: 'friuli-venezia-giulia', aliquota: 0.008 },
  // 45
  { nome: 'Arezzo', slug: 'arezzo', provincia: 'AR', regione: 'toscana', aliquota: 0.008 },
  // 46
  { nome: 'Lecce', slug: 'lecce', provincia: 'LE', regione: 'puglia', aliquota: 0.008 },
  // 47
  { nome: 'Pesaro', slug: 'pesaro', provincia: 'PU', regione: 'marche', aliquota: 0.008 },
  // 48
  { nome: 'Alessandria', slug: 'alessandria', provincia: 'AL', regione: 'piemonte', aliquota: 0.008 },
  // 49
  { nome: 'La Spezia', slug: 'la-spezia', provincia: 'SP', regione: 'liguria', aliquota: 0.008 },
  // 50
  { nome: 'Catanzaro', slug: 'catanzaro', provincia: 'CZ', regione: 'calabria', aliquota: 0.008 },
  // 51
  { nome: 'Pistoia', slug: 'pistoia', provincia: 'PT', regione: 'toscana', aliquota: 0.008 },
  // 52
  { nome: 'Lucca', slug: 'lucca', provincia: 'LU', regione: 'toscana', aliquota: 0.008 },
  // 53
  { nome: 'Guidonia Montecelio', slug: 'guidonia-montecelio', provincia: 'RM', regione: 'lazio', aliquota: 0.008 },
  // 54
  { nome: 'Giugliano in Campania', slug: 'giugliano-in-campania', provincia: 'NA', regione: 'campania', aliquota: 0.008 },
  // 55
  { nome: 'Latina', slug: 'latina', provincia: 'LT', regione: 'lazio', aliquota: 0.008 },
  // 56
  { nome: 'Brindisi', slug: 'brindisi', provincia: 'BR', regione: 'puglia', aliquota: 0.008 },
  // 57
  { nome: 'Como', slug: 'como', provincia: 'CO', regione: 'lombardia', aliquota: 0.008 },
  // 58
  { nome: 'Treviso', slug: 'treviso', provincia: 'TV', regione: 'veneto', aliquota: 0.008 },
  // 59
  { nome: 'Marsala', slug: 'marsala', provincia: 'TP', regione: 'sicilia', aliquota: 0.008 },
  // 60
  { nome: 'Busto Arsizio', slug: 'busto-arsizio', provincia: 'VA', regione: 'lombardia', aliquota: 0.008 },
  // 61
  { nome: 'Cosenza', slug: 'cosenza', provincia: 'CS', regione: 'calabria', aliquota: 0.008 },
  // 62
  { nome: 'Potenza', slug: 'potenza', provincia: 'PZ', regione: 'basilicata', aliquota: 0.008 },
  // 63
  { nome: 'Pisa', slug: 'pisa', provincia: 'PI', regione: 'toscana', aliquota: 0.008 },
  // 64
  { nome: 'Caserta', slug: 'caserta', provincia: 'CE', regione: 'campania', aliquota: 0.008 },
  // 65
  { nome: 'Varese', slug: 'varese', provincia: 'VA', regione: 'lombardia', aliquota: 0.008 },
  // 66
  { nome: 'Sesto San Giovanni', slug: 'sesto-san-giovanni', provincia: 'MI', regione: 'lombardia', aliquota: 0.008 },
  // 67
  { nome: 'Grosseto', slug: 'grosseto', provincia: 'GR', regione: 'toscana', aliquota: 0.008 },
  // 68
  { nome: 'Cinisello Balsamo', slug: 'cinisello-balsamo', provincia: 'MI', regione: 'lombardia', aliquota: 0.008 },
  // 69
  { nome: 'Ragusa', slug: 'ragusa', provincia: 'RG', regione: 'sicilia', aliquota: 0.008 },
  // 70
  { nome: 'Asti', slug: 'asti', provincia: 'AT', regione: 'piemonte', aliquota: 0.008 },
  // 71
  { nome: 'Fiumicino', slug: 'fiumicino', provincia: 'RM', regione: 'lazio', aliquota: 0.008 },
  // 72
  { nome: 'Torre del Greco', slug: 'torre-del-greco', provincia: 'NA', regione: 'campania', aliquota: 0.008 },
  // 73
  { nome: 'Cremona', slug: 'cremona', provincia: 'CR', regione: 'lombardia', aliquota: 0.008 },
  // 74
  { nome: 'Altamura', slug: 'altamura', provincia: 'BA', regione: 'puglia', aliquota: 0.008 },
  // 75
  { nome: 'Vigevano', slug: 'vigevano', provincia: 'PV', regione: 'lombardia', aliquota: 0.008 },
  // 76
  { nome: 'Trapani', slug: 'trapani', provincia: 'TP', regione: 'sicilia', aliquota: 0.008 },
  // 77
  { nome: 'Crotone', slug: 'crotone', provincia: 'KR', regione: 'calabria', aliquota: 0.008 },
  // 78
  { nome: 'Castellammare di Stabia', slug: 'castellammare-di-stabia', provincia: 'NA', regione: 'campania', aliquota: 0.008 },
  // 79
  { nome: 'Fano', slug: 'fano', provincia: 'PU', regione: 'marche', aliquota: 0.008 },
  // 80
  { nome: 'Viterbo', slug: 'viterbo', provincia: 'VT', regione: 'lazio', aliquota: 0.008 },
  // 81
  { nome: 'Rovigo', slug: 'rovigo', provincia: 'RO', regione: 'veneto', aliquota: 0.008 },
  // 82
  { nome: 'Lodi', slug: 'lodi', provincia: 'LO', regione: 'lombardia', aliquota: 0.008 },
  // 83
  { nome: 'Caltanissetta', slug: 'caltanissetta', provincia: 'CL', regione: 'sicilia', aliquota: 0.008 },
  // 84
  { nome: 'Manfredonia', slug: 'manfredonia', provincia: 'FG', regione: 'puglia', aliquota: 0.008 },
  // 85
  { nome: 'Benevento', slug: 'benevento', provincia: 'BN', regione: 'campania', aliquota: 0.008 },
  // 86
  { nome: 'Avellino', slug: 'avellino', provincia: 'AV', regione: 'campania', aliquota: 0.008 },
  // 87
  { nome: 'Massa', slug: 'massa', provincia: 'MS', regione: 'toscana', aliquota: 0.008 },
  // 88
  { nome: 'Carrara', slug: 'carrara', provincia: 'MS', regione: 'toscana', aliquota: 0.008 },
  // 89
  { nome: 'Aprilia', slug: 'aprilia', provincia: 'LT', regione: 'lazio', aliquota: 0.008 },
  // 90
  { nome: 'Imola', slug: 'imola', provincia: 'BO', regione: 'emilia-romagna', aliquota: 0.008 },
  // 91
  { nome: 'Cesena', slug: 'cesena', provincia: 'FC', regione: 'emilia-romagna', aliquota: 0.008 },
  // 92
  { nome: 'Forlì', slug: 'forli', provincia: 'FC', regione: 'emilia-romagna', aliquota: 0.008 },
  // 93
  { nome: 'Savona', slug: 'savona', provincia: 'SV', regione: 'liguria', aliquota: 0.008 },
  // 94
  { nome: 'Matera', slug: 'matera', provincia: 'MT', regione: 'basilicata', aliquota: 0.008 },
  // 95
  { nome: 'Lecco', slug: 'lecco', provincia: 'LC', regione: 'lombardia', aliquota: 0.008 },
  // 96
  { nome: 'Barletta', slug: 'barletta', provincia: 'BT', regione: 'puglia', aliquota: 0.008 },
  // 97
  { nome: 'Trani', slug: 'trani', provincia: 'BT', regione: 'puglia', aliquota: 0.008 },
  // 98
  { nome: 'Olbia', slug: 'olbia', provincia: 'SS', regione: 'sardegna', aliquota: 0.008 },
  // 99
  { nome: 'Quartu Sant\'Elena', slug: 'quartu-sant-elena', provincia: 'CA', regione: 'sardegna', aliquota: 0.008 },
  // 100
  { nome: 'Acireale', slug: 'acireale', provincia: 'CT', regione: 'sicilia', aliquota: 0.008 },
  // 101
  { nome: 'Molfetta', slug: 'molfetta', provincia: 'BA', regione: 'puglia', aliquota: 0.008 },
  // 102
  { nome: 'Pavia', slug: 'pavia', provincia: 'PV', regione: 'lombardia', aliquota: 0.008 },
  // 103
  { nome: 'Agrigento', slug: 'agrigento', provincia: 'AG', regione: 'sicilia', aliquota: 0.008 },
  // 104
  { nome: 'Teramo', slug: 'teramo', provincia: 'TE', regione: 'abruzzo', aliquota: 0.008 },
  // 105
  { nome: 'Chieti', slug: 'chieti', provincia: 'CH', regione: 'abruzzo', aliquota: 0.008 },
  // 106
  { nome: 'L\'Aquila', slug: 'l-aquila', provincia: 'AQ', regione: 'abruzzo', aliquota: 0.008 },
  // 107
  { nome: 'Gela', slug: 'gela', provincia: 'CL', regione: 'sicilia', aliquota: 0.008 },
  // 108
  { nome: 'Mantova', slug: 'mantova', provincia: 'MN', regione: 'lombardia', aliquota: 0.008 },
  // 109
  { nome: 'Cuneo', slug: 'cuneo', provincia: 'CN', regione: 'piemonte', aliquota: 0.008 },
  // 110
  { nome: 'Pordenone', slug: 'pordenone', provincia: 'PN', regione: 'friuli-venezia-giulia', aliquota: 0.008 },
  // 111
  { nome: 'Campobasso', slug: 'campobasso', provincia: 'CB', regione: 'molise', aliquota: 0.008 },
  // 112
  { nome: 'Enna', slug: 'enna', provincia: 'EN', regione: 'sicilia', aliquota: 0.008 },
  // 113
  { nome: 'Vibo Valentia', slug: 'vibo-valentia', provincia: 'VV', regione: 'calabria', aliquota: 0.008 },
  // 114
  { nome: 'Sanremo', slug: 'sanremo', provincia: 'IM', regione: 'liguria', aliquota: 0.008 },
  // 115
  { nome: 'Gallarate', slug: 'gallarate', provincia: 'VA', regione: 'lombardia', aliquota: 0.008 },
  // 116
  { nome: 'Legnano', slug: 'legnano', provincia: 'MI', regione: 'lombardia', aliquota: 0.008 },
  // 117
  { nome: 'Portici', slug: 'portici', provincia: 'NA', regione: 'campania', aliquota: 0.008 },
  // 118
  { nome: 'Acerra', slug: 'acerra', provincia: 'NA', regione: 'campania', aliquota: 0.008 },
  // 119
  { nome: 'Ercolano', slug: 'ercolano', provincia: 'NA', regione: 'campania', aliquota: 0.008 },
  // 120
  { nome: 'Aosta', slug: 'aosta', provincia: 'AO', regione: 'valle-d-aosta', aliquota: 0.008 },
];

// ---------------------------------------------------------------------------
// Quick lookup by slug
// ---------------------------------------------------------------------------

export const comuniBySlug: Map<string, Comune> = new Map(
  COMUNI.map((c) => [c.slug, c]),
);

// ---------------------------------------------------------------------------
// Helper – look up a comune or fall back to the national average rate
// ---------------------------------------------------------------------------

export function getAliquotaComunale(slug: string): number {
  return comuniBySlug.get(slug)?.aliquota ?? ADDIZIONALE_COMUNALE_MEDIA;
}
