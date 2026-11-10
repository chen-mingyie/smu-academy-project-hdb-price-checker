import React from 'react';
import { HdbRecord } from '../types/hdb';
import { formatSGD, formatNumber, SQM_TO_SQFT_FACTOR } from '../data/constants';
import { GitCompare, TrendingUp, Sparkles, Building, Layers } from 'lucide-react';

interface AttributeComparisonProps {
  records: HdbRecord[];
  onSelectRecord: (record: HdbRecord) => void;
}

export const AttributeComparison: React.FC<AttributeComparisonProps> = ({
  records,
  onSelectRecord,
}) => {
  const top5 = records.slice(0, 5);
  if (top5.length < 2) return null;

  const maxPrice = Math.max(...top5.map((r) => r.resale_price));
  const maxPsm = Math.max(
    ...top5.map((r) =>
      r.floor_area_sqm > 0 ? Math.round(r.resale_price / r.floor_area_sqm) : 0
    )
  );

  return (
    <section className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
              5 Recent Transactions: Attribute Breakdown & Comparison
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Compare flat model, floor area, remaining lease, and price per sqm across recent sales
          </p>
        </div>
        <span className="text-[11px] font-mono text-neutral-400">
          Showing 5 transactions
        </span>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {top5.map((r, i) => {
          const psm =
            r.floor_area_sqm > 0
              ? Math.round(r.resale_price / r.floor_area_sqm)
              : 0;
          const sqft = Math.round(r.floor_area_sqm * SQM_TO_SQFT_FACTOR);
          const priceBarPct = Math.round((r.resale_price / maxPrice) * 100);

          return (
            <div
              key={`${r._id}-${i}`}
              onClick={() => onSelectRecord(r)}
              className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/60 hover:bg-white hover:border-neutral-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono mb-1">
                  <span className="font-bold text-neutral-700">#{i + 1}</span>
                  <span>{r.month}</span>
                </div>

                <div className="font-bold text-xs text-neutral-900 truncate" title={`Blk ${r.block} ${r.street_name}`}>
                  Blk {r.block} {r.street_name}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">
                  Storey {r.storey_range} · {r.flat_model}
                </div>

                {/* Price Bar */}
                <div className="mt-3">
                  <div className="text-sm font-extrabold font-mono text-neutral-900">
                    {formatSGD(r.resale_price)}
                  </div>
                  <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${priceBarPct}%` }}
                    />
                  </div>
                </div>

                {/* Specs List */}
                <div className="mt-3 pt-2.5 border-t border-neutral-200/60 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Floor Area:</span>
                    <span className="font-mono font-medium text-neutral-800">{r.floor_area_sqm} sqm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Unit Rate:</span>
                    <span className="font-mono font-medium text-neutral-800">{formatSGD(psm)}/m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Built:</span>
                    <span className="font-mono font-medium text-neutral-800">{r.lease_commence_date}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-neutral-200/60 text-[10px] text-neutral-600 font-mono truncate" title={r.remaining_lease}>
                {r.remaining_lease}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
