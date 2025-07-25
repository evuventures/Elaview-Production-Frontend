// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken(): Promise<string>;
      };
    };
  }
}

import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TypedCard = Card as React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;
const TypedCardContent = CardContent as React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;
const TypedCardHeader = CardHeader as React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;
const TypedCardTitle = CardTitle as React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;
import {
  Loader2, Plus, Eye, Heart, Calendar, Clock, 
  MapPin, DollarSign, CheckCircle, AlertCircle, 
  TrendingUp, Zap, Phone, Mail, Settings,
  ArrowRight, ExternalLink, Play, Pause, MessageSquare,
  Shield, Image as ImageIcon, BarChart3, Crown, Building2,
  Edit, Camera, Users, Filter, Search, Bell, User,
  ChevronRight, MoreHorizontal, Target, Activity,
  // ✅ Role toggle icons and new feature icons
  Megaphone, Home, Upload, CreditCard, Star, 
  Bookmark, FileText, CalendarDays, UserCircle,
  ThumbsUp, PieChart, ImagePlus, Receipt,
  // ✅ Creative upload icons
  X, Download, Trash2, FileImage, Video, File
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ✅ Same interfaces as before
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
  propertyId?: string;
  areaId?: string;
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

// ✅ NEW: Creative Asset interface
interface CreativeAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  size: number;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
  bookingId?: string;
  notes?: string;
  publicId?: string;
}

// ✅ Role type updated
type UserRole = 'advertiser' | 'property_owner';

export default function Dashboard() {
  // ✅ Your existing state
  const [activeTab, setActiveTab] = useState<'bookings' | 'creative' | 'payments' | 'analytics' | 'reviews' | 'saved' | 'listings' | 'calendar' | 'profile'>('bookings');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalSpent: 0, activeAds: 0, totalImpressions: 0, avgROI: '0x',
    totalProperties: 0, activeProperties: 0, pendingBookings: 0,
    monthlyRevenue: 0, totalRevenue: 0, occupancyRate: 0
  });

  // ✅ NEW: Role management state
  const [userRole, setUserRole] = useState<UserRole>('advertiser');
  const [canSwitchRoles, setCanSwitchRoles] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { user: currentUser } = useUser();

  // ✅ Your existing apiCall function - NO CHANGES
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

  // ✅ ADD: Role detection helper
  const detectUserRole = (loadedBookings: Booking[], loadedProperties: Property[]): UserRole => {
    const hasBookings = loadedBookings.length > 0;
    const hasProperties = loadedProperties.length > 0;
    
    if (hasProperties && !hasBookings) return 'property_owner';
    if (hasBookings && !hasProperties) return 'advertiser';
    if (hasProperties) return 'property_owner'; // Default to property owner if both
    return 'advertiser';
  };

  // ✅ MODIFIED: Your loadData function - only added role detection at the end
  const loadData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('🔄 Loading complete dashboard data...');

      let loadedBookings: Booking[] = [];
      let loadedProperties: Property[] = [];

      // Load bookings (your existing code - NO CHANGES)
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
        setBookings([]);
      }

      // Load properties (your existing code - NO CHANGES)
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
        setProperties([]);
      }

      // Load booking requests (your existing code - NO CHANGES)
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
        setBookingRequests([]);
      }

      // ✅ NEW: Role detection and setup
      const detectedRole = detectUserRole(loadedBookings, loadedProperties);
      setUserRole(detectedRole);
      setCanSwitchRoles(true); // Always allow switching

      // Auto-set appropriate tab
      setActiveTab('bookings'); // Always start with bookings for both roles

      // Calculate combined stats (your existing code - NO CHANGES)
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

  // ✅ Your existing useEffects - NO CHANGES
  useEffect(() => {
    if (!isLoading && bookings.length > 0 && properties.length === 0) {
      setActiveTab('bookings');
    } else if (!isLoading && properties.length > 0 && bookings.length === 0) {
      setActiveTab('bookings');
    }
  }, [isLoading, bookings.length, properties.length]);

  useEffect(() => {
    if (isSignedIn && isLoaded) {
      loadData();
    }
  }, [isSignedIn, isLoaded]);

  // ✅ NEW: Role change handler
  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    // Reset to bookings tab when switching roles
    setActiveTab('bookings');
    console.log(`✅ Role switched to: ${newRole}`);
  };

  // ✅ Your existing handlers - NO CHANGES
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

  // ✅ Your existing renderStatusBadge - NO CHANGES
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

  // ✅ NEW: Get tabs based on role
  const getTabs = () => {
    if (userRole === 'advertiser') {
      return [
        { id: 'bookings', label: 'Manage Bookings', icon: Calendar },
        { id: 'creative', label: 'Creative Assets', icon: Upload },
        { id: 'payments', label: 'Payment History', icon: CreditCard },
        { id: 'analytics', label: 'Campaign Analytics', icon: BarChart3 },
        { id: 'reviews', label: 'Give Reviews', icon: Star },
        { id: 'saved', label: 'Saved Listings', icon: Bookmark }
      ];
    } else {
      return [
        { id: 'bookings', label: 'Manage Bookings', icon: Calendar },
        { id: 'creative', label: 'Review Creatives', icon: Eye },
        { id: 'payments', label: 'Payment History', icon: CreditCard },
        { id: 'analytics', label: 'Listing Analytics', icon: PieChart },
        { id: 'listings', label: 'Manage Listings', icon: Building2 },
        { id: 'calendar', label: 'Calendar', icon: CalendarDays },
        { id: 'profile', label: 'Business Profile', icon: UserCircle },
        { id: 'reviews', label: 'Reviews Received', icon: ThumbsUp }
      ];
    }
  };

  // ✅ Your existing loading state - NO CHANGES
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

  // ✅ NEW: Role-aware stats
  const getDisplayStats = () => {
    if (userRole === 'property_owner') {
      return [
        { icon: DollarSign, value: `$${dashboardStats.totalRevenue.toLocaleString()}`, label: 'Total Revenue', color: 'text-emerald-400' },
        { icon: Building2, value: dashboardStats.activeProperties, label: 'Active Properties', color: 'text-lime-400' },
        { icon: Clock, value: dashboardStats.pendingBookings, label: 'Pending Requests', color: 'text-amber-400' },
        { icon: TrendingUp, value: `${dashboardStats.occupancyRate}%`, label: 'Occupancy Rate', color: 'text-cyan-400' }
      ];
    } else {
      return [
        { icon: DollarSign, value: `$${dashboardStats.totalSpent.toLocaleString()}`, label: 'Total Spent', color: 'text-emerald-400' },
        { icon: Zap, value: dashboardStats.activeAds, label: 'Active Ads', color: 'text-lime-400' },
        { icon: Target, value: dashboardStats.totalImpressions.toLocaleString(), label: 'Impressions', color: 'text-amber-400' },
        { icon: TrendingUp, value: dashboardStats.avgROI, label: 'Avg ROI', color: 'text-cyan-400' }
      ];
    }
  };

  // ✅ NEW: Render tab content based on active tab and role
  const renderTabContent = () => {
    switch (activeTab) {
      case 'bookings':
        return (
          <div className="space-y-6">
            {userRole === 'property_owner' && bookingRequests.filter(r => r.status === 'pending').length > 0 && (
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
                <h3 className="text-xl font-bold text-white mb-3">
                  {userRole === 'advertiser' ? 'No active ads yet' : 'No bookings yet'}
                </h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  {userRole === 'advertiser' 
                    ? 'Start advertising by booking your first space'
                    : 'Your booking requests will appear here'
                  }
                </p>
                {userRole === 'advertiser' && (
                  <Button
                    asChild
                    className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold transition-all duration-300"
                  >
                    <Link to={createPageUrl('Map')}>
                      <Plus className="w-5 h-5 mr-2" />
                      Browse Spaces
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        );

      case 'creative':
        return <CreativeAssetsTab userRole={userRole} apiCall={apiCall} currentUser={currentUser} renderStatusBadge={renderStatusBadge} />;

      case 'payments':
        return (
          <div className="space-y-6">
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Payment History</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                View your transaction history and invoices
              </p>
              <Button className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold">
                <Receipt className="w-5 h-5 mr-2" />
                View Transactions
              </Button>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                {userRole === 'advertiser' ? (
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                ) : (
                  <PieChart className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {userRole === 'advertiser' ? 'Campaign Analytics' : 'Listing Analytics'}
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                {userRole === 'advertiser' 
                  ? 'Track your advertising campaign performance'
                  : 'View performance metrics for your listings'
                }
              </p>
              <Button className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold">
                <TrendingUp className="w-5 h-5 mr-2" />
                View Analytics
              </Button>
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div className="space-y-6">
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                {userRole === 'advertiser' ? (
                  <Star className="w-8 h-8 text-gray-400" />
                ) : (
                  <ThumbsUp className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {userRole === 'advertiser' ? 'Give Reviews' : 'Reviews Received'}
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                {userRole === 'advertiser' 
                  ? 'Rate and review the properties you\'ve advertised on'
                  : 'View reviews from advertisers who used your spaces'
                }
              </p>
              <Button className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold">
                <Star className="w-5 h-5 mr-2" />
                {userRole === 'advertiser' ? 'Write Review' : 'View Reviews'}
              </Button>
            </div>
          </div>
        );

      case 'saved':
        return (
          <div className="space-y-6">
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bookmark className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Saved Listings</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Your watchlist of interesting advertising spaces
              </p>
              <Button
                asChild
                className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold"
              >
                <Link to={createPageUrl('Map')}>
                  <Search className="w-5 h-5 mr-2" />
                  Find Spaces to Save
                </Link>
              </Button>
            </div>
          </div>
        );

      case 'listings':
        return (
          <div className="space-y-6">
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
        );

      case 'calendar':
        return (
          <div className="space-y-6">
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarDays className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Calendar & Scheduling</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Manage availability and booking schedules for your properties
              </p>
              <Button className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold">
                <Calendar className="w-5 h-5 mr-2" />
                View Calendar
              </Button>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Business Profile</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Manage your business information and profile settings
              </p>
              <Button className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold">
                <Edit className="w-5 h-5 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const displayStats = getDisplayStats();
  const tabs = getTabs();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 space-y-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">

        {/* ✅ MODIFIED: Header with repositioned role toggle */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-gray-700/50">
            <div className="p-6 md:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0 ${
                    userRole === 'property_owner' ? 'bg-cyan-400' : 'bg-lime-400'
                  }`}>
                    {userRole === 'property_owner' ? (
                      <Home className="w-6 h-6 md:w-8 md:h-8 text-gray-900" />
                    ) : (
                      <Megaphone className="w-6 h-6 md:w-8 md:h-8 text-gray-900" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                      {userRole === 'property_owner' ? 'Property Owner Dashboard' : 'Advertiser Dashboard'}
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base">
                      {userRole === 'property_owner' ? 'Manage your properties and bookings' : 'Track your advertising campaigns'}
                    </p>
                  </div>
                </div>

                {/* ✅ MODIFIED: Role toggle moved above action buttons */}
                <div className="flex flex-col gap-3 lg:flex-shrink-0">
                  {/* ✅ NEW: Role toggle positioned first */}
                  {canSwitchRoles && (
                    <div className="flex items-center justify-center lg:justify-end">
                      <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-1">
                        <button
                          onClick={() => handleRoleChange('advertiser')}
                          className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                            userRole === 'advertiser' ? 'bg-lime-400 text-gray-900' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Advertiser
                        </button>
                        <button
                          onClick={() => handleRoleChange('property_owner')}
                          className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                            userRole === 'property_owner' ? 'bg-cyan-400 text-gray-900' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Property Owner
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ✅ Action buttons positioned below role toggle */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {userRole === 'advertiser' && (
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
                    {userRole === 'property_owner' && (
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
          </div>
        </motion.div>

        {/* ✅ MODIFIED: Role-specific stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {displayStats.map((stat, index) => (
              <motion.div key={index} whileHover={{ scale: 1.02, y: -5 }} className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl">
                <div className="p-4 md:p-6 text-center">
                  <stat.icon className={`w-6 h-6 md:w-8 md:h-8 ${stat.color} mx-auto mb-3`} />
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ✅ NEW: Role-specific tabs */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-700/50 px-6 py-4">
            <div className="flex space-x-2 md:space-x-4 overflow-x-auto">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 pb-2 px-2 text-sm font-semibold border-b-2 transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-lime-400 text-lime-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ✅ NEW: Dynamic tab content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ NEW: Creative Assets Tab Component
const CreativeAssetsTab: React.FC<{
  userRole: UserRole;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<any>;
  currentUser: any;
  renderStatusBadge: (status: string) => JSX.Element;
}> = ({ userRole, apiCall, currentUser, renderStatusBadge }) => {
  const [creatives, setCreatives] = useState<CreativeAsset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // ✅ NEW: Preview modal state
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    creative: CreativeAsset | null;
  }>({ isOpen: false, creative: null });

  const openPreview = (creative: CreativeAsset) => {
    setPreviewModal({ isOpen: true, creative });
  };

  const closePreview = () => {
    setPreviewModal({ isOpen: false, creative: null });
  };

  // Load existing creatives
  useEffect(() => {
    loadCreatives();
  }, []);

  const loadCreatives = async () => {
    try {
      const response = await apiCall('/creatives');
      if (response?.success && Array.isArray(response.data)) {
        setCreatives(response.data.map((creative: any) => ({
          id: creative.id,
          name: creative.name || creative.filename,
          type: creative.type || getFileType(creative.filename),
          url: creative.url,
          size: creative.size || 0,
          uploadDate: creative.createdAt,
          status: creative.status || 'pending',
          bookingId: creative.bookingId,
          notes: creative.notes,
          publicId: creative.publicId
        })));
      }
    } catch (error) {
      console.warn('Failed to load creatives:', error);
      // Load mock data for demo
      setCreatives([
        {
          id: '1',
          name: 'Summer_Campaign_2024.jpg',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
          size: 2048576,
          uploadDate: '2024-01-15T10:30:00Z',
          status: 'approved',
          bookingId: 'booking_1'
        },
        {
          id: '2',
          name: 'Product_Video_Ad.mp4',
          type: 'video',
          url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4',
          size: 15728640,
          uploadDate: '2024-01-14T14:20:00Z',
          status: 'pending',
          bookingId: 'booking_2'
        }
      ]);
    }
  };

  const getFileType = (filename: string): 'image' | 'video' | 'document' => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image';
    if (['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(ext || '')) return 'video';
    return 'document';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    
    for (const file of selectedFiles) {
      const fileId = `${file.name}_${Date.now()}`;
      
      try {
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        // ✅ CLOUDINARY UPLOAD
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'creative_uploads'); // Use your actual preset name
        
        // Optional: Add folder organization
        formData.append('folder', 'creatives');
        
        // Optional: Add tags for organization
        formData.append('tags', `advertiser_${currentUser?.id || 'unknown'}`);
        
        // Upload to Cloudinary
        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${getCloudinaryResourceType(file)}/upload`,
          {
            method: 'POST',
            body: formData
          }
        );
        
        if (!cloudinaryResponse.ok) {
          throw new Error('Cloudinary upload failed');
        }
        
        const cloudinaryResult = await cloudinaryResponse.json();
        setUploadProgress(prev => ({ ...prev, [fileId]: 50 }));
        
        // ✅ SAVE METADATA TO YOUR DATABASE
        const creativeData = {
          name: file.name,
          type: getFileType(file.name),
          url: cloudinaryResult.secure_url, // Permanent Cloudinary URL
          publicId: cloudinaryResult.public_id, // For deletions/transformations
          size: file.size,
          format: cloudinaryResult.format,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          status: 'pending'
        };
        
        const dbResponse = await apiCall('/creatives', {
          method: 'POST',
          body: JSON.stringify(creativeData)
        });
        
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        
        // Add to local state
        const newCreative: CreativeAsset = {
          id: dbResponse.data?.id || fileId, // Use real DB ID
          name: file.name,
          type: getFileType(file.name),
          url: cloudinaryResult.secure_url,
          size: file.size,
          uploadDate: new Date().toISOString(),
          status: 'pending',
          publicId: cloudinaryResult.public_id
        };
        
        setCreatives(prev => [newCreative, ...prev]);
        
      } catch (error) {
        console.error('Upload failed for:', file.name, error);
        setUploadProgress(prev => ({ ...prev, [fileId]: -1 })); // Indicate error
        // Show error notification to user
      }
    }
    
    setSelectedFiles([]);
    setUploadProgress({});
    setIsUploading(false);
  };

  // ✅ Helper function to determine Cloudinary resource type
  const getCloudinaryResourceType = (file: File): string => {
    const fileType = getFileType(file.name);
    switch (fileType) {
      case 'video': return 'video';
      case 'image': return 'image';
      default: return 'raw'; // For documents
    }
  };

  const deleteCreative = async (id: string) => {
    try {
      // ✅ DELETE FROM DATABASE FIRST
      await apiCall(`/creatives/${id}`, { method: 'DELETE' });
      
      // ✅ DELETE FROM CLOUDINARY (optional - you can keep files for backup)
      // You'll need the publicId from your database
      // const creative = creatives.find(c => c.id === id);
      // if (creative?.publicId) {
      //   await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/destroy`, {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       public_id: creative.publicId,
      //       api_key: import.meta.env.VITE_CLOUDINARY_API_KEY,
      //       timestamp: Math.floor(Date.now() / 1000),
      //       signature: generateCloudinarySignature() // You'd need to implement this
      //     })
      //   });
      // }
      
      setCreatives(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete creative:', error);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return FileImage;
      case 'video': return Video;
      default: return File;
    }
  };

  // ✅ NEW: Component for rendering file previews
  const FilePreview: React.FC<{ creative: CreativeAsset; size?: 'small' | 'large' }> = ({ 
    creative, 
    size = 'small' 
  }) => {
    const dimensions = size === 'large' ? 'w-24 h-24' : 'w-10 h-10';
    
    if (creative.type === 'image') {
      return (
        <div className={`${dimensions} rounded-lg overflow-hidden bg-gray-600 flex-shrink-0`}>
          <img 
            src={creative.url} 
            alt={creative.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to icon if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden w-full h-full flex items-center justify-center">
            <FileImage className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      );
    }
    
    if (creative.type === 'video') {
      return (
        <div className={`${dimensions} rounded-lg overflow-hidden bg-gray-600 flex-shrink-0 relative`}>
          <video 
            src={creative.url} 
            className="w-full h-full object-cover"
            muted
            onError={(e) => {
              // Fallback to icon if video fails to load
              const target = e.target as HTMLVideoElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden w-full h-full flex items-center justify-center absolute inset-0">
            <Video className="w-6 h-6 text-gray-400" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Play className="w-4 h-4 text-white" />
          </div>
        </div>
      );
    }
    
    // Document fallback
    return (
      <div className={`${dimensions} bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0`}>
        <File className="w-6 h-6 text-gray-400" />
      </div>
    );
  };

  if (userRole === 'property_owner') {
    // Property owner view - Review creatives
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Creative Assets to Review</h2>
          <Badge variant="secondary" className="bg-amber-500 text-white">
            {creatives.filter(c => c.status === 'pending').length} pending
          </Badge>
        </div>

        {creatives.filter(c => c.status === 'pending').length > 0 ? (
          <div className="space-y-4">
            {creatives.filter(c => c.status === 'pending').map((creative) => {
              return (
                <div key={creative.id} className="bg-gray-800 border border-gray-600 rounded-xl p-4">
                  <div className="flex items-start gap-4">
                    <FilePreview creative={creative} size="large" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{creative.name}</h3>
                      <p className="text-sm text-gray-400">
                        {formatFileSize(creative.size)} • Uploaded {new Date(creative.uploadDate).toLocaleDateString()}
                      </p>
                      {creative.bookingId && (
                        <p className="text-sm text-blue-400">Booking: {creative.bookingId}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openPreview(creative)}
                        className="text-gray-300 border-gray-600 hover:bg-gray-600"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-400 border-red-500/50 hover:bg-red-500/10">
                        Reject
                      </Button>
                      <Button size="sm" className="bg-lime-400 hover:bg-lime-500 text-gray-900">
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No pending creatives</h3>
            <p className="text-gray-400">Creative assets awaiting review will appear here</p>
          </div>
        )}
      </div>
    );
  }

  // Advertiser view - Upload and manage creatives
  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Upload Creative Assets</h2>
        
        {/* Drag & Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            dragActive 
              ? 'border-lime-400 bg-lime-400/10' 
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Drag & drop files here, or click to browse
          </h3>
          <p className="text-gray-400 mb-4">
            Support for images, videos, and documents up to 50MB
          </p>
          <input
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <Button asChild variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-600">
            <label htmlFor="file-upload" className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Choose Files
            </label>
          </Button>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Selected Files ({selectedFiles.length})</h3>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => {
                const IconComponent = getFileIcon(getFileType(file.name));
                const fileId = `${file.name}_${Date.now()}`;
                const progress = uploadProgress[fileId] || 0;
                
                return (
                  <div key={index} className="flex items-center gap-3 bg-gray-700/50 rounded-lg p-3">
                    <IconComponent className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{file.name}</p>
                      <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                      {isUploading && progress > 0 && (
                        <div className="w-full bg-gray-600 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-lime-400 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    {!isUploading && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSelectedFile(index)}
                        className="text-gray-400 hover:text-red-400 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center gap-3 mt-4">
              <Button
                onClick={uploadFiles}
                disabled={isUploading}
                className="bg-lime-400 hover:bg-lime-500 text-gray-900"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
              {!isUploading && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedFiles([])}
                  className="border-gray-600 text-gray-300 hover:bg-gray-600"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Existing Creatives */}
      <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Your Creative Assets ({creatives.length})</h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-lime-400 text-gray-900">
              {creatives.filter(c => c.status === 'approved').length} approved
            </Badge>
            <Badge variant="secondary" className="bg-amber-500 text-white">
              {creatives.filter(c => c.status === 'pending').length} pending
            </Badge>
            <Badge variant="secondary" className="bg-red-500 text-white">
              {creatives.filter(c => c.status === 'rejected').length} rejected
            </Badge>
          </div>
        </div>

        {creatives.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creatives.map((creative) => {
              return (
                <div key={creative.id} className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-4 hover:bg-gray-700/50 transition-all duration-300">
                  <div className="flex items-start gap-3 mb-3">
                    <FilePreview creative={creative} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{creative.name}</h3>
                      <p className="text-sm text-gray-400">{formatFileSize(creative.size)}</p>
                    </div>
                    {renderStatusBadge(creative.status)}
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-3">
                    Uploaded {new Date(creative.uploadDate).toLocaleDateString()}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openPreview(creative)}
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-600"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteCreative(creative.id)}
                      className="text-red-400 border-red-500/50 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <ImagePlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No creative assets yet</h3>
            <p className="text-gray-400">Upload your first creative asset to get started</p>
          </div>
        )}
      </div>

      {/* ✅ NEW: Preview Modal */}
      {previewModal.isOpen && previewModal.creative && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-600 rounded-xl max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <div>
                <h3 className="text-lg font-semibold text-white">{previewModal.creative.name}</h3>
                <p className="text-sm text-gray-400">
                  {formatFileSize(previewModal.creative.size)} • {previewModal.creative.type}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={closePreview}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-4 max-h-[70vh] overflow-auto">
              {previewModal.creative.type === 'image' && (
                <img 
                  src={previewModal.creative.url} 
                  alt={previewModal.creative.name}
                  className="max-w-full max-h-full mx-auto rounded-lg"
                />
              )}
              
              {previewModal.creative.type === 'video' && (
                <video 
                  src={previewModal.creative.url} 
                  controls
                  className="max-w-full max-h-full mx-auto rounded-lg"
                >
                  Your browser does not support the video tag.
                </video>
              )}
              
              {previewModal.creative.type === 'document' && (
                <div className="text-center py-8">
                  <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-white mb-2">Document Preview</p>
                  <p className="text-gray-400 mb-4">
                    Cannot preview this file type directly
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-gray-600 text-gray-300 hover:bg-gray-600"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};