import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import UrbanIcons from './icons/UrbanIcons';

export function IconShowcase() {
  const iconCategories = [
    {
      category: 'Trees & Vegetation',
      icons: [
        { name: 'Tree1', component: UrbanIcons.Tree1, description: 'Classic tree with canopy' },
        { name: 'Tree2', component: UrbanIcons.Tree2, description: 'Simple circular canopy tree' },
        { name: 'Leaf', component: UrbanIcons.Leaf, description: 'Single leaf for vegetation' }
      ]
    },
    {
      category: 'Canopy Coverage',
      icons: [
        { name: 'Canopy1', component: UrbanIcons.Canopy1, description: 'Multiple tree canopies' },
        { name: 'Canopy2', component: UrbanIcons.Canopy2, description: 'Forest canopy view' }
      ]
    },
    {
      category: 'Heat & Temperature',
      icons: [
        { name: 'Heat1', component: UrbanIcons.Heat1, description: 'Thermometer with heat rays' },
        { name: 'Heat2', component: UrbanIcons.Heat2, description: 'Heat intensity grid' }
      ]
    },
    {
      category: 'Wind & Air Flow',
      icons: [
        { name: 'Wind1', component: UrbanIcons.Wind1, description: 'Curved wind flows' },
        { name: 'Wind2', component: UrbanIcons.Wind2, description: 'Directional wind arrows' }
      ]
    },
    {
      category: 'Population',
      icons: [
        { name: 'Population1', component: UrbanIcons.Population1, description: 'Group of people' },
        { name: 'Population2', component: UrbanIcons.Population2, description: 'Connected population nodes' }
      ]
    },
    {
      category: 'Air Quality Sensors',
      icons: [
        { name: 'AirSensor1', component: UrbanIcons.AirSensor1, description: 'Air quality monitoring device' },
        { name: 'AirSensor2', component: UrbanIcons.AirSensor2, description: 'Environmental sensor station' }
      ]
    },
    {
      category: 'Sunlight & Light Exposure',
      icons: [
        { name: 'Sun1', component: UrbanIcons.Sun1, description: 'Sun with radiating rays' },
        { name: 'Sun2', component: UrbanIcons.Sun2, description: 'Detailed sun with long rays' }
      ]
    },
    {
      category: 'Sustainable City',
      icons: [
        { name: 'SustainableCity1', component: UrbanIcons.SustainableCity1, description: 'Green city skyline' },
        { name: 'SustainableCity2', component: UrbanIcons.SustainableCity2, description: 'Eco-friendly buildings' },
        { name: 'Building', component: UrbanIcons.Building, description: 'Urban building structure' }
      ]
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl text-gray-800 mb-2">Urban Environmental Icon Set</h1>
        <p className="text-gray-600">
          A cohesive collection of outline-style icons for urban planning and environmental dashboards.
          Built with 2px stroke weight, rounded corners, and scalable SVG format.
        </p>
      </div>

      <div className="space-y-8">
        {iconCategories.map((category) => (
          <Card key={category.category} className="border-2">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">
                {category.category}
                <Badge variant="outline" className="ml-2">{category.icons.length} icons</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.icons.map((icon) => {
                  const IconComponent = icon.component;
                  return (
                    <div key={icon.name} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center gap-2">
                        {/* Default size */}
                        <IconComponent size={24} className="text-gray-700" strokeWidth={2} />
                        <span className="text-xs text-gray-500">24px</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        {/* Large size */}
                        <IconComponent size={32} className="text-blue-600" strokeWidth={2} />
                        <span className="text-xs text-gray-500">32px</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{icon.name}</h4>
                        <p className="text-sm text-gray-600">{icon.description}</p>
                        <div className="mt-2 flex gap-2">
                          <Badge variant="secondary" className="text-xs">Stroke</Badge>
                          <Badge variant="secondary" className="text-xs">2px</Badge>
                          <Badge variant="secondary" className="text-xs">Scalable</Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Examples */}
      <Card className="mt-8 border-2 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Usage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <UrbanIcons.Tree1 size={20} className="text-green-600" strokeWidth={2} />
              <span className="text-sm">Small icon in UI (20px)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <UrbanIcons.Heat1 size={24} className="text-red-500" strokeWidth={2} />
              <span className="text-sm">Default icon size (24px)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <UrbanIcons.SustainableCity1 size={28} className="text-blue-600" strokeWidth={2} />
              <span className="text-sm">Large icon for headers (28px+)</span>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <h4 className="font-medium mb-2">Color Customization</h4>
              <div className="flex gap-3">
                <UrbanIcons.Canopy1 size={24} className="text-emerald-600" strokeWidth={2} />
                <UrbanIcons.Canopy1 size={24} className="text-amber-600" strokeWidth={2} />
                <UrbanIcons.Canopy1 size={24} className="text-red-600" strokeWidth={2} />
                <UrbanIcons.Canopy1 size={24} className="text-blue-600" strokeWidth={2} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Specs */}
      <Card className="mt-8 border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Technical Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Design Standards</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 24x24px default viewBox</li>
                <li>• 2px stroke weight</li>
                <li>• Rounded line caps and joins</li>
                <li>• No fill, stroke-based only</li>
                <li>• Material Design inspired</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Implementation</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• React TypeScript components</li>
                <li>• Customizable size and colors</li>
                <li>• Accessible with proper ARIA</li>
                <li>• Tree-shakeable imports</li>
                <li>• Tailwind CSS compatible</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}