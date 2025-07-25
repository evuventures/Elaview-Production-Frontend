// src/pages/dashboard/Dashboard.tsx
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
  UserRole,
  StatItem,
  TabItem
} from './types';
import { apiCall } from './utils/api';
import { getFileType, formatFileSize, getCloudinaryResourceType } from './utils/fileUtils';

// ✅ BATCH 1: Common Components
import { StatusBadge } from './components/common/StatusBadge';
import { EmptyState } from './components/common/EmptyState';
import { LoadingState } from './components/common/LoadingState';
import { FilePreview } from './components/common/FilePreview';
import { PreviewModal } from './components/common/PreviewModal';

// ✅ BATCH 2: Layout Components
import { StatsGrid } from './components/layout/StatsGrid';
import { RoleToggle } from './components/layout/RoleToggle';
import { TabNavigation } from './components/layout/TabNavigation';
import { DashboardHeader } from './components/layout/DashboardHeader';

// ✅ BATCH 2 & 3: Card Components
import { BookingCard } from './components/booking/BookingCard';
import { PropertyCard } from './components/property/PropertyCard';

import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
  Loader2, Plus, Eye, Calendar, Clock, 
  DollarSign, TrendingUp, Zap, Target, Building2,
  BarChart3, Star, Bookmark, CreditCard, Receipt,
  CalendarDays, UserCircle, ThumbsUp, PieChart,
  ImagePlus, Search, Edit, Upload, FileImage, 
  Video, File, Trash2, X, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  // ✅ State management
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

  // ✅ Role management state
  const [userRole, setUserRole] = useState<UserRole>('advertiser');
  const [canSwitchRoles, setCanSwitchRoles] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { user: currentUser } = useUser();

  // ✅ Role detection helper
  const detectUserRole = (loadedBookings: Booking[], loadedProperties: Property[]): UserRole => {
    const hasBookings = loadedBookings.length > 0;
    const hasProperties = loadedProperties.length > 0;
    
    if (hasProperties && !hasBookings) return 'property_owner';
    if (hasBookings && !hasProperties) return 'advertiser';
    if (hasProperties) return 'property_owner';
    return 'advertiser';
  };

  // ✅ Load data function
  const loadData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('🔄 Loading complete dashboard data...');

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
        setBookings([]);
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
        setProperties([]);
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
        setBookingRequests([]);
      }

      // Role detection and setup
      const detectedRole = detectUserRole(loadedBookings, loadedProperties);
      setUserRole(detectedRole);
      setCanSwitchRoles(true);
      setActiveTab('bookings');

      // Calculate combined stats
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

  // ✅ UseEffects
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

  // ✅ Role change handler
  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    setActiveTab('bookings');
    console.log(`✅ Role switched to: ${newRole}`);
  };

  // ✅ Booking handlers
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

  // ✅ Property handlers
  const handleViewProperty = (propertyId: string) => {
    console.log('View property:', propertyId);
    // TODO: Navigate to property view page
  };

  const handleEditProperty = (propertyId: string) => {
    console.log('Edit property:', propertyId);
    // TODO: Navigate to property edit page
  };

  // ✅ Get tabs based on role
  const getTabs = (): TabItem[] => {
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

  // ✅ Loading state
  if (!isLoaded || isLoading) {
    return <LoadingState isAuthLoading={!isLoaded} />;
  }

  // ✅ Role-aware stats
  const getDisplayStats = (): StatItem[] => {
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

  // ✅ Render tab content
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
                  <BookingCard 
                    key={booking.id} 
                    booking={booking}
                    onClick={() => console.log('Booking clicked:', booking.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title={userRole === 'advertiser' ? 'No active ads yet' : 'No bookings yet'}
                description={
                  userRole === 'advertiser' 
                    ? 'Start advertising by booking your first space'
                    : 'Your booking requests will appear here'
                }
                actionButton={
                  userRole === 'advertiser' ? (
                    <Button
                      asChild
                      className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold transition-all duration-300"
                    >
                      <Link to={createPageUrl('Map')}>
                        <Plus className="w-5 h-5 mr-2" />
                        Browse Spaces
                      </Link>
                    </Button>
                  ) : undefined
                }
              />
            )}
          </div>
        );

      case 'creative':
        return <CreativeAssetsTab userRole={userRole} apiCall={apiCall} currentUser={currentUser} />;

      case 'payments':
        return (
          <EmptyState
            icon={CreditCard}
            title="Payment History"
            description="View your transaction history and invoices"
            actionButton={
              <Button className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold">
                <Receipt className="w-5 h-5 mr-2" />
                View Transactions
              </Button>
            }
          />
        );

      case 'analytics':
        return (
          <EmptyState
            icon={userRole === 'advertiser' ? BarChart3 : PieChart}
            title={userRole === 'advertiser' ? 'Campaign Analytics' : 'Listing Analytics'}
            description={
              userRole === 'advertiser' 
                ? 'Track your advertising campaign performance'
                : 'View performance metrics for your listings'
            }
            actionButton={
              <Button className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold">
                <TrendingUp className="w-5 h-5 mr-2" />
                View Analytics
              </Button>
            }
          />
        );

      case 'reviews':
        return (
          <EmptyState
            icon={userRole === 'advertiser' ? Star : ThumbsUp}
            title={userRole === 'advertiser' ? 'Give Reviews' : 'Reviews Received'}
            description={
              userRole === 'advertiser' 
                ? 'Rate and review the properties you\'ve advertised on'
                : 'View reviews from advertisers who used your spaces'
            }
            actionButton={
              <Button className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold">
                <Star className="w-5 h-5 mr-2" />
                {userRole === 'advertiser' ? 'Write Review' : 'View Reviews'}
              </Button>
            }
          />
        );

      case 'saved':
        return (
          <EmptyState
            icon={Bookmark}
            title="Saved Listings"
            description="Your watchlist of interesting advertising spaces"
            actionButton={
              <Button
                asChild
                className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold"
              >
                <Link to={createPageUrl('Map')}>
                  <Search className="w-5 h-5 mr-2" />
                  Find Spaces to Save
                </Link>
              </Button>
            }
          />
        );

      case 'listings':
        return (
          <div className="space-y-6">
            {properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onView={handleViewProperty}
                    onEdit={handleEditProperty}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Building2}
                title="Start Earning from Your Spaces"
                description="List your advertising spaces to start earning revenue"
                actionButton={
                  <Button
                    asChild
                    className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold transition-all duration-300"
                  >
                    <Link to={createPageUrl('CreateProperty')}>
                      <Plus className="w-5 h-5 mr-2" />
                      List Your First Property
                    </Link>
                  </Button>
                }
              />
            )}
          </div>
        );

      case 'calendar':
        return (
          <EmptyState
            icon={CalendarDays}
            title="Calendar & Scheduling"
            description="Manage availability and booking schedules for your properties"
            actionButton={
              <Button className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold">
                <Calendar className="w-5 h-5 mr-2" />
                View Calendar
              </Button>
            }
          />
        );

      case 'profile':
        return (
          <EmptyState
            icon={UserCircle}
            title="Business Profile"
            description="Manage your business information and profile settings"
            actionButton={
              <Button className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold">
                <Edit className="w-5 h-5 mr-2" />
                Edit Profile
              </Button>
            }
          />
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

        {/* ✅ BATCH 3: Using DashboardHeader component */}
        <DashboardHeader 
          userRole={userRole}
          canSwitchRoles={canSwitchRoles}
          onRoleChange={handleRoleChange}
        />

        {/* ✅ BATCH 2: Using StatsGrid component */}
        <StatsGrid stats={displayStats} />

        {/* ✅ BATCH 2: Updated Tabs with extracted components */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden">
          <TabNavigation 
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

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

// ✅ BATCH 3: Updated CreativeAssetsTab using extracted components
const CreativeAssetsTab: React.FC<{
  userRole: UserRole;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<any>;
  currentUser: any;
}> = ({ userRole, apiCall, currentUser }) => {
  const [creatives, setCreatives] = useState<CreativeAsset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

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
      // Mock data for demo
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
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'creative_uploads');
        formData.append('folder', 'creatives');
        formData.append('tags', `advertiser_${currentUser?.id || 'unknown'}`);
        
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
        
        const creativeData = {
          name: file.name,
          type: getFileType(file.name),
          url: cloudinaryResult.secure_url,
          publicId: cloudinaryResult.public_id,
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
        
        const newCreative: CreativeAsset = {
          id: dbResponse.data?.id || fileId,
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
        setUploadProgress(prev => ({ ...prev, [fileId]: -1 }));
      }
    }
    
    setSelectedFiles([]);
    setUploadProgress({});
    setIsUploading(false);
  };

  const deleteCreative = async (id: string) => {
    try {
      await apiCall(`/creatives/${id}`, { method: 'DELETE' });
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

  if (userRole === 'property_owner') {
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
          <EmptyState
            icon={Eye}
            title="No pending creatives"
            description="Creative assets awaiting review will appear here"
          />
        )}

        <PreviewModal
          creative={previewModal.creative}
          isOpen={previewModal.isOpen}
          onClose={closePreview}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Upload Creative Assets</h2>
        
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
                    <StatusBadge status={creative.status} />
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
          <EmptyState
            icon={ImagePlus}
            title="No creative assets yet"
            description="Upload your first creative asset to get started"
          />
        )}
      </div>

      <PreviewModal
        creative={previewModal.creative}
        isOpen={previewModal.isOpen}
        onClose={closePreview}
      />
    </div>
  );
};