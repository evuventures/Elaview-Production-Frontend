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
          className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowCart(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-2xl bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Your Cart</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Your cart is empty</h3>
                  <p className="text-gray-400">Add some advertising spaces to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{getAreaName(item.space)}</h3>
                          <p className="text-sm text-gray-400">{item.space.propertyName}</p>
                          <p className="text-xs text-gray-500">{item.space.propertyAddress}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-400 hover:bg-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-400">Duration:</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartItemDuration(item.id, Math.max(1, item.duration - 1))}
                              className="bg-gray-600 border-gray-500 text-gray-300 hover:bg-gray-500 h-8 w-8 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-white font-medium w-12 text-center">{item.duration} days</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartItemDuration(item.id, item.duration + 1)}
                              className="bg-gray-600 border-gray-500 text-gray-300 hover:bg-gray-500 h-8 w-8 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">${item.pricePerDay}/day</p>
                          <p className="text-lg font-bold text-lime-400">${item.totalPrice}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-600 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold text-white">Total:</span>
                      <span className="text-2xl font-bold text-lime-400">${getTotalCartValue()}</span>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-lime-400 text-gray-900 hover:bg-lime-500"
                        onClick={() => {
                          console.log('Proceeding to checkout with cart:', cart);
                          setShowCart(false);
                        }}
                      >
                        Proceed to Checkout
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setCart([])}
                        className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                      >
                        Clear Cart
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}