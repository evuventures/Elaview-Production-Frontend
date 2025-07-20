// src/components/layout/DesktopSidebarV2.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Crown, Sparkles, User as UserIcon, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { motion } from 'framer-motion';
import { getNavigationItems, getPrimaryActions, formatBadgeCount } from '@/lib/navigation';

const DesktopSidebarV2 = ({ unreadCount, pendingInvoices, actionItemsCount, currentUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const navigationItems = getNavigationItems({
    currentUser,
    unreadCount,
    pendingInvoices,
    actionItemsCount,
    isMobile: false
  });

  const primaryActions = getPrimaryActions();

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    } else {
      navigate("/search");
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-72 h-screen fixed left-0 top-0 glass-strong border-r border-border shadow-xl z-20">
      {/* Header Section - Simplified */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center shadow-brand-lg group-hover:scale-105 transition-transform">
              <Crown className="text-white w-5 h-5" />
            </div>
            <h2 className="font-bold text-2xl text-gradient-brand">
              Elaview
            </h2>
          </Link>
          <ThemeToggle />
        </div>
      </div>
      
      {/* Enhanced Search Section */}
      <div className="p-4 border-b border-border/50">
        <div className="space-y-3">
          <div className={`relative transition-all duration-200 ${searchFocused ? 'transform scale-[1.02]' : ''}`}>
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
              searchFocused ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <Input
              type="search"
              placeholder="Search properties, campaigns, areas..."
              className="w-full pl-10 pr-12 py-3 rounded-xl bg-input border-border focus:border-primary focus:ring-primary/20 glass transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <Button
              onClick={handleSearch}
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 rounded-lg bg-primary/10 hover:bg-primary/20 border-0 transition-all duration-200"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Quick Search Suggestions */}
          <div className="flex flex-wrap gap-2">
            <button className="text-xs bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary px-2 py-1 rounded-md transition-colors">
              Recent
            </button>
            <button className="text-xs bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary px-2 py-1 rounded-md transition-colors">
              Properties
            </button>
            <Link 
              to="/search"
              className="text-xs text-primary hover:text-primary/80 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
            >
              Advanced <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Section with better spacing */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <motion.div 
                whileHover={{ x: 2 }} 
                key={item.title}
                className="relative"
              >
                <Link 
                  to={item.url} 
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative ${
                    isActive 
                      ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm border border-primary/20' 
                      : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-brand rounded-r-full" />
                  )}
                  
                  <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-brand text-white shadow-brand/50' 
                      : 'bg-muted/80 group-hover:bg-primary/20 text-muted-foreground group-hover:text-primary'
                  }`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium flex-1 text-sm">{item.title}</span>
                  {item.badge > 0 && (
                    <Badge className={`${item.badgeColor || 'bg-red-500'} text-white text-xs px-1.5 py-0.5 rounded-full shadow-sm min-w-[20px] h-5 flex items-center justify-center`}>
                      {formatBadgeCount(item.badge)}
                    </Badge>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>

      {/* Action Buttons Section - Enhanced */}
      <div className="p-4 space-y-2 border-t border-border bg-gradient-to-r from-muted/30 to-muted/10">
        {primaryActions.map((action, index) => (
          <Link key={action.title} to={action.url}>
            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full ${action.className} rounded-xl py-2.5 font-medium transition-all duration-200 ${
                action.type === 'primary' 
                  ? 'shadow-brand-lg hover:shadow-brand-xl' 
                  : 'shadow-sm hover:shadow-md'
              } flex items-center justify-center gap-2 text-sm`}
            >
              <action.icon className="h-4 w-4" /> 
              <span>{action.title}</span>
              {action.type === 'primary' && <Sparkles className="h-3 w-3" />}
            </motion.button>
          </Link>
        ))}
        
        {/* Compact User Profile at Bottom */}
        {currentUser && (
          <div className="mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50">
              <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs text-foreground truncate">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize">
                  {currentUser.publicMetadata?.role || 'Member'}
                </p>
              </div>
              {currentUser.publicMetadata?.role === 'admin' && (
                <Badge className="bg-purple-500 text-white text-[10px] px-1.5 py-0.5 h-4">
                  Admin
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default DesktopSidebarV2;