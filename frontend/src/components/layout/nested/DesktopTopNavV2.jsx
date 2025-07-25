// Enhanced Navigation with Airbnb-Style Role Toggle
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, Crown, Sparkles, User as UserIcon, ChevronDown, 
  Bell, Settings, LogOut, Menu, X, Zap, Filter, ArrowRight,
  Megaphone, Home, ToggleLeft, ToggleRight, Building2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { getNavigationItems, getPrimaryActions, formatBadgeCount } from '@/lib/navigation';

const DesktopTopNavWithRoleToggle = ({ 
  unreadCount, 
  pendingInvoices, 
  actionItemsCount, 
  currentUser,
  // ✅ NEW: Role management props
  userRole = 'buyer', // 'buyer' | 'seller'
  onRoleChange,
  canSwitchRoles = true,
  bookingsCount = 0,
  propertiesCount = 0
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleToggleOpen, setRoleToggleOpen] = useState(false);
  const userMenuRef = useRef(null);
  const roleToggleRef = useRef(null);

  // Get role-specific navigation items
  const navigationItems = getNavigationItems({
    currentUser,
    unreadCount,
    pendingInvoices,
    actionItemsCount,
    isMobile: false,
    userRole // Pass current role to get appropriate nav items
  });

  const primaryActions = getPrimaryActions(userRole);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (roleToggleRef.current && !roleToggleRef.current.contains(event.target)) {
        setRoleToggleOpen(false);
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

  const handleRoleSwitch = (newRole) => {
    if (onRoleChange) {
      onRoleChange(newRole);
    }
    setRoleToggleOpen(false);
  };

  // Core navigation items (always visible)
  const coreNavItems = navigationItems.filter(item => 
    ['Dashboard', 'Browse Map', 'Messages'].includes(item.title)
  );

  // Get role-specific title and description
  const getRoleInfo = () => {
    if (userRole === 'seller') {
      return {
        title: 'Property Owner',
        description: 'Manage your listings',
        icon: Home,
        primaryColor: 'text-cyan-400',
        bgColor: 'bg-cyan-400/10'
      };
    } else {
      return {
        title: 'Advertiser',
        description: 'Find ad spaces',
        icon: Megaphone,
        primaryColor: 'text-lime-400',
        bgColor: 'bg-lime-400/10'
      };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <>
      {/* ✅ Enhanced Navigation with Role Toggle */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gray-900 z-50 border-b border-gray-800/50">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          
          {/* Left Section: Logo + Core Navigation */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-lime-400 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:shadow-xl transition-all duration-200">
                <Crown className="text-gray-900 w-4 h-4 font-bold" />
              </div>
              <h2 className="font-bold text-xl text-white hidden sm:block group-hover:text-lime-400 transition-colors duration-200">
                Elaview
              </h2>
            </Link>

            {/* Core Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {coreNavItems.map((item) => {
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

          {/* Center Section: Enhanced Search */}
          <div className="flex-1 max-w-lg mx-4 lg:mx-8">
            <div className={`relative group transition-all duration-300 ${
              searchFocused ? 'transform scale-[1.02]' : ''
            }`}>
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-200 ${
                searchFocused ? 'text-lime-400 scale-110' : 'text-gray-400'
              }`} />
              <Input
                type="search"
                placeholder={userRole === 'seller' ? "Search properties, bookings..." : "Search ad spaces, campaigns..."}
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

          {/* ✅ Right Section: Role Toggle + Actions + User */}
          <div className="flex items-center gap-2">
            
            {/* ✅ NEW: Airbnb-Style Role Toggle */}
            {canSwitchRoles && (
              <div className="relative hidden md:block" ref={roleToggleRef}>
                <Button
                  onClick={() => setRoleToggleOpen(!roleToggleOpen)}
                  size="sm"
                  variant="ghost"
                  className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                    roleToggleOpen 
                      ? `${roleInfo.bgColor} ${roleInfo.primaryColor} shadow-lg` 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <roleInfo.icon className="w-4 h-4" />
                    <div className="text-left">
                      <div className="text-sm font-semibold">{roleInfo.title}</div>
                      <div className="text-xs opacity-75">{roleInfo.description}</div>
                    </div>
                  </div>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${roleToggleOpen ? 'rotate-180' : ''}`} />
                </Button>

                {/* Role Toggle Dropdown */}
                <AnimatePresence>
                  {roleToggleOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                    >
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
                        <h3 className="font-semibold text-sm text-white">Switch Role</h3>
                        <p className="text-xs text-gray-400">Choose your primary activity</p>
                      </div>
                      
                      {/* Role Options */}
                      <div className="p-3 space-y-2">
                        {/* Advertiser/Buyer Option */}
                        <motion.button
                          onClick={() => handleRoleSwitch('buyer')}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                            userRole === 'buyer'
                              ? 'bg-lime-400/20 border-2 border-lime-400/50 shadow-lg'
                              : 'hover:bg-gray-700/30 border-2 border-transparent'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={`p-3 rounded-xl ${
                            userRole === 'buyer' 
                              ? 'bg-lime-400 text-gray-900' 
                              : 'bg-gray-700 text-gray-300'
                          }`}>
                            <Megaphone className="w-5 h-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-white flex items-center gap-2">
                              Advertiser
                              {userRole === 'buyer' && (
                                <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
                              )}
                            </div>
                            <div className="text-sm text-gray-400">Find and book ad spaces</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {bookingsCount} active campaigns
                            </div>
                          </div>
                          {userRole === 'buyer' && (
                            <div className="text-lime-400">
                              <ToggleRight className="w-5 h-5" />
                            </div>
                          )}
                        </motion.button>

                        {/* Property Owner/Seller Option */}
                        <motion.button
                          onClick={() => handleRoleSwitch('seller')}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                            userRole === 'seller'
                              ? 'bg-cyan-400/20 border-2 border-cyan-400/50 shadow-lg'
                              : 'hover:bg-gray-700/30 border-2 border-transparent'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={`p-3 rounded-xl ${
                            userRole === 'seller' 
                              ? 'bg-cyan-400 text-gray-900' 
                              : 'bg-gray-700 text-gray-300'
                          }`}>
                            <Home className="w-5 h-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-white flex items-center gap-2">
                              Property Owner
                              {userRole === 'seller' && (
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                              )}
                            </div>
                            <div className="text-sm text-gray-400">List and manage properties</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {propertiesCount} active properties
                            </div>
                          </div>
                          {userRole === 'seller' && (
                            <div className="text-cyan-400">
                              <ToggleRight className="w-5 h-5" />
                            </div>
                          )}
                        </motion.button>
                      </div>

                      {/* Quick Action for Current Role */}
                      <div className="p-3 border-t border-gray-700 bg-gray-800/30">
                        <Link
                          to={userRole === 'buyer' ? '/map' : '/create-property'}
                          onClick={() => setRoleToggleOpen(false)}
                          className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                            userRole === 'buyer'
                              ? 'bg-lime-400 text-gray-900 hover:bg-lime-500 shadow-lg'
                              : 'bg-cyan-400 text-gray-900 hover:bg-cyan-500 shadow-lg'
                          }`}
                        >
                          {userRole === 'buyer' ? (
                            <>
                              <Search className="w-4 h-4" />
                              Find Ad Spaces
                            </>
                          ) : (
                            <>
                              <Building2 className="w-4 h-4" />
                              List Property
                            </>
                          )}
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Notifications */}
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

            {/* User Menu */}
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
                      {userRole === 'seller' ? 'Property Owner' : 'Advertiser'}
                    </p>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-gray-400 transition-all duration-200 ${userMenuOpen ? 'rotate-180 text-lime-400' : 'group-hover:text-white'}`} />
                </button>

                {/* User Dropdown (same as before) */}
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
                        <Badge className={`text-xs mt-2 ${
                          userRole === 'seller' 
                            ? 'bg-cyan-400 text-gray-900' 
                            : 'bg-lime-400 text-gray-900'
                        }`}>
                          {userRole === 'seller' ? 'Property Owner' : 'Advertiser'}
                        </Badge>
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu (enhanced with role switching) */}
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
                {/* Role Switcher for Mobile */}
                {canSwitchRoles && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wide">Switch Role</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleRoleSwitch('buyer')}
                        className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          userRole === 'buyer'
                            ? 'bg-lime-400 text-gray-900 shadow-lg'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <Megaphone className="w-4 h-4 mx-auto mb-1" />
                        Advertiser
                      </button>
                      <button
                        onClick={() => handleRoleSwitch('seller')}
                        className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          userRole === 'seller'
                            ? 'bg-cyan-400 text-gray-900 shadow-lg'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <Home className="w-4 h-4 mx-auto mb-1" />
                        Owner
                      </button>
                    </div>
                  </div>
                )}

                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder={userRole === 'seller' ? "Search properties..." : "Search ad spaces..."}
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

                {/* Primary Action */}
                <div className="space-y-3">
                  <Link
                    to={userRole === 'buyer' ? '/map' : '/create-property'}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <button className={`w-full rounded-xl py-3 font-medium flex items-center justify-center gap-2 text-sm transition-all duration-200 ${
                      userRole === 'buyer'
                        ? 'bg-lime-400 text-gray-900 hover:bg-lime-500 shadow-lg'
                        : 'bg-cyan-400 text-gray-900 hover:bg-cyan-500 shadow-lg'
                    }`}>
                      {userRole === 'buyer' ? (
                        <>
                          <Search className="h-4 w-4" />
                          Find Ad Spaces
                        </>
                      ) : (
                        <>
                          <Building2 className="h-4 w-4" />
                          List Property
                        </>
                      )}
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Spacer */}
      <div className="h-16" />
    </>
  );
};

export default DesktopTopNavWithRoleToggle;