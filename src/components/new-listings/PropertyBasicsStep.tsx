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
          placeholder="Enter property name (e.g., 'Downtown Office Building')"
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
          <option value="office">Office Building</option>
          <option value="retail">Retail Space</option>
          <option value="industrial">Industrial</option>
          <option value="mixed_use">Mixed Use</option>
          <option value="medical">Medical Building</option>
          <option value="hospitality">Hospitality</option>
          <option value="residential">Residential</option>
          <option value="other">Other</option>
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
          placeholder="Describe your property, its features, and what makes it unique..."
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

      {/* Location Picker */}
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

      {/* Property Size */}
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

      {/* Contact Information */}
      <div className="border-t pt-8">
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-base font-semibold text-muted-foreground mb-2 block">
              Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.contact_name}
              onChange={(e) => handleChange('contact_name', e.target.value)}
              placeholder="Primary contact name"
              className={`w-full h-12 px-4 text-base border-2 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all ${
                errors.contact_name ? 'border-red-500' : 'border-border'
              }`}
            />
            {errors.contact_name && (
              <p className="text-red-500 text-sm mt-2">{errors.contact_name}</p>
            )}
          </div>

          <div>
            <label className="text-base font-semibold text-muted-foreground mb-2 block">
              Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => handleChange('contact_email', e.target.value)}
              placeholder="contact@example.com"
              className={`w-full h-12 px-4 text-base border-2 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all ${
                errors.contact_email ? 'border-red-500' : 'border-border'
              }`}
            />
            {errors.contact_email && (
              <p className="text-red-500 text-sm mt-2">{errors.contact_email}</p>
            )}
          </div>

          <div>
            <label className="text-base font-semibold text-muted-foreground mb-2 block">
              Contact Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => handleChange('contact_phone', e.target.value)}
              placeholder="(555) 123-4567"
              className={`w-full h-12 px-4 text-base border-2 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all ${
                errors.contact_phone ? 'border-red-500' : 'border-border'
              }`}
            />
            {errors.contact_phone && (
              <p className="text-red-500 text-sm mt-2">{errors.contact_phone}</p>
            )}
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