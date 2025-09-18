// src/pages/dashboard/components/layout/DashboardHeader.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Home, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { RoleToggle } from './RoleToggle';
import type { UserRole } from '../../types';

interface DashboardHeaderProps {
 userRole: UserRole;
 canSwitchRoles: boolean;
 onRoleChange: (role: UserRole) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
 userRole,
 canSwitchRoles,
 onRoleChange
}) => {
 return (
 <motion.div 
 initial={{ opacity: 0, y: -20 }} 
 animate={{ opacity: 1, y: 0 }} 
 transition={{ duration: 0.5 }}
>
 <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-gray-700/50">
 <div className="p-6 md:p-8">
 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
 <div className="flex items-center gap-4">
 <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0 ${
 userRole === 'property_owner' ? 'bg-cyan-400' : 'bg-lime-400'
 }`}>
 {userRole === 'property_owner' ? (
 <Home className="w-6 h-6 md:w-8 md:h-8 text-gray-900" />
 ) : (
 <Megaphone className="w-6 h-6 md:w-8 md:h-8 text-gray-900" />
 )}
 </div>
 <div className="min-w-0">
 <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
 {userRole === 'property_owner' ? 'Property Owner Dashboard' : 'Advertiser Dashboard'}
 </h1>
 <p className="text-gray-400 text-sm md:text-base">
 {userRole === 'property_owner' ? 'Manage your properties and bookings' : 'Track your advertising campaigns'}
 </p>
 </div>
 </div>

 <div className="flex flex-col gap-3 lg:flex-shrink-0">
 <RoleToggle 
 userRole={userRole}
 canSwitchRoles={canSwitchRoles}
 onRoleChange={onRoleChange}
 />

 <div className="flex flex-col sm:flex-row gap-3">
 {userRole === 'advertiser' && (
 <Button
 asChild
 className="bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
>
 <Link to={createPageUrl('Map')}>
 <Plus className="w-4 h-4 mr-2" />
 Find New Spaces
 </Link>
 </Button>
 )}
 {userRole === 'property_owner' && (
 <Button
 asChild
 variant="outline"
 className="border-gray-600 text-gray-300 rounded-xl font-bold hover:bg-gray-700 hover:text-white transition-all duration-300"
>
 <Link to={createPageUrl('CreateProperty')}>
 <Plus className="w-4 h-4 mr-2" />
 List Property
 </Link>
 </Button>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 </motion.div>
 );
};