import React from 'react';
import { PropertyFormData, AdvertisingArea, defaultArea } from '@/types/property';

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
    const newArea = defaultArea();
    setFormData(prev => ({
      ...prev,
      advertising_areas: [...prev.advertising_areas, newArea]
    }));
  };

  const removeArea = (id: string) => {
    setFormData(prev => ({
      ...prev,
      advertising_areas: prev.advertising_areas.filter(area => area.id !== id)
    }));
  };

  const updateArea = (id: string, updates: Partial<AdvertisingArea>) => {
    setFormData(prev => ({
      ...prev,
      advertising_areas: prev.advertising_areas.map(area =>
        area.id === id ? { ...area, ...updates } : area
      )
    }));
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Advertising Areas
        </h2>
        <p className="text-muted-foreground">
          Define the advertising spaces available at your property.
        </p>
      </div>

      {/* Areas List */}
      <div className="space-y-6">
        {formData.advertising_areas.map((area, index) => (
          <div key={area.id} className="border border-border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Area {index + 1}</h3>
              {formData.advertising_areas.length > 1 && (
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
                  Area Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={area.name}
                  onChange={(e) => updateArea(area.id, { name: e.target.value })}
                  placeholder="e.g., Lobby Billboard"
                  className="w-full h-10 px-3 text-sm border border-border rounded-md bg-background"
                />
              </div>

              {/* Area Type */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={area.type}
                  onChange={(e) => updateArea(area.id, { type: e.target.value as any })}
                  className="w-full h-10 px-3 text-sm border border-border rounded-md bg-background"
                >
                  <option value="billboard">Billboard</option>
                  <option value="digital_display">Digital Display</option>
                  <option value="wall_graphic">Wall Graphic</option>
                  <option value="floor_graphic">Floor Graphic</option>
                  <option value="window_display">Window Display</option>
                  <option value="other">Other</option>
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
                  Location Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={area.location_description}
                  onChange={(e) => updateArea(area.id, { location_description: e.target.value })}
                  placeholder="Describe where this advertising area is located within your property..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background resize-none"
                />
              </div>
            </div>
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
          + Add Another Area
        </button>
      </div>

      {/* Errors */}
      {errors.advertising_areas && (
        <div className="text-red-500 text-sm">{errors.advertising_areas}</div>
      )}

      {/* Progress */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Step 2 of 3 - Advertising Areas</span>
          <span>{formData.advertising_areas.length} area(s) defined</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mt-2">
          <div className="bg-primary h-2 rounded-full w-2/3"></div>
        </div>
      </div>
    </div>
  );
};

export default AdvertisingAreasStep;