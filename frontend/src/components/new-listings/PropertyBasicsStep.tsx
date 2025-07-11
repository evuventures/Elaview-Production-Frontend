// src/components/new-listings/PropertyBasicsStep.tsx
import React from 'react';
import { PropertyFormData, LocationData } from '@/types/property';
import ModernLocationPicker from '../browse/maps/ModernLocationPicker';

interface PropertyBasicsStepProps {
  formData: PropertyFormData;
  setFormData: React.Dispatch<React.SetStateAction<PropertyFormData>>;
  errors: Record<string, string | null>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
}

const PropertyBasicsStep: React.FC<PropertyBasicsStepProps> = ({
  formData,
  setFormData,
  errors,
  setErrors
}) => {
  const handleChange = (field: keyof PropertyFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleLocationChange = (field: keyof LocationData, value: string | number | null) => {
    setFormData(prev => ({ 
      ...prev, 
      location: { ...prev.location, [field]: value } 
    }));
    if (errors.location || errors.location_address) {
      setErrors(prev => ({ ...prev, location: null, location_address: null }));
    }
  };

  const handleLocationSelect = (location: LocationData) => {
    console.log('Location selected:', location);
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
          placeholder="Enter property name (e.g., 'Downtown Office Building' or 'Semi-Truck Fleet #1')"
          className={`w-full h-12 px-4 text-base border-2 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all ${
            errors.property_name ? 'border-red-500' : 'border-border'
          }`}
        />
        {errors.property_name && (
          <p className="text-red-500 text-sm mt-2">{errors.property_name}</p>
        )}
      </div>

      {/* Property Type - FIXED: Using correct enum values */}
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
          <option value="OFFICE">Office Building</option>
          <option value="RETAIL">Retail Space</option>
          <option value="COMMERCIAL">Commercial</option>
          <option value="WAREHOUSE">Warehouse</option>
          <option value="VEHICLE_FLEET">Semi-Truck</option>
          <option value="OTHER">Other</option>
        </select>
        {errors.property_type && (
          <p className="text-red-500 text-sm mt-2">{errors.property_type}</p>
        )}
      </div>

      {/* Property Description */}
      <div>
        <label className="text-base font-semibold text-muted-foreground mb-2 block">
          Property Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder={
            formData.property_type === 'VEHICLE_FLEET' 
              ? "Describe your semi-truck fleet, routes, and advertising visibility opportunities..."
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

      {/* Conditional Location Section */}
      {formData.property_type !== 'VEHICLE_FLEET' ? (
        <>
          {/* Location Picker for Fixed Properties */}
          <ModernLocationPicker
            location={formData.location}
            onLocationChange={handleLocationChange}
            onLocationSelect={handleLocationSelect}
            error={errors.location || errors.location_address}
            required={true}
          />

          {/* Additional Location Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-base font-semibold text-muted-foreground mb-2 block">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location.city}
                onChange={(e) => handleLocationChange('city', e.target.value)}
                placeholder="City"
                className={`w-full h-12 px-4 text-base border-2 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all ${
                  errors.city ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-2">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="text-base font-semibold text-muted-foreground mb-2 block">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location.zipcode}
                onChange={(e) => handleLocationChange('zipcode', e.target.value)}
                placeholder="ZIP Code"
                className={`w-full h-12 px-4 text-base border-2 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all ${
                  errors.zipcode ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.zipcode && (
                <p className="text-red-500 text-sm mt-2">{errors.zipcode}</p>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Base Location for Vehicle Fleet */
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">Mobile Advertising Fleet</h3>
          <p className="text-sm text-blue-700 mb-4">
            Since this is a mobile vehicle fleet, please provide your primary base location for reference.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-blue-800 mb-2 block">
                Base City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location.city}
                onChange={(e) => handleLocationChange('city', e.target.value)}
                placeholder="Primary operating city"
                className="w-full h-10 px-3 text-sm border border-blue-300 rounded-md bg-white"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-blue-800 mb-2 block">
                Base ZIP Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location.zipcode}
                onChange={(e) => handleLocationChange('zipcode', e.target.value)}
                placeholder="Base ZIP code"
                className="w-full h-10 px-3 text-sm border border-blue-300 rounded-md bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Property Size */}
      <div>
        <label className="text-base font-semibold text-muted-foreground mb-2 block">
          {formData.property_type === 'VEHICLE_FLEET' ? 'How many vehicles do you want to list ads on?' : 'Total Property Size (sq ft)'} <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.total_sqft || ''}
          onChange={(e) => handleChange('total_sqft', parseInt(e.target.value) || 0)}
          placeholder={
            formData.property_type === 'VEHICLE_FLEET' 
              ? "Enter number of vehicles"
              : "Enter total square footage"
          }
          min="0"
          className={`w-full h-12 px-4 text-base border-2 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all ${
            errors.total_sqft ? 'border-red-500' : 'border-border'
          }`}
        />
        {errors.total_sqft && (
          <p className="text-red-500 text-sm mt-2">{errors.total_sqft}</p>
        )}
      </div>

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
    </div>
  );
};

export default PropertyBasicsStep;