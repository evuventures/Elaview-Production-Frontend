// src/components/dashboard/KPIMetrics.jsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

// Type assertions for JSX components (maintaining consistency with Dashboard)
const CardComponent = Card;
const CardContentComponent = CardContent;

// Animation variants for consistent motion design
const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 staggerChildren: 0.1,
 delayChildren: 0.1,
 },
 },
};

const itemVariants = {
 hidden: { y: 20, opacity: 0 },
 visible: {
 y: 0,
 opacity: 1,
 transition: {
 type: 'spring',
 stiffness: 100,
 }
 },
};

/**
 * KPIMetrics Component - Displays key performance indicators in a responsive grid
 * @param {Array} kpiData - Array of KPI objects with label, value, change, trend, icon, color, and urgent properties
 * @param {string} className - Additional CSS classes (optional)
 */
export default function KPIMetrics({ kpiData = [], className = "" }) {
 if (!kpiData || kpiData.length === 0) {
 return null;
 }

 return (
 <motion.div
 className={`grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 md:gap-4 ${className}`}
 variants={containerVariants}
 initial="hidden"
 animate="visible"
>
 {kpiData.map((metric, index) => {
 const IconComponent = metric.icon;
 
 return (
 <motion.div key={index} variants={itemVariants}>
 <CardComponent 
 className={`card-brand backdrop-blur-xl rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-brand hover:-translate-y-1 ${
 metric.urgent ? 'ring-2 ring-amber-400 dark:ring-amber-500' : ''
 }`}
>
 <CardContentComponent className="p-3 md:p-4">
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
 {metric.label}
 </span>
 {metric.urgent && (
 <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
 )}
 </div>
 
 <div className="flex items-baseline justify-between">
 <span className="text-lg md:text-2xl font-bold text-foreground">
 {metric.value}
 </span>
 
 <div className={`flex items-center text-xs font-semibold ${
 metric.trend === 'up' 
 ? 'text-emerald-600 dark:text-emerald-400' 
 : metric.trend === 'down' 
 ? 'text-red-600 dark:text-red-400' 
 : 'text-gray-500 dark:text-gray-400'
 }`}>
 {metric.trend === 'up' && <ArrowUpRight className="w-3 h-3 mr-1" />}
 {metric.trend === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
 <span>{metric.change}</span>
 </div>
 </div>
 </CardContentComponent>
 </CardComponent>
 </motion.div>
 );
 })}
 </motion.div>
 );
}