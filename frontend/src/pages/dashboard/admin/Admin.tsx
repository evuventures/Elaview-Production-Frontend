// src/pages/dashboard/admin/Admin.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, Building2, Calendar, FileText, 
  TrendingUp, DollarSign, Shield, Settings,
  ChevronRight, AlertCircle, CheckCircle,
  Package, Truck, UserPlus, Menu, X,
  BarChart3, Database, Activity
} from 'lucide-react';
import apiClient from '@/api/apiClient';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

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

  const sidebarSections = [
    {
      title: 'Core Platform',
      items: [
        {
          title: 'User Management',
          description: 'View and manage all platform users',
          icon: Users,
          link: '/admin/users',
          color: 'text-blue-600',
          hoverColor: 'hover:bg-blue-50'
        },
        {
          title: 'Properties',
          description: 'Review and approve property listings',
          icon: Building2,
          link: '/admin/properties',
          color: 'text-green-600',
          hoverColor: 'hover:bg-green-50'
        },
        {
          title: 'Bookings',
          description: 'Monitor all platform bookings',
          icon: Calendar,
          link: '/admin/bookings',
          color: 'text-purple-600',
          hoverColor: 'hover:bg-purple-50'
        }
      ]
    },
    {
      title: 'Material Sourcing',
      items: [
        {
          title: 'Material Catalog',
          description: 'Manage materials, suppliers, and pricing',
          icon: Package,
          link: '/admin/materials/catalog',
          color: 'text-indigo-600',
          hoverColor: 'hover:bg-indigo-50'
        },
        {
          title: 'Material Orders',
          description: 'Process dropshipping and order fulfillment',
          icon: Truck,
          link: '/admin/materials/orders',
          color: 'text-pink-600',
          hoverColor: 'hover:bg-pink-50'
        },
        {
          title: 'Client Onboarding',
          description: 'Manually set up new clients and spaces',
          icon: UserPlus,
          link: '/admin/clients/onboard',
          color: 'text-teal-600',
          hoverColor: 'hover:bg-teal-50'
        }
      ]
    },
    {
      title: 'Analytics & System',
      items: [
        {
          title: 'Reports & Analytics',
          description: 'View platform statistics and reports',
          icon: BarChart3,
          link: '/admin/reports',
          color: 'text-orange-600',
          hoverColor: 'hover:bg-orange-50'
        },
        {
          title: 'Data Management',
          description: 'Seed database and manage test data',
          icon: Database,
          link: '/data-seeder',
          color: 'text-amber-600',
          hoverColor: 'hover:bg-amber-50'
        },
        {
          title: 'System Settings',
          description: 'Configure platform settings',
          icon: Settings,
          link: '/admin/settings',
          color: 'text-gray-600',
          hoverColor: 'hover:bg-gray-50'
        },
        {
          title: 'Activity Logs',
          description: 'View system and user activity logs',
          icon: Activity,
          link: '/admin/logs',
          color: 'text-red-600',
          hoverColor: 'hover:bg-red-50'
        }
      ]
    }
  ];

  const quickStats = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      change: stats?.recentUsers || 0,
      changeLabel: 'new this week',
      color: 'text-blue-600'
    },
    {
      label: 'Active Properties',
      value: stats?.totalProperties || 0,
      icon: Building2,
      change: 0,
      changeLabel: 'pending approval',
      color: 'text-green-600'
    },
    {
      label: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: Calendar,
      change: stats?.recentBookings || 0,
      changeLabel: 'this week',
      color: 'text-purple-600'
    },
    {
      label: 'Active Campaigns',
      value: stats?.totalCampaigns || 0,
      icon: TrendingUp,
      change: 0,
      changeLabel: 'running',
      color: 'text-orange-600'
    }
  ];

  const isActiveLink = (link: string) => {
    return location.pathname === link;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar placeholder */}
        <div className="w-80 bg-white border-r border-gray-200">
          <div className="animate-pulse p-6">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main content placeholder */}
        <div className="flex-1 p-6">
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {sidebarSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item, itemIndex) => (
                    <Link
                      key={itemIndex}
                      to={item.link}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                        ${isActiveLink(item.link) 
                          ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-600' 
                          : `text-gray-700 ${item.hoverColor}`
                        }
                      `}
                    >
                      <item.icon className={`
                        flex-shrink-0 w-5 h-5 mr-3 transition-colors
                        ${isActiveLink(item.link) ? 'text-purple-600' : item.color}
                      `} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {item.description}
                        </div>
                      </div>
                      {!isActiveLink(item.link) && (
                        <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome to the Elaview admin control panel</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
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

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/admin/clients/onboard"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 group"
              >
                <UserPlus className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="font-semibold text-blue-900">Onboard Client</div>
                  <div className="text-sm text-blue-700">Set up new client</div>
                </div>
              </Link>
              
              <Link
                to="/admin/materials/catalog"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200 group"
              >
                <Package className="w-8 h-8 text-indigo-600" />
                <div>
                  <div className="font-semibold text-indigo-900">Manage Materials</div>
                  <div className="text-sm text-indigo-700">Update catalog</div>
                </div>
              </Link>
              
              <Link
                to="/admin/reports"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all duration-200 group"
              >
                <BarChart3 className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="font-semibold text-orange-900">View Reports</div>
                  <div className="text-sm text-orange-700">Analytics & insights</div>
                </div>
              </Link>
              
              <Link
                to="/data-seeder"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg hover:from-amber-100 hover:to-amber-200 transition-all duration-200 group"
              >
                <Database className="w-8 h-8 text-amber-600" />
                <div>
                  <div className="font-semibold text-amber-900">Seed Data</div>
                  <div className="text-sm text-amber-700">Manage test data</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Admin access configured</p>
                  <p className="text-xs text-gray-600">You now have full admin privileges</p>
                </div>
                <span className="text-xs text-gray-500">Just now</span>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <Package className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Material sourcing system ready</p>
                  <p className="text-xs text-gray-600">All admin pages for material management are now available</p>
                </div>
                <span className="text-xs text-gray-500">System</span>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">No pending approvals</p>
                  <p className="text-xs text-gray-600">All property listings are up to date</p>
                </div>
                <span className="text-xs text-gray-500">System</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}