// src/pages/dashboard/owner/components/create-listing/CreateListingWizard.jsx
// ✅ ENHANCED: Now supports both CREATE and EDIT modes
// ✅ EDIT MODE: Pre-populates forms with existing space data
// ✅ CHANGE DETECTION: Highlights modified fields and shows diff in review
// ✅ FIXED: Changed ratePeriod to rateType to match Prisma schema

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { 
 ArrowLeft, ArrowRight, Plus, X, Upload, MapPin, 
 Building2, Camera, Check, AlertCircle, Loader2,
 Info, DollarSign, Maximize2, ChevronLeft,
 Edit2, Save, Trash2, Calendar, Clock, Ruler, RefreshCw
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
 const { spaceId } = useParams(); // Get spaceId from URL for edit mode
 const isEditMode = Boolean(spaceId);
 
 const [currentStep, setCurrentStep] = useState(1);
 const [isLoading, setIsLoading] = useState(false);
 const [isLoadingExisting, setIsLoadingExisting] = useState(isEditMode);
 const [uploadingSpaceImage, setUploadingSpaceImage] = useState({});
 const [error, setError] = useState('');
 const [mapsLoaded, setMapsLoaded] = useState(false);
 const [mapsError, setMapsError] = useState('');
 const [isLoadingMaps, setIsLoadingMaps] = useState(true);
 const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
 const [originalData, setOriginalData] = useState(null); // Store original data for change detection

 // Property data
 const [propertyData, setPropertyData] = useState({
 id: null, // Add ID for edit mode
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

 // Spaces data - updated with predefined size structure and fixed rateType
 const [spacesData, setSpacesData] = useState([{
 id: isEditMode ? spaceId : 'space-1',
 name: '',
 type: 'storefront_window',
 baseRate: '',
 rateType: 'DAILY', // ✅ FIXED: Changed from ratePeriod to rateType
 currency: 'USD',
 sizeCategory: 'MEDIUM',
 image: null,
 isEditing: true
 }]);

 // Google Places refs
 const addressInputRef = useRef(null);
 const autocompleteRef = useRef(null);
 const stylesInjectedRef = useRef(false);

 // Step configuration
 const steps = [
 { id: 1, label: isEditMode ? 'Property' : 'Property', icon: Building2 },
 { id: 2, label: isEditMode ? 'Edit Space' : 'Spaces', icon: Maximize2 },
 { id: 3, label: isEditMode ? 'Review Changes' : 'Review', icon: Check }
 ];

 // Unit preference state
 const [unitPreference, setUnitPreference] = useState('feet');

 // ✅ PREDEFINED SIZE CONFIGURATIONS with dual unit support
 const spaceSizeOptions = {
 'storefront_window': {
 SMALL: { 
 width: { feet: 4, meters: 1.2 }, 
 height: { feet: 2.5, meters: 0.8 }, 
 label: 'Small Window', 
 description: { feet: '~4\' × 2.5\'', meters: '~1.2m × 0.8m' },
 area: { feet: '10 sq ft', meters: '1.0m²' }, 
 priceMultiplier: 1.0 
 },
 MEDIUM: { 
 width: { feet: 6.5, meters: 2.0 }, 
 height: { feet: 5, meters: 1.5 }, 
 label: 'Standard Window', 
 description: { feet: '~6.5\' × 5\'', meters: '~2.0m × 1.5m' },
 area: { feet: '32 sq ft', meters: '3.0m²' }, 
 priceMultiplier: 1.4 
 },
 LARGE: { 
 width: { feet: 10, meters: 3.0 }, 
 height: { feet: 6.5, meters: 2.0 }, 
 label: 'Large Display', 
 description: { feet: '~10\' × 6.5\'', meters: '~3.0m × 2.0m' },
 area: { feet: '65 sq ft', meters: '6.0m²' }, 
 priceMultiplier: 2.0 
 }
 },
 'building_exterior': {
 SMALL: { 
 width: { feet: 6.5, meters: 2.0 }, 
 height: { feet: 5, meters: 1.5 }, 
 label: 'Small Wall', 
 description: { feet: '~6.5\' × 5\'', meters: '~2.0m × 1.5m' },
 area: { feet: '32 sq ft', meters: '3.0m²' }, 
 priceMultiplier: 1.0 
 },
 MEDIUM: { 
 width: { feet: 13, meters: 4.0 }, 
 height: { feet: 10, meters: 3.0 }, 
 label: 'Wall Display', 
 description: { feet: '~13\' × 10\'', meters: '~4.0m × 3.0m' },
 area: { feet: '130 sq ft', meters: '12.0m²' }, 
 priceMultiplier: 1.4 
 },
 LARGE: { 
 width: { feet: 20, meters: 6.0 }, 
 height: { feet: 13, meters: 4.0 }, 
 label: 'Large Mural', 
 description: { feet: '~20\' × 13\'', meters: '~6.0m × 4.0m' },
 area: { feet: '260 sq ft', meters: '24.0m²' }, 
 priceMultiplier: 2.0 
 }
 },
 'retail_frontage': {
 SMALL: { 
 width: { feet: 10, meters: 3.0 }, 
 height: { feet: 3, meters: 1.0 }, 
 label: 'Small Frontage', 
 description: { feet: '~10\' × 3\'', meters: '~3.0m × 1.0m' },
 area: { feet: '30 sq ft', meters: '3.0m²' }, 
 priceMultiplier: 1.0 
 },
 MEDIUM: { 
 width: { feet: 16, meters: 5.0 }, 
 height: { feet: 5, meters: 1.5 }, 
 label: 'Standard Frontage', 
 description: { feet: '~16\' × 5\'', meters: '~5.0m × 1.5m' },
 area: { feet: '80 sq ft', meters: '7.5m²' }, 
 priceMultiplier: 1.4 
 },
 LARGE: { 
 width: { feet: 26, meters: 8.0 }, 
 height: { feet: 6.5, meters: 2.0 }, 
 label: 'Wide Frontage', 
 description: { feet: '~26\' × 6.5\'', meters: '~8.0m × 2.0m' },
 area: { feet: '170 sq ft', meters: '16.0m²' }, 
 priceMultiplier: 2.0 
 }
 },
 'event_space': {
 SMALL: { 
 width: { feet: 6.5, meters: 2.0 }, 
 height: { feet: 6.5, meters: 2.0 }, 
 label: 'Small Display', 
 description: { feet: '~6.5\' × 6.5\'', meters: '~2.0m × 2.0m' },
 area: { feet: '42 sq ft', meters: '4.0m²' }, 
 priceMultiplier: 1.0 
 },
 MEDIUM: { 
 width: { feet: 10, meters: 3.0 }, 
 height: { feet: 8, meters: 2.5 }, 
 label: 'Standard Display', 
 description: { feet: '~10\' × 8\'', meters: '~3.0m × 2.5m' },
 area: { feet: '80 sq ft', meters: '7.5m²' }, 
 priceMultiplier: 1.4 
 },
 LARGE: { 
 width: { feet: 13, meters: 4.0 }, 
 height: { feet: 10, meters: 3.0 }, 
 label: 'Large Display', 
 description: { feet: '~13\' × 10\'', meters: '~4.0m × 3.0m' },
 area: { feet: '130 sq ft', meters: '12.0m²' }, 
 priceMultiplier: 2.0 
 }
 },
 'billboard': {
 SMALL: { 
 width: { feet: 20, meters: 6.0 }, 
 height: { feet: 10, meters: 3.0 }, 
 label: 'Small Billboard', 
 description: { feet: '~20\' × 10\'', meters: '~6.0m × 3.0m' },
 area: { feet: '200 sq ft', meters: '18.0m²' }, 
 priceMultiplier: 1.0 
 },
 MEDIUM: { 
 width: { feet: 40, meters: 12.0 }, 
 height: { feet: 20, meters: 6.0 }, 
 label: 'Standard Billboard', 
 description: { feet: '~40\' × 20\'', meters: '~12.0m × 6.0m' },
 area: { feet: '800 sq ft', meters: '72.0m²' }, 
 priceMultiplier: 1.4 
 },
 LARGE: { 
 width: { feet: 46, meters: 14.0 }, 
 height: { feet: 33, meters: 10.0 }, 
 label: 'Large Billboard', 
 description: { feet: '~46\' × 33\'', meters: '~14.0m × 10.0m' },
 area: { feet: '1520 sq ft', meters: '140.0m²' }, 
 priceMultiplier: 2.0 
 }
 },
 'pole_mount': {
 SMALL: { 
 width: { feet: 5, meters: 1.5 }, 
 height: { feet: 3, meters: 1.0 }, 
 label: 'Small Sign', 
 description: { feet: '~5\' × 3\'', meters: '~1.5m × 1.0m' },
 area: { feet: '15 sq ft', meters: '1.5m²' }, 
 priceMultiplier: 1.0 
 },
 MEDIUM: { 
 width: { feet: 8, meters: 2.5 }, 
 height: { feet: 5, meters: 1.5 }, 
 label: 'Standard Sign', 
 description: { feet: '~8\' × 5\'', meters: '~2.5m × 1.5m' },
 area: { feet: '40 sq ft', meters: '3.8m²' }, 
 priceMultiplier: 1.4 
 },
 LARGE: { 
 width: { feet: 13, meters: 4.0 }, 
 height: { feet: 6.5, meters: 2.0 }, 
 label: 'Large Sign', 
 description: { feet: '~13\' × 6.5\'', meters: '~4.0m × 2.0m' },
 area: { feet: '85 sq ft', meters: '8.0m²' }, 
 priceMultiplier: 2.0 
 }
 },
 'other': {
 SMALL: { 
 width: { feet: 6.5, meters: 2.0 }, 
 height: { feet: 5, meters: 1.5 }, 
 label: 'Small Space', 
 description: { feet: '~6.5\' × 5\'', meters: '~2.0m × 1.5m' },
 area: { feet: '32 sq ft', meters: '3.0m²' }, 
 priceMultiplier: 1.0 
 },
 MEDIUM: { 
 width: { feet: 10, meters: 3.0 }, 
 height: { feet: 6.5, meters: 2.0 }, 
 label: 'Medium Space', 
 description: { feet: '~10\' × 6.5\'', meters: '~3.0m × 2.0m' },
 area: { feet: '65 sq ft', meters: '6.0m²' }, 
 priceMultiplier: 1.4 
 },
 LARGE: { 
 width: { feet: 13, meters: 4.0 }, 
 height: { feet: 10, meters: 3.0 }, 
 label: 'Large Space', 
 description: { feet: '~13\' × 10\'', meters: '~4.0m × 3.0m' },
 area: { feet: '130 sq ft', meters: '12.0m²' }, 
 priceMultiplier: 2.0 
 }
 }
 };

 // Get dimensions for current space configuration
 const getSpaceDimensions = (spaceType, sizeCategory) => {
 const spaceConfig = spaceSizeOptions[spaceType]?.[sizeCategory] || spaceSizeOptions['other'][sizeCategory];
 if (!spaceConfig) return null;
 
 return {
 width: spaceConfig.width[unitPreference],
 height: spaceConfig.height[unitPreference],
 label: spaceConfig.label,
 description: spaceConfig.description[unitPreference],
 area: spaceConfig.area[unitPreference],
 priceMultiplier: spaceConfig.priceMultiplier,
 unit: unitPreference
 };
 };

 // ✅ EDIT MODE: Load existing space data
 const loadExistingSpaceData = async () => {
 if (!isEditMode || !spaceId) return;
 
 setIsLoadingExisting(true);
 setError('');
 
 try {
 console.log('🔄 Loading existing space data for:', spaceId);
 
 // Fetch space details
 const spaceResponse = await apiClient.getSpace(spaceId);
 
 if (!spaceResponse.success) {
 throw new Error(spaceResponse.error || 'Space not found');
 }
 
 const spaceData = spaceResponse.data;
 console.log('✅ Space data loaded:', spaceData);
 
 // Fetch property details if we have a property reference
 let propertyDetails = null;
 if (spaceData.propertyId || spaceData.property?.id) {
 const propertyId = spaceData.propertyId || spaceData.property.id;
 const propertyResponse = await apiClient.getProperty(propertyId);
 if (propertyResponse.success) {
 propertyDetails = propertyResponse.data;
 console.log('✅ Property data loaded:', propertyDetails);
 }
 }
 
 // ✅ FIXED: Extract rate type from various possible fields, prioritizing rateType
 const rateType = spaceData.rateType || 
 spaceData.ratePeriod || // Keep as fallback for existing data
 spaceData.pricing?.rateType ||
 spaceData.pricing?.ratePeriod ||
 'DAILY';
 
 // Set up property data
 const propertyInfo = propertyDetails || spaceData.property || {};
 setPropertyData({
 id: propertyInfo.id,
 title: propertyInfo.title || propertyInfo.name || '',
 address: propertyInfo.address || '',
 city: propertyInfo.city || '',
 state: propertyInfo.state || '',
 country: propertyInfo.country || '',
 zipCode: propertyInfo.zipCode || '',
 latitude: propertyInfo.latitude,
 longitude: propertyInfo.longitude,
 propertyType: propertyInfo.propertyType || 'COMMERCIAL',
 primary_image: propertyInfo.primary_image || propertyInfo.images?.[0],
 description: propertyInfo.description || 'High-visibility advertising space in prime location.'
 });
 
 // Set up space data
 const transformedSpace = {
 id: spaceData.id,
 name: spaceData.name || '',
 type: spaceData.type || spaceData.spaceType || 'storefront_window',
 baseRate: String(spaceData.baseRate || spaceData.pricing?.baseRate || ''),
 rateType: rateType, // ✅ FIXED: Changed from ratePeriod to rateType
 currency: spaceData.currency || propertyInfo.currency || 'USD',
 sizeCategory: spaceData.sizeCategory || spaceData.dimensions?.sizeCategory || 'MEDIUM',
 image: spaceData.image || spaceData.images?.[0],
 isEditing: false // Start in view mode for edit
 };
 
 setSpacesData([transformedSpace]);
 
 // Store original data for change detection
 setOriginalData({
 property: propertyInfo,
 space: transformedSpace
 });
 
 console.log('✅ All data loaded for edit mode');
 
 } catch (error) {
 console.error('❌ Error loading existing space:', error);
 setError(`Failed to load space data: ${error.message}`);
 // Redirect back to dashboard after a delay
 setTimeout(() => {
 navigate('/dashboard?error=space-not-found');
 }, 3000);
 } finally {
 setIsLoadingExisting(false);
 }
 };

 // ✅ CHANGE DETECTION: Check if data has been modified - Fixed field names
 const detectChanges = () => {
 if (!originalData || !isEditMode) {
 setHasUnsavedChanges(false);
 return;
 }
 
 const currentSpace = spacesData[0];
 const originalSpace = originalData.space;
 
 // Check space fields for changes
 const spaceChanged = (
 currentSpace.name !== originalSpace.name ||
 currentSpace.type !== originalSpace.type ||
 currentSpace.baseRate !== originalSpace.baseRate ||
 currentSpace.rateType !== originalSpace.rateType || // ✅ FIXED: Changed from ratePeriod
 currentSpace.currency !== originalSpace.currency ||
 currentSpace.sizeCategory !== originalSpace.sizeCategory ||
 currentSpace.image !== originalSpace.image
 );
 
 // Check property fields for changes (if property editing is allowed)
 const propertyChanged = (
 propertyData.title !== originalData.property.title ||
 propertyData.description !== originalData.property.description
 );
 
 setHasUnsavedChanges(spaceChanged || propertyChanged);
 };

 // Run change detection whenever data changes
 useEffect(() => {
 detectChanges();
 }, [propertyData, spacesData, originalData]);

 // ✅ EDIT MODE: Load data on component mount
 useEffect(() => {
 if (isEditMode) {
 loadExistingSpaceData();
 }
 }, [isEditMode, spaceId]);

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

 // Initialize Google Places Autocomplete - IMPROVED VERSION
 useEffect(() => {
 // Skip autocomplete setup in edit mode since property is read-only
 if (isEditMode) {
 setIsLoadingMaps(false);
 setMapsLoaded(true);
 return;
 }
 
 let mounted = true;
 let retryCount = 0;
 const maxRetries = 5;
 let retryTimeout;

 const initAutocomplete = async () => {
 try {
 console.log('🗺️ Initializing Google Maps autocomplete...');
 setIsLoadingMaps(true);
 setMapsError('');
 
 const maps = await Promise.race([
 googleMapsLoader.waitForLoad(),
 new Promise((_, reject) => 
 setTimeout(() => reject(new Error('Google Maps load timeout')), 10000)
 )
 ]);
 
 if (!mounted) {
 console.log('🛑 Component unmounted during Maps loading');
 return;
 }

 if (!window.google?.maps?.places?.Autocomplete) {
 throw new Error('Google Places Autocomplete not available');
 }
 
 console.log('✅ Google Maps loaded successfully');
 setMapsLoaded(true);
 setIsLoadingMaps(false);
 
 setTimeout(() => {
 if (mounted && addressInputRef.current && !autocompleteRef.current) {
 initializeAutocompleteInstance();
 }
 }, 100);

 } catch (error) {
 console.error('❌ Error loading Google Maps:', error);
 
 if (!mounted) return;
 
 if (retryCount < maxRetries) {
 retryCount++;
 const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 8000);
 console.log(`🔄 Retrying Google Maps load (${retryCount}/${maxRetries}) in ${retryDelay}ms`);
 
 retryTimeout = setTimeout(() => {
 if (mounted) {
 initAutocomplete();
 }
 }, retryDelay);
 } else {
 console.error('💥 Failed to load Google Maps after all retries');
 setMapsError('Unable to load address search. You can still enter addresses manually.');
 setIsLoadingMaps(false);
 }
 }
 };

 const initializeAutocompleteInstance = () => {
 if (!addressInputRef.current || autocompleteRef.current || !window.google?.maps?.places) {
 console.log('🚫 Cannot initialize autocomplete - missing requirements');
 return;
 }

 try {
 console.log('🎯 Creating autocomplete instance...');
 
 autocompleteRef.current = new window.google.maps.places.Autocomplete(
 addressInputRef.current,
 {
 types: ['address'],
 fields: ['formatted_address', 'address_components', 'geometry', 'name', 'place_id']
 }
 );

 if (navigator.geolocation) {
 navigator.geolocation.getCurrentPosition(
 (position) => {
 if (autocompleteRef.current) {
 const circle = new window.google.maps.Circle({
 center: {
 lat: position.coords.latitude,
 lng: position.coords.longitude
 },
 radius: 50000
 });
 autocompleteRef.current.setBounds(circle.getBounds());
 console.log('📍 Location bounds set for autocomplete');
 }
 },
 (error) => {
 console.log('📍 Geolocation not available:', error.message);
 },
 { timeout: 5000 }
 );
 }

 autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
 console.log('✅ Autocomplete initialized successfully');

 } catch (error) {
 console.error('❌ Error creating autocomplete instance:', error);
 setMapsError('Failed to initialize address search');
 setIsLoadingMaps(false);
 }
 };

 initAutocomplete();

 return () => {
 mounted = false;
 if (retryTimeout) {
 clearTimeout(retryTimeout);
 }
 if (autocompleteRef.current) {
 try {
 if (window.google?.maps?.event) {
 window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
 }
 autocompleteRef.current = null;
 console.log('🧹 Autocomplete cleanup completed');
 } catch (error) {
 console.error('Error during autocomplete cleanup:', error);
 }
 }
 };
 }, [isEditMode]);

 // Re-initialize autocomplete when input becomes available
 useEffect(() => {
 if (mapsLoaded && addressInputRef.current && !autocompleteRef.current && !isEditMode) {
 console.log('🔄 Re-initializing autocomplete for current step');
 try {
 autocompleteRef.current = new window.google.maps.places.Autocomplete(
 addressInputRef.current,
 {
 types: ['address'],
 fields: ['formatted_address', 'address_components', 'geometry', 'name', 'place_id']
 }
 );
 autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
 console.log('✅ Autocomplete re-initialized');
 } catch (error) {
 console.error('❌ Error re-initializing autocomplete:', error);
 setMapsError('Address autocomplete unavailable - you can still enter addresses manually');
 }
 }
 }, [mapsLoaded, currentStep, isEditMode]);

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
 if (!autocompleteRef.current || isEditMode) return;

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
 if (isEditMode) return; // Property is read-only in edit mode
 
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
 if (isEditMode) return; // Property images read-only in edit mode
 
 const file = event.target.files[0];
 if (!file) return;

 if (!file.type.startsWith('image/')) {
 setError('Please upload an image file');
 return;
 }

 if (file.size> 5 * 1024 * 1024) {
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

 if (file.size> 5 * 1024 * 1024) {
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
 if (isEditMode) return; // Only one space in edit mode
 
 const newSpace = {
 id: `space-${Date.now()}`,
 name: '',
 type: 'storefront_window',
 baseRate: '',
 rateType: 'DAILY', // ✅ FIXED: Changed from ratePeriod to rateType
 currency: spacesData[0]?.currency || 'USD',
 sizeCategory: 'MEDIUM',
 image: null,
 isEditing: true
 };
 setSpacesData(prev => [...prev, newSpace]);
 };

 const removeSpace = (spaceId) => {
 if (isEditMode) return; // Can't remove the space being edited
 
 if (spacesData.length <= 1) {
 setError('You must have at least one space');
 return;
 }
 setSpacesData(prev => prev.filter(space => space.id !== spaceId));
 };

 const updateSpaceData = (spaceId, field, value) => {
 setSpacesData(prev => prev.map(space => 
 space.id === spaceId 
 ? { ...space, [field]: value }
 : space
 ));
 };

 const validateSpace = (space) => {
 if (!space.name.trim()) return 'Space name is required';
 if (!space.baseRate || parseFloat(space.baseRate) <= 0) return 'Valid rate is required';
 if (!space.sizeCategory) return 'Size selection is required';
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
 
 if (currentStep === 1 && !isEditMode) {
 if (!propertyData.title.trim()) {
 setError('Property title is required');
 return;
 }
 if (!propertyData.address.trim()) {
 setError('Property address is required');
 return;
 }
 if (mapsLoaded && !mapsError && (!propertyData.latitude || !propertyData.longitude)) {
 setError('Please select a valid address from the dropdown suggestions, or skip autocomplete to enter manually');
 return;
 }
 if (!propertyData.primary_image) {
 setError('Property image is required');
 return;
 }
 }
 
 if (currentStep === 2) {
 const unsavedSpace = spacesData.find(space => space.isEditing);
 if (unsavedSpace) {
 setError('Please save all spaces before proceeding');
 return;
 }
 
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

 // ✅ EDIT MODE: Submit updated space - Fixed API payload
 const submitUpdates = async () => {
 setIsLoading(true);
 setError('');

 try {
 console.log('🔄 Submitting space updates...');
 
 const space = spacesData[0];
 const dimensions = getSpaceDimensions(space.type, space.sizeCategory);
 
 const updatePayload = {
 name: space.name,
 type: space.type,
 baseRate: parseFloat(space.baseRate),
 rateType: space.rateType, // ✅ FIXED: Changed from ratePeriod to rateType
 currency: space.currency,
 images: space.image, // ✅ FIXED: Changed from image to images
 sizeCategory: space.sizeCategory,
 dimensions: {
 width: dimensions.width,
 height: dimensions.height,
 unit: unitPreference,
 area: dimensions.area
 },
 // Include any property updates if allowed
 ...(propertyData.title !== originalData?.property?.title && {
 propertyTitle: propertyData.title
 }),
 ...(propertyData.description !== originalData?.property?.description && {
 propertyDescription: propertyData.description
 })
 };
 
 console.log('📦 Update payload:', updatePayload);
 
 const result = await apiClient.updateSpace(spaceId, updatePayload);
 
 console.log('✅ API Response:', result);
 
 if (!result.success) {
 throw new Error(result.error || result.message || 'Failed to update space');
 }

 console.log('🎉 Space updated successfully, navigating to dashboard...');
 
 navigate('/dashboard?tab=spaces&updated=true', { 
 replace: true,
 state: { refresh: true, updatedSpace: true }
 });

 } catch (error) {
 console.error('❌ Error updating space:', error);
 setError(error.message);
 } finally {
 setIsLoading(false);
 }
 };

 // Submit new listing (create mode) - Fixed API payload
 const submitListing = async () => {
 setIsLoading(true);
 setError('');

 try {
 console.log('🚀 Submitting listing...');
 
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
 spaces: spacesData.map(space => {
 const dimensions = getSpaceDimensions(space.type, space.sizeCategory);
 return {
 name: space.name,
 type: space.type,
 baseRate: parseFloat(space.baseRate),
 currency: space.currency,
 rateType: space.rateType, // ✅ FIXED: Changed from ratePeriod to rateType
 image: space.image,
 sizeCategory: space.sizeCategory,
 dimensions: {
 width: dimensions.width,
 height: dimensions.height,
 unit: unitPreference,
 area: dimensions.area
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
 };
 })
 };
 
 console.log('📦 Property payload:', propertyPayload);
 
 const result = await apiClient.createProperty(propertyPayload);
 
 console.log('✅ API Response:', result);
 
 if (!result.success) {
 throw new Error(result.error || result.message || 'Failed to create property');
 }

 console.log('🎉 Listing created successfully, navigating to dashboard...');

 navigate('/dashboard?tab=spaces&created=true', { 
 replace: true,
 state: { refresh: true, newListing: true }
 });

 } catch (error) {
 console.error('❌ Error submitting listing:', error);
 setError(error.message);
 } finally {
 setIsLoading(false);
 }
 };

 // Handle form submission based on mode
 const handleSubmit = () => {
 if (isEditMode) {
 submitUpdates();
 } else {
 submitListing();
 }
 };

 // ✅ UNSAVED CHANGES WARNING
 useEffect(() => {
 const handleBeforeUnload = (e) => {
 if (hasUnsavedChanges) {
 e.preventDefault();
 e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
 return e.returnValue;
 }
 };

 window.addEventListener('beforeunload', handleBeforeUnload);
 return () => window.removeEventListener('beforeunload', handleBeforeUnload);
 }, [hasUnsavedChanges]);

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
 { value: 'event_space', label: 'Event Space' },
 { value: 'billboard', label: 'Billboard' },
 { value: 'pole_mount', label: 'Pole Mount/Sign' },
 { value: 'other', label: 'Other' }
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

 // ✅ EDIT MODE: Show loading state while fetching existing data
 if (isLoadingExisting) {
 return (
 <div className="min-h-screen" style={{ backgroundColor: '#F8FAFF' }}>
 <div className="flex items-center justify-center min-h-screen">
 <div className="text-center">
 <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
 <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Space Data</h3>
 <p className="text-gray-600">Please wait while we fetch your space information...</p>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen" style={{ backgroundColor: '#F8FAFF' }}>
 {/* Enhanced Header for Edit Mode */}
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
 {isEditMode ? 'Edit Space' : 'List Your Space'}
 </h1>
 <p className="text-sm text-slate-600 mt-1">
 {isEditMode 
 ? 'Update your space details and pricing'
 : 'Add your property and available advertising spaces'
 }
 </p>
 {isEditMode && hasUnsavedChanges && (
 <div className="flex items-center mt-2 text-amber-600 text-sm">
 <AlertCircle className="w-4 h-4 mr-1" />
 You have unsaved changes
 </div>
 )}
 </div>
 
 <div className="hidden sm:flex items-center text-sm text-slate-600">
 Step {currentStep} of {steps.length}
 {isEditMode && (
 <button
 onClick={() => loadExistingSpaceData()}
 className="ml-4 text-blue-600 hover:text-blue-800 flex items-center"
 title="Reload original data"
>
 <RefreshCw className="w-4 h-4 mr-1" />
 Reset
 </button>
 )}
 </div>
 </div>
 </div>
 </div>

 {/* Progress Bar - Enhanced for Edit Mode */}
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
 {/* STEP 1: Property Information - Read-only in Edit Mode */}
 {currentStep === 1 && (
 <div className="space-y-5">
 {isEditMode && (
 <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
 <div className="flex items-center">
 <Info className="w-4 h-4 text-blue-600 mr-2" />
 <p className="text-sm text-blue-800">
 Property information is read-only in edit mode. Contact support to update property details.
 </p>
 </div>
 </div>
 )}
 
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
 onChange={(e) => !isEditMode && setPropertyData(prev => ({ ...prev, title: e.target.value }))}
 placeholder="e.g., Downtown Plaza"
 disabled={isEditMode}
 className={`w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-[#4668AB] focus:border-transparent transition-all ${
 isEditMode ? 'bg-slate-50 text-slate-600 cursor-not-allowed' : ''
 }`}
 />
 </div>

 {/* Address */}
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">
 Street Address <span className="text-red-500">*</span>
 </label>
 <div className="relative">
 <input
 ref={!isEditMode ? addressInputRef : null}
 type="text"
 value={propertyData.address}
 onChange={handleAddressChange}
 placeholder={isEditMode ? propertyData.address : (isLoadingMaps ? "Loading address search..." : "Start typing to search or enter manually...")}
 disabled={isEditMode || false}
 className={`w-full px-3 py-2 pl-9 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-[#4668AB] focus:border-transparent transition-all ${
 isEditMode ? 'bg-slate-50 text-slate-600 cursor-not-allowed' : ''
 }`}
 />
 <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
 {!isEditMode && isLoadingMaps && (
 <Loader2 className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 animate-spin" />
 )}
 </div>
 {!isEditMode && (
 <>
 {isLoadingMaps ? (
 <div className="flex items-center justify-between mt-1">
 <p className="text-xs text-amber-600">Loading autocomplete...</p>
 <button
 type="button"
 onClick={() => {
 setIsLoadingMaps(false);
 setMapsError('');
 setMapsLoaded(false);
 }}
 className="text-xs text-slate-500 hover:text-slate-700 underline"
>
 Skip autocomplete
 </button>
 </div>
 ) : mapsLoaded && !mapsError ? (
 <p className="text-xs text-slate-500 mt-1">Select from dropdown for accurate location or enter manually</p>
 ) : mapsError ? (
 <p className="text-xs text-orange-600 mt-1">{mapsError}</p>
 ) : (
 <p className="text-xs text-slate-500 mt-1">Enter address manually - autocomplete unavailable</p>
 )}
 </>
 )}
 </div>

 {/* Property Type */}
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">
 Property Type
 </label>
 <select
 value={propertyData.propertyType}
 onChange={(e) => !isEditMode && setPropertyData(prev => ({ ...prev, propertyType: e.target.value }))}
 disabled={isEditMode}
 className={`w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-[#4668AB] focus:border-transparent transition-all ${
 isEditMode ? 'bg-slate-50 text-slate-600 cursor-not-allowed' : ''
 }`}
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
 className={`border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-[#4668AB] transition-colors ${
 isEditMode ? 'cursor-not-allowed bg-slate-50' : 'cursor-pointer group'
 }`}
 onClick={() => !isLoading && !isEditMode && document.getElementById('image-upload').click()}
>
 {propertyData.primary_image ? (
 <div className="relative">
 <img 
 src={propertyData.primary_image} 
 alt="Property" 
 className="w-full h-40 object-cover rounded-md"
 />
 {!isEditMode && (
 <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
 <div className="text-white text-sm font-medium">
 Click to change
 </div>
 </div>
 )}
 {isEditMode && (
 <div className="absolute top-2 right-2 bg-slate-800 bg-opacity-60 text-white text-xs px-2 py-1 rounded">
 Read-only
 </div>
 )}
 </div>
 ) : (
 <div className="py-4">
 {isLoading ? (
 <Loader2 className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-spin" />
 ) : (
 <>
 <Upload className={`w-8 h-8 text-slate-400 mx-auto mb-2 transition-colors ${
 !isEditMode ? 'group-hover:text-[#4668AB]' : ''
 }`} />
 <p className="text-sm text-slate-600">
 {isEditMode ? 'Property image (read-only)' : 'Drop image here or click to browse'}
 </p>
 {!isEditMode && (
 <p className="text-xs text-slate-500 mt-1">
 PNG, JPG up to 5MB
 </p>
 )}
 </>
 )}
 </div>
 )}
 </div>
 {!isEditMode && (
 <input
 id="image-upload"
 type="file"
 accept="image/*"
 onChange={handleImageUpload}
 className="hidden"
 />
 )}
 </div>
 </div>
 </div>
 )}

 {/* STEP 2: Space Details - Enhanced for Edit Mode - Fixed field references */}
 {currentStep === 2 && (
 <div className="space-y-5">
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center">
 <div className="w-10 h-10 bg-gradient-to-br from-[#4668AB] to-[#39558C] rounded-xl flex items-center justify-center text-white mr-3 shadow-lg">
 <Maximize2 className="w-5 h-5" />
 </div>
 <div>
 <h3 className="text-base font-semibold text-slate-800">
 {isEditMode ? 'Edit Advertising Space' : 'Advertising Spaces'}
 </h3>
 <p className="text-xs text-slate-600">
 {isEditMode 
 ? 'Update your space details and pricing'
 : `${spacesData.filter(s => !s.isEditing).length} saved, ${spacesData.filter(s => s.isEditing).length} editing`
 }
 </p>
 </div>
 </div>
 {!isEditMode && (
 <button
 onClick={addSpace}
 className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#4668AB] to-[#39558C] rounded-lg hover:from-[#39558C] hover:to-[#2c4470] transition-all shadow-md hover:shadow-lg transform hover:scale-105"
>
 <Plus className="w-4 h-4 mr-1.5" />
 Add Space
 </button>
 )}
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
 {isEditMode ? <Edit2 className="w-4 h-4" /> : index + 1}
 </div>
 <span className="text-sm font-semibold text-slate-800">
 {isEditMode ? `Editing: ${space.name || 'Advertising Space'}` : `Space ${index + 1} - Editing`}
 </span>
 </div>
 <div className="flex gap-2">
 <button
 onClick={() => saveSpace(space.id)}
 className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-green-600 to-green-500 rounded-lg hover:from-green-700 hover:to-green-600 transition-all shadow-md hover:shadow-lg"
>
 <Save className="w-3.5 h-3.5 mr-1" />
 {isEditMode ? 'Save Changes' : 'Save'}
 </button>
 {!isEditMode && spacesData.length> 1 && (
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

 {/* Unit Selection Toggle */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
 Measurement Units
 </label>
 <div className="flex rounded-lg border border-slate-300 overflow-hidden bg-white">
 <button
 type="button"
 onClick={() => setUnitPreference('feet')}
 className={`px-3 py-2 text-sm font-medium transition-all flex-1 ${
 unitPreference === 'feet'
 ? 'bg-[#4668AB] text-white'
 : 'bg-white text-slate-600 hover:bg-slate-50'
 }`}
>
 Feet
 </button>
 <button
 type="button"
 onClick={() => setUnitPreference('meters')}
 className={`px-3 py-2 text-sm font-medium transition-all flex-1 ${
 unitPreference === 'meters'
 ? 'bg-[#4668AB] text-white'
 : 'bg-white text-slate-600 hover:bg-slate-50'
 }`}
>
 Meters
 </button>
 </div>
 </div>

 {/* Predefined Size Selection */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
 Size Category <span className="text-red-500">*</span>
 </label>
 <div className="space-y-2">
 {Object.entries(spaceSizeOptions[space.type] || spaceSizeOptions['other']).map(([sizeKey, sizeInfo]) => (
 <div 
 key={sizeKey}
 className={`p-3 border rounded-lg cursor-pointer transition-all ${
 space.sizeCategory === sizeKey 
 ? 'border-[#4668AB] bg-[#4668AB]/5 ring-1 ring-[#4668AB]' 
 : 'border-slate-200 hover:border-slate-300 bg-white'
 }`}
 onClick={() => updateSpaceData(space.id, 'sizeCategory', sizeKey)}
>
 <div className="flex items-center justify-between">
 <div className="flex items-center">
 <div className={`w-4 h-4 rounded-full border-2 mr-3 transition-all ${
 space.sizeCategory === sizeKey 
 ? 'border-[#4668AB] bg-[#4668AB]' 
 : 'border-slate-300'
 }`}>
 {space.sizeCategory === sizeKey && (
 <div className="w-full h-full rounded-full bg-white transform scale-50" />
 )}
 </div>
 <div>
 <p className="text-sm font-medium text-slate-900">{sizeInfo.label}</p>
 <p className="text-xs text-slate-500">{sizeInfo.description[unitPreference]}</p>
 </div>
 </div>
 <div className="text-right">
 <div className="flex items-center text-xs text-slate-600">
 <Ruler className="w-3 h-3 mr-1" />
 {sizeInfo.area[unitPreference]}
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 {space.type && space.sizeCategory && (
 <div className="mt-2 p-2 bg-blue-50 rounded-md">
 <p className="text-xs text-blue-700 font-medium">
 Approximate dimensions: {getSpaceDimensions(space.type, space.sizeCategory)?.width}{unitPreference === 'feet' ? '\'' : 'm'} × {getSpaceDimensions(space.type, space.sizeCategory)?.height}{unitPreference === 'feet' ? '\'' : 'm'}
 </p>
 <p className="text-xs text-blue-600 mt-0.5">
 Choose the size that best matches your available space
 </p>
 </div>
 )}
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
 onClick={() => updateSpaceData(space.id, 'rateType', option.value)}
 className={`px-3 py-2 text-xs font-medium transition-all ${
 space.rateType === option.value
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
 className="w-full h-full object-contain rounded-md bg-slate-50"
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
 {isEditMode ? <Check className="w-4 h-4" /> : index + 1}
 </div>
 <div className="flex-1">
 <p className="text-sm font-semibold text-slate-900">
 {space.name}
 </p>
 <p className="text-xs text-slate-600">
 {spaceTypeOptions.find(t => t.value === space.type)?.label}
 {space.sizeCategory && getSpaceDimensions(space.type, space.sizeCategory) && 
 ` • ${getSpaceDimensions(space.type, space.sizeCategory).label}`
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
 <p className="text-xs text-slate-500">{getRatePeriodLabel(space.rateType)}</p>
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

 {/* STEP 3: Review - Enhanced for Edit Mode */}
 {currentStep === 3 && (
 <div className="space-y-4">
 {/* Property Summary */}
 <div className="bg-slate-50 rounded-lg p-4">
 <h3 className="text-sm font-semibold text-slate-900 mb-3">
 {isEditMode ? 'Property Details (Read-only)' : 'Property Details'}
 </h3>
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

 {/* Spaces Summary - Enhanced for Edit Mode with fixed field references */}
 <div className="bg-slate-50 rounded-lg p-4">
 <h3 className="text-sm font-semibold text-slate-900 mb-3">
 {isEditMode ? 'Space Changes' : `${spacesData.length} Space${spacesData.length !== 1 ? 's' : ''}`}
 </h3>
 
 {isEditMode && hasUnsavedChanges && (
 <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
 <div className="flex items-center">
 <AlertCircle className="w-4 h-4 text-amber-600 mr-2" />
 <p className="text-sm text-amber-800 font-medium">
 You have unsaved changes
 </p>
 </div>
 <div className="mt-2 text-xs text-amber-700">
 Changes will be saved when you click "Save Changes" below.
 </div>
 </div>
 )}

 <div className="space-y-3">
 {spacesData.map((space) => {
 const dimensions = getSpaceDimensions(space.type, space.sizeCategory);
 const originalSpace = originalData?.space;
 const hasChanges = isEditMode && originalSpace && (
 space.name !== originalSpace.name ||
 space.type !== originalSpace.type ||
 space.baseRate !== originalSpace.baseRate ||
 space.rateType !== originalSpace.rateType ||
 space.sizeCategory !== originalSpace.sizeCategory ||
 space.image !== originalSpace.image
 );
 
 return (
 <div key={space.id} className={`flex items-start gap-3 py-2 border-b border-slate-200 last:border-0 ${
 hasChanges ? 'bg-blue-50 -mx-2 px-2 rounded' : ''
 }`}>
 {space.image && (
 <img 
 src={space.image} 
 alt={space.name}
 className="w-16 h-16 object-cover rounded-lg border border-slate-200"
 />
 )}
 <div className="flex-1">
 <div className="flex items-center gap-2">
 <p className="text-sm font-medium text-slate-900">{space.name}</p>
 {hasChanges && (
 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
 Modified
 </span>
 )}
 </div>
 <p className="text-xs text-slate-600">
 {spaceTypeOptions.find(t => t.value === space.type)?.label}
 {dimensions && ` • ${dimensions.label} (${dimensions.description})`}
 </p>
 
 {/* Show changes for edit mode */}
 {isEditMode && hasChanges && originalSpace && (
 <div className="mt-2 text-xs text-slate-600">
 <div className="grid grid-cols-2 gap-2">
 {space.name !== originalSpace.name && (
 <div>
 <span className="font-medium">Name:</span>
 <div className="text-red-600">- {originalSpace.name}</div>
 <div className="text-green-600">+ {space.name}</div>
 </div>
 )}
 {space.baseRate !== originalSpace.baseRate && (
 <div>
 <span className="font-medium">Rate:</span>
 <div className="text-red-600">- {getCurrencySymbol(originalSpace.currency)}{originalSpace.baseRate}</div>
 <div className="text-green-600">+ {getCurrencySymbol(space.currency)}{space.baseRate}</div>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 <p className="text-sm font-semibold text-[#4668AB] ml-4">
 {getCurrencySymbol(space.currency)}{space.baseRate}
 {getRatePeriodShortLabel(space.rateType)}
 </p>
 </div>
 );
 })}
 </div>
 </div>

 {/* Notice */}
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
 <div className="flex">
 <Info className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
 <p className="text-xs text-blue-800">
 {isEditMode 
 ? 'Your changes will be saved and the space will remain available for bookings.'
 : 'Your listing will be live immediately after submission and available for bookings.'
 }
 </p>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Footer Actions - Enhanced for Edit Mode */}
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

 {/* Unsaved Changes Indicator */}
 {isEditMode && hasUnsavedChanges && currentStep !== 3 && (
 <span className="text-xs text-amber-600 hidden sm:block">
 Unsaved changes
 </span>
 )}

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
 onClick={handleSubmit}
 disabled={isLoading}
 className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#4668AB] rounded-md hover:bg-[#39558C] transition-colors disabled:opacity-50"
>
 {isLoading ? (
 <>
 <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
 {isEditMode ? 'Saving...' : 'Submitting...'}
 </>
 ) : (
 <>
 {isEditMode ? (
 <>
 <Save className="w-3.5 h-3.5 mr-1.5" />
 Save Changes
 </>
 ) : (
 <>
 <Check className="w-3.5 h-3.5 mr-1.5" />
 Submit Listing
 </>
 )}
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