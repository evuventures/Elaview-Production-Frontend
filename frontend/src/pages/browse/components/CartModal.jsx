import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, ShoppingCart, Plus, Minus } from "lucide-react";
import { getAreaName } from '../utils/areaHelpers';

export default function CartModal({ 
  showCart, 
  setShowCart, 
  cart, 
  setCart,
  removeFromCart,
  updateCartItemDuration,
  getTotalCartValue 
}) {
  return (
    <AnimatePresence>
      {showCart && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowCart(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-2xl card card-spacious max-h-[80vh] overflow-y-auto shadow-soft-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="heading-2">Your Cart</h2>
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="heading-3 text-slate-800 mb-2">Your cart is empty</h3>
                <p className="body-medium text-slate-600 mb-6">
                  Add some advertising spaces to get started
                </p>
                <button 
                  onClick={() => setShowCart(false)}
                  className="btn-primary"
                >
                  Continue Browsing
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cart Items */}
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="card card-comfortable border border-slate-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="property-title text-slate-900">{getAreaName(item.space)}</h3>
                          <p className="body-small text-slate-600 mt-1">{item.space.propertyName}</p>
                          <p className="caption text-slate-500">{item.space.propertyAddress}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-4">
                          <span className="label text-slate-700">Duration:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCartItemDuration(item.id, Math.max(1, item.duration - 1))}
                              className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="body-medium text-slate-900 font-medium w-16 text-center">
                              {item.duration} day{item.duration !== 1 ? 's' : ''}
                            </span>
                            <button
                              onClick={() => updateCartItemDuration(item.id, item.duration + 1)}
                              className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="body-small text-slate-600">${item.pricePerDay}/day</p>
                          <p className="text-lg font-bold text-teal-600">${item.totalPrice}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Cart Summary */}
                <div className="border-t border-slate-200 pt-6">
                  <div className="bg-slate-50 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="heading-3 text-slate-900">Total:</span>
                      <span className="text-2xl font-bold text-teal-600">${getTotalCartValue()}</span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between body-small text-slate-600">
                        <span>{cart.length} space{cart.length !== 1 ? 's' : ''}</span>
                        <span>{cart.reduce((total, item) => total + item.duration, 0)} total days</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      className="btn-primary flex-1"
                      onClick={() => {
                        console.log('Proceeding to checkout with cart:', cart);
                        setShowCart(false);
                      }}
                    >
                      Proceed to Checkout
                    </button>
                    <button 
                      onClick={() => setCart([])}
                      className="btn-secondary"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}