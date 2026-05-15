/**
 * URL state encoding/decoding for calculator parameters.
 * Enables shareable calculator scenarios via URL query strings.
 *
 * Example: /?ral=35000&regione=LOM&comune=milano&figli=2&mensilita=14
 */

export interface CalcoloParams {
  ral?: number;
  regione?: string;
  comune?: string;
  figli?: number;
  coniugeACarico?: boolean;
  mensilita?: 12 | 13 | 14;
  altriCarico?: number;
  tipoContratto?: string;
}

/** Encode calculator parameters into URL search string */
export function encodeState(params: CalcoloParams): string {
  const searchParams = new URLSearchParams();

  if (params.ral !== undefined) searchParams.set('ral', String(params.ral));
  if (params.regione) searchParams.set('regione', params.regione);
  if (params.comune) searchParams.set('comune', params.comune);
  if (params.figli !== undefined && params.figli > 0)
    searchParams.set('figli', String(params.figli));
  if (params.coniugeACarico) searchParams.set('coniuge', '1');
  if (params.mensilita !== undefined && params.mensilita !== 13)
    searchParams.set('mensilita', String(params.mensilita));
  if (params.altriCarico !== undefined && params.altriCarico > 0)
    searchParams.set('altri', String(params.altriCarico));
  if (params.tipoContratto) searchParams.set('contratto', params.tipoContratto);

  const str = searchParams.toString();
  return str ? `?${str}` : '';
}

/** Decode URL search string into calculator parameters */
export function decodeState(search: string): CalcoloParams {
  const params = new URLSearchParams(search);
  const result: CalcoloParams = {};

  const ral = params.get('ral');
  if (ral) result.ral = parseInt(ral, 10) || undefined;

  const regione = params.get('regione');
  if (regione) result.regione = regione.toUpperCase();

  const comune = params.get('comune');
  if (comune) result.comune = comune.toLowerCase();

  const figli = params.get('figli');
  if (figli) result.figli = parseInt(figli, 10) || 0;

  if (params.get('coniuge') === '1') result.coniugeACarico = true;

  const mensilita = params.get('mensilita');
  if (mensilita) {
    const m = parseInt(mensilita, 10);
    if (m === 12 || m === 13 || m === 14) result.mensilita = m;
  }

  const altri = params.get('altri');
  if (altri) result.altriCarico = parseInt(altri, 10) || 0;

  const contratto = params.get('contratto');
  if (contratto) result.tipoContratto = contratto;

  return result;
}

/** Update browser URL without page reload */
export function pushState(params: CalcoloParams): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.search = encodeState(params).replace(/^\?/, '');
  window.history.replaceState({}, '', url.toString());
}
