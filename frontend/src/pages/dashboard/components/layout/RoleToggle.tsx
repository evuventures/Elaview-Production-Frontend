// src/pages/dashboard/components/layout/RoleToggle.tsx
import React from 'react';
import type { UserRole } from '../../types';

interface RoleToggleProps {
  userRole: UserRole;
  canSwitchRoles: boolean;
  onRoleChange: (role: UserRole) => void;
}

export const RoleToggle: React.FC<RoleToggleProps> = ({ 
  userRole, 
  canSwitchRoles, 
  onRoleChange 
}) => {
  if (!canSwitchRoles) return null;

  return (
    <div className="flex items-center justify-center lg:justify-end">
      <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-1">
        <button
          onClick={() => onRoleChange('advertiser')}
          className={`px-3 py-1 rounded text-sm font-medium transition-all ${
            userRole === 'advertiser' 
              ? 'bg-lime-400 text-gray-900' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Advertiser
        </button>
        <button
          onClick={() => onRoleChange('property_owner')}
          className={`px-3 py-1 rounded text-sm font-medium transition-all ${
            userRole === 'property_owner' 
              ? 'bg-cyan-400 text-gray-900' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Property Owner
        </button>
      </div>
    </div>
  );
};