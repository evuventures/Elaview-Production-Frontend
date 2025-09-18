// src/components/new-listings/PropertyBasicsStep.tsx
import React, { useEffect } from 'react';
import { PropertyFormData, LocationData } from '@/types/property';
import ModernLocationPicker from '../browse/maps/ModernLocationPicker';

interface PropertyBasicsStepProps {
 formData: PropertyFormData;
 onFormChange: (field: keyof PropertyFormData, value: any) => void;
 errors: Record<string, string | null>;
 onNext: () => void;
}

const PropertyBasicsStep: React.FC<PropertyBasicsStepProps> = ({
 formData,
 onFormChange,
 errors,
 onNext
}) => {
 const handleChange = (field: keyof PropertyFormData, value: string | number) => {
 onFormChange(field, value);
 };

 const handleLocationChange = (field: keyof LocationData, value: string | number | null) => {
 const updatedLocation = {
 ...formData.location,
 [field]: value
 };
 onFormChange('location', updatedLocation);
 };

 const handleLocationSelect = (location: LocationData) => {
 console.log('📍 Location selected:', location);
 onFormChange('location', location);
 };

 // ✅ Auto-set total_sqft = 1 for vehicle fleet (represents 1 vehicle)
 useEffect(() => {
 if (formData.property_type === 'VEHICLE_FLEET') {
 onFormChange('total_sqft', 1);
 }
 }, [formData.property_type, onFormChange]);

 // ✅ Check if we should show address picker (not for vehicle fleet)
 const isVehicleFleet = formData.property_type === 'VEHICLE_FLEET';
 const showAddressPicker = !isVehicleFleet;

 // ✅ Validation for next step
 const canProceed = () => {
 const hasRequiredFields = 
 formData.property_name?.trim() &&
 formData.property_type &&
 formData.description?.trim() &&
 formData.location?.city?.trim() &&
 formData.location?.zipcode?.trim();

 // For fixed properties, also require coordinates
 if (!isVehicleFleet) {
 return hasRequiredFields && 
 formData.location?.latitude && 
 formData.location?.longitude;
 }

 // For vehicles, just need basic info (coordinates optional)
 return hasRequiredFields;
 };

 return (
 <div className="space-y-8">
 {/* Step Header */}
 <div>
 <h2 className="text-2xl font-bold text-foreground mb-2">
 Property Basics
 </h2>
 <p className="text-muted-foreground">
 Let's start with the essential information about your property.
 </p>
 </div>

 {/* Property Name */}
 <div>
 <label className="text-base font-semibold text-muted-foreground mb-2 block">
 Property Name <span className="text-red-500">*</span>
 </label>
 <input
 type="text"
 value={formData.property_name}
 onChange={(e) => handleChange('property_name', e.target.value)}
 placeholder={
 formData.property_type === 'VEHICLE_FLEET' 
 ? "Enter vehicle name (e.g., 'Highway Express Truck #1' or 'Blue Diamond Freight')"
 : "Enter property name (e.g., 'Downtown Office Building')"
 }
 className={`w-full h-12 px-4 text-base border-2 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all ${
 errors.property_name ? 'border-red-500' : 'border-border'
 }`}
 />
 {errors.property_name && (
 <p className="text-red-500 text-sm mt-2">{errors.property_name}</p>
 )}
 </div>

 {/* Property Type */}
 <div>
 <label className="text-base font-semibold text-muted-foreground mb-2 block">
 Property Type <span className="text-red-500">*</span>
 </label>
 <select
 value={formData.property_type}
 onChange={(e) => handleChange('property_type', e.target.value)}
 className={`w-full h-12 px-4 text-base border-2 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all ${
 errors.property_type ? 'border-red-500' : 'border-border'
 }`}
>
 <option value="">Select Property Type</option>
 <option value="HOUSE">House</option>
 <option value="APARTMENT">Apartment</option>
 <option value="COMMERCIAL">Commercial</option>
 <option value="OFFICE">Office Building</option>
 <option value="RETAIL">Retail Space</option>
 <option value="BUILDING">Building</option>
 <option value="VEHICLE_FLEET">Vehicle Fleet</option>
 <option value="BILLBOARD">Billboard</option>
 <option value="DIGITAL_DISPLAY">Digital Display</option>
 <option value="OTHER">Other</option>
 </select>
 {errors.property_type && (
 <p className="text-red-500 text-sm mt-2">{errors.property_type}</p>
 )}
 </div>

 {/* Property Description */}
 <div>
 <label className="text-base font-semibold text-muted-foreground mb-2 block">
 {formData.property_type === 'VEHICLE_FLEET' ? 'Vehicle Description' : 'Property Description'} <span className="text-red-500">*</span>
 </label>
 <textarea
 value={formData.description}
 onChange={(e) => handleChange('description', e.target.value)}
 placeholder={
 formData.property_type === 'VEHICLE_FLEET' 
 ? "Describe your semi-truck, typical routes, and advertising visibility opportunities. Include details about highways, cities, and traffic exposure..."
 : "Describe your property, its features, and what makes it unique..."
 }
 rows={4}
 className={`w-full px-4 py-3 text-base border-2 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none ${
 errors.description ? 'border-red-500' : 'border-border'
 }`}
 />
 {errors.description && (
 <p className="text-red-500 text-sm mt-2">{errors.description}</p>
 )}
 <p className="text-xs text-muted-foreground mt-2">
 Minimum 50 characters. Be descriptive to attract potential clients.
 </p>
 </div>

 {/* Location Section */}
 <div>
 <h3 className="text-lg font-semibold mb-4">Location</h3>
 
 {showAddressPicker ? (
 // ✅ Use ModernLocationPicker for fixed properties
 <div className="space-y-4">
 <ModernLocationPicker
 location={formData.location || {
 address: '',
 city: '',
 zipcode: '',
 latitude: null,
 longitude: null
 }}
 onLocationChange={handleLocationChange}
 onLocationSelect={handleLocationSelect}
 error={errors.coordinates || errors.address}
 required={true}
 className="space-y-4"
 />

 {/* Property Size - Only for Fixed Properties */}
 <div>
 <label className="text-base font-semibold text-muted-foreground mb-2 block">
 Total Property Size (sq ft) <span className="text-red-500">*</span>
 </label>
 <input
 type="number"
 value={formData.total_sqft || ''}
 onChange={(e) => handleChange('total_sqft', parseInt(e.target.value) || 0)}
 placeholder="Enter total square footage"
 min="0"
 className={`w-full h-12 px-4 text-base border-2 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all ${
 errors.total_sqft ? 'border-red-500' : 'border-border'
 }`}
 />
 {errors.total_sqft && (
 <p className="text-red-500 text-sm mt-2">{errors.total_sqft}</p>
 )}
 </div>
 </div>
 ) : (
 // ✅ Simple inputs for vehicle fleet (no exact address needed)
 <div className="space-y-4">
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
 <p className="text-sm text-blue-800">
 <strong>Vehicle Fleet:</strong> Since this is a mobile vehicle fleet, 
 you only need to provide a general operating area (city and ZIP code). 
 Exact address is not required.
 </p>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-base font-semibold text-muted-foreground mb-2 block">
 Operating City <span className="text-red-500">*</span>
 </label>
 <input
 type="text"
 value={formData.location?.city || ''}
 onChange={(e) => handleLocationChange('city', e.target.value)}
 placeholder="Los Angeles"
 className={`w-full h-12 px-4 text-base border-2 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all ${
 errors.city ? 'border-red-500' : 'border-border'
 }`}
 />
 {errors.city && (
 <p className="text-red-500 text-sm mt-2">{errors.city}</p>
 )}
 </div>

 <div className="space-y-2">
 <label className="text-base font-semibold text-muted-foreground mb-2 block">
 ZIP Code <span className="text-red-500">*</span>
 </label>
 <input
 type="text"
 value={formData.location?.zipcode || ''}
 onChange={(e) => handleLocationChange('zipcode', e.target.value)}
 placeholder="90001"
 className={`w-full h-12 px-4 text-base border-2 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all ${
 errors.zipcode ? 'border-red-500' : 'border-border'
 }`}
 />
 {errors.zipcode && (
 <p className="text-red-500 text-sm mt-2">{errors.zipcode}</p>
 )}
 </div>
 </div>

 {/* Single Vehicle Notice */}
 <div className="bg-green-50 border border-green-200 rounded-lg p-4">
 <div className="flex items-start">
 <div className="flex-shrink-0">
 <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
 </svg>
 </div>
 <div className="ml-3">
 <h3 className="text-sm font-medium text-green-800">Single Vehicle Listing</h3>
 <p className="mt-1 text-sm text-green-700">
 You're creating a listing for one vehicle. To list additional vehicles, simply create separate listings for each one. 
 This keeps your advertising spaces organized and easier to manage.
 </p>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Display selected coordinates if available */}
 {formData.location?.latitude && formData.location?.longitude && (
 <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
 <p className="text-sm text-green-800">
 ✅ Location confirmed: {formData.location.latitude.toFixed(6)}, {formData.location.longitude.toFixed(6)}
 </p>
 </div>
 )}
 </div>

 {/* Validation Messages */}
 {!isVehicleFleet && (!formData.location?.latitude || !formData.location?.longitude) && (
 <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
 <p className="text-sm text-amber-800">
 📍 Please select your property location on the map or use the address search to get exact coordinates.
 </p>
 </div>
 )}

 {/* In-App Communication Notice */}
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
 <div className="flex items-start">
 <div className="flex-shrink-0">
 <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
 <path
 fillRule="evenodd"
 d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
 clipRule="evenodd"
 />
 </svg>
 </div>
 <div className="ml-3">
 <h3 className="text-sm font-medium text-blue-800">In-App Communication</h3>
 <p className="mt-1 text-sm text-blue-700">
 All communication between property owners and potential renters happens securely within our platform. 
 No external contact information needed!
 </p>
 </div>
 </div>
 </div>

 {/* Progress */}
 <div className="bg-muted/30 rounded-lg p-4">
 <div className="flex items-center justify-between text-sm text-muted-foreground">
 <span>Step 1 of 3 - Property Basics</span>
 <span>Fill in all required fields to continue</span>
 </div>
 <div className="w-full bg-muted rounded-full h-2 mt-2">
 <div className="bg-primary h-2 rounded-full w-1/3"></div>
 </div>
 </div>

 {/* Next Button */}
 <div className="flex justify-end">
 <button
 onClick={onNext}
 disabled={!canProceed()}
 className={`px-8 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
 canProceed()
 ? 'bg-primary text-primary-foreground hover:bg-primary/90'
 : 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-200'
 }`}
>
 Next: Advertising Areas
 </button>
 </div>
 </div>
 );
};

export default PropertyBasicsStep;