import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Heat2, AirSensor1, Population1, Tree2, Sun1 } from "./icons/UrbanIcons";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Slider } from "./ui/slider";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import {
  fetchDistrictHistory,
  predictNdviEffect,
  type DistrictHistoryRecord,
  type HotspotRecord,
  type ScenarioResponse,
} from "../services/api";

type DataLayer = "NDVI" | "UHI" | "AOD" | "Population" | null;
type TemperatureUnit = "C" | "F" | "K";

interface ExpandableRightPanelProps {
  selectedCity?: string;
  selectedMonth?: string;
  selectedLayer?: DataLayer;
  selectedDistrict?: HotspotRecord | null;
  temperatureUnit?: TemperatureUnit;
  onWidthChange?: (width: number) => void;
}

const celsiusToFahrenheit = (celsius: number): number => (celsius * 9) / 5 + 32;
const celsiusToKelvin = (celsius: number): number => celsius + 273.15;

function formatTemperature(value: number, unit: TemperatureUnit = "C"): string {
  if (unit === "F") {
    return `${celsiusToFahrenheit(value).toFixed(1)}°F`;
  }
  if (unit === "K") {
    return `${celsiusToKelvin(value).toFixed(1)}K`;
  }
  return `${value.toFixed(1)}°C`;
}

function layerValue(record: HotspotRecord, layer: DataLayer): number {
  switch (layer) {
    case "UHI":
      return record.uhi;
    case "AOD":
      return record.aod;
    case "Population":
      return record.population;
    case "NDVI":
    default:
      return record.ndvi;
  }
}

export function ExpandableRightPanel({
  selectedMonth = "",
  selectedLayer = null,
  selectedDistrict = null,
  temperatureUnit = "C",
  onWidthChange,
}: ExpandableRightPanelProps) {
  const [panelWidth, setPanelWidth] = useState(20);
  const [isDragging, setIsDragging] = useState(false);
  const [ndviIncrease, setNdviIncrease] = useState([10]);
  const [history, setHistory] = useState<DistrictHistoryRecord[]>([]);
  const [scenario, setScenario] = useState<ScenarioResponse | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const isExpanded = panelWidth > 40;

  useEffect(() => {
    async function loadDistrictData() {
      if (!selectedDistrict) {
        setHistory([]);
        setScenario(null);
        return;
      }

      try {
        const [districtHistory, prediction] = await Promise.all([
          fetchDistrictHistory(selectedDistrict.district),
          predictNdviEffect(selectedDistrict.district, ndviIncrease[0]),
        ]);
        setHistory(districtHistory);
        setScenario(prediction);
      } catch (error) {
        console.error("Failed to load district analysis data", error);
        setHistory([]);
        setScenario(null);
      }
    }

    loadDistrictData();
  }, [selectedDistrict, ndviIncrease]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    setIsDragging(true);
    event.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging) {
        return;
      }

      const windowWidth = window.innerWidth;
      const mouseX = event.clientX;
      const newWidth = Math.max(20, Math.min(78, ((windowWidth - mouseX) / windowWidth) * 100));
      setPanelWidth(newWidth);
      onWidthChange?.(newWidth);
    },
    [isDragging, onWidthChange],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, isDragging]);

  const toggleExpansion = () => {
    const newWidth = isExpanded ? 20 : 60;
    setPanelWidth(newWidth);
    onWidthChange?.(newWidth);
  };

  const trendData = useMemo(() => {
    return history.map((item) => ({
      month: item.month,
      NDVI: item.ndvi,
      UHI: item.uhi,
      AOD: item.aod,
      Population: item.population,
    }));
  }, [history]);

  const selectedValue = useMemo(() => {
    if (!selectedDistrict || !selectedLayer) {
      return null;
    }
    return layerValue(selectedDistrict, selectedLayer);
  }, [selectedDistrict, selectedLayer]);

  const summaryCards = selectedDistrict
    ? [
        {
          label: "NDVI",
          value: selectedDistrict.ndvi.toFixed(2),
          icon: Tree2,
          tone: "text-green-700",
        },
        {
          label: "UHI",
          value: formatTemperature(selectedDistrict.uhi, temperatureUnit),
          icon: Heat2,
          tone: "text-orange-700",
        },
        {
          label: "AOD",
          value: selectedDistrict.aod.toFixed(2),
          icon: AirSensor1,
          tone: "text-blue-700",
        },
        {
          label: "Population",
          value: selectedDistrict.population.toLocaleString(),
          icon: Population1,
          tone: "text-purple-700",
        },
      ]
    : [];

  return (
    <div
      ref={panelRef}
      className="relative h-full border-l border-border bg-white shadow-lg transition-all duration-300 ease-in-out"
      style={{ width: `${panelWidth}%` }}
    >
      <div
        className="absolute left-0 top-0 z-10 h-full w-1 cursor-col-resize bg-transparent transition-colors duration-200 hover:bg-blue-400"
        onMouseDown={handleMouseDown}
      />

      <div className="absolute left-2 top-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleExpansion}
          className="h-8 w-8 bg-white/90 p-0 shadow-md backdrop-blur-sm hover:shadow-lg"
        >
          {isExpanded ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      <div className={`h-full w-full overflow-y-auto ${isExpanded ? "p-6" : "p-4"} pt-16`}>
        {!selectedDistrict ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-4">
                <MapPin size={48} className="mx-auto text-gray-300" strokeWidth={1.5} />
              </div>
              <p className="max-w-xs text-lg leading-relaxed text-gray-400">
                Select a district on the map to inspect the real backend CSV data.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3
                className={`${isExpanded ? "text-xl" : "text-lg"} text-gray-800`}
                style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 600 }}
              >
                Analysis: {selectedDistrict.city} ({selectedDistrict.district})
              </h3>
              <p className="text-sm text-gray-600">
                Latest month in dataset: {selectedDistrict.month}. Selected layer value:{" "}
                {selectedLayer && selectedValue != null ? String(selectedValue) : "N/A"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {summaryCards.map((card) => (
                <Card key={card.label} className="border-gray-200 bg-[#E8F5E9] shadow-md">
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <card.icon size={16} className={card.tone} strokeWidth={2} />
                      <span className="text-sm text-gray-700">{card.label}</span>
                    </div>
                    <div className={`text-xl font-semibold ${card.tone}`}>{card.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-gray-200 bg-[#E8F5E9] shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-[#2E7D32]">
                  <Sun1 size={20} className="text-[#2E7D32]" strokeWidth={2} />
                  Scenario Planning
                </CardTitle>
                <p className="text-sm text-gray-700">
                  Based on `/predict/ndvi_effect_formula` using the selected district.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-800">Increase NDVI by</label>
                    <span className="text-lg font-bold text-[#2E7D32]">{ndviIncrease[0]}%</span>
                  </div>
                  <Slider
                    value={ndviIncrease}
                    onValueChange={setNdviIncrease}
                    max={50}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-2 flex items-center gap-2">
                      <Heat2 size={16} className="text-red-500" strokeWidth={2} />
                      <span className="text-sm text-gray-700">Predicted temperature change</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      {scenario ? `${scenario.predicted_change.dLST.toFixed(1)}%` : "--"}
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-2 flex items-center gap-2">
                      <AirSensor1 size={16} className="text-blue-500" strokeWidth={2} />
                      <span className="text-sm text-gray-700">Predicted AOD change</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {scenario ? `${scenario.predicted_change.dAOD.toFixed(1)}%` : "--"}
                    </div>
                  </div>
                </div>

                {scenario ? <p className="text-sm text-gray-700">{scenario.explanation}</p> : null}
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-800">District History</CardTitle>
                <p className="text-sm text-gray-600">
                  Uses `/districts/{selectedDistrict.district}/history` from the CSV data.
                </p>
              </CardHeader>
              <CardContent>
                {trendData.length ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="NDVI" stroke="#2E7D32" strokeWidth={2.5} />
                      <Line type="monotone" dataKey="UHI" stroke="#EF6C00" strokeWidth={2.5} />
                      <Line type="monotone" dataKey="AOD" stroke="#0288D1" strokeWidth={2.5} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-gray-500">
                    No history rows are available for this district yet.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-800">Recommendation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-gray-700">
                  {selectedDistrict.recommendation || "No recommendation available."}
                </p>
                <p className="mt-3 text-xs text-gray-500">
                  Current dataset month: {selectedMonth || selectedDistrict.month}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
