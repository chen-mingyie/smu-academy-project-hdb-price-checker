export interface HdbRecord {
  _id: number | string;
  month: string;
  town: string;
  flat_type: string;
  block: string;
  street_name: string;
  storey_range: string;
  floor_area_sqm: number;
  flat_model: string;
  lease_commence_date: string | number;
  remaining_lease: string;
  resale_price: number;
}

export interface RawHdbRecord {
  _id: number | string;
  month: string;
  town: string;
  flat_type: string;
  block: string;
  street_name: string;
  storey_range: string;
  floor_area_sqm: string | number;
  flat_model: string;
  lease_commence_date: string | number;
  remaining_lease: string;
  resale_price: string | number;
}

export interface HdbStats {
  count: number;
  high: number;
  low: number;
  mean: number;
  median: number;
  meanPricePerSqm: number;
  highRecord: HdbRecord | null;
  lowRecord: HdbRecord | null;
  recentHigh: number;
  recentLow: number;
  recentMean: number;
}

export interface FilterState {
  town: string;
  flat_type: string;
  searchQuery: string;
}

export interface TownInfo {
  name: string;
  region: 'Central' | 'East' | 'North' | 'North-East' | 'West';
}
