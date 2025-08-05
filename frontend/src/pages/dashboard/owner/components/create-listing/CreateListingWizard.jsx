// src/pages/dashboard/owner/components/create-listing/CreateListingWizard.jsx
// ✅ FIXED: Google Places zipCode extraction + centralized Google Maps loading

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { 
  ArrowLeft, ArrowRight, Plus, X, Upload, MapPin, 
  Building2, Camera, Check, AlertCircle 
} from 'lucide-react';

import apiClient from '../../../../../api/apiClient.js';
import googleMapsLoader from '../../../../../services/googleMapsLoader.js'; // ✅ NEW: Use centralized loader

export default function CreateListingWizard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapsLoaded, setMapsLoaded] = useState(false); // ✅ NEW: Track maps loading state

  // Property data
  const [propertyData, setPropertyData] = useState({
    title: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    latitude: null,
    longitude: null,
    propertyType: 'COMMERCIAL',
    primary_image: null,
    description: 'High-visibility advertising space in prime location. Perfect for brand awareness campaigns.'
  });

  // Spaces data - can add multiple spaces
  const [spacesData, setSpacesData] = useState([{
    id: 'space-1',
    name: '',
    type: 'storefront_window',
    baseRate: '',
    currency: 'USD',
    dimensions: { width: '', height: '', unit: 'meters' }
  }]);

  // Google Places refs
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // ✅ FIXED: Initialize Google Places Autocomplete with centralized loader
  useEffect(() => {
    let mounted = true;

    const initAutocomplete = async () => {
      try {
        console.log('🗺️ Initializing Google Places Autocomplete...');
        
        // Wait for Google Maps to be loaded
        await googleMapsLoader.waitForLoad();
        
        if (!mounted) return;
        
        // Check if the input element exists
        if (!addressInputRef.current) {
          console.log('⏳ Address input not ready yet');
          return;
        }

        // Check if autocomplete is already initialized
        if (autocompleteRef.current) {
          console.log('✅ Autocomplete already initialized');
          return;
        }

        console.log('🎯 Creating Autocomplete instance...');
        
        // Create the autocomplete instance
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          addressInputRef.current,
          {
            types: ['address'],
            fields: ['formatted_address', 'address_components', 'geometry', 'name', 'place_id']
          }
        );

        // Add the place changed listener
        autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
        
        console.log('✅ Google Places Autocomplete initialized successfully');
        setMapsLoaded(true);

      } catch (error) {
        console.error('❌ Error initializing autocomplete:', error);
        setError('Failed to initialize address autocomplete. Please refresh and try again.');
      }
    };

    // Initialize when component mounts
    initAutocomplete();

    // Cleanup function
    return () => {
      mounted = false;
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []); // Run once on mount

  // ✅ Re-initialize if the input ref changes (e.g., after re-render)
  useEffect(() => {
    if (mapsLoaded && addressInputRef.current && !autocompleteRef.current) {
      console.log('🔄 Re-initializing autocomplete after input change');
      
      if (window.google?.maps?.places) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          addressInputRef.current,
          {
            types: ['address'],
            fields: ['formatted_address', 'address_components', 'geometry', 'name', 'place_id']
          }
        );
        autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
      }
    }
  }, [mapsLoaded, currentStep]); // Re-check when step changes

  // ✅ Simple currency detection based on country
  const detectCurrency = (countryCode) => {
    const currencyMap = {
      'US': 'USD',
      'IL': 'ILS', 
      'GB': 'GBP',
      'DE': 'EUR',
      'FR': 'EUR',
      'ES': 'EUR',
      'IT': 'EUR',
      'NL': 'EUR',
      'CA': 'CAD',
      'AU': 'AUD',
      'JP': 'JPY',
      'CN': 'CNY',
      'IN': 'INR',
      'BR': 'BRL',
      'MX': 'MXN'
    };
    return currencyMap[countryCode] || 'USD';
  };

  // ✅ ENHANCED: Handle Google Places selection with better extraction
  const handlePlaceSelect = () => {
    if (!autocompleteRef.current) {
      console.log('❌ Autocomplete not initialized');
      return;
    }

    const place = autocompleteRef.current.getPlace();
    
    if (!place || !place.geometry) {
      console.log('❌ No place selected or no geometry');
      setError('Please select a valid address from the dropdown suggestions');
      return;
    }

    console.log('📍 Place selected:', place);

    const addressComponents = place.address_components || [];
    let streetNumber = '';
    let route = '';
    let city = '';
    let state = '';
    let country = '';
    let zipCode = '';

    console.log('🗺️ Parsing address components:', addressComponents);

    // Parse each component
    addressComponents.forEach(component => {
      const types = component.types;
      
      // Street number
      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      }
      // Street name
      else if (types.includes('route')) {
        route = component.long_name;
      }
      // City
      else if (types.includes('locality')) {
        city = component.long_name;
      }
      // Backup city detection
      else if (!city && types.includes('sublocality_level_1')) {
        city = component.long_name;
      }
      else if (!city && types.includes('administrative_area_level_2')) {
        city = component.long_name;
      }
      // State/Province
      else if (types.includes('administrative_area_level_1')) {
        state = component.short_name || component.long_name;
      }
      // Country
      else if (types.includes('country')) {
        country = component.short_name;
      }
      // Postal code
      else if (types.includes('postal_code')) {
        zipCode = component.long_name;
      }
    });

    // Build the street address
    const streetAddress = streetNumber && route 
      ? `${streetNumber} ${route}`
      : route || place.name || '';

    // Use formatted address if we don't have a street address
    const finalAddress = streetAddress || place.formatted_address || '';

    // Auto-detect currency based on country
    const currency = detectCurrency(country);

    console.log('✅ Extracted location data:', { 
      address: finalAddress,
      city, 
      state, 
      country, 
      zipCode, 
      currency,
      coordinates: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      }
    });

    // Update property data
    setPropertyData(prev => ({
      ...prev,
      address: finalAddress,
      city: city || prev.city,
      state: state || prev.state,
      country: country || prev.country,
      zipCode: zipCode || prev.zipCode,
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng()
    }));

    // Update all spaces with detected currency
    setSpacesData(prev => prev.map(space => ({
      ...space,
      currency: currency
    })));

    // Clear any previous errors
    setError('');
  };

  // ✅ Handle manual address input changes
  const handleAddressChange = (e) => {
    setPropertyData(prev => ({ ...prev, address: e.target.value }));
    
    // Clear location data if user is typing manually
    // This ensures they select from dropdown for proper geocoding
    if (!e.target.value) {
      setPropertyData(prev => ({
        ...prev,
        city: '',
        state: '',
        country: '',
        zipCode: '',
        latitude: null,
        longitude: null
      }));
    }
  };

  // ✅ Handle image upload with REAL API
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image must be less than 5MB');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🖼️ Uploading image:', file.name, file.size);
      const uploadResult = await apiClient.uploadFile(file, 'property_image');
      
      if (uploadResult.success) {
        console.log('✅ Image uploaded successfully:', uploadResult.data.url);
        setPropertyData(prev => ({
          ...prev,
          primary_image: uploadResult.data.url
        }));
      } else {
        console.error('❌ Upload failed:', uploadResult.error);
        setError('Failed to upload image: ' + (uploadResult.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      setError('Failed to upload image: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Add new space
  const addSpace = () => {
    const newSpace = {
      id: `space-${Date.now()}`,
      name: '',
      type: 'storefront_window',
      baseRate: '',
      currency: spacesData[0]?.currency || 'USD',
      dimensions: { width: '', height: '', unit: 'meters' }
    };
    setSpacesData(prev => [...prev, newSpace]);
  };

  // ✅ Remove space
  const removeSpace = (spaceId) => {
    if (spacesData.length <= 1) return; // Keep at least one space
    setSpacesData(prev => prev.filter(space => space.id !== spaceId));
  };

  // ✅ Update space data
  const updateSpaceData = (spaceId, field, value) => {
    setSpacesData(prev => prev.map(space => 
      space.id === spaceId 
        ? field.includes('.') 
          ? { ...space, [field.split('.')[0]]: { ...space[field.split('.')[0]], [field.split('.')[1]]: value }}
          : { ...space, [field]: value }
        : space
    ));
  };

  // ✅ Step navigation with validation
  const nextStep = () => {
    setError('');
    
    if (currentStep === 1) {
      // Validate property data
      if (!propertyData.title.trim()) {
        setError('Property title is required');
        return;
      }
      if (!propertyData.address.trim()) {
        setError('Property address is required');
        return;
      }
      if (!propertyData.latitude || !propertyData.longitude) {
        setError('Please select a valid address from the dropdown suggestions to get location coordinates');
        return;
      }
      if (!propertyData.city.trim()) {
        setError('City is required - please select from address suggestions');
        return;
      }
      // ZIP code is optional for some countries
      if (!propertyData.primary_image) {
        setError('Property image is required');
        return;
      }
    }
    
    if (currentStep === 2) {
      // Validate spaces data
      const invalidSpace = spacesData.find(space => 
        !space.name.trim() || !space.baseRate || parseFloat(space.baseRate) <= 0
      );
      if (invalidSpace) {
        setError('All spaces must have a name and valid price');
        return;
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // ✅ ENHANCED: Submit listing with better error handling and logging
  const submitListing = async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log('🚀 Creating property and spaces...');
      
      // ✅ ENHANCED: Better payload construction with validation
      const propertyPayload = {
        title: propertyData.title,
        address: propertyData.address,
        city: propertyData.city,
        state: propertyData.state || '',
        country: propertyData.country,
        zipCode: propertyData.zipCode || '', // Optional
        latitude: propertyData.latitude,
        longitude: propertyData.longitude,
        propertyType: propertyData.propertyType,
        primary_image: propertyData.primary_image,
        description: propertyData.description,
        currency: spacesData[0]?.currency || 'USD',
        // Transform spaces for the backend
        spaces: spacesData.map(space => ({
          name: space.name,
          type: space.type,
          baseRate: parseFloat(space.baseRate),
          currency: space.currency,
          rateType: 'DAILY',
          dimensions: {
            width: parseFloat(space.dimensions.width) || 4,
            height: parseFloat(space.dimensions.height) || 2.5,
            unit: space.dimensions.unit,
            area: (parseFloat(space.dimensions.width) || 4) * (parseFloat(space.dimensions.height) || 2.5)
          },
          status: 'active',
          isActive: true,
          // Default material sourcing fields
          surfaceType: 'STOREFRONT_WINDOW',
          accessDifficulty: 1,
          materialCompatibility: ['VINYL_GRAPHICS', 'PERFORATED_VINYL'],
          estimatedMaterialCost: parseFloat(space.baseRate) * 0.3, // 30% of daily rate
          surfaceCondition: 'GOOD',
          weatherExposure: 'MODERATE',
          permitsRequired: false,
          powerAvailable: false,
          lightingConditions: 'MODERATE'
        }))
      };

      console.log('📋 Property payload to send:', JSON.stringify(propertyPayload, null, 2));
      
      // ✅ ENHANCED: Validate payload before sending
      const requiredFields = ['title', 'address', 'city'];
      const missingFields = requiredFields.filter(field => !propertyPayload[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      if (!propertyPayload.latitude || !propertyPayload.longitude) {
        throw new Error('Missing coordinates - please select an address from the suggestions');
      }

      if (!propertyPayload.spaces || propertyPayload.spaces.length === 0) {
        throw new Error('At least one space is required');
      }

      const result = await apiClient.createProperty(propertyPayload);
      
      if (!result.success) {
        console.error('❌ Backend validation failed:', result);
        // ✅ ENHANCED: Show specific validation errors
        if (result.errors) {
          const errorMessages = Object.entries(result.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          throw new Error(`Validation failed:\n${errorMessages}`);
        }
        throw new Error(result.error || result.message || 'Failed to create property');
      }

      console.log('✅ Property and spaces created successfully:', result.data);
      
      // Success! Navigate to dashboard with success message
      navigate('/dashboard?tab=listings&created=true');

    } catch (error) {
      console.error('❌ Submit error:', error);
      
      // ✅ ENHANCED: Better error message handling
      let errorMessage = error.message;
      
      if (error.message.includes('422')) {
        errorMessage = 'Validation failed. Please check all required fields are filled correctly.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Authentication error. Please try signing out and back in.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error. Please try again in a moment.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Helper functions
  const getCurrencySymbol = (currency) => {
    const symbols = { 
      USD: '$', 
      ILS: '₪', 
      EUR: '€', 
      GBP: '£',
      CAD: 'C$',
      AUD: 'A$',
      JPY: '¥',
      CNY: '¥',
      INR: '₹',
      BRL: 'R$',
      MXN: '$'
    };
    return symbols[currency] || '$';
  };

  const spaceTypeOptions = [
    { value: 'storefront_window', label: 'Storefront Window' },
    { value: 'building_exterior', label: 'Building Exterior' },
    { value: 'retail_frontage', label: 'Retail Frontage' },
    { value: 'pole_mount', label: 'Billboard/Sign' }
  ];

  const propertyTypeOptions = [
    { value: 'COMMERCIAL', label: 'Commercial' },
    { value: 'RETAIL', label: 'Retail' },
    { value: 'OFFICE', label: 'Office' },
    { value: 'OTHER', label: 'Other' }
  ];

  return (
    <div 
      className="min-h-screen p-4 sm:p-6"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="max-w-3xl mx-auto">
        {/* ✅ Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            List Your Advertising Space
          </h1>
          <p className="text-slate-600">
            Create a property listing and add your available advertising spaces
          </p>
        </div>

        {/* ✅ Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map(step => (
            <div key={step} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step <= currentStep 
                    ? 'text-white' 
                    : 'bg-slate-200 text-slate-500'
                }`}
                style={step <= currentStep ? { backgroundColor: '#4668AB' } : {}}
              >
                {step < currentStep ? <Check className="w-4 h-4" /> : step}
              </div>
              {step < 3 && (
                <div 
                  className={`h-0.5 w-16 sm:w-24 mx-2 transition-colors ${
                    step < currentStep ? 'bg-blue-500' : 'bg-slate-200'
                  }`}
                  style={step < currentStep ? { backgroundColor: '#4668AB' } : {}}
                />
              )}
            </div>
          ))}
        </div>

        {/* ✅ Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="text-red-700 text-sm">
              <div className="font-medium mb-1">Error:</div>
              <div className="whitespace-pre-line">{error}</div>
            </div>
          </div>
        )}

        {/* ✅ Step Content */}
        <div 
          className="border rounded-xl p-6 sm:p-8 shadow-sm mb-8"
          style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }}
        >
          {/* STEP 1: Property Information */}
          {currentStep === 1 && (
            <div>
              <div className="flex items-center mb-6">
                <Building2 className="w-6 h-6 mr-3" style={{ color: '#4668AB' }} />
                <h2 className="text-xl font-semibold text-slate-900">Property Information</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Property Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Property Name *
                    </label>
                    <input
                      type="text"
                      value={propertyData.title}
                      onChange={(e) => setPropertyData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Downtown Plaza, Main Street Building"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Address with Google Places */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Address *
                    </label>
                    <div className="relative">
                      <input
                        ref={addressInputRef}
                        type="text"
                        value={propertyData.address}
                        onChange={handleAddressChange}
                        placeholder="Start typing address..."
                        className="w-full px-3 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    {!mapsLoaded && (
                      <p className="text-xs text-amber-600 mt-1">
                        Loading address autocomplete...
                      </p>
                    )}
                    {mapsLoaded && (
                      <p className="text-xs text-slate-500 mt-1">
                        Start typing and select from suggestions for complete address
                      </p>
                    )}
                    {/* ✅ ENHANCED: Show extracted location data */}
                    {(propertyData.city || propertyData.zipCode) && (
                      <div className="text-xs text-green-600 mt-1 flex items-center gap-2">
                        <Check className="w-3 h-3" />
                        <span>
                          {propertyData.city && `City: ${propertyData.city}`}
                          {propertyData.city && propertyData.state && ` • State: ${propertyData.state}`}
                          {propertyData.zipCode && ` • ZIP: ${propertyData.zipCode}`}
                        </span>
                      </div>
                    )}
                    {/* Show coordinates for debugging */}
                    {propertyData.latitude && propertyData.longitude && (
                      <div className="text-xs text-slate-400 mt-1">
                        📍 Coordinates: {propertyData.latitude.toFixed(6)}, {propertyData.longitude.toFixed(6)}
                      </div>
                    )}
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Property Type
                    </label>
                    <select
                      value={propertyData.propertyType}
                      onChange={(e) => setPropertyData(prev => ({ ...prev, propertyType: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {propertyTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right Column - Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Property Photo *
                  </label>
                  <div 
                    className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('image-upload').click()}
                  >
                    {propertyData.primary_image ? (
                      <div className="relative">
                        <img 
                          src={propertyData.primary_image} 
                          alt="Property" 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">
                          Click to upload property photo
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Space Details */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 mr-3" style={{ color: '#4668AB' }} />
                  <h2 className="text-xl font-semibold text-slate-900">Advertising Spaces</h2>
                </div>
                <button
                  onClick={addSpace}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#4668AB' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Space
                </button>
              </div>

              <div className="space-y-4">
                {spacesData.map((space, index) => (
                  <div 
                    key={space.id}
                    className="border rounded-lg p-4"
                    style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-slate-900">
                        Space {index + 1}
                      </h3>
                      {spacesData.length > 1 && (
                        <button
                          onClick={() => removeSpace(space.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Space Name */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Space Name *
                        </label>
                        <input
                          type="text"
                          value={space.name}
                          onChange={(e) => updateSpaceData(space.id, 'name', e.target.value)}
                          placeholder="e.g. Front Window, Billboard"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Space Type */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Space Type
                        </label>
                        <select
                          value={space.type}
                          onChange={(e) => updateSpaceData(space.id, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {spaceTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Daily Rate */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Daily Rate *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={space.baseRate}
                            onChange={(e) => updateSpaceData(space.id, 'baseRate', e.target.value)}
                            placeholder="0"
                            min="0"
                            step="1"
                            className="w-full px-3 py-2 pl-8 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <span className="absolute left-3 top-2 text-slate-500">
                            {getCurrencySymbol(space.currency)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Currency auto-detected: {space.currency}
                        </p>
                      </div>

                      {/* Dimensions */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Dimensions (optional)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={space.dimensions.width}
                            onChange={(e) => updateSpaceData(space.id, 'dimensions.width', e.target.value)}
                            placeholder="Width"
                            min="0"
                            step="0.1"
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <span className="px-2 py-2 text-slate-500">×</span>
                          <input
                            type="number"
                            value={space.dimensions.height}
                            onChange={(e) => updateSpaceData(space.id, 'dimensions.height', e.target.value)}
                            placeholder="Height"
                            min="0"
                            step="0.1"
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <span className="px-2 py-2 text-slate-500 text-sm">m</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Preview & Submit */}
          {currentStep === 3 && (
            <div>
              <div className="flex items-center mb-6">
                <Check className="w-6 h-6 mr-3" style={{ color: '#4668AB' }} />
                <h2 className="text-xl font-semibold text-slate-900">Review & Submit</h2>
              </div>

              {/* Property Preview */}
              <div className="border rounded-lg p-4 mb-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
                <h3 className="font-semibold text-slate-900 mb-3">Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Name</p>
                    <p className="font-medium">{propertyData.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Type</p>
                    <p className="font-medium">{propertyTypeOptions.find(t => t.value === propertyData.propertyType)?.label}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-slate-600">Address</p>
                    <p className="font-medium">{propertyData.address}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {propertyData.city}
                      {propertyData.state && `, ${propertyData.state}`}
                      {propertyData.zipCode && ` ${propertyData.zipCode}`}
                      {propertyData.country && `, ${propertyData.country}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Spaces Preview */}
              <div className="border rounded-lg p-4 mb-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
                <h3 className="font-semibold text-slate-900 mb-3">
                  Advertising Spaces ({spacesData.length})
                </h3>
                <div className="space-y-3">
                  {spacesData.map((space, index) => (
                    <div key={space.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
                      <div>
                        <p className="font-medium">{space.name}</p>
                        <p className="text-sm text-slate-600">
                          {spaceTypeOptions.find(t => t.value === space.type)?.label}
                          {space.dimensions.width && space.dimensions.height && 
                            ` • ${space.dimensions.width}×${space.dimensions.height}m`
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold" style={{ color: '#4668AB' }}>
                          {getCurrencySymbol(space.currency)}{space.baseRate}/day
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submission Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your listing will be live immediately and available for bookings. 
                  You can manage and edit your listings from the dashboard.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ✅ Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="inline-flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>

          {currentStep < 3 ? (
            <button
              onClick={nextStep}
              className="inline-flex items-center px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#4668AB' }}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={submitListing}
              disabled={isLoading}
              className="inline-flex items-center px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#4668AB' }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  Submit Listing
                  <Check className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}