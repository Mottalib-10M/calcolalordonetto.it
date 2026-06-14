import { useState, useRef, useCallback, useEffect, useId } from 'react';
import {
  COMUNI,
  ADDIZIONALE_COMUNALE_MEDIA,
  comuniBySlug,
} from '../../data/comuni-top200';
import { formatPercent as formatPercentIt } from '../../lib/format-it';
import { formatPercent as formatPercentLocale } from '../../lib/format';
import type { Lang } from '../../i18n/types';
import { t } from '../../i18n/index';

interface SelettoreComuneProps {
  value: string;
  onChange: (slug: string, aliquota: number) => void;
  regione?: string;
  lang?: Lang;
}

const MAX_SUGGESTIONS = 10;

export default function SelettoreComune({
  value,
  onChange,
  regione,
  lang = 'it',
}: SelettoreComuneProps) {
  const inputId = useId();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fmtPercent = (v: number) => lang === 'it' ? formatPercentIt(v) : formatPercentLocale(v, 'en');
  const fallbackLabel = `${t('ui.otherMunicipality', lang)} ${fmtPercent(ADDIZIONALE_COMUNALE_MEDIA)})`;

  // Display text in the input
  const [query, setQuery] = useState(() => {
    if (!value) return '';
    const c = comuniBySlug.get(value);
    return c ? c.nome : '';
  });

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Sync external value changes to display text
  useEffect(() => {
    if (!value) {
      setQuery('');
      return;
    }
    const c = comuniBySlug.get(value);
    if (c) setQuery(c.nome);
  }, [value]);

  // Filter comuni based on query and optional region
  const filtered = (() => {
    let list = COMUNI;

    // Filter by regione slug if provided
    if (regione) {
      list = list.filter((c) => c.regione === regione);
    }

    if (query.trim().length > 0) {
      const q = query.trim().toLowerCase();
      list = list.filter((c) => c.nome.toLowerCase().includes(q));
    }

    return list.slice(0, MAX_SUGGESTIONS);
  })();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectComune = useCallback(
    (slug: string, aliquota: number, nome: string) => {
      setQuery(nome);
      setOpen(false);
      setActiveIndex(-1);
      onChange(slug, aliquota);
    },
    [onChange],
  );

  const selectFallback = useCallback(() => {
    setQuery('');
    setOpen(false);
    setActiveIndex(-1);
    onChange('', ADDIZIONALE_COMUNALE_MEDIA);
  }, [onChange]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      setOpen(true);
      setActiveIndex(-1);
    },
    [],
  );

  const handleFocus = useCallback(() => {
    setOpen(true);
    inputRef.current?.select();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Total items: filtered comuni + 1 fallback
      const totalItems = filtered.length + 1;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % totalItems);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < filtered.length) {
            const c = filtered[activeIndex];
            selectComune(c.slug, c.aliquota, c.nome);
          } else if (activeIndex === filtered.length) {
            selectFallback();
          } else if (filtered.length === 1) {
            const c = filtered[0];
            selectComune(c.slug, c.aliquota, c.nome);
          }
          break;
        case 'Escape':
          setOpen(false);
          setActiveIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [filtered, activeIndex, selectComune, selectFallback],
  );

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {t('ui.municipality', lang)}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
          }
          autoComplete="off"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={t('ui.searchMunicipality', lang)}
          className={[
            'w-full rounded-lg border bg-white dark:bg-gray-900 py-2.5 pl-3 pr-3',
            'text-base font-medium outline-none transition-colors',
            'text-gray-900 dark:text-gray-100',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            open
              ? 'border-brand ring-2 ring-brand/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
          ].join(' ')}
        />

        {/* Dropdown */}
        {open && (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg"
          >
            {filtered.map((c, i) => (
              <li
                key={c.slug}
                id={`${listboxId}-${i}`}
                role="option"
                aria-selected={activeIndex === i}
                className={[
                  'flex items-center justify-between cursor-pointer px-3 py-2.5 text-sm',
                  activeIndex === i
                    ? 'bg-brand/10 dark:bg-brand/20 text-brand'
                    : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800',
                ].join(' ')}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectComune(c.slug, c.aliquota, c.nome);
                }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span className="font-medium">
                  {c.nome}{' '}
                  <span className="text-gray-400 dark:text-gray-500 font-normal">
                    ({c.provincia})
                  </span>
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 shrink-0">
                  {fmtPercent(c.aliquota)}
                </span>
              </li>
            ))}

            {/* Fallback option */}
            <li
              id={`${listboxId}-${filtered.length}`}
              role="option"
              aria-selected={activeIndex === filtered.length}
              className={[
                'flex items-center cursor-pointer px-3 py-2.5 text-sm border-t border-gray-100 dark:border-gray-800',
                activeIndex === filtered.length
                  ? 'bg-brand/10 dark:bg-brand/20 text-brand'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
              ].join(' ')}
              onMouseDown={(e) => {
                e.preventDefault();
                selectFallback();
              }}
              onMouseEnter={() => setActiveIndex(filtered.length)}
            >
              <span className="italic">{fallbackLabel}</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
