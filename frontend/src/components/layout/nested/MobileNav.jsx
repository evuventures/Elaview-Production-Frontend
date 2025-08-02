// src/components/layout/MobileNav.jsx
// ✅ UPDATED: Added viewMode support and dynamic label switching
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, MapPin, Mail } from 'lucide-react';
import apiClient from '@/api/apiClient';

const MobileNav = ({ 
  unreadCount, 
  pendingInvoices, 
  actionItemsCount, 
  currentUser,
  viewMode = 'buyer', // Default to advertiser/buyer view
  onViewModeChange // Function to change view mode
}) => {
  const location = useLocation();
  const { isSignedIn } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // ✅ OPTIMIZED: Fetch notification count with rate limit protection
  const fetchNotificationCount = async (force = false) => {
    if (!isSignedIn || isRateLimited) return;
    
    // ✅ OPTIMIZED: Throttle requests - max every 2 minutes unless forced
    const now = Date.now();
    if (!force && lastFetchTime && (now - lastFetchTime) < 120000) {
      console.log('⏳ Mobile nav notification fetch throttled (< 2 minutes since last fetch)');
      return;
    }

    try {
      const response = await apiClient.getNotificationCount();
      if (response.success) {
        setNotificationCount(response.count || 0);
        setLastFetchTime(now);
        setIsRateLimited(false); // Reset rate limit on success
        console.log('✅ Mobile nav notification count fetched:', response.count);
      }
    } catch (error) {
      console.error('❌ Failed to fetch notification count:', error);
      
      // ✅ OPTIMIZED: Handle rate limiting specifically
      if (error.message.includes('429')) {
        console.warn('🚫 Mobile nav rate limited - pausing for 5 minutes');
        setIsRateLimited(true);
        
        // Reset rate limit flag after 5 minutes
        setTimeout(() => {
          setIsRateLimited(false);
          console.log('✅ Mobile nav rate limit reset');
        }, 300000); // 5 minutes
      }
    }
  };

  // ✅ OPTIMIZED: Setup polling with 3-minute intervals
  useEffect(() => {
    if (isSignedIn) {
      // Initial fetch
      fetchNotificationCount(true);
      
      // ✅ OPTIMIZED: Refresh every 3 minutes instead of 1 minute
      const interval = setInterval(() => {
        if (!isRateLimited) {
          fetchNotificationCount();
        }
      }, 180000); // 3 minutes = 180,000ms
      
      return () => clearInterval(interval);
    } else {
      // Reset state when signed out
      setNotificationCount(0);
      setIsRateLimited(false);
      setLastFetchTime(null);
    }
  }, [isSignedIn]);

  // ✅ UPDATED: Dynamic navigation items based on view mode
  const getNavigationItems = (mode) => {
    const totalUnreadCount = (unreadCount || 0) + notificationCount;
    
    if (mode === 'seller') {
      return [
        {
          title: 'Listings', // Changed from Dashboard to Listings for space owner
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
          badge: totalUnreadCount
        }
      ];
    } else {
      return [
        {
          title: 'Bookings', // Changed from Dashboard to Bookings for advertiser
          url: '/advertise',
          icon: LayoutDashboard,
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
          badge: totalUnreadCount
        }
      ];
    }
  };

  const navigationItems = getNavigationItems(viewMode);

  const formatBadgeCount = (count, maxCount = 99) => {
    if (count > maxCount) return `${maxCount}+`;
    return count.toString();
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.title}
              to={item.url}
              className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'text-teal-600 bg-teal-50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.badge > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 py-0 rounded-full min-w-[16px] h-4 flex items-center justify-center">
                    {formatBadgeCount(item.badge, 9)}
                  </Badge>
                )}
                {/* Rate limit indicator for Messages (since it includes notifications) */}
                {isRateLimited && item.title === 'Messages' && (
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                )}
              </div>
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;