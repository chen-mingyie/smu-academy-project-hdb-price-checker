import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FilterState, HdbRecord } from './types/hdb';
import { fetchHdbTransactions, calculateStats } from './services/hdbApi';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { StatsOverview } from './components/StatsOverview';
import { RecentTransactions } from './components/RecentTransactions';
import { AttributeComparison } from './components/AttributeComparison';
import { PriceChart } from './components/PriceChart';
import { MortgageCalculator } from './components/MortgageCalculator';
import { ApiPayloadDrawer } from './components/ApiPayloadDrawer';
import { TransactionModal } from './components/TransactionModal';
import { Building2 } from 'lucide-react';

const DEFAULT_FILTERS: FilterState = {
  town: 'TAMPINES',
  flat_type: '4 ROOM',
  searchQuery: '',
};

export default function App() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [records, setRecords] = useState<HdbRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<HdbRecord | null>(null);

  // Load data whenever town or flat_type changes
  const loadData = useCallback(async (currentFilters: FilterState) => {
    setIsLoading(true);
    try {
      const result = await fetchHdbTransactions(currentFilters);
      setRecords(result.records);
      setIsLive(result.isLive);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(filters);
  }, [filters.town, filters.flat_type, loadData]);

  // Client-side text search filtering
  const filteredRecords = useMemo(() => {
    if (!filters.searchQuery.trim()) {
      return records;
    }
    const q = filters.searchQuery.trim().toLowerCase();
    return records.filter((r) => {
      const blockMatch = r.block.toLowerCase().includes(q);
      const streetMatch = r.street_name.toLowerCase().includes(q);
      const townMatch = r.town.toLowerCase().includes(q);
      const modelMatch = r.flat_model.toLowerCase().includes(q);
      return blockMatch || streetMatch || townMatch || modelMatch;
    });
  }, [records, filters.searchQuery]);

  // 5 Most recent transactions
  const recent5Records = useMemo(() => {
    return filteredRecords.slice(0, 5);
  }, [filteredRecords]);

  // Statistics calculation across all matching records
  const stats = useMemo(() => {
    return calculateStats(filteredRecords, 5);
  }, [filteredRecords]);

  const handleResetFilters = () => {
    setFilters({
      town: 'ALL',
      flat_type: 'ALL',
      searchQuery: '',
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Header
        onRefresh={() => loadData(filters)}
        isLoading={isLoading}
        isLive={isLive}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Editorial Hero Intro */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600 mb-2">
              <span>Public Housing Data</span>
              <span className="text-neutral-300">·</span>
              <span>Data.gov.sg Datastore</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight text-balance">
              Singapore HDB Resale Flat Price Tracker
            </h1>
            <p className="mt-2 text-sm sm:text-base text-neutral-600 leading-relaxed">
              Explore recent resale transactions of Housing & Development Board (HDB) flats across Singapore.
              Filter by estate town and flat type to view the <strong>5 most recent transactions</strong> alongside benchmark statistics including <strong>mean, high, and low</strong> prices.
            </p>
          </div>
        </div>

        {/* Filter Bar Controls */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
          totalFound={filteredRecords.length}
        />

        {/* Loading Skeleton or Main Content */}
        {isLoading && records.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white border border-neutral-200 rounded-xl p-6 h-32 animate-pulse flex flex-col justify-between"
              >
                <div className="h-4 bg-neutral-200 rounded w-1/2" />
                <div className="h-8 bg-neutral-200 rounded w-3/4" />
                <div className="h-3 bg-neutral-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Simple Statistics: High, Low, Mean & Spread */}
            <StatsOverview
              stats={stats}
              recentRecords={recent5Records}
              onSelectRecord={setSelectedRecord}
              town={filters.town}
              flatType={filters.flat_type}
            />

            {/* 5 Recent Transactions Showcase (Cards & Table Views) */}
            <RecentTransactions
              records={filteredRecords}
              onSelectRecord={setSelectedRecord}
              meanPrice={stats.recentMean || stats.mean}
            />

            {/* 5 Recent Transactions Attribute Breakdown */}
            <AttributeComparison
              records={filteredRecords}
              onSelectRecord={setSelectedRecord}
            />

            {/* Interactive Price Distribution & Trend Chart */}
            <PriceChart
              records={filteredRecords}
              meanPrice={stats.recentMean || stats.mean}
              highPrice={stats.recentHigh || stats.high}
              lowPrice={stats.recentLow || stats.low}
              onSelectRecord={setSelectedRecord}
            />

            {/* HDB Mortgage & Affordability Estimator */}
            <MortgageCalculator initialPrice={stats.recentMean || stats.mean} />

            {/* Developer API & Response Inspector */}
            <ApiPayloadDrawer
              town={filters.town}
              flatType={filters.flat_type}
              records={filteredRecords}
            />
          </>
        )}
      </main>

      {/* Transaction Detail Modal */}
      <TransactionModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        meanPrice={stats.recentMean || stats.mean}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 mt-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-neutral-400" />
            <span>
              Source data provided by Housing & Development Board via Data.gov.sg
            </span>
          </div>
          <div>
            Singapore Open Data Licence · All figures quoted in SGD
          </div>
        </div>
      </footer>
    </div>
  );
}
