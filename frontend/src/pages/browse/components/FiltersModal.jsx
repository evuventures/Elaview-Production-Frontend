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
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowFilters(false)}
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
              <h2 className="heading-2">Filter Advertising Spaces</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Price Range */}
              <div>
                <h3 className="label text-slate-800 mb-4">Price Range</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'all', label: 'Any Budget' },
                    { id: 'under500', label: 'Under $500/mo' },
                    { id: 'under1000', label: 'Under $1K/mo' },
                    { id: 'under2000', label: 'Under $2K/mo' }
                  ].map(price => (
                    <button
                      key={price.id}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        filters.priceRange === price.id 
                          ? 'bg-teal-500 text-white shadow-md hover:bg-teal-600' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => toggleFilter('priceRange', price.id)}
                    >
                      {price.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Space Type */}
              <div>
                <h3 className="label text-slate-800 mb-4">Space Type</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'all', label: 'All Types', icon: Building2 },
                    { id: 'digital', label: 'Digital', icon: Lightning },
                    { id: 'outdoor', label: 'Outdoor', icon: Eye },
                    { id: 'retail', label: 'Retail', icon: Building2 },
                    { id: 'transit', label: 'Transit', icon: Navigation },
                    { id: 'indoor', label: 'Indoor', icon: Monitor }
                  ].map(type => (
                    <button
                      key={type.id}
                      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                        filters.spaceType === type.id 
                          ? 'bg-teal-500 text-white shadow-md hover:bg-teal-600' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => toggleFilter('spaceType', type.id)}
                    >
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <h3 className="label text-slate-800 mb-4">Target Audience</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'all', label: 'Everyone', icon: Users },
                    { id: 'families', label: 'Families', icon: Users },
                    { id: 'professionals', label: 'Professionals', icon: Target },
                    { id: 'commuters', label: 'Commuters', icon: Navigation }
                  ].map(audience => (
                    <button
                      key={audience.id}
                      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                        filters.audience === audience.id 
                          ? 'bg-teal-500 text-white shadow-md hover:bg-teal-600' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => toggleFilter('audience', audience.id)}
                    >
                      <audience.icon className="w-4 h-4" />
                      {audience.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="label text-slate-800 mb-4">Features</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'verified', label: 'Verified Owner', icon: CheckCircle },
                    { id: 'high_traffic', label: 'High Traffic', icon: TrendingUp },
                    { id: 'premium', label: 'Premium Location', icon: Star },
                    { id: 'digital', label: 'Digital Display', icon: Lightning }
                  ].map(feature => (
                    <button
                      key={feature.id}
                      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                        filters.features.includes(feature.id) 
                          ? 'bg-teal-500 text-white shadow-md hover:bg-teal-600' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => toggleFeature(feature.id)}
                    >
                      <feature.icon className="w-4 h-4" />
                      {feature.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-8">
              <button 
                onClick={clearFilters}
                className="btn-secondary btn-small"
              >
                Clear All
              </button>
              
              <div className="flex items-center gap-4">
                <span className="body-small text-slate-600">
                  {filteredSpaces.length} space{filteredSpaces.length !== 1 ? 's' : ''} found
                </span>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="btn-primary"
                >
                  Show Results
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}