// src/pages/dashboard/components/property/PropertyCard.tsx
import React from 'react';
import { Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Property } from '../../types';

interface PropertyCardProps {
 property: Property;
 onView?: (propertyId: string) => void;
 onEdit?: (propertyId: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
 property,
 onView,
 onEdit
}) => {
 return (
 <div className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-4 hover:bg-gray-700/50 transition-all duration-300">
 <div className="flex items-start justify-between mb-3">
 <div className="flex-1">
 <h3 className="font-semibold text-white">{property.name}</h3>
 <p className="text-sm text-gray-400">{property.address}</p>
 {property.createdDate && (
 <p className="text-xs text-gray-500 mt-1">
 Created {new Date(property.createdDate).toLocaleDateString()}
 </p>
 )}
 </div>
 <Badge 
 variant={property.status === 'active' ? 'default' : 'secondary'} 
 className={property.status === 'active' ? 'bg-lime-400 text-gray-900' : 'bg-gray-600 text-gray-300'}
>
 {property.status}
 </Badge>
 </div>
 
 <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
 <div>
 <span className="text-gray-400 block">Ad Spaces</span>
 <span className="font-semibold text-white">{property.spacesCount}</span>
 </div>
 <div>
 <span className="text-gray-400 block">Bookings</span>
 <span className="font-semibold text-white">{property.activeBookings}</span>
 </div>
 </div>

 {(property.monthlyEarnings> 0 || property.totalEarnings> 0) && (
 <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
 <div>
 <span className="text-gray-400 block">Monthly</span>
 <span className="font-semibold text-lime-400">${property.monthlyEarnings.toLocaleString()}</span>
 </div>
 <div>
 <span className="text-gray-400 block">Total</span>
 <span className="font-semibold text-lime-400">${property.totalEarnings.toLocaleString()}</span>
 </div>
 </div>
 )}

 <div className="flex gap-2">
 <Button 
 variant="outline" 
 size={20} 
 className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
 onClick={() => onView?.(property.id)}
>
 <Eye className="w-3 h-3 mr-1" />
 View
 </Button>
 <Button 
 variant="outline" 
 size={20} 
 className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
 onClick={() => onEdit?.(property.id)}
>
 <Edit className="w-3 h-3 mr-1" />
 Edit
 </Button>
 </div>
 </div>
 );
};