import React from 'react';
import { 
  X, Building2, Package, Calculator, FileImage, Camera, CheckCircle 
} from 'lucide-react';
import { MaterialSelectionModalProps } from '../types';
import { filterCompatibleMaterials, calculateArea, isBookingDataComplete } from '../utils';

export const MaterialSelectionModal: React.FC<MaterialSelectionModalProps> = ({
  selectedSpace,
  showModal,
  availableMaterials,
  materialsLoading,
  selectedMaterial,
  customDimensions,
  uploadedCreative,
  onClose,
  onMaterialSelect,
  onDimensionsChange,
  onCreativeUpload,
  onConfirmBooking,
  calculateTotalCost,
  calculateMaterialCost
}) => {
  if (!selectedSpace || !showModal) return null;

  const compatibleMaterials = filterCompatibleMaterials(availableMaterials, selectedSpace);
  const totalCost = calculateTotalCost();
  const area = calculateArea(customDimensions.width, customDimensions.height);
  const isComplete = isBookingDataComplete(selectedSpace, selectedMaterial, customDimensions, uploadedCreative);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Book Space + Materials</h2>
              <p className="text-teal-100">Complete your campaign setup in one step</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-teal-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Space Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-gray-600" />
                Selected Space
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Location</p>
                  <p className="font-medium">{selectedSpace.name || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{selectedSpace.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Space Details</p>
                  <p className="font-medium">{selectedSpace.dimensions || 'N/A'}</p>
                  <p className="text-xs text-gray-500">
                    {selectedSpace.surfaceType?.replace(/_/g, ' ') || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Monthly Rate</p>
                  <p className="font-medium">
                    {typeof selectedSpace.price === 'number' ? `$${selectedSpace.price}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Availability</p>
                  <p className="font-medium text-green-600">{selectedSpace.availability || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Material Selection */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center">
                <Package className="w-5 h-5 mr-2 text-gray-600" />
                Select Material Type
              </h3>
              {materialsLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Loading materials...</p>
                </div>
              ) : compatibleMaterials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {compatibleMaterials.map((material) => (
                    <label 
                      key={material.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedMaterial?.id === material.id 
                          ? 'border-teal-500 bg-teal-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="material" 
                        className="sr-only"
                        checked={selectedMaterial?.id === material.id}
                        onChange={() => onMaterialSelect(material)}
                      />
                      <div className="flex items-start">
                        <img 
                          src={material.imageUrl || 'https://via.placeholder.com/100'}
                          alt={material.name}
                          className="w-16 h-16 rounded object-cover mr-3"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{material.name || 'N/A'}</p>
                          <p className="text-sm text-gray-600 mt-1">{material.description || 'N/A'}</p>
                          <div className="mt-2 text-xs text-gray-500">
                            <p>Installation: {material.skillLevel?.replace(/_/g, ' ').toLowerCase() || 'N/A'}</p>
                            <p className="font-medium text-blue-600">
                              ${material.pricePerUnit || 'N/A'}/sq ft
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No compatible materials available</p>
                </div>
              )}
            </div>

            {/* Custom Dimensions */}
            {selectedMaterial && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-gray-600" />
                  Specify Dimensions
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Width (feet)
                      </label>
                      <input
                        type="number"
                        value={customDimensions.width}
                        onChange={(e) => onDimensionsChange({...customDimensions, width: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="e.g., 8"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height (feet)
                      </label>
                      <input
                        type="number"
                        value={customDimensions.height}
                        onChange={(e) => onDimensionsChange({...customDimensions, height: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="e.g., 4"
                      />
                    </div>
                  </div>
                  {area > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Total area: {area.toFixed(1)} sq ft
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Creative Upload */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center">
                <FileImage className="w-5 h-5 mr-2 text-gray-600" />
                Upload Your Design
              </h3>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                uploadedCreative ? 'border-green-400 bg-green-50' : 'border-gray-300'
              }`}>
                {!uploadedCreative ? (
                  <>
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Drag and drop your design here</p>
                    <p className="text-sm text-gray-500 mb-3">
                      Recommended: High resolution, {customDimensions.width && customDimensions.height 
                        ? `${customDimensions.width}ft x ${customDimensions.height}ft`
                        : 'matching your dimensions'
                      }
                    </p>
                    <button 
                      onClick={onCreativeUpload}
                      className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                    >
                      Choose File
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                    <span className="text-green-600 font-medium">Design uploaded successfully</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cost Summary */}
            {selectedMaterial && customDimensions.width && customDimensions.height && (
              <div className="bg-teal-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Cost Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Space Rental (1 month)</span>
                    <span>${selectedSpace.price || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Material + Printing</span>
                    <span>${calculateMaterialCost(selectedMaterial, customDimensions)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee (5%)</span>
                    <span>${(totalCost * 0.05 / 1.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-teal-200">
                    <span>Total</span>
                    <span className="text-green-600">${totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirmBooking}
              disabled={!isComplete}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                isComplete
                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};