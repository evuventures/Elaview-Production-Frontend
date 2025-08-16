// src/components/layout/MobileNav.jsx
// ✅ UPDATED: Added 5-item navigation with advertiser/space owner specific routes
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  MapPin, 
  Mail, 
  Home, 
  Target, 
  Building2, 
  CalendarCheck, 
  Receipt 
} from 'lucide-react';
import apiClient from '@/api/apiClient';

const MobileNav = ({ 
  unreadCount, 
  pendingInvoices, 
  actionItemsCount, 
  currentUser,
  viewMode = 'buyer', // Default to advertiser/buyer view
  onViewModeChange, // Function to change view mode
  campaignCount = 0, // New: Campaign notifications for advertisers
  bookingCount = 0, // New: Booking notifications for space owners
  spaceCount = 0, // New: Space-related notifications
  invoiceCount = 0 // New: Invoice notifications
}) => {
  const location = useLocation();
  const { isSignedIn } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // ✅ COLOR SCHEME: Verification on mount
  useEffect(() => {
    console.log('🎨 MOBILE NAV: Updated 5-item navigation with color scheme verification', {
      primaryBlue: '#4668AB',
      whiteBackground: '#FFFFFF',
      offWhiteCards: '#F9FAFB',
      lightGrayBorders: '#E5E7EB',
      viewMode: viewMode,
      timestamp: new Date().toISOString()
    });
  }, [viewMode]);

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

  // ✅ UPDATED: 5-item navigation based on view mode
  const getNavigationItems = (mode) => {
    const totalUnreadCount = (unreadCount || 0) + notificationCount;
    
    if (mode === 'seller') {
      // Space Owner Navigation (5 items)
      return [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: LayoutDashboard,
          badge: actionItemsCount || 0
        },
        {
          title: 'Spaces',
          url: '/spaces', // Route not created yet
          icon: Building2,
          badge: spaceCount || 0
        },
        {
          title: 'Bookings',
          url: '/bookings', // Route not created yet
          icon: CalendarCheck,
          badge: bookingCount || 0
        },
        {
          title: 'Messages',
          url: '/messages',
          icon: Mail,
          badge: totalUnreadCount
        },
        {
          title: 'Invoices',
          url: '/invoices', // Route not created yet
          icon: Receipt,
          badge: invoiceCount || 0
        }
      ];
    } else {
      // Advertiser Navigation (5 items)
      return [
        {
          title: 'Home',
          url: '/home', // Route not created yet
          icon: Home,
          badge: 0
        },
        {
          title: 'Campaigns',
          url: '/campaigns', // Route not created yet
          icon: Target,
          badge: campaignCount || 0
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
        },
        {
          title: 'Invoices',
          url: '/invoices', // Route not created yet
          icon: Receipt,
          badge: invoiceCount || 0
        }
      ];
    }
  };

  const navigationItems = getNavigationItems(viewMode);

  const formatBadgeCount = (count, maxCount = 99) => {
    if (count > maxCount) return `${maxCount}+`;
    return count.toString();
  };

  // ✅ NEW: Check if route exists (for placeholder routes)
  const isRouteActive = (url) => {
    // For placeholder routes that don't exist yet, only match exact path
    if (['/home', '/campaigns', '/spaces', '/bookings', '/invoices'].includes(url)) {
      return location.pathname === url;
    }
    
    // For existing routes, use standard matching
    return location.pathname === url;
  };

  // ✅ NEW: Handle navigation click for non-existent routes
  const handleNavClick = (e, item) => {
    const placeholderRoutes = ['/home', '/campaigns', '/spaces', '/bookings', '/invoices'];
    
    if (placeholderRoutes.includes(item.url)) {
      e.preventDefault();
      console.log(`🚧 Navigation: ${item.title} route (${item.url}) not implemented yet`);
      
      // Optional: Show a toast notification or alert
      // For now, just log to console
      alert(`${item.title} feature coming soon!`);
    }
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white z-40 md:hidden border-t"
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom)',
        borderColor: '#E5E7EB',
        backgroundColor: '#F8FAFF'
      }}
    >
      {/* ✅ UPDATED: Adjusted spacing for 5 items */}
      <div className="flex items-center justify-around py-2 px-1">
        {navigationItems.map((item) => {
          const isActive = isRouteActive(item.url);
          return (
            <Link
              key={item.title}
              to={item.url}
              onClick={(e) => handleNavClick(e, item)}
              className={`relative flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 min-w-0 flex-1 ${
                isActive
                  ? 'text-slate-700'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="relative">
                <item.icon 
                  className="w-4 h-4 transition-all duration-200" 
                  style={isActive ? { color: '#4668AB' } : {}}
                /> {/* Slightly smaller icon for 5 items */}
                {item.badge > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0 rounded-full min-w-[14px] h-3 flex items-center justify-center text-[10px]">
                    {formatBadgeCount(item.badge, 9)}
                  </Badge>
                )}
                {/* Rate limit indicator for Messages (since it includes notifications) */}
                {isRateLimited && item.title === 'Messages' && (
                  <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                )}
              </div>
              <span className="truncate text-center leading-tight max-w-full">
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;