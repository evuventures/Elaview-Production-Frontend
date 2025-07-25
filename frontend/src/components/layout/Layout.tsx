// src/components/layout/Layout.tsx
import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

// Extracted components - update these imports to match your actual file structure
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
    const [theme, setTheme] = useState('dark'); // Default to dark theme
    
    // Use Clerk hooks
    const { isSignedIn, isLoaded } = useAuth();
    const { user: currentUser } = useUser();

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
        
        // Also set data attribute as backup
        root.setAttribute('data-theme', themeToApply);
        
        // Update CSS custom properties
        if (themeToApply === 'dark') {
            root.style.colorScheme = 'dark';
        } else {
            root.style.colorScheme = 'light';
        }
    };

    useEffect(() => {
        // Only run when Clerk is loaded
        if (!isLoaded) return;

        const fetchUserData = async () => {
          try {
            if (isSignedIn && currentUser) {
              // User is signed in with Clerk
              console.log('User signed in:', currentUser.firstName, currentUser.lastName);
              
              // Fetch actual user data from API when ready
              try {
                // Replace with actual API calls when ready
                setUnreadCount(0); // Will be populated by actual API
                setPendingInvoices(0); // Will be populated by actual API
                setActionItemsCount(0); // Will be populated by actual API
              } catch (error) {
                console.error('Error fetching user data:', error);
                // Set defaults on error
                setUnreadCount(0);
                setPendingInvoices(0);
                setActionItemsCount(0);
              }
              
              // Get theme from user preferences or localStorage
              const userTheme = (typeof currentUser.publicMetadata?.theme === 'string' ? currentUser.publicMetadata.theme : null) || 
                               localStorage.getItem('theme-preference') || 
                               'dark'; // Default to dark for dashboard
              setTheme(userTheme);
              applyThemeToDOM(userTheme);
            } else {
              // User is not signed in
              console.log('User not signed in');
              setUnreadCount(0);
              setPendingInvoices(0);
              setActionItemsCount(0);
              
              // For logged-out users, use stored preference or default to dark
              const storedTheme = localStorage.getItem('theme-preference') || 'dark';
              setTheme(storedTheme);
              applyThemeToDOM(storedTheme);
            }
          } catch (error) {
            console.warn("Error in fetchUserData:", error);
          }
        };
        
        fetchUserData();
        // Poll for updates every 5 minutes when user is signed in
        const interval = setInterval(fetchUserData, 300000);
        return () => clearInterval(interval);
      }, [isLoaded, isSignedIn, currentUser]);
    
    return (
        <div className="min-h-screen flex flex-col font-sans bg-background text-foreground relative overflow-hidden">
            {/* Background Effects - Updated for dark theme */}
            <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-lime-400/10 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-3xl"></div>
            </div>
            
            {/* <div id="nav-and-content" className="grid grid-rows-[1fr_11fr] h-screen"> */}
            <div>
            {/* Top Navigation - Only show if components exist */}
            {typeof DesktopTopNavV2 !== 'undefined' ? (
              <DesktopTopNavV2
                unreadCount={unreadCount} 
                pendingInvoices={pendingInvoices} 
                actionItemsCount={actionItemsCount} 
                currentUser={currentUser}
                onRoleChange={() => {}} // Add empty function as fallback
              />
            ) : (
              // Fallback simple header if nav components don't exist
              <header className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-bold text-white">Dashboard</h1>
                  {currentUser && (
                    <div className="text-sm text-gray-300">
                      Welcome, {currentUser.firstName || currentUser.primaryEmailAddress?.emailAddress}
                    </div>
                  )}
                </div>
              </header>
            )}
            </div>

            <div>
            {/* Main Content Area */}
            <main className="flex-1 relative overflow-y-hidden">
                {/* Mobile Components - Only show if they exist */}
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
                        {children}
                    </motion.div>
                </div>
            </main>
            </div>
        </div>
        // </div>
    );
}