import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  Search, MapPin, Upload, Package, DollarSign,
  Calendar, Eye, Download, Clock, CheckCircle,
  Calculator, FileImage, ShoppingCart, Info,
  Truck, AlertCircle, Navigation, Building2,
  Camera, ChevronRight, X, Plus
} from 'lucide-react';

// ✅ FIXED: Import real apiClient instead of mock
import apiClient from '../../../api/apiClient.js';

// Types (inline for now)
interface DashboardStats {
  totalSpent: number;
  activeCampaigns: number;
  pendingMaterials: number;
  completedCampaigns: number;
}

interface Space {
  id: string;
  name?: string;
  location?: string;
  address?: string;
  dimensions?: string;
  price?: number;
  estimatedMaterialCost?: number;
  imageUrl?: string;
  availability?: string;
  surfaceType?: string;
  materialCompatibility?: string[];
  propertyId?: string;
}

interface Material {
  id: string;
  name?: string;
  description?: string;
  category: string;
  pricePerUnit?: number;
  imageUrl?: string;
  skillLevel?: string;
}

interface Booking {
  id: string;
  spaceName?: string;
  location?: string;
  status?: 'materials_ordered' | 'materials_shipped' | 'active';
  startDate?: string;
  endDate?: string;
  totalCost?: number;
  spaceCost?: number;
  materialCost?: number;
  platformFee?: number;
  materialType?: string;
  dimensions?: string;
  materialStatus?: string;
  installationStatus?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}

interface CustomDimensions {
  width: string;
  height: string;
}

interface BookingData {
  spaceId: string;
  propertyId?: string;
  materialItemId: string;
  dimensions: CustomDimensions;
  designFileUrl: string;
  totalCost: number;
}

export default function AdvertiserDashboard() {
  const { user, isLoaded: userLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  
  // Real data states
  const [stats, setStats] = useState<DashboardStats>({
    totalSpent: 0,
    activeCampaigns: 0,
    pendingMaterials: 0,
    completedCampaigns: 0
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [searchResults, setSearchResults] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [spacesLoading, setSpacesLoading] = useState(false);

  // Material selection states
  const [uploadedCreative, setUploadedCreative] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [customDimensions, setCustomDimensions] = useState<CustomDimensions>({ width: '', height: '' });

  // Utility functions with safety checks
  const formatStatValue = (value: number | string | undefined | null, label: string): string => {
    // Handle undefined, null, or invalid values
    if (value === null || value === undefined) return '0';
    
    if (typeof value === 'number' && label.includes('Spent')) {
      return `$${value.toLocaleString()}`;
    }
    
    // Safely convert to string
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    
    return '0';
  };

  const calculateMaterialCost = (material: Material, dimensions: CustomDimensions): number => {
    if (!dimensions.width || !dimensions.height || !material) return 0;
    const sqFt = (parseFloat(dimensions.width) * parseFloat(dimensions.height));
    const materialCost = sqFt * (material.pricePerUnit || 0);
    const markup = materialCost * 0.15; // 15% markup
    return Math.round((materialCost + markup) * 100) / 100;
  };

  const calculateTotalCost = (): number => {
    if (!selectedSpace || !selectedMaterial) return 0;
    const spaceCost = selectedSpace.price || 0;
    const materialCost = calculateMaterialCost(selectedMaterial, customDimensions);
    const subtotal = spaceCost + materialCost;
    const platformFee = subtotal * 0.05;
    return subtotal + platformFee;
  };

  const getStatusBadge = (status?: Booking['status']) => {
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
    
    // Always return a valid badge, defaulting to 'active' if status is undefined or invalid
    return badges[status || 'active'] || badges['active'];
  };

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
      console.log('🔄 Fetching advertiser dashboard data for user:', user?.id);
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
      
      // Show fallback data for development
      setStats({
        totalSpent: 0,
        activeCampaigns: 0,
        pendingMaterials: 0,
        completedCampaigns: 0
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

  // Handle booking with materials
  const handleBookingConfirm = async () => {
    if (!selectedSpace || !selectedMaterial || !customDimensions.width || !customDimensions.height || !uploadedCreative) {
      console.error('❌ Missing required booking data');
      return;
    }

    const bookingData: BookingData = {
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

  // Safe Inline Components
  const StatCard = ({ icon: Icon, value, label, color, subValue, actionText, onAction }: any) => {
    const colorClasses = {
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      teal: 'bg-teal-100 text-teal-600'
    };

    // Safety check for value
    const safeValue = value !== null && value !== undefined ? value : 0;

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
          {formatStatValue(safeValue, label)}
        </p>
        <p className="text-sm text-gray-600">{label}</p>
        {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
      </div>
    );
  };

  const EmptyState = ({ icon: Icon, title, description, actionText, onAction }: any) => (
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

  // Rest of your original component logic...
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map(booking => {
                const statusBadge = getStatusBadge(booking.status);
                // Placeholder logic - will replace with actual field later
                const verificationImage = booking.verificationImageUrl || null; // Replace with actual field name
                const hasVerificationImage = !!verificationImage;
                
                return (
                  <div key={booking.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                    {/* Image Section */}
                    <div className="aspect-video w-full bg-gray-100 relative">
                      {hasVerificationImage ? (
                        <img 
                          src={verificationImage} 
                          alt="Campaign verification" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <div className="text-center px-4">
                            <Camera className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">Awaiting photo upload from owner</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Status Badge Overlay */}
                      <div className="absolute top-3 right-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color} shadow-sm`}>
                          <statusBadge.icon className="w-3 h-3 mr-1" />
                          {statusBadge.text}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4">
                      <div className="mb-3">
                        <h3 className="font-semibold text-gray-900 mb-1">{booking.spaceName || 'Space Name'}</h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                          {booking.location || 'Location'}
                        </p>
                      </div>

                      {/* Campaign Details */}
                      <div className="space-y-2 text-sm mb-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">
                            {booking.startDate && booking.endDate 
                              ? `${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}`
                              : '30 days'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Cost:</span>
                          <span className="font-bold text-green-600">
                            {typeof booking.totalCost === 'number' ? `${booking.totalCost}` : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => console.log('👁️ View campaign details:', booking.id)}
                          className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => console.log('📊 View analytics:', booking.id)}
                          className="flex-1 bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 text-sm font-medium transition-colors"
                        >
                          Analytics
                        </button>
                      </div>

                      {/* Installation Status */}
                      {booking.materialStatus === 'SHIPPED' && booking.estimatedDelivery && (
                        <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                          <p className="text-xs text-blue-800 flex items-center">
                            <Truck className="w-3 h-3 mr-1" />
                            Materials arriving by {new Date(booking.estimatedDelivery).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
                    <div key={space.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900">{space.name || 'Space Name'}</h3>
                        <p className="text-sm text-gray-600">{space.location || 'Location'}</p>
                        <button 
                          onClick={() => {
                            setSelectedSpace(space);
                            setShowMaterialModal(true);
                          }}
                          className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors mt-2"
                        >
                          Book Space + Materials
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No spaces available</p>
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
      
      {/* Simplified Modal for now */}
      {showMaterialModal && selectedSpace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Book Space</h2>
              <button 
                onClick={() => {
                  setShowMaterialModal(false);
                  setSelectedSpace(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Booking: {selectedSpace.name || 'Space'}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowMaterialModal(false);
                  setSelectedSpace(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert('Booking functionality coming soon!');
                  setShowMaterialModal(false);
                  setSelectedSpace(null);
                }}
                className="flex-1 bg-teal-600 text-white py-2 rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}