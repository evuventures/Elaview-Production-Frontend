// src/pages/browse/components/mobile/FloatingCartButton.jsx
// ✅ RESEARCH-BASED: Sticky CTAs increase conversions by 7.9%
// ✅ MOBILE-OPTIMIZED: Thumb-friendly design with haptic feedback

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ChevronUp } from 'lucide-react';

const FloatingCartButton = ({ 
 cartItems = [], 
 onOpenCart,
 totalValue = 0,
 className = ''
}) => {
 const [isVisible, setIsVisible] = useState(false);
 const [showPreview, setShowPreview] = useState(false);

 const cartCount = cartItems.length;
 const hasItems = cartCount> 0;

 // ✅ RESEARCH-BASED: Show/hide based on cart state and scroll
 useEffect(() => {
 let timeoutId;
 
 if (hasItems) {
 // Show immediately when items are added
 setIsVisible(true);
 
 // Show preview briefly when new items are added
 setShowPreview(true);
 timeoutId = setTimeout(() => setShowPreview(false), 3000);
 
 console.log('🛒 Floating cart button visible with', cartCount, 'items, total:', totalValue);
 } else {
 // Hide when cart is empty
 setIsVisible(false);
 setShowPreview(false);
 console.log('🛒 Floating cart button hidden - cart empty');
 }

 return () => {
 if (timeoutId) clearTimeout(timeoutId);
 };
 }, [hasItems, cartCount, totalValue]);

 // ✅ RESEARCH-BASED: Handle scroll to show/hide preview
 useEffect(() => {
 let scrollTimeout;
 
 const handleScroll = () => {
 if (hasItems && showPreview) {
 setShowPreview(false);
 }
 
 // Show preview on scroll stop (debounced)
 clearTimeout(scrollTimeout);
 scrollTimeout = setTimeout(() => {
 if (hasItems && !showPreview) {
 setShowPreview(true);
 setTimeout(() => setShowPreview(false), 2000);
 }
 }, 150);
 };

 if (isVisible) {
 window.addEventListener('scroll', handleScroll, { passive: true });
 document.addEventListener('touchmove', handleScroll, { passive: true });
 }
 
 return () => {
 window.removeEventListener('scroll', handleScroll);
 document.removeEventListener('touchmove', handleScroll);
 clearTimeout(scrollTimeout);
 };
 }, [hasItems, showPreview, isVisible]);

 // ✅ Handle button click with haptic feedback
 const handleButtonClick = () => {
 console.log('🛒 Floating cart button clicked - opening drawer');
 
 // Add haptic feedback for mobile devices
 if (navigator.vibrate) {
 navigator.vibrate([10]);
 }
 
 onOpenCart();
 };

 if (!isVisible) return null;

 return (
 <AnimatePresence>
 <div className={`fixed bottom-20 right-4 z-40 ${className}`}>
 {/* ✅ RESEARCH-BASED: Expandable cart preview */}
 <motion.div
 initial={{ scale: 0, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0, opacity: 0 }}
 className="relative"
>
 {/* Cart Preview Panel */}
 <AnimatePresence>
 {showPreview && (
 <motion.div
 initial={{ opacity: 0, y: 10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.95 }}
 className="absolute bottom-16 right-0 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 min-w-[280px] max-w-[320px]"
>
 <div className="flex items-center justify-between mb-3">
 <h4 className="font-semibold text-slate-900">Cart Summary</h4>
 <button
 onClick={() => setShowPreview(false)}
 className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
>
 <ChevronUp className="w-4 h-4" />
 </button>
 </div>
 
 <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
 {cartItems.slice(0, 3).map((item, index) => (
 <div key={item.id} className="flex items-center gap-2 text-sm">
 <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden flex-shrink-0">
 <img 
 src={item.space?.images || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=50'} 
 alt=""
 className="w-full h-full object-cover"
 onError={(e) => {
 e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=50';
 }}
 />
 </div>
 <div className="flex-1 min-w-0">
 <p className="font-medium text-slate-900 truncate">
 {item.space?.title || item.space?.name || 'Advertising Space'}
 </p>
 <p className="text-slate-500 text-xs">
 {item.duration || 1} day{(item.duration || 1) !== 1 ? 's' : ''} • ${item.totalPrice?.toFixed(2) || '0.00'}
 </p>
 </div>
 </div>
 ))}
 
 {cartCount> 3 && (
 <p className="text-xs text-slate-500 text-center pt-2 border-t border-slate-200">
 +{cartCount - 3} more space{cartCount - 3 !== 1 ? 's' : ''}
 </p>
 )}
 </div>
 
 <div className="border-t border-slate-200 pt-3">
 <div className="flex items-center justify-between mb-3">
 <span className="font-semibold text-slate-900">Total:</span>
 <span className="font-bold text-lg text-teal-600">
 ${totalValue.toFixed(2)}
 </span>
 </div>
 
 <button
 onClick={handleButtonClick}
 className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-semibold text-sm transition-colors"
>
 View Cart & Checkout
 </button>
 </div>

 {/* Arrow pointing to button */}
 <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-slate-200 transform rotate-45"></div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* ✅ RESEARCH-BASED: Main floating cart button */}
 <motion.button
 onClick={handleButtonClick}
 className="relative bg-teal-600 hover:bg-teal-700 text-white rounded-full p-4 shadow-2xl border-2 border-white transition-all duration-200 hover:scale-105 active:scale-95"
 whileTap={{ scale: 0.95 }}
 initial={{ scale: 0, rotate: -180 }}
 animate={{ scale: 1, rotate: 0 }}
 transition={{ 
 type: "spring", 
 stiffness: 300, 
 damping: 25,
 duration: 0.5 
 }}
>
 <ShoppingCart className="w-6 h-6" />
 
 {/* Cart count badge */}
 <motion.div
 key={cartCount} // Re-animate when count changes
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
>
 {cartCount> 99 ? '99+' : cartCount}
 </motion.div>

 {/* Value badge (shows on hover/preview) */}
 {totalValue> 0 && (
 <motion.div
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: showPreview ? 1 : 0, scale: showPreview ? 1 : 0.8 }}
 className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap"
>
 ${totalValue.toFixed(0)}
 </motion.div>
 )}
 </motion.button>

 {/* Pulse animation for new items */}
 <motion.div
 key={`pulse-${cartCount}`}
 initial={{ scale: 1, opacity: 0.7 }}
 animate={{ scale: 1.2, opacity: 0 }}
 transition={{ duration: 0.6 }}
 className="absolute inset-0 bg-teal-400 rounded-full -z-10"
 />
 </motion.div>
 </div>
 </AnimatePresence>
 );
};

export default FloatingCartButton;