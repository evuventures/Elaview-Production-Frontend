// src/components/mobile/MobilePropertyCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Eye, Heart, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const MobilePropertyCard = ({ 
  property, 
  isSelected = false, 
  onSelect, 
  variant = 'horizontal' // 'horizontal' for peek, 'vertical' for expanded
}) => {
  // Format price
  const formatPrice = (property) => {
    if (property.advertising_areas && property.advertising_areas.length > 0) {
      const area = property.advertising_areas[0];
      if (area.pricing?.daily_rate) {
        return `$${area.pricing.daily_rate}/day`;
      }
    }
    return 'Contact for pricing';
  };

  // Get property image
  const getPropertyImage = (property) => {
    return property.primary_image || 
           property.images?.[0] || 
           'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&auto=format&fit=crop';
  };

  if (variant === 'horizontal') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ y: -2 }}
        className="flex-shrink-0 w-80"
      >
        <Card 
          className={`cursor-pointer transition-all duration-200 ${
            isSelected 
              ? 'ring-2 ring-primary shadow-lg' 
              : 'hover:shadow-md'
          }`}
          onClick={() => onSelect?.(property)}
        >
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            <img 
              src={getPropertyImage(property)}
              alt={property.name}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay badges */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-primary text-primary-foreground text-xs">
                {property.type?.replace('_', ' ') || 'Property'}
              </Badge>
            </div>
            
            <div className="absolute top-3 right-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 rounded-full bg-background/80 hover:bg-background/90"
              >
                <Heart className="w-4 h-4" />
              </Button>
            </div>

            <div className="absolute bottom-3 right-3">
              <Badge className="bg-background/90 text-foreground font-bold text-xs">
                {formatPrice(property)}
              </Badge>
            </div>
          </div>

          <CardContent className="p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-foreground truncate">
                  {property.name}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {property.city}, {property.state}
                </p>
              </div>
              <div className="flex items-center text-yellow-500">
                <Star className="w-3 h-3 mr-1 fill-current" />
                <span className="text-xs font-medium">4.5</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                <span>Available</span>
              </div>
              <span>{property.advertising_areas?.length || 0} spaces</span>
            </div>

            <Button 
              className="w-full h-8 text-xs" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Book property:', property.id);
              }}
            >
              <Calendar className="w-3 h-3 mr-1" />
              Book Space
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Vertical variant for expanded state
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <Card 
        className={`cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'ring-2 ring-primary shadow-lg' 
            : 'hover:shadow-md'
        }`}
        onClick={() => onSelect?.(property)}
      >
        <div className="flex gap-4 p-4">
          {/* Image */}
          <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
            <img 
              src={getPropertyImage(property)}
              alt={property.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-1 right-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-6 h-6 rounded-full bg-background/80 hover:bg-background/90 p-0"
              >
                <Heart className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-foreground truncate">
                  {property.name}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {property.city}, {property.state}
                </p>
              </div>
              <div className="flex items-center text-yellow-500">
                <Star className="w-3 h-3 mr-1 fill-current" />
                <span className="text-xs font-medium">4.5</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2">
              {property.description || 'Premium advertising location with high visibility and foot traffic.'}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {property.type?.replace('_', ' ') || 'Property'}
                </Badge>
                <span>{property.advertising_areas?.length || 0} spaces</span>
              </div>
              <Badge className="bg-primary/10 text-primary font-bold text-xs">
                {formatPrice(property)}
              </Badge>
            </div>

            <Button 
              className="w-full h-8 text-xs" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Book property:', property.id);
              }}
            >
              <Calendar className="w-3 h-3 mr-1" />
              Book Space
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default MobilePropertyCard;
