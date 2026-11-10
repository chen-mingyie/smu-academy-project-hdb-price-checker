import React from 'react';
import { FilterState } from '../types/hdb';
import { HDB_TOWNS, FLAT_TYPES, POPULAR_TOWNS } from '../data/constants';
import { Search, RotateCcw, MapPin, Home } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
  totalFound: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalFound,
}) => {
  // Group towns by region
  const regions = ['Central', 'East', 'North', 'North-East', 'West'] as const;

  const handleTownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      town: e.target.value as FilterState['town'],
    });
  };

  const handleFlatTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      flat_type: e.target.value as FilterState['flat_type'],
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchQuery: e.target.value,
    });
  };

  const selectTown = (town: FilterState['town']) => {
    onFilterChange({
      ...filters,
      town,
    });
  };

  const isFiltered =
    filters.town !== 'ALL' ||
    filters.flat_type !== 'ALL' ||
    filters.searchQuery.trim() !== '';

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
      {/* Primary Dropdowns Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Town Dropdown */}
        <div className="md:col-span-4">
          <label
            htmlFor="town-select"
            className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
          >
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-500" />
              Town (HDB Estate)
            </span>
          </label>
          <div className="relative">
            <select
              id="town-select"
              value={filters.town}
              onChange={handleTownChange}
              className="w-full bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-neutral-300 text-neutral-900 text-sm font-medium rounded-lg px-3.5 py-2.5 transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 cursor-pointer"
            >
              <option value="ALL">All Towns (Islandwide Singapore)</option>
              {regions.map((region) => {
                const townsInRegion = HDB_TOWNS.filter(
                  (t) => t.region === region
                );
                return (
                  <optgroup key={region} label={`— ${region} Region —`}>
                    {townsInRegion.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>
        </div>

        {/* Flat Type Dropdown */}
        <div className="md:col-span-4">
          <label
            htmlFor="flat-type-select"
            className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
          >
            <span className="inline-flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-neutral-500" />
              Flat Type
            </span>
          </label>
          <div className="relative">
            <select
              id="flat-type-select"
              value={filters.flat_type}
              onChange={handleFlatTypeChange}
              className="w-full bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-neutral-300 text-neutral-900 text-sm font-medium rounded-lg px-3.5 py-2.5 transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 cursor-pointer"
            >
              <option value="ALL">All Flat Types</option>
              {FLAT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Optional Street / Block Search */}
        <div className="md:col-span-3">
          <label
            htmlFor="street-search"
            className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
          >
            <span className="inline-flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-neutral-500" />
              Street or Block
            </span>
          </label>
          <div className="relative">
            <input
              id="street-search"
              type="text"
              placeholder="e.g. Ave 4, 809, Sin Ming..."
              value={filters.searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-neutral-300 text-neutral-900 text-sm rounded-lg px-3.5 py-2.5 transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
            />
          </div>
        </div>

        {/* Reset / Clear Button */}
        <div className="md:col-span-1">
          <button
            onClick={onReset}
            disabled={!isFiltered}
            className="w-full py-2.5 px-3 border border-neutral-300 rounded-lg text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            title="Reset to default filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="md:hidden">Reset</span>
          </button>
        </div>
      </div>

      {/* Quick Select Popular Towns & Filter Summary */}
      <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-neutral-500 mr-1">Popular Towns:</span>
          {POPULAR_TOWNS.map((t) => {
            const isActive = filters.town === t;
            return (
              <button
                key={t}
                onClick={() => selectTown(isActive ? 'ALL' : t)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        <div className="text-neutral-500 font-mono">
          <span>{totalFound}</span> matching transactions found
        </div>
      </div>
    </div>
  );
};
