// src/components/layout/DesktopTopNavV2.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, Crown, Sparkles, User as UserIcon, ChevronDown, 
  Bell, Settings, LogOut, Menu, X, Zap, Filter, ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { getNavigationItems, getPrimaryActions, formatBadgeCount } from '@/lib/navigation';

const DesktopTopNavV2 = ({ unreadCount, pendingInvoices, actionItemsCount, currentUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const userMenuRef = useRef(null);
  const quickActionsRef = useRef(null);

  const navigationItems = getNavigationItems({
    currentUser,
    unreadCount,
    pendingInvoices,
    actionItemsCount,
    isMobile: false
  });

  const primaryActions = getPrimaryActions();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target)) {
        setQuickActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    } else {
      navigate("/search");
    }
  };

  // Separate navigation into primary (always visible) and contextual groups
  const dashboardItems = navigationItems.filter(item => 
    ['Dashboard', 'Browse Map', 'Messages'].includes(item.title)
  );
  const workflowItems = navigationItems.filter(item => 
    !dashboardItems.some(d => d.title === item.title)
  );

  // Calculate total badge count for quick actions
  const totalBadges = navigationItems.reduce((sum, item) => sum + (item.badge || 0), 0);

  return (
    <>
      {/* Top Navigation Bar - Enhanced */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm z-50">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          
          {/* Left Section: Logo + Core Navigation */}
          <div className="flex items-center gap-6">
            {/* Logo - Compact */}
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-7 h-7 bg-gradient-brand rounded-lg flex items-center justify-center shadow-brand group-hover:scale-105 transition-all duration-200">
                <Crown className="text-white w-3.5 h-3.5" />
              </div>
              <h2 className="font-bold text-lg text-gradient-brand hidden sm:block">
                Elaview
              </h2>
            </Link>

            {/* Core Navigation - Always Visible */}
            <nav className="hidden lg:flex items-center">
              {dashboardItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-primary bg-primary/8 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden xl:inline">{item.title}</span>
                    {item.badge > 0 && (
                      <Badge className={`${item.badgeColor || 'bg-red-500'} text-white text-xs px-1.5 py-0.5 rounded-full min-w-[16px] h-4 flex items-center justify-center`}>
                        {formatBadgeCount(item.badge)}
                      </Badge>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center Section: Enhanced Search */}
          <div className="flex-1 max-w-lg mx-4 lg:mx-8">
            <div className={`relative group transition-all duration-300 ${
              searchFocused ? 'transform scale-[1.02] shadow-lg' : ''
            }`}>
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-200 ${
                searchFocused ? 'text-primary scale-110' : 'text-muted-foreground'
              }`} />
              <Input
                type="search"
                placeholder="Search properties, campaigns, areas..."
                className={`w-full pl-10 pr-20 py-2.5 rounded-xl bg-muted/40 border-border/50 transition-all duration-200 ${
                  searchFocused 
                    ? 'border-primary/50 ring-2 ring-primary/10 bg-background' 
                    : 'hover:bg-muted/60 focus:bg-background'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  onClick={handleSearch}
                  size="sm"
                  className="w-6 h-6 p-0 rounded-lg bg-primary/10 hover:bg-primary/20 border-0 transition-all duration-200"
                >
                  <Search className="w-3 h-3" />
                </Button>
                <Link
                  to="/search"
                  className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-primary/5"
                >
                  <Filter className="w-3 h-3" />
                  <span className="hidden md:inline">Filters</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Section: Quick Actions + User */}
          <div className="flex items-center gap-2">
            
            {/* Quick Actions Button - Smart Contextual Menu */}
            <div className="relative hidden md:block" ref={quickActionsRef}>
              <Button
                onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                size="sm"
                variant="ghost"
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  quickActionsOpen ? 'bg-primary/10 text-primary' : 'hover:bg-muted/80'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span className="hidden lg:inline text-sm font-medium">Quick Actions</span>
                {totalBadges > 0 && (
                  <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-4">
                    {formatBadgeCount(totalBadges)}
                  </Badge>
                )}
                <ChevronDown className={`w-3 h-3 transition-transform ${quickActionsOpen ? 'rotate-180' : ''}`} />
              </Button>

              {/* Quick Actions Dropdown */}
              <AnimatePresence>
                {quickActionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-72 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    {/* Quick Actions Header */}
                    <div className="px-4 py-3 border-b border-border bg-muted/30">
                      <h3 className="font-semibold text-sm text-foreground">Quick Actions</h3>
                      <p className="text-xs text-muted-foreground">Frequently used features</p>
                    </div>
                    
                    {/* Primary Actions */}
                    <div className="p-2">
                      {primaryActions.map((action) => (
                        <Link
                          key={action.title}
                          to={action.url}
                          onClick={() => setQuickActionsOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/80 transition-colors group"
                        >
                          <div className={`p-2 rounded-lg ${action.type === 'primary' ? 'bg-gradient-brand text-white' : 'bg-muted group-hover:bg-primary/20'}`}>
                            <action.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-foreground">{action.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {action.type === 'primary' ? 'Create new campaign' : 'Add property listing'}
                            </p>
                          </div>
                          <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>

                    {/* Workflow Items */}
                    {workflowItems.length > 0 && (
                      <>
                        <div className="px-4 py-2 border-t border-border bg-muted/20">
                          <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Workflow</h4>
                        </div>
                        <div className="p-2 max-h-48 overflow-y-auto">
                          {workflowItems.map((item) => (
                            <Link
                              key={item.title}
                              to={item.url}
                              onClick={() => setQuickActionsOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/80 transition-colors group"
                            >
                              <item.icon className="w-4 h-4 text-muted-foreground" />
                              <span className="flex-1 text-sm text-foreground">{item.title}</span>
                              {item.badge > 0 && (
                                <Badge className={`${item.badgeColor || 'bg-red-500'} text-white text-xs px-1.5 py-0.5 rounded-full`}>
                                  {formatBadgeCount(item.badge)}
                                </Badge>
                              )}
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <Button
              size="sm"
              variant="ghost"
              className="relative w-9 h-9 p-0 rounded-lg hover:bg-muted/80"
            >
              <Bell className="w-4 h-4" />
              {(unreadCount > 0 || pendingInvoices > 0) && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu - Enhanced */}
            {currentUser && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/80 transition-all duration-200 group"
                >
                  <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center ring-2 ring-background group-hover:ring-primary/20 transition-all">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="font-medium text-xs text-foreground truncate max-w-24">
                      {currentUser.firstName}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {currentUser.publicMetadata?.role || 'Member'}
                    </p>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Enhanced User Dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
                        <p className="font-semibold text-sm text-foreground">
                          {currentUser.firstName} {currentUser.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {currentUser.emailAddresses?.[0]?.emailAddress}
                        </p>
                        {currentUser.publicMetadata?.role === 'admin' && (
                          <Badge className="bg-purple-500 text-white text-xs mt-1">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <div className="p-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                        >
                          <UserIcon className="w-4 h-4" />
                          Profile Settings
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Preferences
                        </Link>
                        <div className="border-t border-border my-2" />
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted/80 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Enhanced */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-xl z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="w-80 h-full bg-background border-r border-border shadow-xl p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                        setMobileMenuOpen(false);
                      }
                    }}
                  />
                </div>

                {/* Navigation Items */}
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Navigation</h3>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <Link
                        key={item.title}
                        to={item.url}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="flex-1 font-medium">{item.title}</span>
                        {item.badge > 0 && (
                          <Badge className={`${item.badgeColor || 'bg-red-500'} text-white text-xs`}>
                            {formatBadgeCount(item.badge)}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Primary Actions */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Actions</h3>
                  {primaryActions.map((action) => (
                    <Link
                      key={action.title}
                      to={action.url}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <button className={`w-full ${action.className} rounded-xl py-3 font-medium flex items-center justify-center gap-2 text-sm transition-all`}>
                        <action.icon className="h-4 w-4" />
                        {action.title}
                        {action.type === 'primary' && <Sparkles className="h-3 w-3" />}
                      </button>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Spacer */}
      <div className="h-14" />
    </>
  );
};

export default DesktopTopNavV2;