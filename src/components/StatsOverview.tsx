import React from 'react';
import { HdbStats, HdbRecord } from '../types/hdb';
import { formatSGD, formatNumber, SQM_TO_SQFT_FACTOR } from '../data/constants';
import { Calculator, ArrowUpRight, ArrowDownRight, Layers, Building, Scale } from 'lucide-react';

interface StatsOverviewProps {
  stats: HdbStats;
  recentRecords: HdbRecord[];
  onSelectRecord: (record: HdbRecord) => void;
  town: string;
  flatType: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  recentRecords,
  onSelectRecord,
  town,
  flatType,
}) => {
  if (stats.count === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center">
        <p className="text-neutral-500 text-sm">
          No transactions found for the selected criteria.
        </p>
      </div>
    );
  }

  // Use the 5 recent transactions stats for direct focus if recentRecords exists
  const targetMean = stats.recentMean || stats.mean;
  const targetHigh = stats.recentHigh || stats.high;
  const targetLow = stats.recentLow || stats.low;
  const targetCount = recentRecords.length;

  const spread = targetHigh - targetLow;
  const avgSqftPrice =
    stats.meanPricePerSqm > 0
      ? Math.round(stats.meanPricePerSqm / SQM_TO_SQFT_FACTOR)
      : 0;

  // Find the exact high and low records among the 5 recent transactions
  const recentHighRecord =
    recentRecords.find((r) => r.resale_price === targetHigh) || stats.highRecord;
  const recentLowRecord =
    recentRecords.find((r) => r.resale_price === targetLow) || stats.lowRecord;

  return (
    <section id="stats" className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">
              Benchmark Statistics
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-500">
              5 Recent Transactions in {town === 'ALL' ? 'Singapore' : town} ({flatType === 'ALL' ? 'All Types' : flatType})
            </span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight mt-0.5">
            Key Resale Price Indicators
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-600">
          <span>Price Range Spread:</span>
          <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-md">
            {formatSGD(spread)}
          </span>
        </div>
      </div>

      {/* 3 Core Stats Cards (Mean, High, Low) + Unit Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MEAN PRICE CARD */}
        <div className="bg-white border-2 border-rose-100 rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-600 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Mean (Average)</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-neutral-900 tracking-tight">
            {formatSGD(targetMean)}
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Median: <strong className="font-mono text-neutral-900 font-semibold">{formatSGD(stats.median)}</strong></span>
            <span>n = {targetCount} sales</span>
          </div>
        </div>

        {/* HIGHEST TRANSACTED CARD */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-600 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Highest Price</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-700 tracking-tight">
            {formatSGD(targetHigh)}
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500 truncate">
            {recentHighRecord ? (
              <button
                type="button"
                onClick={() => onSelectRecord(recentHighRecord)}
                className="hover:text-rose-600 underline decoration-dotted text-left truncate block w-full cursor-pointer"
                title="View record details"
              >
                Blk {recentHighRecord.block} {recentHighRecord.street_name}
              </button>
            ) : (
              <span>Peak sale</span>
            )}
          </div>
        </div>

        {/* LOWEST TRANSACTED CARD */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-600 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Lowest Price</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-neutral-900 tracking-tight">
            {formatSGD(targetLow)}
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500 truncate">
            {recentLowRecord ? (
              <button
                type="button"
                onClick={() => onSelectRecord(recentLowRecord)}
                className="hover:text-rose-600 underline decoration-dotted text-left truncate block w-full cursor-pointer"
                title="View record details"
              >
                Blk {recentLowRecord.block} {recentLowRecord.street_name}
              </button>
            ) : (
              <span>Floor price</span>
            )}
          </div>
        </div>

        {/* AVERAGE UNIT RATE */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-600 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Mean Price / SQM</span>
            <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-neutral-900 tracking-tight">
            {formatSGD(stats.meanPricePerSqm)}
            <span className="text-xs font-normal text-neutral-500 font-sans ml-1">/ sqm</span>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500 flex items-center justify-between">
            <span>Per sqft approx:</span>
            <span className="font-mono font-semibold text-neutral-900">${formatNumber(avgSqftPrice)} / sqft</span>
          </div>
        </div>
      </div>

      {/* Visual Spectrum Band */}
      <div className="bg-neutral-900 text-white rounded-xl p-4.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-rose-400 font-semibold uppercase tracking-wider text-[11px]">
              Price Distribution Spectrum
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-400">Mean vs Range Limits</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-neutral-300">
            <span>Low: {formatSGD(targetLow)}</span>
            <span>Mean: <strong className="text-rose-300">{formatSGD(targetMean)}</strong></span>
            <span>High: {formatSGD(targetHigh)}</span>
          </div>
        </div>

        {/* Visual Bar */}
        <div className="relative mt-3 pt-1">
          <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-rose-500 to-emerald-400 rounded-full"
              style={{ width: '100%' }}
            />
          </div>
          <div
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none"
            style={{
              left: `${
                spread > 0
                  ? Math.max(8, Math.min(92, Math.round(((targetMean - targetLow) / spread) * 100)))
                  : 50
              }%`,
            }}
          >
            <div className="w-3 h-3 rounded-full bg-white ring-2 ring-rose-500 shadow-sm" />
            <span className="text-[10px] font-mono font-semibold text-rose-300 whitespace-nowrap mt-1">
              Mean: {formatSGD(targetMean)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
