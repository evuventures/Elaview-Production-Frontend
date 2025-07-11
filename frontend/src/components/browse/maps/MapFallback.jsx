import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Star, ExternalLink } from 'lucide-react';

const MapFallback = ({ properties = [], className = '' }) => {
  const openInGoogleMaps = (property) => {
    if (property.latitude && property.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className={`w-full h-full bg-gray-50 rounded-lg p-4 ${className}`}>
      <div className="text-center mb-6">
        <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-2" />
        <h3 className="text-lg font-semibold text-gray-700">Map View Unavailable</h3>
        <p className="text-sm text-gray-500">
          Showing properties in list format
        </p>
      </div>

      <div className="grid gap-4 max-h-[400px] overflow-y-auto">
        {properties.length > 0 ? (
          properties.map((property) => (
            <Card key={property.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base line-clamp-2">
                      {property.property_name || property.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {property.property_type || 'Property'}
                    </p>
                  </div>
                  <Badge variant={property.availability_status === 'available' ? 'default' : 'secondary'}>
                    {property.availability_status === 'available' ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-semibold">
                      ${property.price_per_night || property.price || 'N/A'}
                      {property.price_per_night && <span className="text-sm font-normal text-gray-600">/night</span>}
                    </span>
                  </div>

                  {/* Rating */}
                  {property.rating && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm">{property.rating}/5</span>
                    </div>
                  )}

                  {/* Location */}
                  {property.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{property.location}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {property.latitude && property.longitude && (
                      <Button
                        onClick={() => openInGoogleMaps(property)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Maps
                      </Button>
                    )}
                    <Button
                      onClick={() => {/* Handle view details */}}
                      size="sm"
                      className="flex-1"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No properties to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapFallback;
