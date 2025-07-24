// Easy Role-Based Dashboard - Minimal Changes from Your Current Code
import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Keep all your existing imports and types
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Plus, Eye, Heart, Calendar, Clock, 
  MapPin, DollarSign, CheckCircle, AlertCircle, 
  TrendingUp, Zap, Phone, Mail, Settings,
  ArrowRight, ExternalLink, Play, Pause, MessageSquare,
  Shield, Image as ImageIcon, BarChart3, Crown, Building2,
  Edit, Camera, Users, Filter, Search, Bell, User,
  ChevronRight, MoreHorizontal, Target, Activity,
  ToggleLeft, ToggleRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Keep all your existing interfaces (Booking, Property, etc.)
interface Booking {
  id: string;
  spaceName?: string;
  location?: string;
  status: 'live' | 'pending' | 'approved' | 'ended' | 'rejected' | string;
  startDate: string;
  endDate: string;
  dailyRate?: number;
  totalCost: number;
  businessName?: string;
  creativeUrl?: string;
  impressions?: number;
  ctr?: number;
}

interface Property {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'draft' | 'pending' | 'inactive';
  spacesCount: number;
  activeBookings: number;
  monthlyEarnings: number;
  totalEarnings: number;
  createdDate: string;
}

interface BookingRequest {
  id: string;
  propertyId: string;
  spaceName: string;
  advertiserName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  creativeUrl?: string;
  submittedDate: string;
}

interface DashboardStats {
  totalSpent: number;
  activeAds: number;
  totalImpressions: number;
  avgROI: string;
  totalProperties: number;
  activeProperties: number;
  pendingBookings: number;
  monthlyRevenue: number;
  totalRevenue: number;
  occupancyRate: number;
}

// ✅ NEW: User role detection - but always allow manual override
type UserRole = 'buyer' | 'seller' | 'both';

const detectUserRole = (bookings: Booking[], properties: Property[]): UserRole => {
  const hasBookings = bookings.length > 0;
  const hasProperties = properties.length > 0;
  
  if (hasBookings && hasProperties) return 'both';
  if (hasProperties) return 'seller';
  return 'buyer'; // Default to buyer for new users
};

const canSwitchRoles = (bookings: Booking[], properties: Property[]): boolean => {
  // Allow role switching if user has any data OR we want to let them explore both views
  return true; // Always allow switching for better UX
};

export default function RoleBasedDashboard() {
  // ✅ Keep all your existing state
  const [activeTab, setActiveTab] = useState<'ads' | 'properties'>('ads');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalSpent: 0, activeAds: 0, totalImpressions: 0, avgROI: '0x',
    totalProperties: 0, activeProperties: 0, pendingBookings: 0,
    monthlyRevenue: 0, totalRevenue: 0, occupancyRate: 0
  });

  // ✅ NEW: Add role state  
  const [userRole, setUserRole] = useState<UserRole>('buyer');
  const [showRoleToggle, setShowRoleToggle] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { user: currentUser } = useUser();

  // ✅ Keep your existing apiCall function unchanged
  const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    
    let authToken = '';
    try {
      if (window.Clerk?.session) {
        authToken = await window.Clerk.session.getToken();
      }
    } catch (error) {
      console.error('Failed to get auth token:', error);
      throw new Error('Authentication failed');
    }

    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  };

  // ✅ Keep your existing loadData function - just add role detection at the end
  const loadData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('🔄 Loading dashboard data...');

      // Keep all your existing API calls unchanged
      let loadedBookings: Booking[] = [];
      let loadedProperties: Property[] = [];

      // Load bookings
      try {
        const bookingsResponse = await apiCall('/bookings');
        if (bookingsResponse?.success && Array.isArray(bookingsResponse.data)) {
          loadedBookings = bookingsResponse.data.map((booking: any) => ({
            id: booking.id,
            spaceName: booking.advertisingArea?.name || 'Advertising Space',
            location: booking.property?.address || `${booking.property?.city}, ${booking.property?.state}`,
            status: booking.status?.toLowerCase() || 'pending',
            startDate: booking.startDate,
            endDate: booking.endDate,
            dailyRate: booking.dailyRate || 450,
            totalCost: booking.totalAmount || 0,
            businessName: booking.businessName || currentUser?.firstName,
            impressions: booking.impressions || 0,
            ctr: booking.ctr || 0
          }));
          setBookings(loadedBookings);
        }
      } catch (error) {
        console.warn('⚠️ Bookings API failed:', error);
      }

      // Load properties
      try {
        const propertiesResponse = await apiCall('/properties');
        if (propertiesResponse?.success && Array.isArray(propertiesResponse.data)) {
          loadedProperties = propertiesResponse.data.map((property: any) => ({
            id: property.id,
            name: property.title || property.name || 'Property',
            address: property.address || `${property.city}, ${property.state}`,
            status: property.status?.toLowerCase() || 'draft',
            spacesCount: property.advertising_areas?.length || 1,
            activeBookings: 0,
            monthlyEarnings: 0,
            totalEarnings: 0,
            createdDate: property.createdAt
          }));
          setProperties(loadedProperties);
        }
      } catch (error) {
        console.warn('⚠️ Properties API failed:', error);
      }

      // Load booking requests
      try {
        const requestsResponse = await apiCall('/bookings/requests');
        if (requestsResponse?.success && Array.isArray(requestsResponse.data)) {
          setBookingRequests(requestsResponse.data.map((request: any) => ({
            id: request.id,
            propertyId: request.propertyId,
            spaceName: request.spaceName || 'Ad Space',
            advertiserName: request.advertiserName || 'Advertiser',
            startDate: request.startDate,
            endDate: request.endDate,
            totalAmount: request.totalAmount || 0,
            status: request.status || 'pending',
            submittedDate: request.createdAt
          })));
        }
      } catch (error) {
        console.warn('⚠️ Booking requests API failed:', error);
      }

      // ✅ NEW: Detect user role and set appropriate defaults
      const detectedRole = detectUserRole(loadedBookings, loadedProperties);
      setUserRole(detectedRole);
      setShowRoleToggle(canSwitchRoles(loadedBookings, loadedProperties)); // Always true now
      
      // Set default tab based on role, but allow manual switching
      if (detectedRole === 'seller') {
        setActiveTab('properties');
      } else {
        setActiveTab('ads');
      }

      // Calculate stats (keep your existing logic)
      const stats: DashboardStats = {
        totalSpent: loadedBookings.reduce((sum, b) => sum + b.totalCost, 0),
        activeAds: loadedBookings.filter(b => b.status === 'live').length,
        totalImpressions: loadedBookings.reduce((sum, b) => sum + (b.impressions || 0), 0),
        avgROI: '3.2x',
        totalProperties: loadedProperties.length,
        activeProperties: loadedProperties.filter(p => p.status === 'active').length,
        pendingBookings: bookingRequests.filter(r => r.status === 'pending').length,
        monthlyRevenue: 0,
        totalRevenue: 0,  
        occupancyRate: 85
      };
      setDashboardStats(stats);

    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Keep all your existing useEffects and handler functions unchanged
  useEffect(() => {
    if (isSignedIn && isLoaded) {
      loadData();
    }
  }, [isSignedIn, isLoaded]);

  const handleApproveBooking = async (bookingId: string) => {
    try {
      await apiCall(`/bookings/${bookingId}/approve`, { method: 'POST' });
      setBookingRequests(prev => 
        prev.map(req => req.id === bookingId ? { ...req, status: 'approved' } : req)
      );
    } catch (error) {
      console.error('Failed to approve booking:', error);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      await apiCall(`/bookings/${bookingId}/reject`, { method: 'POST' });
      setBookingRequests(prev => 
        prev.map(req => req.id === bookingId ? { ...req, status: 'rejected' } : req)
      );
    } catch (error) {
      console.error('Failed to reject booking:', error);
    }
  };

  // Keep your existing renderStatusBadge function
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      live: { color: 'bg-lime-400 text-gray-900', icon: Play, text: 'Live' },
      active: { color: 'bg-lime-400 text-gray-900', icon: Play, text: 'Live' },
      pending: { color: 'bg-amber-500 text-white', icon: Clock, text: 'Pending' },
      approved: { color: 'bg-blue-500 text-white', icon: CheckCircle, text: 'Approved' },
      rejected: { color: 'bg-red-500 text-white', icon: AlertCircle, text: 'Rejected' },
      ended: { color: 'bg-gray-500 text-white', icon: Pause, text: 'Ended' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge variant="secondary" className={`${config.color} border-0 font-medium`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  // ✅ NEW: Role-specific stats (minimal change)
  const getDisplayStats = () => {
    if (userRole === 'seller') {
      return [
        { icon: DollarSign, value: `$${dashboardStats.totalRevenue.toLocaleString()}`, label: 'Total Revenue', color: 'text-emerald-400' },
        { icon: Building2, value: dashboardStats.activeProperties, label: 'Active Properties', color: 'text-lime-400' },
        { icon: Clock, value: dashboardStats.pendingBookings, label: 'Pending Requests', color: 'text-amber-400' },
        { icon: TrendingUp, value: `${dashboardStats.occupancyRate}%`, label: 'Occupancy Rate', color: 'text-cyan-400' }
      ];
    } else if (userRole === 'buyer') {
      return [
        { icon: DollarSign, value: `$${dashboardStats.totalSpent.toLocaleString()}`, label: 'Total Spent', color: 'text-emerald-400' },
        { icon: Zap, value: dashboardStats.activeAds, label: 'Active Ads', color: 'text-lime-400' },
        { icon: Target, value: dashboardStats.totalImpressions.toLocaleString(), label: 'Impressions', color: 'text-amber-400' },
        { icon: TrendingUp, value: dashboardStats.avgROI, label: 'Avg ROI', color: 'text-cyan-400' }
      ];
    } else {
      // Both - combined stats
      return [
        { icon: DollarSign, value: `$${(dashboardStats.totalSpent + dashboardStats.totalRevenue).toLocaleString()}`, label: 'Total Activity', color: 'text-emerald-400' },
        { icon: Zap, value: dashboardStats.activeAds + dashboardStats.activeProperties, label: 'Active Items', color: 'text-lime-400' },
        { icon: Clock, value: dashboardStats.pendingBookings, label: 'Pending Actions', color: 'text-amber-400' },
        { icon: TrendingUp, value: dashboardStats.avgROI, label: 'Performance', color: 'text-cyan-400' }
      ];
    }
  };

  // Keep your existing loading state
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 bg-lime-400 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl">
            <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-gray-900" />
          </div>
          <p className="text-gray-300 font-semibold text-base md:text-lg">
            {!isLoaded ? 'Loading authentication...' : 'Loading your dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  const displayStats = getDisplayStats();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 space-y-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">

        {/* ✅ MODIFIED: Header with role toggle */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-gray-700/50">
            <div className="p-6 md:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-lime-400 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
                    <Crown className="w-6 h-6 md:w-8 md:h-8 text-gray-900" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl md:text-3xl font-bold text-white">
                        {userRole === 'seller' ? 'Property Dashboard' : 
                         userRole === 'buyer' ? 'Advertiser Dashboard' : 
                         'Complete Dashboard'}
                      </h1>
                      {/* ✅ NEW: Always show role toggle for better UX */}
                      {showRoleToggle && (
                        <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-1">
                          <button
                            onClick={() => {
                              setUserRole('buyer');
                              setActiveTab('ads');
                            }}
                            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                              userRole === 'buyer' ? 'bg-lime-400 text-gray-900' : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            Buyer View
                          </button>
                          <button
                            onClick={() => {
                              setUserRole('seller');
                              setActiveTab('properties');
                            }}
                            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                              userRole === 'seller' ? 'bg-lime-400 text-gray-900' : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            Seller View
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm md:text-base">
                      {userRole === 'seller' ? 'Manage your properties and bookings' :
                       userRole === 'buyer' ? 'Track your advertising campaigns' :
                       'Manage your advertising and properties'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                  {userRole !== 'seller' && (
                    <Button
                      asChild
                      className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <Link to={createPageUrl('Map')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Find New Spaces
                      </Link>
                    </Button>
                  )}
                  {userRole !== 'buyer' && (
                    <Button
                      asChild
                      variant="outline"
                      className="border-gray-600 text-gray-300 rounded-xl font-bold hover:bg-gray-700 hover:text-white transition-all duration-300"
                    >
                      <Link to={createPageUrl('CreateProperty')}>
                        <Plus className="w-4 h-4 mr-2" />
                        List Property
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ✅ MODIFIED: Role-specific stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {displayStats.map((stat, index) => (
              <motion.div key={index} whileHover={{ scale: 1.02, y: -5 }} className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl">
                <div className="p-4 md:p-6 text-center">
                  <stat.icon className={`w-6 h-6 md:w-8 md:h-8 ${stat.color} mx-auto mb-3`} />
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ✅ MODIFIED: Smart tab display - always show both options when toggle exists */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden">
          {showRoleToggle && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-700/50 px-6 py-4">
              <div className="flex space-x-6 md:space-x-8 overflow-x-auto">
                <button
                  onClick={() => {
                    setActiveTab('ads');
                    setUserRole('buyer');
                  }}
                  className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-all duration-300 whitespace-nowrap ${
                    activeTab === 'ads'
                      ? 'border-lime-400 text-lime-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  YOUR ADS ({bookings.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('properties');
                    setUserRole('seller');
                  }}
                  className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-all duration-300 whitespace-nowrap ${
                    activeTab === 'properties'
                      ? 'border-lime-400 text-lime-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  YOUR PROPERTIES ({properties.length})
                </button>
              </div>
            </div>
          )}

          {/* ✅ Keep your existing tab content completely unchanged */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {(activeTab === 'ads') ? (
                  /* Keep your existing Ads Tab Content unchanged */
                  <div className="space-y-6">
                    {bookings.length > 0 ? (
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                          <div key={booking.id} className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-4 hover:bg-gray-700/50 transition-all duration-300">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-white">{booking.spaceName}</h3>
                                  {renderStatusBadge(booking.status)}
                                </div>
                                <p className="text-sm text-gray-400 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {booking.location}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-lime-400">${booking.totalCost.toLocaleString()}</div>
                                <div className="text-sm text-gray-400">${Math.round(booking.dailyRate || 0)}/day</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 px-6">
                        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">No active ads yet</h3>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                          Start advertising by booking your first space
                        </p>
                        <Button
                          asChild
                          className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold transition-all duration-300"
                        >
                          <Link to={createPageUrl('Map')}>
                            <Plus className="w-5 h-5 mr-2" />
                            Browse Spaces
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Keep your existing Properties Tab Content unchanged */
                  <div className="space-y-6">
                    {bookingRequests.filter(r => r.status === 'pending').length > 0 && (
                      <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl">
                        <div className="border-b border-amber-500/30 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-amber-300">
                              <Clock className="w-5 h-5" />
                              Booking Requests Awaiting Approval
                            </span>
                            <Badge variant="secondary" className="bg-amber-500 text-white">
                              {bookingRequests.filter(r => r.status === 'pending').length} pending
                            </Badge>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="space-y-4">
                            {bookingRequests.filter(r => r.status === 'pending').map((request) => (
                              <div key={request.id} className="bg-gray-800 border border-gray-600 rounded-xl p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-white">{request.spaceName}</h4>
                                    <p className="text-sm text-gray-400">
                                      <strong>Advertiser:</strong> {request.advertiserName}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-lime-400 text-lg">${request.totalAmount.toLocaleString()}</div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-600">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-400 border-red-500/50 hover:bg-red-500/10"
                                    onClick={() => handleRejectBooking(request.id)}
                                  >
                                    Decline
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    className="bg-lime-400 hover:bg-lime-500 text-gray-900"
                                    onClick={() => handleApproveBooking(request.id)}
                                  >
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {properties.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {properties.map((property) => (
                          <div key={property.id} className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-4 hover:bg-gray-700/50 transition-all duration-300">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-white">{property.name}</h3>
                                <p className="text-sm text-gray-400">{property.address}</p>
                              </div>
                              <Badge variant={property.status === 'active' ? 'default' : 'secondary'} 
                                     className={property.status === 'active' ? 'bg-lime-400 text-gray-900' : 'bg-gray-600 text-gray-300'}>
                                {property.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                              <div>
                                <span className="text-gray-400 block">Ad Spaces</span>
                                <span className="font-semibold text-white">{property.spacesCount}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block">Bookings</span>
                                <span className="font-semibold text-white">{property.activeBookings}</span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white">
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white">
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 px-6">
                        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Building2 className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Start Earning from Your Spaces</h3>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                          List your advertising spaces to start earning revenue
                        </p>
                        <Button
                          asChild
                          className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold transition-all duration-300"
                        >
                          <Link to={createPageUrl('CreateProperty')}>
                            <Plus className="w-5 h-5 mr-2" />
                            List Your First Property
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}