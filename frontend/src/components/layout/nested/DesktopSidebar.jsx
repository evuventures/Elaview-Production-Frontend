// src/components/layout/DesktopSidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Target, Plus, Crown, Sparkles, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { motion } from 'framer-motion';
import { getNavigationItems, getPrimaryActions, formatBadgeCount } from '@/lib/navigation';

const DesktopSidebar = ({ unreadCount, pendingInvoices, actionItemsCount, currentUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

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
      {/* Header Section */}
      <div className="p-6 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between mb-4">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-brand-lg group-hover:scale-105 transition-transform">
              <Crown className="text-white font-bold text-lg w-6 h-6" />
            </div>
            <h2 className="font-bold text-3xl text-gradient-brand">
              Elaview
            </h2>
          </Link>
          <ThemeToggle />
        </div>
        
        {/* User Profile Section */}
        {currentUser && (
          <div className="glass rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {currentUser.publicMetadata?.role || 'Member'}
                </p>
              </div>
              {currentUser.publicMetadata?.role === 'admin' && (
                <Badge className="bg-purple-500 text-white text-xs">
                  Admin
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Search Section */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search properties, campaigns, areas..."
            className="w-full pl-10 pr-12 py-3 rounded-2xl bg-input border-border focus:border-primary focus:ring-primary glass transition-brand"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            onClick={handleSearch}
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 rounded-xl bg-primary/10 hover:bg-primary/20 border-0"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-2">
          <Link 
            to="/search"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Advanced Search →
          </Link>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <motion.div whileHover={{ x: 4 }} key={item.title}>
              <Link 
                to={item.url} 
                className={`group flex items-center gap-3 px-4 py-3 rounded-2xl transition-brand ${
                  isActive 
                    ? 'bg-primary/10 text-primary shadow-md border border-primary/20' 
                    : 'text-muted-foreground hover:bg-muted hover:text-primary'
                }`}
              >
                <div className={`p-2 rounded-xl transition-brand ${
                  isActive 
                    ? 'bg-gradient-brand text-white shadow-brand' 
                    : 'bg-muted group-hover:bg-primary/20'
                }`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="font-semibold flex-1">{item.title}</span>
                {item.badge > 0 && (
                  <Badge className={`${item.badgeColor || 'bg-red-500'} text-white text-xs px-2 py-1 rounded-full shadow-md`}>
                    {formatBadgeCount(item.badge)}
                  </Badge>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Action Buttons Section */}
      <div className="p-4 space-y-3 border-t border-border bg-muted/50">
        {primaryActions.map((action, index) => (
          <Link key={action.title} to={action.url}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full ${action.className} rounded-2xl py-3 font-bold transition-brand ${
                action.type === 'primary' ? 'hover:-translate-y-0.5' : ''
              } flex items-center justify-center gap-2`}
            >
              <action.icon className="h-5 w-5" /> 
              <span>{action.title}</span>
              {action.type === 'primary' && <Sparkles className="h-4 w-4" />}
            </motion.button>
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default DesktopSidebar;