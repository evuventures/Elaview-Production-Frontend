// src/pages/bookings/BookingsPage.tsx - Redesigned with Real Cloudinary Upload
import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Building2, Clock, DollarSign, 
  Eye, Plus, Loader2, AlertCircle, CheckCircle, XCircle, 
  RefreshCw, ExternalLink, MessageSquare, Target, TrendingUp,
  Upload, FileImage, Video, File, Trash2, Download, Zap,
  BarChart3, Briefcase, CreditCard, Settings, Info
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Booking {
  id: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: string;
  isPaid: boolean;
  createdAt: string;
  properties?: {
    id: string;
    title: string;
    city: string;
    address: string;
  };
  campaigns?: {
    id: string;
    title: string;
  };
  advertising_areas?: {
    id: string;
    name: string;
    city: string;
  };
  invoices?: {
    id: string;
    amount: number;
    status: string;
    dueDate: string;
  }[];
}

interface Creative {
  id: string;
  name: string;
  type: string;
  url: string;
  cloudinaryPublicId: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  status: string;
  createdAt: string;
}

interface StatItem {
  icon: any;
  value: string | number;
  label: string;
  color: string;
}

const BookingsPage: React.FC = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  
  // Cloudinary configuration
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dmcpnvut8';
  const CLOUDINARY_UPLOAD_PRESET = 'elaview_creatives'; // You'll need to create this preset
  
  // Image requirements for large format displays
  const MIN_WIDTH = 1920;  // Minimum width for quality
  const MIN_HEIGHT = 1080; // Minimum height for quality  
  const RECOMMENDED_WIDTH = 3000; // Recommended for large format
  const RECOMMENDED_HEIGHT = 2000; // Recommended for large format
  const MIN_FILE_SIZE = 500 * 1024; // 500KB minimum
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB maximum
  
  // State management
  const [activeTab, setActiveTab] = useState<'bookings' | 'campaigns' | 'creatives' | 'analytics' | 'payments' | 'profile'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalSpent: '0 (needs data)',
    activeCampaigns: '0 (needs data)',
    totalImpressions: '0 (needs data)',
    avgROI: '0 (needs data)'
  });

  // File upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null); // Clear any previous errors
    try {
      // TODO: Replace with real API calls
      const mockBookings: Booking[] = [];
      const mockCreatives: Creative[] = [];

      setBookings(mockBookings);
      setCreatives(mockCreatives);
    } catch (error) {
      console.error('❌ Failed to load data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Buyer tab options
  const getTabOptions = () => {
    return [
      { value: 'bookings', label: 'Active Campaigns', icon: Calendar },
      { value: 'creatives', label: 'Creative Assets', icon: FileImage },
      { value: 'campaigns', label: 'Campaign Analytics', icon: BarChart3 },
      { value: 'analytics', label: 'Performance Metrics', icon: TrendingUp },
      { value: 'payments', label: 'Billing & Payments', icon: CreditCard },
      { value: 'profile', label: 'Advertiser Profile', icon: Settings }
    ];
  };

  // ✅ Buyer stats
  const getDisplayStats = (): StatItem[] => {
    return [
      { icon: DollarSign, value: `$${dashboardStats.totalSpent.toLocaleString()}`, label: 'Total Spent', color: 'text-blue-400' },
      { icon: Zap, value: dashboardStats.activeCampaigns, label: 'Active Campaigns', color: 'text-lime-400' },
      { icon: Target, value: `${dashboardStats.totalImpressions.toLocaleString()}`, label: 'Total Impressions', color: 'text-purple-400' },
      { icon: TrendingUp, value: dashboardStats.avgROI, label: 'Average ROI', color: 'text-cyan-400' }
    ];
  };

  // File upload handlers with Cloudinary integration
  const validateImage = (file: File): Promise<{ isValid: boolean; error?: string; dimensions?: { width: number; height: number } }> => {
    return new Promise((resolve) => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        resolve({ isValid: false, error: 'Only image files are allowed' });
        return;
      }

      // Check file size
      if (file.size < MIN_FILE_SIZE) {
        resolve({ isValid: false, error: `File too small. Minimum size: ${formatFileSize(MIN_FILE_SIZE)}` });
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        resolve({ isValid: false, error: `File too large. Maximum size: ${formatFileSize(MAX_FILE_SIZE)}` });
        return;
      }

      // Check image dimensions
      const img = new Image();
      img.onload = () => {
        if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
          resolve({ 
            isValid: false, 
            error: `Image resolution too low. Minimum: ${MIN_WIDTH}x${MIN_HEIGHT}px. Current: ${img.width}x${img.height}px` 
          });
          return;
        }

        resolve({ 
          isValid: true, 
          dimensions: { width: img.width, height: img.height } 
        });
      };

      img.onerror = () => {
        resolve({ isValid: false, error: 'Invalid image file' });
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const uploadToCloudinary = async (file: File, onProgress: (progress: number) => void): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve({ success: true, data: response });
          } else {
            resolve({ success: false, error: `Upload failed: ${xhr.statusText}` });
          }
        });

        xhr.addEventListener('error', () => {
          resolve({ success: false, error: 'Network error during upload' });
        });

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
        xhr.send(formData);
      });
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setError(null); // Clear any previous errors
    
    Array.from(files).forEach(async (file) => {
      const fileId = `${Date.now()}-${file.name}`;
      
      try {
        // Initialize progress
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        // Validate image
        const validation = await validateImage(file);
        if (!validation.isValid) {
          setError(validation.error || 'Invalid image');
          setUploadProgress(prev => {
            const updated = { ...prev };
            delete updated[fileId];
            return updated;
          });
          return;
        }

        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(file, (progress) => {
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        });

        if (uploadResult.success && uploadResult.data) {
          // Create creative entry
          const newCreative: Creative = {
            id: fileId,
            name: file.name,
            type: 'image',
            url: uploadResult.data.secure_url,
            cloudinaryPublicId: uploadResult.data.public_id,
            size: file.size,
            dimensions: validation.dimensions!,
            status: 'pending',
            createdAt: new Date().toISOString()
          };

          // Save to backend
          await saveCreativeToBackend(newCreative);
          
          setCreatives(prev => [newCreative, ...prev]);
          console.log('✅ Image uploaded successfully:', uploadResult.data.secure_url);
        } else {
          setError(uploadResult.error || 'Upload failed');
        }
      } catch (error) {
        console.error('❌ Upload error:', error);
        setError(error instanceof Error ? error.message : 'Upload failed');
      } finally {
        // Remove progress indicator
        setUploadProgress(prev => {
          const updated = { ...prev };
          delete updated[fileId];
          return updated;
        });
      }
    });
  };

  const saveCreativeToBackend = async (creative: Creative) => {
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:5000/api/creatives', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: creative.name,
          type: creative.type,
          url: creative.url,
          publicId: creative.cloudinaryPublicId,
          size: creative.size,
          width: creative.dimensions.width,
          height: creative.dimensions.height,
          status: creative.status
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save creative to database');
      }

      console.log('✅ Creative saved to database');
    } catch (error) {
      console.error('❌ Failed to save creative:', error);
      // Don't throw error here, as the upload to Cloudinary was successful
    }
  };

  const deleteCreative = async (creative: Creative) => {
    try {
      // Delete from Cloudinary
      const token = await getToken();
      await fetch(`http://localhost:5000/api/creatives/${creative.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Remove from local state
      setCreatives(prev => prev.filter(c => c.id !== creative.id));
      console.log('✅ Creative deleted');
    } catch (error) {
      console.error('❌ Failed to delete creative:', error);
      setError('Failed to delete creative');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    return <FileImage className="w-5 h-5" />;
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'bookings':
        return (
          <div className="space-y-4">
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50 transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white">{booking.properties?.title}</h4>
                          <p className="text-sm text-gray-400">{booking.properties?.city}</p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-600/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Active Campaigns</h3>
                <p className="text-gray-400 mb-6">Start advertising by booking your first space</p>
                <Button
                  asChild
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold"
                >
                  <Link to="/browse">
                    <Plus className="w-4 h-4 mr-2" />
                    Browse Advertising Spaces
                  </Link>
                </Button>
              </div>
            )}
          </div>
        );

      case 'creatives':
        return (
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <Alert className="border-red-600 bg-red-900/20">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Upload Requirements Info */}
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-300 mb-2">Image Requirements for Large Format Display</h4>
                  <div className="text-sm text-blue-200 space-y-1">
                    <p>• <strong>Minimum:</strong> {MIN_WIDTH}x{MIN_HEIGHT}px ({formatFileSize(MIN_FILE_SIZE)}+)</p>
                    <p>• <strong>Recommended:</strong> {RECOMMENDED_WIDTH}x{RECOMMENDED_HEIGHT}px+ for best quality</p>
                    <p>• <strong>Formats:</strong> JPG, PNG, GIF only</p>
                    <p>• <strong>Max Size:</strong> {formatFileSize(MAX_FILE_SIZE)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-blue-400 bg-blue-400/10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
            >
              <div className="w-16 h-16 bg-gray-600/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Upload High-Quality Images</h3>
              <p className="text-gray-400 mb-4">
                Drag and drop your high-resolution images here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Perfect for large format displays • Minimum {MIN_WIDTH}x{MIN_HEIGHT}px
              </p>
              <Button
                onClick={() => document.getElementById('file-input')?.click()}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Images
              </Button>
              <input
                id="file-input"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Uploading...</h4>
                {Object.entries(uploadProgress).map(([fileId, progress]) => (
                  <div key={fileId} className="bg-gray-700/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">{fileId.split('-').slice(1).join('-')}</span>
                      <span className="text-sm text-gray-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Creative Assets List */}
            {creatives.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Your Creative Assets</h4>
                <div className="grid grid-cols-1 gap-3">
                  {creatives.map((creative) => (
                    <Card key={creative.id} className="bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50 transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-gray-600/50 rounded-lg overflow-hidden flex items-center justify-center">
                              {creative.url.startsWith('http') ? (
                                <img 
                                  src={creative.url} 
                                  alt={creative.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FileImage className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-white">{creative.name}</p>
                              <p className="text-sm text-gray-400">
                                {formatFileSize(creative.size)} • {creative.dimensions.width}x{creative.dimensions.height}px
                              </p>
                              <p className="text-xs text-gray-500">
                                {creative.dimensions.width >= RECOMMENDED_WIDTH && creative.dimensions.height >= RECOMMENDED_HEIGHT 
                                  ? '✅ Excellent for large format' 
                                  : '⚡ Good quality'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(creative.status)}>
                              {creative.status.toUpperCase()}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-gray-300 border-gray-600"
                              onClick={() => window.open(creative.url, '_blank')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-gray-300 border-gray-600"
                              onClick={() => window.open(creative.url, '_blank')}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-400 border-gray-600 hover:bg-red-500/20"
                              onClick={() => deleteCreative(creative)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-600/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileImage className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Creative Assets Yet</h3>
                <p className="text-gray-400">Upload your first high-quality image to get started</p>
              </div>
            )}
          </div>
        );

      case 'campaigns':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-600/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Campaign Analytics (COMING SOON)</h3>
            <p className="text-gray-400 mb-6">Track performance, impressions, and ROI for your campaigns</p>
            {/* <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Analytics
            </Button> */}
          </div>
        );

      case 'analytics':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-600/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Performance Metrics (COMING SOON)</h3>
            <p className="text-gray-400 mb-6">Detailed analytics and performance insights</p>
            
          </div>
        );

      case 'payments':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-600/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Billing & Payments (COMING SOON)</h3>
            <p className="text-gray-400 mb-6">Manage payment methods, invoices, and billing history</p>
            
          </div>
        );

      case 'profile':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-600/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Advertiser Profile (COMING SOON)</h3>
            <p className="text-gray-400 mb-6">Manage your business information and preferences</p>
            {/* <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold">
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button> */}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-gray-400">Loading your campaigns...</p>
        </div>
      </div>
    );
  }

  const displayStats = getDisplayStats();
  const tabOptions = getTabOptions();

  return (
    <div className="bg-gray-900 text-white flex gap-6 p-6 overflow-hidden" style={{ height: 'calc(100vh - 75px)' }}>
      
      {/* ✅ LEFT BOX: Header + Metrics */}
      <div className="w-1/2 h-full bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 flex flex-col">
        
        {/* ✅ HEADER */}
        <div className="flex-shrink-0 flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Manage your Content</h1>
              <p className="text-gray-400">Track campaigns and upload creatives.</p>
            </div>
          </div>
          
          {/* Quick Action */}
          <Button
            asChild
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold"
          >
            <Link to="/browse">
              <Plus className="w-4 h-4 mr-2" />
              Book New Space
            </Link>
          </Button>
        </div>

        {/* ✅ METRICS SECTION */}
        <div className="flex-1 flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6">Campaign Overview</h2>
          
          <div className="space-y-4 flex-1">
            {displayStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:bg-gray-700/50 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-600/50 rounded-xl flex items-center justify-center">
                      <IconComponent className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ✅ RIGHT HALF: Content Area */}
      <div className="w-1/2 flex flex-col pl-3">
        <div className="h-full bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden flex flex-col">
          
          {/* ✅ DROPDOWN HEADER */}
          <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Campaign Management</h2>
              
              {/* ✅ DROPDOWN SELECTOR */}
              <select 
                value={activeTab} 
                onChange={(e) => setActiveTab(e.target.value as any)}
                className="w-64 bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {tabOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ✅ CONTENT AREA */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;