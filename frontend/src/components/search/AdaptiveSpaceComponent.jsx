import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, MapPin, Star, Shield, Calculator, MessageCircle, 
  TrendingUp, Heart, Share2, Bookmark, Calendar, 
  Building2, Users, Zap, Camera, ArrowLeft, 
  Maximize2, Minimize2, Phone, Clock, Eye,
  CheckCircle, DollarSign
} from 'lucide-react';

const AdaptiveSpaceComponent = ({
  selectedProperty,
  selectedArea,
  viewMode = 'properties',
  businessInsights,
  trustIndicators,
  successStories,
  savedProperties,
  onClose,
  onViewModeChange,
  onBackToProperties,
  onContactOwner,
  onGetQuote,
  onViewSuccessStories,
  onToggleSaved,
  onBooking,
  // Helper functions from MapPage
  getPropertyName,
  getPropertyAddress,
  getPropertyType,
  getAreaName,
  getAreaType,
  getAreaPrice,
  calculateROI,
  loadPropertyAreas,
  isLoadingAreas
}) => {
  const [panelState, setPanelState] = useState('expanded'); // 'peek' | 'expanded' | 'fullscreen'
  const [screenSize, setScreenSize] = useState('desktop');

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-adjust panel state based on screen size and content
  useEffect(() => {
    if (selectedArea || selectedProperty) {
      if (screenSize === 'mobile') {
        setPanelState('peek');
      } else {
        setPanelState('expanded');
      }
    }
  }, [selectedArea, selectedProperty, screenSize]);

  // Don't render if no data
  if (!selectedProperty && !selectedArea) {
    return null;
  }

  const getPanelHeight = () => {
    switch (panelState) {
      case 'peek': return screenSize === 'mobile' ? '35%' : '200px';
      case 'expanded': return screenSize === 'mobile' ? '65%' : '480px';
      case 'fullscreen': return screenSize === 'mobile' ? '90%' : '85vh';
      default: return '200px';
    }
  };

  const getContainerClass = () => {
    const baseClass = "fixed transition-all duration-300 ease-out z-40";
    
    switch (screenSize) {
      case 'mobile':
        return `${baseClass} bottom-0 left-0 right-0`;
      case 'tablet':
        return `${baseClass} bottom-4 left-4 right-4 max-w-2xl mx-auto`;
      default:
        return `${baseClass} bottom-4 right-4 w-96 max-w-md`;
    }
  };

  const handlePanelStateChange = (newState) => {
    setPanelState(newState);
  };

  const handleClose = () => {
    setPanelState('peek');
    setTimeout(() => {
      onClose && onClose();
    }, 300);
  };

  const renderPanelHeader = () => {
    const isAreaView = viewMode === 'areas' && selectedArea;
    const displayName = isAreaView 
      ? (getAreaName ? getAreaName(selectedArea) : selectedArea.name || selectedArea.title || 'Advertising Area')
      : (getPropertyName ? getPropertyName(selectedProperty) : selectedProperty.name || selectedProperty.title || 'Property');
    
    const displayLocation = isAreaView
      ? selectedArea.city || selectedProperty?.city || 'Location'
      : (getPropertyAddress ? getPropertyAddress(selectedProperty) : `${selectedProperty.city || 'City'}, ${selectedProperty.state || 'State'}`);

    return (
      <div className="flex items-center justify-between p-4 bg-background border-b cursor-pointer"
           onClick={() => handlePanelStateChange(panelState === 'peek' ? 'expanded' : 'peek')}>
        
        {screenSize === 'mobile' && (
          <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-2" />
        )}
        
        <div className="flex items-center gap-3 flex-1">
          {isAreaView && onBackToProperties && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onBackToProperties();
              }}
              className="p-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm truncate">
              {displayName}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {displayLocation}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {isAreaView && selectedArea && (
              <Badge className="bg-green-100 text-green-800 text-xs">
                {getAreaPrice ? getAreaPrice(selectedArea) : '$0/day'}
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderPropertyContent = () => {
    if (!selectedProperty) return null;

    const propertyName = getPropertyName ? getPropertyName(selectedProperty) : selectedProperty.name || selectedProperty.title;
    const propertyType = getPropertyType ? getPropertyType(selectedProperty) : selectedProperty.type || 'Property';
    const propertyAddress = getPropertyAddress ? getPropertyAddress(selectedProperty) : selectedProperty.address || 'Address not available';
    
    // Use business insights if provided, otherwise create fallback
    const insights = businessInsights || {
      footTraffic: Math.floor(Math.random() * 15000) + 5000,
      avgCampaignLift: Math.floor(Math.random() * 25) + 10,
      rating: 4.2,
      businessesServed: Math.floor(Math.random() * 50) + 20
    };

    const trust = trustIndicators || {
      verified: true,
      rating: insights.rating,
      reviewCount: Math.floor(Math.random() * 50) + 10
    };

    const areasCount = selectedProperty.advertising_areas?.length || 0;

    return (
      <div className="p-4 space-y-4">
        <div className="relative h-40 rounded-lg overflow-hidden">
          <img 
            src={selectedProperty.images?.[0] || selectedProperty.primary_image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'} 
            alt={propertyName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800';
            }}
          />
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            {propertyType}
          </div>
          {trust.verified && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Verified
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{insights.footTraffic?.toLocaleString() || '10,000'}</p>
            <p className="text-xs text-muted-foreground">Daily Foot Traffic</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">+{insights.avgCampaignLift || 15}%</p>
            <p className="text-xs text-muted-foreground">Avg. Campaign Lift</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{propertyAddress}</span>
          </div>
          
          {trust.rating && (
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{trust.rating}</span>
              <span className="text-sm text-muted-foreground">({trust.reviewCount} reviews)</span>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          {selectedProperty.description || 'Premium advertising location with high visibility and foot traffic.'}
        </p>

        <Button 
          className="w-full"
          onClick={() => {
            if (onViewModeChange) onViewModeChange('areas');
            if (loadPropertyAreas) loadPropertyAreas(selectedProperty);
            handlePanelStateChange('expanded');
          }}
          disabled={isLoadingAreas}
        >
          {isLoadingAreas ? (
            <>Loading Spaces...</>
          ) : (
            <>View {areasCount} Advertising Space{areasCount !== 1 ? 's' : ''}</>
          )}
        </Button>

        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onToggleSaved && onToggleSaved(selectedProperty.id)}
          >
            <Heart className={`w-4 h-4 mr-1 ${savedProperties?.has(selectedProperty.id) ? 'fill-red-500 text-red-500' : ''}`} />
            Save
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onContactOwner}
          >
            <Phone className="w-4 h-4 mr-1" />
            Contact
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </div>
    );
  };

  const renderAreaContent = () => {
    if (!selectedArea) return null;

    const areaName = getAreaName ? getAreaName(selectedArea) : selectedArea.name || selectedArea.title || 'Advertising Area';
    const areaType = getAreaType ? getAreaType(selectedArea) : selectedArea.type || 'advertising_area';
    const areaPrice = getAreaPrice ? getAreaPrice(selectedArea) : selectedArea.price || '$0/day';
    
    // Calculate ROI if function provided
    const roiData = calculateROI ? calculateROI(selectedArea) : {
      investment: 1500,
      estimatedReach: 8500,
      estimatedClicks: 180,
      estimatedRevenue: 4500,
      roi: '200'
    };

    // Use success stories if provided
    const stories = successStories || [
      { business: 'Local Restaurant', result: '+25% foot traffic', timeframe: '2 weeks' }
    ];

    return (
      <div className="p-4 space-y-4">
        <div className="relative h-40 rounded-lg overflow-hidden">
          <img 
            src={selectedArea.images || selectedArea.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'} 
            alt={areaName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800';
            }}
          />
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
            {areaType.includes('digital') ? <Zap className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
            {areaType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>
          {selectedArea.available !== false && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Available
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-green-600">{areaPrice}</p>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">{selectedArea.rating || '4.8'}</span>
            <span className="text-sm text-muted-foreground">({selectedArea.reviewCount || 23})</span>
          </div>
        </div>

        {/* ROI Preview */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-sm font-semibold mb-2 flex items-center">
            <Calculator className="w-4 h-4 mr-1" />
            Estimated Monthly ROI
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Reach: </span>
              <span className="font-medium">{roiData.estimatedReach?.toLocaleString() || '8,500'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">ROI: </span>
              <span className="font-bold text-green-600">+{roiData.roi || '200'}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Investment: </span>
              <span className="font-medium">${roiData.investment?.toLocaleString() || '1,500'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Est. Revenue: </span>
              <span className="font-medium">${roiData.estimatedRevenue?.toLocaleString() || '4,500'}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {selectedArea.description || 'High-visibility advertising space with excellent foot traffic and engagement rates.'}
        </p>

        {/* SMB-focused action buttons */}
        <div className="space-y-2">
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            onClick={onGetQuote}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Get Quote & ROI Analysis
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline"
              onClick={onContactOwner}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Talk to Owner
            </Button>
            <Button 
              variant="outline"
              onClick={onViewSuccessStories}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Success Stories
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onToggleSaved && onToggleSaved(selectedArea.id)}
            >
              <Bookmark className={`w-4 h-4 mr-1 ${savedProperties?.has(selectedArea.id) ? 'fill-blue-500 text-blue-500' : ''}`} />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-1" />
              Availability
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
        </div>

        {/* Success story preview */}
        {stories.length > 0 && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
            <h5 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">
              Recent Success
            </h5>
            <p className="text-xs text-green-600 dark:text-green-400">
              {stories[0].business}: {stories[0].result} in {stories[0].timeframe}
            </p>
          </div>
        )}

        {/* Quick booking button */}
        {onBooking && (
          <Button 
            variant="outline" 
            className="w-full border-green-500 text-green-600 hover:bg-green-50"
            onClick={() => onBooking(selectedProperty?.id, selectedArea.id)}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Book This Space
          </Button>
        )}
      </div>
    );
  };

  const renderStateControls = () => {
    if (screenSize === 'mobile') return null;
    
    return (
      <div className="absolute top-2 right-12 flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePanelStateChange(panelState === 'expanded' ? 'peek' : 'expanded')}
          className="w-8 h-8 p-0"
        >
          {panelState === 'expanded' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>
    );
  };

  return (
    <div 
      className={getContainerClass()}
      style={{ height: getPanelHeight() }}
    >
      <Card className="h-full shadow-xl border-0 rounded-t-2xl md:rounded-2xl overflow-hidden bg-background">
        <CardContent className="p-0 h-full flex flex-col">
          {renderPanelHeader()}
          {renderStateControls()}
          
          <div className="flex-1 overflow-auto">
            {viewMode === 'areas' && selectedArea ? renderAreaContent() : renderPropertyContent()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdaptiveSpaceComponent;