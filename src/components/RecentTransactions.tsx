import React, { useState } from 'react';
import { HdbRecord } from '../types/hdb';
import { formatSGD, formatNumber, SQM_TO_SQFT_FACTOR } from '../data/constants';
import {
  MapPin,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  LayoutGrid,
  ListFilter,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface RecentTransactionsProps {
  records: HdbRecord[];
  onSelectRecord: (record: HdbRecord) => void;
  meanPrice: number;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  records,
  onSelectRecord,
  meanPrice,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showAll, setShowAll] = useState(false);

  const displayedRecords = showAll ? records : records.slice(0, 5);
  const totalCount = records.length;

  if (totalCount === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center">
        <p className="text-neutral-500 text-sm">
          No transactions to display. Adjust your town or flat type filter.
        </p>
      </div>
    );
  }

  // Find highest and lowest among displayed
  const prices = displayedRecords.map((r) => r.resale_price);
  const highestPrice = Math.max(...prices);
  const lowestPrice = Math.min(...prices);

  return (
    <section id="recent" className="space-y-4">
      {/* Section Header with View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              5 Recent Transactions
            </h2>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-500 font-medium">
              Live Official Data.gov.sg Records
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Detailed property attributes from the latest registered resale transfers
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Mode Toggle: Cards vs Table */}
          <div className="flex items-center p-1 bg-neutral-200/70 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          {totalCount > 5 && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition-colors cursor-pointer"
            >
              {showAll ? 'Show Top 5 Only' : `View All (${totalCount})`}
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: BENTO-STYLE PROPERTY CARDS */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedRecords.map((r, index) => {
            const sqft = Math.round(r.floor_area_sqm * SQM_TO_SQFT_FACTOR);
            const pricePerSqm =
              r.floor_area_sqm > 0
                ? Math.round(r.resale_price / r.floor_area_sqm)
                : 0;
            const pricePerSqft =
              sqft > 0 ? Math.round(r.resale_price / sqft) : 0;
            const diffFromMean = meanPrice > 0 ? r.resale_price - meanPrice : 0;
            const isHighest = r.resale_price === highestPrice;
            const isLowest = r.resale_price === lowestPrice;

            // Extract lease years number if available for lease progress bar
            const leaseYearsMatch = r.remaining_lease.match(/(\d+)\s*years/);
            const leaseYears = leaseYearsMatch
              ? parseInt(leaseYearsMatch[1], 10)
              : 60;
            const leasePercent = Math.min(100, Math.round((leaseYears / 99) * 100));

            return (
              <div
                key={`${r._id}-${index}`}
                onClick={() => onSelectRecord(r)}
                className={`bg-white border rounded-xl p-5 transition-all duration-150 hover:shadow-md cursor-pointer flex flex-col justify-between group ${
                  isHighest
                    ? 'border-emerald-300 ring-1 ring-emerald-200'
                    : isLowest
                    ? 'border-blue-300 ring-1 ring-blue-200'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div>
                  {/* Top Header Row with Index, Month & Tags */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[11px] font-mono font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-xs font-mono text-neutral-500 font-medium">
                        {r.month}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isHighest && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Highest Price
                        </span>
                      )}
                      {isLowest && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                          Lowest Price
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-neutral-400">
                        #{r._id}
                      </span>
                    </div>
                  </div>

                  {/* Price Banner */}
                  <div className="mb-3">
                    <div className="text-2xl font-extrabold font-mono text-neutral-900 group-hover:text-rose-600 transition-colors">
                      {formatSGD(r.resale_price)}
                    </div>
                    {meanPrice > 0 && (
                      <div
                        className={`text-xs font-mono font-medium mt-0.5 flex items-center gap-1 ${
                          diffFromMean >= 0
                            ? 'text-emerald-600'
                            : 'text-blue-600'
                        }`}
                      >
                        <span>{diffFromMean >= 0 ? '+' : ''}{formatSGD(diffFromMean)}</span>
                        <span className="text-neutral-400 font-sans font-normal text-[11px]">vs Mean</span>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="pb-3 mb-3 border-b border-neutral-100">
                    <div className="font-bold text-sm text-neutral-900 leading-snug">
                      Blk {r.block} {r.street_name}
                    </div>
                    <div className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span>{r.town} · Storey {r.storey_range}</span>
                    </div>
                  </div>

                  {/* Key Attribute Specifications Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                      <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                        Floor Area
                      </span>
                      <strong className="text-neutral-900 font-mono text-xs block">
                        {r.floor_area_sqm} sqm
                      </strong>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {formatNumber(sqft)} sqft
                      </span>
                    </div>

                    <div className="bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                      <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                        Flat Model
                      </span>
                      <strong className="text-neutral-900 text-xs block truncate">
                        {r.flat_model}
                      </strong>
                      <span className="text-[10px] text-neutral-500">
                        {r.flat_type}
                      </span>
                    </div>
                  </div>

                  {/* Lease Health Meter */}
                  <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-[10px] uppercase font-semibold text-neutral-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Remaining Lease
                      </span>
                      <span className="font-mono text-[11px] text-neutral-800 font-semibold">
                        {r.remaining_lease}
                      </span>
                    </div>
                    {/* Visual 99-year lease bar */}
                    <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          leaseYears > 70
                            ? 'bg-emerald-500'
                            : leaseYears > 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${leasePercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1">
                      <span>Lease: {r.lease_commence_date}</span>
                      <span>{leasePercent}% left of 99 yrs</span>
                    </div>
                  </div>
                </div>

                {/* Footer Unit Rate & Action */}
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-neutral-400 text-[10px] block">Unit Rate</span>
                    <strong className="font-mono text-neutral-900">
                      {formatSGD(pricePerSqm)}/sqm
                    </strong>
                    <span className="text-[10px] font-mono text-neutral-400 ml-1">
                      (${formatNumber(pricePerSqft)}/sqft)
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 group-hover:text-rose-600 transition-colors">
                    Details
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: HIGH-DENSITY DATA TABLE */}
      {viewMode === 'table' && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  <th scope="col" className="py-3 px-4 w-12 text-center">#</th>
                  <th scope="col" className="py-3 px-4">Date</th>
                  <th scope="col" className="py-3 px-4">Address</th>
                  <th scope="col" className="py-3 px-4">Flat Model</th>
                  <th scope="col" className="py-3 px-4">Storey</th>
                  <th scope="col" className="py-3 px-4">Floor Area</th>
                  <th scope="col" className="py-3 px-4">Remaining Lease</th>
                  <th scope="col" className="py-3 px-4 text-right">Resale Price</th>
                  <th scope="col" className="py-3 px-4 text-right">Unit Price</th>
                  <th scope="col" className="py-3 px-3 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {displayedRecords.map((r, index) => {
                  const sqft = Math.round(r.floor_area_sqm * SQM_TO_SQFT_FACTOR);
                  const pricePerSqm =
                    r.floor_area_sqm > 0
                      ? Math.round(r.resale_price / r.floor_area_sqm)
                      : 0;
                  const pricePerSqft =
                    sqft > 0 ? Math.round(r.resale_price / sqft) : 0;
                  const diffFromMean =
                    meanPrice > 0 ? r.resale_price - meanPrice : 0;
                  const isHighest = r.resale_price === highestPrice;
                  const isLowest = r.resale_price === lowestPrice;

                  return (
                    <tr
                      key={`${r._id}-${index}`}
                      onClick={() => onSelectRecord(r)}
                      className="hover:bg-neutral-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 text-center font-mono text-neutral-400 font-medium">
                        {index + 1}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-medium text-neutral-800">
                          {r.month}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-900 group-hover:text-rose-600 transition-colors flex items-center gap-1.5">
                          <span>Blk {r.block} {r.street_name}</span>
                          {isHighest && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700">
                              High
                            </span>
                          )}
                          {isLowest && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-blue-50 text-blue-700">
                              Low
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          {r.town}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-neutral-800">
                          {r.flat_model}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {r.flat_type}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-neutral-700">
                        {r.storey_range}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono text-neutral-800">
                          {r.floor_area_sqm} sqm
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {formatNumber(sqft)} sqft
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono text-neutral-800 text-[11px]">
                          {r.remaining_lease}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          Built {r.lease_commence_date}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="text-sm font-bold font-mono text-neutral-900">
                          {formatSGD(r.resale_price)}
                        </div>
                        {meanPrice > 0 && (
                          <div
                            className={`text-[10px] font-mono mt-0.5 ${
                              diffFromMean >= 0
                                ? 'text-emerald-600'
                                : 'text-blue-600'
                            }`}
                          >
                            {diffFromMean >= 0 ? '+' : ''}
                            {formatSGD(diffFromMean)} vs mean
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="font-mono text-neutral-700">
                          {formatSGD(pricePerSqm)}/sqm
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          ${formatNumber(pricePerSqft)}/sqft
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center text-neutral-400 group-hover:text-neutral-900">
                        <ArrowUpRight className="w-4 h-4 inline opacity-60 group-hover:opacity-100 transition-opacity" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-neutral-50 px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              Showing {displayedRecords.length} transactions
            </span>
            <span className="font-mono">
              Prices range from {formatSGD(lowestPrice)} to {formatSGD(highestPrice)}
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
