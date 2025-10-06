import { useState } from 'react';
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
import { TrendingUp, TrendingDown, MapPin } from 'lucide-react';

interface HotspotData {
  id: string;
  district: string;
  ndvi: number;
  uhi: number;
  airExposure: number;
  population: number;
  coordinates: [number, number];
}

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend: number;
  color: string;
  icon: React.ComponentType<any>;
  sparklineData: Array<{ x: number; y: number }>;
}

function MetricCard({ title, value, unit, trend, color, icon: Icon, sparklineData }: MetricCardProps) {
  const isPositive = trend > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  
  const colorStyles = {
    green: {
      card: 'bg-gradient-to-br from-green-50 to-white border-green-200',
      icon: 'text-green-600',
      title: 'text-green-800',
      value: 'text-green-700',
      stroke: 'rgb(34, 197, 94)'
    },
    red: {
      card: 'bg-gradient-to-br from-red-50 to-white border-red-200',
      icon: 'text-red-600',
      title: 'text-red-800',
      value: 'text-red-700',
      stroke: 'rgb(239, 68, 68)'
    },
    blue: {
      card: 'bg-gradient-to-br from-blue-50 to-white border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-800',
      value: 'text-blue-700',
      stroke: 'rgb(59, 130, 246)'
    }
  };

  const styles = colorStyles[color as keyof typeof colorStyles];
  
  return (
    <Card className={styles.card}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon size={16} className={styles.icon} strokeWidth={2} />
            <CardTitle className={`text-sm ${styles.title}`}>{title}</CardTitle>
          </div>
          <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendIcon size={12} />
            <span>{Math.abs(trend)}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className={`text-2xl ${styles.value} mb-1`}>
              {value}
              {unit && <span className="text-sm ml-1">{unit}</span>}
            </div>
            <div className="text-xs text-gray-600">vs last month</div>
          </div>
          <div className="w-16 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line 
                  type="monotone" 
                  dataKey="y" 
                  stroke={styles.stroke}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EnhancedRightPanel({ onZoomToLocation }: { onZoomToLocation?: (coords: [number, number]) => void }) {
  const [ndviIncrease, setNdviIncrease] = useState([10]);
  const [heatReduction, setHeatReduction] = useState([2]);
  const [airQualityReduction, setAirQualityReduction] = useState([15]);
  const [populationChange, setPopulationChange] = useState([5]);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  // Mock data for key metrics with sparklines
  const metricSparklines = {
    treeEquity: [
      { x: 1, y: 68 }, { x: 2, y: 71 }, { x: 3, y: 69 }, { x: 4, y: 73 }, { x: 5, y: 75 }
    ],
    heatExposure: [
      { x: 1, y: 42 }, { x: 2, y: 44 }, { x: 3, y: 41 }, { x: 4, y: 39 }, { x: 5, y: 38 }
    ],
    airExposure: [
      { x: 1, y: 65 }, { x: 2, y: 62 }, { x: 3, y: 64 }, { x: 4, y: 61 }, { x: 5, y: 59 }
    ]
  };

  // Mock hotspot data
  const hotspotData: HotspotData[] = [
    { id: 'HS001', district: 'Industrial East', ndvi: 0.24, uhi: 8.2, airExposure: 78, population: 12500, coordinates: [40.7128, -74.0060] },
    { id: 'HS002', district: 'Downtown Core', ndvi: 0.31, uhi: 7.8, airExposure: 72, population: 18900, coordinates: [40.7580, -73.9855] },
    { id: 'HS003', district: 'Port District', ndvi: 0.19, uhi: 8.7, airExposure: 82, population: 8200, coordinates: [40.6782, -74.0442] },
    { id: 'HS004', district: 'Highway Corridor', ndvi: 0.28, uhi: 7.5, airExposure: 75, population: 15600, coordinates: [40.7489, -73.9680] },
    { id: 'HS005', district: 'Manufacturing Zone', ndvi: 0.22, uhi: 8.1, airExposure: 79, population: 9800, coordinates: [40.6892, -73.9901] },
    { id: 'HS006', district: 'Commercial Strip', ndvi: 0.35, uhi: 6.9, airExposure: 68, population: 21300, coordinates: [40.7614, -73.9776] },
    { id: 'HS007', district: 'Dense Residential', ndvi: 0.29, uhi: 7.2, airExposure: 71, population: 25400, coordinates: [40.7505, -73.9934] }
  ];

  // Correlation data for scatter plot
  const correlationData = hotspotData.map(item => ({
    ndvi: item.ndvi,
    uhi: item.uhi,
    airExposure: item.airExposure,
    population: item.population,
    district: item.district
  }));

  // Calculate scenario impacts
  const calculateNDVIImpact = (ndviIncrease: number) => {
    const tempReduction = (ndviIncrease * 0.3).toFixed(1);
    const pm25Reduction = (ndviIncrease * 0.8).toFixed(1);
    return { tempReduction, pm25Reduction };
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
    const currentGreenSpace = 12.5; // m² per capita
    const perCapitaGreenSpace = (currentGreenSpace * (100 / (100 + populationChange))).toFixed(1);
    return { perCapitaGreenSpace };
  };

  const ndviImpact = calculateNDVIImpact(ndviIncrease[0]);
  const heatImpact = calculateHeatImpact(heatReduction[0]);
  const airQualityImpact = calculateAirQualityImpact(airQualityReduction[0]);
  const populationImpact = calculatePopulationImpact(populationChange[0]);

  const handleHotspotClick = (hotspot: HotspotData) => {
    setSelectedHotspot(hotspot.id);
    if (onZoomToLocation) {
      onZoomToLocation(hotspot.coordinates);
    }
  };

  return (
    <TooltipProvider>
      <div className="w-full h-full p-4 space-y-4 overflow-y-auto">
        {/* Key Metric Cards */}
        <div className="space-y-3">
          <h3 className="text-lg text-gray-800 mb-3">Key Metrics</h3>
          
          <MetricCard
            title="Tree Equity Score"
            value={75}
            trend={2.8}
            color="green"
            icon={Tree2}
            sparklineData={metricSparklines.treeEquity}
          />
          
          <MetricCard
            title="Heat Exposure"
            value={38}
            unit="°C"
            trend={-3.2}
            color="red"
            icon={Heat2}
            sparklineData={metricSparklines.heatExposure}
          />
          
          <MetricCard
            title="Air Exposure"
            value={59}
            unit="AQI"
            trend={-4.1}
            color="blue"
            icon={AirSensor1}
            sparklineData={metricSparklines.airExposure}
          />
        </div>

        {/* Ranked Hotspot Table */}
        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-800 flex items-center gap-2">
              <SustainableCity1 size={20} className="text-amber-700" strokeWidth={2} />
              Priority Hotspots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">District</TableHead>
                    <TableHead className="text-xs text-center">NDVI</TableHead>
                    <TableHead className="text-xs text-center">UHI</TableHead>
                    <TableHead className="text-xs text-center">Air</TableHead>
                    <TableHead className="text-xs text-center">Pop</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hotspotData.slice(0, 7).map((hotspot) => (
                    <TableRow 
                      key={hotspot.id}
                      className={`cursor-pointer hover:bg-amber-50 transition-colors ${
                        selectedHotspot === hotspot.id ? 'bg-amber-100 border-l-4 border-amber-500' : ''
                      }`}
                      onClick={() => handleHotspotClick(hotspot)}
                    >
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <MapPin size={12} className="text-amber-600" />
                          <div>
                            <div className="text-xs font-medium truncate max-w-20">{hotspot.district}</div>
                            <div className="text-xs text-gray-500">{hotspot.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            hotspot.ndvi < 0.25 ? 'border-red-300 text-red-700' : 
                            hotspot.ndvi < 0.35 ? 'border-yellow-300 text-yellow-700' : 
                            'border-green-300 text-green-700'
                          }`}
                        >
                          {hotspot.ndvi.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center py-2">
                        <span className={`text-xs font-medium ${
                          hotspot.uhi > 8 ? 'text-red-600' : 
                          hotspot.uhi > 7 ? 'text-orange-600' : 
                          'text-yellow-600'
                        }`}>
                          {hotspot.uhi}°C
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-2">
                        <span className={`text-xs font-medium ${
                          hotspot.airExposure > 75 ? 'text-red-600' : 
                          hotspot.airExposure > 65 ? 'text-orange-600' : 
                          'text-blue-600'
                        }`}>
                          {hotspot.airExposure}
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-2">
                        <span className="text-xs text-gray-600">
                          {(hotspot.population / 1000).toFixed(1)}k
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-3 text-xs text-amber-700 bg-amber-100 p-2 rounded">
              💡 Click any row to zoom to location on map
            </div>
          </CardContent>
        </Card>

        {/* Multi-Layer Scenario Planning */}
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <Sun1 size={20} className="text-emerald-700" strokeWidth={2} />
              Scenario Planning
            </CardTitle>
            <p className="text-xs text-emerald-600 mt-1">
              Adjust indicators to simulate environmental improvements
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* NDVI Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="text-sm text-gray-700 flex items-center gap-1 cursor-help">
                      <Tree2 size={14} className="text-green-600" strokeWidth={2} />
                      Increase NDVI by:
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Normalized Difference Vegetation Index - measures plant health and coverage</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-emerald-600 font-medium">{ndviIncrease[0]}%</span>
              </div>
              <Slider
                value={ndviIncrease}
                onValueChange={setNdviIncrease}
                max={50}
                min={5}
                step={5}
                className="w-full"
              />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-white p-2 rounded border border-green-200">
                  <div className="flex items-center gap-1 mb-1">
                    <Heat2 size={12} className="text-red-500" strokeWidth={2} />
                    <span className="text-xs text-gray-600">Temperature</span>
                  </div>
                  <div className="text-base text-red-600">-{ndviImpact.tempReduction}°C</div>
                </div>
                <div className="bg-white p-2 rounded border border-green-200">
                  <div className="flex items-center gap-1 mb-1">
                    <AirSensor1 size={12} className="text-blue-500" strokeWidth={2} />
                    <span className="text-xs text-gray-600">PM2.5</span>
                  </div>
                  <div className="text-base text-blue-600">-{ndviImpact.pm25Reduction}%</div>
                </div>
              </div>
            </div>

            {/* Urban Heat Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="text-sm text-gray-700 flex items-center gap-1 cursor-help">
                      <Heat2 size={14} className="text-red-600" strokeWidth={2} />
                      Reduce LST by:
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Land Surface Temperature reduction through urban cooling strategies</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-emerald-600 font-medium">{heatReduction[0]}°C</span>
              </div>
              <Slider
                value={heatReduction}
                onValueChange={setHeatReduction}
                max={10}
                min={0.5}
                step={0.5}
                className="w-full"
              />
              <div className="bg-white p-2 rounded border border-red-200 mt-2">
                <div className="flex items-center gap-1 mb-1">
                  <Sun1 size={12} className="text-orange-500" strokeWidth={2} />
                  <span className="text-xs text-gray-600">Comfort Index</span>
                </div>
                <div className="text-base text-orange-600">+{heatImpact.comfortIndex} points</div>
              </div>
            </div>

            {/* Air Quality Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="text-sm text-gray-700 flex items-center gap-1 cursor-help">
                      <AirSensor1 size={14} className="text-blue-600" strokeWidth={2} />
                      Reduce PM2.5 by:
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Particulate matter reduction through air quality interventions</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-emerald-600 font-medium">{airQualityReduction[0]} µg/m³</span>
              </div>
              <Slider
                value={airQualityReduction}
                onValueChange={setAirQualityReduction}
                max={50}
                min={5}
                step={5}
                className="w-full"
              />
              <div className="bg-white p-2 rounded border border-blue-200 mt-2">
                <div className="flex items-center gap-1 mb-1">
                  <SustainableCity1 size={12} className="text-green-500" strokeWidth={2} />
                  <span className="text-xs text-gray-600">Health Risk Reduction</span>
                </div>
                <div className="text-base text-green-600">-{airQualityImpact.healthRiskReduction}%</div>
              </div>
            </div>

            {/* Population Density Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="text-sm text-gray-700 flex items-center gap-1 cursor-help">
                      <Population1 size={14} className="text-purple-600" strokeWidth={2} />
                      Population change:
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Simulate population density changes and impact on green space availability</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-emerald-600 font-medium">{populationChange[0] > 0 ? '+' : ''}{populationChange[0]}%</span>
              </div>
              <Slider
                value={populationChange}
                onValueChange={setPopulationChange}
                max={30}
                min={-20}
                step={5}
                className="w-full"
              />
              <div className="bg-white p-2 rounded border border-purple-200 mt-2">
                <div className="flex items-center gap-1 mb-1">
                  <Tree2 size={12} className="text-emerald-500" strokeWidth={2} />
                  <span className="text-xs text-gray-600">Per-Capita Green Space</span>
                </div>
                <div className="text-base text-emerald-600">{populationImpact.perCapitaGreenSpace} m²</div>
              </div>
            </div>
            
            <div className="text-xs text-emerald-700 bg-emerald-100 p-2 rounded">
              📊 All projections are independent simulations of potential improvements
            </div>
          </CardContent>
        </Card>

        {/* Correlation Explorer */}
        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-800 flex items-center gap-2">
              <Population1 size={20} className="text-purple-700" strokeWidth={2} />
              NDVI vs Heat Correlation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart data={correlationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                <XAxis 
                  dataKey="ndvi" 
                  stroke="#7c3aed"
                  domain={[0.15, 0.4]}
                  label={{ value: 'NDVI', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  dataKey="uhi" 
                  stroke="#7c3aed"
                  domain={[6, 9]}
                  label={{ value: 'UHI (°C)', angle: -90, position: 'insideLeft' }}
                />
                <RechartsTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-purple-200 rounded-lg shadow-lg">
                          <p className="font-medium text-purple-900">{data.district}</p>
                          <p className="text-sm">NDVI: {data.ndvi.toFixed(2)}</p>
                          <p className="text-sm">UHI: {data.uhi}°C</p>
                          <p className="text-sm">Population: {(data.population / 1000).toFixed(1)}k</p>
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
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center gap-4 text-xs">
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

        {/* Key Insights */}
        <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-800">Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {/* Vegetation Section */}
              <div className="bg-white p-3 rounded-lg">
                <h4 className="text-green-700 mb-2 flex items-center gap-1.5">
                  🌿 Vegetation
                </h4>
                <p className="text-gray-700 mb-2 leading-relaxed">
                  <span className="font-medium">Summary:</span> Urban vegetation plays a key role in cooling, air quality, and livability. Low canopy coverage correlates with higher heat exposure and reduced resident comfort.
                </p>
                <div className="mb-1">
                  <span className="text-gray-800 font-medium uppercase text-xs tracking-wide">Recommended Actions:</span>
                </div>
                <div className="space-y-1 text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <p className="leading-relaxed">Expand urban tree canopy in low-vegetation districts</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <p className="leading-relaxed">Establish green corridors along major transit routes</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <p className="leading-relaxed">Promote rooftop gardens and vertical greenery systems</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <p className="leading-relaxed">Balance canopy density to optimize cooling and airflow</p>
                  </div>
                </div>
              </div>

              {/* Urban Heat Section */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-orange-700 mb-2 flex items-center gap-1.5">
                  ☀️ Urban Heat
                </h4>
                <p className="text-gray-700 mb-2 leading-relaxed">
                  <span className="font-medium">Summary:</span> High land surface temperatures create thermal stress in densely built areas. Reflective materials and strategic design can significantly reduce heat retention.
                </p>
                <div className="mb-1">
                  <span className="text-gray-800 font-medium uppercase text-xs tracking-wide">Recommended Actions:</span>
                </div>
                <div className="space-y-1 text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <p className="leading-relaxed">Introduce cool-roof policies for residential and commercial zones</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <p className="leading-relaxed">Install reflective pavements in high-temperature areas</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <p className="leading-relaxed">Create open wind corridors in dense urban fabric</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <p className="leading-relaxed">Promote permeable surfaces to reduce heat retention</p>
                  </div>
                </div>
              </div>

              {/* Air Quality Section */}
              <div className="bg-white p-3 rounded-lg">
                <h4 className="text-blue-700 mb-2 flex items-center gap-1.5">
                  💨 Air Quality
                </h4>
                <p className="text-gray-700 mb-2 leading-relaxed">
                  <span className="font-medium">Summary:</span> Particulate matter exposure affects public health, especially near traffic corridors and industrial zones. Natural barriers and transit planning help mitigate air pollution.
                </p>
                <div className="mb-1">
                  <span className="text-gray-800 font-medium uppercase text-xs tracking-wide">Recommended Actions:</span>
                </div>
                <div className="space-y-1 text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <p className="leading-relaxed">Plant evergreen hedges along high-traffic corridors</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <p className="leading-relaxed">Build industrial green belts to buffer emissions</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <p className="leading-relaxed">Improve public transit to reduce vehicle dependence</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <p className="leading-relaxed">Deploy roadside trees for particulate capture</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <p className="leading-relaxed">Monitor emissions standards in industrial zones</p>
                  </div>
                </div>
              </div>

              {/* Population & Land Use Section */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-purple-700 mb-2 flex items-center gap-1.5">
                  👥 Population & Land Use
                </h4>
                <p className="text-gray-700 mb-2 leading-relaxed">
                  <span className="font-medium">Summary:</span> Rapid urbanization often reduces per-capita green space and increases impervious surfaces. Balancing growth with equitable access to green infrastructure is essential.
                </p>
                <div className="mb-1">
                  <span className="text-gray-800 font-medium uppercase text-xs tracking-wide">Recommended Actions:</span>
                </div>
                <div className="space-y-1 text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <p className="leading-relaxed">Increase per-capita green space in high-density neighborhoods</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <p className="leading-relaxed">Require green infrastructure in all new developments</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <p className="leading-relaxed">Replace impervious surfaces with permeable alternatives</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <p className="leading-relaxed">Preserve open public spaces in rapidly urbanizing areas</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}