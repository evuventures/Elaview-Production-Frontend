// src/components/layout/Layout.tsx
// ✅ MOBILE RESPONSIVE: Fixed spacing and overflow issues
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

// ✅ SOLUTION: Persist viewMode outside component to survive remounts
let persistedViewMode: 'buyer' | 'seller' = 'buyer';
let viewModeSetByUser = false; // Track if user manually changed it

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
    const [viewMode, setViewMode] = useState<'buyer' | 'seller'>(persistedViewMode); // ✅ Initialize from persisted value
    const [isAdmin, setIsAdmin] = useState(false); // Admin flag from database
    const [isLoading, setIsLoading] = useState(true);
    const [apiReady, setApiReady] = useState(false);
    const [userDataLoaded, setUserDataLoaded] = useState(false);

    // ✅ Check if everything is ready for API calls
    const isFullyLoaded = authLoaded && userLoaded;

    // ✅ FINAL FIX: Update viewMode and persist it
    const handleViewModeChange = (newMode: 'buyer' | 'seller') => {
      console.log(`🔄 PERSISTENT: Switching view from ${viewMode} to ${newMode}`);
      
      // Update component state
      setViewMode(newMode);
      
      // ✅ CRITICAL: Persist outside component to survive remounts
      persistedViewMode = newMode;
      viewModeSetByUser = true; // Mark as user-initiated change
      
      // Navigation with slight delay for state propagation
      setTimeout(() => {
        if (newMode === 'seller') {
          navigate('/dashboard');
        } else if (newMode === 'buyer') {
          navigate('/browse');
        }
      }, 0);
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
                    
                    // ✅ CRITICAL FIX: Only set initial view mode if user hasn't manually changed it
                    if (!viewModeSetByUser) {
                        const initialMode = userData.role === 'PROPERTY_OWNER' ? 'seller' : 'buyer';
                        console.log(`🎯 LAYOUT: Setting initial viewMode to ${initialMode} (user hasn't manually changed it)`);
                        setViewMode(initialMode);
                        persistedViewMode = initialMode;
                    } else {
                        console.log(`🎯 LAYOUT: Keeping user-selected viewMode: ${persistedViewMode} (user manually changed it)`);
                        setViewMode(persistedViewMode); // Ensure component state matches persisted state
                    }
                    
                    setUserDataLoaded(true);
                } else {
                    console.warn('⚠️ LAYOUT: Failed to load user profile:', response.error);
                    setIsAdmin(false);
                    if (!viewModeSetByUser) {
                        setViewMode('buyer');
                        persistedViewMode = 'buyer';
                    }
                }

                // Mock data for other counts (replace with real API calls when ready)
                setUnreadCount(0);
                setPendingInvoices(0);
                setActionItemsCount(0);
                
            } catch (error) {
                console.error('❌ LAYOUT: Error loading user data:', error);
                setIsAdmin(false);
                if (!viewModeSetByUser) {
                    setViewMode('buyer');
                    persistedViewMode = 'buyer';
                }
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
            setViewMode('buyer');
            persistedViewMode = 'buyer';
            viewModeSetByUser = false; // Reset the flag
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
            <div 
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: '#FFFFFF' }}
            >
                <div className="text-center">
                    <div 
                        className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
                        style={{ borderColor: '#4668AB', borderTopColor: 'transparent' }}
                    ></div>
                    <p className="text-sm text-slate-600">
                        {!isFullyLoaded ? 'Loading authentication...' : 'Loading your dashboard...'}
                    </p>
                    {/* Debug info for development */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-2 text-xs text-slate-400">
                            <p>Auth: {authLoaded ? '✅' : '⏳'} | User: {userLoaded ? '✅' : '⏳'}</p>
                            <p>API Ready: {apiReady ? '✅' : '⏳'} | User Data: {userDataLoaded ? '✅' : '⏳'}</p>
                            <p>ViewMode: {viewMode} | Persisted: {persistedViewMode} | UserSet: {viewModeSetByUser ? 'Yes' : 'No'}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    
    return (
        <div 
            className="min-h-screen flex flex-col font-sans text-slate-900 relative"
            style={{ backgroundColor: '#FFFFFF' }}
        >
            {/* ✅ CORRECTED: Subtle Background Effects with pure white background - Only for non-browse pages */}
            {location.pathname !== '/browse' && (
              <div className="fixed inset-0 pointer-events-none opacity-30 z-0">
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, 
                      rgba(255, 255, 255, 0.95) 0%, 
                      rgba(249, 250, 251, 0.8) 50%, 
                      rgba(229, 231, 235, 0.4) 100%)`
                  }}
                ></div>
                <div 
                  className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
                  style={{
                    background: `linear-gradient(135deg, 
                      rgba(70, 104, 171, 0.08) 0%, 
                      rgba(70, 104, 171, 0.03) 100%)`
                  }}
                ></div>
                <div 
                  className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
                  style={{
                    background: `linear-gradient(135deg, 
                      rgba(229, 231, 235, 0.2) 0%, 
                      rgba(249, 250, 251, 0.1) 100%)`
                  }}
                ></div>
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
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                    isAdmin={isAdmin}
                    canSwitchModes={true}
                  />
                </div>
              ) : (
                // ✅ Fallback header with Elaview styling - DESKTOP ONLY  
                <div className="hidden lg:block">
                  <header 
                    className="border-b shadow-soft px-6 py-4"
                    style={{ 
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E7EB'
                    }}
                  >
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                      <h1 className="text-2xl font-bold text-slate-900">Elaview</h1>
                      {currentUser && (
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-slate-600">
                            Welcome, {currentUser.firstName || currentUser.primaryEmailAddress?.emailAddress}
                          </span>
                          <span 
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium`}
                            style={viewMode === 'seller' 
                              ? { backgroundColor: '#DCFCE7', color: '#166534' }
                              : { backgroundColor: '#E0E7FF', color: '#4338CA' }
                            }
                          >
                            {viewMode === 'seller' ? 'Space Owner View' : 'Advertiser View'}
                          </span>
                          {isAdmin && (
                            <span 
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                              style={{ backgroundColor: '#F3E8FF', color: '#7C3AED' }}
                            >
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

            {/* ✅ MOBILE RESPONSIVE: Flex layout with proper spacing */}
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
                  {/* ✅ MOBILE: Content Container with proper padding for nav bars */}
                  <div className={`w-full h-full ${
                    // Add top padding for mobile top bar (64px = h-16)
                    // Add bottom padding for mobile bottom nav (80px for safe area)
                    isSignedIn ? 'md:pt-0 pt-16 md:pb-0 pb-20' : 'md:pt-0 md:pb-0'
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