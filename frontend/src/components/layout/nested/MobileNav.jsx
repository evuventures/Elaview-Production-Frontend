// src/components/layout/MobileNav.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { getNavigationItems, formatBadgeCount } from '@/lib/navigation';

const MobileNav = ({ unreadCount, pendingInvoices, actionItemsCount, currentUser }) => {
  const location = useLocation();

  const navigationItems = getNavigationItems({
    currentUser,
    unreadCount,
    pendingInvoices,
    actionItemsCount,
    isMobile: true
  });

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-30 shadow-brand">
      <div className="flex justify-around items-center py-3 px-4">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link key={item.title} to={item.url} className="relative flex flex-col items-center py-2 px-3">
              <div className={`relative transition-brand ${isActive ? 'text-primary scale-110' : 'text-muted-foreground hover:text-primary'}`}>
                <div className={`p-2 rounded-2xl transition-brand ${isActive ? 'bg-primary/10' : ''}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                {item.badge > 0 && (
                  <Badge className={`absolute -top-1 -right-1 w-5 h-5 text-xs ${item.badgeColor || 'bg-red-500'} text-white flex items-center justify-center rounded-full border-2 border-background shadow-lg`}>
                    {formatBadgeCount(item.badge, 9)}
                  </Badge>
                )}
              </div>
              <span className={`text-xs mt-1 font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
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