import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Tree1, Heat1, Wind1, Population1 } from './icons/UrbanIcons';
import { Thermometer } from 'lucide-react';

type DataLayer = 'NDVI' | 'UHI' | 'AOD' | 'Population' | null;
type TemperatureUnit = 'C' | 'F' | 'K';

interface LeftSidebarProps {
  selectedCity: string;
  selectedMonth: string;
  selectedLayer: DataLayer;
  temperatureUnit: TemperatureUnit;
  onCityChange: (city: string) => void;
  onMonthChange: (month: string) => void;
  onLayerChange: (layer: DataLayer) => void;
  onTemperatureUnitChange: (unit: TemperatureUnit) => void;
  onReset: () => void;
}

export function LeftSidebar({ 
  selectedCity, 
  selectedMonth, 
  selectedLayer,
  temperatureUnit,
  onCityChange,
  onMonthChange,
  onLayerChange,
  onTemperatureUnitChange,
  onReset
}: LeftSidebarProps) {
  const cities = [
    'San Francisco', 'New York City', 'Los Angeles', 'Chicago', 'Houston', 
    'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas'
  ];

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const layers = [
    { id: 'NDVI', label: 'NDVI (Vegetation)', color: 'from-green-100 to-green-300', icon: Tree1, stroke: '#2E7D32' },
    { id: 'UHI', label: 'Urban Heat Island', color: 'from-orange-100 to-orange-300', icon: Heat1, stroke: '#EF6C00' },
    { id: 'AOD', label: 'AOD (Aerosol Optical Depth)', color: 'from-blue-100 to-blue-300', icon: Wind1, stroke: '#0288D1' },
    { id: 'Population', label: 'Population', color: 'from-purple-100 to-purple-300', icon: Population1, stroke: '#6A1B9A' }
  ];

  const handleLayerSelect = (layerId: string) => {
    onLayerChange(layerId as DataLayer);
  };

  const activeLayerInfo = layers.find(layer => layer.id === selectedLayer);

  return (
    <div className="w-full h-full p-5 flex flex-col gap-4 overflow-y-auto">
      {/* Filters Section */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm">
        <CardContent className="p-5">
          <h3 className="mb-4 text-gray-900 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
            Filters
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm text-gray-700 font-medium">Select City</label>
              <Select value={selectedCity} onValueChange={onCityChange}>
                <SelectTrigger className="bg-white border-gray-200 hover:border-emerald-300 transition-colors shadow-sm">
                  <SelectValue placeholder="Choose a city..." />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-700 font-medium">Select Month</label>
              <Select value={selectedMonth} onValueChange={onMonthChange}>
                <SelectTrigger className="bg-white border-gray-200 hover:border-emerald-300 transition-colors shadow-sm">
                  <SelectValue placeholder="Choose a month..." />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month} value={month}>{month} 2024</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Layers Section - Single Select */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm">
        <CardContent className="p-5">
          <h3 className="mb-2 text-gray-900 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
            Data Layers
          </h3>
          <p className="text-xs text-gray-500 mb-4">Select one layer to analyze</p>
          
          <RadioGroup value={selectedLayer || ''} onValueChange={handleLayerSelect}>
            <div className="space-y-2">
              {layers.map(layer => {
                const IconComponent = layer.icon;
                const isSelected = selectedLayer === layer.id;
                return (
                  <div key={layer.id} className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 border ${
                    isSelected 
                      ? 'bg-white shadow-md border-emerald-200 scale-[1.02]' 
                      : 'bg-white/50 border-transparent hover:bg-white/80 hover:shadow-sm'
                  }`}>
                    <RadioGroupItem value={layer.id} id={layer.id} className={isSelected ? 'border-emerald-500' : ''} />
                    <IconComponent 
                      size={20} 
                      className={isSelected ? 'text-gray-800' : 'text-gray-500'} 
                      strokeWidth={2.5} 
                      style={{ color: isSelected ? layer.stroke : undefined }}
                    />
                    <label 
                      htmlFor={layer.id} 
                      className={`cursor-pointer flex-1 text-sm ${isSelected ? 'font-medium text-gray-900' : 'text-gray-600'}`}
                    >
                      {layer.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Legend Section */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm">
        <CardContent className="p-5">
          <h3 className="mb-4 text-gray-900 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
            Legend
          </h3>
          
          {activeLayerInfo ? (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <activeLayerInfo.icon size={18} strokeWidth={2.5} style={{ color: activeLayerInfo.stroke }} />
                <p className="text-sm font-medium text-gray-900">{activeLayerInfo.label}</p>
              </div>
              <div className={`h-5 w-full bg-gradient-to-r ${activeLayerInfo.color} rounded-lg shadow-inner border border-gray-200`}></div>
              <div className="flex justify-between mt-3 text-xs text-gray-500 font-medium">
                <span>Low</span>
                <span>High</span>
              </div>
              {selectedLayer === 'NDVI' && (
                <div className="flex justify-between mt-2 text-xs text-gray-800 font-semibold">
                  <span>0.1</span>
                  <span>0.9</span>
                </div>
              )}
              {selectedLayer === 'UHI' && (
                <div className="flex justify-between mt-2 text-xs text-gray-800 font-semibold">
                  <span>
                    {temperatureUnit === 'C' ? '25°C' : temperatureUnit === 'F' ? '77°F' : '298K'}
                  </span>
                  <span>
                    {temperatureUnit === 'C' ? '45°C' : temperatureUnit === 'F' ? '113°F' : '318K'}
                  </span>
                </div>
              )}
              {selectedLayer === 'AOD' && (
                <div className="flex justify-between mt-2 text-xs text-gray-800 font-semibold">
                  <span>0 AOD</span>
                  <span>1.5 AOD</span>
                </div>
              )}
              {selectedLayer === 'Population' && (
                <div className="flex justify-between mt-2 text-xs text-gray-800 font-semibold">
                  <span>Low</span>
                  <span>High</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic text-center py-6">Select a data layer to view legend</p>
          )}
        </CardContent>
      </Card>

      {/* Temperature Unit Toggle */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-sm">
              <Thermometer size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-gray-900 font-medium">Temperature Unit</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={temperatureUnit === 'C' ? 'default' : 'outline'}
              size="sm"
              className={`transition-all ${temperatureUnit === 'C' ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md' : 'bg-white hover:bg-orange-50 border-gray-200'}`}
              onClick={() => onTemperatureUnitChange('C')}
            >
              °C
            </Button>
            <Button
              variant={temperatureUnit === 'F' ? 'default' : 'outline'}
              size="sm"
              className={`transition-all ${temperatureUnit === 'F' ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md' : 'bg-white hover:bg-orange-50 border-gray-200'}`}
              onClick={() => onTemperatureUnitChange('F')}
            >
              °F
            </Button>
            <Button
              variant={temperatureUnit === 'K' ? 'default' : 'outline'}
              size="sm"
              className={`transition-all ${temperatureUnit === 'K' ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md' : 'bg-white hover:bg-orange-50 border-gray-200'}`}
              onClick={() => onTemperatureUnitChange('K')}
            >
              K
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Panel */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-50 via-teal-50/30 to-white backdrop-blur-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-sm">ℹ️</span>
            </div>
            <h3 className="text-emerald-900 font-medium">About Analysis</h3>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">
            Select a city, month, and data layer, then click on the map to analyze environmental metrics for that area. 
            Use the Hotspot Explorer tab to view priority intervention zones.
          </p>
        </CardContent>
      </Card>

      {/* Reset Button */}
      <div className="pt-2">
        <Button 
          variant="outline" 
          className="w-full text-gray-700 hover:text-white bg-white hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-800 border-gray-200 shadow-sm transition-all"
          onClick={onReset}
        >
          🔄 Reset Selection
        </Button>
      </div>

      <div className="mt-auto pt-4">
        <Button variant="link" className="p-0 h-auto text-sm text-gray-500 hover:text-emerald-600 transition-colors">
          📊 Data Sources & Methodology
        </Button>
      </div>
    </div>
  );
}