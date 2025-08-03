// Enhanced Navigation with Working Notifications - Elaview Design System
// ✅ UPDATED: UI-only view switching and admin dashboard link
// ✅ FIXED: onClick handler to prevent stale state issues
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { 
  User, ChevronDown, Bell, Settings, LogOut,
  Building2, Calendar, MessageSquare, Map, LayoutDashboard,
  MapPin, Calendar as CalendarIcon, Mail, UserCircle, Shield,
  Bookmark, HelpCircle, LogIn, Clock, Loader2, Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/api/apiClient';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import elaviewLogo from '../../../public/elaview-logo.png';

const DesktopTopNavV2 = ({ 
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

  // ✅ OPTIMIZED: Notification state with better rate limiting
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // View-mode-specific navigation items (not role-specific)
  const getNavigationItems = (mode) => {
    if (mode === 'seller') {
      return [
        {
          title: 'My Spaces',
          url: '/dashboard',
          icon: LayoutDashboard,
          badge: pendingInvoices || 0
        },
        {
          title: 'Browse',
          url: '/browse',
          icon: MapPin,
          badge: 0
        },
        {
          title: 'Messages',
          url: '/messages',
          icon: Mail,
          badge: unreadCount || 0
        }
      ];
    } else {
      return [
        {
          title: 'Ad Manager',
          url: '/advertise',
          icon: CalendarIcon,
          badge: actionItemsCount || 0
        },
        {
          title: 'Browse',
          url: '/browse',
          icon: MapPin,
          badge: 0
        },
        {
          title: 'Messages',
          url: '/messages',
          icon: Mail,
          badge: unreadCount || 0
        }
      ];
    }
  };

  const navigationItems = getNavigationItems(viewMode);

  // ✅ OPTIMIZED: Fetch notification count with better throttling and rate limit handling
  const fetchNotificationCount = async (force = false) => {
    if (!isSignedIn || isRateLimited) return;
    
    // ✅ OPTIMIZED: Avoid too frequent requests (max every 2 minutes unless forced)
    const now = Date.now();
    if (!force && lastFetchTime && (now - lastFetchTime) < 120000) {
      console.log('⏳ Notification fetch throttled (< 2 minutes since last fetch)');
      return;
    }

    try {
      const response = await apiClient.getNotificationCount();
      
      if (response.success) {
        setNotificationCount(response.count || 0);
        setLastFetchTime(now);
        setIsRateLimited(false); // Reset rate limit flag on success
        console.log('✅ Notification count fetched:', response.count);
      }
    } catch (error) {
      console.error('❌ Failed to fetch notification count:', error);
      
      // ✅ OPTIMIZED: Handle rate limiting specifically
      if (error.message.includes('429')) {
        console.warn('🚫 Rate limited - pausing notification fetching for 5 minutes');
        setIsRateLimited(true);
        
        // Reset rate limit flag after 5 minutes
        setTimeout(() => {
          setIsRateLimited(false);
          console.log('✅ Rate limit reset - resuming notification fetching');
        }, 300000); // 5 minutes
      }
    }
  };

  // ✅ OPTIMIZED: Fetch full notifications with rate limit protection
  const fetchFullNotifications = async () => {
    if (!isSignedIn || isRateLimited) {
      return { notifications: [], count: notificationCount };
    }

    try {
      const response = await apiClient.getUnreadNotifications();
      
      if (response.success) {
        const fetchedNotifications = response.notifications || [];
        setNotifications(fetchedNotifications);
        setNotificationCount(response.count || 0);
        console.log('✅ Full notifications fetched:', fetchedNotifications.length);
        return { notifications: fetchedNotifications, count: response.count || 0 };
      }
    } catch (error) {
      console.error('❌ Failed to fetch full notifications:', error);
      
      if (error.message.includes('429')) {
        setIsRateLimited(true);
        setTimeout(() => setIsRateLimited(false), 300000);
      }
      
      // Return cached data on error
      return { notifications, count: notificationCount };
    }
    
    return { notifications: [], count: 0 };
  };

  // ✅ OPTIMIZED: Handle notification actions with local state updates
  const handleNotificationAction = (action) => {
    console.log('🔔 Notification action:', action);
    
    // Update local state immediately for better UX
    if (action === 'approved' || action === 'declined' || action === 'messaged') {
      setNotificationCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.slice(1)); // Remove first notification
    } else if (action === 'mark_all_read') {
      setNotificationCount(0);
      setNotifications([]);
    }
    
    // Refresh from server after a delay (debounced)
    setTimeout(() => {
      fetchNotificationCount(true);
    }, 2000);
  };

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

  // ✅ OPTIMIZED: Fetch notification count on auth change with 3-minute intervals
  useEffect(() => {
    if (isSignedIn) {
      // Initial fetch
      fetchNotificationCount(true);
      
      // ✅ OPTIMIZED: Set up periodic refresh every 3 minutes instead of 1 minute
      const interval = setInterval(() => {
        if (!isRateLimited) {
          fetchNotificationCount();
        }
      }, 180000); // 3 minutes = 180,000ms
      
      return () => clearInterval(interval);
    } else {
      setNotificationCount(0);
      setNotifications([]);
      setIsRateLimited(false);
    }
  }, [isSignedIn]);

  // ✅ FIXED: Direct view mode switch (removed blocking condition)
  const handleViewSwitch = (newMode) => {
    if (!onViewModeChange) return; // Only check if function exists
    
    console.log(`🔄 Desktop: Switching view from ${viewMode} to ${newMode}`);
    onViewModeChange(newMode);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      console.log('🚪 Signing out user...');
      closeUserMenu();
      
      // Sign out with Clerk and redirect to browse
      await signOut({
        redirectUrl: '/browse'
      });
    } catch (error) {
      console.error('❌ Error signing out:', error);
      // Fallback redirect if signOut fails
      navigate('/browse');
    }
  };

  // Handle sign in redirect
  const handleSignIn = () => {
    navigate('/sign-in');
  };

  const formatBadgeCount = (count) => {
    if (count > 99) return '99+';
    return count.toString();
  };

  // Enhanced user menu toggle
  const toggleUserMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setUserMenuOpen(prev => !prev);
    setNotificationMenuOpen(false); // Close notification menu
  };

  // ✅ OPTIMIZED: Notification menu toggle with on-demand fetching
  const toggleNotificationMenu = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wasOpen = notificationMenuOpen;
    setNotificationMenuOpen(prev => !prev);
    setUserMenuOpen(false); // Close user menu
    
    // Only fetch full notifications when opening the dropdown
    if (!wasOpen && !isRateLimited) {
      await fetchFullNotifications();
    }
  };

  // Close user menu
  const closeUserMenu = () => {
    setUserMenuOpen(false);
  };

  // Close notification menu
  const closeNotificationMenu = () => {
    setNotificationMenuOpen(false);
  };

  // Profile image with fallback
  const getProfileImage = () => {
    if (currentUser?.imageUrl) {
      return (
        <img 
          src={currentUser.imageUrl} 
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover ring-2 ring-white group-hover:ring-teal-200 transition-all duration-200"
        />
      );
    }
    
    return (
      <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center ring-2 ring-white group-hover:ring-teal-200 transition-all duration-200">
        <UserCircle className="w-5 h-5 text-white" />
      </div>
    );
  };

  return (
    <>
      {/* Navigation Header - Updated with cream background */}
      <header 
        className="fixed top-0 left-0 right-0 h-16 border-b border-slate-200/60 z-50 shadow-sm backdrop-blur-sm"
        style={{ backgroundColor: '#f7f5e6' }}
      >
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          
          {/* Left Section: Logo + Navigation */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to={viewMode === 'seller' ? '/dashboard' : '/browse'} className="flex items-center gap-2 group">
              <img 
                src={elaviewLogo}
                alt="Elaview Logo" 
                className="w-20 h-20 object-contain"
              />
            </Link>

            {/* Navigation - Only show for authenticated users */}
            {isSignedIn && (
              <nav className="hidden lg:flex items-center gap-1">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-teal-700 bg-white/80 backdrop-blur-sm border border-teal-200 shadow-sm'
                          : 'text-slate-600 hover:text-slate-800 hover:bg-white/40 backdrop-blur-sm'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="hidden xl:inline">{item.title}</span>
                      {item.badge > 0 && (
                        <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[16px] h-4 flex items-center justify-center">
                          {formatBadgeCount(item.badge)}
                        </Badge>
                      )}
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-teal-500 rounded-full"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
                
                {/* ✅ NEW: Admin Dashboard Link */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      location.pathname.startsWith('/admin')
                        ? 'text-purple-700 bg-purple-50 border border-purple-200 shadow-sm'
                        : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span className="hidden xl:inline">Admin</span>
                    {/* Active indicator for admin */}
                    {location.pathname.startsWith('/admin') && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-purple-500 rounded-full"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Right Section: View Mode Toggle + Actions + User */}
          <div className="flex items-center gap-3">
            
            {/* ✅ FIXED: View Mode Toggle Button with corrected onClick */}
            {isSignedIn && canSwitchModes && (
              <div className="hidden md:block relative">
                <button
                  onClick={() => {
                    // ✅ FIXED: State-independent toggle logic
                    const newMode = viewMode === 'seller' ? 'buyer' : 'seller';
                    handleViewSwitch(newMode);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white/80 shadow-sm ${
                    viewMode === 'seller' 
                      ? 'text-emerald-600 hover:text-emerald-700 hover:border-emerald-200' 
                      : 'text-blue-600 hover:text-blue-700 hover:border-blue-200'
                  }`}
                >
                  {viewMode === 'seller' ? (
                    <Building2 className="w-4 h-4" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  <span>
                    {viewMode === 'seller' 
                      ? 'Viewing as: Space Owner' 
                      : 'Viewing as: Advertiser'
                    }
                  </span>
                </button>
              </div>
            )}

            {/* ✅ OPTIMIZED: Notification Bell Button with rate limit indicator */}
            {isSignedIn && (
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleNotificationMenu}
                  disabled={isRateLimited}
                  className={`relative w-10 h-10 p-0 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-white/60 backdrop-blur-sm transition-all duration-200 ${
                    isRateLimited ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {notificationCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </div>
                  )}
                  {isRateLimited && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
                  )}
                </Button>

                {/* ✅ OPTIMIZED: Pass notifications as props to avoid additional API calls */}
                <NotificationDropdown 
                  isOpen={notificationMenuOpen}
                  onClose={closeNotificationMenu}
                  onNotificationAction={handleNotificationAction}
                  notifications={notifications}
                  notificationCount={notificationCount}
                  isLoading={false}
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
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/60 backdrop-blur-sm transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                  {getProfileImage()}
                  <div className="hidden sm:block text-left">
                    <p className="font-medium text-sm text-slate-800 truncate max-w-28 group-hover:text-slate-600 transition-colors">
                      {currentUser.firstName}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {viewMode === 'seller' ? 'Space Owner View' : 'Advertiser View'}
                      {isAdmin && ' • Admin'}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-all duration-200 ${userMenuOpen ? 'rotate-180 text-slate-600' : 'group-hover:text-slate-600'}`} />
                </button>

                {/* Enhanced User Dropdown */}
                <AnimatePresence mode="wait">
                  {userMenuOpen && (
                    <>
                      {/* Invisible backdrop to catch clicks */}
                      <div 
                        className="fixed inset-0 z-[999998]" 
                        onClick={closeUserMenu}
                      />
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
                        className="fixed top-16 right-4 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-[999999]"
                        style={{ 
                          transformOrigin: 'top right',
                        }}
                      >
                      {/* User Info Header */}
                      <div className="px-4 py-4 bg-gradient-to-r from-teal-50 to-slate-50 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                          {getProfileImage()}
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
                              ? 'bg-teal-100 text-teal-700 border border-teal-200' 
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            {viewMode === 'seller' ? 'Space Owner View' : 'Advertiser View'}
                          </Badge>
                          {isAdmin && (
                            <Badge className="text-xs px-2 py-1 bg-purple-100 text-purple-700 border border-purple-200">
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        {/* ✅ Admin Dashboard Link in Menu */}
                        {isAdmin && (
                          <>
                            <Link
                              to="/admin"
                              onClick={closeUserMenu}
                              className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-200 group"
                            >
                              <Shield className="w-4 h-4 group-hover:text-purple-600 transition-colors" />
                              <div className="flex-1">
                                <div className="font-medium">Admin Dashboard</div>
                                <div className="text-xs text-purple-500">Manage platform</div>
                              </div>
                            </Link>
                            <div className="border-t border-slate-200 my-2" />
                          </>
                        )}
                        
                        <Link
                          to="/profile"
                          onClick={closeUserMenu}
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200 group"
                        >
                          <UserCircle className="w-4 h-4 group-hover:text-teal-600 transition-colors" />
                          <div className="flex-1">
                            <div className="font-medium">Profile Settings</div>
                            <div className="text-xs text-slate-500">Manage your account</div>
                          </div>
                        </Link>
                        
                        <Link
                          to="/settings"
                          onClick={closeUserMenu}
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200 group"
                        >
                          <Settings className="w-4 h-4 group-hover:text-teal-600 transition-colors" />
                          <div className="flex-1">
                            <div className="font-medium">Preferences</div>
                            <div className="text-xs text-slate-500">Notifications & privacy</div>
                          </div>
                        </Link>

                        <Link
                          to="/saved"
                          onClick={closeUserMenu}
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200 group"
                        >
                          <Bookmark className="w-4 h-4 group-hover:text-teal-600 transition-colors" />
                          <div className="flex-1">
                            <div className="font-medium">Saved Spaces</div>
                            <div className="text-xs text-slate-500">Your bookmarked listings</div>
                          </div>
                        </Link>

                        <Link
                          to="/help"
                          onClick={closeUserMenu}
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200 group"
                        >
                          <HelpCircle className="w-4 h-4 group-hover:text-teal-600 transition-colors" />
                          <div className="flex-1">
                            <div className="font-medium">Help & Support</div>
                            <div className="text-xs text-slate-500">Get assistance</div>
                          </div>
                        </Link>

                        <div className="border-t border-slate-200 my-2" />
                        
                        <button 
                          type="button"
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
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
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content Spacer */}
      <div className="h-16" />
    </>
  );
};

export default DesktopTopNavV2;