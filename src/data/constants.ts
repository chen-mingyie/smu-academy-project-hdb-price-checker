import { TownInfo, HdbFlatType, HdbTown } from '../types/hdb';

export const HDB_TOWNS: TownInfo[] = [
  { name: 'ANG MO KIO', region: 'North-East' },
  { name: 'BEDOK', region: 'East' },
  { name: 'BISHAN', region: 'Central' },
  { name: 'BUKIT BATOK', region: 'West' },
  { name: 'BUKIT MERAH', region: 'Central' },
  { name: 'BUKIT PANJANG', region: 'West' },
  { name: 'BUKIT TIMAH', region: 'Central' },
  { name: 'CENTRAL AREA', region: 'Central' },
  { name: 'CHOA CHU KANG', region: 'West' },
  { name: 'CLEMENTI', region: 'West' },
  { name: 'GEYLANG', region: 'Central' },
  { name: 'HOUGANG', region: 'North-East' },
  { name: 'JURONG EAST', region: 'West' },
  { name: 'JURONG WEST', region: 'West' },
  { name: 'KALLANG/WHAMPOA', region: 'Central' },
  { name: 'MARINE PARADE', region: 'East' },
  { name: 'PASIR RIS', region: 'East' },
  { name: 'PUNGGOL', region: 'North-East' },
  { name: 'QUEENSTOWN', region: 'Central' },
  { name: 'SEMBAWANG', region: 'North' },
  { name: 'SENGKANG', region: 'North-East' },
  { name: 'SERANGOON', region: 'North-East' },
  { name: 'TAMPINES', region: 'East' },
  { name: 'TOA PAYOH', region: 'Central' },
  { name: 'WOODLANDS', region: 'North' },
  { name: 'YISHUN', region: 'North' },
];

export const FLAT_TYPES: readonly HdbFlatType[] = [
  '1 ROOM',
  '2 ROOM',
  '3 ROOM',
  '4 ROOM',
  '5 ROOM',
  'EXECUTIVE',
  'MULTI-GENERATION',
] as const;

export const POPULAR_TOWNS: readonly HdbTown[] = [
  'TAMPINES',
  'BISHAN',
  'PUNGGOL',
  'QUEENSTOWN',
  'BEDOK',
  'TOA PAYOH',
] as const;

export const SQM_TO_SQFT_FACTOR = 10.7639;

export function formatSGD(amount: number): string {
  if (isNaN(amount) || amount === 0) return '$0';
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-SG').format(Math.round(val));
}
