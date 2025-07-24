// src/components/layout/DesktopTopNavV2.jsx - Seamless Dark Integration
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
      {/* ✅ Seamless Dark Navigation Bar - Same Background as Dashboard */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gray-900 z-50">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          
          {/* Left Section: Logo + Core Navigation */}
          <div className="flex items-center gap-6">
            {/* ✅ Logo - Lime Green Accent to Match Dashboard */}
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-lime-400 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:shadow-xl transition-all duration-200">
                <Crown className="text-gray-900 w-4 h-4 font-bold" />
              </div>
              <h2 className="font-bold text-xl text-white hidden sm:block group-hover:text-lime-400 transition-colors duration-200">
                Elaview
              </h2>
            </Link>

            {/* ✅ Core Navigation - Seamless Dark Styling */}
            <nav className="hidden lg:flex items-center gap-1">
              {dashboardItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'text-lime-400 bg-lime-400/10 shadow-lg shadow-lime-400/20'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden xl:inline">{item.title}</span>
                    {item.badge > 0 && (
                      <Badge className={`${item.badgeColor || 'bg-red-500'} text-white text-xs px-1.5 py-0.5 rounded-full min-w-[16px] h-4 flex items-center justify-center animate-pulse`}>
                        {formatBadgeCount(item.badge)}
                      </Badge>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-lime-400 rounded-full"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ✅ Center Section: Enhanced Dark Search */}
          <div className="flex-1 max-w-lg mx-4 lg:mx-8">
            <div className={`relative group transition-all duration-300 ${
              searchFocused ? 'transform scale-[1.02]' : ''
            }`}>
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-200 ${
                searchFocused ? 'text-lime-400 scale-110' : 'text-gray-400'
              }`} />
              <Input
                type="search"
                placeholder="Search properties, campaigns, areas..."
                className={`w-full pl-10 pr-20 py-3 rounded-xl bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 transition-all duration-300 ${
                  searchFocused 
                    ? 'border-lime-400/50 ring-2 ring-lime-400/20 bg-gray-800/80 shadow-lg shadow-lime-400/10' 
                    : 'hover:bg-gray-800/70 focus:bg-gray-800/80 hover:border-gray-600'
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
                  className="w-7 h-7 p-0 rounded-lg bg-lime-400/20 hover:bg-lime-400/30 border-0 transition-all duration-200 text-lime-400"
                >
                  <Search className="w-3 h-3" />
                </Button>
                <Link
                  to="/search"
                  className="hidden sm:flex items-center gap-1 text-xs text-gray-400 hover:text-lime-400 transition-colors px-2 py-1 rounded-md hover:bg-lime-400/10"
                >
                  <Filter className="w-3 h-3" />
                  <span className="hidden md:inline">Filters</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ✅ Right Section: Dark Theme Actions + User */}
          <div className="flex items-center gap-2">
            
            {/* ✅ Quick Actions Button - Dark Styled */}
            <div className="relative hidden md:block" ref={quickActionsRef}>
              <Button
                onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                size="sm"
                variant="ghost"
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                  quickActionsOpen 
                    ? 'bg-lime-400/10 text-lime-400 shadow-lg shadow-lime-400/20' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span className="hidden lg:inline text-sm font-medium">Quick Actions</span>
                {totalBadges > 0 && (
                  <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-4 animate-pulse">
                    {formatBadgeCount(totalBadges)}
                  </Badge>
                )}
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${quickActionsOpen ? 'rotate-180' : ''}`} />
              </Button>

              {/* ✅ Quick Actions Dropdown - Dark Theme */}
              <AnimatePresence>
                {quickActionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                  >
                    {/* Quick Actions Header */}
                    <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
                      <h3 className="font-semibold text-sm text-white">Quick Actions</h3>
                      <p className="text-xs text-gray-400">Frequently used features</p>
                    </div>
                    
                    {/* Primary Actions */}
                    <div className="p-3">
                      {primaryActions.map((action) => (
                        <Link
                          key={action.title}
                          to={action.url}
                          onClick={() => setQuickActionsOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-700/50 transition-all duration-200 group"
                        >
                          <div className={`p-2.5 rounded-lg transition-all duration-200 ${
                            action.type === 'primary' 
                              ? 'bg-lime-400 text-gray-900 group-hover:bg-lime-300 shadow-lg' 
                              : 'bg-gray-700 text-gray-300 group-hover:bg-lime-400/20 group-hover:text-lime-400'
                          }`}>
                            <action.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-white group-hover:text-lime-400 transition-colors">{action.title}</p>
                            <p className="text-xs text-gray-400">
                              {action.type === 'primary' ? 'Create new campaign' : 'Add property listing'}
                            </p>
                          </div>
                          <ArrowRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-lime-400 transition-all duration-200" />
                        </Link>
                      ))}
                    </div>

                    {/* Workflow Items */}
                    {workflowItems.length > 0 && (
                      <>
                        <div className="px-4 py-2 border-t border-gray-700 bg-gray-800/30">
                          <h4 className="font-medium text-xs text-gray-400 uppercase tracking-wide">Workflow</h4>
                        </div>
                        <div className="p-2 max-h-48 overflow-y-auto">
                          {workflowItems.map((item) => (
                            <Link
                              key={item.title}
                              to={item.url}
                              onClick={() => setQuickActionsOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-700/50 transition-colors group"
                            >
                              <item.icon className="w-4 h-4 text-gray-400 group-hover:text-lime-400 transition-colors" />
                              <span className="flex-1 text-sm text-gray-300 group-hover:text-white transition-colors">{item.title}</span>
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

            {/* ✅ Notifications - Dark Theme */}
            <Button
              size="sm"
              variant="ghost"
              className="relative w-10 h-10 p-0 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
            >
              <Bell className="w-4 h-4" />
              {(unreadCount > 0 || pendingInvoices > 0) && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </Button>

            {/* ✅ Theme Toggle - Hidden for now since we're dark-first */}
            <div className="hidden">
              <ThemeToggle />
            </div>

            {/* ✅ User Menu - Enhanced Dark Theme */}
            {currentUser && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-gray-800/50 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-lime-400 to-cyan-400 rounded-lg flex items-center justify-center ring-2 ring-gray-800 group-hover:ring-lime-400/30 transition-all duration-200">
                    <UserIcon className="w-4 h-4 text-gray-900" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="font-medium text-xs text-white truncate max-w-24 group-hover:text-lime-400 transition-colors">
                      {currentUser.firstName}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {currentUser.publicMetadata?.role || 'Member'}
                    </p>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-gray-400 transition-all duration-200 ${userMenuOpen ? 'rotate-180 text-lime-400' : 'group-hover:text-white'}`} />
                </button>

                {/* ✅ Enhanced User Dropdown - Dark Theme */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                    >
                      <div className="px-4 py-4 border-b border-gray-700 bg-gradient-to-r from-lime-400/5 to-cyan-400/5">
                        <p className="font-semibold text-sm text-white">
                          {currentUser.firstName} {currentUser.lastName}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-1">
                          {currentUser.emailAddresses?.[0]?.emailAddress}
                        </p>
                        {currentUser.publicMetadata?.role === 'admin' && (
                          <Badge className="bg-purple-500 text-white text-xs mt-2">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <div className="p-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 group"
                        >
                          <UserIcon className="w-4 h-4 group-hover:text-lime-400 transition-colors" />
                          Profile Settings
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 group"
                        >
                          <Settings className="w-4 h-4 group-hover:text-lime-400 transition-colors" />
                          Preferences
                        </Link>
                        <div className="border-t border-gray-700 my-2" />
                        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group">
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ✅ Mobile Menu Button - Dark Theme */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ✅ Mobile Menu - Enhanced Dark Theme */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/95 backdrop-blur-xl z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-80 h-full bg-gray-800 border-r border-gray-700 shadow-2xl p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
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
                  <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wide mb-3">Navigation</h3>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <Link
                        key={item.title}
                        to={item.url}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-lime-400/10 text-lime-400 shadow-lg shadow-lime-400/20'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
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
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wide mb-3">Actions</h3>
                  {primaryActions.map((action) => (
                    <Link
                      key={action.title}
                      to={action.url}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <button className={`w-full rounded-xl py-3 font-medium flex items-center justify-center gap-2 text-sm transition-all duration-200 ${
                        action.type === 'primary'
                          ? 'bg-lime-400 text-gray-900 hover:bg-lime-500 shadow-lg'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                      }`}>
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

      {/* ✅ Content Spacer - Adjusted for new height */}
      <div className="h-16" />
    </>
  );
};

export default DesktopTopNavV2;