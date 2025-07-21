import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, DollarSign, Star } from 'lucide-react';

const MobilePropertiesView = ({ properties = [], allAreasMap = {} }) => {
  return (
    <div className="bg-white dark:bg-black px-4 py-3 rounded-t-2xl shadow-lg max-h-[40vh] overflow-y-auto">
      {properties.map((property) => (
        <Card key={property.id} className="mb-3 rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">{property.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{allAreasMap[property.areaId]?.name || 'Unknown Area'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4" />
              <span>${property.price}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>{property.rating || 'No rating'}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MobilePropertiesView;
