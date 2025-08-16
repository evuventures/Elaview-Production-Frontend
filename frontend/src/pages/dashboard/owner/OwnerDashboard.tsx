// Space Owner Dashboard - Enhanced with Glassmorphism & Edge-to-Edge Mobile Design
// ✅ EDGE-TO-EDGE: Native mobile layout with zero container padding on mobile
// ✅ GLASSMORPHISM: Premium glass containers with immersive edge-to-edge experience
// ✅ NAVIGATION AWARE: Respects navbar height calculations
// ✅ CONDENSED LAYOUT: Optimized line items to fit within available height
// ✅ BUSINESS CONTEXT: Tailored for B2B space management needs

import React, { useState, useEffect } from 'react';
import {
  Plus, Building2, Calendar, Package, Camera,
  DollarSign, Clock, CheckCircle, AlertCircle,
  Eye, Upload, ChevronRight, MapPin, FileText,
  Download, Truck, Navigation, Star, TrendingUp, X,
  BarChart3, Activity, ArrowUp, ArrowDown, Loader2
} from 'lucide-react';

// ✅ GLASSMORPHISM: Enhanced Z-Index Scale for glass layering
const Z_INDEX = {
  BACKGROUND: 1,
  GLASS_CONTAINERS: 10,
  GLASS_OVERLAYS: 15,
  CONTENT: 20,
  MODAL_BACKDROP: 50,
  MODAL_CONTENT: 55,
  DROPDOWN: 60,
  TOAST: 70
};

// ✅ EDGE-TO-EDGE: Navigation heights for native mobile experience
const NAVIGATION_HEIGHTS = {
  DESKTOP: 64, // h-16 = 64px from navbar
  MOBILE_TOP: 64, // h-16 = 64px from mobile navbar  
  MOBILE_BOTTOM: 80 // Estimated mobile bottom nav height
};

// ✅ EDGE-TO-EDGE: Desktop keeps padding, mobile goes edge-to-edge
const CONTAINER_PADDING = {
  DESKTOP: 24, // Desktop maintains spacing for premium look
  MOBILE: 0    // Mobile goes edge-to-edge for native feel
};

// ✅ EDGE-TO-EDGE: Calculate CSS values for native mobile experience
const CSS_VALUES = {
  DESKTOP_TOTAL_PADDING: NAVIGATION_HEIGHTS.DESKTOP + (CONTAINER_PADDING.DESKTOP * 2),
  MOBILE_TOTAL_PADDING: NAVIGATION_HEIGHTS.MOBILE_TOP + NAVIGATION_HEIGHTS.MOBILE_BOTTOM + (CONTAINER_PADDING.MOBILE * 2),
  DESKTOP_TOP_PADDING: NAVIGATION_HEIGHTS.DESKTOP + CONTAINER_PADDING.DESKTOP,
  MOBILE_TOP_PADDING: NAVIGATION_HEIGHTS.MOBILE_TOP + CONTAINER_PADDING.MOBILE,
  MOBILE_BOTTOM_PADDING: NAVIGATION_HEIGHTS.MOBILE_BOTTOM + CONTAINER_PADDING.MOBILE
};

// ✅ GLASSMORPHISM: Enhanced Loading Component
const EnterpriseLoader = ({ 
  size = "md", 
  theme = "brand", 
  message = "", 
  showMessage = false,
  centered = false,
  className = ""
}) => {
  const sizeClasses = {
    xs: "w-4 h-4",
    sm: "w-6 h-6", 
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  const themeColors = {
    brand: "#4668AB",
    white: "#FFFFFF",
    gray: "#6B7280"
  };

  return (
    <div className={`${centered ? 'flex flex-col items-center justify-center' : ''} ${className}`}>
      <div 
        className={`${sizeClasses[size]} animate-spin rounded-full border-3 border-t-transparent`}
        style={{
          borderColor: `${themeColors[theme]}33`,
          borderTopColor: themeColors[theme],
          background: `conic-gradient(from 0deg, ${themeColors[theme]}00, ${themeColors[theme]})`
        }}
      />
      {showMessage && message && (
        <p 
          className="mt-3 text-sm font-medium"
          style={{ color: themeColors[theme] }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default function SpaceOwnerDashboardMVP() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Simulated user for demo
  const user = { id: 'demo-user-123', firstName: 'John', lastName: 'Doe' };
  const userLoaded = true;
  
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

  // ✅ EDGE-TO-EDGE: Enhanced console logging for mobile native experience
  useEffect(() => {
    console.log('🎨 SPACE OWNER DASHBOARD GLASSMORPHISM: Native mobile styling applied', {
      navigationHeights: NAVIGATION_HEIGHTS,
      containerPadding: CONTAINER_PADDING,
      calculatedValues: CSS_VALUES,
      glassmorphismOptimizations: [
        'EDGE-TO-EDGE: Mobile containers extend to screen edges',
        'FLOATING GLASS: Premium glass containers with backdrop blur',
        'NAVIGATION AWARE: Respects navbar height calculations',
        'CONDENSED LAYOUT: Optimized KPI line items for height constraints',
        'BRAND CONSISTENCY: Matches messages page styling patterns',
        'RESPONSIVE DESIGN: Desktop preserves premium spacing'
      ],
      timestamp: new Date().toISOString()
    });
  }, []);

  // Handle success message simulation
  useEffect(() => {
    // Simulate success message for demo
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  }, []);

  // Simulate data loading
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
      console.log('🔄 Simulating dashboard data fetch for user:', user.id);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful response
      console.log('✅ Dashboard data received (simulated)');
      setStats({
        totalRevenue: 2450,
        activeListings: 3,
        pendingInstalls: 2,
        completedBookings: 15
      });
      
      // Mock bookings data
      setBookings([
        {
          id: '1',
          advertiserName: 'Tech Startup Inc.',
          spaceName: 'Downtown Billboard #1',
          startDate: '2025-01-15',
          endDate: '2025-02-15',
          totalAmount: 3200,
          status: 'pending_install'
        },
        {
          id: '2',
          advertiserName: 'Fashion Brand Co.',
          spaceName: 'Mall Display Screen',
          startDate: '2025-01-10',
          endDate: '2025-01-31',
          totalAmount: 1800,
          status: 'active'
        },
        {
          id: '3',
          advertiserName: 'Local Restaurant',
          spaceName: 'Street Banner Location',
          startDate: '2025-01-20',
          endDate: '2025-02-20',
          totalAmount: 950,
          status: 'materials_shipped'
        }
      ]);
      
      // Mock listings data
      setListings([
        {
          id: '1',
          name: 'Downtown Billboard #1',
          type: 'Billboard',
          dimensions: '14x48 ft',
          price: 1200,
          status: 'active',
          verificationBadge: true
        },
        {
          id: '2',
          name: 'Mall Display Screen',
          type: 'Digital Display',
          dimensions: '6x4 ft',
          price: 800,
          status: 'active',
          verificationBadge: true
        },
        {
          id: '3',
          name: 'Street Banner Location',
          type: 'Banner',
          dimensions: '3x8 ft',
          price: 350,
          status: 'active',
          verificationBadge: false
        }
      ]);
      
    } catch (err) {
      console.error('❌ Dashboard error (simulated):', err);
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

  // ✅ CONDENSED KPI LINE ITEM - Optimized for height constraints
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
    <div className={`flex items-center justify-between py-1.5 ${highlighted ? 'text-red-600' : 'text-gray-700'}`}>
      <div className="flex items-center space-x-2">
        <Icon className="w-3.5 h-3.5" style={{ color: '#4668AB' }} />
        <span className="text-xs font-medium">{title}</span>
      </div>
      <div className="text-right">
        <span className="text-xs font-bold text-gray-900">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </span>
        {change && (
          <div className={`flex items-center justify-end text-xs ${
            trend === 'up' ? 'text-emerald-600' : 
            trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'up' && <ArrowUp className="w-2.5 h-2.5 mr-0.5" />}
            {trend === 'down' && <ArrowDown className="w-2.5 h-2.5 mr-0.5" />}
            {change}
          </div>
        )}
      </div>
    </div>
  );

  // ✅ COMPACT Booking Card for Table-like Display
  const BookingCard = ({ booking }) => {
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

  // ✅ ENHANCED BOOKINGS TABLE with glassmorphism
  const EnhancedBookingsTable = () => (
    <div 
      className="rounded-2xl overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* Glass reflection overlay */}
      <div 
        className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
          zIndex: Z_INDEX.GLASS_OVERLAYS
        }}
      />

      <div className="relative" style={{ zIndex: Z_INDEX.CONTENT }}>
        <div 
          className="px-6 py-4 border-b relative"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.4) 100%)',
            backdropFilter: 'blur(15px) saturate(150%)',
            borderBottomColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>
              Active & Pending Bookings
            </h3>
            <span className="text-sm text-gray-600" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'}}>
              ${totalPendingRevenue.toLocaleString()} pending revenue
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead 
              style={{
                background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(248, 250, 252, 0.9) 100%)',
                backdropFilter: 'blur(10px)'
              }}
            >
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>
                        No bookings yet
                      </h3>
                      <p className="text-gray-600 mb-4" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'}}>
                        Once advertisers book your spaces, you'll see them here.
                      </p>
                      <button 
                        onClick={() => console.log('Navigation: View Your Listings')}
                        className="text-white px-4 py-2 rounded-lg hover:opacity-90 inline-flex items-center text-sm transition-all duration-300 relative overflow-hidden"
                        style={{ 
                          background: 'linear-gradient(135deg, #4668AB 0%, #5B7BC7 100%)',
                          boxShadow: '0 4px 16px rgba(70, 104, 171, 0.3)'
                        }}
                      >
                        <div 
                          className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-lg"
                          style={{
                            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%)'
                          }}
                        />
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
    </div>
  );

  // ✅ ENHANCED LISTINGS TABLE with glassmorphism
  const EnhancedListingsTable = () => (
    <div 
      className="rounded-2xl overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* Glass reflection overlay */}
      <div 
        className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
          zIndex: Z_INDEX.GLASS_OVERLAYS
        }}
      />

      <div className="relative" style={{ zIndex: Z_INDEX.CONTENT }}>
        <div 
          className="px-6 py-4 border-b relative"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.4) 100%)',
            backdropFilter: 'blur(15px) saturate(150%)',
            borderBottomColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>
              Your Ad Spaces
            </h3>
            <button 
              onClick={() => console.log('Navigation: /list-space')}
              className="inline-flex items-center px-4 py-2 text-sm font-bold text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, #4668AB 0%, #5B7BC7 100%)',
                boxShadow: '0 4px 12px rgba(70, 104, 171, 0.2)'
              }}
            >
              <div 
                className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-lg"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%)'
                }}
              />
              <Plus className="w-4 h-4 mr-2 relative z-10" />
              <span className="relative z-10">Add Space</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead 
              style={{
                background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(248, 250, 252, 0.9) 100%)',
                backdropFilter: 'blur(10px)'
              }}
            >
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>
                        No spaces listed
                      </h3>
                      <p className="text-gray-600 mb-4" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'}}>
                        Start earning by listing your available advertising spaces.
                      </p>
                      <button 
                        onClick={() => console.log('Navigation: /list-space')}
                        className="text-white px-4 py-2 rounded-lg hover:opacity-90 inline-flex items-center text-sm transition-all duration-300 relative overflow-hidden"
                        style={{ 
                          background: 'linear-gradient(135deg, #4668AB 0%, #5B7BC7 100%)',
                          boxShadow: '0 4px 16px rgba(70, 104, 171, 0.3)'
                        }}
                      >
                        <div 
                          className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-lg"
                          style={{
                            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%)'
                          }}
                        />
                        <Plus className="w-4 h-4 mr-2 relative z-10" />
                        <span className="relative z-10">List Your First Space</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ✅ GLASSMORPHISM: Enhanced loading state
  if (isLoading) {
    return (
      <div 
        className="dashboard-loading-state relative"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #F8FAFF 0%, #E8F2FF 50%, #F0F8FF 100%)'
        }}
      >
        {/* Enhanced background pattern */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 198, 119, 0.3) 0%, transparent 50%)'
          }}
        />
        
        <div className="flex items-center justify-center" style={{ height: '100vh' }}>
          <div 
            className="relative rounded-2xl p-8 text-center max-w-md mx-4 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)',
              zIndex: Z_INDEX.GLASS_CONTAINERS
            }}
          >
            <div 
              className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
                zIndex: Z_INDEX.GLASS_OVERLAYS
              }}
            />
            
            <div style={{ zIndex: Z_INDEX.CONTENT }} className="relative">
              <EnterpriseLoader 
                size="xl"
                theme="brand"
                message="Loading space owner dashboard..."
                showMessage={true}
                centered={true}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ GLASSMORPHISM: Enhanced error state
  if (error) {
    return (
      <div 
        className="dashboard-loading-state relative"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #FFF8F8 0%, #FFE8E8 50%, #FFF0F0 100%)'
        }}
      >
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 20% 80%, rgba(239, 68, 68, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.2) 0%, transparent 50%)'
          }}
        />
        
        <div className="flex items-center justify-center" style={{ height: '100vh' }}>
          <div 
            className="relative rounded-2xl p-8 text-center max-w-md mx-4 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15), 0 4px 16px rgba(239, 68, 68, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)',
              zIndex: Z_INDEX.GLASS_CONTAINERS
            }}
          >
            <div 
              className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
                zIndex: Z_INDEX.GLASS_OVERLAYS
              }}
            />
            
            <div style={{ zIndex: Z_INDEX.CONTENT }} className="relative">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="px-6 py-3 rounded-lg text-white font-bold hover:opacity-90 transition-all duration-300 relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex dashboard-container"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #F8FAFF 0%, #E8F2FF 25%, #F0F8FF 50%, #E8F2FF 75%, #F8FAFF 100%)'
      }}
    >
      {/* ✅ GLASSMORPHISM: Enhanced background with subtle patterns */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 198, 119, 0.1) 0%, transparent 50%)',
          zIndex: Z_INDEX.BACKGROUND
        }}
      />

      {/* ✅ EDGE-TO-EDGE: Mobile goes full-width, desktop maintains premium spacing */}
      <style>{`
        /* ✅ EDGE-TO-EDGE: Desktop layout with premium spacing */
        @media (min-width: 768px) {
          .dashboard-container {
            padding: ${CONTAINER_PADDING.DESKTOP}px;
            padding-top: ${CSS_VALUES.DESKTOP_TOP_PADDING}px;
            padding-bottom: ${CONTAINER_PADDING.DESKTOP}px;
          }
          .glassmorphism-sidebar {
            height: calc(100vh - ${CSS_VALUES.DESKTOP_TOTAL_PADDING}px) !important;
            max-height: calc(100vh - ${CSS_VALUES.DESKTOP_TOTAL_PADDING}px) !important;
          }
          .glassmorphism-main {
            height: calc(100vh - ${CSS_VALUES.DESKTOP_TOTAL_PADDING}px) !important;
            max-height: calc(100vh - ${CSS_VALUES.DESKTOP_TOTAL_PADDING}px) !important;
          }
        }
        
        /* ✅ EDGE-TO-EDGE: Mobile native edge-to-edge layout */
        @media (max-width: 767px) {
          .dashboard-container {
            padding: ${CONTAINER_PADDING.MOBILE}px;
            padding-top: ${CSS_VALUES.MOBILE_TOP_PADDING}px;
            padding-bottom: ${CSS_VALUES.MOBILE_BOTTOM_PADDING}px;
          }
          .glassmorphism-sidebar {
            height: calc(100vh - ${CSS_VALUES.MOBILE_TOTAL_PADDING}px) !important;
            max-height: calc(100vh - ${CSS_VALUES.MOBILE_TOTAL_PADDING}px) !important;
            /* ✅ EDGE-TO-EDGE: Mobile containers extend to edges */
            border-radius: 0 !important;
            border-left: none !important;
            border-right: none !important;
          }
          .glassmorphism-main {
            height: calc(100vh - ${CSS_VALUES.MOBILE_TOTAL_PADDING}px) !important;
            max-height: calc(100vh - ${CSS_VALUES.MOBILE_TOTAL_PADDING}px) !important;
            /* ✅ EDGE-TO-EDGE: Mobile containers extend to edges */
            border-radius: 0 !important;
            border-left: none !important;
            border-right: none !important;
          }
          
          /* ✅ EDGE-TO-EDGE: Remove spacing between containers on mobile */
          .dashboard-container > div {
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
        }
        
        /* ✅ CRITICAL: Prevent any scrolling */
        .dashboard-container, .glassmorphism-sidebar, .glassmorphism-main {
          overflow: hidden !important;
        }
        
        /* ✅ EDGE-TO-EDGE: Loading states respect the same patterns */
        .dashboard-loading-state {
          padding: ${CONTAINER_PADDING.DESKTOP}px !important;
        }
        
        @media (min-width: 768px) {
          .dashboard-loading-state {
            padding-top: ${CSS_VALUES.DESKTOP_TOP_PADDING}px !important;
            padding-bottom: ${CONTAINER_PADDING.DESKTOP}px !important;
          }
        }
        
        @media (max-width: 767px) {
          .dashboard-loading-state {
            padding: ${CONTAINER_PADDING.MOBILE}px !important;
            padding-top: ${CSS_VALUES.MOBILE_TOP_PADDING}px !important;
            padding-bottom: ${CSS_VALUES.MOBILE_BOTTOM_PADDING}px !important;
          }
        }
      `}</style>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div 
            className="rounded-lg p-4 shadow-lg relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.15) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}
          >
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

      {/* ✅ GLASSMORPHISM: FLOATING SIDEBAR */}
      <div 
        className="glassmorphism-sidebar w-80 md:mr-6 rounded-2xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)',
          zIndex: Z_INDEX.GLASS_CONTAINERS
        }}
      >
        {/* Glass reflection overlay */}
        <div 
          className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
            zIndex: Z_INDEX.GLASS_OVERLAYS
          }}
        />

        <div className="flex flex-col relative h-full overflow-y-auto" style={{ zIndex: Z_INDEX.CONTENT }}>
          <div className="p-4">
            {/* ✅ CONDENSED KPI METRICS SECTION */}
            <div className="mb-4">
              <h2 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" style={{ color: '#4668AB' }} />
                Performance Metrics
              </h2>
              <div className="space-y-0.5">
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

            {/* ✅ CONDENSED RECENT MESSAGES SECTION */}
            <div>
              <h2 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                <Activity className="w-4 h-4 mr-2" style={{ color: '#4668AB' }} />
                Recent Messages
              </h2>
              <div className="space-y-2">
                {recentMessages.map((message, index) => (
                  <div 
                    key={message.id}
                    className="rounded-lg p-2.5 hover:shadow-sm transition-all duration-200 cursor-pointer relative border"
                    style={{ 
                      background: message.priority === 'high' ? 'rgba(254, 243, 242, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                      borderColor: message.priority === 'high' ? 'rgba(252, 165, 165, 0.5)' : 'rgba(226, 232, 240, 0.5)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {message.priority === 'high' && !message.isRead && (
                      <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    )}
                    
                    <div className="flex items-start space-x-2">
                      <div className="text-sm flex-shrink-0">
                        {message.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-xs font-semibold text-gray-900 truncate">{message.sender}</p>
                          <p className="text-xs text-gray-500">{message.timestamp}</p>
                        </div>
                        <p className="text-xs text-gray-700 line-clamp-2">{message.preview}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  className="w-full text-center py-1.5 text-xs font-semibold rounded-lg transition-colors hover:bg-blue-50"
                  style={{ color: '#4668AB' }}
                >
                  View All Messages
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ GLASSMORPHISM: MAIN CONTENT AREA */}
      <div 
        className="glassmorphism-main flex-1 rounded-2xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)',
          zIndex: Z_INDEX.GLASS_CONTAINERS
        }}
      >
        {/* Glass reflection overlay */}
        <div 
          className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
            zIndex: Z_INDEX.GLASS_OVERLAYS
          }}
        />

        <div className="flex flex-col relative h-full" style={{ zIndex: Z_INDEX.CONTENT }}>
          {/* ✅ GLASSMORPHISM: Enhanced Header */}
          <div 
            className="flex-shrink-0 p-6 relative"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.4) 100%)',
              backdropFilter: 'blur(15px) saturate(150%)',
              WebkitBackdropFilter: 'blur(15px) saturate(150%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <h1 className="text-2xl font-bold text-gray-900" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>
              Space Management
            </h1>

            {/* ✅ TAB NAVIGATION */}
            <div className="mt-4">
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
          </div>

          {/* ✅ TAB CONTENT */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'bookings' ? <EnhancedBookingsTable /> : <EnhancedListingsTable />}
          </div>
        </div>
      </div>
    </div>
  );
}