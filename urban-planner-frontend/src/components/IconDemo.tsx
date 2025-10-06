import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import UrbanIcons from './icons/UrbanIcons';

export function IconDemo() {
  const [selectedIcon, setSelectedIcon] = useState<string>('Tree1');
  const [iconSize, setIconSize] = useState<number>(24);
  const [iconColor, setIconColor] = useState<string>('text-gray-700');

  const sizeOptions = [16, 20, 24, 28, 32, 40, 48];
  const colorOptions = [
    { name: 'Gray', class: 'text-gray-700' },
    { name: 'Green', class: 'text-green-600' },
    { name: 'Blue', class: 'text-blue-600' },
    { name: 'Red', class: 'text-red-600' },
    { name: 'Yellow', class: 'text-yellow-600' },
    { name: 'Purple', class: 'text-purple-600' },
    { name: 'Emerald', class: 'text-emerald-600' },
    { name: 'Orange', class: 'text-orange-600' }
  ];

  const allIcons = Object.entries(UrbanIcons);
  const SelectedIconComponent = UrbanIcons[selectedIcon as keyof typeof UrbanIcons];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl text-gray-800 mb-4">Urban Environmental Icons</h1>
          <p className="text-xl text-gray-600 mb-2">
            A comprehensive icon set for environmental urban planning dashboards
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge>18 Core Icons</Badge>
            <Badge>2px Stroke Weight</Badge>
            <Badge>Scalable SVG</Badge>
            <Badge>React Components</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Icon Preview */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 mb-4">
                {SelectedIconComponent && (
                  <SelectedIconComponent 
                    size={iconSize} 
                    className={iconColor} 
                    strokeWidth={2} 
                  />
                )}
              </div>
              <div className="text-sm text-gray-600">
                <div>{selectedIcon}</div>
                <div>{iconSize}px • {iconColor.replace('text-', '').replace('-600', '').replace('-700', '')}</div>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Size Control */}
              <div>
                <h4 className="mb-3">Size</h4>
                <div className="flex gap-2 flex-wrap">
                  {sizeOptions.map(size => (
                    <Button
                      key={size}
                      variant={iconSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIconSize(size)}
                    >
                      {size}px
                    </Button>
                  ))}
                </div>
              </div>

              {/* Color Control */}
              <div>
                <h4 className="mb-3">Color</h4>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map(color => (
                    <Button
                      key={color.class}
                      variant={iconColor === color.class ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIconColor(color.class)}
                    >
                      {color.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Usage Code */}
              <div>
                <h4 className="mb-3">Usage Code</h4>
                <div className="bg-gray-100 p-3 rounded-lg text-sm font-mono">
                  {`<${selectedIcon} size={${iconSize}} className="${iconColor}" strokeWidth={2} />`}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Icon Grid */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>All Icons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
              {allIcons.map(([iconName, IconComponent]) => (
                <button
                  key={iconName}
                  onClick={() => setSelectedIcon(iconName)}
                  className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedIcon === iconName 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <IconComponent size={24} className="text-gray-700 mx-auto mb-1" strokeWidth={2} />
                  <div className="text-xs text-gray-600 truncate">{iconName}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <UrbanIcons.Tree1 size={20} className="text-green-700" strokeWidth={2} />
                Vegetation & Trees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <UrbanIcons.Tree1 size={28} className="text-green-600" strokeWidth={2} />
                <UrbanIcons.Tree2 size={28} className="text-green-600" strokeWidth={2} />
                <UrbanIcons.Canopy1 size={28} className="text-green-600" strokeWidth={2} />
                <UrbanIcons.Leaf size={28} className="text-green-600" strokeWidth={2} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <UrbanIcons.Heat1 size={20} className="text-red-700" strokeWidth={2} />
                Heat & Temperature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <UrbanIcons.Heat1 size={28} className="text-red-600" strokeWidth={2} />
                <UrbanIcons.Heat2 size={28} className="text-red-600" strokeWidth={2} />
                <UrbanIcons.Sun1 size={28} className="text-orange-500" strokeWidth={2} />
                <UrbanIcons.Sun2 size={28} className="text-orange-500" strokeWidth={2} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <UrbanIcons.Wind1 size={20} className="text-blue-700" strokeWidth={2} />
                Air Quality & Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <UrbanIcons.Wind1 size={28} className="text-blue-600" strokeWidth={2} />
                <UrbanIcons.Wind2 size={28} className="text-blue-600" strokeWidth={2} />
                <UrbanIcons.AirSensor1 size={28} className="text-blue-600" strokeWidth={2} />
                <UrbanIcons.AirSensor2 size={28} className="text-blue-600" strokeWidth={2} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800 flex items-center gap-2">
                <UrbanIcons.SustainableCity1 size={20} className="text-purple-700" strokeWidth={2} />
                Urban Sustainability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <UrbanIcons.Population1 size={28} className="text-purple-600" strokeWidth={2} />
                <UrbanIcons.SustainableCity1 size={28} className="text-purple-600" strokeWidth={2} />
                <UrbanIcons.SustainableCity2 size={28} className="text-purple-600" strokeWidth={2} />
                <UrbanIcons.Building size={28} className="text-purple-600" strokeWidth={2} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p>Icons designed for scalability • 2px stroke weight • Compatible with Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}