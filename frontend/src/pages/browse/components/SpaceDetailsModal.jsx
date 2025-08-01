import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { 
  X, ShoppingCart, Calendar, CheckCircle, Star, Users, MapPin, Eye,
  Package, Upload, Calculator, FileImage, AlertCircle, Info
} from "lucide-react";
import { getAreaName, getAreaType, getAreaPrice, getAreaCategoryIcon } from '../utils/areaHelpers';
import { getBusinessInsights, getTrustIndicators, calculateROI } from '../utils/businessInsights';
import { getNumericPrice } from '../utils/areaHelpers';

// Material Categories based on your Prisma schema
const MATERIAL_CATEGORIES = [
  {
    id: 'VINYL_GRAPHICS',
    name: 'Vinyl Graphics',
    description: 'Versatile vinyl for most surfaces',
    basePrice: 2.50,
    unit: 'sq ft',
    icon: '🎨',
    compatibility: ['WINDOW_GLASS', 'STOREFRONT_WINDOW', 'EXTERIOR_WALL_SMOOTH']
  },
  {
    id: 'PERFORATED_VINYL',
    name: 'Perforated Vinyl',
    description: 'One-way vision for windows',
    basePrice: 3.20,
    unit: 'sq ft',
    icon: '👁️',
    compatibility: ['WINDOW_GLASS', 'STOREFRONT_WINDOW']
  },
  {
    id: 'MESH_BANNERS',
    name: 'Mesh Banners',
    description: 'Wind-resistant outdoor banners',
    basePrice: 1.80,
    unit: 'sq ft',
    icon: '🌬️',
    compatibility: ['BUILDING_EXTERIOR', 'POLE_MOUNT']
  },
  {
    id: 'RIGID_SIGNS',
    name: 'Rigid Signs',
    description: 'Coroplast, PVC, Aluminum signs',
    basePrice: 4.20,
    unit: 'sq ft',
    icon: '🪧',
    compatibility: ['RETAIL_FRONTAGE', 'BUILDING_EXTERIOR', 'POLE_MOUNT']
  },
  {
    id: 'FABRIC_BANNERS',
    name: 'Fabric Banners',
    description: 'Premium fabric displays',
    basePrice: 5.50,
    unit: 'sq ft',
    icon: '🎪',
    compatibility: ['EVENT_SPACE', 'BUILDING_EXTERIOR']
  }
];

export default function EnhancedSpaceDetailsModal({ 
  selectedSpace,
  detailsExpanded,
  setSelectedSpace,
  setDetailsExpanded,
  isInCart,
  addToCart,
  handleBookingNavigation
}) {
  // ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS
  // Material Configuration State
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [dimensions, setDimensions] = useState({ width: '', height: '' });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [configurationValid, setConfigurationValid] = useState(false);
  const [showMaterialConfig, setShowMaterialConfig] = useState(false);

  // Real-time pricing calculation - MOVED BEFORE EARLY RETURN
  useEffect(() => {
    // Only run if we have selectedSpace to avoid errors
    if (selectedSpace) {
      if (selectedMaterial && dimensions.width && dimensions.height) {
        const area = parseFloat(dimensions.width) * parseFloat(dimensions.height);
        const materialCost = area * selectedMaterial.basePrice;
        const spaceCost = getNumericPrice(selectedSpace) || 0;
        setEstimatedCost(materialCost + spaceCost);
      } else {
        setEstimatedCost(getNumericPrice(selectedSpace) || 0);
      }
    }
  }, [selectedMaterial, dimensions, selectedSpace]);

  // Configuration validation - MOVED BEFORE EARLY RETURN
  useEffect(() => {
    const isValid = selectedMaterial && 
                   dimensions.width && 
                   dimensions.height && 
                   parseFloat(dimensions.width) > 0 && 
                   parseFloat(dimensions.height) > 0;
    setConfigurationValid(isValid);
  }, [selectedMaterial, dimensions]);

  // NOW we can safely do early return - all hooks are declared above
  if (!selectedSpace || !detailsExpanded) return null;

  // Rest of component logic
  const roi = calculateROI(selectedSpace, getNumericPrice);
  const insights = getBusinessInsights(selectedSpace.property);
  const trust = getTrustIndicators(selectedSpace.property);
  const IconComponent = getAreaCategoryIcon(selectedSpace);

  // Get compatible materials based on space surface type
  const compatibleMaterials = MATERIAL_CATEGORIES.filter(material => 
    material.compatibility.includes(selectedSpace.surfaceType || 'OTHER')
  );

  const closeModal = () => {
    setSelectedSpace(null);
    setDetailsExpanded(false);
    // Reset configuration state
    setSelectedMaterial(null);
    setDimensions({ width: '', height: '' });
    setUploadedFile(null);
    setShowMaterialConfig(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (validTypes.includes(file.type)) {
        setUploadedFile({
          file: file,
          name: file.name,
          size: file.size,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        });
      } else {
        alert('Please upload JPG, PNG, or PDF files only.');
      }
    }
  };

  const handleAddToCartWithConfiguration = () => {
    if (!configurationValid) {
      alert('Please complete material configuration before adding to cart.');
      return;
    }

    const configuredSpace = {
      ...selectedSpace,
      materialConfiguration: {
        material: selectedMaterial,
        dimensions: dimensions,
        uploadedFile: uploadedFile,
        estimatedCost: estimatedCost,
        configuredAt: new Date().toISOString()
      }
    };

    addToCart(configuredSpace);
    closeModal();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-x-0 top-16 bottom-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden"
        onClick={closeModal}
      >
        {/* Enhanced Modal Container - Larger for material config */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="
            w-full 
            max-w-[min(95vw,1600px)]
            h-[min(90vh,900px)]
            bg-white 
            rounded-xl 
            sm:rounded-2xl 
            overflow-hidden 
            shadow-2xl 
            border 
            border-slate-200 
            flex 
            flex-col
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-slate-25 border-b border-slate-200 p-3 sm:p-4 lg:p-6 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 truncate">
                    {getAreaName(selectedSpace)}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-teal-500 text-white flex-shrink-0">
                    <IconComponent className="w-3 h-3" />
                    {getAreaType(selectedSpace)}
                  </span>
                </div>
                <p className="text-sm sm:text-base lg:text-lg text-slate-600 flex items-center gap-1 truncate">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">
                    {selectedSpace.propertyName} • {selectedSpace.propertyAddress}
                  </span>
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 flex-shrink-0 ml-3"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>

          {/* Main Content - Enhanced Layout */}
          <div className="flex flex-col lg:flex-row flex-1 min-h-0">
            
            {/* Left Side - Image and Basic Details */}
            <div className="w-full lg:w-2/5 p-3 sm:p-4 lg:p-6 lg:pr-3">
              {/* Image */}
              <div 
                className="relative w-full rounded-lg sm:rounded-xl overflow-hidden bg-slate-100 mb-4"
                style={{ aspectRatio: '16/9', minHeight: 'clamp(200px, 25vh, 300px)' }}
              >
                <img 
                  src={selectedSpace.images || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'} 
                  alt={getAreaName(selectedSpace)}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800';
                  }}
                />
                
                {trust?.verified && (
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-success-500 text-white shadow-soft">
                      <CheckCircle className="w-3 h-3" />
                      <span className="hidden sm:inline">Verified</span>
                    </span>
                  </div>
                )}
                
                <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4">
                  <span className="bg-slate-900/90 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg font-bold shadow-soft backdrop-blur-sm text-sm sm:text-base">
                    {getAreaPrice(selectedSpace)}
                  </span>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3">Key Metrics</h3>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-center text-success-600 mb-1">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="text-xl font-bold text-success-600">
                      {(insights.footTraffic/1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-slate-600">Daily Traffic</div>
                  </div>
                  
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-center text-teal-600 mb-1">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div className="text-xl font-bold text-teal-600">
                      {roi.estimatedReach.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600">Monthly Reach</div>
                  </div>
                </div>
                
                {trust.rating && (
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <span className="text-sm text-slate-600">Business Rating</span>
                    <div className="flex items-center text-amber-500">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      <span className="font-semibold">{trust.rating}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Material Configuration */}
            <div className="w-full lg:w-3/5 p-3 sm:p-4 lg:p-6 lg:pl-3 flex flex-col min-h-0 overflow-y-auto">
              
              {/* Configuration Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Configure Your Advertisement</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMaterialConfig(!showMaterialConfig)}
                    className="text-teal-600 border-teal-200 hover:bg-teal-50"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    {showMaterialConfig ? 'Hide Config' : 'Configure Materials'}
                  </Button>
                </div>

                {/* Quick Add Option */}
                {!showMaterialConfig && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800 font-medium mb-1">Quick Add to Cart</p>
                        <p className="text-xs text-blue-700">
                          Add this space to cart now and configure materials later during checkout.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Material Configuration Panel */}
              <AnimatePresence>
                {showMaterialConfig && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6 mb-6"
                  >
                    {/* Material Selection */}
                    <div>
                      <h4 className="text-base font-semibold text-slate-800 mb-3">
                        Select Material Type
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {compatibleMaterials.map((material) => (
                          <div
                            key={material.id}
                            onClick={() => setSelectedMaterial(material)}
                            className={`
                              p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                              ${selectedMaterial?.id === material.id 
                                ? 'border-teal-500 bg-teal-50' 
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                              }
                            `}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{material.icon}</span>
                                <span className="font-medium text-slate-800">{material.name}</span>
                              </div>
                              <span className="text-sm font-bold text-teal-600">
                                ${material.basePrice}/{material.unit}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">{material.description}</p>
                          </div>
                        ))}
                      </div>
                      
                      {compatibleMaterials.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No compatible materials found for this space type.</p>
                        </div>
                      )}
                    </div>

                    {/* Dimensions Input */}
                    {selectedMaterial && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <h4 className="text-base font-semibold text-slate-800 mb-3">
                          Set Dimensions
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Width (ft)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={dimensions.width}
                              onChange={(e) => setDimensions(prev => ({ ...prev, width: e.target.value }))}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              placeholder="e.g., 8.0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Height (ft)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={dimensions.height}
                              onChange={(e) => setDimensions(prev => ({ ...prev, height: e.target.value }))}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              placeholder="e.g., 6.0"
                            />
                          </div>
                        </div>
                        
                        {dimensions.width && dimensions.height && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calculator className="w-4 h-4" />
                              <span>
                                Total Area: {(parseFloat(dimensions.width) * parseFloat(dimensions.height)).toFixed(1)} sq ft
                              </span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* File Upload */}
                    {configurationValid && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <h4 className="text-base font-semibold text-slate-800 mb-3">
                          Upload Creative File (Optional)
                        </h4>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                          {uploadedFile ? (
                            <div className="space-y-3">
                              {uploadedFile.preview && (
                                <img 
                                  src={uploadedFile.preview} 
                                  alt="Preview" 
                                  className="max-w-32 max-h-32 mx-auto rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium text-slate-800">{uploadedFile.name}</p>
                                <p className="text-sm text-slate-500">
                                  {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setUploadedFile(null)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                Remove File
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                              <p className="text-sm font-medium text-slate-600 mb-1">
                                Upload your design file
                              </p>
                              <p className="text-xs text-slate-500 mb-4">
                                JPG, PNG, or PDF (Max 10MB)
                              </p>
                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="file-upload"
                              />
                              <label
                                htmlFor="file-upload"
                                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer transition-colors"
                              >
                                <FileImage className="w-4 h-4 mr-2" />
                                Choose File
                              </label>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Real-time Pricing */}
                    {selectedMaterial && dimensions.width && dimensions.height && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-4"
                      >
                        <h4 className="text-base font-semibold text-slate-800 mb-3">
                          Estimated Pricing
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Space rental:</span>
                            <span className="font-medium">${getNumericPrice(selectedSpace) || 0}/day</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">
                              Material ({(parseFloat(dimensions.width) * parseFloat(dimensions.height)).toFixed(1)} sq ft):
                            </span>
                            <span className="font-medium">
                              ${((parseFloat(dimensions.width) * parseFloat(dimensions.height)) * selectedMaterial.basePrice).toFixed(2)}
                            </span>
                          </div>
                          <div className="border-t border-slate-300 pt-2">
                            <div className="flex justify-between">
                              <span className="font-semibold text-slate-800">Total per day:</span>
                              <span className="font-bold text-lg text-teal-600">
                                ${estimatedCost.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex-shrink-0 mt-auto">
                <div className="grid grid-cols-1 gap-3">
                  {!isInCart(selectedSpace.id) ? (
                    <>
                      {/* Configured Add to Cart */}
                      {showMaterialConfig && configurationValid && (
                        <Button 
                          className="btn-primary w-full h-12 text-base font-semibold"
                          onClick={handleAddToCartWithConfiguration}
                        >
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Add Configured Space to Cart • ${estimatedCost.toFixed(2)}/day
                        </Button>
                      )}
                      
                      {/* Quick Add to Cart */}
                      {(!showMaterialConfig || !configurationValid) && (
                        <Button 
                          className="btn-secondary w-full h-12 text-base font-semibold"
                          onClick={() => {
                            addToCart(selectedSpace);
                            closeModal();
                          }}
                        >
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Quick Add to Cart
                        </Button>
                      )}
                      
                      {/* Configuration Warning */}
                      {showMaterialConfig && !configurationValid && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <p className="text-sm text-amber-800">
                            Complete material selection and dimensions to add configured space to cart.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <Button 
                      className="btn-secondary bg-success-50 text-success-700 border-success-200 w-full h-12 text-base font-semibold"
                      disabled
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Already in Cart
                    </Button>
                  )}
                  
                  {/* Book Now */}
                  <Button 
                    onClick={() => handleBookingNavigation(selectedSpace)}
                    className="btn-outline w-full h-12 text-base font-semibold"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}