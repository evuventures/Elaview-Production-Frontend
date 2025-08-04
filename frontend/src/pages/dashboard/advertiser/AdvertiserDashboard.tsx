import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  Search, MapPin, Upload, Package, DollarSign,
  Calendar, Eye, Download, Clock, CheckCircle,
  Calculator, FileImage, ShoppingCart, Info,
  Truck, AlertCircle, Navigation, Building2,
  Camera, ChevronRight, X, Plus, Bell
} from 'lucide-react';

// ✅ FIXED: Import real apiClient instead of mock
import apiClient from '../../../api/apiClient.js';

// Import enhanced components
import { EnhancedBookingCard } from './components/EnhancedBookingCard';
import { StatCard } from './components/StatCard';
import { EmptyState } from './components/EmptyState';
import { SpaceSearchCard } from './components/SpaceSearchCard';
import { MaterialSelectionModal } from './components/MaterialSelectionModal';

// Types
import {
  DashboardStats, Booking, Material, Space, BookingData,
  CustomDimensions, Notification
} from './types';

// Utility functions
import {
  formatStatValue, calculateMaterialCost, calculateTotalCost,
  isBookingDataComplete, filterCompatibleMaterials,
  getBookingUrgencyLevel
} from './utils';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [spacesLoading, setSpacesLoading] = useState(false);

  // Material selection states
  const [uploadedCreative, setUploadedCreative] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [customDimensions, setCustomDimensions] = useState<CustomDimensions>({ width: '', height: '' });

  // ✅ MOBILE: Add console log for mobile debugging
  useEffect(() => {
    console.log('📱 ADVERTISER DASHBOARD: Mobile viewport check', {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      isMobile: window.innerWidth < 768
    });
  }, []);

  // Fetch dashboard data on mount
  useEffect(() => {
    console.log('👤 User loaded:', userLoaded, 'User ID:', user?.id);
    if (userLoaded && user?.id) {
      fetchDashboardData();
      fetchMaterialsCatalog();
      fetchNotifications();
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

  const fetchNotifications = async () => {
    try {
      console.log('🔔 Fetching notifications...');
      const response = await apiClient.getNotifications();
      
      if (response.success) {
        console.log('✅ Notifications received:', response.data);
        setNotifications(response.data.notifications || []);
      } else {
        console.error('❌ Notifications fetch failed:', response.error);
      }
    } catch (err) {
      console.error('❌ Notifications error:', err);
      setNotifications([]);
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
      totalCost: calculateTotalCost(selectedSpace, selectedMaterial, customDimensions)
    };

    try {
      console.log('📋 Creating booking with materials:', bookingData);
      const response = await apiClient.createBookingWithMaterials(bookingData);
      
      if (response.success) {
        console.log('✅ Booking created successfully');
        alert('Booking confirmed! You will receive installation instructions via email.');
        setShowMaterialModal(false);
        setSelectedSpace(null);
        setSelectedMaterial(null);
        setCustomDimensions({ width: '', height: '' });
        setUploadedCreative(null);
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

  // Calculate derived stats for better insights
  const urgentBookings = bookings.filter(b => getBookingUrgencyLevel(b) === 'high' || getBookingUrgencyLevel(b) === 'critical');
  const unreadNotifications = notifications.filter(n => !n.isRead);

  const renderContent = () => {
    switch(activeTab) {
      case 'campaigns':
        return bookings.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
              <div>
                <h3 className="font-semibold text-gray-900">Your Active Campaigns</h3>
                {urgentBookings.length > 0 && (
                  <p className="text-sm text-amber-600 flex items-center mt-1">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {urgentBookings.length} campaign{urgentBookings.length > 1 ? 's' : ''} need{urgentBookings.length === 1 ? 's' : ''} attention
                  </p>
                )}
              </div>
              <button 
                onClick={() => setActiveTab('browse')}
                className="text-teal-600 hover:text-teal-700 text-sm font-medium self-start sm:self-auto"
              >
                Browse More Spaces →
              </button>
            </div>
            
            {/* Sort bookings by urgency */}
            <div className="space-y-4">
              {bookings
                .sort((a, b) => {
                  const urgencyOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
                  return urgencyOrder[getBookingUrgencyLevel(a)] - urgencyOrder[getBookingUrgencyLevel(b)];
                })
                .map(booking => (
                  <EnhancedBookingCard 
                    key={booking.id} 
                    booking={booking}
                    expandedBooking={expandedBooking}
                    onToggleExpand={setExpandedBooking}
                  />
                ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No active campaigns"
            description="Browse available spaces to start your first advertising campaign with integrated materials"
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
                  All spaces include material sourcing and installation coordination
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <div 
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: '#f7f5e6' }}
      >
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
      <div 
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: '#f7f5e6' }}
      >
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
      className="min-h-full w-full overflow-hidden"
      style={{ backgroundColor: '#f7f5e6' }}
    >
      {/* ✅ MOBILE RESPONSIVE: Container with proper spacing */}
      <div className="w-full h-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          
          {/* ✅ MOBILE: Header with responsive spacing */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Advertiser Dashboard</h1>
                <p className="text-gray-600 text-sm sm:text-base">Manage your campaigns and materials</p>
              </div>
              
              {/* ✅ MOBILE: Notification Bell with proper touch target */}
              {unreadNotifications.length > 0 && (
                <button className="relative p-3 text-gray-600 hover:text-gray-900 self-start sm:self-auto">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
                    {unreadNotifications.length}
                  </span>
                </button>
              )}
            </div>
            
            {/* ✅ MOBILE: Urgent Alerts with responsive layout */}
            {urgentBookings.length > 0 && (
              <div className="mt-3 sm:mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-start sm:items-center flex-1">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mr-2 mt-0.5 sm:mt-0 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-amber-800">
                        Action Required: {urgentBookings.length} campaign{urgentBookings.length > 1 ? 's' : ''} need{urgentBookings.length === 1 ? 's' : ''} immediate attention
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Installation deadlines approaching or materials delivered
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('campaigns')}
                    className="text-amber-700 hover:text-amber-800 text-sm font-medium self-start sm:self-auto whitespace-nowrap"
                  >
                    View →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ✅ MOBILE: Enhanced Stats Grid with responsive columns */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <StatCard 
              icon={DollarSign} 
              value={stats.totalSpent} 
              label="Total Invested"
              color="green"
              subValue="This month"
            />
            <StatCard 
              icon={Calendar} 
              value={stats.activeCampaigns} 
              label="Active Campaigns"
              color="blue"
              actionText={urgentBookings.length > 0 ? `${urgentBookings.length} urgent` : "View All"}
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

          {/* ✅ MOBILE: Main Content with responsive glass morphism */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-white/50">
            {/* ✅ MOBILE: Tabs with responsive layout */}
            <div className="border-b border-gray-200">
              <nav className="flex px-3 sm:px-6 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'campaigns', label: 'My Campaigns', icon: Calendar, badge: urgentBookings.length },
                  { id: 'browse', label: 'Browse Spaces', icon: Search }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors inline-flex items-center whitespace-nowrap mr-6 sm:mr-8 ${
                      activeTab === tab.id
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    {tab.badge && tab.badge > 0 && (
                      <span className="ml-2 bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* ✅ MOBILE: Tab Content with responsive padding */}
            <div className="p-3 sm:p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
      
      {/* ✅ MOBILE: Material Selection Modal with responsive design */}
      {showMaterialModal && selectedSpace && (
        <MaterialSelectionModal
          selectedSpace={selectedSpace}
          showModal={showMaterialModal}
          availableMaterials={availableMaterials}
          materialsLoading={materialsLoading}
          selectedMaterial={selectedMaterial}
          customDimensions={customDimensions}
          uploadedCreative={uploadedCreative}
          onClose={() => {
            setShowMaterialModal(false);
            setSelectedSpace(null);
            setSelectedMaterial(null);
            setCustomDimensions({ width: '', height: '' });
            setUploadedCreative(null);
          }}
          onMaterialSelect={setSelectedMaterial}
          onDimensionsChange={setCustomDimensions}
          onCreativeUpload={(file) => setUploadedCreative(file)}
          onConfirmBooking={handleBookingConfirm}
          calculateTotalCost={() => calculateTotalCost(selectedSpace, selectedMaterial, customDimensions)}
          calculateMaterialCost={calculateMaterialCost}
        />
      )}
    </div>
  );
}