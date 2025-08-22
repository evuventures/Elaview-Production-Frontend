// src/pages/home/MobileHomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { 
  MapPin, 
  MessageSquare, 
  Search, 
  Plus, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Settings,
  ChevronRight,
  Store,
  BarChart3,
  Bell,
  Star
} from 'lucide-react';
import apiClient from '@/api/apiClient';

const MobileHomePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [userPreference, setUserPreference] = useState('ADVERTISER');
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // ✅ Load user preference and dashboard data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('📱 Loading mobile home data...');
        
        const [profileResponse, notificationsResponse] = await Promise.all([
          apiClient.getUserProfile(),
          apiClient.getUnreadNotifications()
        ]);

        if (profileResponse.success) {
          const preference = profileResponse.data.preferredView || 'ADVERTISER';
          setUserPreference(preference);
          
          // Load appropriate dashboard data
          const dashboardResponse = preference === 'SPACE_OWNER' 
            ? await apiClient.getSpaceOwnerDashboard()
            : await apiClient.getAdvertiserDashboard();
            
          setDashboardData(dashboardResponse.data);
        }

        if (notificationsResponse.success) {
          setNotifications(notificationsResponse.data.notifications || []);
        }
        
      } catch (error) {
        console.error('❌ Error loading mobile home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // ✅ Switch between advertiser and space owner views
  const handleViewSwitch = async (newView) => {
    try {
      console.log('🔄 Switching view to:', newView);
      
      const response = await apiClient.updateUser(user.id, {
        preferredView: newView
      });
      
      if (response.success) {
        setUserPreference(newView);
        
        // Reload dashboard data for new view
        const dashboardResponse = newView === 'SPACE_OWNER' 
          ? await apiClient.getSpaceOwnerDashboard()
          : await apiClient.getAdvertiserDashboard();
          
        setDashboardData(dashboardResponse.data);
      }
    } catch (error) {
      console.error('❌ Error switching view:', error);
    }
  };

  // ✅ Quick action handlers
  const quickActions = {
    advertiser: [
      {
        icon: Search,
        label: 'Browse Spaces',
        action: () => navigate('/browse'),
        color: 'bg-blue-500'
      },
      {
        icon: Plus,
        label: 'Create Campaign',
        action: () => navigate('/create-campaign'),
        color: 'bg-green-500'
      },
      {
        icon: BarChart3,
        label: 'My Campaigns',
        action: () => navigate('/advertise'),
        color: 'bg-purple-500'
      },
      {
        icon: MessageSquare,
        label: 'Messages',
        action: () => navigate('/messages'),
        color: 'bg-orange-500'
      }
    ],
    spaceOwner: [
      {
        icon: Plus,
        label: 'List New Space',
        action: () => navigate('/list-space'),
        color: 'bg-green-500'
      },
      {
        icon: Store,
        label: 'My Properties',
        action: () => navigate('/property-management'),
        color: 'bg-blue-500'
      },
      {
        icon: Calendar,
        label: 'Bookings',
        action: () => navigate('/booking-management'),
        color: 'bg-purple-500'
      },
      {
        icon: MessageSquare,
        label: 'Messages',
        action: () => navigate('/messages'),
        color: 'bg-orange-500'
      }
    ]
  };

  const currentActions = userPreference === 'SPACE_OWNER' ? quickActions.spaceOwner : quickActions.advertiser;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mobile-nav-full-spacing">
      {/* ✅ Header Section */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName || 'there'}!
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {userPreference === 'SPACE_OWNER' ? 'Managing your properties' : 'Finding advertising opportunities'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {notifications.length > 0 && (
              <button 
                onClick={() => navigate('/notifications')}
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              </button>
            )}
            <button 
              onClick={() => navigate('/settings')}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ✅ View Switcher */}
        <div className="bg-gray-100 p-1 rounded-lg flex">
          <button
            onClick={() => handleViewSwitch('ADVERTISER')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              userPreference === 'ADVERTISER'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Advertiser
          </button>
          <button
            onClick={() => handleViewSwitch('SPACE_OWNER')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              userPreference === 'SPACE_OWNER'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            <Store className="w-4 h-4 inline mr-2" />
            Space Owner
          </button>
        </div>
      </div>

      {/* ✅ Dashboard Stats */}
      {dashboardData && (
        <div className="px-4 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            {userPreference === 'SPACE_OWNER' ? (
              <>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${dashboardData.stats?.totalRevenue || 0}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Listings</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {dashboardData.stats?.activeListings || 0}
                      </p>
                    </div>
                    <Store className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold text-purple-600">
                        ${dashboardData.stats?.totalSpent || 0}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Campaigns</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {dashboardData.stats?.activeCampaigns || 0}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ✅ Quick Actions */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {currentActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all touch-target"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-900">{action.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ✅ Recent Activity */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <button 
            onClick={() => navigate(userPreference === 'SPACE_OWNER' ? '/dashboard' : '/advertise')}
            className="text-blue-600 text-sm font-medium"
          >
            View All
          </button>
        </div>
        
        <div className="space-y-3">
          {dashboardData?.bookings?.slice(0, 3).map((booking, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{booking.property?.title || 'Booking'}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'CONFIRMED' 
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                    <span className="ml-2 font-semibold text-gray-900">
                      ${booking.totalAmount}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          )) || (
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-500">No recent activity</p>
              <button
                onClick={() => navigate('/browse')}
                className="mt-2 text-blue-600 font-medium"
              >
                Get started
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Bottom Spacing for Mobile Navigation */}
      <div className="h-24"></div>
    </div>
  );
};

export default MobileHomePage;