// Enhanced Navigation - Deep Charcoal Version (#0F172A) with Home Link
// ✅ FIXED: Resolved infinite re-render loop in notification fetching
// ✅ OPTIMIZED: Proper useCallback dependencies and memoization
// ✅ ADDED: Console logs for debugging and verification
// ✅ NEW: Home page navigation link added
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { 
  User, ChevronDown, Bell, Settings, LogOut,
  Building2, Calendar, MessageSquare, Map, LayoutDashboard,
  MapPin, Calendar as CalendarIcon, Mail, UserCircle, Shield,
  HelpCircle, LogIn, Clock, Loader2, Check, Search, Home // ✅ NEW: Home icon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/api/apiClient';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import elaviewLogo from '../../../public/elaview-logo.png';

const DesktopTopNavV2_DeepCharcoal = React.memo(({ 
  unreadCount = 0, 
  pendingInvoices = 0, 
  actionItemsCount = 0, 
  currentUser,
  viewMode = 'buyer', // 'buyer' | 'seller' - UI state only
  onViewModeChange, // Function to change view mode
  isAdmin = false, // Admin flag from database
  canSwitchModes = true, // Always true now
  bookingsCount = 0,
  propertiesCount = 0
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // ✅ COLOR SCHEME: Deep Charcoal Version
  useEffect(() => {
    console.log('🎨 DESKTOP NAV (Deep Charcoal): Color scheme verification', {
      navBackground: '#0F172A',
      primaryBlue: '#4668AB',
      whiteText: '#FFFFFF',
      premiumFeel: 'Sophisticated and modern',
      timestamp: new Date().toISOString()
    });
  }, []);

  // ✅ FIXED: Notification state with proper ref for lastFetchTime
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  // ✅ CRITICAL FIX: Use useRef for lastFetchTime to avoid useCallback dependency issues
  const lastFetchTimeRef = useRef(null);
  const fetchIntervalRef = useRef(null);

  console.log('🔄 DESKTOP NAV: Component render', {
    isSignedIn,
    notificationCount,
    isRateLimited,
    isFetching,
    lastFetchTime: lastFetchTimeRef.current,
    timestamp: new Date().toISOString()
  });

  // ✅ UPDATED: Navigation items with Home link added
  const navigationItems = useMemo(() => {
    const baseItems = [
      {
        title: 'Home',
        url: '/home',
        icon: Home,
        badge: 0,
        showAlways: true // ✅ NEW: Show for both authenticated and unauthenticated users
      }
    ];

    if (!isSignedIn) {
      return baseItems;
    }

    if (viewMode === 'seller') {
      return [
        ...baseItems,
        {
          title: 'Property Hub',
          url: '/dashboard',
          icon: Building2,
          badge: pendingInvoices || 0
        },
        {
          title: 'Find Spaces',
          url: '/browse',
          icon: Search,
          badge: 0
        },
        {
          title: 'Messages',
          url: '/messages',
          icon: MessageSquare,
          badge: unreadCount || 0
        }
      ];
    } else {
      return [
        ...baseItems,
        {
          title: 'Advertiser Hub',
          url: '/advertise',
          icon: CalendarIcon,
          badge: actionItemsCount || 0
        },
        {
          title: 'Find Spaces',
          url: '/browse',
          icon: Search,
          badge: 0
        },
        {
          title: 'Messages',
          url: '/messages',
          icon: MessageSquare,
          badge: unreadCount || 0
        }
      ];
    }
  }, [viewMode, pendingInvoices, unreadCount, actionItemsCount, isSignedIn]);

  // ✅ CRITICAL FIX: Stabilized fetchNotificationCount without problematic dependencies
  const fetchNotificationCount = useCallback(async (force = false) => {
    // ✅ Early returns to prevent unnecessary calls
    if (!isSignedIn) {
      console.log('⚠️ NOTIFICATION FETCH: Not signed in, skipping');
      return;
    }
    
    if (isRateLimited) {
      console.log('⚠️ NOTIFICATION FETCH: Rate limited, skipping');
      return;
    }

    if (isFetching) {
      console.log('⚠️ NOTIFICATION FETCH: Already fetching, skipping');
      return;
    }
    
    const now = Date.now();
    const lastFetch = lastFetchTimeRef.current;
    
    // ✅ Throttling check with ref instead of state
    if (!force && lastFetch && (now - lastFetch) < 120000) {
      console.log(`⏳ NOTIFICATION FETCH: Throttled (${Math.round((now - lastFetch) / 1000)}s since last fetch)`);
      return;
    }

    setIsFetching(true);
    console.log('🔄 NOTIFICATION FETCH: Starting fetch...', { force, lastFetch: lastFetch ? new Date(lastFetch).toISOString() : 'never' });

    try {
      const response = await apiClient.getNotificationCount();
      
      if (response.success) {
        const count = response.count || 0;
        setNotificationCount(count);
        lastFetchTimeRef.current = now; // ✅ Use ref instead of state
        setIsRateLimited(false);
        console.log('✅ NOTIFICATION FETCH: Success', { count, timestamp: new Date(now).toISOString() });
      } else {
        console.warn('⚠️ NOTIFICATION FETCH: API returned success: false', response);
      }
    } catch (error) {
      console.error('❌ NOTIFICATION FETCH: Failed', error.message);
      
      if (error.message.includes('429') || error.message.includes('Rate limited')) {
        console.warn('🚫 NOTIFICATION FETCH: Rate limited - backing off for 5 minutes');
        setIsRateLimited(true);
        setTimeout(() => {
          setIsRateLimited(false);
          console.log('✅ NOTIFICATION FETCH: Rate limit reset - resuming');
        }, 300000);
      }
    } finally {
      setIsFetching(false);
      console.log('🏁 NOTIFICATION FETCH: Complete');
    }
  }, [isSignedIn, isRateLimited, isFetching]); // ✅ Removed lastFetchTime dependency

  // ✅ FIXED: Fetch full notifications with proper error handling
  const fetchFullNotifications = useCallback(async () => {
    if (!isSignedIn || isRateLimited || isFetching) {
      console.log('⚠️ FULL NOTIFICATIONS: Skipping fetch', { isSignedIn, isRateLimited, isFetching });
      return { notifications: [], count: notificationCount };
    }

    console.log('🔄 FULL NOTIFICATIONS: Starting fetch...');
    setIsFetching(true);

    try {
      const response = await apiClient.getUnreadNotifications();
      
      if (response.success) {
        const fetchedNotifications = response.notifications || [];
        setNotifications(fetchedNotifications);
        setNotificationCount(response.count || 0);
        console.log('✅ FULL NOTIFICATIONS: Success', { count: fetchedNotifications.length });
        return { notifications: fetchedNotifications, count: response.count || 0 };
      } else {
        console.warn('⚠️ FULL NOTIFICATIONS: API returned success: false', response);
      }
    } catch (error) {
      console.error('❌ FULL NOTIFICATIONS: Failed', error.message);
      
      if (error.message.includes('429') || error.message.includes('Rate limited')) {
        setIsRateLimited(true);
        setTimeout(() => setIsRateLimited(false), 300000);
      }
      
      return { notifications, count: notificationCount };
    } finally {
      setIsFetching(false);
      console.log('🏁 FULL NOTIFICATIONS: Complete');
    }
    
    return { notifications: [], count: 0 };
  }, [isSignedIn, isRateLimited, isFetching, notifications, notificationCount]);

  // ✅ OPTIMIZED: Handle notification actions with local state updates
  const handleNotificationAction = useCallback((action) => {
    console.log('🔔 NOTIFICATION ACTION:', action);
    
    if (action === 'approved' || action === 'declined' || action === 'messaged') {
      setNotificationCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.slice(1));
    } else if (action === 'mark_all_read') {
      setNotificationCount(0);
      setNotifications([]);
    }
    
    // ✅ Refresh after action with delay
    setTimeout(() => {
      fetchNotificationCount(true);
    }, 2000);
  }, [fetchNotificationCount]);

  // Enhanced outside click detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [userMenuOpen]);

  // ✅ CRITICAL FIX: Stabilized auth effect with proper cleanup
  useEffect(() => {
    console.log('🔄 DESKTOP NAV: Auth state changed', { isSignedIn, isRateLimited });
    
    if (isSignedIn) {
      // ✅ Initial fetch
      fetchNotificationCount(true);
      
      // ✅ Set up interval with ref to avoid dependency issues
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
      
      fetchIntervalRef.current = setInterval(() => {
        console.log('⏰ DESKTOP NAV: Interval tick - checking if should fetch');
        
        // ✅ Check conditions before fetching
        if (!isRateLimited && !isFetching) {
          console.log('⏰ DESKTOP NAV: Interval fetch triggered');
          fetchNotificationCount();
        } else {
          console.log('⏰ DESKTOP NAV: Interval fetch skipped', { isRateLimited, isFetching });
        }
      }, 180000); // 3 minutes
      
      console.log('✅ DESKTOP NAV: Notification fetching initialized');
      
    } else {
      // ✅ Clean up when not signed in
      setNotificationCount(0);
      setNotifications([]);
      setIsRateLimited(false);
      lastFetchTimeRef.current = null;
      
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
        fetchIntervalRef.current = null;
      }
      
      console.log('🧹 DESKTOP NAV: Cleaned up notification state');
    }

    // ✅ Cleanup function
    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
        fetchIntervalRef.current = null;
      }
    };
  }, [isSignedIn]); // ✅ Only depend on isSignedIn

  // ✅ Separate effect for rate limit changes
  useEffect(() => {
    console.log('🔄 DESKTOP NAV: Rate limit state changed', { isRateLimited });
  }, [isRateLimited]);

  // ✅ FIXED: Simplified view switch handler
  const handleViewSwitch = useCallback((newMode) => {
    if (!onViewModeChange) return;
    
    console.log(`🔄 DESKTOP NAV: Switching view from ${viewMode} to ${newMode}`);
    onViewModeChange(newMode);
  }, [onViewModeChange, viewMode]);

  // ✅ OPTIMIZED: Memoize sign out handler
  const handleSignOut = useCallback(async () => {
    try {
      console.log('🚪 DESKTOP NAV: Signing out user...');
      setUserMenuOpen(false);
      
      // ✅ Clean up before sign out
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
        fetchIntervalRef.current = null;
      }
      
      await signOut({
        redirectUrl: '/browse'
      });
    } catch (error) {
      console.error('❌ DESKTOP NAV: Error signing out:', error);
      navigate('/browse');
    }
  }, [signOut, navigate]);

  // ✅ OPTIMIZED: Memoize sign in handler
  const handleSignIn = useCallback(() => {
    console.log('🔑 DESKTOP NAV: Navigating to sign in');
    navigate('/sign-in');
  }, [navigate]);

  // ✅ OPTIMIZED: Memoize badge count formatter
  const formatBadgeCount = useCallback((count) => {
    if (count > 99) return '99+';
    return count.toString();
  }, []);

  // ✅ OPTIMIZED: Enhanced user menu toggle with useCallback
  const toggleUserMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('👤 DESKTOP NAV: Toggling user menu');
    setUserMenuOpen(prev => !prev);
    setNotificationMenuOpen(false);
  }, []);

  // ✅ OPTIMIZED: Notification menu toggle with on-demand fetching and useCallback
  const toggleNotificationMenu = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wasOpen = notificationMenuOpen;
    console.log('🔔 DESKTOP NAV: Toggling notification menu', { wasOpen, isRateLimited });
    
    setNotificationMenuOpen(prev => !prev);
    setUserMenuOpen(false);
    
    if (!wasOpen && !isRateLimited && !isFetching) {
      console.log('🔔 DESKTOP NAV: Fetching full notifications on menu open');
      await fetchFullNotifications();
    }
  }, [notificationMenuOpen, isRateLimited, isFetching, fetchFullNotifications]);

  // ✅ OPTIMIZED: Memoize close functions
  const closeUserMenu = useCallback(() => {
    console.log('👤 DESKTOP NAV: Closing user menu');
    setUserMenuOpen(false);
  }, []);

  const closeNotificationMenu = useCallback(() => {
    console.log('🔔 DESKTOP NAV: Closing notification menu');
    setNotificationMenuOpen(false);
  }, []);

  // ✅ OPTIMIZED: Memoize profile image component
  const profileImage = useMemo(() => {
    if (currentUser?.imageUrl) {
      return (
        <img 
          src={currentUser.imageUrl} 
          alt="Profile"
          className="w-7 h-7 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-white/20 transition-all duration-200"
        />
      );
    }
    
    return (
      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center ring-2 ring-white/10 group-hover:ring-white/20 transition-all duration-200">
        <UserCircle className="w-4 h-4 text-white" />
      </div>
    );
  }, [currentUser?.imageUrl]);

  // ✅ DEBUG: Component unmount cleanup
  useEffect(() => {
    return () => {
      console.log('🧹 DESKTOP NAV: Component unmounting - cleaning up');
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Navigation Header - Deep Charcoal Version */}
      <header 
        className="fixed top-0 left-0 right-0 h-18 shadow-xl backdrop-blur-sm z-50 border-b border-white/5 bg-slate-800"
      >
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          
          {/* Left Section: Logo + Navigation */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link to={viewMode === 'seller' ? '/dashboard' : '/browse'} className="flex items-center group">
              <img 
                src={elaviewLogo}
                alt="Elaview Logo" 
                className="w-16 h-16 object-contain brightness-0 invert opacity-95 group-hover:opacity-100 transition-opacity duration-200"
              />
            </Link>

            {/* Navigation - Show Home always, other items only for authenticated users */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url;
                
                // ✅ NEW: Show Home for everyone, other items only for signed in users
                if (!item.showAlways && !isSignedIn) {
                  return null;
                }
                
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-white bg-white/10 shadow-lg backdrop-blur-sm'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden xl:inline">{item.title}</span>
                    {item.badge > 0 && (
                      <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[16px] h-4 flex items-center justify-center shadow-sm">
                        {formatBadgeCount(item.badge)}
                      </Badge>
                    )}
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white rounded-full shadow-sm"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
              
              {/* Admin Dashboard Link */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname.startsWith('/admin')
                      ? 'text-white bg-purple-500/20 shadow-lg backdrop-blur-sm'
                      : 'text-purple-300 hover:text-purple-200 hover:bg-purple-500/10'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden xl:inline">Admin</span>
                  {location.pathname.startsWith('/admin') && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white rounded-full shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              )}
            </nav>
          </div>

          {/* Right Section: View Mode Toggle + Actions + User */}
          <div className="flex items-center gap-4">
            
            {/* ✅ UPDATED: View Mode Toggle - Premium Deep Charcoal Style */}
            {isSignedIn && canSwitchModes && (
              <div className="hidden md:block">
                <button
                  onClick={() => {
                    const newMode = viewMode === 'seller' ? 'buyer' : 'seller';
                    handleViewSwitch(newMode);
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 border border-white/10 hover:border-white/20 backdrop-blur-sm"
                >
                  {viewMode === 'seller' 
                    ? 'Viewing as: Space Owner' 
                    : 'Viewing as: Advertiser'
                  }
                </button>
              </div>
            )}

            {/* Notification Bell Button - Only show for signed in users */}
            {isSignedIn && (
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleNotificationMenu}
                  disabled={isRateLimited || isFetching}
                  className={`relative w-9 h-9 p-0 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm ${
                    (isRateLimited || isFetching) ? 'opacity-50 cursor-not-allowed' : ''
                  } ${notificationMenuOpen ? 'bg-white/15 text-white shadow-lg' : ''}`}
                >
                  <Bell className="w-4 h-4" />
                  {notificationCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-lg ring-2 ring-red-500/20">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </div>
                  )}
                  {/* Rate limit indicator */}
                  {isRateLimited && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-500 rounded-full shadow-sm" title="Rate limited"></div>
                  )}
                  {/* Fetching indicator */}
                  {isFetching && (
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full shadow-sm animate-pulse" title="Fetching"></div>
                  )}
                </Button>

                <NotificationDropdown 
                  isOpen={notificationMenuOpen}
                  onClose={closeNotificationMenu}
                  onNotificationAction={handleNotificationAction}
                  notifications={notifications}
                  notificationCount={notificationCount}
                  isLoading={isFetching}
                />
              </div>
            )}

            {/* Authentication Section */}
            {isSignedIn && currentUser ? (
              /* Authenticated User Menu */
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={toggleUserMenu}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-white/10 backdrop-blur-sm"
                >
                  {profileImage}
                  <div className="hidden sm:block text-left">
                    <p className="font-medium text-sm text-white truncate max-w-20 group-hover:text-white/90 transition-colors">
                      {currentUser.firstName}
                    </p>
                    <p className="text-xs text-white/50">
                      {isAdmin && 'Admin'}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-white/40 transition-all duration-200 ${userMenuOpen ? 'rotate-180 text-white/70' : 'group-hover:text-white/60'}`} />
                </button>

                {/* Enhanced User Dropdown */}
                <AnimatePresence mode="wait">
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-[999998]" onClick={closeUserMenu} />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 300, 
                          damping: 30,
                          duration: 0.2 
                        }}
                        className="fixed top-14 bg-slate-200 right-4 w-72 border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-[999999] backdrop-blur-sm"
                        style={{ 
                          transformOrigin: 'top right'
                        }}
                      >
                        {/* User Info Header */}
                        <div className="px-4 py-4 bg-slate-300 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            {currentUser?.imageUrl ? (
                              <img 
                                src={currentUser.imageUrl} 
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center ring-2 ring-blue-200">
                                <UserCircle className="w-6 h-6 text-blue-600" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-slate-800">
                                {currentUser.firstName} {currentUser.lastName}
                              </p>
                              <p className="text-xs text-slate-600 truncate">
                                {currentUser.emailAddresses?.[0]?.emailAddress}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Badge className={`text-xs px-2 py-1 ${
                              viewMode === 'seller' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {viewMode === 'seller' ? 'Space Owner View' : 'Advertiser View'}
                            </Badge>
                            {isAdmin && (
                              <Badge className="text-xs px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200">
                                Admin
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          {isAdmin && (
                            <>
                              <Link
                                to="/admin"
                                onClick={closeUserMenu}
                                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-200 group"
                              >
                                <Shield className="w-4 h-4" />
                                <div className="flex-1">
                                  <div className="font-medium">Admin Dashboard</div>
                                  <div className="text-xs text-purple-500">Manage platform</div>
                                </div>
                              </Link>
                              <div className="border-t my-2 border-gray-200" />
                            </>
                          )}
                          
                          <Link
                            to="/profile"
                            onClick={closeUserMenu}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200"
                          >
                            <UserCircle className="w-4 h-4 text-blue-500" />
                            <div className="flex-1">
                              <div className="font-medium">Profile Settings</div>
                              <div className="text-xs text-slate-500">Manage your account</div>
                            </div>
                          </Link>
                          
                          <Link
                            to="/settings"
                            onClick={closeUserMenu}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200"
                          >
                            <Settings className="w-4 h-4 text-blue-500" />
                            <div className="flex-1">
                              <div className="font-medium">Preferences</div>
                              <div className="text-xs text-slate-500">Notifications & privacy</div>
                            </div>
                          </Link>

                          <Link
                            to="/help"
                            onClick={closeUserMenu}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200"
                          >
                            <HelpCircle className="w-4 h-4 text-blue-500" />
                            <div className="flex-1">
                              <div className="font-medium">Help & Support</div>
                              <div className="text-xs text-slate-500">Get assistance</div>
                            </div>
                          </Link>

                          <div className="border-t my-2 border-gray-200" />
                          
                          <button 
                            type="button"
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                          >
                            <LogOut className="w-4 h-4" />
                            <div className="flex-1 text-left">
                              <div className="font-medium">Sign Out</div>
                              <div className="text-xs text-red-500">End your session</div>
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Sign In Button for Unauthenticated Users */
              <Button
                onClick={handleSignIn}
                className="flex items-center gap-2 px-4 py-2 text-slate-800 font-medium bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content Spacer */}
      <div className="h-14" />
    </>
  );
});

DesktopTopNavV2_DeepCharcoal.displayName = 'DesktopTopNavV2_DeepCharcoal';

export default DesktopTopNavV2_DeepCharcoal;