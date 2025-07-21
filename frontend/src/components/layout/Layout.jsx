// src/pages/Layout.jsx
import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

// Extracted components
import DesktopSidebar from '@/components/layout/nested/DesktopSidebar';
import DesktopSidebarV2 from './nested/DesktopSidebarV2';
import DesktopTopNav from './nested/DesktopTopNav';
import DesktopTopNavV2 from './nested/DesktopTopNavV2';
import MobileNav from '@/components/layout/nested/MobileNav';
import MobileTopBar from '@/components/layout/nested/MobileTopBar';

export default function Layout({ children, currentPageName }) {
    const isMobile = useIsMobile();
    const [unreadCount, setUnreadCount] = useState(0);
    const [pendingInvoices, setPendingInvoices] = useState(0);
    const [actionItemsCount, setActionItemsCount] = useState(0);
    const [theme, setTheme] = useState('light');
    
    // Use Clerk hooks instead of Base44
    const { isSignedIn, isLoaded } = useAuth();
    const { user: currentUser } = useUser();

    const pageVariants = {
        initial: { opacity: 0, y: 15 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -15 }
    };

    const pageTransition = {
        type: "tween",
        ease: "anticipate",
        duration: 0.4
    };

    const applyThemeToDOM = (themeToApply) => {
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
              
              // Fetch actual user data from API
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
              const userTheme = currentUser.publicMetadata?.theme || 
                               localStorage.getItem('theme-preference') || 
                               'light';
              setTheme(userTheme);
              applyThemeToDOM(userTheme);
            } else {
              // User is not signed in
              console.log('User not signed in');
              setUnreadCount(0);
              setPendingInvoices(0);
              setActionItemsCount(0);
              
              // For logged-out users, use stored preference or default to light
              const storedTheme = localStorage.getItem('theme-preference') || 'light';
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

       if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-background text-foreground font-sans">
        <MobileTopBar />
        <main className="flex-1 overflow-auto pt-16 pb-20">
          {children}
        </main>
        <MobileNav
          unreadCount={unreadCount}
          pendingInvoices={pendingInvoices}
          actionItemsCount={actionItemsCount}
          currentUser={currentUser}
        />
      </div>
    );
  }
    
    return (
        <div className="min-h-screen flex flex-col font-sans bg-background text-foreground relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl"></div>
            </div>
            
            {/* Top Navigation */}
            <DesktopTopNavV2
              unreadCount={unreadCount} 
              pendingInvoices={pendingInvoices} 
              actionItemsCount={actionItemsCount} 
              currentUser={currentUser} 
            />
            
            {/* Main Content Area - FIXED: Removed md:ml-72 and updated layout */}
            <main className="flex-1 relative">
                {/* Mobile Components */}
                <MobileTopBar />
                <MobileNav 
                  unreadCount={unreadCount} 
                  pendingInvoices={pendingInvoices} 
                  actionItemsCount={actionItemsCount} 
                  currentUser={currentUser}
                />
                
                {/* Content Container - Updated padding for top nav */}
                <div className="p-4 md:p-8 pt-20 pb-24 md:pt-6 md:pb-8 h-full overflow-y-auto">
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
    );
}