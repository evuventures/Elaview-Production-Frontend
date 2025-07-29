// Space Owner Dashboard - MVP Version with Real Data
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  Plus, Building2, Calendar, Package, Camera,
  DollarSign, Clock, CheckCircle, AlertCircle,
  Eye, Upload, ChevronRight, MapPin, FileText,
  Download, Truck, Navigation, Star
} from 'lucide-react';

// Import your apiClient
// import apiClient from '@/api/apiClient';

// For demo purposes, mock the apiClient
const apiClient = {
  getSpaceOwnerDashboard: async () => {
    console.log('🚨 NOT FETCHING - Using mock apiClient. Import real apiClient!');
    throw new Error('NOT FETCHING - Real apiClient not imported');
  }
};

export default function SpaceOwnerDashboardMVP() {
  const { user, isLoaded: userLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('bookings');
  const [expandedBooking, setExpandedBooking] = useState(null);
  
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
      
      // Show NOT FETCHING indicators
      setStats({
        totalRevenue: 'NOT FETCHING',
        activeListings: 'NOT FETCHING',
        pendingInstalls: 'NOT FETCHING',
        completedBookings: 'NOT FETCHING'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate derived stats
  const totalPendingRevenue = bookings
    .filter(b => b.status === 'pending_install')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Enhanced Stat Card Component with Elaview styling
  const StatCard = ({ icon: Icon, value, label, color, subValue, trend }) => {
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
          {trend && (
            <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {value === 'NOT FETCHING' ? (
            <span className="text-red-500 text-sm">NOT FETCHING</span>
          ) : (
            typeof value === 'number' && label.includes('Revenue') ? `$${value.toLocaleString()}` : value
          )}
        </p>
        <p className="text-sm text-gray-600">{label}</p>
        {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
      </div>
    );
  };

  // Enhanced Booking Card with Material Details
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
                {booking.advertiserName || 'NOT FETCHING - Advertiser Name'}
              </h3>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                {booking.spaceName || 'NOT FETCHING - Space Name'}
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
              <p className="text-gray-600">Total Revenue</p>
              <p className="font-bold text-green-600">
                {typeof booking.totalAmount === 'number' ? `$${booking.totalAmount}` : 'NOT FETCHING'}
              </p>
            </div>
          </div>

          {booking.status === 'pending_install' && booking.installDeadline && (
            <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-800 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Installation needed by {new Date(booking.installDeadline).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="space-y-4">
              {/* Material Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Material Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
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
                    <p className="font-medium text-blue-600">{booking.materialOrderStatus || 'NOT FETCHING'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Revenue Split</p>
                    <p className="font-medium">
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
                      className="text-blue-600 hover:text-blue-700 font-medium"
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
              <div className="flex gap-2">
                <button className="flex-1 bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 text-sm inline-flex items-center justify-center transition-colors">
                  <Eye className="w-4 h-4 mr-1" />
                  View Installation Guide
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm inline-flex items-center justify-center transition-colors">
                  <Camera className="w-4 h-4 mr-1" />
                  Upload Installation Photo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Enhanced Listing Card with Material Compatibility
  const ListingCard = ({ listing }) => {
    const difficultyLabels = ['Ground Level', 'Easy Access', 'Moderate', 'Difficult', 'Professional Required'];
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {listing.name || 'NOT FETCHING - Listing Name'}
              </h3>
              {listing.verificationBadge && (
                <div className="bg-green-100 p-1 rounded-full">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600">{listing.type || 'NOT FETCHING - Type'}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {listing.status === 'active' ? 'Active' : listing.status || 'NOT FETCHING'}
          </span>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Dimensions</span>
            <span className="font-medium">{listing.dimensions || 'NOT FETCHING'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Monthly Price</span>
            <span className="font-bold text-gray-900">
              {typeof listing.price === 'number' ? `$${listing.price}` : 'NOT FETCHING'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Est. Material Cost</span>
            <span className="font-medium text-blue-600">
              {typeof listing.estimatedMaterialCost === 'number' ? `$${listing.estimatedMaterialCost}` : 'NOT FETCHING'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Access Level</span>
            <span className="font-medium">
              {listing.accessDifficulty ? difficultyLabels[listing.accessDifficulty - 1] : 'NOT FETCHING'}
            </span>
          </div>
        </div>

        {/* Material Compatibility Tags */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-600 mb-2">Compatible Materials:</p>
          <div className="flex flex-wrap gap-1">
            {listing.materialCompatibility && Array.isArray(listing.materialCompatibility) ? (
              listing.materialCompatibility.map(material => (
                <span key={material} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {material.replace(/_/g, ' ').toLowerCase()}
                </span>
              ))
            ) : (
              <span className="text-red-500 text-xs">NOT FETCHING - Materials</span>
            )}
          </div>
        </div>
        
        <button className="mt-4 w-full text-teal-600 hover:text-teal-700 text-sm font-medium inline-flex items-center justify-center">
          Edit Listing
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    );
  };

  // Installation Guide Component
  const InstallationGuide = ({ installation }) => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">DIY Installation Guide</h3>
        
        <div className="space-y-4">
          {/* Installation Overview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Window Cling Installation</p>
                <p className="text-sm text-blue-700 mt-1">
                  Difficulty: Easy | Time: ~{installation?.estimatedTime || 30} minutes | 
                  Tools Required: {installation?.requiredTools?.join(', ') || 'NOT FETCHING'}
                </p>
              </div>
            </div>
          </div>

          {/* Video Guide */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Video Tutorial</h4>
            <a 
              href={installation?.instructionUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Watch Installation Video</p>
                  <p className="text-sm text-gray-600">Step-by-step visual guide</p>
                </div>
              </div>
            </a>
          </div>

          {/* Written Steps */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Installation Steps</h4>
            <ol className="space-y-2 text-sm">
              <li className="flex">
                <span className="font-medium text-teal-600 mr-2">1.</span>
                Clean the window surface thoroughly with glass cleaner
              </li>
              <li className="flex">
                <span className="font-medium text-teal-600 mr-2">2.</span>
                Measure and mark the placement area with tape
              </li>
              <li className="flex">
                <span className="font-medium text-teal-600 mr-2">3.</span>
                Spray the window with application solution
              </li>
              <li className="flex">
                <span className="font-medium text-teal-600 mr-2">4.</span>
                Apply the cling starting from top, smoothing downward
              </li>
              <li className="flex">
                <span className="font-medium text-teal-600 mr-2">5.</span>
                Use squeegee to remove bubbles from center outward
              </li>
              <li className="flex">
                <span className="font-medium text-teal-600 mr-2">6.</span>
                Trim excess material with utility knife if needed
              </li>
            </ol>
          </div>

          {/* Photo Upload */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Verify Installation</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Before Photo</p>
                <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload Photo</p>
                </button>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">After Photo (Required)</p>
                <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                  <Camera className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Take Photo</p>
                </button>
              </div>
            </div>
            <button 
              onClick={() => {
                console.log('🔧 Marking installation complete for:', installation?.id || 'NO_ID');
                // Call API to update installation status
              }}
              className="mt-4 w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Mark Installation Complete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Empty State Component
  const EmptyState = ({ icon: Icon, title, description, actionText, actionLink }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">{description}</p>
      <button className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 inline-flex items-center">
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Active & Pending Bookings</h3>
              <span className="text-sm text-gray-600">
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
            description="Once advertisers book your spaces, you'll see them here with installation requirements."
            actionText="View Your Listings"
            actionLink="/my-listings"
          />
        );
        
      case 'listings':
        return listings.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Your Ad Spaces</h3>
              <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm inline-flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Add Space
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            actionLink="/list-space"
          />
        );
        
      case 'materials':
        const pendingInstallation = installations.find(i => i.status === 'PENDING');
        return pendingInstallation ? (
          <InstallationGuide installation={pendingInstallation} />
        ) : (
          <div className="space-y-6">
            <h3 className="font-semibold text-gray-900">Material Orders & Installation</h3>
            
            {/* No Pending Installations */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 mb-2">All Installations Complete!</h4>
              <p className="text-sm text-gray-600">
                You're all caught up. New installation tasks will appear here when materials are delivered.
              </p>
            </div>
            
            {/* General Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Installation Best Practices</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Always clean surfaces thoroughly before installation</li>
                <li>• Check weather conditions - avoid installing in rain or extreme temperatures</li>
                <li>• Take clear before/after photos for verification</li>
                <li>• Complete installations 2 days before campaign start date</li>
                <li>• Keep installation tools ready: squeegee, utility knife, measuring tape</li>
              </ul>
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
          <h1 className="text-2xl font-bold text-gray-900">Space Owner Dashboard</h1>
          <p className="text-gray-600">Manage your ad spaces and installations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
            icon={Package} 
            value={stats.pendingInstalls} 
            label="Pending Installs"
            color="yellow"
          />
          <StatCard 
            icon={CheckCircle} 
            value={stats.completedBookings} 
            label="Completed"
            color="teal"
          />
        </div>

        {/* Main Content with Glass Morphism */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'bookings', label: 'Bookings', icon: Calendar },
                { id: 'listings', label: 'My Spaces', icon: Building2 },
                { id: 'materials', label: 'Materials & Install', icon: Package }
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
                  {tab.id === 'materials' && stats.pendingInstalls > 0 && (
                    <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                      {stats.pendingInstalls}
                    </span>
                  )}
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
    </div>
  );
}