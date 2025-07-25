// src/pages/dashboard/Dashboard.tsx - Property Owner Dashboard Only
import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// ✅ Import types and utilities
import type { 
  Booking, 
  Property, 
  BookingRequest, 
  DashboardStats, 
  CreativeAsset, 
  StatItem,
  TabItem
} from './types';
import { apiCall } from './utils/api';
import { getFileType, formatFileSize, getCloudinaryResourceType } from './utils/fileUtils';

// ✅ Components
import { StatusBadge } from './components/common/StatusBadge';
import { EmptyState } from './components/common/EmptyState';
import { LoadingState } from './components/common/LoadingState';
import { FilePreview } from './components/common/FilePreview';
import { PreviewModal } from './components/common/PreviewModal';
import { BookingCard } from './components/booking/BookingCard';
import { PropertyCard } from './components/property/PropertyCard';

import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
  Loader2, Plus, Eye, Calendar, Clock, 
  DollarSign, TrendingUp, Building2, Home,
  PieChart, CalendarDays, UserCircle, ThumbsUp,
  ImagePlus, Search, Edit, Upload, FileImage, 
  Video, File, Trash2, X, Download, ChevronDown,
  CreditCard, Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  // ✅ Simplified state management - Property Owner only
  const [activeTab, setActiveTab] = useState<'bookings' | 'creative' | 'payments' | 'analytics' | 'listings' | 'calendar' | 'profile' | 'reviews'>('bookings');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalSpent: 0, activeAds: 0, totalImpressions: 0, avgROI: '0x',
    totalProperties: 0, activeProperties: 0, pendingBookings: 0,
    monthlyRevenue: 0, totalRevenue: 0, occupancyRate: 85
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { user: currentUser } = useUser();

  const loadData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API calls
      const mockProperties: Property[] = [];
      const mockRequests: BookingRequest[] = [];

      setProperties(mockProperties);
      setBookingRequests(mockRequests);

      // Property owner stats
      const stats: DashboardStats = {
        totalSpent: 0,
        activeAds: 0,
        totalImpressions: 0,
        avgROI: '0x',
        totalProperties: 0,
        activeProperties: 0,
        pendingBookings: 0,
        monthlyRevenue: 12500,
        totalRevenue: 89750,  
        occupancyRate: 85
      };
      setDashboardStats(stats);

    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn && isLoaded) {
      loadData();
    }
  }, [isSignedIn, isLoaded]);

  // ✅ Property Owner tab options only
  const getTabOptions = (): { value: string; label: string; icon: any }[] => {
    return [
      { value: 'bookings', label: 'Booking Requests', icon: Calendar },
      { value: 'creative', label: 'Review Creatives', icon: Eye },
      { value: 'listings', label: 'Manage Properties', icon: Building2 },
      { value: 'analytics', label: 'Property Analytics', icon: PieChart },
      { value: 'calendar', label: 'Availability Calendar', icon: CalendarDays },
      { value: 'payments', label: 'Revenue & Payments', icon: CreditCard },
      { value: 'reviews', label: 'Customer Reviews', icon: ThumbsUp },
      { value: 'profile', label: 'Business Profile', icon: UserCircle }
    ];
  };

  // ✅ Property Owner stats only
  const getDisplayStats = (): StatItem[] => {
    return [
      { icon: DollarSign, value: `$${dashboardStats.totalRevenue.toLocaleString()}`, label: 'Total Revenue', color: 'text-emerald-400' },
      { icon: Building2, value: dashboardStats.activeProperties, label: 'Active Properties', color: 'text-lime-400' },
      { icon: Clock, value: dashboardStats.pendingBookings, label: 'Pending Requests', color: 'text-amber-400' },
      { icon: TrendingUp, value: `${dashboardStats.occupancyRate}%`, label: 'Occupancy Rate', color: 'text-cyan-400' }
    ];
  };

  // ✅ Property Owner content only
  const renderTabContent = () => {
    switch (activeTab) {
      case 'bookings':
        return (
          <div className="space-y-4">
            {bookingRequests.length > 0 ? (
              <div className="space-y-3">
                {bookingRequests.map((request) => (
                  <BookingCard 
                    key={request.id} 
                    booking={request}
                    onClick={() => console.log('Booking request clicked:', request.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No booking requests yet"
                description="Booking requests from advertisers will appear here. Make sure your properties are listed and available."
                actionButton={
                  <Button
                    asChild
                    className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold transition-all duration-300"
                  >
                    <Link to="/list-space">
                      <Plus className="w-4 h-4 mr-2" />
                      List Your First Property
                    </Link>
                  </Button>
                }
              />
            )}
          </div>
        );

      case 'creative':
        return (
          <EmptyState
            icon={Eye}
            title="Review Creative Assets"
            description="Creative assets from advertisers awaiting your review will appear here"
            actionButton={
              <Button className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold">
                <Eye className="w-4 h-4 mr-2" />
                View Guidelines
              </Button>
            }
          />
        );

      case 'listings':
        return (
          <div className="space-y-4">
            {properties.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onView={() => {}}
                    onEdit={() => {}}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Building2}
                title="Start Earning from Your Spaces"
                description="List your advertising spaces to start earning revenue from advertisers"
                actionButton={
                  <Button
                    asChild
                    className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold transition-all duration-300"
                  >
                    <Link to="/list-space">
                      <Plus className="w-4 h-4 mr-2" />
                      List Your First Property
                    </Link>
                  </Button>
                }
              />
            )}
          </div>
        );

      case 'analytics':
        return (
          <EmptyState
            icon={PieChart}
            title="Property Analytics"
            description="View performance metrics, booking rates, and revenue analytics for your properties"
            actionButton={
              <Button className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            }
          />
        );

      case 'calendar':
        return (
          <EmptyState
            icon={CalendarDays}
            title="Availability Calendar"
            description="Manage availability and booking schedules for your properties"
            actionButton={
              <Button className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold">
                <Calendar className="w-4 h-4 mr-2" />
                Manage Availability
              </Button>
            }
          />
        );

      case 'payments':
        return (
          <EmptyState
            icon={CreditCard}
            title="Revenue & Payments"
            description="View your earnings, payment history, and payout settings"
            actionButton={
              <Button className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold">
                <Receipt className="w-4 h-4 mr-2" />
                View Earnings
              </Button>
            }
          />
        );

      case 'reviews':
        return (
          <EmptyState
            icon={ThumbsUp}
            title="Customer Reviews"
            description="View reviews and feedback from advertisers who used your spaces"
            actionButton={
              <Button className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold">
                <Star className="w-4 h-4 mr-2" />
                View All Reviews
              </Button>
            }
          />
        );

      case 'profile':
        return (
          <EmptyState
            icon={UserCircle}
            title="Business Profile"
            description="Manage your business information, contact details, and property owner profile"
            actionButton={
              <Button className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            }
          />
        );

      default:
        return null;
    }
  };

  if (!isLoaded || isLoading) {
    return <LoadingState isAuthLoading={!isLoaded} />;
  }

  const displayStats = getDisplayStats();
  const tabOptions = getTabOptions();

  return (
    <div className="bg-gray-900 text-white flex gap-6 p-6 overflow-hidden" style={{ height: 'calc(100vh - 75px)' }}>
      
      {/* ✅ LEFT BOX: Header + Metrics */}
      <div className="w-1/2 h-full bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 flex flex-col">
        
        {/* ✅ SIMPLIFIED HEADER - No role toggle */}
        <div className="flex-shrink-0 flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center">
              <Home className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Property Owner Dashboard</h1>
              <p className="text-gray-400">Manage your advertising properties and bookings</p>
            </div>
          </div>
          
          {/* Quick Action */}
          <Button
            asChild
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold"
          >
            <Link to="/list-space">
              <Plus className="w-4 h-4 mr-2" />
              List New Property
            </Link>
          </Button>
        </div>

        {/* ✅ METRICS SECTION */}
        <div className="flex-1 flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6">Revenue Overview</h2>
          
          <div className="space-y-4 flex-1">
            {displayStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:bg-gray-700/50 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-600/50 rounded-xl flex items-center justify-center">
                      <IconComponent className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ✅ RIGHT HALF: Content Area */}
      <div className="w-1/2 flex flex-col pl-3">
        <div className="h-full bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden flex flex-col">
          
          {/* ✅ DROPDOWN HEADER */}
          <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Property Management</h2>
              
              {/* ✅ DROPDOWN SELECTOR */}
              <select 
                value={activeTab} 
                onChange={(e) => setActiveTab(e.target.value as any)}
                className="w-64 bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {tabOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ✅ CONTENT AREA */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}