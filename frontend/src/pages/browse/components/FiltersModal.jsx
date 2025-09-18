import React, { useState, useEffect } from 'react';
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
 // Local editable string state for price boxes (allows clearing input fully)
 const [minInput, setMinInput] = useState(String(filters.priceMin ?? 0));
 const [maxInput, setMaxInput] = useState(String(filters.priceMax ?? 2000));
 const [editingMin, setEditingMin] = useState(false);
 const [editingMax, setEditingMax] = useState(false);

 // Sync with external changes (e.g., slider drag or histogram click)
 useEffect(() => {
 if (!editingMin) setMinInput(String(filters.priceMin ?? 0));
 if (!editingMax) setMaxInput(String(filters.priceMax ?? 2000));
 }, [filters.priceMin, filters.priceMax, editingMin, editingMax]);

 const commitMin = () => {
 setEditingMin(false);
 if (minInput === '') return; // keep previous if empty
 const parsed = parseInt(minInput, 10);
 if (!isNaN(parsed)) {
 const clamped = Math.max(0, Math.min(parsed, filters.priceMax ?? 2000));
 setPriceRange(clamped, filters.priceMax ?? 2000);
 } else {
 setMinInput(String(filters.priceMin ?? 0));
 }
 };

 const commitMax = () => {
 setEditingMax(false);
 if (maxInput === '') return; // keep previous if empty
 const parsed = parseInt(maxInput, 10);
 if (!isNaN(parsed)) {
 const clamped = Math.min(2000, Math.max(parsed, filters.priceMin ?? 0));
 setPriceRange(filters.priceMin ?? 0, clamped);
 } else {
 setMaxInput(String(filters.priceMax ?? 2000));
 }
 };
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
 {priceHistogram && priceHistogram.length> 0 && (
 <div className="w-full h-24 flex items-end gap-1 px-1 bg-gradient-to-t from-slate-50 to-transparent rounded-sm">
 {(() => {
 const maxCount = Math.max(...priceHistogram.map(b => b.count || 0), 1);
 return priceHistogram.map((bin, idx) => {
 const active = (filters.priceMin ?? 0) <= bin.max && (filters.priceMax ?? 2000)>= bin.min;
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
 className={`flex-1 rounded-[3px] cursor-pointer transition-colors duration-150 hover:shadow-sm ${active ? 'bg-blue-500/80 hover:bg-blue-500 outline outline-1 outline-blue-500/40' : 'bg-slate-300 hover:bg-slate-400'} `}
 style={{ height: `${Math.max(10, heightPct)}%`, minHeight: '10%' }}
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
 <Slider.Range className="absolute bg-blue-500 rounded-full h-2" />
 <Slider.Thumb className="block w-5 h-5 bg-blue-500 rounded-full shadow" />
 <Slider.Thumb className="block w-5 h-5 bg-blue-500 rounded-full shadow" />
 </Slider.Root>
 <div className="flex justify-between text-xs text-slate-500 mt-1">
 <span>$0</span>
 <span>$2000+</span>
 </div>
 <div className="mt-3 flex flex-col items-center gap-3">
 <div className="flex items-center gap-6">
 <div className="flex flex-col items-center">
 <label className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Min</label>
 <input
 type="text"
 inputMode="numeric"
 value={minInput}
 onFocus={() => setEditingMin(true)}
 onChange={(e) => {
 const val = e.target.value.replace(/[^0-9]/g, '');
 setMinInput(val);
 }}
 onBlur={commitMin}
 onKeyDown={(e) => { if (e.key === 'Enter') { commitMin(); e.currentTarget.blur(); } }}
 placeholder="—"
 className="w-32 text-center px-3 py-2 rounded-lg border border-slate-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
 style={{ MozAppearance: 'textfield' }}
 />
 </div>
 <span className="text-slate-400 font-medium">—</span>
 <div className="flex flex-col items-center">
 <label className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Max</label>
 <input
 type="text"
 inputMode="numeric"
 value={maxInput}
 onFocus={() => setEditingMax(true)}
 onChange={(e) => {
 const val = e.target.value.replace(/[^0-9]/g, '');
 setMaxInput(val);
 }}
 onBlur={commitMax}
 onKeyDown={(e) => { if (e.key === 'Enter') { commitMax(); e.currentTarget.blur(); } }}
 placeholder="—"
 className="w-32 text-center px-3 py-2 rounded-lg border border-slate-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
 style={{ MozAppearance: 'textfield' }}
 />
 </div>
 </div>
 <p className="text-xs text-slate-500">Leave blank temporarily to retype a value.</p>
 </div>
 </div>
 </div>

 {/* Space Type */}
 <div>
 <h3 className="label text-slate-800 mb-4">Space Type</h3>
 <div className="flex flex-wrap gap-3">
 {[
 { id: 'all', label: 'All Types', icon: Building2 },
 { id: 'retail', label: 'Window', icon: Building2 },
 { id: 'exteriorwall', label: 'Exterior Wall', icon: Eye },
 { id: 'digital', label: 'Digital', icon: Lightning }
 ].map(type => (
 <button
 key={type.id}
 className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
 filters.spaceType === type.id 
 ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600' 
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
 className="px-4 py-2.5 rounded-md text-[13px] font-semibold flex items-center gap-2 bg-blue-500 text-white shadow hover:shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400/70 focus:ring-offset-1 transition"
>
 <span>Show Results</span>
 <span className="inline-flex items-center justify-center text-[9px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full tracking-wide min-w-[24px]">
 {filteredSpaces.length}
 </span>
 </button>
 </div>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 );
}