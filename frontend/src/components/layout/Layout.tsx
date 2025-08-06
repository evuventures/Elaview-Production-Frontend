// src/components/layout/Layout.tsx
// ✅ MOBILE RESPONSIVE: Fixed spacing and overflow issues
// ✅ FIXED: Messages page navigation integration

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useUser, useClerk } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import apiClient from '@/api/apiClient';

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
  const [viewMode, setViewMode] = useState('buyer'); // 'buyer' | 'seller'
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  // ✅ FIXED: Enhanced view mode handling
  const handleViewModeChange = (newMode: string) => {
    console.log('🔄 View mode changing from', viewMode, 'to', newMode);
    setViewMode(newMode);
    
    // Update URL based on view mode
    if (newMode === 'seller') {
      navigate('/dashboard');
    } else {
      navigate('/browse');
    }
  };

  // ✅ FIXED: Enhanced data fetching with error handling
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const fetchUserData = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          console.log('🔄 Fetching user data for:', user.id);
          
          // Fetch user profile and permissions
          const userResponse = await apiClient.getUserProfile();
          if (userResponse.success) {
            setCurrentUser(userResponse.data);
            setIsAdmin(userResponse.data?.publicMetadata?.role === 'admin');
          }
          
          // Fetch notification counts
          const notificationResponse = await apiClient.getNotificationCount();
          if (notificationResponse.success) {
            setUnreadCount(notificationResponse.count || 0);
          }
          
          // Mock data for action items (replace with real API calls when ready)
          setPendingInvoices(0);
          setActionItemsCount(0);
          
        } catch (err) {
          console.error('❌ Error fetching user data:', err);
          setError('Failed to load user data');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUserData();
    } else if (isLoaded && !isSignedIn) {
      // Reset state when signed out
      setCurrentUser(null);
      setUnreadCount(0);
      setPendingInvoices(0);
      setActionItemsCount(0);
      setIsAdmin(false);
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, user, viewMode]);

  // ✅ FIXED: Enhanced sign out handling
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  };

  // ✅ FIXED: Page transition animations
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20
    },
    in: {
      opacity: 1,
      y: 0
    },
    out: {
      opacity: 0,
      y: -20
    }
  };

  const pageTransition = {
    type: 'tween' as const,
    ease: 'anticipate' as const,
    duration: 0.3
  };

  // ✅ FIXED: Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 border-teal-500"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ FIXED: Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity bg-teal-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative z-[9999]">
        {/* ✅ Enhanced Top Navigation with Elaview styling - DESKTOP ONLY */}
        {typeof DesktopTopNavV2 !== 'undefined' ? (
          <div className="hidden lg:block">
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
          // ✅ Fallback header with Elaview styling - DESKTOP ONLY  
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
      </div>

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

        {/* ✅ MOBILE RESPONSIVE: Main Content Area with proper spacing */}
        <main className="flex-1 relative">
            {/* ✅ FIXED: Content Container with proper padding for nav bars */}
            <div className={`w-full h-full ${
              // Messages page needs special handling
              location.pathname === '/messages' 
                ? 'pt-0 pb-0' // Messages page handles its own spacing
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
                    {/* ✅ MOBILE: Child Content with responsive container */}
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