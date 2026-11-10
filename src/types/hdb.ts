export type HdbFlatType =
  | "1 ROOM"
  | "2 ROOM"
  | "3 ROOM"
  | "4 ROOM"
  | "5 ROOM"
  | "EXECUTIVE"
  | "MULTI-GENERATION";

export type HdbTown =
  | "ANG MO KIO"
  | "BEDOK"
  | "BISHAN"
  | "BUKIT BATOK"
  | "BUKIT MERAH"
  | "BUKIT PANJANG"
  | "BUKIT TIMAH"
  | "CENTRAL AREA"
  | "CHOA CHU KANG"
  | "CLEMENTI"
  | "GEYLANG"
  | "HOUGANG"
  | "JURONG EAST"
  | "JURONG WEST"
  | "KALLANG/WHAMPOA"
  | "MARINE PARADE"
  | "PASIR RIS"
  | "PUNGGOL"
  | "QUEENSTOWN"
  | "SEMBAWANG"
  | "SENGKANG"
  | "SERANGOON"
  | "TAMPINES"
  | "TOA PAYOH"
  | "WOODLANDS"
  | "YISHUN";

export interface HdbRecord {
  _id: number | string;
  month: string;
  town: HdbTown | string;
  flat_type: HdbFlatType | string;
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
  town: HdbTown | 'ALL';
  flat_type: HdbFlatType | 'ALL';
  searchQuery: string;
}

export interface TownInfo {
  name: HdbTown;
  region: 'Central' | 'East' | 'North' | 'North-East' | 'West';
}
