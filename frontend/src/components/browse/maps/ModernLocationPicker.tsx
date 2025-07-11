import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

// Types
interface LocationData {
  address: string;
  city: string;
  zipcode: string;
  latitude: number | null;
  longitude: number | null;
}

interface LocationPickerProps {
  location: LocationData;
  onLocationChange: (field: keyof LocationData, value: string | number | null) => void;
  onLocationSelect?: (location: LocationData) => void;
  error?: string | null;
  required?: boolean;
  className?: string;
}

interface AutocompleteSuggestion {
  placePrediction: google.maps.places.PlacePrediction | null;
}

interface AutocompleteRequest {
  input: string;
  sessionToken?: google.maps.places.AutocompleteSessionToken;
  locationBias?: google.maps.places.LocationBias;
  locationRestriction?: google.maps.places.LocationRestriction;
  includedPrimaryTypes?: string[];
  includedRegionCodes?: string[];
}

const libraries: ('places' | 'geometry' | 'drawing' | 'visualization')[] = ['places'];

const ModernLocationPicker: React.FC<LocationPickerProps> = ({
  location,
  onLocationChange,
  onLocationSelect,
  error,
  required = false,
  className = ''
}) => {
  // State management
  const [inputValue, setInputValue] = useState(location.address || '');
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({
    lat: location.latitude || 33.7175, // Orange, California default
    lng: location.longitude || -117.8311
  });

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Google Maps API loading
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  // Initialize session token
  useEffect(() => {
    if (isLoaded && window.google?.maps?.places?.AutocompleteSessionToken) {
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
    }
  }, [isLoaded]);

  // Update map center when location changes
  useEffect(() => {
    if (location.latitude && location.longitude) {
      setMapCenter({
        lat: location.latitude,
        lng: location.longitude
      });
    }
  }, [location.latitude, location.longitude]);

  // Debounced autocomplete function
  const fetchSuggestions = useCallback(async (input: string) => {
    if (!isLoaded || !window.google?.maps?.places?.AutocompleteSuggestion || !input.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);

      // Create session token if needed
      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
      }

      const request: AutocompleteRequest = {
        input: input.trim(),
        sessionToken: sessionTokenRef.current,
        locationBias: {
          center: mapCenter,
          radius: 50000 // 50km radius
        },
        includedPrimaryTypes: ['address', 'establishment', 'geocode'],
        includedRegionCodes: ['US'] // Restrict to US for better performance
      };

      const { suggestions: fetchedSuggestions } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
      
      setSuggestions(fetchedSuggestions || []);
      setShowSuggestions(true);
      setActiveSuggestionIndex(-1);
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, mapCenter]);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onLocationChange('address', value);

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for debouncing
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion: AutocompleteSuggestion) => {
    if (!suggestion.placePrediction) return;
    
    try {
      setIsLoading(true);

      // Get place details
      const place = suggestion.placePrediction.toPlace();
      const fields = ['location', 'formattedAddress', 'addressComponents', 'displayName'];
      
      await place.fetchFields({ fields });

      // Extract address components
      const addressComponents = place.addressComponents || [];
      let city = '';
      let zipcode = '';

      addressComponents.forEach(component => {
        const types = component.types;
        if (types.includes('locality')) {
          city = component.longText || '';
        } else if (types.includes('postal_code')) {
          zipcode = component.longText || '';
        }
      });

      const newLocation: LocationData = {
        address: place.formattedAddress || suggestion.placePrediction.text.text,
        city,
        zipcode,
        latitude: place.location?.lat() || null,
        longitude: place.location?.lng() || null
      };

      // Update all location fields
      Object.entries(newLocation).forEach(([field, value]) => {
        onLocationChange(field as keyof LocationData, value);
      });

      // Update input and UI state
      setInputValue(newLocation.address);
      setShowSuggestions(false);
      setSuggestions([]);
      setActiveSuggestionIndex(-1);

      // Update map center
      if (newLocation.latitude && newLocation.longitude) {
        setMapCenter({
          lat: newLocation.latitude,
          lng: newLocation.longitude
        });
      }

      // Call onLocationSelect if provided
      if (onLocationSelect) {
        onLocationSelect(newLocation);
      }

      // Create new session token for next search
      if (window.google?.maps?.places?.AutocompleteSessionToken) {
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
      }

    } catch (error) {
      console.error('Error selecting place:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle map click for reverse geocoding
  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    if (!event.latLng || !window.google?.maps?.Geocoder) return;

    try {
      setIsLoading(true);
      
      const geocoder = new google.maps.Geocoder();
      const latLng = event.latLng;
      
      const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ location: latLng }, (results, status) => {
          if (status === 'OK' && results) {
            resolve(results);
          } else {
            reject(new Error('Geocoding failed'));
          }
        });
      });

      if (results.length > 0) {
        const result = results[0];
        const addressComponents = result.address_components;
        
        let city = '';
        let zipcode = '';

        addressComponents.forEach(component => {
          const types = component.types;
          if (types.includes('locality')) {
            city = component.long_name;
          } else if (types.includes('postal_code')) {
            zipcode = component.long_name;
          }
        });

        const newLocation: LocationData = {
          address: result.formatted_address,
          city,
          zipcode,
          latitude: latLng.lat(),
          longitude: latLng.lng()
        };

        // Update all location fields
        Object.entries(newLocation).forEach(([field, value]) => {
          onLocationChange(field as keyof LocationData, value);
        });

        setInputValue(newLocation.address);
        setShowSuggestions(false);

        // Call onLocationSelect if provided
        if (onLocationSelect) {
          onLocationSelect(newLocation);
        }
      }
    } catch (error) {
      console.error('Error with reverse geocoding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestionIndex >= 0) {
          handleSuggestionSelect(suggestions[activeSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="space-y-3">
        <div className="h-12 bg-muted animate-pulse rounded-md"></div>
        <div className="h-96 bg-muted animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Address Input Section */}
      <div>
        <label className="text-base font-semibold text-muted-foreground mb-2 block">
          Property Address {required && <span className="text-red-500">*</span>}
        </label>
        
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue.trim() && setShowSuggestions(suggestions.length > 0)}
            placeholder="Start typing an address..."
            className={`w-full h-12 px-4 text-base border-2 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all ${
              error ? 'border-red-500' : 'border-border'
            }`}
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            role="combobox"
          />
          
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul
              className="absolute z-50 w-full mt-1 bg-background border-2 border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
              role="listbox"
            >
              {suggestions.map((suggestion, index) => (
                suggestion.placePrediction && (
                  <li
                    key={suggestion.placePrediction.placeId}
                    ref={el => suggestionRefs.current[index] = el}
                    className={`px-4 py-3 cursor-pointer transition-colors border-b border-border last:border-b-0 ${
                      index === activeSuggestionIndex 
                        ? 'bg-muted text-muted-foreground' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    role="option"
                    aria-selected={index === activeSuggestionIndex}
                  >
                    <div className="font-medium text-sm">
                      {suggestion.placePrediction.text.text}
                    </div>
                    {suggestion.placePrediction.secondaryText && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {suggestion.placePrediction.secondaryText.text}
                      </div>
                    )}
                  </li>
                )
              ))}
            </ul>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-2" role="alert">
            {error}
          </p>
        )}
        
        <p className="text-xs text-muted-foreground mt-2">
          Type an address or click on the map to set location
        </p>
      </div>

      {/* Map Section */}
      <div>
        <label className="text-base font-semibold text-muted-foreground mb-2 block">
          Location on Map
        </label>
        
        <div className="relative rounded-lg overflow-hidden border-2 border-border shadow-lg">
          <GoogleMap
            mapContainerStyle={{
              width: '100%',
              height: '384px' // h-96 equivalent
            }}
            center={mapCenter}
            zoom={location.latitude && location.longitude ? 15 : 10}
            onClick={handleMapClick}
            onLoad={(map: google.maps.Map) => {
              mapRef.current = map;
            }}
            options={{
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }]
                }
              ]
            }}
          >
            {/* Marker for current location */}
            {location.latitude && location.longitude && (
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -100%)',
                  zIndex: 1
                }}
              >
                <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              </div>
            )}
          </GoogleMap>
          
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <div className="bg-background px-4 py-2 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm">Updating location...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current Location Display */}
      {(location.latitude && location.longitude) && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <div className="font-medium">Current Coordinates:</div>
          <div>Latitude: {location.latitude.toFixed(6)}</div>
          <div>Longitude: {location.longitude.toFixed(6)}</div>
        </div>
      )}
    </div>
  );
};

export default ModernLocationPicker;