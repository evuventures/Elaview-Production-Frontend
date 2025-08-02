// src/components/layout/MobileTopBar.jsx
// ✅ UPDATED: Added simplified profile dropdown with role switching
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { 
  Bell, UserCircle, ChevronDown, Settings, LogOut, 
  Shield, HelpCircle, Building2, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import apiClient from '@/api/apiClient';
import elaviewLogo from '../../../public/elaview-logo.png';

const MobileTopBar = ({ 
  currentUser,
  viewMode = 'buyer', // Default to advertiser/buyer view
  onViewModeChange, // Function to change view mode
  isAdmin = false // Admin flag
}) => {
  const navigate = useNavigate();
  const { isSignedIn, signOut } = useAuth();
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const notificationMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  // ✅ OPTIMIZED: Fetch notifications with rate limit protection
  const fetchNotifications = async (force = false) => {
    if (!isSignedIn || isRateLimited) return;
    
    // ✅ OPTIMIZED: Throttle requests - max every 2 minutes unless forced
    const now = Date.now();
    if (!force && lastFetchTime && (now - lastFetchTime) < 120000) {
      console.log('⏳ Mobile notification fetch throttled (< 2 minutes since last fetch)');
      return;
    }
    
    try {
      setIsLoadingNotifications(true);
      const response = await apiClient.getUnreadNotifications();
      
      if (response.success) {
        setNotifications(response.notifications || []);
        setNotificationCount(response.count || 0);
        setLastFetchTime(now);
        setIsRateLimited(false); // Reset rate limit on success
        console.log('✅ Mobile notifications fetched:', response.count);
      }
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
      
      // ✅ OPTIMIZED: Handle rate limiting specifically
      if (error.message.includes('429')) {
        console.warn('🚫 Mobile notifications rate limited - pausing for 5 minutes');
        setIsRateLimited(true);
        
        // Reset rate limit flag after 5 minutes
        setTimeout(() => {
          setIsRateLimited(false);
          console.log('✅ Mobile rate limit reset');
        }, 300000); // 5 minutes
      }
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    try {
      const result = await apiClient.handleNotificationClick(notification);
      
      if (result.success) {
        // Update local state immediately
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        setNotificationCount(prev => Math.max(0, prev - 1));
        setNotificationMenuOpen(false);
        navigate(result.actionUrl);
      }
    } catch (error) {
      console.error('❌ Failed to handle notification click:', error);
      
      // Still close menu and navigate even if marking as read fails
      setNotificationMenuOpen(false);
      navigate('/messages'); // Fallback navigation
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
      setNotifications([]);
      setNotificationCount(0);
      setNotificationMenuOpen(false);
    } catch (error) {
      console.error('❌ Failed to mark all as read:', error);
      
      // Update local state even if API call fails
      setNotifications([]);
      setNotificationCount(0);
      setNotificationMenuOpen(false);
    }
  };

  // ✅ NEW: Handle view mode switching
  const handleViewSwitch = (newMode) => {
    if (!onViewModeChange || viewMode === newMode) return;
    
    console.log(`🔄 Mobile: Switching view from ${viewMode} to ${newMode}`);
    onViewModeChange(newMode);
    setProfileMenuOpen(false); // Close menu after switching
  };

  // ✅ NEW: Handle sign out
  const handleSignOut = async () => {
    try {
      console.log('🚪 Mobile: Signing out user...');
      setProfileMenuOpen(false);
      
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

  // ✅ NEW: Profile image with fallback
  const getProfileImage = () => {
    if (currentUser?.imageUrl) {
      return (
        <img 
          src={currentUser.imageUrl} 
          alt="Profile"
          className="w-6 h-6 rounded-full object-cover"
        />
      );
    }
    
    return (
      <div className="w-6 h-6 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
        <UserCircle className="w-4 h-4 text-white" />
      </div>
    );
  };

  // Outside click detection for both menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
        setNotificationMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    if (notificationMenuOpen || profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [notificationMenuOpen, profileMenuOpen]);

  // ✅ OPTIMIZED: Fetch notifications on mount with 3-minute intervals
  useEffect(() => {
    if (isSignedIn) {
      // Initial fetch
      fetchNotifications(true);
      
      // ✅ OPTIMIZED: Refresh every 3 minutes instead of 1 minute
      const interval = setInterval(() => {
        if (!isRateLimited) {
          fetchNotifications();
        }
      }, 180000); // 3 minutes = 180,000ms
      
      return () => clearInterval(interval);
    } else {
      // Reset state when signed out
      setNotifications([]);
      setNotificationCount(0);
      setIsRateLimited(false);
      setLastFetchTime(null);
    }
  }, [isSignedIn]);

  // ✅ OPTIMIZED: Toggle with on-demand fetching
  const toggleNotificationMenu = () => {
    const wasOpen = notificationMenuOpen;
    setNotificationMenuOpen(prev => !prev);
    setProfileMenuOpen(false); // Close profile menu
    
    // Only fetch when opening and not rate limited
    if (!wasOpen && !isRateLimited) {
      fetchNotifications(true);
    }
  };

  // ✅ NEW: Toggle profile menu
  const toggleProfileMenu = () => {
    setProfileMenuOpen(prev => !prev);
    setNotificationMenuOpen(false); // Close notification menu
  };

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 border-b border-slate-200/60 z-30 shadow-sm backdrop-blur-sm" style={{ backgroundColor: '#f7f5e6' }}>
      <div className="flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to={viewMode === 'seller' ? '/dashboard' : '/browse'} className="flex items-center gap-2 group">
          <img 
            src={elaviewLogo}
            alt="Elaview Logo" 
            className="w-24 h-24 object-contain"
          />
        </Link>

        {/* Right Section: Notifications + Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications - Only show for authenticated users */}
          {isSignedIn && (
            <div className="relative" ref={notificationMenuRef}>
              <button
                onClick={toggleNotificationMenu}
                disabled={isRateLimited}
                className={`relative p-2 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-white/60 transition-all duration-200 ${
                  isRateLimited ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </div>
                )}
                {/* Rate limit indicator */}
                {isRateLimited && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
                )}
              </button>

              {/* Mobile Notification Dropdown */}
              <AnimatePresence>
                {notificationMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-[999998]" onClick={() => setNotificationMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-[999999]"
                      style={{ maxHeight: '40vh' }}
                    >
                      {/* Header */}
                      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-slate-50">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-slate-900">Notifications</h3>
                          {notificationCount > 0 && (
                            <button
                              onClick={handleMarkAllAsRead}
                              className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        {notificationCount > 0 && (
                          <p className="text-xs text-slate-600 mt-1">
                            {notificationCount} unread notification{notificationCount !== 1 ? 's' : ''}
                          </p>
                        )}
                        {/* Rate limit warning */}
                        {isRateLimited && (
                          <p className="text-xs text-orange-600 mt-1 font-medium">
                            ⏳ Updates paused due to rate limits
                          </p>
                        )}
                      </div>
                      
                      {/* Notifications List */}
                      <div className="max-h-60 overflow-y-auto">
                        {isLoadingNotifications ? (
                          <div className="p-6 text-center">
                            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm text-slate-500">Loading notifications...</p>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-500">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="font-medium">All caught up!</p>
                            <p className="text-xs mt-1">No new notifications</p>
                          </div>
                        ) : (
                          notifications.map(notification => (
                            <div
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Bell className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900 line-clamp-2">
                                    {notification.subject || notification.title || 'Notification'}
                                  </p>
                                  <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                                    {notification.content || notification.message || 'You have a new notification'}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-2">
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      {/* Footer */}
                      <div className="p-3 border-t border-slate-200 bg-slate-50">
                        <Link
                          to="/messages"
                          onClick={() => setNotificationMenuOpen(false)}
                          className="block text-center text-sm text-teal-600 hover:text-teal-700 font-medium"
                        >
                          View all messages
                        </Link>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ✅ NEW: Profile Menu */}
          {isSignedIn && currentUser && (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={toggleProfileMenu}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/60 transition-all duration-200"
              >
                {getProfileImage()}
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-all duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* ✅ NEW: Simplified Profile Dropdown (Max 40% height) */}
              <AnimatePresence>
                {profileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-[999998]" onClick={() => setProfileMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-12 w-64 max-w-[calc(100vw-1rem)] bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-[999999]"
                      style={{ maxHeight: '40vh' }}
                    >
                      {/* User Info Header */}
                      <div className="px-3 py-3 bg-gradient-to-r from-teal-50 to-slate-50 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          {getProfileImage()}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-slate-800 truncate">
                              {currentUser.firstName} {currentUser.lastName}
                            </p>
                            <p className="text-xs text-slate-600 truncate">
                              {currentUser.emailAddresses?.[0]?.emailAddress}
                            </p>
                          </div>
                        </div>
                        
                        {/* ✅ NEW: Current View + Switch Button */}
                        <div className="mt-3 flex gap-2 items-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                            viewMode === 'seller' 
                              ? 'bg-teal-100 text-teal-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {viewMode === 'seller' ? (
                              <><Building2 className="w-3 h-3" />Space Owner View</>
                            ) : (
                              <><MapPin className="w-3 h-3" />Advertiser View</>
                            )}
                          </span>
                          <button
                            onClick={() => handleViewSwitch(viewMode === 'buyer' ? 'seller' : 'buyer')}
                            className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-all duration-200"
                          >
                            Switch
                          </button>
                        </div>
                      </div>

                      {/* ✅ NEW: Minimal Menu Items */}
                      <div className="p-1 max-h-48 overflow-y-auto">
                        {/* Admin Dashboard - Only if admin */}
                        {isAdmin && (
                          <>
                            <Link
                              to="/admin"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-purple-600 hover:bg-purple-50 transition-all"
                            >
                              <Shield className="w-4 h-4" />
                              <span className="font-medium">Admin Dashboard</span>
                            </Link>
                            <div className="border-t border-slate-200 my-1" />
                          </>
                        )}
                        
                        {/* Essential Menu Items */}
                        <Link
                          to="/profile"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-all"
                        >
                          <UserCircle className="w-4 h-4" />
                          <span className="font-medium">Profile Settings</span>
                        </Link>
                        
                        <Link
                          to="/settings"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-all"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="font-medium">Preferences</span>
                        </Link>

                        <Link
                          to="/help"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-all"
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span className="font-medium">Help & Support</span>
                        </Link>

                        <div className="border-t border-slate-200 my-1" />
                        
                        <button 
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileTopBar;