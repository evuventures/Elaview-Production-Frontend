import React from 'react';
import { MapPin } from 'lucide-react';
import { SpaceSearchCardProps } from '../types';

export const SpaceSearchCard: React.FC<SpaceSearchCardProps> = ({ space, onSelect }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
      <img 
        src={space.imageUrl || 'https://via.placeholder.com/300x200'} 
        alt={space.name || 'Space'}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">
          {space.name || 'Space Name'}
        </h3>
        <p className="text-sm text-gray-600 mb-3 flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {space.location || 'Location'}
        </p>
        
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Dimensions:</span>
            <span className="font-medium">{space.dimensions || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Space Rental:</span>
            <span className="font-medium">
              {typeof space.price === 'number' ? `$${space.price}/month` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Est. Materials:</span>
            <span className="font-medium text-blue-600">
              {typeof space.estimatedMaterialCost === 'number' ? `$${space.estimatedMaterialCost}` : 'N/A'}
            </span>
          </div>
          <div className="pt-2 border-t">
            <span className="text-gray-600">Total Estimated:</span>
            <span className="font-bold text-lg text-green-600 float-right">
              {typeof space.price === 'number' && typeof space.estimatedMaterialCost === 'number' 
                ? `$${space.price + space.estimatedMaterialCost}`
                : 'N/A'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <button 
            onClick={() => onSelect(space)}
            className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Book Space + Materials
          </button>
          <button 
            onClick={() => window.location.href = '/browse'}
            className="w-full text-teal-600 hover:text-teal-700 text-sm font-medium"
          >
            View in Browse →
          </button>
        </div>
      </div>
    </div>
  );
};