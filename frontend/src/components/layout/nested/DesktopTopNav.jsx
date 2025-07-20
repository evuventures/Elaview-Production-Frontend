// src/components/layout/DesktopTopNav.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, Crown, Sparkles, User as UserIcon, ChevronDown, 
  Bell, Settings, LogOut, Menu, X 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { getNavigationItems, getPrimaryActions, formatBadgeCount } from '@/lib/navigation';

const DesktopTopNav = ({ unreadCount, pendingInvoices, actionItemsCount, currentUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const navigationItems = getNavigationItems({
    currentUser,
    unreadCount,
    pendingInvoices,
    actionItemsCount,
    isMobile: false
  });

  const primaryActions = getPrimaryActions();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
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

  // Split navigation items into primary and secondary
  const primaryNavItems = navigationItems.slice(0, 4);
  const secondaryNavItems = navigationItems.slice(4);

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm z-50">
        <div className="flex items-center justify-between h-full px-6">
          {/* Left: Logo */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center shadow-brand group-hover:scale-105 transition-transform">
                <Crown className="text-white w-4 h-4" />
              </div>
              <h2 className="font-bold text-xl text-gradient-brand hidden sm:block">
                Elaview
              </h2>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {primaryNavItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                    {item.badge > 0 && (
                      <Badge className={`${item.badgeColor || 'bg-red-500'} text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-4 flex items-center justify-center`}>
                        {formatBadgeCount(item.badge)}
                      </Badge>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-brand rounded-full"
                      />
                    )}
                  </Link>
                );
              })}

              {/* More Menu for Secondary Items */}
              {secondaryNavItems.length > 0 && (
                <div className="relative group">
                  <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
                    More
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 mt-1 w-48 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-1">
                      {secondaryNavItems.map((item) => (
                        <Link
                          key={item.title}
                          to={item.url}
                          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="flex-1">{item.title}</span>
                          {item.badge > 0 && (
                            <Badge className={`${item.badgeColor || 'bg-red-500'} text-white text-xs`}>
                              {formatBadgeCount(item.badge)}
                            </Badge>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </nav>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-md mx-6">
            <div className={`relative transition-all duration-200 ${searchFocused ? 'transform scale-[1.02]' : ''}`}>
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                searchFocused ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-10 pr-12 py-2 rounded-lg bg-muted/50 border-border focus:border-primary focus:ring-primary/20 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <Button
                onClick={handleSearch}
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 p-0 rounded-md bg-primary/10 hover:bg-primary/20 border-0"
              >
                <Search className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Right: Actions & User */}
          <div className="flex items-center gap-3">
            {/* Primary Actions */}
            <div className="hidden md:flex items-center gap-2">
              {primaryActions.map((action) => (
                <Link key={action.title} to={action.url}>
                  <Button
                    size="sm"
                    className={`${action.className} ${
                      action.type === 'primary' 
                        ? 'shadow-brand hover:shadow-brand-lg' 
                        : ''
                    } flex items-center gap-1.5 px-3 py-2 text-xs font-medium`}
                  >
                    <action.icon className="h-3 w-3" />
                    <span className="hidden xl:inline">{action.title}</span>
                    {action.type === 'primary' && <Sparkles className="h-3 w-3" />}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            {currentUser && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="font-medium text-xs text-foreground">
                      {currentUser.firstName}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {currentUser.publicMetadata?.role || 'Member'}
                    </p>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-1 w-48 bg-background border border-border rounded-lg shadow-lg z-50"
                    >
                      <div className="p-1">
                        <div className="px-3 py-2 border-b border-border">
                          <p className="font-medium text-sm text-foreground">
                            {currentUser.firstName} {currentUser.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {currentUser.emailAddresses?.[0]?.emailAddress}
                          </p>
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <UserIcon className="w-4 h-4" />
                          Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-xl z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="w-72 h-full bg-background border-r border-border shadow-xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                {/* Navigation Items */}
                <div className="space-y-2">
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <Link
                        key={item.title}
                        to={item.url}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="flex-1">{item.title}</span>
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
                <div className="pt-4 border-t border-border space-y-2">
                  {primaryActions.map((action) => (
                    <Link
                      key={action.title}
                      to={action.url}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <button className={`w-full ${action.className} rounded-lg py-2 font-medium flex items-center justify-center gap-2 text-sm`}>
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
      <div className="h-16" />
    </>
  );
};

export default DesktopTopNav;