// Space Owner Dashboard - MVP Version with Sidebar Layout to Match Advertiser Dashboard
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import VideoLoader from '@/components/ui/VideoLoader'; // ✅ ADDED VideoLoader import
import {
  Plus, Building2, Calendar, Package, Camera,
  DollarSign, Clock, CheckCircle, AlertCircle,
  Eye, Upload, ChevronRight, MapPin, FileText,
  Download, Truck, Navigation, Star, TrendingUp, X,
  BarChart3, Activity, ArrowUp, ArrowDown
} from 'lucide-react';

import apiClient from '../../../api/apiClient.js';

export default function SpaceOwnerDashboardMVP() {
  const { user, isLoaded: userLoaded } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('bookings');
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
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

  // Mock recent messages for the sidebar
  const [recentMessages] = useState([
    {
      id: '1',
      sender: 'System Alert',
      avatar: '🔔',
      preview: 'New booking request for Downtown Billboard received.',
      timestamp: '1h ago',
      isRead: false,
      priority: 'high'
    },
    {
      id: '2',
      sender: 'Campaign Manager',
      avatar: '👨‍💼',
      preview: 'Materials shipped for Holiday Campaign installation.',
      timestamp: '3h ago',
      isRead: false,
      priority: 'normal'
    },
    {
      id: '3',
      sender: 'Payment System',
      avatar: '💳',
      preview: 'Monthly revenue payment of $2,450 processed successfully.',
      timestamp: '1d ago',
      isRead: true,
      priority: 'normal'
    },
    {
      id: '4',
      sender: 'Analytics Team',
      avatar: '📊',
      preview: 'Your space performance report for January is ready.',
      timestamp: '2d ago',
      isRead: true,
      priority: 'normal'
    }
  ]);

  // Handle success message from URL params
  useEffect(() => {
    const created = searchParams.get('created');
    const tab = searchParams.get('tab');
    
    if (created === 'true') {
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
      navigate('/dashboard', { replace: true });
    }
    
    if (tab === 'listings') {
      setActiveTab('listings');
    }
  }, [searchParams, navigate]);

  // Console logs for verification
  useEffect(() => {
    console.log('✅ SPACE OWNER DASHBOARD: VideoLoader implementation starting', {
      layoutStructure: 'Fixed Sidebar (320px): KPI Line Items + Recent Messages | Main Area: Bookings/Spaces',
      spacingImprovements: 'Compact KPI line items, spacious main content area',
      loadingAnimationType: 'VideoLoader with 3-second branded animation',
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
          totalRevenue: 2450,
          activeListings: 3,
          pendingInstalls: 2,
          completedBookings: 15
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
      
      // Fallback data
      setStats({
        totalRevenue: 2450,
        activeListings: 3,
        pendingInstalls: 2,
        completedBookings: 15
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate derived stats
  const totalPendingRevenue = bookings
    .filter(b => b.status === 'pending_install')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // ✅ SIMPLE KPI LINE ITEM - Just Text, No Card Styling (Same as Advertiser Dashboard)
  const KPILineItem = ({ 
    title, 
    value, 
    change, 
    trend, 
    icon: Icon, 
    highlighted = false,
    prefix = '',
    suffix = ''
  }) => (
    <div className={`flex items-center justify-between py-2 ${highlighted ? 'text-red-600' : 'text-gray-700'}`}>
      <div className="flex items-center space-x-2">
        <Icon className="w-4 h-4" style={{ color: '#4668AB' }} />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="text-right">
        <span className="text-sm font-bold text-gray-900">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </span>
        {change && (
          <div className={`flex items-center justify-end text-xs ${
            trend === 'up' ? 'text-emerald-600' : 
            trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'up' && <ArrowUp className="w-3 h-3 mr-1" />}
            {trend === 'down' && <ArrowDown className="w-3 h-3 mr-1" />}
            {change}
          </div>
        )}
      </div>
    </div>
  );

  // ✅ COMPACT Booking Card for Table-like Display
  const BookingCard = ({ booking }) => {
    const isExpanded = expandedBooking === booking.id;
    
    const getStatusBadge = (status) => {
      const badges = {
        'pending_install': {
          color: 'bg-yellow-100 text-yellow-700',
          icon: Clock,
          text: 'Awaiting Installation'
        },
        'active': {
          color: 'bg-green-100 text-green-700',
          icon: CheckCircle,
          text: 'Campaign Active'
        },
        'materials_shipped': {
          color: 'bg-blue-100 text-blue-700',
          icon: Truck,
          text: 'Materials In Transit'
        }
      };
      
      const badge = badges[status] || badges['active'];
      return (
        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
          <badge.icon className="w-3 h-3 mr-1" />
          {badge.text}
        </span>
      );
    };

    return (
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
        <td className="py-3 px-6">
          <div>
            <div className="font-semibold text-gray-900 text-sm">
              {booking.advertiserName || 'Advertiser Name'}
            </div>
            <div className="text-xs text-gray-500 mt-1 flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {booking.spaceName || 'Space Name'}
            </div>
          </div>
        </td>
        <td className="py-3 px-6">
          <div className="text-sm">
            <div className="font-semibold text-gray-900">
              {booking.startDate && booking.endDate 
                ? `${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}`
                : 'N/A'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {typeof booking.totalAmount === 'number' ? `$${booking.totalAmount.toLocaleString()} revenue` : 'N/A'}
            </div>
          </div>
        </td>
        <td className="py-3 px-6">
          {getStatusBadge(booking.status || 'active')}
        </td>
        <td className="py-3 px-6">
          <button className="text-blue-600 hover:text-blue-800 font-medium text-xs hover:underline transition-colors">
            View Details
          </button>
        </td>
      </tr>
    );
  };

  // ✅ COMPACT Listing Card for Table-like Display
  const ListingCard = ({ listing }) => {
    return (
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
        <td className="py-3 px-6">
          <div className="flex items-center">
            <div className="flex-1">
              <div className="font-semibold text-gray-900 text-sm flex items-center">
                {listing.name || 'Listing Name'}
                {listing.verificationBadge && (
                  <CheckCircle className="w-3 h-3 text-green-600 ml-2" />
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">{listing.type || 'Type'}</div>
            </div>
          </div>
        </td>
        <td className="py-3 px-6">
          <div className="text-sm">
            <div className="font-semibold text-gray-900">
              {listing.dimensions || 'N/A'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {typeof listing.price === 'number' ? `$${listing.price}/month` : 'N/A'}
            </div>
          </div>
        </td>
        <td className="py-3 px-6">
          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
            listing.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {listing.status === 'active' ? 'Active' : listing.status || 'N/A'}
          </span>
        </td>
        <td className="py-3 px-6">
          <button className="text-blue-600 hover:text-blue-800 font-medium text-xs hover:underline transition-colors">
            Edit Listing
          </button>
        </td>
      </tr>
    );
  };

  // ✅ ENHANCED BOOKINGS TABLE
  const EnhancedBookingsTable = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Active & Pending Bookings</h3>
          <span className="text-sm text-gray-600">
            ${totalPendingRevenue.toLocaleString()} pending revenue
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Booking Details</th>
              <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Campaign Period</th>
              <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Status</th>
              <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-8 text-center">
                  <div className="flex flex-col items-center">
                    <Calendar className="w-12 h-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600 mb-4">Once advertisers book your spaces, you'll see them here.</p>
                    <button 
                      onClick={() => setActiveTab('listings')}
                      className="text-white px-4 py-2 rounded-lg hover:opacity-90 inline-flex items-center text-sm transition-opacity"
                      style={{ backgroundColor: '#4668AB' }}
                    >
                      View Your Listings
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ✅ ENHANCED LISTINGS TABLE
  const EnhancedListingsTable = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Your Ad Spaces</h3>
          <button 
            onClick={() => navigate('/list-space')}
            className="inline-flex items-center px-4 py-2 text-sm font-bold text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            style={{ 
              background: 'linear-gradient(135deg, #4668AB 0%, #5B7BC7 100%)',
              boxShadow: '0 4px 12px rgba(70, 104, 171, 0.2)'
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Space
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Space Details</th>
              <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Dimensions & Price</th>
              <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Status</th>
              <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.length > 0 ? (
              listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-8 text-center">
                  <div className="flex flex-col items-center">
                    <Building2 className="w-12 h-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No spaces listed</h3>
                    <p className="text-gray-600 mb-4">Start earning by listing your available advertising spaces.</p>
                    <button 
                      onClick={() => navigate('/list-space')}
                      className="text-white px-4 py-2 rounded-lg hover:opacity-90 inline-flex items-center text-sm transition-opacity"
                      style={{ backgroundColor: '#4668AB' }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      List Your First Space
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ✅ UPDATED: Loading state now uses VideoLoader
  if (isLoading) {
    console.log('⏳ OWNER DASHBOARD: Showing VideoLoader');
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-4"
        style={{ 
          background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'
        }}
      >
        <div className="text-center">
          <VideoLoader 
            size="xl"
            theme="brand"
            message="Loading space owner dashboard..."
            showMessage={true}
            centered={true}
            containerClassName="mb-4"
          />
        </div>
      </div>
    );
  }

  // ✅ UPDATED: Error state with consistent styling
  if (error) {
    console.log('❌ OWNER DASHBOARD: Showing error state:', error);
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-4"
        style={{ 
          background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'
        }}
      >
        <div className="text-center p-8 rounded-xl bg-white shadow-lg">
          <p className="text-red-600 mb-4 font-semibold">{error}</p>
          <button 
            onClick={() => {
              console.log('🔄 OWNER DASHBOARD: Retrying after error');
              fetchDashboardData();
            }}
            className="px-6 py-3 rounded-lg text-white font-bold hover:opacity-90 transition-opacity"
            style={{ 
              background: 'linear-gradient(135deg, #4668AB 0%, #5B7BC7 100%)'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex"
      style={{ 
        background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'
      }}
    >
      {/* Success Message */}
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

      {/* ✅ LEFT SIDEBAR - Fixed Width with KPI Line Items + Recent Messages */}
      <div 
        className="fixed left-0 top-14 bottom-0 w-80 bg-white shadow-xl border-r border-gray-200 overflow-y-auto"
        style={{ 
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFBFF 100%)'
        }}
      >
        <div className="p-4">
          {/* ✅ KPI METRICS SECTION - Simple Line Items */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" style={{ color: '#4668AB' }} />
              Performance Metrics
            </h2>
            <div className="space-y-1">
              <KPILineItem
                title="Total Revenue"
                value={stats.totalRevenue}
                change="+15%"
                trend="up"
                icon={DollarSign}
                prefix="$"
              />
              <KPILineItem
                title="Active Spaces"
                value={stats.activeListings}
                change="+1"
                trend="up"
                icon={Building2}
              />
              <KPILineItem
                title="Pending Installs"
                value={stats.pendingInstalls}
                change="+2"
                trend="up"
                icon={Clock}
                highlighted={stats.pendingInstalls > 0}
              />
              <KPILineItem
                title="Completed Bookings"
                value={stats.completedBookings}
                change="+3"
                trend="up"
                icon={CheckCircle}
              />
            </div>
          </div>

          {/* ✅ RECENT MESSAGES SECTION - Same as Advertiser Dashboard */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
              <Activity className="w-4 h-4 mr-2" style={{ color: '#4668AB' }} />
              Recent Messages
            </h2>
            <div className="space-y-3">
              {recentMessages.map((message, index) => (
                <div 
                  key={message.id}
                  className="rounded-lg p-3 hover:shadow-sm transition-all duration-200 cursor-pointer relative border"
                  style={{ 
                    background: message.priority === 'high' ? '#FEF3F2' : '#FFFFFF',
                    borderColor: message.priority === 'high' ? '#FCA5A5' : '#E2E8F0'
                  }}
                >
                  {message.priority === 'high' && !message.isRead && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <div className="text-lg flex-shrink-0">
                      {message.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-gray-900 truncate">{message.sender}</p>
                        <p className="text-xs text-gray-500">{message.timestamp}</p>
                      </div>
                      <p className="text-xs text-gray-700 line-clamp-2">{message.preview}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                className="w-full text-center py-2 text-xs font-semibold rounded-lg transition-colors hover:bg-blue-50"
                style={{ color: '#4668AB' }}
              >
                View All Messages
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ MAIN CONTENT AREA */}
      <div className="flex-1 ml-80 p-6">
        <div className="max-w-6xl">
          {/* ✅ HEADER SECTION */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Space Management</h1>
          </div>

          {/* ✅ TAB NAVIGATION */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`py-3 px-2 text-sm font-semibold border-b-2 transition-all duration-200 ${
                    activeTab === 'bookings'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Bookings
                </button>
                <button
                  onClick={() => setActiveTab('listings')}
                  className={`py-3 px-2 text-sm font-semibold border-b-2 transition-all duration-200 ${
                    activeTab === 'listings'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Spaces
                </button>
              </nav>
            </div>
          </div>

          {/* ✅ TAB CONTENT */}
          <div>
            {activeTab === 'bookings' ? <EnhancedBookingsTable /> : <EnhancedListingsTable />}
          </div>
        </div>
      </div>
    </div>
  );
}