// src/components/layout/Layout.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { updateUserRole } from '../../api/users/update-role';

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
    const [theme, setTheme] = useState('dark');
    
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

    // 🆕 EXTRACT FETCHUSERDATA AS REUSABLE FUNCTION
    const fetchUserData = async () => {
      if (!currentUser) return;
      
      try {
        console.log('📋 Fetching user data from backend...');
        const token = await getToken();
        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          const backendRole = userData.role;
          const uiRole = mapDatabaseRoleToUI(backendRole);
          
          console.log(`📋 User role from backend: ${backendRole} -> UI role: ${uiRole}`);
          setUserRole(uiRole);
        } else {
          console.error('Failed to fetch user profile:', response.statusText);
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

    const pageVariants = {
        initial: { opacity: 0, y: 15 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -15 }
    };

    const pageTransition = {
        type: "tween" as const,
        ease: "anticipate" as const,
        duration: 0.4
    };

    const applyThemeToDOM = (themeToApply: string) => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(themeToApply);
        root.setAttribute('data-theme', themeToApply);
        
        if (themeToApply === 'dark') {
            root.style.colorScheme = 'dark';
        } else {
            root.style.colorScheme = 'light';
        }
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
              
              // Theme handling
              const userTheme = (typeof currentUser.publicMetadata?.theme === 'string' ? currentUser.publicMetadata.theme : null) || 
                               localStorage.getItem('theme-preference') || 
                               'dark';
              setTheme(userTheme);
              applyThemeToDOM(userTheme);
            } else {
              console.log('User not signed in');
              setUserRole('buyer');
              setUnreadCount(0);
              setPendingInvoices(0);
              setActionItemsCount(0);
              
              const storedTheme = localStorage.getItem('theme-preference') || 'dark';
              setTheme(storedTheme);
              applyThemeToDOM(storedTheme);
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

    // Show loading state
    if (!isLoaded || isLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }
    
    return (
        <div className="min-h-screen flex flex-col font-sans bg-background text-foreground relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-lime-400/10 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-3xl"></div>
            </div>
            
            <div>
              {/* 🆕 ENHANCED TOP NAVIGATION */}
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
                // Fallback simple header
                <header className="bg-gray-800 border-b border-gray-700 p-4">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white">Dashboard</h1>
                    {currentUser && (
                      <div className="text-sm text-gray-300 flex items-center gap-4">
                        <span>Welcome, {currentUser.firstName || currentUser.primaryEmailAddress?.emailAddress}</span>
                        <span className={`px-2 py-1 text-white text-xs rounded ${
                          userRole === 'seller' ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}>
                          {userRole === 'seller' ? 'Space Owner' : 'Advertiser'}
                        </span>
                      </div>
                    )}
                  </div>
                </header>
              )}
            </div>

            <div>
              {/* Main Content Area */}
              <main className="flex-1 relative overflow-y-hidden">
                  {/* Mobile Components */}
                  {typeof MobileTopBar !== 'undefined' && <MobileTopBar />}
                  {typeof MobileNav !== 'undefined' && (
                    <MobileNav 
                      unreadCount={unreadCount} 
                      pendingInvoices={pendingInvoices} 
                      actionItemsCount={actionItemsCount} 
                      currentUser={currentUser}
                    />
                  )}
                  
                  {/* Content Container */}
                  <div className="h-full overflow-y-hidden">
                      <motion.div
                          initial="initial"
                          animate="in"
                          exit="out"
                          variants={pageVariants}
                          transition={pageTransition}
                      >
                          {/* 🆕 ROLE UPDATE NOTIFICATION */}
                          {isUpdatingRole && (
                            <div className="fixed top-20 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Switching role...
                            </div>
                          )}
                          {children}
                      </motion.div>
                  </div>
              </main>
            </div>
        </div>
    );
}