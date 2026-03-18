import { useEffect, useMemo, useState } from "react";

import { fetchPriorityAuto, type PriorityAutoResponse } from "../services/api";

export function HotspotExplorer({
  selectedMonth,
  onSwitchToAnalysis,
}: {
  selectedMonth: string;
  onSwitchToAnalysis: (district: string) => void;
}) {
  const [priorityData, setPriorityData] = useState<PriorityAutoResponse | null>(null);

  useEffect(() => {
    async function loadPriorityData() {
      try {
        const data = await fetchPriorityAuto(selectedMonth);
        setPriorityData(data);
      } catch (error) {
        console.error("Failed to load priority ranking", error);
        setPriorityData(null);
      }
    }

    if (selectedMonth) {
      loadPriorityData();
    }
  }, [selectedMonth]);

  const rankedCities = useMemo(() => {
    if (!priorityData) {
      return [];
    }
    return [...priorityData.city_ranking].sort((a, b) => b.Priority - a.Priority);
  }, [priorityData]);

  const topDistrictByCity = useMemo(() => {
    const mapping = new Map<string, string>();
    if (!priorityData) {
      return mapping;
    }

    const sortedDetails = [...priorityData.district_details].sort(
      (a, b) => b.Priority - a.Priority,
    );

    for (const row of sortedDetails) {
      if (!mapping.has(row.city)) {
        mapping.set(row.city, row.district);
      }
    }

    return mapping;
  }, [priorityData]);

  if (!priorityData) {
    return <p className="mt-10 text-center text-gray-500">Loading hotspot data...</p>;
  }

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Hotspot Explorer</h2>
      <p className="mb-6 text-sm text-gray-600">
        Ranking cities by the backend priority formula for {selectedMonth}.
      </p>
      <div className="grid grid-cols-3 gap-4">
        {rankedCities.map((city, index) => (
          <div
            key={city.city}
            className="rounded-lg border border-gray-200 bg-white/80 p-4 shadow-sm backdrop-blur transition hover:shadow-md"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold text-gray-900">{city.city}</p>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                #{index + 1}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Top mapped unit: {topDistrictByCity.get(city.city) ?? "N/A"}
            </p>
            <p className="mt-3 text-sm text-gray-600">
              Priority score: {city.Priority.toFixed(3)}
            </p>
            <button
              onClick={() => {
                const district = topDistrictByCity.get(city.city);
                if (district) {
                  onSwitchToAnalysis(district);
                }
              }}
              className="mt-2 text-xs text-blue-600 hover:underline"
            >
              View analysis
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
