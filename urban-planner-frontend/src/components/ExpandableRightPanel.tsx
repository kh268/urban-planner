import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';
import { 
  Tree2, 
  Heat2, 
  AirSensor1, 
  Population1,
  SustainableCity1,
  Sun1 
} from './icons/UrbanIcons';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

type DataLayer = 'NDVI' | 'UHI' | 'AOD' | 'Population' | null;
type TemperatureUnit = 'C' | 'F' | 'K';

interface ExpandableRightPanelProps {
  selectedCity?: string;
  selectedMonth?: string;
  selectedLayer?: DataLayer;
  selectedArea?: { name: string; value: number } | null;
  temperatureUnit?: TemperatureUnit;
  onZoomToLocation?: (coords: [number, number]) => void;
  onWidthChange?: (width: number) => void;
}

// Helper function to convert Celsius to Fahrenheit
const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32;
};

// Helper function to convert Celsius to Kelvin
const celsiusToKelvin = (celsius: number): number => {
  return celsius + 273.15;
};

// Helper function to format temperature based on unit
const formatTemperature = (celsius: number, unit: TemperatureUnit = 'C'): string => {
  if (unit === 'F') {
    return `${celsiusToFahrenheit(celsius).toFixed(1)}°F`;
  } else if (unit === 'K') {
    return `${celsiusToKelvin(celsius).toFixed(1)}K`;
  }
  return `${celsius.toFixed(1)}°C`;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Mock data for monthly trends (Jan-Dec 2024)
const generateMonthlyData = (layer: DataLayer) => {
  const data: Record<DataLayer, number[]> = {
    'NDVI': [0.28, 0.30, 0.32, 0.35, 0.38, 0.36, 0.33, 0.31, 0.29, 0.32, 0.30, 0.35],
    'UHI': [8.5, 8.2, 7.8, 7.2, 6.8, 7.5, 8.9, 9.2, 8.6, 7.8, 8.0, 8.3],
    'AOD': [68, 65, 62, 58, 55, 60, 72, 75, 70, 64, 66, 69],
    'Population': [12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 13.0, 13.1, 13.2, 13.3, 13.4]
  };
  
  if (!layer) return [];
  
  return MONTHS.map((month, index) => ({
    month,
    value: data[layer][index],
    index
  }));
};

// Mock sparkline data (last 6 months)
const generateSparklineData = (layer: DataLayer, currentMonthIndex: number) => {
  const monthlyData = generateMonthlyData(layer);
  const startIndex = Math.max(0, currentMonthIndex - 5);
  return monthlyData.slice(startIndex, currentMonthIndex + 1).map((item, idx) => ({
    x: idx,
    y: item.value
  }));
};

export function ExpandableRightPanel({ 
  selectedCity = 'San Francisco',
  selectedMonth = 'Jan',
  selectedLayer = null,
  selectedArea = null,
  temperatureUnit = 'C',
  onZoomToLocation, 
  onWidthChange 
}: ExpandableRightPanelProps) {
  const [panelWidth, setPanelWidth] = useState(20);
  const [isDragging, setIsDragging] = useState(false);
  const [ndviIncrease, setNdviIncrease] = useState([10]);
  const [heatReduction, setHeatReduction] = useState([2]);
  const [airQualityReduction, setAirQualityReduction] = useState([15]);
  const [populationChange, setPopulationChange] = useState([5]);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const isExpanded = panelWidth > 40;
  const currentMonthIndex = MONTHS.indexOf(selectedMonth);

  // Mock correlation data for scatter plot
  const correlationData = [
    { district: 'Industrial East', ndvi: 0.24, uhi: 8.2, aod: 78, population: 12500 },
    { district: 'Downtown Core', ndvi: 0.31, uhi: 7.8, aod: 72, population: 18900 },
    { district: 'Port District', ndvi: 0.19, uhi: 8.7, aod: 82, population: 8200 },
    { district: 'Highway Corridor', ndvi: 0.28, uhi: 7.5, aod: 75, population: 15600 },
    { district: 'Manufacturing Zone', ndvi: 0.22, uhi: 8.1, aod: 79, population: 9800 },
    { district: 'Commercial Strip', ndvi: 0.35, uhi: 6.9, aod: 68, population: 21300 },
    { district: 'Dense Residential', ndvi: 0.29, uhi: 7.2, aod: 71, population: 25400 },
    { district: 'Warehouse District', ndvi: 0.21, uhi: 8.4, aod: 80, population: 6700 },
    { district: 'Transit Hub', ndvi: 0.33, uhi: 7.3, aod: 69, population: 19200 },
    { district: 'Mixed Use Zone', ndvi: 0.30, uhi: 7.6, aod: 73, population: 17800 }
  ];

  // Calculate scenario impacts with color coding
  const getSliderColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage < 33) return 'text-green-600';
    if (percentage < 66) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateNDVIImpact = (ndviIncrease: number) => {
    const tempReduction = (ndviIncrease * 0.3).toFixed(1);
    const aodReduction = (ndviIncrease * 0.8).toFixed(1);
    return { tempReduction, aodReduction };
  };

  const calculateHeatImpact = (heatReduction: number) => {
    const comfortIndex = (heatReduction * 4.2).toFixed(0);
    return { comfortIndex };
  };

  const calculateAirQualityImpact = (pm25Reduction: number) => {
    const healthRiskReduction = (pm25Reduction * 0.6).toFixed(1);
    return { healthRiskReduction };
  };

  const calculatePopulationImpact = (populationChange: number) => {
    const currentGreenSpace = 12.5;
    const perCapitaGreenSpace = (currentGreenSpace * (100 / (100 + populationChange))).toFixed(1);
    return { perCapitaGreenSpace };
  };

  const ndviImpact = calculateNDVIImpact(ndviIncrease[0]);
  const heatImpact = calculateHeatImpact(heatReduction[0]);
  const airQualityImpact = calculateAirQualityImpact(airQualityReduction[0]);
  const populationImpact = calculatePopulationImpact(populationChange[0]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const windowWidth = window.innerWidth;
    const mouseX = e.clientX;
    
    const newWidth = Math.max(20, Math.min(78, ((windowWidth - mouseX) / windowWidth) * 100));
    setPanelWidth(newWidth);
    
    if (onWidthChange) {
      onWidthChange(newWidth);
    }
  }, [isDragging, onWidthChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const toggleExpansion = () => {
    const newWidth = isExpanded ? 20 : 60;
    setPanelWidth(newWidth);
    if (onWidthChange) {
      onWidthChange(newWidth);
    }
  };

  // Get layer configuration
  const getLayerConfig = (layer: DataLayer) => {
    const configs = {
      'NDVI': {
        title: 'NDVI Index',
        icon: Tree2,
        color: 'green',
        stroke: '#2E7D32',
        gradient: 'from-green-50 to-white',
        border: 'border-green-200',
        valueColor: 'text-green-700',
        unit: ''
      },
      'UHI': {
        title: 'Urban Heat Index',
        icon: Heat2,
        color: 'orange',
        stroke: '#EF6C00',
        gradient: 'from-orange-50 to-white',
        border: 'border-orange-200',
        valueColor: 'text-orange-700',
        unit: temperatureUnit === 'C' ? '°C' : temperatureUnit === 'F' ? '°F' : 'K'
      },
      'AOD': {
        title: 'AOD (Aerosol Optical Depth)',
        icon: AirSensor1,
        color: 'blue',
        stroke: '#0288D1',
        gradient: 'from-blue-50 to-white',
        border: 'border-blue-200',
        valueColor: 'text-blue-700',
        unit: ''
      },
      'Population': {
        title: 'Population',
        icon: Population1,
        color: 'purple',
        stroke: '#6A1B9A',
        gradient: 'from-purple-50 to-white',
        border: 'border-purple-200',
        valueColor: 'text-purple-700',
        unit: 'k'
      }
    };
    return layer ? configs[layer] : null;
  };

  const layerConfig = getLayerConfig(selectedLayer);
  let monthlyData = selectedLayer ? generateMonthlyData(selectedLayer) : [];
  let sparklineData = selectedLayer ? generateSparklineData(selectedLayer, currentMonthIndex) : [];
  
  // Convert temperature data based on unit
  if (selectedLayer === 'UHI') {
    if (temperatureUnit === 'F') {
      monthlyData = monthlyData.map(item => ({
        ...item,
        value: celsiusToFahrenheit(item.value)
      }));
      sparklineData = sparklineData.map(item => ({
        ...item,
        y: celsiusToFahrenheit(item.y)
      }));
    } else if (temperatureUnit === 'K') {
      monthlyData = monthlyData.map(item => ({
        ...item,
        value: celsiusToKelvin(item.value)
      }));
      sparklineData = sparklineData.map(item => ({
        ...item,
        y: celsiusToKelvin(item.y)
      }));
    }
  }

  return (
    <TooltipProvider>
      <div 
        ref={panelRef}
        className="h-full bg-white border-l border-border relative transition-all duration-300 ease-in-out shadow-lg"
        style={{ width: `${panelWidth}%` }}
      >
        {/* Resize Handle */}
        <div
          ref={dragRef}
          className="absolute left-0 top-0 w-1 h-full bg-transparent hover:bg-blue-400 cursor-col-resize transition-colors duration-200 z-10"
          onMouseDown={handleMouseDown}
        />
        
        {/* Toggle Button */}
        <div className="absolute left-2 top-4 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleExpansion}
            className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg"
          >
            {isExpanded ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>

        <div className={`w-full h-full overflow-y-auto ${isExpanded ? 'p-6' : 'p-4'} pt-16`}>
          {/* Empty State - No Area Selected */}
          {!selectedArea ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4">
                  <MapPin size={48} className="mx-auto text-gray-300" strokeWidth={1.5} />
                </div>
                <p className="text-lg text-gray-400 max-w-xs leading-relaxed">
                  Please choose a location on the map to see data insights.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* ANALYSIS MODE - Unified Metric Card */}
              {selectedLayer && selectedArea && layerConfig && (
              <div className="space-y-4">
                <h3 className={`text-gray-800 ${isExpanded ? 'text-xl' : 'text-lg'}`} style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: 600 }}>
                  Analysis: {selectedArea.name}
                </h3>
                
                {/* Unified Analysis Card */}
                <Card className="bg-[#E8F5E9] border-gray-200 shadow-md" style={{ borderRadius: '12px' }}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      {/* Left: Large Metric Value with Trend */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`${isExpanded ? 'text-5xl' : 'text-4xl'}`} style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: 700, color: layerConfig.stroke }}>
                            {selectedLayer === 'UHI' && temperatureUnit === 'F' 
                              ? celsiusToFahrenheit(selectedArea.value).toFixed(2)
                              : selectedLayer === 'UHI' && temperatureUnit === 'K'
                              ? celsiusToKelvin(selectedArea.value).toFixed(2)
                              : selectedArea.value.toFixed(2)}
                            {layerConfig.unit && <span className="text-xl ml-1">{layerConfig.unit}</span>}
                          </div>
                          {/* Trend Arrow */}
                          {(() => {
                            const prevMonthIndex = Math.max(0, currentMonthIndex - 1);
                            const currentValue = monthlyData[currentMonthIndex]?.value || selectedArea.value;
                            const prevValue = monthlyData[prevMonthIndex]?.value || selectedArea.value;
                            const isIncreasing = currentValue > prevValue;
                            const trendColor = isIncreasing ? '#4CAF50' : '#E53935';
                            return (
                              <div className="flex flex-col items-center">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                  {isIncreasing ? (
                                    <path d="M7 14L12 9L17 14" stroke={trendColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                  ) : (
                                    <path d="M7 10L12 15L17 10" stroke={trendColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                  )}
                                </svg>
                              </div>
                            );
                          })()}
                        </div>
                        <p className="text-sm text-gray-700 mb-1" style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: 500 }}>
                          {(() => {
                            const prevMonthIndex = Math.max(0, currentMonthIndex - 1);
                            const currentValue = monthlyData[currentMonthIndex]?.value || selectedArea.value;
                            const prevValue = monthlyData[prevMonthIndex]?.value || selectedArea.value;
                            const isIncreasing = currentValue > prevValue;
                            return isIncreasing ? 'Increased compared to previous month' : 'Decreased compared to previous month';
                          })()}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <layerConfig.icon size={16} style={{ color: layerConfig.stroke }} strokeWidth={2} />
                          <p className="text-xs text-gray-600" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                            {layerConfig.title} — {selectedMonth} 2024
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Monthly Trend Chart */}
                    <div className="w-full mt-4" style={{ height: isExpanded ? '180px' : '140px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData}>
                          <defs>
                            <linearGradient id={`unified-gradient-${selectedLayer}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={layerConfig.stroke} stopOpacity={0.3}/>
                              <stop offset="100%" stopColor={layerConfig.stroke} stopOpacity={0.05}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#CCCCCC" opacity={0.5} />
                          <XAxis 
                            dataKey="month" 
                            stroke="#666"
                            style={{ fontSize: '11px', fontFamily: 'Satoshi, sans-serif' }}
                          />
                          <YAxis 
                            stroke="#666"
                            style={{ fontSize: '11px', fontFamily: 'Satoshi, sans-serif' }}
                          />
                          <RechartsTooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                                    <p className="font-semibold text-sm">{payload[0].payload.month} 2024</p>
                                    <p style={{ color: layerConfig.stroke }} className="font-medium text-sm">
                                      {payload[0].value.toFixed(2)}{layerConfig.unit}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke={layerConfig.stroke}
                            strokeWidth={2.5}
                            fill={`url(#unified-gradient-${selectedLayer})`}
                            dot={(props) => {
                              const isCurrent = props.payload.month === selectedMonth;
                              return (
                                <circle 
                                  key={`unified-dot-${props.payload.month}-${props.index}`}
                                  cx={props.cx} 
                                  cy={props.cy} 
                                  r={isCurrent ? 7 : 4} 
                                  fill={isCurrent ? layerConfig.stroke : 'white'}
                                  stroke={layerConfig.stroke}
                                  strokeWidth={2}
                                />
                              );
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Scenario Planning Section - Simplified */}
            <Card className="bg-[#E8F5E9] border-gray-200 shadow-md" style={{ borderRadius: '12px' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-[#2E7D32] flex items-center gap-2" style={{ fontSize: isExpanded ? '20px' : '18px', fontFamily: 'Satoshi, sans-serif', fontWeight: 700 }}>
                  <Sun1 size={isExpanded ? 24 : 20} className="text-[#2E7D32]" strokeWidth={2} />
                  Scenario Planning
                </CardTitle>
                <p className="text-sm text-gray-700 mt-1" style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: 500 }}>
                  Adjust indicators to simulate environmental improvements
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* NDVI Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-gray-800" style={{ fontSize: '16px', fontFamily: 'Satoshi, sans-serif', fontWeight: 500 }}>
                      Increase NDVI by
                    </label>
                    <span className="font-bold text-[#2E7D32]" style={{ fontSize: '18px', fontFamily: 'Satoshi, sans-serif' }}>
                      {ndviIncrease[0]}%
                    </span>
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
                
                {/* Results Row */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {/* Temperature Result Box */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Heat2 size={16} className="text-red-500" strokeWidth={2} />
                      <span className="text-gray-700" style={{ fontSize: '14px', fontFamily: 'Satoshi, sans-serif', fontWeight: 500 }}>
                        Temperature
                      </span>
                    </div>
                    <div className="text-red-600" style={{ fontSize: '24px', fontFamily: 'Satoshi, sans-serif', fontWeight: 700 }}>
                      -{temperatureUnit === 'F' 
                        ? (parseFloat(ndviImpact.tempReduction) * 1.8).toFixed(1) 
                        : temperatureUnit === 'K'
                        ? (parseFloat(ndviImpact.tempReduction)).toFixed(1)
                        : ndviImpact.tempReduction}{temperatureUnit === 'K' ? 'K' : `°${temperatureUnit}`}
                    </div>
                  </div>
                  
                  {/* AOD Result Box */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <AirSensor1 size={16} className="text-blue-500" strokeWidth={2} />
                      <span className="text-gray-700" style={{ fontSize: '14px', fontFamily: 'Satoshi, sans-serif', fontWeight: 500 }}>
                        AOD
                      </span>
                    </div>
                    <div className="text-blue-600" style={{ fontSize: '24px', fontFamily: 'Satoshi, sans-serif', fontWeight: 700 }}>
                      -{ndviImpact.aodReduction}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Correlation Scatter Plot */}
            <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className={`text-purple-800 flex items-center gap-2 ${isExpanded ? 'text-xl' : 'text-lg'}`}>
                  <Population1 size={isExpanded ? 24 : 20} className="text-purple-700" strokeWidth={2} />
                  NDVI vs. Urban Heat Correlation
                </CardTitle>
                <p className="text-xs text-purple-600 mt-1">
                  Correlation visualization for context — not used in metric calculation
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={isExpanded ? 280 : 180}>
                  <ScatterChart data={correlationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                    <XAxis 
                      dataKey="ndvi" 
                      stroke="#7c3aed"
                      domain={[0.15, 0.4]}
                      label={{ value: 'NDVI', position: 'insideBottom', offset: -5, style: { fontSize: isExpanded ? 12 : 10 } }}
                      style={{ fontSize: isExpanded ? 12 : 10 }}
                    />
                    <YAxis 
                      dataKey="uhi" 
                      stroke="#7c3aed"
                      domain={[6, 9]}
                      label={{ value: 'UHI (°C)', angle: -90, position: 'insideLeft', style: { fontSize: isExpanded ? 12 : 10 } }}
                      style={{ fontSize: isExpanded ? 12 : 10 }}
                    />
                    <RechartsTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border border-purple-200 rounded-lg shadow-lg">
                              <p className="font-medium text-purple-900 text-sm">{data.district}</p>
                              <p className="text-xs">NDVI: {data.ndvi.toFixed(2)}</p>
                              <p className="text-xs">UHI: {data.uhi}°C</p>
                              <p className="text-xs">Pop: {(data.population / 1000).toFixed(1)}k</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter dataKey="uhi" fill="#8b5cf6">
                      {correlationData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.population > 20000 ? '#7c3aed' : 
                            entry.population > 15000 ? '#a855f7' : 
                            '#c084fc'
                          } 
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
                <div className={`flex ${isExpanded ? 'justify-center gap-6' : 'flex-col space-y-1'} items-center mt-3`}>
                  <div className={`flex ${isExpanded ? 'gap-6' : 'gap-3 flex-wrap justify-center'} ${isExpanded ? 'text-sm' : 'text-xs'}`}>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-700 rounded-full"></div>
                      <span>High Pop (20k+)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>Medium Pop</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                      <span>Low Pop</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}