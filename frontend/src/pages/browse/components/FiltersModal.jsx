import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { 
  X, Building2, Eye, Star, Navigation, Monitor, Users, Target, 
  CheckCircle, TrendingUp, Zap as Lightning 
} from "lucide-react";

export default function FiltersModal({ 
  showFilters, 
  setShowFilters, 
  filters, 
  toggleFilter,
  toggleFeature,
  clearFilters,
  filteredSpaces 
}) {
  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowFilters(false)}
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
                <h2 className="text-xl font-bold text-white">Filter Advertising Spaces</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Price Range */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Price Range</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', label: 'Any Budget' },
                      { id: 'under500', label: 'Under $500/mo' },
                      { id: 'under1000', label: 'Under $1K/mo' },
                      { id: 'under2000', label: 'Under $2K/mo' }
                    ].map(price => (
                      <Button
                        key={price.id}
                        variant={filters.priceRange === price.id ? 'default' : 'outline'}
                        size="sm"
                        className={`rounded-xl transition-all ${
                          filters.priceRange === price.id 
                            ? 'bg-lime-400 text-gray-900 hover:bg-lime-500' 
                            : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white'
                        }`}
                        onClick={() => toggleFilter('priceRange', price.id)}
                      >
                        {price.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Space Type */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Space Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', label: 'All Types', icon: Building2 },
                      { id: 'digital', label: 'Digital', icon: Lightning },
                      { id: 'outdoor', label: 'Outdoor', icon: Eye },
                      { id: 'retail', label: 'Retail', icon: Building2 },
                      { id: 'transit', label: 'Transit', icon: Navigation },
                      { id: 'indoor', label: 'Indoor', icon: Monitor }
                    ].map(type => (
                      <Button
                        key={type.id}
                        variant={filters.spaceType === type.id ? 'default' : 'outline'}
                        size="sm"
                        className={`rounded-xl flex items-center gap-1 transition-all ${
                          filters.spaceType === type.id 
                            ? 'bg-lime-400 text-gray-900 hover:bg-lime-500' 
                            : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white'
                        }`}
                        onClick={() => toggleFilter('spaceType', type.id)}
                      >
                        <type.icon className="w-3 h-3" />
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Target Audience</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', label: 'Everyone', icon: Users },
                      { id: 'families', label: 'Families', icon: Users },
                      { id: 'professionals', label: 'Professionals', icon: Target },
                      { id: 'commuters', label: 'Commuters', icon: Navigation }
                    ].map(audience => (
                      <Button
                        key={audience.id}
                        variant={filters.audience === audience.id ? 'default' : 'outline'}
                        size="sm"
                        className={`rounded-xl flex items-center gap-1 transition-all ${
                          filters.audience === audience.id 
                            ? 'bg-lime-400 text-gray-900 hover:bg-lime-500' 
                            : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white'
                        }`}
                        onClick={() => toggleFilter('audience', audience.id)}
                      >
                        <audience.icon className="w-3 h-3" />
                        {audience.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'verified', label: 'Verified Owner', icon: CheckCircle },
                      { id: 'high_traffic', label: 'High Traffic', icon: TrendingUp },
                      { id: 'premium', label: 'Premium Location', icon: Star },
                      { id: 'digital', label: 'Digital Display', icon: Lightning }
                    ].map(feature => (
                      <Button
                        key={feature.id}
                        variant={filters.features.includes(feature.id) ? 'default' : 'outline'}
                        size="sm"
                        className={`rounded-xl flex items-center gap-1 transition-all ${
                          filters.features.includes(feature.id) 
                            ? 'bg-lime-400 text-gray-900 hover:bg-lime-500' 
                            : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white'
                        }`}
                        onClick={() => toggleFeature(feature.id)}
                      >
                        <feature.icon className="w-3 h-3" />
                        {feature.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-700 mt-6">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                >
                  Clear All
                </Button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {filteredSpaces.length} spaces found
                  </span>
                  <Button 
                    onClick={() => setShowFilters(false)}
                    className="bg-lime-400 text-gray-900 hover:bg-lime-500"
                  >
                    Show Results
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}