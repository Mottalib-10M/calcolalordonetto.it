import type { Lang } from './types';
import type { Dictionary } from './it';
import it from './it';
import en from './en';

export type { Lang };
export { it, en };

const dictionaries: Record<Lang, Dictionary> = { it, en };

/**
 * Translate a dot-separated key for the given language.
 * Falls back to Italian if the key is missing in the target language.
 *
 * Usage:
 *   t('stipendioNetto.ralLabel', 'en')   → "RAL - Gross Annual Salary"
 *   t('ui.region', 'it')                 → "Regione"
 */
export function t(key: string, lang: Lang): string {
  const value = resolve(dictionaries[lang], key) ?? resolve(it, key);
  return typeof value === 'string' ? value : key;
}

function resolve(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}
