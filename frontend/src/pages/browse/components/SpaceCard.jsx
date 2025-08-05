import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart, Plus, CheckCircle, Star, MapPin, Users, TrendingUp, Eye 
} from "lucide-react";
import { 
  getAreaName, 
  getAreaType, 
  getAreaPrice, 
  getAreaCategoryIcon 
} from '../utils/areaHelpers';
import { getBusinessInsights, getTrustIndicators } from '../utils/businessInsights';

export default function SpaceCard({ 
  space, 
  onCardClick, 
  onSpaceClick,
  isAnimating, 
  savedSpaces, 
  toggleSavedSpace, 
  isInCart, 
  addToCart 
}) {
  const trust = getTrustIndicators(space.property);
  const insights = getBusinessInsights(space.property);
  const IconComponent = getAreaCategoryIcon(space);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card 
        onClick={() => onCardClick(space)}
        className={`cursor-pointer transition-all duration-300 group overflow-hidden rounded-xl border hover:shadow-lg ${
          isAnimating ? 'ring-2 shadow-lg' : ''
        }`}
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: isAnimating ? '#4668AB' : '#E5E7EB',
          boxShadow: isAnimating ? '0 0 0 2px rgba(70, 104, 171, 0.2)' : undefined
        }}
      >
        <CardContent className="p-0">
          {/* Square Image Section */}
          <div className="relative h-60">
            <img 
              src={space.images || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400'} 
              alt={getAreaName(space)} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400';
              }}
            />
            
            {/* Overlay Elements with updated Elaview colors */}
            <div className="absolute top-3 left-3">
              <span 
                className="text-white flex items-center gap-1 text-xs font-medium shadow-sm px-3 py-1 rounded-full"
                style={{ backgroundColor: '#4668AB' }}
              >
                <IconComponent className="w-3 h-3" />
                {getAreaType(space)}
              </span>
            </div>

            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSavedSpace(space.id);
                }}
                className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-sm backdrop-blur-sm"
                style={{ border: '1px solid #E5E7EB' }}
              >
                <Heart className={`w-4 h-4 ${
                  savedSpaces.has(space.id) ? 'fill-red-500 text-red-500' : 'text-slate-600'
                }`} />
              </button>
              
              {/* Quick Add to Cart Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isInCart(space.id)) {
                    addToCart(space);
                  }
                }}
                className={`p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-sm backdrop-blur-sm ${
                  isInCart(space.id) ? 'border-green-200' : ''
                }`}
                style={{ 
                  border: `1px solid ${isInCart(space.id) ? '#16B96F' : '#E5E7EB'}`,
                  backgroundColor: isInCart(space.id) ? '#F0FDF4' : undefined
                }}
                disabled={isInCart(space.id)}
              >
                {isInCart(space.id) ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Plus className="w-4 h-4 text-slate-600" />
                )}
              </button>
            </div>

            {trust?.verified && (
              <div className="absolute bottom-3 left-3">
                <span 
                  className="text-white border-0 flex items-center gap-1 text-xs shadow-sm px-3 py-1 rounded-full"
                  style={{ backgroundColor: '#16B96F' }}
                >
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              </div>
            )}

            <div className="absolute bottom-3 right-3">
              <span className="bg-slate-800 text-white border-0 font-bold shadow-sm px-3 py-1 rounded-full text-xs">
                {getAreaPrice(space)}
              </span>
            </div>
          </div>

          {/* Content Section - Keep original compact spacing with updated colors */}
          <div className="p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 
                  className="font-bold text-base text-slate-800 group-hover:transition-colors duration-300 truncate"
                  style={{
                    color: 'inherit'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#4668AB'}
                  onMouseLeave={(e) => e.target.style.color = 'inherit'}
                >
                  {getAreaName(space)}
                </h3>
                <p className="text-xs text-slate-600 font-medium truncate">
                  at {space.propertyName}
                </p>
              </div>
              {trust?.rating && (
                <div className="flex items-center text-amber-500 ml-2">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  <span className="text-xs font-medium">{trust.rating}</span>
                </div>
              )}
            </div>
            
            <p className="text-xs text-slate-500 flex items-center truncate">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              {space.propertyAddress}
            </p>

            {/* Performance Metrics with updated Elaview colors */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center text-green-600">
                <Users className="w-3 h-3 mr-1" />
                <span>{(insights.footTraffic/1000).toFixed(0)}K/day</span>
              </div>
              <div 
                className="flex items-center"
                style={{ color: '#4668AB' }}
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+{insights.avgCampaignLift}%</span>
              </div>
            </div>

            {/* Action Area with updated Elaview colors */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center text-green-600">
                <Eye className="w-3 h-3 mr-1" />
                <span className="text-xs font-medium">Available</span>
              </div>
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSpaceClick(space);
                }}
                size="sm"
                className="text-white text-xs px-3 py-1 shadow-sm border-0 hover:opacity-90 transition-opacity"
                style={{ 
                  backgroundColor: '#4668AB',
                  '&:hover': { backgroundColor: '#3A5490' }
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#3A5490'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#4668AB'}
              >
                Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}