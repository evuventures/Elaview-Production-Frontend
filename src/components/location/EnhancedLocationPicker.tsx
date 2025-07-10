// src/components/location/EnhancedLocationPicker.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, MapPin, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import GoogleMap from '@/components/browse/maps/GoogleMap';

// Type assertions for JSX components
const InputComponent = Input as React.ComponentType<any>;
const LabelComponent = Label as React.ComponentType<any>;
const AlertComponent = Alert as React.ComponentType<any>;
const AlertDescriptionComponent = AlertDescription as React.ComponentType<any>;

interface LocationData {
  address: string;
  city: string;
  zipcode: string;
  latitude: number | null;
  longitude: number | null;
}

interface LatLng {
  lat: number;
  lng: number;
}

interface PlaceResult {
  formatted_address: string;
  geometry: {
    location: {
      lat(): number;
      lng(): number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  place_id: string;
}

interface EnhancedLocationPickerProps {
  location: LocationData;
  onLocationChange: (field: keyof LocationData, value: string | number | null) => void;
  onLocationSelect: (latlng: LatLng) => void;
  error?: string | null;
  required?: boolean;
}

const EnhancedLocationPicker: React.FC<EnhancedLocationPickerProps> = ({
  location,
  onLocationChange,
  onLocationSelect,
  error,
  required = false
}) => {
  // State management
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [geocoderService, setGeocoderService] = useState<google.maps.Geocoder | null>(null);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState<boolean>(false);
  const [selectedPredictionIndex, setSelectedPredictionIndex] = useState<number>(-1);
  const [mapCenter, setMapCenter] = useState<LatLng | null>(null);
  const [mapMarker, setMapMarker] = useState<LatLng | null>(null);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const predictionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Initialize Google Maps services
  useEffect(() => {
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      setAutocompleteService(new google.maps.places.AutocompleteService());
      setGeocoderService(new google.maps.Geocoder());
    }
  }, []);

  // Set initial map center and marker
  useEffect(() => {
    if (location.latitude && location.longitude) {
      const position = { lat: location.latitude, lng: location.longitude };
      setMapCenter(position);
      setMapMarker(position);
    } else {
      // Default to a reasonable center (US center)
      setMapCenter({ lat: 39.8283, lng: -98.5795 });
    }
  }, [location.latitude, location.longitude]);

  // Parse address components from Google Places result
  const parseAddressComponents = useCallback((addressComponents: Array<{long_name: string; short_name: string; types: string[]}>) => {
    let streetNumber = '';
    let route = '';
    let city = '';
    let zipcode = '';

    addressComponents.forEach(component => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      } else if (types.includes('route')) {
        route = component.long_name;
      } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        city = component.long_name;
      } else if (types.includes('postal_code')) {
        zipcode = component.long_name;
      }
    });

    return {
      address: `${streetNumber} ${route}`.trim() || '',
      city,
      zipcode
    };
  }, []);

  // Handle address input change with debouncing
  const handleAddressInputChange = useCallback((value: string) => {
    onLocationChange('address', value);
    setSearchStatus('idle');
    setErrorMessage('');

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce autocomplete requests
    debounceRef.current = setTimeout(() => {
      if (value.trim().length > 2 && autocompleteService) {
        setSearchStatus('searching');
        
        autocompleteService.getPlacePredictions(
          {
            input: value,
            types: ['address'],
            componentRestrictions: { country: 'us' }, // Adjust as needed
          },
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              setPredictions(predictions);
              setShowPredictions(true);
              setSearchStatus('success');
            } else {
              setPredictions([]);
              setShowPredictions(false);
              setSearchStatus('error');
              setErrorMessage('No address suggestions found');
            }
          }
        );
      } else {
        setPredictions([]);
        setShowPredictions(false);
      }
    }, 300); // 300ms debounce
  }, [autocompleteService, onLocationChange]);

  // Handle prediction selection
  const handlePredictionSelect = useCallback(async (prediction: google.maps.places.AutocompletePrediction) => {
    if (!geocoderService) return;

    setIsGeocoding(true);
    setShowPredictions(false);
    setSearchStatus('searching');

    try {
      geocoderService.geocode({ placeId: prediction.place_id }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const result = results[0];
          const location = result.geometry.location;
          const lat = location.lat();
          const lng = location.lng();

          // Parse address components
          const addressData = parseAddressComponents(result.address_components);

          // Update all location fields
          onLocationChange('address', addressData.address || result.formatted_address);
          onLocationChange('city', addressData.city);
          onLocationChange('zipcode', addressData.zipcode);
          onLocationChange('latitude', lat);
          onLocationChange('longitude', lng);

          // Update map
          const newPosition = { lat, lng };
          setMapCenter(newPosition);
          setMapMarker(newPosition);
          onLocationSelect(newPosition);

          setSearchStatus('success');
          setErrorMessage('');
        } else {
          setSearchStatus('error');
          setErrorMessage('Unable to find location details');
        }
        setIsGeocoding(false);
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      setSearchStatus('error');
      setErrorMessage('Error finding location');
      setIsGeocoding(false);
    }
  }, [geocoderService, parseAddressComponents, onLocationChange, onLocationSelect]);

  // Handle map click
  const handleMapClick = useCallback(async (event: google.maps.MapMouseEvent) => {
    if (!event.latLng || !geocoderService) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const position = { lat, lng };

    setIsGeocoding(true);
    setMapMarker(position);

    try {
      geocoderService.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const result = results[0];
          const addressData = parseAddressComponents(result.address_components);

          // Update location fields
          onLocationChange('address', addressData.address || result.formatted_address);
          onLocationChange('city', addressData.city);
          onLocationChange('zipcode', addressData.zipcode);
          onLocationChange('latitude', lat);
          onLocationChange('longitude', lng);

          onLocationSelect(position);
          setSearchStatus('success');
          setErrorMessage('');
        } else {
          setSearchStatus('error');
          setErrorMessage('Unable to get address for this location');
        }
        setIsGeocoding(false);
      });
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setSearchStatus('error');
      setErrorMessage('Error getting address');
      setIsGeocoding(false);
    }
  }, [geocoderService, parseAddressComponents, onLocationChange, onLocationSelect]);

  // Handle keyboard navigation in predictions
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showPredictions || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedPredictionIndex(prev => 
          prev < predictions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedPredictionIndex(prev => 
          prev > 0 ? prev - 1 : predictions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedPredictionIndex >= 0) {
          handlePredictionSelect(predictions[selectedPredictionIndex]);
        }
        break;
      case 'Escape':
        setShowPredictions(false);
        setSelectedPredictionIndex(-1);
        break;
    }
  }, [showPredictions, predictions, selectedPredictionIndex, handlePredictionSelect]);

  // Close predictions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (predictionsRef.current && !predictionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowPredictions(false);
        setSelectedPredictionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      {/* Address Input with Autocomplete */}
      <div className="relative">
        <LabelComponent htmlFor="address-search" className="text-base font-semibold text-muted-foreground mb-2 block">
          Search Address {required && '*'}
        </LabelComponent>
        
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            {searchStatus === 'searching' || isGeocoding ? (
              <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--primary))]" />
            ) : searchStatus === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : searchStatus === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <Search className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          
          <InputComponent
            ref={inputRef}
            id="address-search"
            type="text"
            value={location.address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAddressInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type address or click on map..."
            className="pl-12 pr-4 py-3 text-base bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl backdrop-blur-sm focus-brand transition-brand"
            disabled={isGeocoding}
          />
        </div>

        {/* Autocomplete Predictions Dropdown */}
        {showPredictions && predictions.length > 0 && (
          <div 
            ref={predictionsRef}
            className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-lg backdrop-blur-md"
          >
            {predictions.map((prediction, index) => (
              <button
                key={prediction.place_id}
                type="button"
                className={`w-full text-left px-4 py-3 hover:bg-[hsl(var(--muted))] transition-colors border-b border-[hsl(var(--border))] last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl ${
                  index === selectedPredictionIndex ? 'bg-[hsl(var(--muted))]' : ''
                }`}
                onClick={() => handlePredictionSelect(prediction)}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[hsl(var(--primary))] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {prediction.structured_formatting.main_text}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {prediction.structured_formatting.secondary_text}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error Display */}
      {(errorMessage || error) && (
        <AlertComponent variant="destructive" className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescriptionComponent>{errorMessage || error}</AlertDescriptionComponent>
        </AlertComponent>
      )}

      {/* Map Section */}
      <div>
        <LabelComponent className="text-base font-semibold text-muted-foreground mb-2 block">
          Location on Map {required && '*'}
        </LabelComponent>
        <p className="text-sm text-muted-foreground mb-3">
          Click on the map to set exact location or search above for address suggestions
        </p>
        
        <div className={`relative rounded-3xl overflow-hidden border-2 ${
          error ? 'border-red-500' : 'border-[hsl(var(--border))]'
        } shadow-lg transition-all duration-200`}>
          <div style={{ height: '400px', width: '100%' }}>
            {mapCenter && (
              <GoogleMap
                properties={[]}
                onPropertyClick={() => {}}
                center={mapCenter}
                zoom={mapMarker ? 15 : 10}
                className="h-full w-full"
                onClick={handleMapClick}
                marker={mapMarker}
              />
            )}
          </div>
          
          {/* Loading Overlay */}
          {isGeocoding && (
            <div className="absolute inset-0 bg-[hsl(var(--background))]/80 backdrop-blur-sm flex items-center justify-center z-[1000] rounded-3xl">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--primary))] mx-auto mb-2" />
                <p className="text-sm font-medium text-[hsl(var(--primary))]">
                  {searchStatus === 'searching' ? 'Finding location...' : 'Getting address...'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Location Confirmation */}
      {location.latitude && location.longitude && (
        <div className="bg-[hsl(var(--muted))] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium text-foreground">Location Selected</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </p>
          {location.address && (
            <p className="text-sm text-muted-foreground mt-1">
              Address: {location.address}
              {location.city && `, ${location.city}`}
              {location.zipcode && ` ${location.zipcode}`}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedLocationPicker;