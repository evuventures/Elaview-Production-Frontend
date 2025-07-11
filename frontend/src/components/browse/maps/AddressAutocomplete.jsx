// src/components/map/AddressAutocomplete.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, AlertTriangle } from 'lucide-react';

// Debounce hook to limit API calls
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const AddressAutocomplete = ({ 
  formData, 
  onLocationChange, 
  onLocationSelect, 
  errors, 
  setErrors 
}) => {
  const [addressInput, setAddressInput] = useState(formData.location.address || '');
  const [cityInput, setCityInput] = useState(formData.location.city || '');
  const [zipInput, setZipInput] = useState(formData.location.zipcode || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  const autocompleteRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // Debounce the address input to avoid too many API calls
  const debouncedAddress = useDebounce(addressInput, 500);

  // Initialize Google Places Autocomplete Service
  const autocompleteService = useRef(null);
  const placesService = useRef(null);

  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      
      // Create a temporary map element for Places service
      const mapDiv = document.createElement('div');
      const map = new window.google.maps.Map(mapDiv);
      placesService.current = new window.google.maps.places.PlacesService(map);
    }
  }, []);

  // Handle address input changes and fetch suggestions
  useEffect(() => {
    if (debouncedAddress && debouncedAddress.length >= 3 && autocompleteService.current) {
      fetchAddressSuggestions(debouncedAddress);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedAddress]);

  const fetchAddressSuggestions = useCallback(async (input) => {
    if (!autocompleteService.current) return;

    setIsLoadingSuggestions(true);
    
    try {
      const request = {
        input: input,
        types: ['address'],
        componentRestrictions: { country: 'us' }, // Limit to US addresses
      };

      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        setIsLoadingSuggestions(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions.slice(0, 5)); // Limit to 5 suggestions
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      });
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setIsLoadingSuggestions(false);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  const handleSuggestionClick = useCallback(async (suggestion) => {
    if (!placesService.current) return;

    setIsGeocoding(true);
    setShowSuggestions(false);

    try {
      const request = {
        placeId: suggestion.place_id,
        fields: ['geometry', 'address_components', 'formatted_address']
      };

      placesService.current.getDetails(request, (place, status) => {
        setIsGeocoding(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const location = place.geometry.location;
          const addressComponents = place.address_components;
          
          // Parse address components
          let streetNumber = '';
          let streetName = '';
          let city = '';
          let zipCode = '';
          let state = '';

          addressComponents.forEach(component => {
            const types = component.types;
            if (types.includes('street_number')) {
              streetNumber = component.long_name;
            } else if (types.includes('route')) {
              streetName = component.long_name;
            } else if (types.includes('locality') || types.includes('sublocality')) {
              city = component.long_name;
            } else if (types.includes('postal_code')) {
              zipCode = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              state = component.short_name;
            }
          });

          const fullAddress = streetNumber && streetName ? `${streetNumber} ${streetName}` : place.formatted_address.split(',')[0];

          // Update all form fields
          setAddressInput(fullAddress);
          setCityInput(city);
          setZipInput(zipCode);

          // Update parent component
          onLocationChange('address', fullAddress);
          onLocationChange('city', city);
          onLocationChange('zipcode', zipCode);
          onLocationChange('state', state);
          onLocationChange('latitude', location.lat());
          onLocationChange('longitude', location.lng());

          // Update map position
          onLocationSelect({
            lat: location.lat(),
            lng: location.lng()
          });

          // Clear any location errors
          if (errors.location || errors.location_address) {
            setErrors(prev => ({ 
              ...prev, 
              location: null, 
              location_address: null 
            }));
          }
        } else {
          console.error('Error getting place details:', status);
        }
      });
    } catch (error) {
      console.error('Error getting place details:', error);
      setIsGeocoding(false);
    }
  }, [onLocationChange, onLocationSelect, errors, setErrors]);

  // Handle manual input changes
  const handleAddressInputChange = (value) => {
    setAddressInput(value);
    onLocationChange('address', value);
  };

  const handleCityInputChange = (value) => {
    setCityInput(value);
    onLocationChange('city', value);
  };

  const handleZipInputChange = (value) => {
    setZipInput(value);
    onLocationChange('zipcode', value);
  };

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Street Address with Autocomplete */}
      <div className="relative">
        <Label htmlFor="address" className="text-base font-semibold text-muted-foreground mb-2 block">
          Street Address *
        </Label>
        <div className="relative">
          <Input 
            id="address"
            ref={autocompleteRef}
            value={addressInput}
            onChange={(e) => handleAddressInputChange(e.target.value)}
            placeholder="Start typing your address..."
            className={`bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 pr-12 text-base backdrop-blur-sm focus-brand transition-brand ${
              errors.location_address ? 'border-red-500' : ''
            }`}
            autoComplete="off"
          />
          
          {/* Loading indicator */}
          {(isLoadingSuggestions || isGeocoding) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--primary))]" />
            </div>
          )}

          {/* Address suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto"
            >
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-[hsl(var(--muted))] transition-colors first:rounded-t-2xl last:rounded-b-2xl border-b border-[hsl(var(--border))] last:border-b-0"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[hsl(var(--primary))] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-[hsl(var(--foreground))] text-sm">
                        {suggestion.structured_formatting?.main_text || suggestion.description.split(',')[0]}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                        {suggestion.structured_formatting?.secondary_text || suggestion.description.split(',').slice(1).join(',')}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {errors.location_address && (
          <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {errors.location_address}
          </p>
        )}
      </div>

      {/* City and Zip Code */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label htmlFor="city" className="text-base font-semibold text-muted-foreground mb-2 block">
            City
          </Label>
          <Input 
            id="city"
            value={cityInput}
            onChange={(e) => handleCityInputChange(e.target.value)}
            placeholder="New York" 
            className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm focus-brand transition-brand"
          />
        </div>
        <div>
          <Label htmlFor="zipcode" className="text-base font-semibold text-muted-foreground mb-2 block">
            Zip Code
          </Label>
          <Input 
            id="zipcode"
            value={zipInput}
            onChange={(e) => handleZipInputChange(e.target.value)}
            placeholder="10001" 
            className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm focus-brand transition-brand"
          />
        </div>
      </div>

      {/* Helper text */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="text-blue-800 dark:text-blue-200 font-medium">
            Start typing your address
          </p>
          <p className="text-blue-600 dark:text-blue-300 mt-1">
            We'll show suggestions and automatically update the map when you select an address.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddressAutocomplete;