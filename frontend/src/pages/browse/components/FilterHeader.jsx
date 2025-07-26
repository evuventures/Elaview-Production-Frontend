// import React from 'react';
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Filter, ShoppingCart } from "lucide-react";

// export default function FilterHeader({ 
//   filteredSpaces, 
//   activeFiltersCount, 
//   setShowFilters, 
//   cart, 
//   setShowCart, 
//   filters, 
//   clearFilters 
// }) {
//   return (
//     <div className="py-2 px-6 bg-gray-500 text-gray-900 flex-shrink-0">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">
//             Advertising Spaces
//           </h1>
//           <p className="text-gray-400 text-sm">
//             {filteredSpaces.length} spaces available • Orange County, CA
//           </p>
//         </div>
        
//         <div className="flex items-center gap-2">
//           {/* Filter Button */}
//           <Button 
//             onClick={() => setShowFilters(true)}
//             variant="outline"
//             size="sm"
//             className={`bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white ${
//               activeFiltersCount > 0 ? 'ring-1 ring-lime-400 text-lime-400' : ''
//             }`}
//           >
//             <Filter className="w-4 h-4 mr-1" />
//             Filters
//             {activeFiltersCount > 0 && (
//               <Badge className="ml-2 bg-lime-400 text-gray-900 text-xs">
//                 {activeFiltersCount}
//               </Badge>
//             )}
//           </Button>
          
//           {/* Cart Button */}
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => setShowCart(true)}
//             className={`bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white relative ${
//               cart.length > 0 ? 'ring-1 ring-lime-400 text-lime-400' : ''
//             }`}
//           >
//             <ShoppingCart className="w-4 h-4 mr-1" />
//             Cart
//             {cart.length > 0 && (
//               <Badge className="ml-2 bg-lime-400 text-gray-900 text-xs">
//                 {cart.length}
//               </Badge>
//             )}
//           </Button>
//         </div>
//       </div>

//       {/* Active Filters Display */}
//       {activeFiltersCount > 0 && (
//         <div className="flex items-center gap-2 mb-4">
//           <span className="text-sm text-gray-400">Active filters:</span>
//           {filters.priceRange !== 'all' && (
//             <Badge 
//               variant="secondary" 
//               className="bg-lime-400/20 text-lime-400 border-lime-400/30"
//             >
//               {filters.priceRange.replace('under', 'Under $').replace('500', '500/mo').replace('1000', '1K/mo').replace('2000', '2K/mo')}
//             </Badge>
//           )}
//           {filters.spaceType !== 'all' && (
//             <Badge 
//               variant="secondary" 
//               className="bg-lime-400/20 text-lime-400 border-lime-400/30"
//             >
//               {filters.spaceType.charAt(0).toUpperCase() + filters.spaceType.slice(1)}
//             </Badge>
//           )}
//           {filters.audience !== 'all' && (
//             <Badge 
//               variant="secondary" 
//               className="bg-lime-400/20 text-lime-400 border-lime-400/30"
//             >
//               {filters.audience.charAt(0).toUpperCase() + filters.audience.slice(1)}
//             </Badge>
//           )}
//           {filters.features.map(feature => (
//             <Badge 
//               key={feature}
//               variant="secondary" 
//               className="bg-lime-400/20 text-lime-400 border-lime-400/30"
//             >
//               {feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
//             </Badge>
//           ))}
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={clearFilters}
//             className="text-gray-400 hover:text-white h-6 px-2"
//           >
//             Clear all
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }