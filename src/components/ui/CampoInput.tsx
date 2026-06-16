import { useState, useRef, useCallback, useId } from 'react';
import { formatNumber as formatIt, parseItNumber } from '../../lib/format-it';
import { formatNumber as formatLocale, parseNumber } from '../../lib/format';
import type { Lang } from '../../i18n/types';

interface CampoInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  helpText?: string;
  id?: string;
  lang?: Lang;
}

export default function CampoInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  helpText,
  id: externalId,
  lang = 'it',
}: CampoInputProps) {
  const generatedId = useId();
  const inputId = externalId ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [rawValue, setRawValue] = useState('');

  const displayValue = focused ? rawValue : (lang === 'it' ? formatIt(value) : formatLocale(value, 'en'));

  const handleFocus = useCallback(() => {
    setFocused(true);
    // Show the raw number for editing (use period as decimal for input)
    setRawValue(String(value));
    // Select all text on next tick so the selection happens after focus
    requestAnimationFrame(() => {
      inputRef.current?.select();
    });
  }, [value]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    const parsed = lang === 'it' ? parseItNumber(rawValue) : parseNumber(rawValue, 'en');
    let clamped = parsed;
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);
    onChange(clamped);
  }, [rawValue, min, max, onChange, lang]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setRawValue(input);

      // Try to parse and propagate changes in real time
      const parsed = parseFloat(input);
      if (!isNaN(parsed)) {
        let clamped = parsed;
        if (min !== undefined) clamped = Math.max(min, clamped);
        if (max !== undefined) clamped = Math.min(max, clamped);
        onChange(clamped);
      }
    },
    [min, max, onChange],
  );

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <div
        className={[
          'flex items-center rounded-lg border bg-white dark:bg-gray-900 transition-colors',
          focused
            ? 'border-brand ring-2 ring-brand/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
        ].join(' ')}
      >
        {prefix && (
          <span className="pl-3 text-gray-500 dark:text-gray-400 select-none text-sm font-medium">
            {prefix}
          </span>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type={focused ? 'text' : 'text'}
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          step={step}
          className={[
            'w-full bg-transparent py-2.5 text-right text-base font-medium outline-none',
            'text-gray-900 dark:text-gray-100',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            prefix ? 'pl-1.5' : 'pl-3',
            suffix ? 'pr-14' : 'pr-3',
          ].join(' ')}
        />
        {suffix && (
          <span className="pr-3 text-gray-500 dark:text-gray-400 select-none text-sm font-medium">
            {suffix}
          </span>
        )}
      </div>
      {helpText && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
      )}
    </div>
  );
}
