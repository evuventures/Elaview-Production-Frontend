// src/pages/dashboard/admin/Admin.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Building2, Calendar, FileText, 
  TrendingUp, DollarSign, Shield, Settings,
  ChevronRight, AlertCircle, CheckCircle,
  Package, Truck, UserPlus
} from 'lucide-react';
import apiClient from '@/api/apiClient';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      console.log('📊 Fetching admin statistics...');
      const response = await apiClient.get('/users/admin/stats');
      
      if (response.success) {
        setStats(response.data);
        console.log('✅ Admin stats loaded:', response.data);
      }
    } catch (error) {
      console.error('❌ Failed to fetch admin stats:', error);
      // Set mock data for now
      setStats({
        totalUsers: 1,
        totalProperties: 0,
        totalBookings: 0,
        totalCampaigns: 0,
        recentUsers: 1,
        recentBookings: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const adminSections = [
    // ✅ CORE PLATFORM MANAGEMENT
    {
      title: 'User Management',
      description: 'View and manage all platform users',
      icon: Users,
      link: '/admin/users',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Property Approvals',
      description: 'Review and approve property listings',
      icon: Building2,
      link: '/admin/properties',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Booking Oversight',
      description: 'Monitor all platform bookings',
      icon: Calendar,
      link: '/admin/bookings',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    
    // ✅ MATERIAL SOURCING MANAGEMENT
    {
      title: 'Material Catalog',
      description: 'Manage materials, suppliers, and pricing',
      icon: Package,
      link: '/admin/materials/catalog',
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700'
    },
    {
      title: 'Material Orders',
      description: 'Process dropshipping and order fulfillment',
      icon: Truck,
      link: '/admin/materials/orders',
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700'
    },
    {
      title: 'Client Onboarding',
      description: 'Manually set up new clients and spaces',
      icon: UserPlus,
      link: '/admin/clients/onboard',
      color: 'bg-teal-500',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-700'
    },
    
    // ✅ ANALYTICS & REPORTING
    {
      title: 'Reports & Analytics',
      description: 'View platform statistics and reports',
      icon: FileText,
      link: '/admin/reports',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    },
    {
      title: 'Data Management',
      description: 'Seed database and manage test data',
      icon: TrendingUp,
      link: '/data-seeder',
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50', 
      textColor: 'text-amber-700'
    }
  ];

  const quickStats = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      change: stats?.recentUsers || 0,
      changeLabel: 'new this week'
    },
    {
      label: 'Active Properties',
      value: stats?.totalProperties || 0,
      icon: Building2,
      change: 0,
      changeLabel: 'pending approval'
    },
    {
      label: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: Calendar,
      change: stats?.recentBookings || 0,
      changeLabel: 'this week'
    },
    {
      label: 'Active Campaigns',
      value: stats?.totalCampaigns || 0,
      icon: TrendingUp,
      change: 0,
      changeLabel: 'running'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Welcome to the Elaview admin control panel</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500">{stat.changeLabel}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              {stat.change > 0 && (
                <p className="text-xs text-green-600 mt-2">+{stat.change} new</p>
              )}
            </div>
          ))}
        </div>

        {/* Admin Sections - Updated to show 3 columns for better layout */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Management Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {adminSections.map((section, index) => (
            <Link
              key={index}
              to={section.link}
              className="group bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${section.bgColor}`}>
                    <section.icon className={`w-6 h-6 ${section.textColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-gray-700">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {section.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Access Links Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/admin/users"
              className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Users</span>
            </Link>
            <Link
              to="/admin/properties"
              className="flex items-center gap-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Building2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Properties</span>
            </Link>
            <Link
              to="/admin/materials/catalog"
              className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Package className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">Materials</span>
            </Link>
            <Link
              to="/admin/materials/orders"
              className="flex items-center gap-2 p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
            >
              <Truck className="w-4 h-4 text-pink-600" />
              <span className="text-sm font-medium text-pink-700">Orders</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Admin access configured</p>
                <p className="text-xs text-gray-600">You now have full admin privileges</p>
              </div>
              <span className="text-xs text-gray-500">Just now</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Material sourcing system ready</p>
                <p className="text-xs text-gray-600">All admin pages for material management are now available</p>
              </div>
              <span className="text-xs text-gray-500">System</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">No pending approvals</p>
                <p className="text-xs text-gray-600">All property listings are up to date</p>
              </div>
              <span className="text-xs text-gray-500">System</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4">
          <Link
            to="/admin/settings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Platform Settings
          </Link>
          <Link
            to="/admin/clients/onboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Onboard Client
          </Link>
          <Link
            to="/admin/materials/catalog"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Package className="w-4 h-4" />
            Manage Materials
          </Link>
          <Link
            to="/admin/logs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            View Logs
          </Link>
        </div>
      </div>
    </div>
  );
}