import { useEffect, useState } from "react";

import { ExpandableRightPanel } from "./components/ExpandableRightPanel";
import { HotspotExplorer } from "./components/HotspotExplorer";
import { LeftSidebar } from "./components/LeftSidebar";
import { MapView } from "./components/MapView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { XanhLogo } from "./components/XanhLogo";
import { fetchFilterOptions, fetchHotspots, type FilterOption, type HotspotRecord } from "./services/api";

type DataLayer = "NDVI" | "UHI" | "AOD" | "Population" | null;
type AppMode = "analysis" | "hotspot";
type TemperatureUnit = "C" | "F" | "K";

export default function App() {
  const [rightPanelWidth, setRightPanelWidth] = useState(20);
  const [activeTab, setActiveTab] = useState<AppMode>("analysis");
  const [selectedCity, setSelectedCity] = useState("ALAMEDA");
  const [selectedMonth, setSelectedMonth] = useState("2024-01");
  const [selectedLayer, setSelectedLayer] = useState<DataLayer>("NDVI");
  const [selectedDistrict, setSelectedDistrict] = useState<HotspotRecord | null>(null);
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>("C");
  const [cityOptions, setCityOptions] = useState<FilterOption[]>([]);
  const [monthOptions, setMonthOptions] = useState<string[]>([]);
  const [hotspots, setHotspots] = useState<HotspotRecord[]>([]);

  useEffect(() => {
    async function loadFilters() {
      try {
        const options = await fetchFilterOptions();
        setCityOptions(options.cities);
        setMonthOptions(options.months);

        if (options.months.length) {
          setSelectedMonth(options.months[options.months.length - 1]);
        }
        if (options.cities.length) {
          setSelectedCity(options.cities[0].code);
        }
      } catch (error) {
        console.error("Failed to load filter options", error);
      }
    }

    loadFilters();
  }, []);

  useEffect(() => {
    async function loadHotspotsForMonth() {
      try {
        const data = await fetchHotspots(selectedMonth);
        setHotspots(data);

        const preferred =
          data.find((item) => item.district === selectedCity) ??
          data.find((item) => item.district === selectedDistrict?.district) ??
          data[0] ??
          null;

        setSelectedDistrict(preferred);
        if (preferred) {
          setSelectedCity(preferred.district);
        }
      } catch (error) {
        console.error("Failed to load hotspots for selected month", error);
      }
    }

    if (selectedMonth) {
      loadHotspotsForMonth();
    }
  }, [selectedMonth]);

  const handleSelectDistrict = (district: HotspotRecord) => {
    setSelectedDistrict(district);
    setSelectedCity(district.district);
    setActiveTab("analysis");
  };

  const handleCityChange = (cityCode: string) => {
    setSelectedCity(cityCode);
    const match = hotspots.find((item) => item.district === cityCode);
    if (match) {
      setSelectedDistrict(match);
    }
  };

  const handleSwitchToAnalysis = (districtId: string) => {
    if (selectedDistrict?.district === districtId) {
      setActiveTab("analysis");
      return;
    }

    Promise.resolve(hotspots)
      .then((allHotspots) => {
        const match = allHotspots.find((item) => item.district === districtId);
        if (match) {
          handleSelectDistrict(match);
        }
      })
      .catch((error) => {
        console.error("Failed to switch hotspot into analysis mode", error);
      });
  };

  const handleReset = () => {
    setSelectedDistrict(null);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/30">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as AppMode)}
        className="flex h-full flex-col"
      >
        <div className="border-b border-gray-200 bg-white px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <XanhLogo size="default" />
            </div>

            <div className="flex flex-1 justify-center">
              <div className="text-center">
                <h1
                  className="text-2xl tracking-tight"
                  style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 700 }}
                >
                  <span className="bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] bg-clip-text text-transparent">
                    XANHINSIGHTS
                  </span>
                  <span className="text-gray-700"> - </span>
                  <span className="text-[#2E7D32]">The Green Urban Planning Dashboard</span>
                </h1>
              </div>
            </div>

            <TabsList className="grid w-auto grid-cols-2 rounded-xl bg-gray-100 p-1">
              <TabsTrigger
                value="analysis"
                className="rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Analysis Mode
              </TabsTrigger>
              <TabsTrigger
                value="hotspot"
                className="rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Hotspot Explorer
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="analysis" className="m-0 flex flex-1">
          <div className="h-full w-[22%] flex-shrink-0 border-r border-border/60 bg-white/60 backdrop-blur-sm">
            <LeftSidebar
              selectedCity={selectedCity}
              selectedMonth={selectedMonth}
              cityOptions={cityOptions}
              monthOptions={monthOptions}
              selectedLayer={selectedLayer}
              temperatureUnit={temperatureUnit}
              onCityChange={handleCityChange}
              onMonthChange={setSelectedMonth}
              onLayerChange={setSelectedLayer}
              onTemperatureUnitChange={setTemperatureUnit}
              onReset={handleReset}
            />
          </div>

          <div
            className="h-full p-6 transition-all duration-300 ease-in-out"
            style={{ width: `${100 - 22 - rightPanelWidth}%` }}
          >
            <div className="mb-4 rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-md">
              <p className="text-sm leading-relaxed text-gray-700">
                Monitor vegetation, heat, air quality, and population metrics from the
                backend CSV data.
              </p>
              {selectedLayer && selectedDistrict ? (
                <div className="mt-3 flex items-center gap-2 border-t border-gray-200/50 pt-3">
                  <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 shadow-sm">
                    <span className="text-xs font-medium text-white">Active Layer</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{selectedLayer}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">
                    {selectedDistrict.city} ({selectedDistrict.district})
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">{selectedDistrict.month}</span>
                </div>
              ) : null}
            </div>

            <div className="h-[calc(100%-5.5rem)] overflow-hidden rounded-2xl border border-white/60 shadow-xl">
              <MapView
                selectedLayer={selectedLayer}
                hotspots={hotspots}
                selectedDistrict={selectedDistrict?.district}
                onSelectDistrict={handleSelectDistrict}
              />
            </div>
          </div>

          <ExpandableRightPanel
            selectedCity={selectedCity}
            selectedMonth={selectedMonth}
            selectedLayer={selectedLayer}
            selectedDistrict={selectedDistrict}
            temperatureUnit={temperatureUnit}
            onWidthChange={setRightPanelWidth}
          />
        </TabsContent>

        <TabsContent value="hotspot" className="m-0 flex-1">
          <HotspotExplorer
            selectedMonth={selectedMonth}
            onSwitchToAnalysis={handleSwitchToAnalysis}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
