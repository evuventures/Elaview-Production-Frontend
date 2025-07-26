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
        className={`cursor-pointer transition-all duration-300 group overflow-hidden rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-lg ${
          isAnimating ? 'ring-2 ring-teal-500 shadow-lg' : ''
        }`}
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
            
            {/* Overlay Elements with Elaview colors */}
            <div className="absolute top-3 left-3">
              <span className="bg-teal-500 text-white flex items-center gap-1 text-xs font-medium shadow-sm px-3 py-1 rounded-full">
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
                className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-sm backdrop-blur-sm border border-slate-200"
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
                className={`p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-sm backdrop-blur-sm border border-slate-200 ${
                  isInCart(space.id) ? 'bg-success-50 border-success-200' : ''
                }`}
                disabled={isInCart(space.id)}
              >
                {isInCart(space.id) ? (
                  <CheckCircle className="w-4 h-4 text-success-600" />
                ) : (
                  <Plus className="w-4 h-4 text-slate-600" />
                )}
              </button>
            </div>

            {trust?.verified && (
              <div className="absolute bottom-3 left-3">
                <span className="bg-success-500 text-white border-0 flex items-center gap-1 text-xs shadow-sm px-3 py-1 rounded-full">
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

          {/* Content Section - Keep original compact spacing */}
          <div className="p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-slate-800 group-hover:text-teal-600 transition-colors duration-300 truncate">
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

            {/* Performance Metrics with Elaview colors */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center text-success-600">
                <Users className="w-3 h-3 mr-1" />
                <span>{(insights.footTraffic/1000).toFixed(0)}K/day</span>
              </div>
              <div className="flex items-center text-teal-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+{insights.avgCampaignLift}%</span>
              </div>
            </div>

            {/* Action Area with Elaview colors */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center text-success-600">
                <Eye className="w-3 h-3 mr-1" />
                <span className="text-xs font-medium">Available</span>
              </div>
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSpaceClick(space);
                }}
                size="sm"
                className="bg-teal-500 text-white hover:bg-teal-600 text-xs px-3 py-1 shadow-sm border-0"
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