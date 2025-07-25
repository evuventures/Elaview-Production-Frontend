// Enhanced Navigation with Role-Specific Items
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, Crown, Sparkles, User, ChevronDown, 
  Bell, Settings, LogOut, Menu, X, Zap, Filter, ArrowRight,
  Megaphone, Home, ToggleLeft, ToggleRight, Building2,
  Calendar, MessageSquare, Map, LayoutDashboard
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import elaviewLogo from '../../../public/elaview-logo.png';

const DesktopTopNavV2 = ({ 
  unreadCount = 0, 
  pendingInvoices = 0, 
  actionItemsCount = 0, 
  currentUser,
  userRole = 'buyer', // 'buyer' | 'seller'
  onRoleChange,
  isUpdatingRole = false,
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

  // 🆕 ROLE-SPECIFIC NAVIGATION ITEMS
  const getNavigationItems = (role) => {
    if (role === 'seller') {
      return [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: LayoutDashboard,
          badge: pendingInvoices || 0
        },
        {
          title: 'Browse',
          url: '/browse',
          icon: Map,
          badge: 0
        },
        {
          title: 'Messages',
          url: '/messages',
          icon: MessageSquare,
          badge: unreadCount || 0
        }
      ];
    } else {
      // Buyer navigation
      return [
        {
          title: 'Bookings',
          url: '/bookings',
          icon: Calendar,
          badge: actionItemsCount || 0
        },
        {
          title: 'Browse',
          url: '/browse',
          icon: Map,
          badge: 0
        },
        {
          title: 'Messages',
          url: '/messages',
          icon: MessageSquare,
          badge: unreadCount || 0
        }
      ];
    }
  };

  const navigationItems = getNavigationItems(userRole);

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

  // 🆕 UPDATED ROLE SWITCH WITH AUTO-REDIRECT
  const handleRoleSwitch = (newRole) => {
    if (isUpdatingRole || !onRoleChange) return;
    
    console.log(`🔄 Switching role from ${userRole} to ${newRole}`);
    
    // Call the role change handler (from Layout.tsx)
    onRoleChange(newRole);
    
    // Auto-redirect based on role
    setTimeout(() => {
      if (newRole === 'seller') {
        console.log('🧭 Redirecting seller to /dashboard');
        navigate('/dashboard');
      } else if (newRole === 'buyer') {
        console.log('🧭 Redirecting buyer to /browse');
        navigate('/browse');
      }
    }, 100); // Small delay to ensure role state updates first
    
    setRoleToggleOpen(false);
  };

  const formatBadgeCount = (count) => {
    if (count > 99) return '99+';
    return count.toString();
  };

  // Get role-specific styling and info
  const getRoleInfo = () => {
    if (userRole === 'seller') {
      return {
        title: 'Space Owner',
        description: 'Manage your listings',
        icon: Home,
        primaryColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        buttonBg: 'bg-emerald-600',
        buttonHover: 'hover:bg-emerald-700',
        quickAction: {
          url: '/list-space',
          text: 'List Property',
          icon: Building2
        }
      };
    } else {
      return {
        title: 'Advertiser',
        description: 'Book ad spaces',
        icon: Megaphone,
        primaryColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        buttonBg: 'bg-blue-600',
        buttonHover: 'hover:bg-blue-700',
        quickAction: {
          url: '/browse',
          text: 'Find Spaces',
          icon: Search
        }
      };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <>
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gray-50 border-b border-gray-200 z-50">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          
          {/* Left Section: Logo + Navigation */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link to={userRole === 'seller' ? '/dashboard' : '/browse'} className="flex items-center gap-2 group">
              <img 
                src={elaviewLogo}
                alt="Elaview Logo" 
                className="w-20 h-20 object-contain"
              />
            </Link>

            {/* 🆕 ROLE-SPECIFIC NAVIGATION */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-slate-800 bg-slate-100 border border-slate-200'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden xl:inline">{item.title}</span>
                    {item.badge > 0 && (
                      <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[16px] h-4 flex items-center justify-center">
                        {formatBadgeCount(item.badge)}
                      </Badge>
                    )}
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-slate-800 rounded-full"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center Section: Search (Optional - can be removed if not needed) */}
          <div className="flex-1 max-w-md mx-4 lg:mx-8">
            <div className="relative group">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                searchFocused ? 'text-slate-600' : 'text-slate-400'
              }`} />
              <Input
                type="search"
                placeholder={userRole === 'seller' ? "Search properties, bookings..." : "Search ad spaces, campaigns..."}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-gray-300 text-slate-800 placeholder-slate-400 transition-all duration-200 ${
                  searchFocused 
                    ? 'border-slate-400 ring-2 ring-slate-200' 
                    : 'hover:border-slate-400 focus:border-slate-400'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>

          {/* Right Section: Role Toggle + Actions + User */}
          <div className="flex items-center gap-2">
            
            {/* 🆕 ENHANCED ROLE TOGGLE WITH LOADING STATE */}
            {canSwitchRoles && (
              <div className="relative hidden md:block" ref={roleToggleRef}>
                <Button
                  onClick={() => !isUpdatingRole && setRoleToggleOpen(!roleToggleOpen)}
                  disabled={isUpdatingRole}
                  size="sm"
                  variant="ghost"
                  className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    isUpdatingRole
                      ? 'opacity-50 cursor-not-allowed'
                      : roleToggleOpen 
                        ? `${roleInfo.bgColor} ${roleInfo.primaryColor} border border-gray-200` 
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {isUpdatingRole && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                  <div className="flex items-center gap-2">
                    <roleInfo.icon className="w-4 h-4" />
                    <div className="text-left">
                      <div className="text-sm font-semibold">
                        {isUpdatingRole ? 'Switching...' : roleInfo.title}
                      </div>
                      <div className="text-xs opacity-75">{roleInfo.description}</div>
                    </div>
                  </div>
                  {!isUpdatingRole && (
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${roleToggleOpen ? 'rotate-180' : ''}`} />
                  )}
                </Button>

                {/* Role Toggle Dropdown */}
                <AnimatePresence>
                  {roleToggleOpen && !isUpdatingRole && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
                    >
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-semibold text-sm text-slate-800">Switch Role</h3>
                        <p className="text-xs text-slate-600">Choose your primary activity</p>
                      </div>
                      
                      {/* Role Options */}
                      <div className="p-3 space-y-2">
                        {/* Advertiser/Buyer Option */}
                        <motion.button
                          onClick={() => handleRoleSwitch('buyer')}
                          className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${
                            userRole === 'buyer'
                              ? 'bg-blue-50 border-2 border-blue-200'
                              : 'hover:bg-gray-50 border-2 border-transparent'
                          }`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className={`p-3 rounded-lg ${
                            userRole === 'buyer' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-slate-600'
                          }`}>
                            <Megaphone className="w-5 h-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-slate-800 flex items-center gap-2">
                              Advertiser
                              {userRole === 'buyer' && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                              )}
                            </div>
                            <div className="text-sm text-slate-600">Find and book ad spaces</div>
                            <div className="text-xs text-slate-500 mt-1">
                              Browse spaces • {bookingsCount} active campaigns
                            </div>
                          </div>
                          {userRole === 'buyer' && (
                            <div className="text-blue-600">
                              <ToggleRight className="w-5 h-5" />
                            </div>
                          )}
                        </motion.button>

                        {/* Property Owner/Seller Option */}
                        <motion.button
                          onClick={() => handleRoleSwitch('seller')}
                          className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${
                            userRole === 'seller'
                              ? 'bg-emerald-50 border-2 border-emerald-200'
                              : 'hover:bg-gray-50 border-2 border-transparent'
                          }`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className={`p-3 rounded-lg ${
                            userRole === 'seller' 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-gray-100 text-slate-600'
                          }`}>
                            <Home className="w-5 h-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-slate-800 flex items-center gap-2">
                              Property Owner
                              {userRole === 'seller' && (
                                <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                              )}
                            </div>
                            <div className="text-sm text-slate-600">List and manage properties</div>
                            <div className="text-xs text-slate-500 mt-1">
                              Dashboard • {propertiesCount} active properties
                            </div>
                          </div>
                          {userRole === 'seller' && (
                            <div className="text-emerald-600">
                              <ToggleRight className="w-5 h-5" />
                            </div>
                          )}
                        </motion.button>
                      </div>

                      {/* Quick Action for Current Role */}
                      <div className="p-3 border-t border-gray-200 bg-gray-50">
                        <Link
                          to={roleInfo.quickAction.url}
                          onClick={() => setRoleToggleOpen(false)}
                          className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 text-white ${roleInfo.buttonBg} ${roleInfo.buttonHover}`}
                        >
                          <roleInfo.quickAction.icon className="w-4 h-4" />
                          {roleInfo.quickAction.text}
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
              className="relative w-10 h-10 p-0 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all duration-200"
            >
              <Bell className="w-4 h-4" />
              {(unreadCount > 0 || pendingInvoices > 0) && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Button>

            {/* User Menu */}
            {currentUser && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-50 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg flex items-center justify-center ring-2 ring-white group-hover:ring-slate-200 transition-all duration-200">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="font-medium text-xs text-slate-800 truncate max-w-24 group-hover:text-slate-600 transition-colors">
                      {currentUser.firstName}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {userRole === 'seller' ? 'Space Owner' : 'Advertiser'}
                    </p>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-all duration-200 ${userMenuOpen ? 'rotate-180 text-slate-600' : 'group-hover:text-slate-600'}`} />
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
                    >
                      <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
                        <p className="font-semibold text-sm text-slate-800">
                          {currentUser.firstName} {currentUser.lastName}
                        </p>
                        <p className="text-xs text-slate-600 truncate mt-1">
                          {currentUser.emailAddresses?.[0]?.emailAddress}
                        </p>
                        <Badge className={`text-xs mt-2 text-white ${
                          userRole === 'seller' 
                            ? 'bg-emerald-600' 
                            : 'bg-blue-600'
                        }`}>
                          {userRole === 'seller' ? 'Space Owner' : 'Advertiser'}
                        </Badge>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200 group"
                        >
                          <User className="w-4 h-4 group-hover:text-slate-700 transition-colors" />
                          Profile Settings
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200 group"
                        >
                          <Settings className="w-4 h-4 group-hover:text-slate-700 transition-colors" />
                          Preferences
                        </Link>
                        <div className="border-t border-gray-200 my-2" />
                        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group">
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
              className="lg:hidden p-2.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all duration-200"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 🆕 LOADING OVERLAY FOR ROLE SWITCHING */}
        {isUpdatingRole && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-40">
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium">Switching roles...</span>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-80 h-full bg-white border-r border-gray-200 shadow-xl p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                {/* Mobile Role Switcher */}
                {canSwitchRoles && !isUpdatingRole && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-slate-600 uppercase tracking-wide">Switch Role</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleRoleSwitch('buyer')}
                        className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          userRole === 'buyer'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                        }`}
                      >
                        <Megaphone className="w-4 h-4 mx-auto mb-1" />
                        Advertiser
                      </button>
                      <button
                        onClick={() => handleRoleSwitch('seller')}
                        className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          userRole === 'seller'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                        }`}
                      >
                        <Home className="w-4 h-4 mx-auto mb-1" />
                        Space Owner
                      </button>
                    </div>
                  </div>
                )}

                {/* Navigation Items */}
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-slate-600 uppercase tracking-wide mb-3">Navigation</h3>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <Link
                        key={item.title}
                        to={item.url}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-slate-100 text-slate-800 border border-slate-200'
                            : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="flex-1 font-medium">{item.title}</span>
                        {item.badge > 0 && (
                          <Badge className="bg-red-500 text-white text-xs">
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
                    to={roleInfo.quickAction.url}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <button className={`w-full rounded-lg py-3 font-medium flex items-center justify-center gap-2 text-sm transition-all duration-200 text-white ${roleInfo.buttonBg} ${roleInfo.buttonHover}`}>
                      <roleInfo.quickAction.icon className="h-4 w-4" />
                      {roleInfo.quickAction.text}
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

export default DesktopTopNavV2;