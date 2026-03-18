const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export interface HotspotRecord {
  district: string;
  city: string;
  cityLabel?: string;
  month: string;
  ndvi: number;
  uhi: number;
  aod: number;
  population: number;
  ndviChange: number;
  lstChange: number;
  aodChange: number;
  treeEquityNorm: number;
  heatExposureNorm: number;
  airExposureNorm: number;
  recommendation: string;
  priority?: number;
  priorityRankCity?: number;
}

export interface DistrictHistoryRecord {
  district: string;
  month: string;
  ndvi: number;
  uhi: number;
  aod: number;
  population: number;
  ndviChange: number;
  lstChange: number;
  aodChange: number;
}

export interface GeoJsonResponse {
  type: string;
  features: Array<Record<string, unknown>>;
  metadata?: {
    geometry_available?: boolean;
    message?: string;
  };
}

export interface ScenarioResponse {
  district: string;
  mode: string;
  baseline: {
    LST_mean: number;
    AOD_mean: number;
  };
  scenario: {
    LST_mean: number;
    AOD_mean: number;
  };
  predicted_change: {
    dLST: number;
    dAOD: number;
  };
  explanation: string;
}

export interface FilterOption {
  code: string;
  name: string;
}

export interface FilterOptionsResponse {
  cities: FilterOption[];
  months: string[];
}

export interface PriorityCityRanking {
  city: string;
  Priority: number;
}

export interface PriorityDistrictDetail {
  city: string;
  district: string;
  Priority: number;
  city_weight_tree: number;
  city_weight_air: number;
  city_weight_heat: number;
  Priority_rank_city: number;
}

export interface PriorityAutoResponse {
  city_ranking: PriorityCityRanking[];
  district_details: PriorityDistrictDetail[];
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Request failed for ${path}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function normalizeHotspot(record: Record<string, unknown>): HotspotRecord {
  const district = String(record.district ?? record.city_code_full ?? "");
  return {
    district,
    city: String(record.city ?? ""),
    month: String(record.month ?? ""),
    ndvi: Number(record.NDVI_mean ?? 0),
    uhi: Number(record.LST_mean ?? 0),
    aod: Number(record.AOD_mean ?? 0),
    population: Number(record.population ?? 0),
    ndviChange: Number(record.NDVI_change ?? 0),
    lstChange: Number(record.LST_change ?? 0),
    aodChange: Number(record.AOD_change ?? 0),
    treeEquityNorm: Number(record.Tree_Equity_norm ?? 0),
    heatExposureNorm: Number(record.Heat_Exposure_norm ?? 0),
    airExposureNorm: Number(record.Air_Exposure_norm ?? 0),
    recommendation: String(record.Recommendation ?? ""),
    priority: record.Priority == null ? undefined : Number(record.Priority),
    priorityRankCity:
      record.Priority_rank_city == null ? undefined : Number(record.Priority_rank_city),
  };
}

function normalizeHistory(record: Record<string, unknown>): DistrictHistoryRecord {
  return {
    district: String(record.district ?? record.city_code_full ?? ""),
    month: String(record.month ?? ""),
    ndvi: Number(record.NDVI_mean ?? 0),
    uhi: Number(record.LST_mean ?? 0),
    aod: Number(record.AOD_mean ?? 0),
    population: Number(record.population ?? 0),
    ndviChange: Number(record.NDVI_change ?? 0),
    lstChange: Number(record.LST_change ?? 0),
    aodChange: Number(record.AOD_change ?? 0),
  };
}

export async function fetchHotspots(month?: string): Promise<HotspotRecord[]> {
  const path = month ? `/hotspots?month=${encodeURIComponent(month)}` : "/hotspots";
  const data = await fetchJson<Record<string, unknown>[]>(path);
  return data.map(normalizeHotspot);
}

export async function fetchFilterOptions(): Promise<FilterOptionsResponse> {
  return fetchJson<FilterOptionsResponse>("/filter_options");
}

export async function fetchPriorityAuto(month?: string): Promise<PriorityAutoResponse> {
  const path = month ? `/priority_auto?month=${encodeURIComponent(month)}` : "/priority_auto";
  return fetchJson<PriorityAutoResponse>(path);
}

export async function fetchGeoJson(): Promise<GeoJsonResponse> {
  return fetchJson<GeoJsonResponse>("/geojson");
}

export async function fetchDistrictHistory(district: string): Promise<DistrictHistoryRecord[]> {
  const data = await fetchJson<Record<string, unknown>[]>(
    `/districts/${encodeURIComponent(district)}/history`,
  );
  return data.map(normalizeHistory);
}

export async function predictNdviEffect(
  district: string,
  ndviDeltaPct: number,
): Promise<ScenarioResponse> {
  const res = await fetch(`${API_BASE_URL}/predict/ndvi_effect_formula`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      district,
      ndvi_delta_pct: ndviDeltaPct,
      mode: "formula",
    }),
  });

  if (!res.ok) {
    throw new Error(`Prediction failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
