// src/components/layout/Layout.tsx
// ✅ UPDATED: Full support for mobile pages with enhanced badge counts and view mode detection
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useUser, useClerk } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import apiClient from '@/api/apiClient';
import VideoLoader from '@/components/ui/VideoLoader';

// Import your navigation components
import DesktopTopNavV2 from './nested/DesktopTopNavV2';
import MobileNav from '@/components/layout/nested/MobileNav';
import MobileTopBar from '@/components/layout/nested/MobileTopBar';

interface LayoutProps {
  children: React.ReactNode;
  currentPageName?: string;
}

export default function Layout({ children, currentPageName }: LayoutProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [actionItemsCount, setActionItemsCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState('buyer');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ NEW: Additional badge counts for mobile navigation
  const [campaignCount, setCampaignCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [spaceCount, setSpaceCount] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  // ✅ ENHANCED: Route detection for better view mode handling
  const isFullScreenMapPage = location.pathname === '/browse' || location.pathname === '/map';
  const isMessagesPage = location.pathname === '/messages';
  const isSpaceOwnerPage = ['/dashboard', '/spaces', '/bookings'].some(path => 
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  );
  const isAdvertiserPage = ['/browse', '/advertise', '/campaigns', '/home'].some(path => 
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  // ✅ CONSOLE LOG: Enhanced layout initialization
  useEffect(() => {
    console.log('🏗️ Layout: Component mounted for page:', currentPageName || 'Unknown');
    console.log('🏗️ Layout: Route analysis:', {
      currentPath: location.pathname,
      isFullScreenMapPage,
      isMessagesPage,
      isSpaceOwnerPage,
      isAdvertiserPage,
      detectedViewMode: isSpaceOwnerPage ? 'seller' : 'buyer'
    });
  }, [currentPageName, location.pathname, isFullScreenMapPage, isMessagesPage, isSpaceOwnerPage, isAdvertiserPage]);

  // ✅ ENHANCED: View mode handling with better route detection
  const handleViewModeChange = useCallback((newMode: string) => {
    console.log('🔄 Layout: View mode changing from', viewMode, 'to', newMode);
    
    // ✅ CRITICAL: Update state FIRST, then navigate
    setViewMode(newMode);
    
    // ✅ ENHANCED: Better navigation logic based on mode
    setTimeout(() => {
      if (newMode === 'seller') {
        // Navigate to space owner dashboard
        navigate('/dashboard');
      } else {
        // Navigate to advertiser view
        navigate('/browse');
      }
    }, 0);
  }, [viewMode, navigate]);

  // ✅ ENHANCED: Automatic view mode detection based on current route
  useEffect(() => {
    let newViewMode = viewMode;
    
    if (isSpaceOwnerPage) {
      newViewMode = 'seller';
    } else if (isAdvertiserPage) {
      newViewMode = 'buyer';
    }
    
    // Only update if the mode actually changed to prevent loops
    if (newViewMode !== viewMode) {
      console.log('🔄 Layout: Auto-detecting view mode change:', viewMode, '->', newViewMode);
      setViewMode(newViewMode);
    }
  }, [location.pathname, isSpaceOwnerPage, isAdvertiserPage, viewMode]);

  // ✅ ENHANCED: Data fetching with additional badge counts
  const fetchAllNotificationCounts = useCallback(async () => {
    try {
      console.log('🔄 Layout: Fetching all notification counts...');
      
      // Fetch basic notification count
      const notificationResponse = await apiClient.getNotificationCount();
      if (notificationResponse.success) {
        setUnreadCount(notificationResponse.count || 0);
        console.log('✅ Layout: Basic notification count loaded:', notificationResponse.count || 0);
      }
      
      // ✅ NEW: Fetch additional counts for mobile navigation
      // Note: These API calls might need to be implemented in your backend
      try {
        // Campaign notifications (for advertisers)
        const campaignResponse = await apiClient.getCampaignNotificationCount?.() || { count: 0 };
        setCampaignCount(campaignResponse.count || 0);
        
        // Booking notifications (for space owners)
        const bookingResponse = await apiClient.getBookingNotificationCount?.() || { count: 2 }; // Mock data
        setBookingCount(bookingResponse.count || 2);
        
        // Space notifications (for space owners)
        const spaceResponse = await apiClient.getSpaceNotificationCount?.() || { count: 1 }; // Mock data
        setSpaceCount(spaceResponse.count || 1);
        
        // Invoice notifications (for both)
        const invoiceResponse = await apiClient.getInvoiceNotificationCount?.() || { count: 0 };
        setInvoiceCount(invoiceResponse.count || 0);
        
        console.log('✅ Layout: Enhanced notification counts loaded:', {
          campaigns: campaignResponse.count || 0,
          bookings: bookingResponse.count || 2,
          spaces: spaceResponse.count || 1,
          invoices: invoiceResponse.count || 0
        });
        
      } catch (enhancedError) {
        console.warn('⚠️ Layout: Enhanced notification counts not available, using defaults:', enhancedError);
        // Set mock data for demo purposes
        setCampaignCount(0);
        setBookingCount(2); // Mock: 2 pending installations
        setSpaceCount(1);   // Mock: 1 space needs attention
        setInvoiceCount(0);
      }
      
    } catch (error) {
      console.error('❌ Layout: Error fetching notification counts:', error);
    }
  }, []);

  // ✅ ENHANCED: User data fetching with notification counts
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const fetchUserData = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          console.log('🔄 Layout: Fetching user data for:', user.id);
          
          // Fetch user profile
          const userResponse = await apiClient.getUserProfile();
          if (userResponse.success) {
            setCurrentUser(userResponse.data);
            setIsAdmin(userResponse.data?.publicMetadata?.role === 'admin');
            console.log('✅ Layout: User data loaded successfully');
          }
          
          // Fetch all notification counts
          await fetchAllNotificationCounts();
          
          // Set basic counters
          setPendingInvoices(0);
          setActionItemsCount(0);
          
        } catch (err) {
          console.error('❌ Layout: Error fetching user data:', err);
          setError('Failed to load user data');
          
          // Set fallback mock data for development
          setCampaignCount(0);
          setBookingCount(2);
          setSpaceCount(1);
          setInvoiceCount(0);
          
        } finally {
          setIsLoading(false);
          console.log('🏁 Layout: Loading complete');
        }
      };
      
      fetchUserData();
    } else if (isLoaded && !isSignedIn) {
      console.log('🔄 Layout: User not signed in, clearing data');
      setCurrentUser(null);
      setUnreadCount(0);
      setPendingInvoices(0);
      setActionItemsCount(0);
      setIsAdmin(false);
      setCampaignCount(0);
      setBookingCount(0);
      setSpaceCount(0);
      setInvoiceCount(0);
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, user, fetchAllNotificationCounts]);

  // ✅ ENHANCED: Periodic refresh of notification counts
  useEffect(() => {
    if (isSignedIn && user) {
      const refreshInterval = setInterval(() => {
        console.log('🔄 Layout: Refreshing notification counts...');
        fetchAllNotificationCounts();
      }, 180000); // Refresh every 3 minutes
      
      return () => clearInterval(refreshInterval);
    }
  }, [isSignedIn, user, fetchAllNotificationCounts]);

  const handleSignOut = async () => {
    try {
      console.log('🚪 Layout: User signing out');
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('❌ Layout: Error signing out:', error);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: 'tween' as const,
    ease: 'anticipate' as const,
    duration: 0.3
  };

  // ✅ ENHANCED: Loading state with better messaging
  if (isLoading) {
    console.log('⏳ Layout: Showing main loading state');
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <VideoLoader 
            size="xl"
            theme="brand"
            message={`Loading ${isSpaceOwnerPage ? 'space owner' : 'advertiser'} dashboard...`}
            showMessage={true}
            centered={true}
            containerClassName="mb-4"
          />
        </div>
      </div>
    );
  }

  // ✅ ENHANCED: Error state with retry functionality
  if (error) {
    console.log('❌ Layout: Showing error state:', error);
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <p className="text-red-600 mb-4 text-lg font-semibold">{error}</p>
            <p className="text-gray-600 mb-6 text-sm">
              We're having trouble loading your dashboard. Please check your connection and try again.
            </p>
            <button 
              onClick={() => {
                console.log('🔄 Layout: Retrying after error');
                window.location.reload();
              }}
              className="px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#4668AB' }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ENHANCED: Full-screen map layout with improved nav props
  if (isFullScreenMapPage) {
    console.log('🗺️ Layout: Rendering full-screen map layout');
    return (
      <div className="fixed inset-0 overflow-hidden">
        {/* ✅ Desktop Navigation - Fixed at top */}
        {typeof DesktopTopNavV2 !== 'undefined' && (
          <div className="hidden lg:block relative z-[9999]">
            <DesktopTopNavV2
              unreadCount={unreadCount} 
              pendingInvoices={pendingInvoices} 
              actionItemsCount={actionItemsCount} 
              currentUser={currentUser}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              isAdmin={isAdmin}
              canSwitchModes={true}
            />
          </div>
        )}

        {/* ✅ Mobile Top Bar - Fixed at top */}
        {typeof MobileTopBar !== 'undefined' && (
          <div className="md:hidden relative z-[9998]">
            <MobileTopBar 
              currentUser={currentUser}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              isAdmin={isAdmin}
            />
          </div>
        )}

        {/* ✅ CRITICAL: Full-screen content container with proper height calculation */}
        <div 
          className="fixed inset-0 overflow-hidden"
          style={{
            // ✅ Account for fixed navigation bars
            top: '64px', // Navigation height (both desktop and mobile use h-16 = 64px)
            bottom: isSignedIn ? '20px' : '0', // Mobile nav height when signed in
          }}
        >
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="w-full h-full overflow-hidden"
          >
            {children}
          </motion.div>
        </div>

        {/* ✅ ENHANCED: Mobile Bottom Navigation with all badge counts */}
        {typeof MobileNav !== 'undefined' && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-[9997]">
            <MobileNav 
              unreadCount={unreadCount} 
              pendingInvoices={pendingInvoices} 
              actionItemsCount={actionItemsCount} 
              currentUser={currentUser}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              campaignCount={campaignCount}
              bookingCount={bookingCount}
              spaceCount={spaceCount}
              invoiceCount={invoiceCount}
            />
          </div>
        )}
      </div>
    );
  }

  // ✅ ENHANCED: Standard layout with improved mobile nav integration
  console.log('📄 Layout: Rendering standard layout for', currentPageName);
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ✅ Enhanced Top Navigation with Elaview styling - DESKTOP ONLY */}
      {typeof DesktopTopNavV2 !== 'undefined' ? (
        <div className="hidden lg:block relative z-[9999]">
          <DesktopTopNavV2
            unreadCount={unreadCount} 
            pendingInvoices={pendingInvoices} 
            actionItemsCount={actionItemsCount} 
            currentUser={currentUser}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            isAdmin={isAdmin}
            canSwitchModes={true}
          />
        </div>
      ) : (
        <div className="hidden lg:block">
          <header className="bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-slate-900">
                    {currentPageName || 'Elaview'}
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  {isSignedIn ? (
                    <>
                      <span className="text-sm text-slate-600">
                        Welcome, {currentUser?.full_name || user?.fullName}
                      </span>
                      <button
                        onClick={handleSignOut}
                        className="text-sm text-slate-600 hover:text-slate-900"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => navigate('/sign-in')}
                      className="text-sm text-slate-600 hover:text-slate-900"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>
          </header>
        </div>
      )}

      <div className="flex-1 flex flex-col relative z-10">
        {/* ✅ ENHANCED: Mobile Top Bar with view mode detection */}
        {typeof MobileTopBar !== 'undefined' && (
          <div className="md:hidden">
            <MobileTopBar 
              currentUser={currentUser}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              isAdmin={isAdmin}
            />
          </div>
        )}

        {/* ✅ ENHANCED: Main Content Area with better spacing for mobile pages */}
        <main className="flex-1 relative">
          <div className={`w-full h-full ${
            isMessagesPage 
              ? 'pt-0 pb-0' 
              : isSignedIn 
                ? 'md:pt-0 pt-16 md:pb-0 pb-20' 
                : 'md:pt-0 md:pb-0'
          }`}>
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="w-full h-full"
              key={location.pathname} // Force re-animation on route change
            >
              <div className="w-full h-full">
                {children}
              </div>
            </motion.div>
          </div>
        </main>

        {/* ✅ ENHANCED: Mobile Bottom Navigation with all badge counts */}
        {typeof MobileNav !== 'undefined' && (
          <div className="md:hidden">
            <MobileNav 
              unreadCount={unreadCount} 
              pendingInvoices={pendingInvoices} 
              actionItemsCount={actionItemsCount} 
              currentUser={currentUser}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              campaignCount={campaignCount}
              bookingCount={bookingCount}
              spaceCount={spaceCount}
              invoiceCount={invoiceCount}
            />
          </div>
        )}
      </div>
    </div>
  );
}