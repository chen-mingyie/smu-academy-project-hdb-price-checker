import React from 'react';
import { RefreshCw, Building2 } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  isLive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isLoading,
  isLive,
}) => {
  return (
    <header className="border-b border-neutral-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <a
                href="/"
                className="text-lg font-bold tracking-tight text-neutral-900 whitespace-nowrap block"
              >
                SG Resale Flats
              </a>
              <span className="text-[11px] text-neutral-500 font-medium hidden sm:block">
                Singapore HDB Resale Market Intelligence
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
            <a
              href="#stats"
              className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0"
            >
              Price Statistics
            </a>
            <a
              href="#recent"
              className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0"
            >
              Recent 5 Transactions
            </a>
            <a
              href="#trend"
              className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0"
            >
              Price Distribution
            </a>
            <a
              href="#calculator"
              className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0"
            >
              Mortgage Estimator
            </a>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500">
              <span
                className={`w-2 h-2 rounded-full ${
                  isLive ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span>{isLive ? 'Backend /api/hdb' : 'Fallback Cache'}</span>
            </div>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Refresh recent transactions from Data.gov.sg"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
              />
              <span>{isLoading ? 'Fetching...' : 'Sync Data'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
