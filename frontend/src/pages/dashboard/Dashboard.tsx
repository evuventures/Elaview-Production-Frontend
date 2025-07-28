// Enhanced Dashboard Component with Better Visual Design
import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import {
  Loader2, Plus, Eye, Calendar, Clock, 
  DollarSign, TrendingUp, Building2, Home,
  PieChart, CalendarDays, UserCircle, ThumbsUp,
  CreditCard, Receipt, Star, ArrowUp, ArrowDown,
  Users, MapPin, CheckCircle, AlertCircle, FileImage,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EnhancedDashboard() {
  // State management (same as before)
  const [activeTab, setActiveTab] = useState('bookings');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 89750,
    monthlyRevenue: 12500,
    activeProperties: 0,
    pendingBookings: 0,
    occupancyRate: 85,
    monthlyGrowth: 15.2 // New: growth percentage
  });

  // Enhanced metric cards with trends and better visuals - AD SPACE FOCUSED
  const getEnhancedStats = () => {
    return [
      { 
        icon: DollarSign, 
        value: `${dashboardStats.totalRevenue.toLocaleString()}`, 
        label: 'Total Revenue',
        subValue: `${dashboardStats.monthlyRevenue.toLocaleString()} this month`,
        color: 'teal' as const,
        trend: { direction: 'up' as const, value: dashboardStats.monthlyGrowth },
        bgGradient: 'from-teal-50 to-teal-100'
      },
      { 
        icon: Building2, 
        value: '0', // dashboardStats.activeSpaces 
        label: 'Active Ad Spaces',
        subValue: 'Ready for booking',
        color: 'success' as const,
        actionLabel: 'Add Space',
        bgGradient: 'from-green-50 to-green-100'
      },
      { 
        icon: Clock, 
        value: dashboardStats.pendingBookings, 
        label: 'Pending Requests',
        subValue: 'Awaiting response',
        color: 'warning' as const,
        urgent: dashboardStats.pendingBookings > 0,
        bgGradient: 'from-orange-50 to-orange-100'
      },
      { 
        icon: TrendingUp, 
        value: '$2,450', // Average revenue per space
        label: 'Avg Revenue/Space',
        subValue: 'Per month',
        color: 'teal' as const,
        trend: { direction: 'up' as const, value: 8.5 },
        bgGradient: 'from-blue-50 to-blue-100'
      }
    ];
  };

  // Enhanced Empty State Component - Fully Responsive
  interface EnhancedEmptyStateProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    primaryAction: React.ReactNode;
    secondaryAction?: React.ReactNode;
    tips?: string[];
  }

  const EnhancedEmptyState = ({ icon: Icon, title, description, primaryAction, secondaryAction, tips = [] }: EnhancedEmptyStateProps) => (
    <div className="text-center py-4 sm:py-6 lg:py-8 px-2 sm:px-4">
      {/* Icon with animated background */}
      <div className="relative mb-3 sm:mb-4 lg:mb-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto">
          <Icon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-teal-600" />
        </div>
        <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-teal-500 rounded-full flex items-center justify-center">
          <Plus className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 text-white" />
        </div>
      </div>
      
      <h3 className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-semibold text-slate-900 mb-1 sm:mb-2 leading-tight px-2">{title}</h3>
      <p className="text-xs sm:text-sm lg:text-base text-slate-600 mb-3 sm:mb-4 lg:mb-6 max-w-xs sm:max-w-sm mx-auto leading-relaxed px-2">{description}</p>
      
      {/* Action Buttons */}
      <div className="flex flex-col gap-2 sm:gap-3 justify-center mb-4 sm:mb-6 lg:mb-8 px-2">
        <div className="w-full">
          {primaryAction}
        </div>
        {secondaryAction && (
          <div className="w-full">
            {secondaryAction}
          </div>
        )}
      </div>
      
      {/* Tips Section */}
      {tips.length > 0 && (
        <div className="bg-white/40 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 max-w-xs sm:max-w-sm mx-auto border border-white/30">
          <h4 className="text-xs sm:text-sm font-medium text-slate-800 mb-2 sm:mb-3 flex items-center gap-2 justify-center">
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-teal-600 flex-shrink-0" />
            <span className="truncate">Getting Started Tips</span>
          </h4>
          <ul className="space-y-1.5 sm:space-y-2 text-left">
            {tips.map((tip, index) => (
              <li key={index} className="text-xs sm:text-sm text-slate-600 flex items-start gap-2 leading-relaxed">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-teal-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                <span className="break-words">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  // Enhanced Metric Card Component - Fully Responsive, No Overflow
  interface MetricCardProps {
    stat: {
      icon: React.ComponentType<{ className?: string }>;
      value: string | number;
      label: string;
      subValue: string;
      color: 'teal' | 'success' | 'warning';
      trend?: { direction: 'up' | 'down'; value: number };
      actionLabel?: string;
      bgGradient: string;
      urgent?: boolean;
      progress?: number;
    };
  }

  const MetricCard = ({ stat }: MetricCardProps) => {
    const IconComponent = stat.icon;
    const colorClasses = {
      teal: 'text-teal-600',
      success: 'text-green-600', 
      warning: 'text-orange-600'
    };

    return (
      <div className={`bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl p-2 sm:p-3 lg:p-4 hover-lift bg-gradient-to-br ${stat.bgGradient} relative overflow-hidden shadow-lg h-full min-h-0 flex flex-col`}>
        {/* Header with Icon and Trend/Action Button */}
        <div className="flex items-start justify-between mb-2 sm:mb-3 min-h-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/60 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
            <IconComponent className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ${colorClasses[stat.color]}`} />
          </div>
          
          {/* Action Button or Trend Indicator */}
          {stat.actionLabel ? (
            <button className="btn-outline text-xs px-2 py-1 sm:px-2.5 sm:py-1 flex-shrink-0 inline-flex items-center gap-1 hover:scale-105 transition-transform">
              <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">{stat.actionLabel}</span>
            </button>
          ) : stat.trend ? (
            <div className={`flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium flex-shrink-0 ${
              stat.trend.direction === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {stat.trend.direction === 'up' ? 
                <ArrowUp className="w-2 h-2 sm:w-3 sm:h-3" /> : 
                <ArrowDown className="w-2 h-2 sm:w-3 sm:h-3" />
              }
              <span className="text-xs hidden sm:inline">{stat.trend.value}%</span>
            </div>
          ) : null}
        </div>
        
        {/* Content - Flex grow to fill available space */}
        <div className="flex-1 min-h-0">
          <p className="text-xs sm:text-sm text-slate-600 leading-tight mb-1 truncate">{stat.label}</p>
          <p className={`text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold ${colorClasses[stat.color]} leading-tight mb-1 truncate`}>
            {stat.value}
          </p>
          <p className="text-xs text-slate-500 leading-tight truncate">{stat.subValue}</p>
        </div>
        
        {/* Progress Bar for certain metrics */}
        {stat.progress && (
          <div className="mt-2 sm:mt-3">
            <div className="w-full bg-white/40 rounded-full h-1.5 sm:h-2">
              <div 
                className="bg-teal-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                style={{ width: `${stat.progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Urgent Indicator */}
        {stat.urgent && (
          <div className="absolute top-2 right-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'bookings':
        return (
          <EnhancedEmptyState
            icon={Calendar}
            title="No booking requests yet"
            description="Start earning revenue by listing your advertising spaces. Once live, booking requests from advertisers will appear here for your review."
            primaryAction={
              <Link to="/list-space" className="btn-primary px-4 py-2 inline-flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                List Your First Ad Space
              </Link>
            }
            secondaryAction={
              <button className="btn-secondary px-4 py-2 inline-flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                See Examples
              </button>
            }
            tips={[
              "Add high-quality photos of your advertising spaces",
              "Set competitive pricing based on location and visibility", 
              "Specify exact dimensions and display capabilities",
              "Verify space ownership for increased advertiser trust"
            ]}
          />
        );

      case 'creative':
        return (
          <EnhancedEmptyState
            icon={Eye}
            title="Review Creative Assets"
            description="When advertisers submit creative materials for your spaces, you'll review and approve them here to ensure they meet your standards."
            primaryAction={
              <button className="btn-primary px-4 py-2 inline-flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                View Content Guidelines
              </button>
            }
            secondaryAction={
              <button className="btn-secondary px-4 py-2 inline-flex items-center">
                <FileImage className="w-4 h-4 mr-2" />
                Upload Examples
              </button>
            }
            tips={[
              "Set clear content guidelines for your properties",
              "Review materials within 24 hours for best results",
              "Provide feedback to help advertisers improve",
              "Maintain brand standards for your locations"
            ]}
          />
        );

      case 'listings':
        return (
          <EnhancedEmptyState
            icon={Building2}
            title="Start Earning from Your Ad Spaces"
            description="List your advertising spaces to connect with local businesses and startups looking for visibility. Set your own rates and availability."
            primaryAction={
              <Link to="/list-space" className="btn-primary px-4 py-2 inline-flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                List Your First Ad Space
              </Link>
            }
            secondaryAction={
              <button className="btn-secondary px-4 py-2 inline-flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Browse Examples
              </button>
            }
            tips={[
              "Digital displays typically earn $500-2000/month",
              "Storefront windows are popular with local businesses",
              "Vehicle advertising offers flexible scheduling options",
              "High-traffic locations command premium rates"
            ]}
          />
        );

      default:
        return (
          <EnhancedEmptyState
            icon={PieChart}
            title="Space Analytics"
            description="View performance metrics, booking rates, and revenue analytics for your advertising spaces."
            primaryAction={
              <button className="btn-primary px-4 py-2 inline-flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </button>
            }
            secondaryAction={null}
          />
        );
    }
  };

  const tabOptions = [
    { value: 'bookings', label: 'Booking Requests', icon: Calendar },
    { value: 'creative', label: 'Review Creatives', icon: Eye },
    { value: 'listings', label: 'Manage Ad Spaces', icon: Building2 },
    { value: 'analytics', label: 'Space Analytics', icon: PieChart },
    { value: 'calendar', label: 'Availability Calendar', icon: CalendarDays },
    { value: 'payments', label: 'Revenue & Payments', icon: CreditCard },
    { value: 'reviews', label: 'Customer Reviews', icon: ThumbsUp },
    { value: 'profile', label: 'Business Profile', icon: UserCircle }
  ];

  const enhancedStats = getEnhancedStats();

  return (
    <div className="relative p-3 sm:p-6 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Enhanced Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-teal-50 to-white"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-teal-100/30 via-transparent to-slate-100/50"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-slate-200/30 rounded-full blur-3xl"></div>
      
      {/* Content */}
      <div className="relative z-10 h-full">
        <div className="flex flex-col xl:flex-row gap-4 xl:gap-6 h-full max-w-full mx-auto">
        
        {/* LEFT PANEL: Header + Enhanced Metrics - Glassmorphism */}
        <div className="w-full xl:w-[48%] bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-4 sm:p-6 lg:p-8 flex flex-col">
          
          {/* Header */}
          <div className="flex-shrink-0 flex flex-col lg:flex-row lg:items-center justify-between mb-6 pb-4 border-b border-white/30 gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Home className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-slate-900 leading-tight">
                  Ad Space Owner Dashboard
                </h1>
                <p className="text-xs sm:text-sm lg:text-base text-slate-600 leading-tight">
                  Manage your advertising spaces and bookings
                </p>
              </div>
            </div>
            
            <Link to="/list-space" className="btn-primary px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm flex-shrink-0 inline-flex items-center">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">List New Ad Space</span>
              <span className="sm:hidden">List Space</span>
            </Link>
          </div>

          {/* Enhanced Metrics Section - 2x2 Grid */}
          <div className="flex-1 flex flex-col min-h-0">
            
            {/* 2x2 Grid Layout */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-1">
              {enhancedStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="min-h-0" // Ensures proper grid sizing
                >
                  <MetricCard stat={stat} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Content Area - Glassmorphism */}
        <div className="w-full xl:w-[52%] flex flex-col min-h-0">
          <div className="h-full bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl overflow-hidden flex flex-col">
            
            {/* Header with Enhanced Dropdown - Glassmorphism */}
            <div className="flex-shrink-0 p-4 sm:p-6 lg:p-8 pb-4 border-b border-white/30 bg-white/30 backdrop-blur-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900 flex-shrink-0">Ad Space Management</h2>
                
                <div className="relative min-w-0 flex-1 lg:flex-initial">
                  <select 
                    value={activeTab} 
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="form-select w-full lg:w-64 xl:w-72 bg-white border-slate-300 shadow-sm text-xs sm:text-sm"
                  >
                    {tabOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Enhanced Content Area - Glassmorphism */}
            <div className="flex-1 overflow-y-auto scrollbar-hide bg-gradient-to-b from-white/50 to-white/30 backdrop-blur-sm">
              <div className="p-4 sm:p-6 lg:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}