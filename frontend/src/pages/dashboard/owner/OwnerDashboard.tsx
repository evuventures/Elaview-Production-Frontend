// Space Owner Dashboard - MVP Version with Real Data - MOBILE RESPONSIVE - 50/50 LAYOUT
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // ✅ ADDED: Navigation hooks
import {
  Plus, Building2, Calendar, Package, Camera,
  DollarSign, Clock, CheckCircle, AlertCircle,
  Eye, Upload, ChevronRight, MapPin, FileText,
  Download, Truck, Navigation, Star, TrendingUp
} from 'lucide-react';

// ✅ FIXED: Import real apiClient instead of mock
import apiClient from '../../../api/apiClient.js';

export default function SpaceOwnerDashboardMVP() {
  const { user, isLoaded: userLoaded } = useUser();
  const navigate = useNavigate(); // ✅ ADDED: Navigation hook
  const [searchParams] = useSearchParams(); // ✅ ADDED: URL params hook
  const [activeTab, setActiveTab] = useState('bookings');
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // ✅ ADDED: Success message state
  
  // Real data states
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeListings: 0,
    pendingInstalls: 0,
    completedBookings: 0
  });
  const [bookings, setBookings] = useState([]);
  const [listings, setListings] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ ADDED: Handle success message from URL params
  useEffect(() => {
    const created = searchParams.get('created');
    const tab = searchParams.get('tab');
    
    if (created === 'true') {
      setShowSuccessMessage(true);
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
      // Clear URL params
      navigate('/dashboard', { replace: true });
    }
    
    if (tab === 'listings') {
      setActiveTab('listings');
    }
  }, [searchParams, navigate]);

  // ✅ MOBILE: Add console log for mobile debugging
  useEffect(() => {
    console.log('📱 SPACE OWNER DASHBOARD: Mobile viewport check', {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      isMobile: window.innerWidth < 768
    });
  }, []);

  // ✅ COLOR SCHEME: Verification on mount
  useEffect(() => {
    console.log('🎨 SPACE OWNER DASHBOARD: Updated color scheme verification', {
      primaryBlue: '#4668AB',
      whiteBackground: '#FFFFFF',
      offWhiteCards: '#F9FAFB',
      lightGrayBorders: '#E5E7EB',
      timestamp: new Date().toISOString()
    });
  }, []);

  // ✅ Layout restructure verification
  useEffect(() => {
    console.log('✅ SPACE OWNER DASHBOARD: Layout restructure verification', {
      newLayout: '50/50 split to match Advertiser Dashboard',
      leftSectionTitles: ['Insights', 'Quick Actions'],
      rightSectionTitle: 'Space Management', 
      statsLayout: '2x2 grid in left column (was 2x4 across top)',
      tabContent: 'Moved to right column with proper section title',
      materialsSection: 'REMOVED per user request',
      timestamp: new Date().toISOString()
    });
  }, []);

  // Fetch real data on component mount
  useEffect(() => {
    console.log('👤 User loaded:', userLoaded, 'User ID:', user?.id);
    if (userLoaded && user?.id) {
      fetchDashboardData();
    } else if (userLoaded && !user) {
      console.error('❌ User not authenticated');
      setError('Please sign in to view your dashboard');
      setIsLoading(false);
    }
  }, [userLoaded, user?.id]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching dashboard data for user:', user.id);
      const response = await apiClient.getSpaceOwnerDashboard();
      
      if (response.success) {
        console.log('✅ Dashboard data received:', response.data);
        setStats(response.data.stats || {
          totalRevenue: 0,
          activeListings: 0,
          pendingInstalls: 0,
          completedBookings: 0
        });
        setBookings(response.data.bookings || []);
        setListings(response.data.listings || []);
        setInstallations(response.data.installations || []);
      } else {
        console.error('❌ Dashboard fetch failed:', response.error);
        setError(response.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('❌ Dashboard error:', err);
      setError('Failed to load dashboard data. Please try again.');
      
      // Show fallback data for development
      setStats({
        totalRevenue: 0,
        activeListings: 0,
        pendingInstalls: 0,
        completedBookings: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ ADDED: Navigation handlers
  const handleAddNewSpace = () => {
    console.log('🚀 Navigating to create listing wizard');
    navigate('/list-space');
  };

  const handleViewAnalytics = () => {
    console.log('📊 Analytics feature coming soon');
    // TODO: Implement analytics page
  };

  const handleAddSpace = () => {
    console.log('🚀 Navigating to create listing wizard from listings tab');
    navigate('/list-space');
  };

  // Calculate derived stats
  const totalPendingRevenue = bookings
    .filter(b => b.status === 'pending_install')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Enhanced Stat Card Component with updated brand colors and mobile responsiveness
  const StatCard = ({ icon: Icon, value, label, color, subValue, trend }) => {
    const colorClasses = {
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600', 
      yellow: 'bg-yellow-100 text-yellow-600',
      brand: 'bg-blue-100 text-blue-600' // Updated from teal to brand blue
    };

    return (
      <div 
        className="rounded-lg sm:rounded-xl p-3 sm:p-4 border shadow-sm hover:shadow-md transition-all duration-200"
        style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }}
      >
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          {trend && (
            <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <p className="text-lg sm:text-2xl font-bold text-gray-900">
          {typeof value === 'number' && label.includes('Revenue') ? `$${value.toLocaleString()}` : value}
        </p>
        <p className="text-xs sm:text-sm text-gray-600 truncate">{label}</p>
        {subValue && <p className="text-xs text-gray-500 mt-1 truncate">{subValue}</p>}
      </div>
    );
  };

  // Enhanced Booking Card with Material Details - Mobile Responsive
  const BookingCard = ({ booking }) => {
    const isExpanded = expandedBooking === booking.id;
    
    const getStatusBadge = (status) => {
      const badges = {
        'pending_install': {
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          text: 'Awaiting Installation'
        },
        'active': {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          text: 'Campaign Active'
        },
        'materials_shipped': {
          color: 'bg-blue-100 text-blue-800',
          icon: Truck,
          text: 'Materials In Transit'
        }
      };
      
      const badge = badges[status] || badges['active'];
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
          <badge.icon className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">{badge.text}</span>
          <span className="sm:hidden">{badge.text.split(' ')[0]}</span>
        </span>
      );
    };

    return (
      <div 
        className="rounded-lg border shadow-sm hover:shadow-md transition-all duration-200"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
      >
        <div 
          className="p-3 sm:p-4 cursor-pointer"
          onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {booking.advertiserName || 'Advertiser Name'}
              </h3>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{booking.spaceName || 'Space Name'}</span>
              </p>
            </div>
            <div className="self-start sm:self-auto">
              {getStatusBadge(booking.status || 'active')}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div>
              <p className="text-gray-600">Campaign Period</p>
              <p className="font-medium text-xs sm:text-sm">
                {booking.startDate && booking.endDate 
                  ? `${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Total Revenue</p>
              <p className="font-bold text-green-600">
                {typeof booking.totalAmount === 'number' ? `$${booking.totalAmount}` : 'N/A'}
              </p>
            </div>
          </div>

          {booking.status === 'pending_install' && booking.installDeadline && (
            <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-800 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Installation needed by {new Date(booking.installDeadline).toLocaleDateString()}</span>
              </p>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div 
            className="border-t p-3 sm:p-4"
            style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}
          >
            <div className="space-y-4">
              {/* Material Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Material Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Type</p>
                    <p className="font-medium">{booking.materialType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Dimensions</p>
                    <p className="font-medium">{booking.dimensions || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Order Status</p>
                    <p className="font-medium text-blue-600">{booking.materialOrderStatus || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Revenue Split</p>
                    <p className="font-medium text-xs">
                      Space: ${booking.spaceRevenue || 'N/A'} | Materials: ${booking.materialRevenue || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tracking Information */}
              {booking.trackingNumber && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Shipping Information</h4>
                  <div className="bg-white rounded p-3 text-sm">
                    <p className="text-gray-600">Tracking Number</p>
                    <a 
                      href={booking.trackingUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline font-medium break-all"
                      style={{ color: '#4668AB' }}
                    >
                      {booking.trackingNumber}
                    </a>
                    {booking.shippingAddress && (
                      <p className="text-xs text-gray-500 mt-1">
                        Shipping to: {booking.shippingAddress}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  className="flex-1 text-white px-3 py-3 rounded-lg hover:opacity-90 text-sm inline-flex items-center justify-center transition-opacity"
                  style={{ backgroundColor: '#4668AB' }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-3 rounded-lg hover:bg-gray-200 text-sm inline-flex items-center justify-center transition-colors">
                  <Camera className="w-4 h-4 mr-1" />
                  Contact Advertiser
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Enhanced Listing Card with Material Compatibility - Mobile Responsive
  const ListingCard = ({ listing }) => {
    const difficultyLabels = ['Ground Level', 'Easy Access', 'Moderate', 'Difficult', 'Professional Required'];
    
    return (
      <div 
        className="rounded-lg border p-3 sm:p-4 hover:shadow-md transition-all duration-200"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {listing.name || 'Listing Name'}
              </h3>
              {listing.verificationBadge && (
                <div className="bg-green-100 p-1 rounded-full flex-shrink-0">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">{listing.type || 'Type'}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
            listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {listing.status === 'active' ? 'Active' : listing.status || 'N/A'}
          </span>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Dimensions</span>
            <span className="font-medium">{listing.dimensions || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Monthly Price</span>
            <span className="font-bold text-gray-900">
              {typeof listing.price === 'number' ? `$${listing.price}` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Est. Material Cost</span>
            <span className="font-medium text-blue-600">
              {typeof listing.estimatedMaterialCost === 'number' ? `$${listing.estimatedMaterialCost}` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Access Level</span>
            <span className="font-medium text-xs">
              {listing.accessDifficulty ? difficultyLabels[listing.accessDifficulty - 1] : 'N/A'}
            </span>
          </div>
        </div>

        {/* Material Compatibility Tags */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-600 mb-2">Compatible Materials:</p>
          <div className="flex flex-wrap gap-1">
            {listing.materialCompatibility && Array.isArray(listing.materialCompatibility) ? (
              listing.materialCompatibility.slice(0, 3).map(material => (
                <span key={material} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {material.replace(/_/g, ' ').toLowerCase()}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-xs">No materials specified</span>
            )}
            {listing.materialCompatibility && listing.materialCompatibility.length > 3 && (
              <span className="text-gray-500 text-xs">+{listing.materialCompatibility.length - 3} more</span>
            )}
          </div>
        </div>
        
        <button 
          className="mt-4 w-full text-sm font-medium inline-flex items-center justify-center py-2 hover:underline"
          style={{ color: '#4668AB' }}
        >
          Edit Listing
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    );
  };

  // Empty State Component - Mobile Responsive
  const EmptyState = ({ icon: Icon, title, description, actionText, onActionClick }) => (
    <div className="text-center py-8 sm:py-12">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 sm:mb-6 max-w-sm mx-auto text-sm sm:text-base px-4">{description}</p>
      <button 
        onClick={onActionClick}
        className="text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:opacity-90 inline-flex items-center text-sm sm:text-base transition-opacity"
        style={{ backgroundColor: '#4668AB' }}
      >
        <Plus className="w-4 h-4 mr-2" />
        {actionText}
      </button>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'bookings':
        return bookings.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
              <h3 className="font-semibold text-gray-900">Active & Pending Bookings</h3>
              <span className="text-sm text-gray-600 self-start sm:self-auto">
                ${totalPendingRevenue.toLocaleString()} pending revenue
              </span>
            </div>
            {bookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No bookings yet"
            description="Once advertisers book your spaces, you'll see them here with campaign details."
            actionText="View Your Listings"
            onActionClick={() => setActiveTab('listings')}
          />
        );
        
      case 'listings':
        return listings.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
              <h3 className="font-semibold text-gray-900">Your Ad Spaces</h3>
              <button 
                onClick={handleAddSpace}
                className="text-white px-3 sm:px-4 py-2 rounded-lg hover:opacity-90 text-sm inline-flex items-center self-start sm:self-auto transition-opacity"
                style={{ backgroundColor: '#4668AB' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Space
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Building2}
            title="No spaces listed"
            description="Start earning by listing your available advertising spaces."
            actionText="List Your First Space"
            onActionClick={handleAddNewSpace}
          />
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
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="text-center">
          <div 
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: '#4668AB', borderTopColor: 'transparent' }}
          ></div>
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
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#4668AB' }}
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
      style={{ backgroundColor: '#FFFFFF' }}
    >
      {/* ✅ ADDED: Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium text-sm">Listing Created Successfully!</p>
                <p className="text-green-700 text-xs mt-1">Your property and spaces are under review.</p>
              </div>
              <button 
                onClick={() => setShowSuccessMessage(false)}
                className="ml-3 text-green-400 hover:text-green-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MOBILE RESPONSIVE: Container with proper spacing */}
      <div className="w-full h-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          
          {/* ✅ MOBILE: Header with responsive spacing */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Space Owner Dashboard</h1>
          </div>

          {/* ✅ MAIN LAYOUT: 50/50 split to match Advertiser Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* ✅ LEFT SECTION - Key Stats & Quick Actions */}
            <div className="space-y-6">
              
              {/* Key Stats Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Insights</h2>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard 
                    icon={DollarSign} 
                    value={stats.totalRevenue} 
                    label="Total Revenue"
                    color="green"
                    subValue="This month"
                    trend={12.5}
                  />
                  <StatCard 
                    icon={Building2} 
                    value={stats.activeListings} 
                    label="Active Spaces"
                    color="blue"
                  />
                  <StatCard 
                    icon={Calendar} 
                    value={stats.completedBookings} 
                    label="Total Bookings"
                    color="brand"
                  />
                  <StatCard 
                    icon={CheckCircle} 
                    value={stats.completedBookings} 
                    label="Completed"
                    color="green"
                  />
                </div>
              </div>

              {/* Quick Actions Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  
                  {/* ✅ UPDATED: Add New Space Card with navigation */}
                  <div 
                    onClick={handleAddNewSpace}
                    className="rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                    style={{ 
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                        style={{ backgroundColor: '#EFF6FF' }}
                      >
                        <Plus className="w-5 h-5" style={{ color: '#4668AB' }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">Add New Space</h3>
                        <p className="text-sm text-gray-600">List a new advertising location</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Revenue Summary Card */}
                  <div 
                    className="rounded-lg p-4 transition-all duration-200"
                    style={{ 
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">This Month</h3>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Earned</p>
                        <p className="font-bold text-green-600">${stats.totalRevenue}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Pending</p>
                        <p className="font-bold text-yellow-600">${totalPendingRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* ✅ UPDATED: View Analytics Card with navigation */}
                  <div 
                    onClick={handleViewAnalytics}
                    className="rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                    style={{ 
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                        style={{ backgroundColor: '#EFF6FF' }}
                      >
                        <TrendingUp className="w-5 h-5" style={{ color: '#4668AB' }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">View Analytics</h3>
                        <p className="text-sm text-gray-600">Track your space performance</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* ✅ RIGHT SECTION - Space Management */}
            <div>
              {/* Add section title to match left column */}
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Space Management</h2>
              
              <div 
                className="rounded-lg shadow-md transition-all duration-200"
                style={{ 
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB'
                }}
              >
                {/* ✅ TABS: Only Bookings and Listings */}
                <div className="border-b border-gray-200">
                  <nav className="flex px-3 sm:px-6 overflow-x-auto scrollbar-hide">
                    {[
                      { id: 'bookings', label: 'Bookings', icon: Calendar },
                      { id: 'listings', label: 'My Spaces', icon: Building2 }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-shrink-0 py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors inline-flex items-center whitespace-nowrap mr-6 sm:mr-8 ${
                          activeTab === tab.id
                            ? 'text-white'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                        style={activeTab === tab.id ? { 
                          borderBottomColor: '#4668AB',
                          backgroundColor: '#4668AB'
                        } : {}}
                      >
                        <tab.icon className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
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
        </div>
      </div>
    </div>
  );
}

// ✅ Add verification function for testing
if (typeof window !== 'undefined') {
  window.verifySpaceOwnerColors = () => {
    const whiteElements = document.querySelectorAll('[style*="FFFFFF"]');
    const offWhiteElements = document.querySelectorAll('[style*="F9FAFB"]');
    const blueElements = document.querySelectorAll('[style*="4668AB"]');
    
    console.log('🔍 SPACE OWNER COLOR VERIFICATION:', {
      whiteElementsFound: whiteElements.length,
      offWhiteElementsFound: offWhiteElements.length,
      blueElementsFound: blueElements.length,
      colorSchemeComplete: whiteElements.length > 0 && offWhiteElements.length > 0 && blueElements.length > 0
    });
    
    return {
      status: whiteElements.length > 0 && blueElements.length > 0 ? 'SUCCESS' : 'NEEDS_UPDATE',
      whiteElements: whiteElements.length,
      offWhiteElements: offWhiteElements.length,
      blueElements: blueElements.length
    };
  };
}