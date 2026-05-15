interface SelettoreMensilitaProps {
  value: 12 | 13 | 14;
  onChange: (m: 12 | 13 | 14) => void;
}

const OPTIONS: { value: 12 | 13 | 14; label: string; tooltip: string }[] = [
  { value: 12, label: '12 mensilita', tooltip: 'Solo stipendio base' },
  { value: 13, label: '13 mensilita', tooltip: 'Con tredicesima' },
  {
    value: 14,
    label: '14 mensilita',
    tooltip: 'Con tredicesima e quattordicesima',
  },
];

export default function SelettoreMensilita({
  value,
  onChange,
}: SelettoreMensilitaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Mensilita
      </span>
      <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 p-0.5">
        {OPTIONS.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              title={opt.tooltip}
              onClick={() => onChange(opt.value)}
              className={[
                'relative rounded-md px-3 py-2 text-sm font-medium transition-all duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                isActive
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
              ].join(' ')}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
