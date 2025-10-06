import { useEffect, useState } from "react";
import { fetchHotspots } from "../services/api";

export function HotspotExplorer({ temperatureUnit, onSwitchToAnalysis }: any) {
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchHotspots();
        setHotspots(data);
      } catch (err) {
        console.error("Error fetching hotspots:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading hotspot data...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Hotspot Explorer</h2>
      <div className="grid grid-cols-3 gap-4">
        {hotspots.map((h, idx) => (
          <div key={idx} className="p-4 rounded-lg shadow-sm bg-white/80 backdrop-blur border border-gray-200 hover:shadow-md transition">
            <p className="font-semibold text-gray-900">{h.district}</p>
            <p className="text-sm text-gray-600">🌿 NDVI: {h.ndvi}</p>
            <p className="text-sm text-gray-600">🔥 UHI: {h.uhi}°{temperatureUnit}</p>
            <p className="text-sm text-gray-600">💨 AOD: {h.aod}</p>
            <p className="text-sm text-gray-600">👥 Population: {h.population}</p>
            <p className="mt-2 text-xs text-emerald-700 font-medium">{h.recommendation}</p>
            <button
              onClick={() => onSwitchToAnalysis(h.district)}
              className="mt-2 text-xs text-blue-600 hover:underline"
            >
              → View Analysis
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
