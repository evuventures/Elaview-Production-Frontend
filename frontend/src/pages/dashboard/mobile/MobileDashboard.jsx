// src/pages/dashboard/mobile/MobileDashboard.jsx
// ✅ MOBILE DASHBOARD: Metrics & Recent Activity for space owners
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import {
  DollarSign, Building2, Clock, CheckCircle, TrendingUp, ArrowUp, ArrowDown,
  Activity, Bell, Plus, Eye, ChevronRight, AlertCircle, BarChart3, X,
  MapPin, Calendar, Package, Truck
} from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '@/api/apiClient';

const MobileDashboard = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeListings: 0,
    pendingInstalls: 0,
    completedBookings: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Color scheme verification
  useEffect(() => {
    console.log('🎨 MOBILE DASHBOARD: Color scheme verification', {
      primaryBlue: '#4668AB',
      whiteBackground: '#FFFFFF',
      offWhiteCards: '#F9FAFB',
      lightGrayBorders: '#E5E7EB',
      timestamp: new Date().toISOString()
    });
  }, []);

  // Simulate loading data
  useEffect(() => {
    if (isSignedIn) {
      fetchDashboardData();
    }
  }, [isSignedIn]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Mobile Dashboard: Fetching data...');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful response
      setStats({
        totalRevenue: 2450,
        activeListings: 3,
        pendingInstalls: 2,
        completedBookings: 15
      });
      
      // Mock recent activity
      setRecentActivity([
        {
          id: '1',
          type: 'booking',
          title: 'New booking request received',
          description: 'Tech Startup Inc. wants to book Downtown Billboard #1',
          timestamp: '2 hours ago',
          icon: Calendar,
          color: '#4668AB',
          actionUrl: '/bookings'
        },
        {
          id: '2',
          type: 'install',
          title: 'Installation materials shipped',
          description: 'Materials for Fashion Brand Co. campaign are en route',
          timestamp: '5 hours ago',
          icon: Truck,
          color: '#059669',
          actionUrl: '/bookings'
        },
        {
          id: '3',
          type: 'payment',
          title: 'Payment received',
          description: '$1,200 payment processed for Mall Display Screen',
          timestamp: '1 day ago',
          icon: DollarSign,
          color: '#059669',
          actionUrl: '/invoices'
        },
        {
          id: '4',
          type: 'listing',
          title: 'Space verification completed',
          description: 'Street Banner Location has been verified and approved',
          timestamp: '2 days ago',
          icon: CheckCircle,
          color: '#059669',
          actionUrl: '/spaces'
        },
        {
          id: '5',
          type: 'alert',
          title: 'Campaign ending soon',
          description: 'Local Restaurant campaign ends in 3 days',
          timestamp: '3 days ago',
          icon: AlertCircle,
          color: '#DC2626',
          actionUrl: '/bookings'
        }
      ]);
      
      console.log('✅ Mobile Dashboard: Data loaded successfully');
      
    } catch (err) {
      console.error('❌ Mobile Dashboard: Error loading data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // KPI Metric Card Component
  const MetricCard = ({ title, value, change, trend, icon: Icon, prefix = '', suffix = '', color = '#4668AB' }) => (
    <div 
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {change && (
          <div className={`flex items-center text-sm font-medium ${
            trend === 'up' ? 'text-emerald-600' : 
            trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'up' && <ArrowUp className="w-3 h-3 mr-1" />}
            {trend === 'down' && <ArrowDown className="w-3 h-3 mr-1" />}
            {change}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </h3>
        <p className="text-sm text-gray-600 font-medium">{title}</p>
      </div>
    </div>
  );

  // Activity Item Component
  const ActivityItem = ({ activity, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => navigate(activity.actionUrl)}
      className="flex items-start space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer border border-gray-100"
    >
      <div 
        className="p-2 rounded-lg flex-shrink-0"
        style={{ backgroundColor: `${activity.color}15` }}
      >
        <activity.icon className="w-4 h-4" style={{ color: activity.color }} />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 mb-1">{activity.title}</h4>
        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{activity.timestamp}</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </motion.div>
  );

  // Quick Action Button Component
  const QuickActionButton = ({ title, icon: Icon, onClick, color = '#4668AB' }) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 hover:scale-105"
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
        boxShadow: `0 4px 12px ${color}40`
      }}
    >
      <Icon className="w-6 h-6 text-white mb-2" />
      <span className="text-sm font-semibold text-white">{title}</span>
    </button>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div 
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: '#4668AB', borderTopColor: 'transparent' }}
          />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#4668AB' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-4 right-4 z-50"
        >
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center shadow-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <div className="flex-1">
              <p className="text-green-800 font-medium text-sm">Dashboard updated successfully!</p>
            </div>
            <button onClick={() => setShowSuccessMessage(false)}>
              <X className="w-4 h-4 text-green-600" />
            </button>
          </div>
        </motion.div>
      )}

      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's your overview</p>
          </div>
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: '#4668AB15' }}
          >
            <BarChart3 className="w-6 h-6" style={{ color: '#4668AB' }} />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Total Revenue"
            value={stats.totalRevenue}
            change="+15%"
            trend="up"
            icon={DollarSign}
            prefix="$"
            color="#059669"
          />
          <MetricCard
            title="Active Spaces"
            value={stats.activeListings}
            change="+1"
            trend="up"
            icon={Building2}
            color="#4668AB"
          />
          <MetricCard
            title="Pending Installs"
            value={stats.pendingInstalls}
            change="+2"
            trend="up"
            icon={Clock}
            color="#DC2626"
          />
          <MetricCard
            title="Completed"
            value={stats.completedBookings}
            change="+3"
            trend="up"
            icon={CheckCircle}
            color="#059669"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionButton
              title="Add Space"
              icon={Plus}
              onClick={() => navigate('/list-space')}
              color="#4668AB"
            />
            <QuickActionButton
              title="View Bookings"
              icon={Calendar}
              onClick={() => navigate('/bookings')}
              color="#059669"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            <Link 
              to="/messages" 
              className="text-sm font-semibold hover:underline"
              style={{ color: '#4668AB' }}
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <ActivityItem key={activity.id} activity={activity} index={index} />
            ))}
          </div>
        </div>

        {/* Bottom Spacing for Mobile Nav */}
        <div className="h-6" />
      </div>
    </div>
  );
};

export default MobileDashboard;