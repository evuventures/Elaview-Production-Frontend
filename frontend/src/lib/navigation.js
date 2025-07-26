// src/lib/navigation.js
import { 
  Home, Compass, MessageSquare, FileText, User as UserIcon, 
  Search, Target, Plus, Shield 
} from 'lucide-react';

/**
 * Get navigation items based on user role and context
 * @param {Object} options - Configuration options
 * @param {Object} options.currentUser - Current user object
 * @param {number} options.unreadCount - Number of unread messages
 * @param {number} options.pendingInvoices - Number of pending invoices
 * @param {number} options.actionItemsCount - Number of action items
 * @param {boolean} options.isMobile - Whether this is for mobile navigation
 * @returns {Array} Array of navigation items
 */
export const getNavigationItems = ({ 
  currentUser, 
  unreadCount = 0, 
  pendingInvoices = 0, 
  actionItemsCount = 0, 
  isMobile = false 
}) => {
  const baseItems = [
    { 
      title: "Dashboard", 
      url: "/dashboard", 
      icon: Home, 
      badge: actionItemsCount, 
      badgeColor: 'bg-orange-500' 
    },
    // { 
    //   title: isMobile ? "Search" : "Advanced Search", 
    //   url: "/search", 
    //   icon: Search 
    // },
    { 
      title: isMobile ? "Browse" : "Browse Map", 
      url: "/browse", 
      icon: Compass 
    },
    { 
      title: "Messages", 
      url: "/messages", 
      icon: MessageSquare, 
      badge: unreadCount, 
      badgeColor: 'bg-red-500' 
    },
    // { 
    //   title: "Invoices", 
    //   url: "/invoices", 
    //   icon: FileText, 
    //   badge: pendingInvoices, 
    //   badgeColor: 'bg-gradient-brand' 
    // },
  ];

  // Add admin-only items
  const adminItems = currentUser?.publicMetadata?.role === 'admin' ? [
    { 
      title: "Admin Panel", 
      url: "/admin", 
      icon: Shield, 
      badge: 0, 
      badgeColor: 'bg-purple-500' 
    }
  ] : [];

  // Profile items - only show on desktop, not mobile
  const profileItems = !isMobile ? [
    { 
      title: "Profile", 
      url: "/profile", 
      icon: UserIcon 
    },
  ] : [];

  return [...baseItems, ...adminItems, ...profileItems];
};

/**
 * Primary action buttons configuration
 */
export const getPrimaryActions = () => [
  {
    title: "Create Campaign",
    url: "/create-campaign",
    icon: Target,
    type: "primary",
    className: "btn-gradient",
    additionalIcons: ["Sparkles"]
  },
  {
    title: "List Property",
    url: "/list-space",
    icon: Plus,
    type: "secondary",
    className: "glass border border-border text-foreground hover:bg-primary/5"
  }
];

/**
 * Check if a navigation item should show a badge
 * @param {Object} item - Navigation item
 * @returns {boolean} Whether to show badge
 */
export const shouldShowBadge = (item) => {
  return item.badge && item.badge > 0;
};

/**
 * Format badge count for display
 * @param {number} count - Badge count
 * @param {number} maxDisplay - Maximum number to display before showing "+"
 * @returns {string} Formatted badge text
 */
export const formatBadgeCount = (count, maxDisplay = 99) => {
  if (!count || count <= 0) return '';
  return count > maxDisplay ? `${maxDisplay}+` : count.toString();
};