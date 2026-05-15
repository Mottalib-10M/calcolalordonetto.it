import { useState } from 'react';
import { formatCurrency, formatPercent } from '../../lib/format-it';

interface BarraItem {
  label: string;
  value: number;
  color: string;
}

interface BarraScomposizioneProps {
  items: BarraItem[];
  total: number;
}

export default function BarraScomposizione({
  items,
  total,
}: BarraScomposizioneProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (total <= 0) return null;

  return (
    <div className="w-full">
      {/* Stacked bar */}
      <div className="relative flex h-10 w-full overflow-hidden rounded-lg">
        {items.map((item, i) => {
          const pct = (item.value / total) * 100;
          if (pct <= 0) return null;

          return (
            <div
              key={i}
              className="relative h-full transition-all duration-500 ease-out first:rounded-l-lg last:rounded-r-lg"
              style={{
                width: `${pct}%`,
                backgroundColor: item.color,
                minWidth: pct > 0 ? '2px' : '0',
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Percentage text inside segment if wide enough */}
              {pct >= 8 && (
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white drop-shadow-sm">
                  {pct.toFixed(1)}%
                </span>
              )}

              {/* Tooltip on hover */}
              {hoveredIndex === i && (
                <div className="absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 dark:bg-gray-100 px-3 py-2 text-xs shadow-lg">
                  <p className="font-semibold text-white dark:text-gray-900">
                    {item.label}
                  </p>
                  <p className="text-gray-300 dark:text-gray-600">
                    {formatCurrency(item.value)} &middot;{' '}
                    {formatPercent(item.value / total)}
                  </p>
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend below the bar */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {items.map((item, i) => {
          const pct = (item.value / total) * 100;
          if (pct <= 0) return null;

          return (
            <div
              key={i}
              className="flex items-center gap-2 text-sm"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span
                className="inline-block h-3 w-3 rounded-sm shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700 dark:text-gray-300">
                {item.label}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(item.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
