// src/components/layout/Layout.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { updateUserRole } from '../../api/users/update-role';
import apiClient from '@/api/apiClient'; // ✅ ADD: Import API client

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
    
    // 🆕 ROLE STATE MANAGEMENT
    const [userRole, setUserRole] = useState<'buyer' | 'seller'>('buyer');
    const [isUpdatingRole, setIsUpdatingRole] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // Clerk hooks
    const { isSignedIn, isLoaded, getToken } = useAuth();
    const { user: currentUser } = useUser();

    // 🆕 MAP DATABASE ROLES TO UI ROLES
    const mapDatabaseRoleToUI = (dbRole: string): 'buyer' | 'seller' => {
      const roleMapping: Record<string, 'buyer' | 'seller'> = {
        'USER': 'buyer',
        'ADVERTISER': 'buyer',
        'PROPERTY_OWNER': 'seller',
        'ADMIN': 'buyer', // Default admins to buyer view
        'SUPER_ADMIN': 'buyer'
      };
      return roleMapping[dbRole] || 'buyer';
    };

    // ✅ FIXED: Use API client instead of hardcoded URL
    const fetchUserData = async () => {
      if (!currentUser) return;
      
      try {
        console.log('📋 Fetching user data from backend...');
        
        // ✅ FIXED: Use API client instead of hardcoded fetch
        const response = await apiClient.get('/users/profile');

        if (response.success) {
          const userData = response.data;
          const backendRole = userData.role;
          const uiRole = mapDatabaseRoleToUI(backendRole);
          
          console.log(`📋 User role from backend: ${backendRole} -> UI role: ${uiRole}`);
          setUserRole(uiRole);
        } else {
          console.error('Failed to fetch user profile:', response.message);
          setUserRole('buyer'); // Default fallback
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserRole('buyer'); // Default fallback
      }
    };

    // 🆕 ENHANCED ROLE CHANGE HANDLER WITH AUTO-REDIRECT
    const handleRoleChange = async (newRole: 'buyer' | 'seller') => {
      if (isUpdatingRole) return; // Prevent multiple calls
      
      const oldRole = userRole;
      console.log(`🔄 Switching role from ${oldRole} to ${newRole}`);
      
      setIsUpdatingRole(true);
      
      // Optimistic update
      setUserRole(newRole);

      try {
        // 🔧 FIX: Get token properly and pass it to updateUserRole
        const token = await getToken();
        if (!token) {
          throw new Error('Could not get authentication token');
        }
        
        const result = await updateUserRole(newRole, token);
        
        if (result.success) {
          console.log('✅ Role updated successfully:', result);
          console.log(`✅ Role successfully changed to: ${newRole}`);
          
          // 🆕 AUTO-REDIRECT LOGIC BASED ON NEW ROLE
          if (newRole === 'seller') {
            console.log('🧭 Redirecting seller to /dashboard');
            navigate('/dashboard');
          } else if (newRole === 'buyer') {
            console.log('🧭 Redirecting buyer to /browse');
            navigate('/browse');
          }
          
          // Refresh user data to ensure consistency
          await fetchUserData();
        } else {
          console.error('❌ Role update failed:', result.error);
          // Revert optimistic update on failure
          setUserRole(oldRole);
        }
      } catch (error) {
        console.error('❌ Error updating role:', error);
        // Revert optimistic update on error
        setUserRole(oldRole);
      } finally {
        setIsUpdatingRole(false);
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
        duration: 0.3 // ✅ Faster, more professional transition
    };

    // ✅ Apply light theme for Elaview
    const applyThemeToDOM = (themeToApply: string) => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add('light'); // ✅ Force light theme for Elaview
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
    };

    // 🆕 FETCH USER DATA ON MOUNT AND WHEN USER CHANGES
    useEffect(() => {
        if (!isLoaded) return;

        const loadUserData = async () => {
          try {
            if (isSignedIn && currentUser) {
              console.log('User signed in:', currentUser.firstName, currentUser.lastName);
              
              // Fetch user role from backend
              await fetchUserData();

              // Mock data for other counts (replace with real API calls)
              setUnreadCount(0);
              setPendingInvoices(0);
              setActionItemsCount(0);
              
              // ✅ Always use light theme for Elaview
              setTheme('light');
              applyThemeToDOM('light');
            } else {
              console.log('User not signed in');
              setUserRole('buyer');
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
        
        // Poll for updates every 5 minutes when user is signed in
        const interval = setInterval(() => {
          if (isSignedIn && currentUser) {
            fetchUserData();
          }
        }, 300000);
        
        return () => clearInterval(interval);
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
                  userRole={userRole}
                  onRoleChange={handleRoleChange}
                  isUpdatingRole={isUpdatingRole}
                  canSwitchRoles={true}
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
                          userRole === 'seller' 
                            ? 'bg-success-100 text-success-800' 
                            : 'bg-teal-100 text-teal-800'
                        }`}>
                          {userRole === 'seller' ? 'Space Owner' : 'Advertiser'}
                        </span>
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
                          {/* ✅ Role Update Notification with correct styling */}
                          {isUpdatingRole && (
                            <div className="fixed top-20 right-4 z-50 animate-fade-in">
                              <div className="card card-compact bg-white border-teal-200 shadow-soft-lg flex items-center gap-3">
                                <div className="loading-spinner w-4 h-4 text-teal-500"></div>
                                <span className="body-small font-medium text-slate-700">Switching role...</span>
                              </div>
                            </div>
                          )}
                          
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