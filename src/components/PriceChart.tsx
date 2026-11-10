import React, { useState, useMemo } from 'react';
import { HdbRecord } from '../types/hdb';
import { formatSGD, formatNumber } from '../data/constants';
import { BarChart3 } from 'lucide-react';

interface PriceChartProps {
  records: HdbRecord[];
  meanPrice: number;
  highPrice: number;
  lowPrice: number;
  onSelectRecord: (record: HdbRecord) => void;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  records,
  meanPrice,
  highPrice,
  lowPrice,
  onSelectRecord,
}) => {
  const [hoveredRecord, setHoveredRecord] = useState<HdbRecord | null>(null);

  // Take up to 25 transactions for a clean visual bar representation
  const chartRecords = useMemo(() => {
    return records.slice(0, 25);
  }, [records]);

  if (chartRecords.length === 0) return null;

  const maxVal = Math.max(highPrice, 100000);
  const minVal = Math.max(0, Math.floor(lowPrice * 0.85));
  const range = maxVal - minVal || 1;

  // Chart geometry
  const chartHeight = 160;

  return (
    <section id="trend" className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-neutral-500" />
          <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
            Recent Transaction Price Distribution
          </h3>
          <span className="text-neutral-400">·</span>
          <span className="text-xs text-neutral-500">
            Last {chartRecords.length} sales vs Mean ({formatSGD(meanPrice)})
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-neutral-500 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-500 inline-block" /> High: {formatSGD(highPrice)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-rose-500 border-b border-dashed inline-block" /> Mean: {formatSGD(meanPrice)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-amber-500 inline-block" /> Low: {formatSGD(lowPrice)}
          </span>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative pt-4">
        {/* Mean line indicator */}
        {meanPrice > 0 && (
          <div
            className="absolute left-0 right-0 border-b-2 border-dashed border-rose-400/80 pointer-events-none z-10"
            style={{
              bottom: `${Math.max(5, Math.min(95, ((meanPrice - minVal) / range) * 100))}%`,
            }}
          >
            <span className="absolute right-0 -top-4 text-[10px] font-mono text-rose-500 bg-white/90 px-1 rounded">
              Mean: {formatSGD(meanPrice)}
            </span>
          </div>
        )}

        {/* Bars Container */}
        <div
          className="flex items-end justify-between gap-1.5 w-full border-b border-neutral-200 pb-1"
          style={{ height: `${chartHeight}px` }}
        >
          {chartRecords.map((r, i) => {
            const heightPct = Math.max(
              8,
              Math.min(100, Math.round(((r.resale_price - minVal) / range) * 100))
            );
            const isHovered = hoveredRecord?._id === r._id;
            const isRecent5 = i < 5;

            return (
              <div
                key={`${r._id}-${i}`}
                onMouseEnter={() => setHoveredRecord(r)}
                onMouseLeave={() => setHoveredRecord(null)}
                onClick={() => onSelectRecord(r)}
                className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group relative"
              >
                {/* Bar */}
                <div
                  className={`w-full max-w-[28px] rounded-t-sm transition-all duration-150 ${
                    isHovered
                      ? 'bg-rose-600 ring-2 ring-rose-300'
                      : isRecent5
                      ? 'bg-neutral-900 group-hover:bg-neutral-700'
                      : 'bg-neutral-300 group-hover:bg-neutral-400'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />

                {/* Subtext for top 5 */}
                <span className="text-[9px] font-mono text-neutral-400 mt-1 truncate max-w-full">
                  #{i + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hover detail card / tooltip */}
        {hoveredRecord && (
          <div className="mt-3 p-3 bg-neutral-900 text-white rounded-lg text-xs flex flex-wrap items-center justify-between gap-3 shadow-md animate-in fade-in duration-100">
            <div>
              <div className="font-semibold text-rose-300">
                Blk {hoveredRecord.block} {hoveredRecord.street_name}
              </div>
              <div className="text-neutral-400 text-[11px] mt-0.5">
                {hoveredRecord.town} · {hoveredRecord.flat_type} ({hoveredRecord.flat_model}) · Storey {hoveredRecord.storey_range}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold font-mono text-white">
                {formatSGD(hoveredRecord.resale_price)}
              </div>
              <div className="text-[11px] text-neutral-400 font-mono">
                {hoveredRecord.floor_area_sqm} sqm · Transacted {hoveredRecord.month}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
