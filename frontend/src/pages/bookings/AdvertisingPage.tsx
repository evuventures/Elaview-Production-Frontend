// Advertiser Dashboard - MVP Version with Real Data
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  Search, MapPin, Upload, Package, DollarSign,
  Calendar, Eye, Download, Clock, CheckCircle,
  Calculator, FileImage, ShoppingCart, Info,
  Truck, AlertCircle, Navigation, Building2,
  Camera, ChevronRight, X, Plus
} from 'lucide-react';

// Import your apiClient
// import apiClient from '@/api/apiClient';

// For demo purposes, mock the apiClient
const apiClient = {
  getAdvertiserDashboard: async () => {
    console.log('🚨 NOT FETCHING - Using mock apiClient. Import real apiClient!');
    throw new Error('NOT FETCHING - Real apiClient not imported');
  },
  getMaterialsCatalog: async () => {
    console.log('🚨 NOT FETCHING - Using mock apiClient. Import real apiClient!');
    throw new Error('NOT FETCHING - Real apiClient not imported');
  },
  searchAvailableSpaces: async () => {
    console.log('🚨 NOT FETCHING - Using mock apiClient. Import real apiClient!');
    throw new Error('NOT FETCHING - Real apiClient not imported');
  },
  createBookingWithMaterials: async (data) => {
    console.log('🚨 NOT FETCHING - Would create booking with:', data);
    throw new Error('NOT FETCHING - Real apiClient not imported');
  }
};

export default function AdvertiserDashboardMVP() {
  const { user, isLoaded: userLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [expandedBooking, setExpandedBooking] = useState(null);
  
  // Real data states
  const [stats, setStats] = useState({
    totalSpent: 0,
    activeCampaigns: 0,
    pendingMaterials: 0,
    completedCampaigns: 0
  });
  const [bookings, setBookings] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [spacesLoading, setSpacesLoading] = useState(false);

  // Material selection states
  const [uploadedCreative, setUploadedCreative] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [customDimensions, setCustomDimensions] = useState({ width: '', height: '' });

  // Fetch dashboard data on mount
  useEffect(() => {
    console.log('👤 User loaded:', userLoaded, 'User ID:', user?.id);
    if (userLoaded && user?.id) {
      fetchDashboardData();
      fetchMaterialsCatalog();
    } else if (userLoaded && !user) {
      console.error('❌ User not authenticated');
      setError('Please sign in to view your dashboard');
      setIsLoading(false);
    }
  }, [userLoaded, user?.id]);

  // Fetch spaces when browse tab is active
  useEffect(() => {
    if (activeTab === 'browse' && searchResults.length === 0) {
      fetchAvailableSpaces();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching advertiser dashboard data for user:', user.id);
      const response = await apiClient.getAdvertiserDashboard();
      
      if (response.success) {
        console.log('✅ Dashboard data received:', response.data);
        setStats(response.data.stats || {
          totalSpent: 0,
          activeCampaigns: 0,
          pendingMaterials: 0,
          completedCampaigns: 0
        });
        setBookings(response.data.bookings || []);
      } else {
        console.error('❌ Dashboard fetch failed:', response.error);
        setError(response.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('❌ Dashboard error:', err);
      setError('Failed to load dashboard data. Please try again.');
      
      // Show NOT FETCHING indicators
      setStats({
        totalSpent: 'NOT FETCHING',
        activeCampaigns: 'NOT FETCHING',
        pendingMaterials: 'NOT FETCHING',
        completedCampaigns: 'NOT FETCHING'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMaterialsCatalog = async () => {
    setMaterialsLoading(true);
    
    try {
      console.log('📦 Fetching materials catalog...');
      const response = await apiClient.getMaterialsCatalog();
      
      if (response.success) {
        console.log('✅ Materials catalog received:', response.data);
        setAvailableMaterials(response.data.materials || []);
      } else {
        console.error('❌ Materials fetch failed:', response.error);
      }
    } catch (err) {
      console.error('❌ Materials error:', err);
      setAvailableMaterials([]);
    } finally {
      setMaterialsLoading(false);
    }
  };

  const fetchAvailableSpaces = async (filters = {}) => {
    setSpacesLoading(true);
    
    try {
      console.log('🔍 Fetching available spaces...');
      const response = await apiClient.searchAvailableSpaces(filters);
      
      if (response.success) {
        console.log('✅ Available spaces received:', response.data);
        setSearchResults(response.data.spaces || []);
      } else {
        console.error('❌ Spaces fetch failed:', response.error);
      }
    } catch (err) {
      console.error('❌ Spaces error:', err);
      setSearchResults([]);
    } finally {
      setSpacesLoading(false);
    }
  };

  // Calculate material cost based on dimensions
  const calculateMaterialCost = (material, dimensions) => {
    if (!dimensions.width || !dimensions.height || !material) return 0;
    const sqFt = (parseFloat(dimensions.width) * parseFloat(dimensions.height));
    const materialCost = sqFt * (material.pricePerUnit || 0);
    const markup = materialCost * 0.15; // 15% markup
    return Math.round((materialCost + markup) * 100) / 100;
  };

  // Handle booking with materials
  const handleBookingConfirm = async () => {
    if (!selectedSpace || !selectedMaterial || !customDimensions.width || !customDimensions.height || !uploadedCreative) {
      console.error('❌ Missing required booking data');
      return;
    }

    const bookingData = {
      spaceId: selectedSpace.id,
      propertyId: selectedSpace.propertyId,
      materialItemId: selectedMaterial.id,
      dimensions: customDimensions,
      designFileUrl: uploadedCreative,
      totalCost: calculateTotalCost()
    };

    try {
      console.log('📋 Creating booking with materials:', bookingData);
      const response = await apiClient.createBookingWithMaterials(bookingData);
      
      if (response.success) {
        console.log('✅ Booking created successfully');
        alert('Booking confirmed! You will receive installation instructions via email.');
        setShowMaterialModal(false);
        fetchDashboardData(); // Refresh data
      } else {
        console.error('❌ Booking creation failed:', response.error);
        alert('Failed to create booking. Please try again.');
      }
    } catch (err) {
      console.error('❌ Booking error:', err);
      alert('Failed to create booking. Please try again.');
    }
  };

  const calculateTotalCost = () => {
    if (!selectedSpace || !selectedMaterial) return 0;
    const spaceCost = selectedSpace.price || 0;
    const materialCost = calculateMaterialCost(selectedMaterial, customDimensions);
    const subtotal = spaceCost + materialCost;
    const platformFee = subtotal * 0.05;
    return subtotal + platformFee;
  };

  // Enhanced Stat Card Component
  const StatCard = ({ icon: Icon, value, label, color, subValue, actionText, onAction }) => {
    const colorClasses = {
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      teal: 'bg-teal-100 text-teal-600'
    };

    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          {actionText && (
            <button 
              onClick={onAction}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              {actionText}
            </button>
          )}
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {value === 'NOT FETCHING' ? (
            <span className="text-red-500 text-sm">NOT FETCHING</span>
          ) : (
            typeof value === 'number' && label.includes('Spent') ? `$${value.toLocaleString()}` : value
          )}
        </p>
        <p className="text-sm text-gray-600">{label}</p>
        {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
      </div>
    );
  };

  // Space Search Card Component (integrates with browse page)
  const SpaceSearchCard = ({ space, onSelect }) => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
        <img 
          src={space.imageUrl || 'https://via.placeholder.com/300x200'} 
          alt={space.name || 'Space'}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1">
            {space.name || 'NOT FETCHING - Space Name'}
          </h3>
          <p className="text-sm text-gray-600 mb-3 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {space.location || 'NOT FETCHING - Location'}
          </p>
          
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Dimensions:</span>
              <span className="font-medium">{space.dimensions || 'NOT FETCHING'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Space Rental:</span>
              <span className="font-medium">
                {typeof space.price === 'number' ? `$${space.price}/month` : 'NOT FETCHING'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Est. Materials:</span>
              <span className="font-medium text-blue-600">
                {typeof space.estimatedMaterialCost === 'number' ? `$${space.estimatedMaterialCost}` : 'NOT FETCHING'}
              </span>
            </div>
            <div className="pt-2 border-t">
              <span className="text-gray-600">Total Estimated:</span>
              <span className="font-bold text-lg text-green-600 float-right">
                {typeof space.price === 'number' && typeof space.estimatedMaterialCost === 'number' 
                  ? `$${space.price + space.estimatedMaterialCost}`
                  : 'NOT FETCHING'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <button 
              onClick={() => onSelect(space)}
              className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Book Space + Materials
            </button>
            <button 
              onClick={() => window.location.href = '/browse'}
              className="w-full text-teal-600 hover:text-teal-700 text-sm font-medium"
            >
              View in Browse →
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Booking Card with Material Tracking
  const BookingCard = ({ booking }) => {
    const isExpanded = expandedBooking === booking.id;
    
    const getStatusBadge = (status) => {
      const badges = {
        'materials_ordered': {
          color: 'bg-blue-100 text-blue-800',
          icon: Package,
          text: 'Materials Ordered'
        },
        'materials_shipped': {
          color: 'bg-purple-100 text-purple-800',
          icon: Truck,
          text: 'Materials Shipped'
        },
        'active': {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          text: 'Campaign Active'
        }
      };
      
      const badge = badges[status] || badges['active'];
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
          <badge.icon className="w-3 h-3 mr-1" />
          {badge.text}
        </span>
      );
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
        <div 
          className="p-4 cursor-pointer"
          onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">
                {booking.spaceName || 'NOT FETCHING - Space Name'}
              </h3>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                {booking.location || 'NOT FETCHING - Location'}
              </p>
            </div>
            {getStatusBadge(booking.status || 'active')}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Campaign Period</p>
              <p className="font-medium">
                {booking.startDate && booking.endDate 
                  ? `${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}`
                  : 'NOT FETCHING - Dates'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Total Cost</p>
              <p className="font-bold text-green-600">
                {typeof booking.totalCost === 'number' ? `$${booking.totalCost}` : 'NOT FETCHING'}
              </p>
            </div>
          </div>

          {booking.materialStatus === 'SHIPPED' && booking.estimatedDelivery && (
            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800 flex items-center">
                <Truck className="w-3 h-3 mr-1" />
                Materials arriving by {new Date(booking.estimatedDelivery).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="space-y-4">
              {/* Cost Breakdown */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Cost Breakdown</h4>
                <div className="bg-white rounded p-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Space Rental</span>
                    <span>${booking.spaceCost || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Materials ({booking.materialType || 'N/A'})</span>
                    <span>${booking.materialCost || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee (5%)</span>
                    <span>${booking.platformFee?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total</span>
                    <span className="text-green-600">${booking.totalCost || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Material & Shipping Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Material Details</h4>
                <div className="bg-white rounded p-3 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-600">Type</p>
                      <p className="font-medium">{booking.materialType || 'NOT FETCHING'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Dimensions</p>
                      <p className="font-medium">{booking.dimensions || 'NOT FETCHING'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Order Status</p>
                      <p className="font-medium text-blue-600">{booking.materialStatus || 'NOT FETCHING'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Installation</p>
                      <p className="font-medium">{booking.installationStatus || 'NOT FETCHING'}</p>
                    </div>
                  </div>
                  {booking.trackingNumber && (
                    <div className="pt-2 border-t">
                      <p className="text-gray-600">Tracking</p>
                      <a 
                        href={booking.trackingUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-medium text-xs"
                      >
                        {booking.trackingNumber}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={() => console.log('👁️ View details for booking:', booking.id)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm inline-flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </button>
                <button 
                  onClick={() => console.log('📥 Download install guide for:', booking.id)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm inline-flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Install Guide
                </button>
                <button 
                  onClick={() => console.log('🖼️ View design for:', booking.id)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm inline-flex items-center justify-center"
                >
                  <FileImage className="w-4 h-4 mr-1" />
                  View Design
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Material Selection Modal (integrates with booking flow)
  const MaterialSelectionModal = () => {
    if (!selectedSpace || !showMaterialModal) return null;

    const compatibleMaterials = availableMaterials.filter(material => 
      selectedSpace.materialCompatibility?.includes(material.category)
    );

    const totalCost = calculateTotalCost();

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
                onClick={() => {
                  setShowMaterialModal(false);
                  setSelectedMaterial(null);
                  setCustomDimensions({ width: '', height: '' });
                  setUploadedCreative(null);
                }}
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
                    <p className="font-medium">{selectedSpace.name || 'NOT FETCHING'}</p>
                    <p className="text-xs text-gray-500">{selectedSpace.address || 'NOT FETCHING'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Space Details</p>
                    <p className="font-medium">{selectedSpace.dimensions || 'NOT FETCHING'}</p>
                    <p className="text-xs text-gray-500">
                      {selectedSpace.surfaceType?.replace(/_/g, ' ') || 'NOT FETCHING'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Monthly Rate</p>
                    <p className="font-medium">
                      {typeof selectedSpace.price === 'number' ? `$${selectedSpace.price}` : 'NOT FETCHING'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Availability</p>
                    <p className="font-medium text-green-600">{selectedSpace.availability || 'NOT FETCHING'}</p>
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
                          onChange={() => setSelectedMaterial(material)}
                        />
                        <div className="flex items-start">
                          <img 
                            src={material.imageUrl || 'https://via.placeholder.com/100'}
                            alt={material.name}
                            className="w-16 h-16 rounded object-cover mr-3"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{material.name || 'NOT FETCHING'}</p>
                            <p className="text-sm text-gray-600 mt-1">{material.description || 'NOT FETCHING'}</p>
                            <div className="mt-2 text-xs text-gray-500">
                              <p>Installation: {material.skillLevel?.replace(/_/g, ' ').toLowerCase() || 'NOT FETCHING'}</p>
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
                    <p className="text-sm text-red-500 mt-2">NOT FETCHING - Materials data</p>
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
                          onChange={(e) => setCustomDimensions({...customDimensions, width: e.target.value})}
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
                          onChange={(e) => setCustomDimensions({...customDimensions, height: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="e.g., 4"
                        />
                      </div>
                    </div>
                    {customDimensions.width && customDimensions.height && (
                      <p className="text-sm text-gray-600 mt-2">
                        Total area: {(parseFloat(customDimensions.width) * parseFloat(customDimensions.height)).toFixed(1)} sq ft
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
                        onClick={() => {
                          console.log('📁 File upload clicked');
                          setUploadedCreative('design-file.pdf'); // Simulate upload
                        }}
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
                onClick={() => {
                  setShowMaterialModal(false);
                  setSelectedMaterial(null);
                  setCustomDimensions({ width: '', height: '' });
                  setUploadedCreative(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleBookingConfirm}
                disabled={!selectedMaterial || !customDimensions.width || !customDimensions.height || !uploadedCreative}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  selectedMaterial && customDimensions.width && customDimensions.height && uploadedCreative
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

  // Empty State Component
  const EmptyState = ({ icon: Icon, title, description, actionText, onAction }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">{description}</p>
      <button 
        onClick={onAction}
        className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 inline-flex items-center"
      >
        <Plus className="w-4 h-4 mr-2" />
        {actionText}
      </button>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'campaigns':
        return bookings.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Your Active Campaigns</h3>
              <button 
                onClick={() => setActiveTab('browse')}
                className="text-teal-600 hover:text-teal-700 text-sm font-medium"
              >
                Browse More Spaces →
              </button>
            </div>
            {bookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No active campaigns"
            description="Browse available spaces to start your first advertising campaign"
            actionText="Browse Ad Spaces"
            onAction={() => setActiveTab('browse')}
          />
        );
        
      case 'browse':
        return (
          <div className="space-y-6">
            {/* Search Header */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Find Ad Spaces</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <Info className="w-4 h-4 inline mr-1" />
                  Use our full browse experience for advanced search and map view
                </p>
                <button 
                  onClick={() => window.location.href = '/browse'}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Open Full Browse →
                </button>
              </div>
            </div>

            {/* Quick Search Results */}
            <div>
              <p className="text-sm text-gray-600 mb-3">Quick results near you:</p>
              {spacesLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading available spaces...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map(space => (
                    <SpaceSearchCard 
                      key={space.id} 
                      space={space}
                      onSelect={(space) => {
                        setSelectedSpace(space);
                        setShowMaterialModal(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No spaces available</p>
                  <p className="text-sm text-red-500 mt-2">NOT FETCHING - Space data</p>
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f7f5e6' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f7f5e6' }}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4 sm:p-6"
      style={{ backgroundColor: '#f7f5e6' }}
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Advertiser Dashboard</h1>
          <p className="text-gray-600">Manage your campaigns and materials</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            icon={DollarSign} 
            value={stats.totalSpent} 
            label="Total Spent"
            color="green"
            subValue="This month"
          />
          <StatCard 
            icon={Calendar} 
            value={stats.activeCampaigns} 
            label="Active Campaigns"
            color="blue"
            actionText="View All"
            onAction={() => setActiveTab('campaigns')}
          />
          <StatCard 
            icon={Package} 
            value={stats.pendingMaterials} 
            label="Materials In Transit"
            color="yellow"
          />
          <StatCard 
            icon={Building2} 
            value={searchResults.length} 
            label="Spaces Available"
            color="teal"
            actionText="Browse"
            onAction={() => setActiveTab('browse')}
          />
        </div>

        {/* Main Content with Glass Morphism */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'campaigns', label: 'My Campaigns', icon: Calendar },
                { id: 'browse', label: 'Browse Spaces', icon: Search }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors inline-flex items-center ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
      
      {/* Material Selection Modal */}
      <MaterialSelectionModal />
    </div>
  );
}