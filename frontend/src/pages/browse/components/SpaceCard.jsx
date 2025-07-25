import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        className={`cursor-pointer transition-all duration-300 group overflow-hidden rounded-2xl bg-gray-800/60 backdrop-blur-lg border-gray-700/50 hover:bg-gray-700/60 hover:border-lime-400/30 hover:shadow-xl hover:shadow-lime-400/10 ${
          isAnimating ? 'ring-2 ring-lime-400 shadow-xl shadow-lime-400/20' : ''
        }`}
      >
        <CardContent className="p-0">
          {/* Square Image Section */}
          <div className="relative aspect-square overflow-hidden">
            <img 
              src={space.images || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400'} 
              alt={getAreaName(space)} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400';
              }}
            />
            
            {/* Overlay Elements */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-lime-400 text-gray-900 flex items-center gap-1 text-xs">
                <IconComponent className="w-3 h-3" />
                {getAreaType(space)}
              </Badge>
            </div>

            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSavedSpace(space.id);
                }}
                className="p-2 bg-gray-900/80 hover:bg-gray-800 rounded-full transition-colors"
              >
                <Heart className={`w-4 h-4 ${
                  savedSpaces.has(space.id) ? 'fill-red-500 text-red-500' : 'text-white'
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
                className={`p-2 bg-gray-900/80 hover:bg-gray-800 rounded-full transition-colors ${
                  isInCart(space.id) ? 'bg-lime-400/80 text-gray-900' : ''
                }`}
                disabled={isInCart(space.id)}
              >
                {isInCart(space.id) ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4 text-white" />
                )}
              </button>
            </div>

            {trust?.verified && (
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-green-500 text-white border-0 flex items-center gap-1 text-xs">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </Badge>
              </div>
            )}

            <div className="absolute bottom-3 right-3">
              <Badge className="bg-gray-900/90 text-lime-400 border-0 font-bold">
                {getAreaPrice(space)}
              </Badge>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-white group-hover:text-lime-400 transition-colors duration-300 truncate">
                  {getAreaName(space)}
                </h3>
                <p className="text-xs text-gray-400 font-medium truncate">
                  at {space.propertyName}
                </p>
              </div>
              {trust?.rating && (
                <div className="flex items-center text-yellow-400 ml-2">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  <span className="text-xs font-medium">{trust.rating}</span>
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-400 flex items-center truncate">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              {space.propertyAddress}
            </p>

            {/* Performance Metrics */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center text-emerald-400">
                <Users className="w-3 h-3 mr-1" />
                <span>{(insights.footTraffic/1000).toFixed(0)}K/day</span>
              </div>
              <div className="flex items-center text-cyan-400">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+{insights.avgCampaignLift}%</span>
              </div>
            </div>

            {/* Action Area */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center text-lime-400">
                <Eye className="w-3 h-3 mr-1" />
                <span className="text-xs">Available</span>
              </div>
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSpaceClick(space);
                }}
                size="sm"
                className="bg-lime-400 text-gray-900 hover:bg-lime-500 text-xs px-3 py-1"
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