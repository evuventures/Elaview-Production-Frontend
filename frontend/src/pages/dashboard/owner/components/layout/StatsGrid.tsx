// src/pages/dashboard/components/layout/StatsGrid.tsx
import React from 'react';
import { motion } from 'framer-motion';
import type { StatItem } from '../../types';

interface StatsGridProps {
 stats: StatItem[];
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
 return (
 <motion.div 
 initial={{ opacity: 0, y: 20 }} 
 animate={{ opacity: 1, y: 0 }} 
 transition={{ duration: 0.5, delay: 0.1 }}
>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
 {stats.map((stat, index) => (
 <motion.div 
 key={index} 
 whileHover={{ scale: 1.02, y: -5 }} 
 className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl"
>
 <div className="p-4 md:p-6 text-center">
 <stat.icon className={`w-6 h-6 md:w-8 md:h-8 ${stat.color} mx-auto mb-3`} />
 <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
 <div className="text-sm text-gray-400">{stat.label}</div>
 </div>
 </motion.div>
 ))}
 </div>
 </motion.div>
 );
};