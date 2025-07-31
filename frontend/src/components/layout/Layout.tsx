// src/components/layout/Layout.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
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
    
    // Component state
    const [unreadCount, setUnreadCount] = useState(0);
    const [pendingInvoices, setPendingInvoices] = useState(0);
    const [actionItemsCount, setActionItemsCount] = useState(0);
    const [theme, setTheme] = useState('light'); // ✅ Default to light theme for Elaview
    
    // 🆕 SIMPLIFIED ROLE STATE MANAGEMENT - UI ONLY!
    const [viewMode, setViewMode] = useState<'buyer' | 'seller'>('buyer'); // UI state only
    const [isAdmin, setIsAdmin] = useState(false); // Admin flag from database
    const [isLoading, setIsLoading] = useState(true);
    
    // Clerk hooks
    const { isSignedIn, isLoaded } = useAuth();
    const { user: currentUser } = useUser();

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

    // 🆕 FETCH USER DATA INCLUDING isAdmin
    useEffect(() => {
        if (!isLoaded) return;

        const loadUserData = async () => {
          try {
            if (isSignedIn && currentUser) {
              console.log('User signed in:', currentUser.firstName, currentUser.lastName);
              
              // Fetch user data from backend to get isAdmin
              try {
                const response = await apiClient.getUserProfile();
                if (response.success) {
                  const userData = response.data;
                  console.log('📋 User data from backend:', {
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
                    setViewMode('buyer');
                  }
                }
              } catch (error) {
                console.warn('Failed to fetch user profile:', error);
                setIsAdmin(false);
              }

              // Mock data for other counts (replace with real API calls)
              setUnreadCount(0);
              setPendingInvoices(0);
              setActionItemsCount(0);
              
              // ✅ Always use light theme for Elaview
              setTheme('light');
              applyThemeToDOM('light');
            } else {
              console.log('User not signed in');
              setViewMode('buyer');
              setIsAdmin(false);
              setUnreadCount(0);
              setPendingInvoices(0);
              setActionItemsCount(0);
              
              // ✅ Always use light theme for Elaview
              setTheme('light');
              applyThemeToDOM('light');
            }
          } catch (error) {
            console.warn("Error in loadUserData:", error);
          } finally {
            setIsLoading(false);
          }
        };
        
        loadUserData();
      }, [isLoaded, isSignedIn, currentUser]);

    // ✅ Elaview loading state with fallback background
    if (!isLoaded || isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-teal-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="loading-spinner w-8 h-8 text-teal-500 mx-auto mb-3"></div>
            <p className="body-medium text-slate-600">Loading Elaview...</p>
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
              {/* ✅ Enhanced Top Navigation with Elaview styling */}
              {typeof DesktopTopNavV2 !== 'undefined' ? (
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
              ) : (
                // ✅ Fallback header with Elaview styling
                <header className="bg-white border-b border-slate-200 shadow-soft px-6 py-4">
                  <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <h1 className="heading-2 text-slate-900">Elaview</h1>
                    {currentUser && (
                      <div className="flex items-center gap-4">
                        <span className="body-medium text-slate-600">
                          Welcome, {currentUser.firstName || currentUser.primaryEmailAddress?.emailAddress}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          viewMode === 'seller' 
                            ? 'bg-success-100 text-success-800' 
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
              )}
            </div>

            <div className="flex-1 relative z-10">
              {/* Main Content Area */}
              <main className="flex-1 relative">
                  {/* ✅ Mobile Components with proper z-index */}
                  {typeof MobileTopBar !== 'undefined' && (
                    <div className="lg:hidden">
                      <MobileTopBar currentUser={currentUser} />
                    </div>
                  )}
                  {typeof MobileNav !== 'undefined' && (
                    <div className="lg:hidden">
                      <MobileNav 
                        unreadCount={unreadCount} 
                        pendingInvoices={pendingInvoices} 
                        actionItemsCount={actionItemsCount} 
                        currentUser={currentUser}
                      />
                    </div>
                  )}
                  
                  {/* ✅ Content Container - Ensures child components aren't affected */}
                  <div className="w-full">
                      <motion.div
                          initial="initial"
                          animate="in"
                          exit="out"
                          variants={pageVariants}
                          transition={pageTransition}
                          className="w-full"
                      >
                          {/* ✅ Child Content - Unaffected by layout styling */}
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