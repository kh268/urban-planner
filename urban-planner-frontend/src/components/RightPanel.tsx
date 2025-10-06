import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Badge } from './ui/badge';
import { Tree2, Heat2, Canopy1, AirSensor1, SustainableCity1 } from './icons/UrbanIcons';

export function RightPanel() {
  // Mock data for NDVI trend
  const ndviData = [
    { year: '2018', ndvi: 0.62 },
    { year: '2019', ndvi: 0.65 },
    { year: '2020', ndvi: 0.68 },
    { year: '2021', ndvi: 0.71 },
    { year: '2022', ndvi: 0.69 },
    { year: '2023', ndvi: 0.73 },
    { year: '2024', ndvi: 0.75 },
  ];

  // Mock data for temperature/heat exposure
  const temperatureData = [
    { district: 'Downtown', temp: 38.5 },
    { district: 'Residential', temp: 34.2 },
    { district: 'Industrial', temp: 41.1 },
    { district: 'Parks', temp: 29.8 },
    { district: 'Suburban', temp: 32.5 },
  ];

  const priorityZones = [
    { name: 'Industrial District East', score: 8.7, type: 'High Heat' },
    { name: 'Downtown Core', score: 8.3, type: 'Low Vegetation' },
    { name: 'Port Area', score: 7.9, type: 'Air Quality' }
  ];

  return (
    <div className="w-full h-full p-4 space-y-4">
      {/* NDVI Trend Chart */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-green-800 flex items-center gap-2">
            <Tree2 size={20} className="text-green-700" strokeWidth={2} />
            NDVI Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ndviData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
              <XAxis dataKey="year" stroke="#065f46" />
              <YAxis stroke="#065f46" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ecfdf5', 
                  border: '1px solid #a7f3d0',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="ndvi" 
                stroke="#059669" 
                strokeWidth={3}
                dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Temperature Bar Chart */}
      <Card className="bg-red-50 border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-red-800 flex items-center gap-2">
            <Heat2 size={20} className="text-red-700" strokeWidth={2} />
            Surface Temperature
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={temperatureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fecaca" />
              <XAxis 
                dataKey="district" 
                stroke="#991b1b"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#991b1b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fef2f2', 
                  border: '1px solid #fca5a5',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="temp" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tree Equity Score */}
      <Card className="bg-emerald-50 border-emerald-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-emerald-800 flex items-center gap-2">
            <Canopy1 size={20} className="text-emerald-700" strokeWidth={2} />
            Tree Equity Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl text-emerald-600 mb-2">73</div>
            <div className="text-emerald-700">Good Coverage</div>
            <div className="w-full bg-emerald-200 rounded-full h-3 mt-3">
              <div 
                className="bg-emerald-500 h-3 rounded-full" 
                style={{ width: '73%' }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Zones */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-800 flex items-center gap-2">
            <SustainableCity1 size={20} className="text-amber-700" strokeWidth={2} />
            High Priority Zones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {priorityZones.map((zone, index) => {
              const getZoneIcon = (type: string) => {
                if (type === 'High Heat') return Heat2;
                if (type === 'Low Vegetation') return Tree2;
                if (type === 'Air Quality') return AirSensor1;
                return SustainableCity1;
              };
              const ZoneIcon = getZoneIcon(zone.type);
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <ZoneIcon size={16} className="text-amber-600" strokeWidth={2} />
                    <div className="flex-1">
                      <div className="text-sm text-amber-900">{zone.name}</div>
                      <Badge variant="secondary" className="text-xs bg-amber-200 text-amber-800">
                        {zone.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-amber-700 ml-2">
                    {zone.score}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-amber-100 rounded-lg">
            <div className="text-xs text-amber-800">
              <strong>Insight:</strong> Industrial areas show 40% higher heat exposure than green spaces. 
              Prioritize tree planting in downtown and industrial zones.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}