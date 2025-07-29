import React, { useState } from 'react';
import {
  Plus, Upload, DollarSign, TrendingUp, Target, Zap,
  FileImage, Eye, Download, Trash2, BarChart3
} from 'lucide-react';

// TypeScript interfaces
interface Stat {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  action?: string;
}

interface Creative {
  id: string;
  name: string;
  url: string;
  size: string;
  dimensions: string;
  status: 'approved' | 'pending' | 'rejected';
}

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  primaryAction: React.ReactNode;
}

export default function SimplifiedAdvertiserDashboard() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [isDragging, setIsDragging] = useState(false);
  
  // Core metrics for advertisers
  const stats: Stat[] = [
    {
      icon: DollarSign,
      value: '$2,450',
      label: 'Total Spent',
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      icon: Zap,
      value: '3',
      label: 'Active Campaigns',
      action: 'New Campaign'
    },
    {
      icon: Target,
      value: '125K',
      label: 'Total Impressions',
      change: '+18.7%',
      changeType: 'positive'
    },
    {
      icon: TrendingUp,
      value: '3.2x',
      label: 'Average ROI',
      change: '+5.2%',
      changeType: 'positive'
    }
  ];

  // Mock creative assets
  const [creatives, setCreatives] = useState<Creative[]>([
    {
      id: '1',
      name: 'summer-sale-banner.jpg',
      url: 'https://via.placeholder.com/400x300',
      size: '2.4 MB',
      dimensions: '1920x1080',
      status: 'approved'
    },
    {
      id: '2', 
      name: 'product-showcase.png',
      url: 'https://via.placeholder.com/400x300',
      size: '1.8 MB',
      dimensions: '1920x1080',
      status: 'pending'
    }
  ]);

  const StatCard = ({ stat }: { stat: Stat }) => (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <stat.icon className="w-5 h-5 text-gray-600" />
        </div>
        {stat.action && (
          <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
            {stat.action}
          </button>
        )}
        {stat.change && (
          <span className={`text-sm font-medium ${
            stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}>
            {stat.change}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
        <p className="text-sm text-gray-600">{stat.label}</p>
      </div>
    </div>
  );

  const EmptyState = ({ icon: Icon, title, description, primaryAction }: EmptyStateProps) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">{description}</p>
      {primaryAction}
    </div>
  );

  const handleFileUpload = (files: FileList) => {
    // Simplified upload logic
    Array.from(files).forEach((file: File) => {
      if (file.type.startsWith('image/')) {
        const newCreative: Creative = {
          id: Date.now().toString(),
          name: file.name,
          url: URL.createObjectURL(file),
          size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
          dimensions: '1920x1080', // Would get from actual image
          status: 'pending'
        };
        setCreatives(prev => [newCreative, ...prev]);
      }
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const deleteCreative = (id: string) => {
    setCreatives(prev => prev.filter(c => c.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'campaigns':
        return (
          <EmptyState
            icon={Target}
            title="No active campaigns"
            description="Start advertising by booking your first ad space. Browse available locations and launch your campaign."
            primaryAction={
              <button className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors inline-flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Browse Ad Spaces
              </button>
            }
          />
        );

      case 'creatives':
        return (
          <div className="space-y-6">
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-teal-400 bg-teal-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Creative Assets</h3>
              <p className="text-gray-600 mb-4">
                Drag and drop your images here or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Recommended: 1920x1080px or higher • JPG, PNG, GIF
              </p>
              <button
                onClick={() => document.getElementById('file-input')?.click()}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors inline-flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </button>
              <input
                id="file-input"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Creative Assets List */}
            {creatives.length > 0 ? (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Your Creative Assets</h4>
                <div className="space-y-3">
                  {creatives.map((creative) => (
                    <div key={creative.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={creative.url} 
                              alt={creative.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{creative.name}</p>
                            <p className="text-sm text-gray-600">
                              {creative.size} • {creative.dimensions}px
                            </p>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(creative.status)}`}>
                              {creative.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => window.open(creative.url, '_blank')}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => window.open(creative.url, '_blank')}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteCreative(creative.id)}
                            className="p-2 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={FileImage}
                title="No creative assets yet"
                description="Upload your first creative asset to get started with your advertising campaigns."
                primaryAction={
                  <button 
                    onClick={() => document.getElementById('file-input')?.click()}
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors inline-flex items-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload First Asset
                  </button>
                }
              />
            )}
          </div>
        );

      case 'analytics':
        return (
          <EmptyState
            icon={BarChart3}
            title="No analytics data"
            description="Start a campaign to see performance analytics, impressions, and ROI data here."
            primaryAction={
              <button className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors inline-flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Start First Campaign
              </button>
            }
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Advertising Dashboard</h1>
              <p className="text-gray-600">Manage your campaigns and creative assets</p>
            </div>
            <button 
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Browse Ad Spaces
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="px-6">
              <div className="flex space-x-8">
                {[
                  { id: 'campaigns', label: 'Active Campaigns', icon: Target },
                  { id: 'creatives', label: 'Creative Assets', icon: FileImage },
                  { id: 'analytics', label: 'Analytics', icon: BarChart3 }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}