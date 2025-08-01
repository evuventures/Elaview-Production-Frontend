import React from 'react';
import { PropertyFormData } from '@/types/property';

interface ReviewStepProps {
  formData: PropertyFormData;
  onEdit: (step: number) => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ formData, onEdit }) => {
  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Review & Submit
        </h2>
        <p className="text-muted-foreground">
          Please review your property details before submitting.
        </p>
      </div>

      {/* Property Basics Review */}
      <div className="border border-border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Property Basics</h3>
          <button
            type="button"
            onClick={() => onEdit(1)}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">Property Name:</span>
            <p className="mt-1">{formData.property_name || 'Not specified'}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Property Type:</span>
            <p className="mt-1 capitalize">{formData.property_type?.replace('_', ' ') || 'Not specified'}</p>
          </div>
          <div className="md:col-span-2">
            <span className="font-medium text-muted-foreground">Description:</span>
            <p className="mt-1">{formData.description || 'Not specified'}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Total Size:</span>
            <p className="mt-1">{formData.total_sqft ? `${formData.total_sqft.toLocaleString()} sq ft` : 'Not specified'}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Address:</span>
            <p className="mt-1">{formData.location.address || 'Not specified'}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">City:</span>
            <p className="mt-1">{formData.location.city || 'Not specified'}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">ZIP Code:</span>
            <p className="mt-1">{formData.location.zipcode || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Contact Information Review */}
      <div className="border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">Contact Name:</span>
            <p className="mt-1">{formData.contact_name || 'Not specified'}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Email:</span>
            <p className="mt-1">{formData.contact_email || 'Not specified'}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Phone:</span>
            <p className="mt-1">{formData.contact_phone || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Advertising Spaces Review (was Areas) */}
      <div className="border border-border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Advertising Spaces ({(formData.spaces || []).length})</h3>
          <button
            type="button"
            onClick={() => onEdit(2)}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Edit
          </button>
        </div>

        {(formData.spaces || []).length === 0 ? (
          <p className="text-muted-foreground text-sm">No advertising spaces defined</p>
        ) : (
          <div className="space-y-4">
            {(formData.spaces || []).map((area, index) => (
              <div key={area.id} className="border border-border rounded-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Space {index + 1}:</span>
                    <p className="mt-1">{area.name || 'Unnamed space'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Type:</span>
                    <p className="mt-1 capitalize">{area.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Dimensions:</span>
                    <p className="mt-1">{area.dimensions.width}' × {area.dimensions.height}'</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Monthly Rate:</span>
                    <p className="mt-1">${area.monthly_rate?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-muted-foreground">Location:</span>
                    <p className="mt-1">{area.location_description || 'No description'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-muted/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{(formData.spaces || []).length}</p>
            <p className="text-muted-foreground">Advertising Spaces</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {formData.total_sqft ? formData.total_sqft.toLocaleString() : '0'}
            </p>
            <p className="text-muted-foreground">Total Square Feet</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              ${(formData.spaces || []).reduce((sum, area) => sum + (area.monthly_rate || 0), 0).toLocaleString()}
            </p>
            <p className="text-muted-foreground">Total Monthly Potential</p>
          </div>
        </div>
      </div>

      {/* Submission Notice */}
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
            <h3 className="text-sm font-medium text-blue-800">Ready to Submit</h3>
            <p className="mt-1 text-sm text-blue-700">
              Your property listing will be reviewed before being published. You'll receive an email notification once it's approved.
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Step 3 of 3 - Review & Submit</span>
          <span>Ready to submit</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mt-2">
          <div className="bg-primary h-2 rounded-full w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;