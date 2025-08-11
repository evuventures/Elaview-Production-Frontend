import React from 'react';
import * as Slider from '@radix-ui/react-slider';
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
  filteredSpaces,
  setPriceRange,
  priceHistogram, // distribution of all spaces
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
                {/* Histogram + range slider */}
                <div className="flex flex-col gap-3">
                  {/* Interactive histogram similar to Airbnb price filter */}
                  {priceHistogram && priceHistogram.length > 0 && (
                    <div className="w-full h-20 flex items-end gap-1 px-1">
                      {(() => {
                        const maxCount = Math.max(...priceHistogram.map(b => b.count || 0), 1);
                        return priceHistogram.map((bin, idx) => {
                          const active = (filters.priceMin ?? 0) <= bin.max && (filters.priceMax ?? 2000) >= bin.min;
                          const heightPct = (bin.count / maxCount) * 100;
                          return (
                            <div
                              key={idx}
                              title={`${bin.min}-${bin.max === Infinity ? '+' : bin.max} (${bin.count})`}
                              onClick={() => {
                                const newMin = bin.min;
                                const newMax = bin.max === Infinity ? 2000 : bin.max;
                                setPriceRange(newMin, newMax);
                              }}
                              className={`flex-1 rounded-sm cursor-pointer transition-colors duration-150 ${active ? 'bg-teal-500/80 hover:bg-teal-500' : 'bg-slate-300 hover:bg-slate-400'}`}
                              style={{ height: `${Math.max(8, heightPct)}%` }}
                            />
                          );
                        });
                      })()}
                    </div>
                  )}
                  {/* Range slider and min/max inputs using global filter state */}
                  <Slider.Root
                    className="relative flex items-center select-none touch-none w-full h-8"
                    min={0}
                    max={2000}
                    step={10}
                    value={[
                      filters.priceMin ?? 0,
                      filters.priceMax ?? 2000
                    ]}
                    onValueChange={([min, max]) => setPriceRange(min, max)}
                  >
                    <Slider.Track className="bg-slate-200 relative grow rounded-full h-2" />
                    <Slider.Range className="absolute bg-teal-500 rounded-full h-2" />
                    <Slider.Thumb className="block w-5 h-5 bg-teal-500 rounded-full shadow" />
                    <Slider.Thumb className="block w-5 h-5 bg-teal-500 rounded-full shadow" />
                  </Slider.Root>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>$0</span>
                    <span>$2000+</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <input
                      type="number"
                      min={0}
                      max={filters.priceMax ?? 2000}
                      value={filters.priceMin ?? 0}
                      onChange={e => {
                        const raw = Number(e.target.value);
                        const min = isNaN(raw) ? 0 : raw;
                        setPriceRange(min, filters.priceMax ?? 2000);
                      }}
                      className="w-20 px-2 py-1 border rounded text-sm"
                      placeholder="Min"
                    />
                    <span className="text-slate-400">to</span>
                    <input
                      type="number"
                      min={filters.priceMin ?? 0}
                      max={2000}
                      value={filters.priceMax ?? 2000}
                      onChange={e => {
                        const raw = Number(e.target.value);
                        const max = isNaN(raw) ? (filters.priceMax ?? 2000) : raw;
                        setPriceRange(filters.priceMin ?? 0, max);
                      }}
                      className="w-20 px-2 py-1 border rounded text-sm"
                      placeholder="Max"
                    />
                  </div>
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