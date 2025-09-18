// src/pages/browse/components/SpaceCard.jsx
// ✅ FIXED: Proper image handling based on actual Prisma schema structure
// ✅ ENHANCED: Comprehensive error handling and logging for debugging
// ✅ NEW: Cart icon and toggle functionality

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
 Heart, ShoppingCart, CheckCircle, Star, MapPin, Users, TrendingUp, Eye 
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
 addToCart,
 removeFromCart // NEW: Add removeFromCart prop
}) {
 const trust = getTrustIndicators(space.property);
 const insights = getBusinessInsights(space.property);
 const IconComponent = getAreaCategoryIcon(space);

 // GLASSMORPHISM: Verification console logs
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

 // DEBUG: Log space data structure for debugging
 console.log('🃏 SPACE CARD DEBUG - Space data structure:', {
 spaceId: space.id,
 spaceName: getAreaName(space),
 // Check all possible image fields from schema
 images: space.images, // String? from schema
 // Check property relation images
 propertyImages: space.property ? {
 primary_image: space.property.primary_image,
 images: space.property.images,
 photos: space.property.photos
 } : null,
 // Additional space image fields that might exist
 image: space.image, // Check if single 'image' field exists
 primaryImage: space.primaryImage,
 // Full space object keys for debugging
 spaceKeys: Object.keys(space),
 propertyKeys: space.property ? Object.keys(space.property) : null
 });
 }, [space]);

 // NEW: Cart toggle handler with proper logging
 const handleCartToggle = (e) => {
 e.stopPropagation();
 
 const isCurrentlyInCart = isInCart(space.id);
 
 console.log('🛒 CART TOGGLE:', {
 spaceId: space.id,
 spaceName: getAreaName(space),
 currentlyInCart: isCurrentlyInCart,
 action: isCurrentlyInCart ? 'REMOVE' : 'ADD',
 timestamp: new Date().toISOString()
 });

 if (isCurrentlyInCart) {
 removeFromCart(space.id);
 console.log('✅ CART: Removed space from cart:', space.id);
 } else {
 addToCart(space);
 console.log('✅ CART: Added space to cart:', space.id);
 }
 };

 // FIXED: Completely rewritten image retrieval based on actual Prisma schema
 const getSpaceImage = (space) => {
 console.log('🖼️ SPACE CARD - Getting image for space:', space.id);
 
 // STEP 1: Check space.images field (String? from Prisma schema)
 if (space.images && typeof space.images === 'string' && space.images.trim()) {
 console.log('✅ SPACE CARD - Found space.images (string):', space.images);
 return space.images;
 }
 
 // STEP 2: Check if images might be stored as JSON array (edge case handling)
 if (space.images && Array.isArray(space.images) && space.images.length> 0) {
 console.log('✅ SPACE CARD - Found space.images (array):', space.images[0]);
 return space.images[0];
 }
 
 // STEP 3: Check for single 'image' field (might exist in some data)
 if (space.image && typeof space.image === 'string' && space.image.trim()) {
 console.log('✅ SPACE CARD - Found space.image (single):', space.image);
 return space.image;
 }
 
 // STEP 4: Check property relation images through property.images (Json? from schema)
 if (space.property && space.property.images) {
 console.log('🏢 SPACE CARD - Checking property.images:', space.property.images);
 
 // If it's an array
 if (Array.isArray(space.property.images) && space.property.images.length> 0) {
 console.log('✅ SPACE CARD - Found property.images (array):', space.property.images[0]);
 return space.property.images[0];
 }
 
 // If it's stored as JSON string, try to parse
 if (typeof space.property.images === 'string') {
 try {
 const parsed = JSON.parse(space.property.images);
 if (Array.isArray(parsed) && parsed.length> 0) {
 console.log('✅ SPACE CARD - Found property.images (parsed JSON array):', parsed[0]);
 return parsed[0];
 } else {
 console.log('⚠️ SPACE CARD - Property.images parsed but empty array:', parsed);
 }
 } catch (e) {
 console.log('⚠️ SPACE CARD - Could not parse property.images JSON:', space.property.images);
 }
 }
 }
 
 // STEP 5: Check property.primary_image (String? from schema)
 if (space.property && space.property.primary_image && space.property.primary_image.trim()) {
 console.log('✅ SPACE CARD - Found property.primary_image:', space.property.primary_image);
 return space.property.primary_image;
 }
 
 // STEP 6: Check property.photos (Json? from schema) 
 if (space.property && space.property.photos) {
 console.log('🏢 SPACE CARD - Checking property.photos:', space.property.photos);
 
 if (Array.isArray(space.property.photos) && space.property.photos.length> 0) {
 console.log('✅ SPACE CARD - Found property.photos (array):', space.property.photos[0]);
 return space.property.photos[0];
 }
 
 if (typeof space.property.photos === 'string') {
 try {
 const parsed = JSON.parse(space.property.photos);
 if (Array.isArray(parsed) && parsed.length> 0) {
 console.log('✅ SPACE CARD - Found property.photos (parsed JSON array):', parsed[0]);
 return parsed[0];
 } else {
 console.log('⚠️ SPACE CARD - Property.photos parsed but empty array:', parsed);
 }
 } catch (e) {
 console.log('⚠️ SPACE CARD - Could not parse property.photos JSON:', space.property.photos);
 }
 }
 }
 
 // STEP 7: Log complete failure and space structure for debugging
 console.log('❌ SPACE CARD - NO IMAGE FOUND for space:', space.id);
 console.log('🔍 SPACE CARD - Complete space structure for debugging:', {
 id: space.id,
 name: space.name,
 images: space.images,
 image: space.image,
 property: space.property ? {
 id: space.property.id,
 primary_image: space.property.primary_image,
 images: space.property.images,
 photos: space.property.photos
 } : 'NO PROPERTY RELATION',
 allSpaceKeys: Object.keys(space),
 allPropertyKeys: space.property ? Object.keys(space.property) : null
 });
 
 return null;
 };

 // Get the final image URL
 const spaceImage = getSpaceImage(space);
 
 // DEBUG: Log final image result
 console.log('🎯 SPACE CARD FINAL - Image result for space:', space.id, '-> URL:', spaceImage);

 // NEW: Check if space is in cart
 const inCart = isInCart(space.id);

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
 // GLASSMORPHISM: Main container with premium glass effect
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
 // GLASSMORPHISM: Enhanced hover effect
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
 {/* GLASSMORPHISM: Glass reflection effect overlay */}
 <div 
 className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
 style={{
 background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)'
 }}
 />
 
 {/* GLASSMORPHISM: Glass highlight edge */}
 <div 
 className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
 style={{
 background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 20%, rgba(255, 255, 255, 0.3) 80%, transparent 100%)'
 }}
 />

 <CardContent className="p-0 relative z-10">
 {/* Enhanced Image Section with proper error handling */}
 <div className="relative h-60 p-3">
 <div className="relative h-full w-full rounded-lg overflow-hidden">
 {spaceImage ? (
 <img 
 src={spaceImage} 
 alt={getAreaName(space)} 
 className="w-full h-full object-cover transition-transform duration-500" 
 onError={(e) => {
 console.log('❌ SPACE CARD - Image load error for URL:', spaceImage);
 console.log('🔍 SPACE CARD - Error event:', e);
 // Fall back to default image
 e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400';
 }}
 onLoad={() => {
 console.log('✅ SPACE CARD - Image loaded successfully:', spaceImage);
 }}
 />
 ) : (
 <>
 {/* FALLBACK: Show default image when no space image found */}
 <img 
 src='https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400'
 alt={getAreaName(space)} 
 className="w-full h-full object-cover transition-transform duration-500 opacity-75" 
 onError={(e) => {
 console.log('❌ SPACE CARD - Even fallback image failed to load');
 // Replace with a colored div if even fallback fails
 e.target.style.display = 'none';
 e.target.parentElement.style.background = 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)';
 }}
 />
 {/* DEBUG: Show missing image warning in development */}
 {process.env.NODE_ENV === 'development' && (
 <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
 No Image Found
 </div>
 )}
 </>
 )}
 
 {/* GLASSMORPHISM: Enhanced overlay elements with glass effect */}
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
 </div>
 </div>

 {/* GLASSMORPHISM: Enhanced Content Section with subtle glass background */}
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

 {/* GLASSMORPHISM: Enhanced Action Area with new layout */}
 <div className="relative z-10 space-y-2">
 {/* Price and Viewers Row */}
 <div className="flex items-center justify-between">
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
 
 <div className="flex items-center text-slate-600">
 <Eye className="w-3 h-3 mr-1 drop-shadow-sm" />
 <span className="text-xs font-medium" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>
 {(insights.footTraffic/1000).toFixed(0)}k/day
 </span>
 </div>
 </div>

 {/* Buttons Row */}
 <div className="flex items-center gap-2">
 <Button 
 onClick={(e) => {
 e.stopPropagation();
 onSpaceClick(space);
 }}
 size={20}
 className="text-white text-xs px-3 py-1 shadow-lg border-0 transition-all duration-300 relative overflow-hidden flex-1"
 style={{ 
 background: 'linear-gradient(135deg, #5A7BC2 0%, #4668AB 50%, #3A5490 100%)',
 backdropFilter: 'blur(10px)',
 WebkitBackdropFilter: 'blur(10px)',
 boxShadow: '0 4px 16px rgba(70, 104, 171, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
 flexBasis: '70%'
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

 {/* NEW: Enhanced Cart Toggle Button with proper cart icon */}
 <button
 onClick={handleCartToggle}
 className="p-2 rounded-lg transition-all duration-300 relative overflow-hidden group/cart flex items-center justify-center"
 style={{ 
 background: inCart 
 ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(34, 197, 94, 0.95) 100%)'
 : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
 backdropFilter: 'blur(10px) saturate(150%)',
 WebkitBackdropFilter: 'blur(10px) saturate(150%)',
 border: `1px solid ${inCart ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
 boxShadow: inCart 
 ? '0 4px 16px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
 : '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
 flexBasis: '30%',
 minWidth: '40px',
 height: '36px'
 }}
 onMouseEnter={(e) => {
 if (inCart) {
 e.target.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(239, 68, 68, 0.95) 100%)';
 e.target.style.border = '1px solid rgba(239, 68, 68, 0.3)';
 e.target.style.boxShadow = '0 4px 16px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
 } else {
 e.target.style.background = 'linear-gradient(135deg, rgba(70, 104, 171, 0.9) 0%, rgba(70, 104, 171, 0.95) 100%)';
 e.target.style.border = '1px solid rgba(70, 104, 171, 0.3)';
 e.target.style.boxShadow = '0 4px 16px rgba(70, 104, 171, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
 }
 e.target.style.transform = 'translateY(-1px)';
 }}
 onMouseLeave={(e) => {
 e.target.style.background = inCart 
 ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(34, 197, 94, 0.95) 100%)'
 : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)';
 e.target.style.border = `1px solid ${inCart ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`;
 e.target.style.boxShadow = inCart 
 ? '0 4px 16px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
 : '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
 e.target.style.transform = 'translateY(0px)';
 }}
 title={inCart ? "Remove from cart" : "Add to cart"}
>
 {/* Glass reflection on button */}
 <div 
 className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-lg"
 style={{
 background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%)'
 }}
 />
 
 {/* Icon with proper color based on state */}
 {inCart ? (
 <CheckCircle 
 className="w-4 h-4 text-white relative z-10 group-hover/cart:text-white transition-colors duration-200" 
 />
 ) : (
 <ShoppingCart 
 className="w-4 h-4 text-slate-600 relative z-10 group-hover/cart:text-white transition-colors duration-200" 
 />
 )}
 </button>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 </motion.div>
 );
}