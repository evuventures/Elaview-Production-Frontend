import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LocationData } from '../../../types/property';

interface SimpleLocationPickerProps {
  location: LocationData;
  onLocationChange: (field: keyof LocationData, value: string | number | null) => void;
  onLocationSelect?: (location: LocationData) => void;
  error?: string | null;
  required?: boolean;
  className?: string;
}

interface AutocompleteSuggestion {
  placePrediction: {
    placeId: string;
    text: { text: string };
    secondaryText?: { text: string };
  };
}

const EnhancedLocationPicker: React.FC<SimpleLocationPickerProps> = ({
  location,
  onLocationChange,
  onLocationSelect,
  error,
  required = false,
  className = ''
}) => {
  // State
  const [inputValue, setInputValue] = useState(location.address || '');
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(10);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  // Check if Google Maps is loaded
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleLoaded(true);
        return true;
      }
      return false;
    };

    if (checkGoogleMaps()) {
      return;
    }

    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Initialize map with smooth loading
  useEffect(() => {
    if (!isGoogleLoaded || !mapRef.current || googleMapRef.current) return;

    const mapOptions: google.maps.MapOptions = {
      center: {
        lat: location.latitude || 33.7175, // Orange, California
        lng: location.longitude || -117.8311
      },
      zoom: location.latitude && location.longitude ? 15 : 10,
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
    };

    googleMapRef.current = new google.maps.Map(mapRef.current, mapOptions);

    // Store initial zoom
    setCurrentZoom(mapOptions.zoom || 10);

    // Add zoom change listener to track user's preferred zoom
    googleMapRef.current.addListener('zoom_changed', () => {
      if (googleMapRef.current) {
        setCurrentZoom(googleMapRef.current.getZoom() || 10);
      }
    });

    // Add click listener for reverse geocoding
    googleMapRef.current.addListener('click', handleMapClick);

    // Map loaded successfully
    googleMapRef.current.addListener('idle', () => {
      setIsMapLoading(false);
    });

    // Create session token
    if (window.google.maps.places.AutocompleteSessionToken) {
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
    }
  }, [isGoogleLoaded]);

  // Update map center and marker with smooth animation
  useEffect(() => {
    if (!googleMapRef.current) return;

    if (location.latitude && location.longitude) {
      const newCenter = { lat: location.latitude, lng: location.longitude };
      
      setIsUpdatingLocation(true);

      // Smooth pan to new location instead of instant setCenter
      googleMapRef.current.panTo(newCenter);

      // Update or create marker with bounce animation
      if (markerRef.current) {
        markerRef.current.setPosition(newCenter);
        markerRef.current.setAnimation(google.maps.Animation.BOUNCE);
        
        // Stop bounce after 1.5 seconds
        setTimeout(() => {
          if (markerRef.current) {
            markerRef.current.setAnimation(null);
          }
        }, 1500);
      } else {
        markerRef.current = new google.maps.Marker({
          position: newCenter,
          map: googleMapRef.current,
          title: 'Property Location',
          animation: google.maps.Animation.DROP
        });
      }

      // Reset updating state after animation
      setTimeout(() => {
        setIsUpdatingLocation(false);
      }, 1000);
    }
  }, [location.latitude, location.longitude]);

  // Fetch suggestions using new API
  const fetchSuggestions = useCallback(async (input: string) => {
    if (!isGoogleLoaded || !window.google?.maps?.places?.AutocompleteSuggestion || !input.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);

      if (!sessionTokenRef.current && window.google.maps.places.AutocompleteSessionToken) {
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
      }

      const request = {
        input: input.trim(),
        sessionToken: sessionTokenRef.current,
        locationBias: {
          center: { lat: 33.7175, lng: -117.8311 },
          radius: 50000
        },
        includedPrimaryTypes: ['address', 'establishment', 'geocode'],
        includedRegionCodes: ['US']
      };

      const { suggestions: fetchedSuggestions } = await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
      
      setSuggestions(fetchedSuggestions || []);
      setShowSuggestions(true);
      setActiveSuggestionIndex(-1);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      await fetchSuggestionsLegacy(input);
    } finally {
      setIsLoading(false);
    }
  }, [isGoogleLoaded]);

  // Fallback to legacy AutocompleteService
  const fetchSuggestionsLegacy = useCallback(async (input: string) => {
    if (!window.google?.maps?.places?.AutocompleteService) return;

    try {
      const service = new google.maps.places.AutocompleteService();
      
      const request: google.maps.places.AutocompletionRequest = {
        input: input.trim(),
        componentRestrictions: { country: 'US' },
        location: new google.maps.LatLng(33.7175, -117.8311),
        radius: 50000
      };

      service.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          const convertedSuggestions = predictions.map(prediction => ({
            placePrediction: {
              placeId: prediction.place_id,
              text: { text: prediction.description },
              secondaryText: prediction.structured_formatting.secondary_text 
                ? { text: prediction.structured_formatting.secondary_text }
                : undefined
            }
          }));
          setSuggestions(convertedSuggestions);
          setShowSuggestions(true);
        }
      });
    } catch (error) {
      console.error('Error with legacy autocomplete:', error);
      setSuggestions([]);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onLocationChange('address', value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Handle suggestion selection with zoom preservation
  const handleSuggestionSelect = async (suggestion: AutocompleteSuggestion) => {
    if (!window.google?.maps?.places?.PlacesService) return;

    try {
      setIsLoading(true);
      setIsUpdatingLocation(true);
      
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId: suggestion.placePrediction.placeId,
        fields: ['formatted_address', 'geometry', 'address_components', 'name']
      };

      service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const addressComponents = place.address_components || [];
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
            address: place.formatted_address || suggestion.placePrediction.text.text,
            city,
            zipcode,
            latitude: place.geometry?.location?.lat() || null,
            longitude: place.geometry?.location?.lng() || null
          };

          // Update all fields
          Object.entries(newLocation).forEach(([field, value]) => {
            onLocationChange(field as keyof LocationData, value);
          });

          setInputValue(newLocation.address);
          setShowSuggestions(false);
          setSuggestions([]);

          // Preserve current zoom level - this is the key improvement!
          if (googleMapRef.current && newLocation.latitude && newLocation.longitude) {
            googleMapRef.current.setZoom(currentZoom);
          }

          if (onLocationSelect) {
            onLocationSelect(newLocation);
          }

          // Create new session token
          if (window.google.maps.places.AutocompleteSessionToken) {
            sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
          }
        }
        setIsLoading(false);
        setTimeout(() => setIsUpdatingLocation(false), 1000);
      });
    } catch (error) {
      console.error('Error selecting place:', error);
      setIsLoading(false);
      setIsUpdatingLocation(false);
    }
  };

  // Handle map click for reverse geocoding
  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    if (!event.latLng || !window.google?.maps?.Geocoder) return;

    try {
      setIsLoading(true);
      setIsUpdatingLocation(true);
      
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode({ location: event.latLng }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
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
            latitude: event.latLng!.lat(),
            longitude: event.latLng!.lng()
          };

          Object.entries(newLocation).forEach(([field, value]) => {
            onLocationChange(field as keyof LocationData, value);
          });

          setInputValue(newLocation.address);
          setShowSuggestions(false);

          if (onLocationSelect) {
            onLocationSelect(newLocation);
          }
        }
        setIsLoading(false);
        setTimeout(() => setIsUpdatingLocation(false), 1000);
      });
    } catch (error) {
      console.error('Error with reverse geocoding:', error);
      setIsLoading(false);
      setIsUpdatingLocation(false);
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
        break;
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-3 animate-pulse">
      <div className="h-12 bg-muted rounded-lg"></div>
      <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading map...</p>
        </div>
      </div>
    </div>
  );

  if (!isGoogleLoaded) {
    return <LoadingSkeleton />;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Address Input */}
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
            className={`w-full h-12 px-4 text-base border-2 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${
              error ? 'border-red-500' : 'border-border'
            } ${isLoading ? 'pr-12' : ''}`}
            disabled={isLoading && !inputValue}
          />
          
          {/* Enhanced Loading Indicator */}
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="relative">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-muted border-t-primary"></div>
                <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
              </div>
            </div>
          )}

          {/* Suggestions Dropdown with smooth animation */}
          {showSuggestions && suggestions.length > 0 && (
            <div 
              className="absolute z-50 w-full mt-1 bg-background border-2 border-border rounded-lg shadow-lg max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200"
              style={{ animation: 'slideDown 0.2s ease-out' }}
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.placePrediction.placeId}
                  className={`px-4 py-3 cursor-pointer transition-all duration-150 border-b border-border last:border-b-0 ${
                    index === activeSuggestionIndex 
                      ? 'bg-primary/10 text-primary border-l-4 border-l-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  role="option"
                  aria-selected={index === activeSuggestionIndex}
                >
                  <div className="font-medium text-sm flex items-center">
                    <svg className="w-4 h-4 mr-2 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {suggestion.placePrediction.text.text}
                  </div>
                  {suggestion.placePrediction.secondaryText && (
                    <div className="text-xs text-muted-foreground mt-1 ml-6">
                      {suggestion.placePrediction.secondaryText.text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-2 animate-in slide-in-from-top-1 duration-200" role="alert">
            {error}
          </p>
        )}
        
        <p className="text-xs text-muted-foreground mt-2">
          Type an address or click on the map to set location
        </p>
      </div>

      {/* Enhanced Map */}
      <div>
        <label className="text-base font-semibold text-muted-foreground mb-2 block">
          Location on Map
        </label>
        
        <div className="relative rounded-lg overflow-hidden border-2 border-border shadow-lg">
          <div
            ref={mapRef}
            style={{ width: '100%', height: '384px' }}
            className={`bg-muted transition-all duration-300 ${isMapLoading ? 'animate-pulse' : ''}`}
          />
          
          {/* Map Loading Overlay */}
          {isMapLoading && (
            <div className="absolute inset-0 bg-muted/80 flex items-center justify-center">
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary mx-auto"></div>
                  <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
                </div>
                <p className="text-sm text-muted-foreground">Loading interactive map...</p>
              </div>
            </div>
          )}

          {/* Location Update Indicator */}
          {isUpdatingLocation && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-border animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-muted border-t-primary"></div>
                  <span className="text-sm font-medium">Updating location...</span>
                </div>
              </div>
            </div>
          )}

          {/* Zoom Level Indicator */}
          {!isMapLoading && (
            <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground border border-border">
              Zoom: {currentZoom}x
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Coordinates Display */}
      {(location.latitude && location.longitude) && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border animate-in slide-in-from-bottom-1 duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium flex items-center">
                <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Location Set
              </div>
              <div className="mt-1">
                <div>Latitude: {location.latitude.toFixed(6)}</div>
                <div>Longitude: {location.longitude.toFixed(6)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-600 font-medium">✓ Ready</div>
              <div className="text-xs mt-1">Zoom: {currentZoom}x</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedLocationPicker;