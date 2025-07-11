import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal, 
  MapPin, 
  DollarSign, 
  Calendar,
  Building,
  Star,
  Save,
  Bookmark,
  Trash2,
  RotateCcw,
  Sparkles
} from 'lucide-react';

// Advanced Search and Filter Component
const AdvancedSearchFilter = ({
  type = 'properties', // 'properties', 'campaigns', 'areas'
  data = [],
  onFilter,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priceRange: [0, 10000],
    location: '',
    propertyType: 'all',
    areaType: 'all',
    availability: 'all',
    rating: 0,
    features: [],
    dateRange: { from: null, to: null }
  });
  const [savedSearches, setSavedSearches] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ✅ FIXED: Use useRef to track the last filtered data to prevent unnecessary calls
  const lastFilteredDataRef = useRef(null);

  // Load saved searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`savedSearches_${type}`);
      if (saved) {
        setSavedSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  }, [type]); // ✅ FIXED: Added proper dependency array

  // Generate search suggestions based on current input
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const suggestions = generateSuggestions(searchTerm, data);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, data]); // ✅ FIXED: Added proper dependency array

  // Filter data based on current search and filters
  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.filter(item => {
      // Text search
      const searchMatch = !searchTerm || matchesSearch(item, searchTerm);
      
      // Status filter
      const statusMatch = filters.status === 'all' || item.status === filters.status;
      
      // Price range filter
      const price = getItemPrice(item);
      const priceMatch = price >= filters.priceRange[0] && price <= filters.priceRange[1];
      
      // Location filter
      const locationMatch = !filters.location || 
        (item.location?.address?.toLowerCase().includes(filters.location.toLowerCase()) ||
         item.location?.city?.toLowerCase().includes(filters.location.toLowerCase()));
      
      // Type filters
      const typeMatch = (filters.propertyType === 'all' || item.type === filters.propertyType) &&
                       (filters.areaType === 'all' || item.area_type === filters.areaType);
      
      // Availability filter
      const availabilityMatch = filters.availability === 'all' || 
        checkAvailability(item, filters.availability);
      
      // Rating filter
      const ratingMatch = filters.rating === 0 || (item.rating || 0) >= filters.rating;
      
      // Features filter
      const featuresMatch = filters.features.length === 0 || 
        filters.features.every(feature => item.features?.includes(feature));

      return searchMatch && statusMatch && priceMatch && locationMatch && 
             typeMatch && availabilityMatch && ratingMatch && featuresMatch;
    });
  }, [data, searchTerm, filters]);

  // ✅ FIXED: Apply filters and notify parent - removed onFilter from dependencies
  useEffect(() => {
    // Only call onFilter if the filtered data actually changed
    const currentDataString = JSON.stringify(filteredData);
    const lastDataString = JSON.stringify(lastFilteredDataRef.current);
    
    if (currentDataString !== lastDataString) {
      console.log('🔍 Applying filters, found:', filteredData.length, 'results');
      lastFilteredDataRef.current = filteredData;
      onFilter(filteredData);
    }
  }, [filteredData]); // ✅ FIXED: Removed onFilter from dependencies to prevent infinite loop

  // ✅ ADDED: Memoized helper functions to prevent recreation on every render
  const generateSuggestions = useCallback((term, items) => {
    const suggestions = new Set();
    const termLower = term.toLowerCase();

    items.forEach(item => {
      // Property/Campaign names
      if (item.name?.toLowerCase().includes(termLower)) {
        suggestions.add(item.name);
      }
      
      // Locations
      if (item.location?.city?.toLowerCase().includes(termLower)) {
        suggestions.add(item.location.city);
      }
      
      // Types
      if (item.type?.toLowerCase().includes(termLower)) {
        suggestions.add(item.type.replace('_', ' '));
      }
      
      // Brand names (for campaigns)
      if (item.brand_name?.toLowerCase().includes(termLower)) {
        suggestions.add(item.brand_name);
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }, []); // ✅ FIXED: Memoized with empty dependency array

  const matchesSearch = useCallback((item, term) => {
    const searchFields = [
      item.name,
      item.title,
      item.description,
      item.brand_name,
      item.location?.address,
      item.location?.city,
      item.type,
      item.area_type
    ].filter(Boolean);

    return searchFields.some(field => 
      field.toLowerCase().includes(term.toLowerCase())
    );
  }, []); // ✅ FIXED: Memoized with empty dependency array

  const getItemPrice = useCallback((item) => {
    return item.pricing?.daily_rate || 
           item.base_price || 
           item.total_budget || 
           item.total_amount || 
           0;
  }, []); // ✅ FIXED: Memoized with empty dependency array

  const checkAvailability = useCallback((item, availabilityFilter) => {
    switch (availabilityFilter) {
      case 'available':
        return item.status === 'active' || item.status === 'available';
      case 'booked':
        return item.status === 'booked' || item.status === 'occupied';
      case 'maintenance':
        return item.status === 'maintenance';
      default:
        return true;
    }
  }, []); // ✅ FIXED: Memoized with empty dependency array

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []); // ✅ FIXED: Memoized with empty dependency array

  const handleFeatureToggle = useCallback((feature) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  }, []); // ✅ FIXED: Memoized with empty dependency array

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({
      status: 'all',
      priceRange: [0, 10000],
      location: '',
      propertyType: 'all',
      areaType: 'all',
      availability: 'all',
      rating: 0,
      features: [],
      dateRange: { from: null, to: null }
    });
  }, []); // ✅ FIXED: Memoized with empty dependency array

  const saveCurrentSearch = useCallback(() => {
    const searchName = prompt('Enter a name for this search:');
    if (!searchName) return;

    const searchConfig = {
      id: Date.now(),
      name: searchName,
      searchTerm,
      filters,
      createdAt: new Date().toISOString()
    };

    const newSavedSearches = [...savedSearches, searchConfig];
    setSavedSearches(newSavedSearches);
    localStorage.setItem(`savedSearches_${type}`, JSON.stringify(newSavedSearches));
  }, [searchTerm, filters, savedSearches, type]); // ✅ FIXED: Added proper dependencies

  const loadSavedSearch = useCallback((savedSearch) => {
    setSearchTerm(savedSearch.searchTerm);
    setFilters(savedSearch.filters);
    setShowSuggestions(false);
  }, []); // ✅ FIXED: Memoized with empty dependency array

  const deleteSavedSearch = useCallback((searchId) => {
    const newSavedSearches = savedSearches.filter(s => s.id !== searchId);
    setSavedSearches(newSavedSearches);
    localStorage.setItem(`savedSearches_${type}`, JSON.stringify(newSavedSearches));
  }, [savedSearches, type]); // ✅ FIXED: Added proper dependencies

  // ✅ FIXED: Memoized computed values to prevent unnecessary recalculations
  const hasActiveFilters = useMemo(() => 
    searchTerm || 
    filters.status !== 'all' || 
    filters.location || 
    filters.propertyType !== 'all' ||
    filters.areaType !== 'all' ||
    filters.availability !== 'all' ||
    filters.rating > 0 ||
    filters.features.length > 0,
    [searchTerm, filters]
  );

  const getFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (filters.status !== 'all') count++;
    if (filters.location) count++;
    if (filters.propertyType !== 'all') count++;
    if (filters.areaType !== 'all') count++;
    if (filters.availability !== 'all') count++;
    if (filters.rating > 0) count++;
    if (filters.features.length > 0) count += filters.features.length;
    return count;
  }, [searchTerm, filters]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder={`Search ${type}...`}
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
          
          {/* Search Suggestions */}
          {showSuggestions && (
            <Card className="absolute top-full left-0 right-0 z-50 mt-2 glass-strong border-[hsl(var(--border))] rounded-2xl shadow-lg">
              <CardContent className="p-2">
                {searchSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={() => {
                      setSearchTerm(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="w-full justify-start text-left p-3 rounded-xl hover:bg-[hsl(var(--muted))]"
                  >
                    <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                    {suggestion}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Filter Buttons */}
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`glass border-[hsl(var(--border))] rounded-2xl transition-brand ${
            hasActiveFilters ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5' : ''
          }`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {getFilterCount}
            </Badge>
          )}
        </Button>

        {savedSearches.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="glass border-[hsl(var(--border))] rounded-2xl">
                <Bookmark className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 glass-strong border-[hsl(var(--border))] rounded-2xl">
              <div className="space-y-3">
                <h4 className="font-semibold">Saved Searches</h4>
                {savedSearches.map((savedSearch) => (
                  <div key={savedSearch.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-[hsl(var(--muted))]">
                    <Button
                      variant="ghost"
                      onClick={() => loadSavedSearch(savedSearch)}
                      className="flex-1 justify-start p-0"
                    >
                      <div>
                        <p className="font-medium">{savedSearch.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(savedSearch.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSavedSearch(savedSearch.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="glass border-[hsl(var(--border))] rounded-2xl"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <Card className="glass border-[hsl(var(--border))] rounded-2xl overflow-hidden">
          <CardHeader className="bg-[hsl(var(--muted))]/30 border-b border-[hsl(var(--border))] pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-brand rounded-2xl flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Advanced Filters</CardTitle>
                  <p className="text-sm text-muted-foreground">Refine your search results</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveCurrentSearch}
                  disabled={!hasActiveFilters}
                  className="rounded-xl"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(false)}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Status Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger className="glass border-[hsl(var(--border))] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-[hsl(var(--border))] rounded-xl">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">
                  Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </Label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => handleFilterChange('priceRange', value)}
                  max={10000}
                  min={0}
                  step={100}
                  className="w-full"
                />
              </div>

              {/* Location */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter city or address"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="pl-10 glass border-[hsl(var(--border))] rounded-xl"
                  />
                </div>
              </div>

              {/* Property Type */}
              {type === 'properties' && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Property Type</Label>
                  <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange('propertyType', value)}>
                    <SelectTrigger className="glass border-[hsl(var(--border))] rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-[hsl(var(--border))] rounded-xl">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="outdoor">Outdoor</SelectItem>
                      <SelectItem value="transit">Transit</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Area Type */}
              {type === 'areas' && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Area Type</Label>
                  <Select value={filters.areaType} onValueChange={(value) => handleFilterChange('areaType', value)}>
                    <SelectTrigger className="glass border-[hsl(var(--border))] rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-[hsl(var(--border))] rounded-xl">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="billboard">Billboard</SelectItem>
                      <SelectItem value="digital_display">Digital Display</SelectItem>
                      <SelectItem value="transit_shelter">Transit Shelter</SelectItem>
                      <SelectItem value="building_wrap">Building Wrap</SelectItem>
                      <SelectItem value="window_display">Window Display</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Rating Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Minimum Rating</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={filters.rating >= rating ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('rating', rating === filters.rating ? 0 : rating)}
                      className="h-8 w-8 p-0 rounded-lg"
                    >
                      <Star className={`w-4 h-4 ${filters.rating >= rating ? 'fill-current' : ''}`} />
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Features Filter */}
            <Separator className="my-6" />
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Features</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {getAvailableFeatures(type).map((feature) => (
                  <div key={feature.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature.value}
                      checked={filters.features.includes(feature.value)}
                      onCheckedChange={() => handleFeatureToggle(feature.value)}
                    />
                    <Label htmlFor={feature.value} className="text-sm">
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
        <span>Showing {filteredData.length} of {data.length} results</span>
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Filtered results</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get available features based on type
const getAvailableFeatures = (type) => {
  const commonFeatures = [
    { value: 'parking', label: 'Parking Available' },
    { value: 'accessible', label: 'Wheelchair Accessible' },
    { value: 'lighting', label: 'Good Lighting' },
    { value: 'security', label: 'Security' }
  ];

  const propertyFeatures = [
    { value: 'wifi', label: 'WiFi Available' },
    { value: 'elevator', label: 'Elevator Access' },
    { value: 'loading_dock', label: 'Loading Dock' },
    { value: 'storage', label: 'Storage Space' }
  ];

  const areaFeatures = [
    { value: 'illuminated', label: 'Illuminated' },
    { value: 'digital', label: 'Digital Display' },
    { value: 'interactive', label: 'Interactive' },
    { value: 'weather_proof', label: 'Weather Proof' }
  ];

  switch (type) {
    case 'properties':
      return [...commonFeatures, ...propertyFeatures];
    case 'areas':
      return [...commonFeatures, ...areaFeatures];
    default:
      return commonFeatures;
  }
};

export default AdvancedSearchFilter;