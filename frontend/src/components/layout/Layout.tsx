// src/components/layout/Layout.tsx
// ✅ UPDATED: Added viewMode and isAdmin props to mobile components
import React, { useState, useEffect } from 'react';
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
    const navigate = useNavigate();
    const location = useLocation();
    
    // ✅ Enhanced Clerk hooks for better loading state management
    const { isSignedIn, isLoaded: authLoaded } = useAuth();
    const { user: currentUser, isLoaded: userLoaded } = useUser();
    const clerk = useClerk();
    
    // Component state
    const [unreadCount, setUnreadCount] = useState(0);
    const [pendingInvoices, setPendingInvoices] = useState(0);
    const [actionItemsCount, setActionItemsCount] = useState(0);
    const [theme, setTheme] = useState('light'); // ✅ Default to light theme for Elaview
    
    // 🆕 Enhanced loading and auth state management
    const [viewMode, setViewMode] = useState<'buyer' | 'seller'>('buyer'); // ✅ Default to buyer (advertiser)
    const [isAdmin, setIsAdmin] = useState(false); // Admin flag from database
    const [isLoading, setIsLoading] = useState(true);
    const [apiReady, setApiReady] = useState(false);
    const [userDataLoaded, setUserDataLoaded] = useState(false);

    // ✅ Check if everything is ready for API calls
    const isFullyLoaded = authLoaded && userLoaded;

    // 🆕 SIMPLIFIED: Just change the view mode, no API calls!
    const handleViewModeChange = (newMode: 'buyer' | 'seller') => {
      console.log(`🔄 Switching view from ${viewMode} to ${newMode}`);
      setViewMode(newMode);
      
      // Optional: Navigate to appropriate page
      if (newMode === 'seller') {
        navigate('/dashboard');
      } else if (newMode === 'buyer') {
        navigate('/browse');
      }
    };

    // ✅ Elaview page transition animations
    const pageVariants = {
        initial: { opacity: 0, y: 15 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -15 }
    };

    const pageTransition = {
        type: "tween" as const,
        ease: "anticipate" as const,
        duration: 0.3
    };

    // ✅ Apply light theme for Elaview
    const applyThemeToDOM = (themeToApply: string) => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add('light'); // ✅ Force light theme for Elaview
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
    };

    // ✅ ENHANCED: Check if API calls are ready
    useEffect(() => {
        const checkApiReadiness = async () => {
            console.log('🔄 LAYOUT: Checking API readiness...', {
                authLoaded,
                userLoaded,
                isSignedIn,
                hasUser: !!currentUser
            });

            // Don't proceed until all Clerk hooks are loaded
            if (!isFullyLoaded) {
                console.log('🔄 LAYOUT: Waiting for Clerk to fully load...');
                setApiReady(false);
                return;
            }

            // If not signed in, we're ready but no API calls needed
            if (!isSignedIn || !currentUser) {
                console.log('🔄 LAYOUT: User not signed in, but ready');
                setApiReady(false);
                setIsLoading(false);
                return;
            }

            // Verify we can get a token before marking as ready
            try {
                const session = await window.Clerk?.session;
                const token = await session?.getToken();
                
                if (token) {
                    console.log('✅ LAYOUT: API ready - Clerk fully loaded and token available');
                    setApiReady(true);
                } else {
                    console.log('⏳ LAYOUT: Token not ready yet...');
                    setApiReady(false);
                }
            } catch (error) {
                console.log('❌ LAYOUT: Token check failed:', error);
                setApiReady(false);
            }
        };

        checkApiReadiness();
            }, [authLoaded, userLoaded, isSignedIn, currentUser, isFullyLoaded]);

    // 🆕 ENHANCED: Fetch user data only when API is ready
    useEffect(() => {
        if (!apiReady || userDataLoaded) return;

        const loadUserData = async () => {
            try {
                console.log('📋 LAYOUT: Loading user data from backend...');
                
                // Fetch user data from backend to get isAdmin
                const response = await apiClient.getUserProfile();
                if (response.success) {
                    const userData = response.data;
                    console.log('✅ LAYOUT: User data loaded:', {
                        email: userData.email,
                        role: userData.role,
                        isAdmin: userData.isAdmin
                    });
                    
                    // Set admin flag
                    setIsAdmin(userData.isAdmin || false);
                    
                    // Set initial view mode based on role (but this is just UI preference)
                    if (userData.role === 'PROPERTY_OWNER') {
                        setViewMode('seller');
                    } else {
                        setViewMode('buyer'); // ✅ Default to buyer (advertiser)
                    }
                    
                    setUserDataLoaded(true);
                } else {
                    console.warn('⚠️ LAYOUT: Failed to load user profile:', response.error);
                    setIsAdmin(false);
                    setViewMode('buyer'); // ✅ Default to buyer (advertiser)
                }

                // Mock data for other counts (replace with real API calls when ready)
                setUnreadCount(0);
                setPendingInvoices(0);
                setActionItemsCount(0);
                
            } catch (error) {
                console.error('❌ LAYOUT: Error loading user data:', error);
                setIsAdmin(false);
                setViewMode('buyer'); // ✅ Default to buyer (advertiser)
            } finally {
                setIsLoading(false);
            }
        };
        
        loadUserData();
    }, [apiReady, userDataLoaded]);

    // ✅ Initialize theme immediately
    useEffect(() => {
        setTheme('light');
        applyThemeToDOM('light');
    }, []);

    // ✅ Handle non-signed-in users
    useEffect(() => {
        if (isFullyLoaded && !isSignedIn) {
            console.log('🔄 LAYOUT: User not signed in, setting defaults');
            setViewMode('buyer'); // ✅ Default to buyer (advertiser)
            setIsAdmin(false);
            setUnreadCount(0);
            setPendingInvoices(0);
            setActionItemsCount(0);
            setIsLoading(false);
            setUserDataLoaded(false);
        }
    }, [isFullyLoaded, isSignedIn]);

    // ✅ Enhanced loading state - wait for Clerk AND user data
    if (!isFullyLoaded || (isSignedIn && !userDataLoaded && isLoading)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-teal-50/30 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-slate-600">
                        {!isFullyLoaded ? 'Loading authentication...' : 'Loading your dashboard...'}
                    </p>
                    {/* Debug info for development */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-2 text-xs text-slate-400">
                            <p>Auth: {authLoaded ? '✅' : '⏳'} | User: {userLoaded ? '✅' : '⏳'}</p>
                            <p>API Ready: {apiReady ? '✅' : '⏳'} | User Data: {userDataLoaded ? '✅' : '⏳'}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen flex flex-col font-sans text-slate-900 relative">
            {/* ✅ Subtle Background Effects - Only for non-browse pages */}
            {location.pathname !== '/browse' && (
              <div className="fixed inset-0 pointer-events-none opacity-30 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 via-transparent to-slate-100/50"></div>
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-teal-100/20 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-slate-100/30 to-transparent rounded-full blur-3xl"></div>
              </div>
            )}
            
            <div className="relative z-[9999]">
              {/* ✅ Enhanced Top Navigation with Elaview styling - DESKTOP ONLY */}
              {typeof DesktopTopNavV2 !== 'undefined' ? (
                <div className="hidden lg:block">
                  <DesktopTopNavV2
                    unreadCount={unreadCount} 
                    pendingInvoices={pendingInvoices} 
                    actionItemsCount={actionItemsCount} 
                    currentUser={currentUser}
                    viewMode={viewMode} // Changed from userRole
                    onViewModeChange={handleViewModeChange} // Changed from onRoleChange
                    isAdmin={isAdmin} // Pass admin flag
                    canSwitchModes={true} // Always allow switching views
                  />
                </div>
              ) : (
                // ✅ Fallback header with Elaview styling - DESKTOP ONLY  
                <div className="hidden lg:block">
                  <header className="bg-white border-b border-slate-200 shadow-soft px-6 py-4">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                      <h1 className="text-2xl font-bold text-slate-900">Elaview</h1>
                      {currentUser && (
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-slate-600">
                            Welcome, {currentUser.firstName || currentUser.primaryEmailAddress?.emailAddress}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            viewMode === 'seller' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-teal-100 text-teal-800'
                          }`}>
                            {viewMode === 'seller' ? 'Space Owner View' : 'Advertiser View'}
                          </span>
                          {isAdmin && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Admin
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </header>
                </div>
              )}
            </div>

            <div className="flex-1 relative z-10">
              {/* Main Content Area */}
              <main className="flex-1 relative">
                  {/* ✅ UPDATED: Mobile Components with viewMode and admin props */}
                  {typeof MobileTopBar !== 'undefined' && (
                    <div className="lg:hidden">
                      <MobileTopBar 
                        currentUser={currentUser}
                        viewMode={viewMode}
                        onViewModeChange={handleViewModeChange}
                        isAdmin={isAdmin}
                      />
                    </div>
                  )}
                  {typeof MobileNav !== 'undefined' && (
                    <div className="lg:hidden">
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
                  
                  {/* ✅ Content Container - Only render when ready */}
                  <div className="w-full">
                      <motion.div
                          initial="initial"
                          animate="in"
                          exit="out"
                          variants={pageVariants}
                          transition={pageTransition}
                          className="w-full"
                      >
                          {/* ✅ Child Content - Only render when auth is ready */}
                          <div className="w-full">
                            {children}
                          </div>
                      </motion.div>
                  </div>
              </main>
            </div>
        </div>
    );
}