// src/components/layout/Layout.tsx
// ✅ UPDATED: Now uses VideoLoader for main loading state
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
  
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  // ✅ CRITICAL: Identify full-screen map pages that need special handling
  const isFullScreenMapPage = location.pathname === '/browse' || location.pathname === '/map';
  const isMessagesPage = location.pathname === '/messages';

  // ✅ CONSOLE LOG: Layout initialization
  useEffect(() => {
    console.log('🏗️ Layout: Component mounted for page:', currentPageName || 'Unknown');
    console.log('🏗️ Layout: Full screen map page:', isFullScreenMapPage);
    console.log('🏗️ Layout: Messages page:', isMessagesPage);
  }, [currentPageName, isFullScreenMapPage, isMessagesPage]);

  // ✅ FIXED: Enhanced view mode handling with proper state synchronization
  const handleViewModeChange = useCallback((newMode: string) => {
    console.log('🔄 Layout: View mode changing from', viewMode, 'to', newMode);
    
    // ✅ CRITICAL: Update state FIRST, then navigate
    setViewMode(newMode);
    
    // ✅ CRITICAL: Use setTimeout to ensure state update happens before navigation
    // This prevents the "double click" issue
    setTimeout(() => {
      if (newMode === 'seller') {
        navigate('/dashboard');
      } else {
        navigate('/browse');
      }
    }, 0);
  }, [viewMode, navigate]);

  // ✅ FIXED: Determine view mode based on current route to keep it in sync
  useEffect(() => {
    if (location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard')) {
      setViewMode('seller');
    } else if (location.pathname === '/browse' || location.pathname === '/advertise') {
      // Only change to buyer if we're not already in the right mode to prevent loops
      if (viewMode !== 'buyer') {
        setViewMode('buyer');
      }
    }
  }, [location.pathname, viewMode]);

  // Enhanced data fetching with error handling - REMOVED viewMode dependency to prevent loops
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const fetchUserData = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          console.log('🔄 Layout: Fetching user data for:', user.id);
          
          const userResponse = await apiClient.getUserProfile();
          if (userResponse.success) {
            setCurrentUser(userResponse.data);
            setIsAdmin(userResponse.data?.publicMetadata?.role === 'admin');
            console.log('✅ Layout: User data loaded successfully');
          }
          
          const notificationResponse = await apiClient.getNotificationCount();
          if (notificationResponse.success) {
            setUnreadCount(notificationResponse.count || 0);
            console.log('✅ Layout: Notification count loaded:', notificationResponse.count || 0);
          }
          
          setPendingInvoices(0);
          setActionItemsCount(0);
          
        } catch (err) {
          console.error('❌ Layout: Error fetching user data:', err);
          setError('Failed to load user data');
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
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, user]); // ✅ REMOVED viewMode dependency

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

  // ✅ UPDATED: Main loading state now uses VideoLoader
  if (isLoading) {
    console.log('⏳ Layout: Showing main loading state');
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <VideoLoader 
            size="xl"
            theme="brand"
            message="Loading..."
            showMessage={true}
            centered={true}
            containerClassName="mb-4"
          />
        </div>
      </div>
    );
  }

  // ✅ UPDATED: Error state with VideoLoader fallback styling
  if (error) {
    console.log('❌ Layout: Showing error state:', error);
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              console.log('🔄 Layout: Retrying after error');
              window.location.reload();
            }}
            className="px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#4668AB' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ✅ CRITICAL FIX: Special handling for full-screen map pages
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
            bottom: isSignedIn ? '20px' : '0', // Mobile nav height when signed in (md:hidden on mobile nav)
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

        {/* ✅ Mobile Bottom Navigation - Fixed at bottom */}
        {typeof MobileNav !== 'undefined' && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-[9997]">
            <MobileNav 
              unreadCount={unreadCount} 
              pendingInvoices={pendingInvoices} 
              actionItemsCount={actionItemsCount} 
              currentUser={currentUser}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
            />
          </div>
        )}
      </div>
    );
  }

  // ✅ STANDARD LAYOUT: For all other pages (dashboard, profile, etc.)
  console.log('📄 Layout: Rendering standard layout');
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
        {/* ✅ MOBILE: Top Bar with proper positioning */}
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

        {/* ✅ STANDARD: Main Content Area with proper spacing */}
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
            >
              <div className="w-full h-full">
                {children}
              </div>
            </motion.div>
          </div>
        </main>

        {/* ✅ MOBILE: Bottom Navigation with proper positioning */}
        {typeof MobileNav !== 'undefined' && (
          <div className="md:hidden">
            <MobileNav 
              unreadCount={unreadCount} 
              pendingInvoices={pendingInvoices} 
              actionItemsCount={actionItemsCount} 
              currentUser={currentUser}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}