// src/pages/dashboard/owner/components/create-listing/CreateListingWizard.jsx
// ✅ UPDATED: Removed product selection, added space photo upload
// ✅ SIMPLIFIED: Space creation with photo, name, type, dimensions, and rate period selector

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { 
  ArrowLeft, ArrowRight, Plus, X, Upload, MapPin, 
  Building2, Camera, Check, AlertCircle, Loader2,
  Info, DollarSign, Maximize2, ChevronLeft,
  Edit2, Save, Trash2, Calendar, Clock
} from 'lucide-react';

import apiClient from '../../../../../api/apiClient.js';
import googleMapsLoader from '../../../../../services/googleMapsLoader.js';

// Custom styles for Google Autocomplete - more compact
const GOOGLE_AUTOCOMPLETE_STYLES = `
  .pac-container {
    z-index: 10000 !important;
    font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    border-radius: 6px;
    margin-top: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #E5E7EB;
  }
  
  .pac-item {
    padding: 10px 12px !important;
    font-size: 13px;
    line-height: 1.4;
    cursor: pointer;
    border-bottom: 1px solid #F3F4F6;
  }
  
  .pac-item:last-child {
    border-bottom: none;
  }
  
  .pac-item:hover {
    background-color: #F9FAFB;
  }
  
  .pac-item-selected {
    background-color: #EFF6FF !important;
  }
  
  .pac-icon {
    width: 16px;
    height: 16px;
    margin-right: 10px;
    margin-top: 2px;
    background-size: contain;
  }
  
  .pac-item-query {
    font-weight: 500;
    color: #111827;
  }
  
  .pac-matched {
    font-weight: 600;
    color: #4668AB;
  }
`;

export default function CreateListingWizard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingSpaceImage, setUploadingSpaceImage] = useState({});
  const [error, setError] = useState('');
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState('');
  const [isLoadingMaps, setIsLoadingMaps] = useState(true);

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
    description: 'High-visibility advertising space in prime location.'
  });

  // Spaces data - updated structure without products, with image and ratePeriod
  const [spacesData, setSpacesData] = useState([{
    id: 'space-1',
    name: '',
    type: 'storefront_window',
    baseRate: '',
    ratePeriod: 'DAILY', // DAILY, WEEKLY, MONTHLY
    currency: 'USD',
    dimensions: { width: '', height: '', unit: 'meters' },
    image: null,
    isEditing: true
  }]);

  // Google Places refs
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const stylesInjectedRef = useRef(false);

  // Step configuration
  const steps = [
    { id: 1, label: 'Property', icon: Building2 },
    { id: 2, label: 'Spaces', icon: Maximize2 },
    { id: 3, label: 'Review', icon: Check }
  ];

  // Inject custom styles
  useEffect(() => {
    if (!stylesInjectedRef.current) {
      const styleElement = document.createElement('style');
      styleElement.innerHTML = GOOGLE_AUTOCOMPLETE_STYLES;
      document.head.appendChild(styleElement);
      stylesInjectedRef.current = true;
      
      return () => {
        if (styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement);
        }
      };
    }
  }, []);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const initAutocomplete = async () => {
      try {
        setIsLoadingMaps(true);
        setMapsError('');
        
        const maps = await googleMapsLoader.waitForLoad();
        
        if (!mounted) return;

        if (!window.google?.maps?.places) {
          throw new Error('Google Places library not loaded');
        }
        
        setMapsLoaded(true);
        setIsLoadingMaps(false);
        
        if (addressInputRef.current && !autocompleteRef.current) {
          initializeAutocompleteInstance();
        }

      } catch (error) {
        console.error('❌ Error loading Google Maps:', error);
        
        if (!mounted) return;
        
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(() => initAutocomplete(), 2000);
        } else {
          setMapsError('Failed to load address autocomplete. Please refresh the page.');
          setIsLoadingMaps(false);
        }
      }
    };

    const initializeAutocompleteInstance = () => {
      if (!addressInputRef.current || autocompleteRef.current) {
        return;
      }

      try {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          addressInputRef.current,
          {
            types: ['address'],
            fields: ['formatted_address', 'address_components', 'geometry', 'name', 'place_id', 'types']
          }
        );

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const circle = new window.google.maps.Circle({
              center: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              },
              radius: 50000
            });
            autocompleteRef.current.setBounds(circle.getBounds());
          });
        }

        autocompleteRef.current.addListener('place_changed', handlePlaceSelect);

      } catch (error) {
        console.error('❌ Error creating autocomplete:', error);
        setMapsError('Failed to initialize address search');
      }
    };

    initAutocomplete();

    return () => {
      mounted = false;
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, []);

  // Re-initialize autocomplete when input becomes available
  useEffect(() => {
    if (mapsLoaded && addressInputRef.current && !autocompleteRef.current) {
      try {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          addressInputRef.current,
          {
            types: ['address'],
            fields: ['formatted_address', 'address_components', 'geometry', 'name', 'place_id']
          }
        );
        autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
      } catch (error) {
        console.error('❌ Error re-initializing:', error);
      }
    }
  }, [mapsLoaded, currentStep]);

  // Currency detection
  const detectCurrency = (countryCode) => {
    const currencyMap = {
      'US': 'USD', 'IL': 'ILS', 'GB': 'GBP', 'CA': 'CAD',
      'AU': 'AUD', 'JP': 'JPY', 'CN': 'CNY', 'IN': 'INR',
      'BR': 'BRL', 'MX': 'MXN', 'KR': 'KRW', 'SG': 'SGD',
      'DE': 'EUR', 'FR': 'EUR', 'ES': 'EUR', 'IT': 'EUR', 'NL': 'EUR'
    };
    return currencyMap[countryCode] || 'USD';
  };

  // Handle place selection
  const handlePlaceSelect = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    
    if (!place || !place.geometry) {
      setError('Please select a valid address from the dropdown suggestions');
      return;
    }

    const addressComponents = place.address_components || [];
    let streetNumber = '';
    let route = '';
    let city = '';
    let state = '';
    let country = '';
    let countryCode = '';
    let zipCode = '';

    addressComponents.forEach(component => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      } else if (types.includes('route')) {
        route = component.long_name;
      } else if (types.includes('locality')) {
        city = component.long_name;
      } else if (!city && types.includes('sublocality_level_1')) {
        city = component.long_name;
      } else if (!city && types.includes('administrative_area_level_2')) {
        city = component.long_name;
      } else if (!city && types.includes('postal_town')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name || component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
        countryCode = component.short_name;
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name;
      }
    });

    const streetAddress = streetNumber && route 
      ? `${streetNumber} ${route}`
      : route || place.name || '';

    const finalAddress = streetAddress || place.formatted_address || '';
    const currency = detectCurrency(countryCode);

    setPropertyData(prev => ({
      ...prev,
      address: finalAddress,
      city: city || prev.city,
      state: state || prev.state,
      country: countryCode || prev.country,
      zipCode: zipCode || prev.zipCode,
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng()
    }));

    setSpacesData(prev => prev.map(space => ({
      ...space,
      currency: currency
    })));

    setError('');
  };

  // Handle manual address changes
  const handleAddressChange = (e) => {
    setPropertyData(prev => ({ ...prev, address: e.target.value }));
    
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

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const uploadResult = await apiClient.uploadFile(file, 'property_image');
      
      if (uploadResult.success) {
        setPropertyData(prev => ({
          ...prev,
          primary_image: uploadResult.data.url
        }));
      } else {
        throw new Error(uploadResult.error || 'Upload failed');
      }
    } catch (error) {
      setError('Failed to upload image: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle space image upload
  const handleSpaceImageUpload = async (event, spaceId) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setUploadingSpaceImage(prev => ({ ...prev, [spaceId]: true }));
    setError('');

    try {
      const uploadResult = await apiClient.uploadFile(file, 'space_image');
      
      if (uploadResult.success) {
        setSpacesData(prev => prev.map(space => 
          space.id === spaceId 
            ? { ...space, image: uploadResult.data.url }
            : space
        ));
      } else {
        throw new Error(uploadResult.error || 'Upload failed');
      }
    } catch (error) {
      setError('Failed to upload image: ' + error.message);
    } finally {
      setUploadingSpaceImage(prev => ({ ...prev, [spaceId]: false }));
    }
  };

  // Space management
  const addSpace = () => {
    const newSpace = {
      id: `space-${Date.now()}`,
      name: '',
      type: 'storefront_window',
      baseRate: '',
      ratePeriod: 'DAILY',
      currency: spacesData[0]?.currency || 'USD',
      dimensions: { width: '', height: '', unit: 'meters' },
      image: null,
      isEditing: true
    };
    setSpacesData(prev => [...prev, newSpace]);
  };

  const removeSpace = (spaceId) => {
    if (spacesData.length <= 1) {
      setError('You must have at least one space');
      return;
    }
    setSpacesData(prev => prev.filter(space => space.id !== spaceId));
  };

  const updateSpaceData = (spaceId, field, value) => {
    setSpacesData(prev => prev.map(space => 
      space.id === spaceId 
        ? field.includes('.') 
          ? { ...space, [field.split('.')[0]]: { ...space[field.split('.')[0]], [field.split('.')[1]]: value }}
          : { ...space, [field]: value }
        : space
    ));
  };

  const validateSpace = (space) => {
    if (!space.name.trim()) return 'Space name is required';
    if (!space.baseRate || parseFloat(space.baseRate) <= 0) return 'Valid rate is required';
    if (!space.dimensions.width || !space.dimensions.height) return 'Dimensions are required';
    if (!space.image) return 'Space photo is required';
    return null;
  };

  const saveSpace = (spaceId) => {
    const space = spacesData.find(s => s.id === spaceId);
    const validationError = validateSpace(space);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setSpacesData(prev => prev.map(s => 
      s.id === spaceId ? { ...s, isEditing: false } : s
    ));
    setError('');
  };

  const editSpace = (spaceId) => {
    setSpacesData(prev => prev.map(s => 
      s.id === spaceId ? { ...s, isEditing: true } : s
    ));
  };

  // Navigation
  const nextStep = () => {
    setError('');
    
    if (currentStep === 1) {
      if (!propertyData.title.trim()) {
        setError('Property title is required');
        return;
      }
      if (!propertyData.address.trim()) {
        setError('Property address is required');
        return;
      }
      if (!propertyData.latitude || !propertyData.longitude) {
        setError('Please select a valid address from the dropdown');
        return;
      }
      if (!propertyData.primary_image) {
        setError('Property image is required');
        return;
      }
    }
    
    if (currentStep === 2) {
      // Check if all spaces are saved
      const unsavedSpace = spacesData.find(space => space.isEditing);
      if (unsavedSpace) {
        setError('Please save all spaces before proceeding');
        return;
      }
      
      // Validate all spaces
      for (const space of spacesData) {
        const validationError = validateSpace(space);
        if (validationError) {
          setError(`${space.name || 'Unnamed space'}: ${validationError}`);
          return;
        }
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Submit listing
  const submitListing = async () => {
    setIsLoading(true);
    setError('');

    try {
      const propertyPayload = {
        title: propertyData.title,
        address: propertyData.address,
        city: propertyData.city,
        state: propertyData.state || '',
        country: propertyData.country,
        zipCode: propertyData.zipCode || '',
        latitude: propertyData.latitude,
        longitude: propertyData.longitude,
        propertyType: propertyData.propertyType,
        primary_image: propertyData.primary_image,
        description: propertyData.description,
        currency: spacesData[0]?.currency || 'USD',
        spaces: spacesData.map(space => ({
          name: space.name,
          type: space.type,
          baseRate: parseFloat(space.baseRate),
          currency: space.currency,
          rateType: space.ratePeriod,
          image: space.image,
          dimensions: {
            width: parseFloat(space.dimensions.width) || 4,
            height: parseFloat(space.dimensions.height) || 2.5,
            unit: space.dimensions.unit,
            area: (parseFloat(space.dimensions.width) || 4) * (parseFloat(space.dimensions.height) || 2.5)
          },
          status: 'active',
          isActive: true,
          surfaceType: space.type.toUpperCase(),
          accessDifficulty: 1,
          estimatedMaterialCost: parseFloat(space.baseRate) * 0.3,
          surfaceCondition: 'GOOD',
          weatherExposure: 'MODERATE',
          permitsRequired: false,
          powerAvailable: false,
          lightingConditions: 'MODERATE'
        }))
      };
      
      const result = await apiClient.createProperty(propertyPayload);
      
      if (!result.success) {
        throw new Error(result.error || result.message || 'Failed to create property');
      }

      navigate('/dashboard?tab=listings&created=true');

    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helpers
  const getCurrencySymbol = (currency) => {
    const symbols = { 
      USD: '$', ILS: '₪', EUR: '€', GBP: '£',
      CAD: 'C$', AUD: 'A$', JPY: '¥', CNY: '¥',
      INR: '₹', BRL: 'R$', MXN: '$'
    };
    return symbols[currency] || '$';
  };

  const getRatePeriodLabel = (period) => {
    const labels = {
      DAILY: 'per day',
      WEEKLY: 'per week',
      MONTHLY: 'per month'
    };
    return labels[period] || 'per day';
  };

  const getRatePeriodShortLabel = (period) => {
    const labels = {
      DAILY: '/day',
      WEEKLY: '/week',
      MONTHLY: '/month'
    };
    return labels[period] || '/day';
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

  const ratePeriodOptions = [
    { value: 'DAILY', label: 'Day', icon: Calendar },
    { value: 'WEEKLY', label: 'Week', icon: Calendar },
    { value: 'MONTHLY', label: 'Month', icon: Clock }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFF' }}>
      {/* Compact Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors mb-3 text-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                List Your Space
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Add your property and available advertising spaces
              </p>
            </div>
            
            {/* Desktop Step Counter */}
            <div className="hidden sm:flex items-center text-sm text-slate-600">
              Step {currentStep} of {steps.length}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div 
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all
                        ${isActive ? 'bg-[#4668AB] text-white shadow-sm' : 
                          isCompleted ? 'bg-[#4668AB] text-white' : 
                          'bg-slate-100 text-slate-400'}
                      `}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className={`ml-2 text-sm font-medium hidden sm:block ${
                      isActive ? 'text-[#4668AB]' : 
                      isCompleted ? 'text-slate-700' : 
                      'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-3">
                      <div className="h-0.5 bg-slate-200 rounded">
                        <div 
                          className="h-full bg-[#4668AB] rounded transition-all duration-300"
                          style={{ width: isCompleted ? '100%' : '0%' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Error Display */}
        {(error || mapsError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start text-sm">
            <AlertCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-red-700">{error || mapsError}</div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="p-6">
            {/* STEP 1: Property Information */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Property Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Property Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={propertyData.title}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Downtown Plaza"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-[#4668AB] focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          ref={addressInputRef}
                          type="text"
                          value={propertyData.address}
                          onChange={handleAddressChange}
                          placeholder="Start typing to search..."
                          disabled={isLoadingMaps}
                          className="w-full px-3 py-2 pl-9 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-[#4668AB] focus:border-transparent transition-all disabled:bg-slate-50"
                        />
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        {isLoadingMaps && (
                          <Loader2 className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 animate-spin" />
                        )}
                      </div>
                      {isLoadingMaps ? (
                        <p className="text-xs text-amber-600 mt-1">Loading autocomplete...</p>
                      ) : mapsLoaded && !mapsError && (
                        <p className="text-xs text-slate-500 mt-1">Select from dropdown for accurate location</p>
                      )}
                    </div>

                    {/* Property Type */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Property Type
                      </label>
                      <select
                        value={propertyData.propertyType}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, propertyType: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-[#4668AB] focus:border-transparent transition-all"
                      >
                        {propertyTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Right Column - Image */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Property Photo <span className="text-red-500">*</span>
                    </label>
                    <div 
                      className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-[#4668AB] transition-colors cursor-pointer group"
                      onClick={() => !isLoading && document.getElementById('image-upload').click()}
                    >
                      {propertyData.primary_image ? (
                        <div className="relative">
                          <img 
                            src={propertyData.primary_image} 
                            alt="Property" 
                            className="w-full h-40 object-cover rounded-md"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="text-white text-sm font-medium">
                              Click to change
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-4">
                          {isLoading ? (
                            <Loader2 className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:text-[#4668AB] transition-colors" />
                              <p className="text-sm text-slate-600">
                                Drop image here or click to browse
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                PNG, JPG up to 5MB
                              </p>
                            </>
                          )}
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
              <div className="space-y-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#4668AB] to-[#39558C] rounded-xl flex items-center justify-center text-white mr-3 shadow-lg">
                      <Maximize2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">
                        Advertising Spaces
                      </h3>
                      <p className="text-xs text-slate-600">
                        {spacesData.filter(s => !s.isEditing).length} saved, {spacesData.filter(s => s.isEditing).length} editing
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={addSpace}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#4668AB] to-[#39558C] rounded-lg hover:from-[#39558C] hover:to-[#2c4470] transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Space
                  </button>
                </div>

                <div className="space-y-4">
                  {spacesData.map((space, index) => (
                    <div 
                      key={space.id}
                      className={`border rounded-xl transition-all duration-200 ${
                        space.isEditing 
                          ? 'border-[#4668AB] shadow-xl bg-white' 
                          : 'border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-md hover:shadow-lg'
                      }`}
                      style={{
                        boxShadow: space.isEditing 
                          ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                          : ''
                      }}
                    >
                      {space.isEditing ? (
                        /* Editing Mode */
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-[#4668AB] to-[#39558C] rounded-lg flex items-center justify-center text-white font-semibold text-sm mr-3 shadow-md">
                                {index + 1}
                              </div>
                              <span className="text-sm font-semibold text-slate-800">
                                Space {index + 1} - Editing
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveSpace(space.id)}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-green-600 to-green-500 rounded-lg hover:from-green-700 hover:to-green-600 transition-all shadow-md hover:shadow-lg"
                              >
                                <Save className="w-3.5 h-3.5 mr-1" />
                                Save
                              </button>
                              {spacesData.length > 1 && (
                                <button
                                  onClick={() => removeSpace(space.id)}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-red-600 to-red-500 rounded-lg hover:from-red-700 hover:to-red-600 transition-all shadow-md hover:shadow-lg"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Space Form Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Left Column */}
                            <div className="space-y-4">
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                  Space Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={space.name}
                                  onChange={(e) => updateSpaceData(space.id, 'name', e.target.value)}
                                  placeholder="e.g., Front Window"
                                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#4668AB] focus:border-transparent transition-all shadow-sm"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                  Space Type
                                </label>
                                <select
                                  value={space.type}
                                  onChange={(e) => updateSpaceData(space.id, 'type', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#4668AB] focus:border-transparent transition-all shadow-sm"
                                >
                                  {spaceTypeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                  Dimensions <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <input
                                      type="number"
                                      value={space.dimensions.width}
                                      onChange={(e) => updateSpaceData(space.id, 'dimensions.width', e.target.value)}
                                      placeholder="Width"
                                      min="0"
                                      step="0.1"
                                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#4668AB] focus:border-transparent transition-all shadow-sm"
                                    />
                                  </div>
                                  <span className="text-slate-400 text-lg font-light self-center">×</span>
                                  <div className="relative flex-1">
                                    <input
                                      type="number"
                                      value={space.dimensions.height}
                                      onChange={(e) => updateSpaceData(space.id, 'dimensions.height', e.target.value)}
                                      placeholder="Height"
                                      min="0"
                                      step="0.1"
                                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#4668AB] focus:border-transparent transition-all shadow-sm"
                                    />
                                  </div>
                                  <span className="text-slate-500 text-sm font-medium self-center">m</span>
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                  Desired Rate <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <input
                                      type="number"
                                      value={space.baseRate}
                                      onChange={(e) => updateSpaceData(space.id, 'baseRate', e.target.value)}
                                      placeholder="0"
                                      min="0"
                                      step="1"
                                      className="w-full px-3 py-2 pl-8 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#4668AB] focus:border-transparent transition-all shadow-sm"
                                    />
                                    <span className="absolute left-3 top-2 text-sm font-semibold text-slate-500">
                                      {getCurrencySymbol(space.currency)}
                                    </span>
                                  </div>
                                  <div className="flex rounded-lg border border-slate-300 overflow-hidden">
                                    {ratePeriodOptions.map((option) => (
                                      <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => updateSpaceData(space.id, 'ratePeriod', option.value)}
                                        className={`px-3 py-2 text-xs font-medium transition-all ${
                                          space.ratePeriod === option.value
                                            ? 'bg-[#4668AB] text-white'
                                            : 'bg-white text-slate-600 hover:bg-slate-50'
                                        }`}
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right Column - Space Image */}
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Space Photo <span className="text-red-500">*</span>
                              </label>
                              <div 
                                className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-[#4668AB] transition-colors cursor-pointer group h-[calc(100%-24px)]"
                                onClick={() => !uploadingSpaceImage[space.id] && document.getElementById(`space-image-${space.id}`).click()}
                              >
                                {space.image ? (
                                  <div className="relative h-full">
                                    <img 
                                      src={space.image} 
                                      alt="Space" 
                                      className="w-full h-full object-cover rounded-md"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="text-white text-sm font-medium">
                                        Click to change
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="py-8">
                                    {uploadingSpaceImage[space.id] ? (
                                      <Loader2 className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-spin" />
                                    ) : (
                                      <>
                                        <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:text-[#4668AB] transition-colors" />
                                        <p className="text-sm text-slate-600">
                                          Drop image here or click to browse
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                          PNG, JPG up to 5MB
                                        </p>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                              <input
                                id={`space-image-${space.id}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSpaceImageUpload(e, space.id)}
                                className="hidden"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Saved/View Mode */
                        <div className="p-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1">
                              <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm mr-3 shadow-md">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">
                                  {space.name}
                                </p>
                                <p className="text-xs text-slate-600">
                                  {spaceTypeOptions.find(t => t.value === space.type)?.label}
                                  {space.dimensions.width && space.dimensions.height && 
                                    ` • ${space.dimensions.width}×${space.dimensions.height}m`
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {space.image && (
                                <img 
                                  src={space.image} 
                                  alt={space.name}
                                  className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                                />
                              )}
                              <div className="text-right">
                                <p className="text-xs text-slate-500">{getRatePeriodLabel(space.ratePeriod)}</p>
                                <p className="text-lg font-bold text-[#4668AB]">
                                  {getCurrencySymbol(space.currency)}{space.baseRate}
                                </p>
                              </div>
                              <button
                                onClick={() => editSpace(space.id)}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm hover:shadow-md"
                              >
                                <Edit2 className="w-3.5 h-3.5 mr-1" />
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {/* Property Summary */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Property Details</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-600">Name:</span>
                      <p className="font-medium text-slate-900">{propertyData.title}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Type:</span>
                      <p className="font-medium text-slate-900">
                        {propertyTypeOptions.find(t => t.value === propertyData.propertyType)?.label}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-600">Address:</span>
                      <p className="font-medium text-slate-900">{propertyData.address}</p>
                      {propertyData.city && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {propertyData.city}
                          {propertyData.state && `, ${propertyData.state}`}
                          {propertyData.zipCode && ` ${propertyData.zipCode}`}
                        </p>
                      )}
                    </div>
                  </div>
                  {propertyData.primary_image && (
                    <img 
                      src={propertyData.primary_image} 
                      alt="Property"
                      className="w-full h-32 object-cover rounded-lg mt-3"
                    />
                  )}
                </div>

                {/* Spaces Summary */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    {spacesData.length} Space{spacesData.length !== 1 ? 's' : ''}
                  </h3>
                  <div className="space-y-3">
                    {spacesData.map((space) => (
                      <div key={space.id} className="flex items-start gap-3 py-2 border-b border-slate-200 last:border-0">
                        {space.image && (
                          <img 
                            src={space.image} 
                            alt={space.name}
                            className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{space.name}</p>
                          <p className="text-xs text-slate-600">
                            {spaceTypeOptions.find(t => t.value === space.type)?.label}
                            {space.dimensions.width && space.dimensions.height && 
                              ` • ${space.dimensions.width}×${space.dimensions.height}m`
                            }
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-[#4668AB] ml-4">
                          {getCurrencySymbol(space.currency)}{space.baseRate}
                          {getRatePeriodShortLabel(space.ratePeriod)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-xs text-blue-800">
                      Your listing will be live immediately after submission and available for bookings.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-lg">
            <div className="flex justify-between items-center">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Previous
              </button>

              <div className="flex items-center gap-3">
                {/* Mobile Step Indicator */}
                <span className="text-xs text-slate-500 sm:hidden">
                  Step {currentStep}/{steps.length}
                </span>

                {currentStep < 3 ? (
                  <button
                    onClick={nextStep}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#4668AB] rounded-md hover:bg-[#39558C] transition-colors"
                  >
                    Next
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </button>
                ) : (
                  <button
                    onClick={submitListing}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#4668AB] rounded-md hover:bg-[#39558C] transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        Submit Listing
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}