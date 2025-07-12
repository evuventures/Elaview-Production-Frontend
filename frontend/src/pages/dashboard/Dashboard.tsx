// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DebugAuth from '@/dev/debug/DebugAuth';
import { isPast, differenceInDays } from 'date-fns';
// import MyPropertiesView from '../../components/dashboard/MyPropertiesView';
// import MyCampaignsView from '../../components/dashboard/MyCampaignsView';
import BookingDetailsModal from '../../components/booking/BookingDetailsModal';
import InvoiceModal from '../../components/invoices/InvoiceModal';

// Extracted components and hooks
import { useKPICalculations } from '@/hooks/useKPICalculations';
import KPIMetricsComponent from '@/components/dashboard/KPIMetrics.jsx';
const KPIMetrics = KPIMetricsComponent as any;

import {
  MessageSquare, AlertTriangle, FileText, CreditCard,
  Loader2, Plus, Building, BarChart3, Activity, Crown, ChevronRight,
  Eye, Users, Star, Filter, MoreHorizontal, Edit, Trash2, Play, 
  Pause, Timer, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ✅ TypeScript declarations
declare global {
  interface Window {
    Clerk: {
      session: {
        getToken(): Promise<string>;
      };
    };
  }
}

// Type assertions for JSX components
const CardComponent = Card as React.ComponentType<any>;
const CardContentComponent = CardContent as React.ComponentType<any>;
const CardHeaderComponent = CardHeader as React.ComponentType<any>;
const CardTitleComponent = CardTitle as React.ComponentType<any>;
const ButtonComponent = Button as React.ComponentType<any>;
const BadgeComponent = Badge as React.ComponentType<any>;

// --- Types ---
type Campaign = {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft' | string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  lastUpdated: string;
  advertiser_id: string;
};

type Property = {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'draft' | string;
  owner_id: string;
  created_date: string;
};

type Booking = {
  id: string;
  advertiser_id: string;
  owner_id: string;
  property_id: string;
  area_id: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_date: string;
};

type Invoice = {
  id: string;
  advertiser_id: string;
  owner_id: string;
  booking_id: string;
  status: string;
  amount: number;
};

type AdvertisingArea = {
  id: string;
  property_id: string;
  name: string;
};

type User = {
  id: string;
  full_name: string;
  email: string;
};

type ModalData =
  | { type: 'booking'; data: { booking: Booking; space: AdvertisingArea; property: Property } }
  | { type: 'invoice'; data: { invoice: Invoice; booking: Booking; space: AdvertisingArea; otherUser: User } }
  | { type: null; data: null };

type AreasMap = Record<string, AdvertisingArea>;
type PropertiesMap = Record<string, Property>;
type UsersMap = Record<string, User>;

// ✅ Helper function for time formatting
const formatTimeAgo = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    return 'Unknown';
  }
};

export default function DashboardPage() {
  const [view, setView] = useState<'campaigns' | 'properties' | string>('campaigns');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Data states - now using real API data
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [allAreasMap, setAllAreasMap] = useState<AreasMap>({});
  const [allPropertiesMap, setAllPropertiesMap] = useState<PropertiesMap>({});
  const [allUsers, setAllUsers] = useState<UsersMap>({});

  // Modal states
  const [modalData, setModalData] = useState<ModalData>({ type: null, data: null });
  const location = useLocation();
  const navigate = useNavigate();

  // Use Clerk instead of Base44
  const { isSignedIn, isLoaded } = useAuth();
  const { user: currentUser } = useUser();

  // Use the extracted KPI calculations hook
  const kpiData = useKPICalculations(currentUser as any, bookings, invoices, properties, campaigns);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentUser && !isLoading) {
      handleUrlParams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, currentUser, isLoading]);

  const handleUrlParams = async () => {
    const params = new URLSearchParams(location.search);
    const bookingId = params.get('booking_id');
    const invoiceId = params.get('invoice_id');

    if (bookingId) {
      try {
        const booking = bookings.find(b => b.id === bookingId)!;
        const space = allAreasMap[booking?.area_id];
        const property = allPropertiesMap[booking?.property_id];
        setModalData({ type: 'booking', data: { booking, space, property } });
      } catch (error) {
        console.error("Failed to load booking details from URL", error);
      }
    } else if (invoiceId) {
      try {
        const invoice = invoices.find(i => i.id === invoiceId)!;
        const booking = bookings.find(b => b.id === invoice?.booking_id)!;
        const space = allAreasMap[booking?.area_id];
        // @ts-ignore
        const otherUserId = invoice?.owner_id === currentUser?.id ? invoice.advertiser_id : invoice.owner_id;
        const otherUser = allUsers[otherUserId];
        setModalData({ type: 'invoice', data: { invoice, booking, space, otherUser } });
      } catch (error) {
        console.error("Failed to load invoice details from URL", error);
      }
    }
  };

  // ✅ UPDATED: Real API integration
  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Loading dashboard data from APIs...');

      // ✅ Real API calls instead of mock data
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      // Get authentication token
      let authToken = '';
      try {
        if (window.Clerk?.session) {
          authToken = await window.Clerk.session.getToken();
        }
      } catch (error) {
        console.error('❌ Failed to get auth token:', error);
        throw new Error('Authentication failed');
      }

      if (!authToken) {
        throw new Error('No authentication token available');
      }

      // Helper function for authenticated API calls
      const apiCall = async (endpoint: string) => {
        const response = await fetch(`${apiBaseUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API call failed: ${response.status} ${errorText}`);
        }

        return await response.json();
      };

      // ✅ Fetch real properties
      console.log('📡 Fetching properties...');
      try {
        const propertiesResponse = await apiCall('/properties');
        
        if (propertiesResponse.success && propertiesResponse.data) {
          // ✅ FIXED: Transform database properties to dashboard format with real status
          const transformedProperties = propertiesResponse.data.map((property: any) => ({
            id: property.id,
            name: property.title || property.name || 'Unnamed Property',
            address: property.address || `${property.city}, ${property.zipCode}`,
            status: property.status?.toLowerCase() || 'draft', // ✅ FIXED: Show real status, default to 'draft'
            owner_id: property.ownerId,
            created_date: property.createdAt
          }));
          
          setProperties(transformedProperties);
          console.log('✅ Properties loaded:', transformedProperties.length);
        } else {
          console.warn('⚠️ Properties API returned no data');
          setProperties([]);
        }
      } catch (error) {
        console.warn('⚠️ Properties API failed, using empty array:', error);
        setProperties([]);
      }

      // ✅ Fetch real campaigns  
      console.log('📡 Fetching campaigns...');
      try {
        const campaignsResponse = await apiCall('/campaigns');
        
        if (campaignsResponse.success && campaignsResponse.data) {
          // Transform database campaigns to dashboard format
          const transformedCampaigns = campaignsResponse.data.map((campaign: any) => ({
            id: campaign.id,
            name: campaign.name || campaign.title || 'Unnamed Campaign',
            status: campaign.status?.toLowerCase() || 'draft',
            budget: campaign.budget || campaign.totalBudget || 0,
            spent: campaign.totalSpent || 0,
            impressions: campaign.impressions || 0,
            clicks: campaign.clicks || 0,
            ctr: campaign.clicks && campaign.impressions ? ((campaign.clicks / campaign.impressions) * 100) : 0,
            conversions: campaign.conversions || 0,
            lastUpdated: campaign.updatedAt ? formatTimeAgo(campaign.updatedAt) : 'Unknown',
            advertiser_id: campaign.advertiserId
          }));
          
          setCampaigns(transformedCampaigns);
          console.log('✅ Campaigns loaded:', transformedCampaigns.length);
        } else {
          console.warn('⚠️ Campaigns API returned no data');
          setCampaigns([]);
        }
      } catch (error) {
        console.warn('⚠️ Campaigns API failed, using empty array:', error);
        setCampaigns([]);
      }

      // ✅ Fetch real bookings
      console.log('📡 Fetching bookings...');
      try {
        const bookingsResponse = await apiCall('/bookings');
        
        if (bookingsResponse.success && bookingsResponse.data) {
          // Transform database bookings to dashboard format
          const transformedBookings = bookingsResponse.data.map((booking: any) => ({
            id: booking.id,
            advertiser_id: booking.bookerId || booking.advertiserId,
            owner_id: booking.ownerId,
            property_id: booking.propertyId,
            area_id: booking.advertisingAreaId,
            status: booking.status?.toLowerCase() || 'pending',
            payment_status: booking.isPaid ? 'paid' : 'pending',
            total_amount: booking.totalAmount || 0,
            created_date: booking.createdAt
          }));
          
          setBookings(transformedBookings);
          console.log('✅ Bookings loaded:', transformedBookings.length);
        } else {
          console.warn('⚠️ Bookings API returned no data');
          setBookings([]);
        }
      } catch (error) {
        console.warn('⚠️ Bookings API failed, using empty array:', error);
        setBookings([]);
      }

      // ✅ Fetch real invoices
      console.log('📡 Fetching invoices...');
      try {
        const invoicesResponse = await apiCall('/invoices');
        
        if (invoicesResponse.success && invoicesResponse.data) {
          // Transform database invoices to dashboard format
          const transformedInvoices = invoicesResponse.data.map((invoice: any) => ({
            id: invoice.id,
            advertiser_id: invoice.userId, // Assuming userId is the advertiser
            owner_id: invoice.ownerId,
            booking_id: invoice.bookingId,
            status: invoice.status?.toLowerCase() || 'pending',
            amount: invoice.amount || 0
          }));
          
          setInvoices(transformedInvoices);
          console.log('✅ Invoices loaded:', transformedInvoices.length);
        } else {
          console.warn('⚠️ Invoices API returned no data');
          setInvoices([]);
        }
      } catch (error) {
        console.warn('⚠️ Invoices API failed, using empty array:', error);
        setInvoices([]);
      }

      // ✅ Create maps for quick lookup (simplified for now)
      setAllAreasMap({});
      setAllPropertiesMap({});
      setAllUsers({});

      console.log('🎉 Dashboard data loaded successfully from real APIs');

    } catch (error) {
      console.error("❌ Failed to load dashboard data:", error);
      
      // Fallback to empty data instead of mock data to encourage real API usage
      setCampaigns([]);
      setProperties([]);
      setBookings([]);
      setInvoices([]);
      setAllAreasMap({});
      setAllPropertiesMap({});
      setAllUsers({});
      
      // Don't show error alert in production - just log it
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Failed to load dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalData({ type: null, data: null });
    navigate(createPageUrl('Dashboard'), { replace: true });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 bg-gradient-brand rounded-2xl md:rounded-3xl flex items-center justify-center shadow-brand-lg">
            <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-white" />
          </div>
          <p className="text-muted-foreground font-semibold text-base md:text-lg">Loading authentication...</p>
        </div>
      </div>
    );
  }
  // eslint-disable-next-line no-console
  console.log('Current user:', currentUser);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 bg-gradient-brand rounded-2xl md:rounded-3xl flex items-center justify-center shadow-brand-lg">
            <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-white" />
          </div>
          <p className="text-muted-foreground font-semibold text-base md:text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-8">
      {/* <DebugAuth /> */}
      <div className="w-full max-w-7xl mx-auto space-y-8">

        {/* 1. Header with Primary Actions */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <CardComponent className="card-brand backdrop-blur-xl rounded-2xl md:rounded-3xl overflow-hidden shadow-brand">
            <CardContentComponent className="p-6 md:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-brand rounded-xl md:rounded-2xl flex items-center justify-center shadow-brand flex-shrink-0">
                    <Crown className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {currentUser?.fullName || currentUser?.firstName
                        ? `Welcome back, ${(currentUser?.fullName || currentUser?.firstName)?.split(' ')[0]}! 👋`
                        : 'Dashboard'
                      }
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                      {/* @ts-ignore */}
                      {currentUser?.publicMetadata?.role === 'admin' ? 'Manage platform' : 'Manage campaigns & properties'}
                    </p>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                  <ButtonComponent
                    asChild
                    className="btn-gradient rounded-xl font-bold transition-brand"
                  >
                    <Link to={createPageUrl('CreateCampaign')}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Campaign
                    </Link>
                  </ButtonComponent>
                  <ButtonComponent
                    asChild
                    variant="outline"
                    className="glass border border-border text-foreground rounded-xl font-bold hover:bg-primary/5 transition-brand"
                  >
                    <Link to={createPageUrl('CreateProperty')}>
                      <Plus className="w-4 h-4 mr-2" />
                      List Property
                    </Link>
                  </ButtonComponent>
                </div>
              </div>
            </CardContentComponent>
          </CardComponent>
        </motion.div>

        {/* 2. Compact KPI Row - Now using extracted component */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <KPIMetrics kpiData={kpiData} />
        </motion.div>

        {/* 3. Navigation Tabs */}
        <div className="card-brand backdrop-blur-xl border border-border rounded-2xl shadow-brand overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border px-6 py-4">
            <div className="flex space-x-6 md:space-x-8 overflow-x-auto">
              <button
                onClick={() => setView('campaigns')}
                className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-brand whitespace-nowrap ${
                  view === 'campaigns'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-primary'
                }`}
              >
                CAMPAIGNS ({campaigns.length})
              </button>
              <button
                onClick={() => setView('properties')}
                className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-brand whitespace-nowrap ${
                  view === 'properties'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-primary'
                }`}
              >
                PROPERTIES ({properties.length})
              </button>
              <button className="pb-2 px-1 text-sm font-semibold border-b-2 border-transparent text-muted-foreground hover:text-primary transition-brand whitespace-nowrap">
                ANALYTICS
              </button>
            </div>

            <div className="flex items-center space-x-3 mt-3 sm:mt-0">
              <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-brand">
                <Filter className="w-4 h-4" />
              </button>
              <ButtonComponent
                asChild
                variant="outline"
                className="glass border border-border text-foreground rounded-lg text-sm font-medium hover:bg-primary/5 transition-brand"
              >
                <Link to={createPageUrl('CreateProperty')}>
                  <Building className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">List Property</span>
                </Link>
              </ButtonComponent>
            </div>
          </div>

          {/* 4. Content Area */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {view === 'campaigns' ? (
                  <div className="space-y-6">
                    {campaigns.length > 0 ? (
                      <>
                        {/* Campaign Performance Table */}
                        <div>
                          <div className="mb-6">
                            <h2 className="text-lg font-bold text-foreground">Campaign Performance</h2>
                            <p className="text-sm text-muted-foreground mt-1">Track and manage your advertising campaigns</p>
                          </div>

                          {/* Desktop Table */}
                          <div className="hidden lg:block glass border border-border rounded-xl overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50">
                                    <th className="text-left py-3 px-6">Campaign</th>
                                    <th className="text-right py-3 px-4">Budget</th>
                                    <th className="text-right py-3 px-4">Spent</th>
                                    <th className="text-right py-3 px-4">Impressions</th>
                                    <th className="text-right py-3 px-4">Clicks</th>
                                    <th className="text-right py-3 px-4">CTR</th>
                                    <th className="text-right py-3 px-4">Conversions</th>
                                    <th className="text-right py-3 px-4">Last Updated</th>
                                    <th className="text-right py-3 px-6">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                  {campaigns.map((campaign) => (
                                    <tr key={campaign.id} className="hover:bg-muted/30 transition-colors group">
                                      <td className="py-4 px-6">
                                        <div className="flex items-center space-x-3">
                                          <div className={`w-3 h-3 rounded-full ${
                                            campaign.status === 'active' ? 'bg-emerald-500 animate-pulse' :
                                              campaign.status === 'paused' ? 'bg-amber-500' :
                                                'bg-gray-400'
                                          }`}></div>
                                          <div>
                                            <p className="font-semibold text-foreground">{campaign.name}</p>
                                            <p className={`text-xs font-medium uppercase tracking-wide ${
                                              campaign.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' :
                                                campaign.status === 'paused' ? 'text-amber-600 dark:text-amber-400' :
                                                  'text-gray-500 dark:text-gray-400'
                                            }`}>
                                              {campaign.status}
                                            </p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-4 px-4 text-right">
                                        <span className="font-semibold text-foreground">${campaign.budget?.toLocaleString() || '0'}</span>
                                      </td>
                                      <td className="py-4 px-4 text-right">
                                        <div>
                                          <span className="font-semibold text-foreground">${campaign.spent?.toLocaleString() || '0'}</span>
                                          <div className="w-16 bg-muted rounded-full h-1 mt-1">
                                            <div
                                              className="bg-gradient-brand h-1 rounded-full transition-all"
                                              style={{ width: `${campaign.budget ? (campaign.spent / campaign.budget) * 100 : 0}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-4 px-4 text-right">
                                        <span className="font-mono text-muted-foreground">{campaign.impressions?.toLocaleString() || '0'}</span>
                                      </td>
                                      <td className="py-4 px-4 text-right">
                                        <span className="font-mono text-muted-foreground">{campaign.clicks?.toLocaleString() || '0'}</span>
                                      </td>
                                      <td className="py-4 px-4 text-right">
                                        <span className={`font-semibold ${
                                          (campaign.ctr || 0) > 5 ? 'text-emerald-600 dark:text-emerald-400' :
                                            (campaign.ctr || 0) > 3 ? 'text-amber-600 dark:text-amber-400' :
                                              'text-gray-500 dark:text-gray-400'
                                        }`}>
                                          {campaign.ctr || 0}%
                                        </span>
                                      </td>
                                      <td className="py-4 px-4 text-right">
                                        <span className="font-semibold text-blue-600 dark:text-blue-400">{campaign.conversions || 0}</span>
                                      </td>
                                      <td className="py-4 px-4 text-right">
                                        <span className="text-sm text-muted-foreground">{campaign.lastUpdated || 'Unknown'}</span>
                                      </td>
                                      <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          {campaign.status === 'active' ? (
                                            <button className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors">
                                              <Pause className="w-4 h-4" />
                                            </button>
                                          ) : campaign.status === 'paused' ? (
                                            <button className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
                                              <Play className="w-4 h-4" />
                                            </button>
                                          ) : null}
                                          <button className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                                            <Edit className="w-4 h-4" />
                                          </button>
                                          <button className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                                            <MoreHorizontal className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Mobile Cards */}
                          <div className="lg:hidden space-y-4">
                            {campaigns.map((campaign) => (
                              <CardComponent key={campaign.id} className="glass border border-border">
                                <CardContentComponent className="p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                        campaign.status === 'active' ? 'bg-emerald-500 animate-pulse' :
                                          campaign.status === 'paused' ? 'bg-amber-500' :
                                            'bg-gray-400'
                                      }`}></div>
                                      <div className="min-w-0">
                                        <p className="font-semibold text-foreground truncate">{campaign.name}</p>
                                        <p className={`text-xs font-medium uppercase tracking-wide ${
                                          campaign.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' :
                                            campaign.status === 'paused' ? 'text-amber-600 dark:text-amber-400' :
                                              'text-gray-500 dark:text-gray-400'
                                        }`}>
                                          {campaign.status}
                                        </p>
                                      </div>
                                    </div>
                                    <button className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                  </div>

                                  {/* Budget Progress */}
                                  <div className="mb-3">
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="text-muted-foreground">Budget</span>
                                      <span className="font-semibold text-foreground">${campaign.spent?.toLocaleString() || '0'} / ${campaign.budget?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                      <div
                                        className="bg-gradient-brand h-2 rounded-full transition-all"
                                        style={{ width: `${campaign.budget ? (campaign.spent / campaign.budget) * 100 : 0}%` }}
                                      ></div>
                                    </div>
                                  </div>

                                  {/* Metrics Grid */}
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <span className="text-muted-foreground block">Impressions</span>
                                      <span className="font-semibold text-foreground">{campaign.impressions?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground block">Clicks</span>
                                      <span className="font-semibold text-foreground">{campaign.clicks?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground block">CTR</span>
                                      <span className={`font-semibold ${
                                        (campaign.ctr || 0) > 5 ? 'text-emerald-600 dark:text-emerald-400' :
                                          (campaign.ctr || 0) > 3 ? 'text-amber-600 dark:text-amber-400' :
                                            'text-gray-500 dark:text-gray-400'
                                      }`}>
                                        {campaign.ctr || 0}%
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground block">Conversions</span>
                                      <span className="text-blue-600 dark:text-blue-400 font-semibold">{campaign.conversions || 0}</span>
                                    </div>
                                  </div>

                                  <div className="mt-3 pt-3 border-t border-border">
                                    <span className="text-xs text-muted-foreground">Last updated {campaign.lastUpdated || 'Unknown'}</span>
                                  </div>
                                </CardContentComponent>
                              </CardComponent>
                            ))}
                          </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <CardComponent className="glass border border-border">
                            <CardContentComponent className="p-4">
                              <div className="flex items-center space-x-3 mb-2">
                                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium text-muted-foreground">Total Impressions</span>
                              </div>
                              <p className="text-2xl font-bold text-foreground">
                                {campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0).toLocaleString()}
                              </p>
                              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">+15.2% from last week</p>
                            </CardContentComponent>
                          </CardComponent>
                          <CardComponent className="glass border border-border">
                            <CardContentComponent className="p-4">
                              <div className="flex items-center space-x-3 mb-2">
                                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <span className="text-sm font-medium text-muted-foreground">Total Clicks</span>
                              </div>
                              <p className="text-2xl font-bold text-foreground">
                                {campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0).toLocaleString()}
                              </p>
                              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">+8.7% from last week</p>
                            </CardContentComponent>
                          </CardComponent>
                          <CardComponent className="glass border border-border">
                            <CardContentComponent className="p-4">
                              <div className="flex items-center space-x-3 mb-2">
                                <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-sm font-medium text-muted-foreground">Avg. CTR</span>
                              </div>
                              <p className="text-2xl font-bold text-foreground">
                                {campaigns.length > 0
                                  ? (campaigns.reduce((acc, c) => acc + (c.ctr || 0), 0) / campaigns.length).toFixed(1)
                                  : '0'}%
                              </p>
                              <p className="text-sm text-red-600 dark:text-red-400 font-medium">-0.3% from last week</p>
                            </CardContentComponent>
                          </CardComponent>
                          <CardComponent className="glass border border-border">
                            <CardContentComponent className="p-4">
                              <div className="flex items-center space-x-3 mb-2">
                                <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                <span className="text-sm font-medium text-muted-foreground">Total Conversions</span>
                              </div>
                              <p className="text-2xl font-bold text-foreground">
                                {campaigns.reduce((acc, c) => acc + (c.conversions || 0), 0)}
                              </p>
                              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">+12.9% from last week</p>
                            </CardContentComponent>
                          </CardComponent>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-16 px-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <BarChart3 className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">No campaigns yet</h3>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                          Start your advertising journey by creating your first campaign. Track performance, manage budgets, and reach your target audience.
                        </p>
                        <ButtonComponent
                          asChild
                          className="btn-gradient rounded-xl font-bold transition-brand"
                        >
                          <Link to={createPageUrl('CreateCampaign')}>
                            <Plus className="w-5 h-5 mr-2" />
                            Create Your First Campaign
                          </Link>
                        </ButtonComponent>
                      </div>
                    )}
                  </div>
                ) : (
                  // Properties view - now using real data
                  <div className="space-y-6">
                    {properties.length > 0 ? (
                      <>
                        <div className="mb-6">
                          <h2 className="text-lg font-bold text-foreground">My Properties</h2>
                          <p className="text-sm text-muted-foreground mt-1">Manage your advertising space listings</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {properties.map((property) => (
                            <CardComponent key={property.id} className="glass border border-border hover:shadow-lg transition-all">
                              <CardContentComponent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h3 className="font-semibold text-foreground">{property.name}</h3>
                                    <p className="text-sm text-muted-foreground">{property.address}</p>
                                  </div>
                                  <BadgeComponent 
                                    variant={property.status === 'active' ? 'default' : 'secondary'} 
                                    className={property.status === 'draft' ? 'bg-amber-100 text-amber-800' : ''}
                                  >
                                    {property.status}
                                  </BadgeComponent>
                                </div>

                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Listed:</span>
                                    <span className="text-foreground">{new Date(property.created_date).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Active Bookings:</span>
                                    <span className="text-foreground">
                                      {bookings.filter(b => b.property_id === property.id && b.status === 'active').length}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                  <ButtonComponent variant="outline" size="sm" className="flex-1">
                                    <Edit className="w-4 h-4 mr-1" />
                                    Edit
                                  </ButtonComponent>
                                  <ButtonComponent variant="outline" size="sm" className="flex-1">
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </ButtonComponent>
                                </div>
                              </CardContentComponent>
                            </CardComponent>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-16 px-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Building className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">No properties listed yet</h3>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                          Start earning by listing your advertising spaces. Whether you have billboards, digital displays, or building walls, you can monetize them here.
                        </p>
                        <ButtonComponent
                          asChild
                          className="btn-gradient rounded-xl font-bold transition-brand"
                        >
                          <Link to={createPageUrl('CreateProperty')}>
                            <Plus className="w-5 h-5 mr-2" />
                            List Your First Property
                          </Link>
                        </ButtonComponent>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modalData.type === 'booking' && modalData.data && 'booking' in modalData.data && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <CardComponent className="max-w-2xl w-full">
              <CardHeaderComponent>
                <CardTitleComponent>Booking Details</CardTitleComponent>
              </CardHeaderComponent>
              <CardContentComponent>
                <p>Booking ID: {modalData.data.booking.id}</p>
                <p>Status: {modalData.data.booking.status}</p>
                <ButtonComponent onClick={handleCloseModal} className="mt-4">Close</ButtonComponent>
              </CardContentComponent>
            </CardComponent>
          </div>
        )}
        {modalData.type === 'invoice' && modalData.data && 'invoice' in modalData.data && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <CardComponent className="max-w-2xl w-full">
              <CardHeaderComponent>
                <CardTitleComponent>Invoice Details</CardTitleComponent>
              </CardHeaderComponent>
              <CardContentComponent>
                <p>Invoice ID: {modalData.data.invoice.id}</p>
                <p>Amount: ${modalData.data.invoice.amount}</p>
                <p>Status: {modalData.data.invoice.status}</p>
                <ButtonComponent onClick={handleCloseModal} className="mt-4">Close</ButtonComponent>
              </CardContentComponent>
            </CardComponent>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}