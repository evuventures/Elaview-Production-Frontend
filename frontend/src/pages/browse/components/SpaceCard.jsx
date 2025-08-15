import React, { useEffect } from 'react';
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

  // ✅ GLASSMORPHISM: Verification console logs
  useEffect(() => {
    console.log('🎨 SPACECARD GLASSMORPHISM: Enhanced styling applied', {
      spaceName: getAreaName(space),
      glassmorphismFeatures: [
        'Semi-transparent gradient background',
        'Enhanced backdrop blur (20px)',
        'Saturation boost (180%)',
        'Multi-layered shadow system',
        'Glass reflection overlays',
        'Transparent border effects',
        'Premium hover elevations'
      ],
      timestamp: new Date().toISOString()
    });
  }, [space]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8 }} // Enhanced hover lift
    >
      <Card 
        onClick={() => onCardClick(space)}
        className={`cursor-pointer transition-all duration-500 group overflow-hidden rounded-2xl relative ${
          isAnimating ? 'ring-2' : ''
        }`}
        style={{
          // ✅ GLASSMORPHISM: Main container with premium glass effect
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)', 
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderColor: isAnimating ? '#4668AB' : 'rgba(255, 255, 255, 0.18)',
          boxShadow: isAnimating 
            ? `0 0 0 2px rgba(70, 104, 171, 0.2),
               0 8px 32px rgba(0, 0, 0, 0.15),
               0 4px 16px rgba(0, 0, 0, 0.1),
               inset 0 1px 0 rgba(255, 255, 255, 0.2),
               inset 0 -1px 0 rgba(255, 255, 255, 0.05)` 
            : `0 8px 32px rgba(0, 0, 0, 0.12),
               0 4px 16px rgba(0, 0, 0, 0.08),
               inset 0 1px 0 rgba(255, 255, 255, 0.2),
               inset 0 -1px 0 rgba(255, 255, 255, 0.05)`,
        }}
        onMouseEnter={(e) => {
          // ✅ GLASSMORPHISM: Enhanced hover effect
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = `
            0 16px 48px rgba(0, 0, 0, 0.18),
            0 8px 24px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(255, 255, 255, 0.1)
          `;
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.45) 50%, rgba(255, 255, 255, 0.35) 100%)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0px)';
          e.currentTarget.style.boxShadow = `
            0 8px 32px rgba(0, 0, 0, 0.12),
            0 4px 16px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(255, 255, 255, 0.05)
          `;
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)';
        }}
      >
        {/* ✅ GLASSMORPHISM: Glass reflection effect overlay */}
        <div 
          className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)'
          }}
        />
        
        {/* ✅ GLASSMORPHISM: Glass highlight edge */}
        <div 
          className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 20%, rgba(255, 255, 255, 0.3) 80%, transparent 100%)'
          }}
        />

        <CardContent className="p-0 relative z-10">
          {/* Enhanced Image Section with subtle glassmorphism overlays */}
          <div className="relative h-60 p-3">
            <div className="relative h-full w-full rounded-lg overflow-hidden">
              <img 
                src={space.images || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400'} 
                alt={getAreaName(space)} 
                className="w-full h-full object-cover transition-transform duration-500" 
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400';
                }}
              />
              
              {/* ✅ GLASSMORPHISM: Enhanced overlay elements with glass effect */}
              <div className="absolute top-3 left-3">
                <span 
                  className="text-white flex items-center gap-1 text-xs font-medium shadow-lg px-3 py-1 rounded-full relative overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(70, 104, 171, 0.9) 0%, rgba(70, 104, 171, 0.95) 100%)',
                    backdropFilter: 'blur(10px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(10px) saturate(150%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 16px rgba(70, 104, 171, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {/* Glass reflection on badge */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)'
                    }}
                  />
                  <IconComponent className="w-3 h-3 relative z-10" />
                  <span className="relative z-10">{getAreaType(space)}</span>
                </span>
              </div>

              <div className="absolute top-3 right-3 flex gap-2">
                {/* ✅ GLASSMORPHISM: Enhanced Quick Add to Cart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isInCart(space.id)) {
                      addToCart(space);
                    }
                  }}
                  className={`p-2 rounded-full transition-all duration-300 relative overflow-hidden ${
                    isInCart(space.id) ? '' : ''
                  }`}
                  style={{ 
                    background: isInCart(space.id) 
                      ? 'linear-gradient(135deg, rgba(240, 253, 244, 0.9) 0%, rgba(240, 253, 244, 0.95) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
                    backdropFilter: 'blur(10px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(10px) saturate(150%)',
                    border: `1px solid ${isInCart(space.id) ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                    boxShadow: isInCart(space.id) 
                      ? '0 4px 16px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      : '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                  disabled={isInCart(space.id)}
                >
                  {/* Glass reflection on button */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-full"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%)'
                    }}
                  />
                  {isInCart(space.id) ? (
                    <CheckCircle className="w-4 h-4 text-green-600 relative z-10" />
                  ) : (
                    <Plus className="w-4 h-4 text-slate-600 relative z-10" />
                  )}
                </button>
              </div>

              {trust?.verified && (
                <div className="absolute bottom-3 left-3">
                  <span 
                    className="text-white flex items-center gap-1 text-xs shadow-lg px-3 py-1 rounded-full relative overflow-hidden"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(34, 197, 94, 0.95) 100%)',
                      backdropFilter: 'blur(10px) saturate(150%)',
                      WebkitBackdropFilter: 'blur(10px) saturate(150%)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {/* Glass reflection on verified badge */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
                      style={{
                        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)'
                      }}
                    />
                    <CheckCircle className="w-3 h-3 relative z-10" />
                    <span className="relative z-10">Verified</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ✅ GLASSMORPHISM: Enhanced Content Section with subtle glass background */}
          <div 
            className="p-4 space-y-2 relative overflow-hidden rounded-b-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.4) 100%)',
              backdropFilter: 'blur(15px) saturate(150%)',
              WebkitBackdropFilter: 'blur(15px) saturate(150%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderTop: 'none',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Content glass reflection */}
            <div 
              className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 100%)'
              }}
            />

            <div className="flex items-start justify-between relative z-10">
              <div className="flex-1 min-w-0">
                <h3 
                  className="font-bold text-base text-slate-800 group-hover:transition-colors duration-300 truncate"
                  style={{
                    color: 'inherit',
                    textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#4668AB'}
                  onMouseLeave={(e) => e.target.style.color = 'inherit'}
                >
                  {getAreaName(space)}
                </h3>
                <p className="text-xs text-slate-600 font-medium truncate" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'}}>
                  at {space.propertyName}
                </p>
              </div>
              {trust?.rating && (
                <div className="flex items-center text-amber-500 ml-2">
                  <Star className="w-3 h-3 mr-1 fill-current drop-shadow-sm" />
                  <span className="text-xs font-medium" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'}}>{trust.rating}</span>
                </div>
              )}
            </div>
            
            <p className="text-xs text-slate-500 flex items-center truncate relative z-10" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'}}>
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0 drop-shadow-sm" />
              {space.propertyAddress}
            </p>

            {/* Performance Metrics with enhanced visibility */}
            <div className="flex items-center justify-between text-xs relative z-10">
              <div className="flex items-center text-green-600">
                <Users className="w-3 h-3 mr-1 drop-shadow-sm" />
                <span style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>{(insights.footTraffic/1000).toFixed(0)}K/day</span>
              </div>
              <div 
                className="flex items-center"
                style={{ color: '#4668AB' }}
              >
                <TrendingUp className="w-3 h-3 mr-1 drop-shadow-sm" />
                <span style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>+{insights.avgCampaignLift}%</span>
              </div>
            </div>

            {/* ✅ GLASSMORPHISM: Enhanced Action Area */}
            <div className="flex items-center justify-between pt-2 relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex items-center text-green-600">
                  <Eye className="w-3 h-3 mr-1 drop-shadow-sm" />
                  <span className="text-xs font-medium" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>Available</span>
                </div>
                <span 
                  className="text-white font-bold shadow-lg px-3 py-1 rounded-full text-xs relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(30, 41, 59, 1) 100%)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 16px rgba(30, 41, 59, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {/* Glass reflection on price badge */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)'
                    }}
                  />
                  <span className="relative z-10">{getAreaPrice(space)}</span>
                </span>
              </div>
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSpaceClick(space);
                }}
                size="sm"
                className="text-white text-xs px-3 py-1 shadow-lg border-0 transition-all duration-300 relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, #5A7BC2 0%, #4668AB 50%, #3A5490 100%)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 16px rgba(70, 104, 171, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #6B8BD1 0%, #5A7BC2 50%, #4668AB 100%)';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(70, 104, 171, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #5A7BC2 0%, #4668AB 50%, #3A5490 100%)';
                  e.target.style.transform = 'translateY(0px)';
                  e.target.style.boxShadow = '0 4px 16px rgba(70, 104, 171, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                }}
              >
                {/* Glass reflection on button */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)'
                  }}
                />
                <span className="relative z-10">Details</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}