// src/components/layout/MobileLayout.jsx
import React, { useState, useEffect } from 'react';
import { Search, Bot, User, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import GoogleMap from '@/components/browse/maps/GoogleMap';
import MobileBottomSheet from './MobileBottomSheet';
import { getNavigationItems } from '@/lib/navigation';
import { Property } from '@/api/entities';

const MobileLayout = ({ currentUser, unreadCount, pendingInvoices, actionItemsCount }) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 33.7175, lng: -117.8311 });
  const [mapZoom, setMapZoom] = useState(10);

  // Navigation items for bottom nav
  const navigationItems = getNavigationItems({
    currentUser,
    unreadCount,
    pendingInvoices,
    actionItemsCount,
    isMobile: true
  });

  // Load properties data
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setIsLoading(true);
        const data = await Property.list();
        const validProperties = data.filter(property => 
          property.latitude && property.longitude
        );
        setProperties(validProperties);
        
        if (validProperties.length > 0) {
          const firstProperty = validProperties[0];
          setMapCenter({ lat: firstProperty.latitude, lng: firstProperty.longitude });
        }
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, []);

  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
    setMapCenter({ lat: property.latitude, lng: property.longitude });
    setMapZoom(16);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      console.log('Search:', searchTerm);
    }
  };

  const handleAISearch = () => {
    console.log('AI Search activated');
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background overflow-hidden">
      {/* Top Bar - Logo & Profile */}
      <header className="flex items-center justify-between px-4 py-3 bg-background border-b border-border z-50">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ELAVIEW
          </h1>
        </Link>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-10 h-10 rounded-full border border-border"
        >
          <User className="w-5 h-5" />
        </Button>
      </header>

      {/* Fixed Search Bar com AI */}
      <div className="px-4 py-3 bg-background border-b border-border z-40">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 pr-4 h-11 rounded-xl border-border focus:border-primary"
            />
          </div>
          <Button
            onClick={handleAISearch}
            size="sm"
            className="w-11 h-11 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg"
          >
            <Bot className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content Area - Google Map */}
      <div className="flex-1 relative">
        <GoogleMap
          properties={properties}
          onPropertyClick={handlePropertyClick}
          center={mapCenter}
          zoom={mapZoom}
          className="w-full h-full"
          showPropertyMarkers={true}
          advertisingAreas={properties.flatMap(p => p.advertising_areas || [])}
          onAreaClick={handlePropertyClick}
          showAreaMarkers={true}
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading properties...</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sheet - Property Cards */}
      <MobileBottomSheet 
        properties={properties}
        selectedProperty={selectedProperty}
        onPropertySelect={handlePropertyClick}
      />

      {/* Bottom Navigation Bar */}
      <nav className="flex items-center justify-around py-3 px-4 bg-background border-t border-border z-50">
        {navigationItems.slice(0, 3).map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link key={item.title} to={item.url} className="relative flex flex-col items-center py-2 px-3">
              <div className={`relative transition-all duration-200 ${
                isActive ? 'text-primary scale-110' : 'text-muted-foreground hover:text-primary'
              }`}>
                <div className={`p-2 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-primary/10' : ''
                }`}>
                  <item.icon className="w-5 h-5" />
                </div>
                {item.badge > 0 && (
                  <Badge className={`absolute -top-1 -right-1 w-5 h-5 text-xs ${
                    item.badgeColor || 'bg-red-500'
                  } text-white flex items-center justify-center rounded-full border-2 border-background shadow-lg`}>
                    {item.badge > 9 ? '9+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className={`text-xs mt-1 font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileLayout;
