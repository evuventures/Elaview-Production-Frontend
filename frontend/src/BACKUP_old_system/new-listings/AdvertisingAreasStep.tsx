// src/components/new-listings/AdvertisingAreasStep.tsx
import React from 'react';
import { PropertyFormData, Space, defaultSpace } from '@/types/property';

interface AdvertisingAreasStepProps {
 formData: PropertyFormData;
 setFormData: React.Dispatch<React.SetStateAction<PropertyFormData>>;
 errors: Record<string, string | null>;
 setErrors: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
}

const AdvertisingAreasStep: React.FC<AdvertisingAreasStepProps> = ({
 formData,
 setFormData,
 errors,
 setErrors
}) => {
 const addArea = () => {
 console.log('🚀 MIGRATION: Adding new space (was area)');
 const newSpace = defaultSpace();
 setFormData(prev => ({
 ...prev,
 spaces: [...(prev.spaces || []), newSpace]
 }));
 };

 const removeArea = (id: string) => {
 console.log('🚀 MIGRATION: Removing space (was area):', id);
 setFormData(prev => ({
 ...prev,
 spaces: (prev.spaces || []).filter(space => space.id !== id)
 }));
 };

 const updateArea = (id: string, updates: Partial<Space>) => {
 console.log('🚀 MIGRATION: Updating space (was area):', id, updates);
 setFormData(prev => {
 const updatedSpaces = (prev.spaces || []).map(space =>
 space.id === id ? { ...space, ...updates } : space
 );
 return {
 ...prev,
 spaces: updatedSpaces
 };
 });
 };

 // Space type options aligned with backend enum
 const getAdvertisingOptions = () => {
 return [
 { value: 'storefront_window', label: 'Storefront Window' },
 { value: 'building_exterior', label: 'Building Exterior' },
 { value: 'event_space', label: 'Event Space' },
 { value: 'retail_frontage', label: 'Retail Frontage' },
 { value: 'pole_mount', label: 'Pole Mount' },
 { value: 'other', label: 'Other' }
 ];
 };

 const advertisingOptions = getAdvertisingOptions();
 const isSemiTruck = formData.property_type === 'VEHICLE_FLEET';

 return (
 <div className="space-y-8">
 {/* Step Header */}
 <div>
 <h2 className="text-2xl font-bold text-foreground mb-2">
 {isSemiTruck ? 'Vehicle Advertising Spaces' : 'Advertising Areas'}
 </h2>
 <p className="text-muted-foreground">
 {isSemiTruck 
 ? 'Define the advertising spaces available on this vehicle.'
 : 'Define the advertising spaces available at your property.'
 }
</p>
 </div>

 {/* Property Type Notice */}
 {isSemiTruck && (
 <div className="bg-green-50 border border-green-200 rounded-lg p-4">
 <div className="flex items-start">
 <div className="flex-shrink-0">
 <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
 </svg>
 </div>
 <div className="ml-3">
 <h3 className="text-sm font-medium text-green-800">Single Vehicle Advertising</h3>
 <p className="mt-1 text-sm text-green-700">
 You're setting up advertising spaces for one vehicle. This vehicle can have multiple advertising areas (side panels, rear, wraps, etc.).
 </p>
 </div>
 </div>
 </div>
)}

 {/* Spaces List (was Areas List) */}
 <div className="space-y-6">
 {(formData.spaces || []).map((area, index) => (
 <div key={area.id} className="border border-border rounded-lg p-6">
 <div className="flex justify-between items-start mb-4">
 <h3 className="text-lg font-semibold">
 {isSemiTruck ? `Vehicle Space ${index + 1}` : `Area ${index + 1}`}
 </h3>
 {(formData.spaces || []).length> 1 && (
 <button
 type="button"
 onClick={() => removeArea(area.id)}
 className="text-red-500 hover:text-red-700 text-sm"
>
 Remove
 </button>
 )}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Area Name */}
 <div>
 <label className="text-sm font-medium text-muted-foreground mb-2 block">
 {isSemiTruck ? 'Space Name' : 'Area Name'} <span className="text-red-500">*</span>
 </label>
 <input
 type="text"
 value={area.name}
 onChange={(e) => updateArea(area.id, { name: e.target.value })}
 placeholder={
 isSemiTruck 
 ? "e.g., Driver Side Panel, Rear Door"
 : "e.g., Lobby Billboard, Main Entrance"
 }
 className="w-full h-10 px-3 text-sm border border-border rounded-md bg-background"
 />
 </div>

 {/* Area Type - DYNAMIC OPTIONS */}
 <div>
 <label className="text-sm font-medium text-muted-foreground mb-2 block">
 Type <span className="text-red-500">*</span>
 </label>
 <select
 value={area.type}
 onChange={(e) => updateArea(area.id, { type: e.target.value as any })}
 className="w-full h-10 px-3 text-sm border border-border rounded-md bg-background"
>
 <option value="">Select Type</option>
 {advertisingOptions.map(option => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </select>
 </div>

 {/* Dimensions */}
 <div>
 <label className="text-sm font-medium text-muted-foreground mb-2 block">
 Width (ft) <span className="text-red-500">*</span>
 </label>
 <input
 type="number"
 value={area.dimensions.width || ''}
 onChange={(e) => updateArea(area.id, { 
 dimensions: { ...area.dimensions, width: parseFloat(e.target.value) || 0 }
 })}
 placeholder="Width"
 min="0"
 step="0.1"
 className="w-full h-10 px-3 text-sm border border-border rounded-md bg-background"
 />
 </div>

 <div>
 <label className="text-sm font-medium text-muted-foreground mb-2 block">
 Height (ft) <span className="text-red-500">*</span>
 </label>
 <input
 type="number"
 value={area.dimensions.height || ''}
 onChange={(e) => updateArea(area.id, { 
 dimensions: { ...area.dimensions, height: parseFloat(e.target.value) || 0 }
 })}
 placeholder="Height"
 min="0"
 step="0.1"
 className="w-full h-10 px-3 text-sm border border-border rounded-md bg-background"
 />
 </div>

 {/* Monthly Rate */}
 <div>
 <label className="text-sm font-medium text-muted-foreground mb-2 block">
 Monthly Rate ($) <span className="text-red-500">*</span>
 </label>
 <input
 type="number"
 value={area.monthly_rate || ''}
 onChange={(e) => updateArea(area.id, { monthly_rate: parseFloat(e.target.value) || 0 })}
 placeholder="Monthly rate"
 min="0"
 className="w-full h-10 px-3 text-sm border border-border rounded-md bg-background"
 />
 </div>

 {/* Location Description */}
 <div className="md:col-span-2">
 <label className="text-sm font-medium text-muted-foreground mb-2 block">
 {isSemiTruck ? 'Location on Vehicle' : 'Location Description'} <span className="text-red-500">*</span>
 </label>
 <textarea
 value={area.location_description}
 onChange={(e) => updateArea(area.id, { location_description: e.target.value })}
 placeholder={
 isSemiTruck
 ? "Describe where this advertising space is located on the vehicle (e.g., 'Driver side panel, visible from highway traffic')"
 : "Describe where this advertising area is located within your property..."
 }
 rows={3}
 className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background resize-none"
 />
 </div>
 </div>

 {/* Semi-Truck Specific Help */}
 {isSemiTruck && (
 <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
 <p className="text-xs text-blue-700">
 <strong>Tip:</strong> Consider visibility, traffic exposure, and viewing angles when describing the location. 
 Think about highway routes, urban areas, parking locations, or specific traffic patterns where this vehicle travels.
 </p>
 </div>
)}
 </div>
 ))}
 </div>

 {/* Add Area Button */}
 <div className="text-center">
 <button
 type="button"
 onClick={addArea}
 className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
>
 + Add Another {isSemiTruck ? 'Advertising Space' : 'Area'}
</button>
 </div>

 {/* Errors */}
 {errors.spaces && (
 <div className="text-red-500 text-sm">{errors.spaces}</div>
 )}

 {/* Progress */}
 <div className="bg-muted/30 rounded-lg p-4">
 <div className="flex items-center justify-between text-sm text-muted-foreground">
 <span>Step 2 of 3 - {isSemiTruck ? 'Vehicle Advertising Spaces' : 'Advertising Areas'}</span>
 <span>{(formData.spaces || []).length} {isSemiTruck ? 'advertising space(s)' : 'area(s)'} defined</span>
 </div>
 <div className="w-full bg-muted rounded-full h-2 mt-2">
 <div className="bg-primary h-2 rounded-full w-2/3"></div>
 </div>
</div>
 </div>
 );
};

export default AdvertisingAreasStep;