import { FilterState, HdbRecord, HdbStats } from '../types/hdb';
import { FALLBACK_HDB_RECORDS } from '../data/fallbackRecords';

export function calculateStats(records: HdbRecord[], recentLimit = 5): HdbStats {
  if (!records || records.length === 0) {
    return {
      count: 0,
      high: 0,
      low: 0,
      mean: 0,
      median: 0,
      meanPricePerSqm: 0,
      highRecord: null,
      lowRecord: null,
      recentHigh: 0,
      recentLow: 0,
      recentMean: 0,
    };
  }

  // Sorted by price for high/low/median
  const prices = records.map((r) => r.resale_price).sort((a, b) => a - b);
  const count = records.length;
  const low = prices[0];
  const high = prices[count - 1];
  const sum = prices.reduce((acc, curr) => acc + curr, 0);
  const mean = Math.round(sum / count);

  const median =
    count % 2 === 0
      ? Math.round((prices[count / 2 - 1] + prices[count / 2]) / 2)
      : prices[Math.floor(count / 2)];

  // Mean price per sqm
  const validPsmRecords = records.filter(
    (r) => r.floor_area_sqm && r.floor_area_sqm > 0
  );
  const meanPricePerSqm =
    validPsmRecords.length > 0
      ? Math.round(
          validPsmRecords.reduce(
            (acc, r) => acc + r.resale_price / r.floor_area_sqm,
            0
          ) / validPsmRecords.length
        )
      : 0;

  const highRecord = records.find((r) => r.resale_price === high) || null;
  const lowRecord = records.find((r) => r.resale_price === low) || null;

  // Stats for the 5 most recent transactions
  const recentRecords = records.slice(0, recentLimit);
  const recentPrices = recentRecords.map((r) => r.resale_price);
  const recentHigh = recentPrices.length > 0 ? Math.max(...recentPrices) : 0;
  const recentLow = recentPrices.length > 0 ? Math.min(...recentPrices) : 0;
  const recentSum = recentPrices.reduce((acc, curr) => acc + curr, 0);
  const recentMean =
    recentRecords.length > 0 ? Math.round(recentSum / recentRecords.length) : 0;

  return {
    count,
    high,
    low,
    mean,
    median,
    meanPricePerSqm,
    highRecord,
    lowRecord,
    recentHigh,
    recentLow,
    recentMean,
  };
}

/**
 * Fetch HDB resale transactions via our Express backend at /api/hdb
 * which proxies the official data.gov.sg datastore_search API.
 */
export async function fetchHdbTransactions(
  filters: FilterState
): Promise<{ records: HdbRecord[]; isLive: boolean; stats?: HdbStats }> {
  try {
    const queryParams = new URLSearchParams();
    if (filters.town && filters.town !== 'ALL') {
      queryParams.set('town', filters.town);
    }
    if (filters.flat_type && filters.flat_type !== 'ALL') {
      queryParams.set('flat_type', filters.flat_type);
    }
    queryParams.set('limit', '100');
    queryParams.set('sort', 'month desc');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`/api/hdb?${queryParams.toString()}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`/api/hdb returned status ${res.status}`);
    }

    const json = await res.json();
    if (json.success && Array.isArray(json.records)) {
      return {
        records: json.records,
        isLive: Boolean(json.isLive),
        stats: json.stats,
      };
    }
    throw new Error('Malformed backend API response');
  } catch (err) {
    console.warn('Backend proxy fetch failed, falling back to local dataset:', err);

    // Fall back to built-in verified dataset
    let filtered = [...FALLBACK_HDB_RECORDS];

    if (filters.town && filters.town !== 'ALL') {
      filtered = filtered.filter((r) => r.town === filters.town);
    }
    if (filters.flat_type && filters.flat_type !== 'ALL') {
      filtered = filtered.filter((r) => r.flat_type === filters.flat_type);
    }

    filtered.sort((a, b) => {
      if (b.month !== a.month) {
        return b.month.localeCompare(a.month);
      }
      return Number(b._id) - Number(a._id);
    });

    return { records: filtered, isLive: false };
  }
}
