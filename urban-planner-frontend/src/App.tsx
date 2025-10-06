import { useState } from 'react';
import { LeftSidebar } from './components/LeftSidebar';
import { MapView } from './components/MapView';
import { ExpandableRightPanel } from './components/ExpandableRightPanel';
import { HotspotExplorer } from './components/HotspotExplorer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { XanhLogo } from './components/XanhLogo';

type DataLayer = 'NDVI' | 'UHI' | 'AOD' | 'Population' | null;
type AppMode = 'analysis' | 'hotspot';
type TemperatureUnit = 'C' | 'F' | 'K';

export default function App() {
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [rightPanelWidth, setRightPanelWidth] = useState(20);
  const [activeTab, setActiveTab] = useState<AppMode>('analysis');
  
  // Analysis Mode State
  const [selectedCity, setSelectedCity] = useState('San Francisco');
  const [selectedMonth, setSelectedMonth] = useState('Jan');
  const [selectedLayer, setSelectedLayer] = useState<DataLayer>('NDVI');
  const [selectedArea, setSelectedArea] = useState<{ name: string; value: number } | null>(null);
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('C');

  const handleZoomToLocation = (coordinates: [number, number]) => {
    setMapCenter(coordinates);
    console.log('Zooming to:', coordinates);
  };

  const handleRightPanelWidthChange = (width: number) => {
    setRightPanelWidth(width);
  };

  const handleSwitchToAnalysis = (district: string) => {
    setActiveTab('analysis');
    // Optionally filter or highlight the district in analysis mode
    console.log('Switching to analysis mode for:', district);
  };

  const handleReset = () => {
    setSelectedArea(null);
    setMapCenter(null);
  };

  // Mock map click handler - simulate selecting an area
  const handleMapClick = () => {
    // In real implementation, this would be triggered by actual map clicks
    // For now, we'll simulate with mock data based on selected layer
    const mockValues: Record<string, number> = {
      'NDVI': 0.32,
      'UHI': 8.5,
      'AOD': 65,
      'Population': 13.2
    };
    
    if (selectedLayer) {
      setSelectedArea({
        name: 'Selected District',
        value: mockValues[selectedLayer]
      });
    }
  };

  // Calculate map width dynamically (22% left sidebar + dynamic right panel)
  const mapWidth = activeTab === 'analysis' ? 100 - 22 - rightPanelWidth : 100 - 22;

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/30">
      {/* Top Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AppMode)} className="flex flex-col h-full">
        <div className="border-b border-gray-200 bg-white shadow-sm px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center gap-6">
              <XanhLogo size="default" />
            </div>
            
            {/* Center: Title */}
            <div className="flex-1 flex justify-center">
              <div className="text-center">
                <h1 className="text-2xl tracking-tight" style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: 700 }}>
                  <span className="bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] bg-clip-text text-transparent">
                    XANHINSIGHTS
                  </span>
                  <span className="text-gray-700"> – </span>
                  <span className="text-[#2E7D32]">The Green Urban Planning Dashboard</span>
                </h1>
              </div>
            </div>
            
            {/* Right: Tab Navigation */}
            <TabsList className="grid w-auto grid-cols-2 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger value="analysis" className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                📊 Analysis Mode
              </TabsTrigger>
              <TabsTrigger value="hotspot" className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                📍 Hotspot Explorer
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Analysis Mode Tab */}
        <TabsContent value="analysis" className="flex-1 m-0 flex">
          {/* Left Sidebar - Fixed 22% width */}
          <div className="w-[22%] h-full border-r border-border/60 flex-shrink-0 bg-white/60 backdrop-blur-sm">
            <LeftSidebar 
              selectedCity={selectedCity}
              selectedMonth={selectedMonth}
              selectedLayer={selectedLayer}
              temperatureUnit={temperatureUnit}
              onCityChange={setSelectedCity}
              onMonthChange={setSelectedMonth}
              onLayerChange={setSelectedLayer}
              onTemperatureUnitChange={setTemperatureUnit}
              onReset={handleReset}
            />
          </div>

          {/* Main Map Area - Dynamic width */}
          <div 
            className="h-full transition-all duration-300 ease-in-out p-6"
            style={{ width: `${100 - 22 - rightPanelWidth}%` }}
          >
            <div className="mb-4 bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/60">
              <p className="text-gray-700 text-sm leading-relaxed">
                Monitor vegetation, heat islands, air quality, and population density across urban areas
              </p>
              {selectedLayer && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200/50">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-sm">
                    <span className="text-xs text-white font-medium">Active Layer</span>
                  </div>
                  <span className="text-sm text-gray-900 font-medium">{selectedLayer}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">{selectedCity}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">{selectedMonth} 2024</span>
                </div>
              )}
            </div>
            
            {/* Map Container */}
            <div className="h-[calc(100%-5.5rem)] rounded-2xl overflow-hidden shadow-xl border border-white/60" onClick={handleMapClick}>
              <MapView
                onSelectDistrict={(district, data) => {
                  console.log("Selected district:", district, data);
                   setSelectedArea({ name: district, value: data.ndvi });
         }}
       />

            </div>
          </div>

          {/* Expandable Right Panel */}
          <ExpandableRightPanel 
            selectedCity={selectedCity}
            selectedMonth={selectedMonth}
            selectedLayer={selectedLayer}
            selectedArea={selectedArea}
            temperatureUnit={temperatureUnit}
            onZoomToLocation={handleZoomToLocation}
            onWidthChange={handleRightPanelWidthChange}
          />
        </TabsContent>

        {/* Hotspot Explorer Tab */}
        <TabsContent value="hotspot" className="flex-1 m-0">
          <HotspotExplorer 
            temperatureUnit={temperatureUnit}
            onSwitchToAnalysis={handleSwitchToAnalysis} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}