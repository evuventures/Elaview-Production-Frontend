// // src/pages/browse/components/SpacesBottomSheet.jsx
// // ✅ Bottom sheet component similar to Google Maps/Airbnb
// // ✅ Slides up 30-40% with horizontal scrolling space cards

// import React, { useState, useEffect, useRef } from 'react';
// import { X, MapPin, Heart, ShoppingCart, Calculator } from 'lucide-react';
// import { Button } from "@/components/ui/button";

// const SpacesBottomSheet = ({
// isOpen,
// onClose,
// spaces,
// onSpaceSelect,
// isInCart,
// addToCart,
// onBooking,
// onROICalculator,
// savedSpaces = new Set(),
// toggleSavedSpace = () => {}
// }) => {
// const [dragY, setDragY] = useState(0);
// const [isDragging, setIsDragging] = useState(false);
// const sheetRef = useRef(null);
// const startYRef = useRef(0);

// // Helper functions
// const getSpacePrice = (space) => {
// if (space.baseRate) {
// const rateType = space.rateType || 'MONTHLY';
// const suffix = rateType.toLowerCase().replace('ly', '').replace('y', '');
// return `$${space.baseRate}/${suffix}`;
// }
// return 'Contact for pricing';
// };

// const getSpaceName = (space) => {
// return space.name || space.title || 'Advertising Space';
// };

// const getSpaceImage = (space) => {
// if (space.images) {
// try {
// const imageData = typeof space.images === 'string' ? JSON.parse(space.images) : space.images;
// return Array.isArray(imageData) ? imageData[0] : imageData;
// } catch {
// return space.images;
// }
// }
// return '/api/placeholder/400/300';
// };

// // Touch/drag handlers for mobile gestures
// const handleTouchStart = (e) => {
// setIsDragging(true);
// startYRef.current = e.touches[0].clientY;
// };

// const handleTouchMove = (e) => {
// if (!isDragging) return;
 
// const currentY = e.touches[0].clientY;
// const deltaY = currentY - startYRef.current;
 
// // Only allow dragging down
// if (deltaY> 0) {
// setDragY(deltaY);
// }
// };

// const handleTouchEnd = () => {
// setIsDragging(false);
 
// // If dragged down more than 100px, close the sheet
// if (dragY> 100) {
// onClose();
// }
 
// setDragY(0);
// };

// // Mouse handlers for desktop
// const handleMouseDown = (e) => {
// setIsDragging(true);
// startYRef.current = e.clientY;
// };

// useEffect(() => {
// if (!isDragging) return;

// const handleMouseMove = (e) => {
// const currentY = e.clientY;
// const deltaY = currentY - startYRef.current;
 
// if (deltaY> 0) {
// setDragY(deltaY);
// }
// };

// const handleMouseUp = () => {
// setIsDragging(false);
 
// if (dragY> 100) {
// onClose();
// }
 
// setDragY(0);
// };

// document.addEventListener('mousemove', handleMouseMove);
// document.addEventListener('mouseup', handleMouseUp);

// return () => {
// document.removeEventListener('mousemove', handleMouseMove);
// document.removeEventListener('mouseup', handleMouseUp);
// };
// }, [isDragging, dragY, onClose]);

// if (!isOpen && dragY === 0) return null;

// return (
// <>
// {/* Backdrop */}
// <div 
// className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
// isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
// }`}
// onClick={onClose}
// />

// {/* Bottom Sheet */}
// <div
// ref={sheetRef}
// className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out ${
// isOpen ? 'translate-y-0' : 'translate-y-full'
// }`}
// style={{
// height: '40vh',
// transform: `translateY(${isOpen ? dragY : '100%'})`,
// transition: isDragging ? 'none' : 'transform 300ms ease-out'
// }}
//>
// {/* Drag Handle */}
// <div 
// className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
// onTouchStart={handleTouchStart}
// onTouchMove={handleTouchMove}
// onTouchEnd={handleTouchEnd}
// onMouseDown={handleMouseDown}
//>
// <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
// </div>

// {/* Header */}
// <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100">
// <div>
// <h3 className="text-lg font-semibold text-slate-900">
// {spaces.length} {spaces.length === 1 ? 'Space' : 'Spaces'} Available
// </h3>
// {spaces[0]?.propertyName && (
// <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
// <MapPin className="w-3 h-3" />
// {spaces[0].propertyName}
// </p>
// )}
// </div>
// <button
// onClick={onClose}
// className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
//>
// <X className="w-5 h-5 text-slate-400" />
// </button>
// </div>

// {/* Horizontal Scrolling Space Cards */}
// <div className="flex-1 overflow-hidden">
// <div className="h-full overflow-x-auto overflow-y-hidden px-4 py-4">
// <div className="flex gap-4 h-full">
// {spaces.map((space) => (
// <div
// key={space.id}
// className="flex-shrink-0 w-72 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
// onClick={() => onSpaceSelect(space)}
//>
// {/* Space Image */}
// <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-200">
// <img
// src={getSpaceImage(space)}
// alt={getSpaceName(space)}
// className="w-full h-full object-cover"
// onError={(e) => {
// e.currentTarget.src = '/api/placeholder/400/300';
// }}
// />
 
// {/* Save Button */}
// <button
// onClick={(e) => {
// e.stopPropagation();
// toggleSavedSpace(space.id);
// }}
// className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
//>
// <Heart 
// className={`w-4 h-4 ${
// savedSpaces.has(space.id) 
// ? 'text-red-500 fill-red-500' 
// : 'text-slate-600'
// }`} 
// />
// </button>

// {/* Space Type Badge */}
// <div className="absolute bottom-3 left-3">
// <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-slate-700 rounded-full">
// {space.type}
// </span>
// </div>
// </div>

// {/* Space Details */}
// <div className="p-4">
// <div className="flex items-start justify-between mb-2">
// <h4 className="font-semibold text-slate-900 text-sm leading-tight flex-1 mr-2">
// {getSpaceName(space)}
// </h4>
// <span className="bg-teal-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0">
// {getSpacePrice(space)}
// </span>
// </div>

// {space.description && (
// <p className="text-xs text-slate-600 mb-3 line-clamp-2">
// {space.description}
// </p>
// )}

// {/* Action Buttons */}
// <div className="flex gap-2">
// <Button
// size={20}
// variant="outline"
// onClick={(e) => {
// e.stopPropagation();
// onROICalculator(space);
// }}
// className="flex-1 h-8 text-xs"
//>
// <Calculator className="w-3 h-3 mr-1" />
// ROI
// </Button>
 
// {isInCart(space.id) ? (
// <Button
// size={20}
// onClick={(e) => {
// e.stopPropagation();
// onBooking(space);
// }}
// className="flex-1 h-8 text-xs bg-teal-600 hover:bg-teal-700"
//>
// Book Now
// </Button>
// ) : (
// <Button
// size={20}
// onClick={(e) => {
// e.stopPropagation();
// addToCart(space);
// }}
// className="flex-1 h-8 text-xs bg-teal-600 hover:bg-teal-700"
//>
// <ShoppingCart className="w-3 h-3 mr-1" />
// Add
// </Button>
// )}
// </div>
// </div>
// </div>
// ))}
// </div>
// </div>
// </div>

// {/* Bottom Action Bar (optional) */}
// <div className="border-t border-slate-100 p-4">
// <div className="flex gap-3">
// <Button 
// variant="outline" 
// className="flex-1"
// onClick={() => {
// // Could show all spaces in a full modal or navigate to a list view
// console.log('View all spaces');
// }}
//>
// View All Spaces
// </Button>
// <Button 
// className="flex-1 bg-teal-600 hover:bg-teal-700"
// onClick={() => {
// if (spaces.length> 0) {
// onBooking(spaces[0]);
// }
// }}
//>
// Book Selected
// </Button>
// </div>
// </div>
// </div>
// </>
// );
// };

// export default SpacesBottomSheet;