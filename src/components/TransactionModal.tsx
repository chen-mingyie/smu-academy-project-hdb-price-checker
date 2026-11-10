import React, { useEffect } from 'react';
import { HdbRecord } from '../types/hdb';
import { formatSGD, formatNumber, SQM_TO_SQFT_FACTOR } from '../data/constants';
import { X, Building, Calendar, MapPin, Layers, Award, Scale } from 'lucide-react';

interface TransactionModalProps {
  record: HdbRecord | null;
  onClose: () => void;
  meanPrice: number;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  record,
  onClose,
  meanPrice,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!record) return null;

  const sqft = Math.round(record.floor_area_sqm * SQM_TO_SQFT_FACTOR);
  const pricePerSqm =
    record.floor_area_sqm > 0
      ? Math.round(record.resale_price / record.floor_area_sqm)
      : 0;
  const pricePerSqft = sqft > 0 ? Math.round(record.resale_price / sqft) : 0;
  const diffFromMean = meanPrice > 0 ? record.resale_price - meanPrice : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider">
              <span>HDB Resale Transaction</span>
              <span className="text-neutral-400">·</span>
              <span className="font-mono text-neutral-500">{record.month}</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mt-1">
              Blk {record.block} {record.street_name}
            </h3>
            <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{record.town} Estate, Singapore</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resale Price Callout */}
        <div className="my-5 p-4 rounded-xl bg-neutral-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
              Transacted Resale Price
            </span>
            <div className="text-3xl font-bold font-mono text-rose-300">
              {formatSGD(record.resale_price)}
            </div>
          </div>
          {meanPrice > 0 && (
            <div className="text-right text-xs">
              <span className="text-neutral-400 block text-[10px]">Cohort Mean</span>
              <span className="font-mono text-neutral-300">
                {formatSGD(meanPrice)}
              </span>
              <div
                className={`font-mono font-semibold text-xs mt-0.5 ${
                  diffFromMean >= 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {diffFromMean >= 0 ? '+' : ''}
                {formatSGD(diffFromMean)}
              </div>
            </div>
          )}
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <span className="text-neutral-500 block mb-0.5 font-medium">Flat Type & Model</span>
            <strong className="text-neutral-900 text-sm font-semibold block">
              {record.flat_type}
            </strong>
            <span className="text-neutral-500 text-[11px]">{record.flat_model}</span>
          </div>

          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <span className="text-neutral-500 block mb-0.5 font-medium">Storey Range</span>
            <strong className="text-neutral-900 text-sm font-semibold font-mono block">
              {record.storey_range}
            </strong>
            <span className="text-neutral-500 text-[11px]">Floor Level</span>
          </div>

          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <span className="text-neutral-500 block mb-0.5 font-medium">Floor Area</span>
            <strong className="text-neutral-900 text-sm font-semibold font-mono block">
              {record.floor_area_sqm} sqm
            </strong>
            <span className="text-neutral-500 text-[11px] font-mono">
              ~{formatNumber(sqft)} sqft
            </span>
          </div>

          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <span className="text-neutral-500 block mb-0.5 font-medium">Unit Rate</span>
            <strong className="text-neutral-900 text-sm font-semibold font-mono block">
              {formatSGD(pricePerSqm)}/sqm
            </strong>
            <span className="text-neutral-500 text-[11px] font-mono">
              ${formatNumber(pricePerSqft)}/sqft
            </span>
          </div>

          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 col-span-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-neutral-500 block mb-0.5 font-medium">Remaining Lease</span>
                <strong className="text-neutral-900 text-sm font-semibold font-mono">
                  {record.remaining_lease}
                </strong>
              </div>
              <div className="text-right text-[11px] text-neutral-500">
                <span>Lease Commenced:</span>
                <span className="font-mono font-medium text-neutral-800 ml-1">
                  {record.lease_commence_date}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-neutral-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
