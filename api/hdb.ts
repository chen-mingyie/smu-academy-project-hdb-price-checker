import { Router, Request, Response } from 'express';
import { FALLBACK_HDB_RECORDS } from '../src/data/fallbackRecords';
import { HdbFlatType, HdbTown } from '../src/types/hdb';

export const hdbRouter = Router();

const DATA_GOV_SG_URL = 'https://data.gov.sg/api/action/datastore_search';
const DEFAULT_RESOURCE_ID = 'd_8b84c4ee58e3cfc0ece0d773c8ca6abc';

export interface RawApiRecord {
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

export interface FormattedRecord {
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

function computeStatistics(records: FormattedRecord[], recentCount = 5) {
  if (!records || records.length === 0) {
    return {
      count: 0,
      high: 0,
      low: 0,
      mean: 0,
      median: 0,
      meanPricePerSqm: 0,
      recentHigh: 0,
      recentLow: 0,
      recentMean: 0,
    };
  }

  const prices = records.map((r) => r.resale_price).sort((a, b) => a - b);
  const count = prices.length;
  const low = prices[0];
  const high = prices[count - 1];
  const sum = prices.reduce((acc, curr) => acc + curr, 0);
  const mean = Math.round(sum / count);

  const median =
    count % 2 === 0
      ? Math.round((prices[count / 2 - 1] + prices[count / 2]) / 2)
      : prices[Math.floor(count / 2)];

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

  const recentRecords = records.slice(0, recentCount);
  const recentPrices = recentRecords.map((r) => r.resale_price);
  const recentHigh = recentPrices.length > 0 ? Math.max(...recentPrices) : 0;
  const recentLow = recentPrices.length > 0 ? Math.min(...recentPrices) : 0;
  const recentSum = recentPrices.reduce((acc, curr) => acc + curr, 0);
  const recentMean =
    recentPrices.length > 0 ? Math.round(recentSum / recentPrices.length) : 0;

  return {
    count,
    high,
    low,
    mean,
    median,
    meanPricePerSqm,
    recentHigh,
    recentLow,
    recentMean,
  };
}

/**
 * GET /api/hdb
 * Query parameters:
 *  - town: e.g. "TAMPINES" (optional, default: "ALL")
 *  - flat_type: e.g. "4 ROOM" (optional, default: "ALL")
 *  - limit: number (optional, default: 100)
 *  - sort: string (optional, default: "month desc")
 *  - resource_id: string (optional, default: d_8b84c4ee58e3cfc0ece0d773c8ca6abc)
 */
hdbRouter.get('/', async (req: Request, res: Response) => {
  const {
    town,
    flat_type,
    limit = '100',
    sort = 'month desc',
    resource_id = DEFAULT_RESOURCE_ID,
  } = req.query;

  const filtersObj: Record<string, string> = {};
  if (typeof town === 'string' && town.trim() !== '' && town !== 'ALL') {
    filtersObj.town = town.trim();
  }
  if (
    typeof flat_type === 'string' &&
    flat_type.trim() !== '' &&
    flat_type !== 'ALL'
  ) {
    filtersObj.flat_type = flat_type.trim();
  }

  // Construct Data.gov.sg URL parameters matching the user's curl specification:
  // curl -G "https://data.gov.sg/api/action/datastore_search" \
  //   --data-urlencode "resource_id=d_8b84c4ee58e3cfc0ece0d773c8ca6abc" \
  //   --data-urlencode 'filters={"town":"TAMPINES","flat_type":"4 ROOM"}' \
  //   --data-urlencode "limit=5" \
  //   --data-urlencode "sort=month desc"
  const params = new URLSearchParams();
  params.set('resource_id', String(resource_id));
  params.set('limit', String(limit));
  params.set('sort', String(sort));

  if (Object.keys(filtersObj).length > 0) {
    params.set('filters', JSON.stringify(filtersObj));
  }

  const targetUrl = `${DATA_GOV_SG_URL}?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const apiResponse = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeout);

    if (!apiResponse.ok) {
      throw new Error(`Data.gov.sg returned HTTP ${apiResponse.status}`);
    }

    const json = await apiResponse.json();
    if (json.success && json.result && Array.isArray(json.result.records)) {
      const records: FormattedRecord[] = json.result.records.map(
        (r: RawApiRecord) => ({
          _id: r._id,
          month: r.month,
          town: r.town,
          flat_type: r.flat_type,
          block: r.block,
          street_name: r.street_name,
          storey_range: r.storey_range,
          floor_area_sqm:
            typeof r.floor_area_sqm === 'number'
              ? r.floor_area_sqm
              : parseFloat(r.floor_area_sqm) || 0,
          flat_model: r.flat_model,
          lease_commence_date: r.lease_commence_date,
          remaining_lease: r.remaining_lease,
          resale_price:
            typeof r.resale_price === 'number'
              ? r.resale_price
              : parseFloat(r.resale_price) || 0,
        })
      );

      // Sort chronological descending (latest month first, then latest record ID)
      records.sort((a, b) => {
        if (b.month !== a.month) {
          return b.month.localeCompare(a.month);
        }
        return Number(b._id) - Number(a._id);
      });

      const stats = computeStatistics(records, 5);

      return res.json({
        success: true,
        source: 'data.gov.sg',
        isLive: true,
        filters: filtersObj,
        total: records.length,
        stats,
        records,
      });
    }

    throw new Error('Malformed response from Data.gov.sg');
  } catch (error) {
    console.warn('Data.gov.sg upstream failed, using local dataset:', error);

    // Filter local fallback records
    let fallback = [...FALLBACK_HDB_RECORDS];
    if (filtersObj.town) {
      fallback = fallback.filter((r) => r.town === filtersObj.town);
    }
    if (filtersObj.flat_type) {
      fallback = fallback.filter((r) => r.flat_type === filtersObj.flat_type);
    }

    fallback.sort((a, b) => {
      if (b.month !== a.month) {
        return b.month.localeCompare(a.month);
      }
      return Number(b._id) - Number(a._id);
    });

    const parsedLimit = parseInt(String(limit), 10) || 100;
    const sliced = fallback.slice(0, parsedLimit);
    const stats = computeStatistics(sliced, 5);

    return res.json({
      success: true,
      source: 'fallback',
      isLive: false,
      filters: filtersObj,
      total: sliced.length,
      stats,
      records: sliced,
      note: 'Fetched from verified local Singapore HDB dataset',
    });
  }
});
