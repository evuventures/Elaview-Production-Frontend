import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  MapPin,
  DollarSign,
  Building,
  Layers,
  SlidersHorizontal,
  Navigation,
  Crosshair,
  Star,
  Filter,
  X,
  Target
} from 'lucide-react';

const MapSearchFilter = ({
  properties = [],
  onFilter,
  onLocationSearch,
  currentLocation,
  onCenterMap,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [filters, setFilters] = useState({
    priceRange: [0, 5000],
    propertyTypes: [],
    areaTypes: [],
    radius: 10, // km
    minRating: 0,
    features: [],
    availability: 'all'
  });
  const [isSearching, setIsSearching] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const locationInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Property type options
  const propertyTypes = [
    { value: 'commercial', label: 'Commercial' },
    { value: 'retail', label: 'Retail' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'transit', label: 'Transit' },
    { value: 'digital', label: 'Digital' },
    { value: 'mall', label: 'Shopping Mall' },
    { value: 'stadium', label: 'Stadium' },
    { value: 'airport', label: 'Airport' }
  ];

  // Space type options aligned with backend
  const areaTypes = [
    { value: 'storefront_window', label: 'Storefront Window' },
    { value: 'building_exterior', label: 'Building Exterior' },
    { value: 'event_space', label: 'Event Space' },
    { value: 'retail_frontage', label: 'Retail Frontage' },
    { value: 'pole_mount', label: 'Pole Mount' },
    { value: 'other', label: 'Other' }
  ];

  // Feature options
  const featureOptions = [
    { value: 'illuminated', label: 'Illuminated' },
    { value: 'digital', label: 'Digital' },
    { value: 'interactive', label: 'Interactive' },
    { value: 'weather_proof', label: 'Weather Proof' },
    { value: 'high_traffic', label: 'High Traffic' },
    { value: 'parking', label: 'Parking Available' },
    { value: 'accessible', label: 'Wheelchair Accessible' }
  ];

  // Filter properties based on current filters
  useEffect(() => {
    const filtered = properties.filter(property => {
      // Text search
      const searchMatch = !searchTerm || (
        property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Price range
      const price = property.base_price || 0;
      const priceMatch = price >= filters.priceRange[0] && price <= filters.priceRange[1];

      // Property types
      const propertyTypeMatch = filters.propertyTypes.length === 0 || 
        filters.propertyTypes.includes(property.type);

      // Space types - check if property has spaces of these types
      const areaTypeMatch = filters.areaTypes.length === 0 || 
        (property.spaces && property.spaces.some(space => 
          filters.areaTypes.includes(space.type)
        ));

      // Rating
      const ratingMatch = (property.rating || 0) >= filters.minRating;

      // Features
      const featuresMatch = filters.features.length === 0 || 
        filters.features.every(feature => property.features?.includes(feature));

      // Availability
      const availabilityMatch = filters.availability === 'all' || 
        property.status === filters.availability;

      // Location/radius filter
      let locationMatch = true;
      if (currentLocation && filters.radius > 0) {
        const distance = getDistance(
          currentLocation.lat, 
          currentLocation.lng, 
          property.location.latitude, 
          property.location.longitude
        );
        locationMatch = distance <= filters.radius;
      }

      return searchMatch && priceMatch && propertyTypeMatch && areaTypeMatch && 
             ratingMatch && featuresMatch && availabilityMatch && locationMatch;
    });

    onFilter(filtered);
  }, [properties, searchTerm, filters, currentLocation, onFilter]);

  // Generate location suggestions
  useEffect(() => {
    if (locationSearch.length >= 2) {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        generateLocationSuggestions(locationSearch);
      }, 300);
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [locationSearch]);

  const generateLocationSuggestions = (term) => {
    const suggestions = [];
    const termLower = term.toLowerCase();

    // Get unique cities from properties
    const cities = [...new Set(properties.map(p => p.location?.city).filter(Boolean))];
    cities.forEach(city => {
      if (city.toLowerCase().includes(termLower)) {
        suggestions.push({
          type: 'city',
          label: city,
          description: 'City',
          value: city
        });
      }
    });

    // Get unique addresses
    const addresses = [...new Set(properties.map(p => p.location?.address).filter(Boolean))];
    addresses.forEach(address => {
      if (address.toLowerCase().includes(termLower)) {
        suggestions.push({
          type: 'address',
          label: address,
          description: 'Address',
          value: address
        });
      }
    });

    setLocationSuggestions(suggestions.slice(0, 5));
    setShowLocationSuggestions(suggestions.length > 0);
  };

  const handleLocationSearch = async (location) => {
    setIsSearching(true);
    try {
      await onLocationSearch(location);
      setLocationSearch('');
      setShowLocationSuggestions(false);
    } catch (error) {
      console.error('Location search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (key, value, checked) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked 
        ? [...prev[key], value]
        : prev[key].filter(item => item !== value)
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setLocationSearch('');
    setFilters({
      priceRange: [0, 5000],
      propertyTypes: [],
      areaTypes: [],
      radius: 10,
      minRating: 0,
      features: [],
      availability: 'all'
    });
  };

  const hasActiveFilters = () => {
    return searchTerm || 
           locationSearch ||
           filters.propertyTypes.length > 0 ||
           filters.areaTypes.length > 0 ||
           filters.features.length > 0 ||
           filters.availability !== 'all' ||
           filters.minRating > 0 ||
           filters.priceRange[0] > 0 ||
           filters.priceRange[1] < 5000;
  };

  const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Property Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search properties, areas, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 glass border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base focus-brand transition-brand"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-[hsl(var(--muted))] rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Location Search */}
        <div className="relative w-full sm:w-80">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            ref={locationInputRef}
            placeholder="Search location..."
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && locationSearch && handleLocationSearch(locationSearch)}
            className="pl-12 pr-12 glass border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base focus-brand transition-brand"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCenterMap && onCenterMap()}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-[hsl(var(--muted))] rounded-full"
            title="Center on my location"
          >
            <Crosshair className="w-4 h-4" />
          </Button>

          {/* Location Suggestions */}
          {showLocationSuggestions && (
            <Card className="absolute top-full left-0 right-0 z-50 mt-2 glass-strong border-[hsl(var(--border))] rounded-2xl shadow-lg">
              <CardContent className="p-2">
                {locationSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={() => {
                      setLocationSearch(suggestion.value);
                      handleLocationSearch(suggestion.value);
                    }}
                    className="w-full justify-start text-left p-3 rounded-xl hover:bg-[hsl(var(--muted))]"
                  >
                    <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{suggestion.label}</div>
                      <div className="text-sm text-muted-foreground">{suggestion.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Filters and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Quick Filter Buttons */}
          <Button
            variant={filters.availability === 'available' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('availability', 
              filters.availability === 'available' ? 'all' : 'available'
            )}
            className="rounded-xl"
          >
            Available
          </Button>
          
          <Button
            variant={filters.features.includes('digital') ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCheckboxChange('features', 'digital', 
              !filters.features.includes('digital')
            )}
            className="rounded-xl"
          >
            Digital
          </Button>

          <Button
            variant={filters.features.includes('high_traffic') ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCheckboxChange('features', 'high_traffic', 
              !filters.features.includes('high_traffic')
            )}
            className="rounded-xl"
          >
            High Traffic
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`glass border-[hsl(var(--border))] rounded-xl transition-brand ${
              hasActiveFilters() ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5' : ''
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters() && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                !
              </Badge>
            )}
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters() && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="glass border-[hsl(var(--border))] rounded-xl"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="glass border-[hsl(var(--border))] rounded-2xl overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">
                  Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </Label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => handleFilterChange('priceRange', value)}
                  max={5000}
                  min={0}
                  step={50}
                  className="w-full"
                />
              </div>

              {/* Search Radius */}
              {currentLocation && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">
                    Search Radius: {filters.radius} km
                  </Label>
                  <Slider
                    value={[filters.radius]}
                    onValueChange={(value) => handleFilterChange('radius', value[0])}
                    max={50}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}

              {/* Rating Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Minimum Rating</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={filters.minRating >= rating ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('minRating', rating === filters.minRating ? 0 : rating)}
                      className="h-8 w-8 p-0 rounded-lg"
                    >
                      <Star className={`w-4 h-4 ${filters.minRating >= rating ? 'fill-current' : ''}`} />
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Property Types */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Property Types</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {propertyTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`property-${type.value}`}
                      checked={filters.propertyTypes.includes(type.value)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('propertyTypes', type.value, checked)
                      }
                    />
                    <Label htmlFor={`property-${type.value}`} className="text-sm">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Area Types */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Advertising Area Types</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {areaTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`area-${type.value}`}
                      checked={filters.areaTypes.includes(type.value)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('areaTypes', type.value, checked)
                      }
                    />
                    <Label htmlFor={`area-${type.value}`} className="text-sm">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Features</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {featureOptions.map((feature) => (
                  <div key={feature.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`feature-${feature.value}`}
                      checked={filters.features.includes(feature.value)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('features', feature.value, checked)
                      }
                    />
                    <Label htmlFor={`feature-${feature.value}`} className="text-sm">
                      {feature.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {properties.length} properties found
          {currentLocation && ` within ${filters.radius}km`}
        </span>
        {hasActiveFilters() && (
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>Filtered view active</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapSearchFilter;
