import React from 'react';
import { StatCardProps } from '../types';
import { getStatCardColorClasses, formatStatValue } from '../utils';

export const StatCard: React.FC<StatCardProps> = ({ 
  icon: Icon, 
  value, 
  label, 
  color, 
  subValue, 
  actionText, 
  onAction 
}) => {
  const colorClasses = getStatCardColorClasses(color);

  // Safety check for value
  const safeValue = value !== null && value !== undefined ? value : 0;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses}`}>
          <Icon className="w-5 h-5" />
        </div>
        {actionText && (
          <button 
            onClick={onAction}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            {actionText}
          </button>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {formatStatValue(safeValue, label)}
      </p>
      <p className="text-sm text-gray-600">{label}</p>
      {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
    </div>
  );
};