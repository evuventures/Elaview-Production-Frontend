// src/pages/dashboard/mobile/MobileSpaces.jsx
// ✅ MOBILE SPACES: Space management for space owners
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import {
 Plus, Building2, CheckCircle, AlertCircle, Eye, Edit3, MapPin,
 DollarSign, Calendar, Star, Settings, Trash2, Camera, Upload,
 TrendingUp, Activity, MoreVertical, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/api/apiClient';

const MobileSpaces = () => {
 const navigate = useNavigate();
 const { isSignedIn } = useAuth();
 const [spaces, setSpaces] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState(null);
 const [selectedSpace, setSelectedSpace] = useState(null);
 const [showActionMenu, setShowActionMenu] = useState(false);
 const [filter, setFilter] = useState('all'); // all, active, pending, inactive

 // Color scheme verification
 useEffect(() => {
 console.log('🎨 MOBILE SPACES: Color scheme verification', {
 primaryBlue: '#4668AB',
 whiteBackground: '#FFFFFF',
 offWhiteCards: '#F9FAFB',
 lightGrayBorders: '#E5E7EB',
 timestamp: new Date().toISOString()
 });
 }, []);

 // Fetch spaces data
 useEffect(() => {
 if (isSignedIn) {
 fetchSpacesData();
 }
 }, [isSignedIn]);

 const fetchSpacesData = async () => {
 setIsLoading(true);
 setError(null);
 
 try {
 console.log('🔄 Mobile Spaces: Fetching spaces data...');
 
 // Simulate API delay
 await new Promise(resolve => setTimeout(resolve, 1500));
 
 // Mock spaces data
 setSpaces([
 {
 id: '1',
 name: 'Downtown Billboard #1',
 type: 'Billboard',
 dimensions: '14x48 ft',
 price: 1200,
 status: 'active',
 verificationBadge: true,
 location: '123 Main St, Downtown',
 images: ['/api/placeholder/400/300'],
 totalBookings: 8,
 monthlyRevenue: 3600,
 rating: 4.8,
 description: 'Prime location billboard with high traffic visibility',
 lastBooked: '2 days ago',
 nextAvailable: '2025-03-01'
 },
 {
 id: '2',
 name: 'Mall Display Screen',
 type: 'Digital Display',
 dimensions: '6x4 ft',
 price: 800,
 status: 'active',
 verificationBadge: true,
 location: 'Central Mall, Level 2',
 images: ['/api/placeholder/400/300'],
 totalBookings: 12,
 monthlyRevenue: 2400,
 rating: 4.6,
 description: 'High-definition digital display in busy shopping area',
 lastBooked: '5 hours ago',
 nextAvailable: '2025-02-15'
 },
 {
 id: '3',
 name: 'Street Banner Location',
 type: 'Banner',
 dimensions: '3x8 ft',
 price: 350,
 status: 'pending_verification',
 verificationBadge: false,
 location: '456 Oak Avenue',
 images: ['/api/placeholder/400/300'],
 totalBookings: 0,
 monthlyRevenue: 0,
 rating: 0,
 description: 'Street-level banner space pending verification',
 lastBooked: 'Never',
 nextAvailable: 'Pending approval'
 },
 {
 id: '4',
 name: 'Rooftop LED Display',
 type: 'LED Display',
 dimensions: '10x20 ft',
 price: 2000,
 status: 'inactive',
 verificationBadge: true,
 location: 'Business District Tower',
 images: ['/api/placeholder/400/300'],
 totalBookings: 3,
 monthlyRevenue: 6000,
 rating: 4.9,
 description: 'Premium rooftop LED display with city views',
 lastBooked: '1 month ago',
 nextAvailable: 'Available now'
 }
 ]);
 
 console.log('✅ Mobile Spaces: Data loaded successfully');
 
 } catch (err) {
 console.error('❌ Mobile Spaces: Error loading data:', err);
 setError('Failed to load spaces data. Please try again.');
 } finally {
 setIsLoading(false);
 }
 };

 // Filter spaces based on status
 const filteredSpaces = spaces.filter(space => {
 if (filter === 'all') return true;
 if (filter === 'active') return space.status === 'active';
 if (filter === 'pending') return space.status === 'pending_verification';
 if (filter === 'inactive') return space.status === 'inactive';
 return true;
 });

 // Get status badge
 const getStatusBadge = (status, verified) => {
 if (status === 'active' && verified) {
 return (
 <Badge className="bg-green-100 text-green-700 border-green-200">
 <CheckCircle className="w-3 h-3 mr-1" />
 Active & Verified
 </Badge>
 );
 } else if (status === 'active' && !verified) {
 return (
 <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
 <AlertCircle className="w-3 h-3 mr-1" />
 Active (Unverified)
 </Badge>
 );
 } else if (status === 'pending_verification') {
 return (
 <Badge className="bg-blue-100 text-blue-700 border-blue-200">
 <Calendar className="w-3 h-3 mr-1" />
 Pending Verification
 </Badge>
 );
 } else if (status === 'inactive') {
 return (
 <Badge className="bg-gray-100 text-gray-700 border-gray-200">
 <Settings className="w-3 h-3 mr-1" />
 Inactive
 </Badge>
 );
 }
 };

 // Space Card Component
 const SpaceCard = ({ space, index }) => (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.1 }}
 className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
>
 {/* Image */}
 <div className="relative h-48 bg-gray-100">
 <img
 src={space.images[0]}
 alt={space.name}
 className="w-full h-full object-cover"
 />
 <div className="absolute top-3 left-3">
 {getStatusBadge(space.status, space.verificationBadge)}
 </div>
 <div className="absolute top-3 right-3">
 <button
 onClick={() => {
 setSelectedSpace(space);
 setShowActionMenu(true);
 }}
 className="p-2 bg-black bg-opacity-30 rounded-full text-white hover:bg-opacity-50 transition-all"
>
 <MoreVertical className="w-4 h-4" />
 </button>
 </div>
 {space.rating> 0 && (
 <div className="absolute bottom-3 left-3 flex items-center bg-black bg-opacity-70 rounded-full px-2 py-1">
 <Star className="w-3 h-3 text-yellow-400 mr-1" />
 <span className="text-white text-xs font-medium">{space.rating}</span>
 </div>
 )}
 </div>

 {/* Content */}
 <div className="p-4">
 <div className="flex items-center justify-between mb-2">
 <h3 className="text-lg font-bold text-gray-900 flex-1">{space.name}</h3>
 {space.verificationBadge && (
 <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
 )}
 </div>
 
 <div className="space-y-2 mb-4">
 <div className="flex items-center text-sm text-gray-600">
 <Building2 className="w-4 h-4 mr-2" />
 <span>{space.type} • {space.dimensions}</span>
 </div>
 <div className="flex items-center text-sm text-gray-600">
 <MapPin className="w-4 h-4 mr-2" />
 <span className="truncate">{space.location}</span>
 </div>
 <div className="flex items-center text-sm text-gray-600">
 <DollarSign className="w-4 h-4 mr-2" />
 <span>${space.price}/month</span>
 </div>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
 <div className="text-center">
 <p className="text-lg font-bold text-gray-900">{space.totalBookings}</p>
 <p className="text-xs text-gray-600">Total Bookings</p>
 </div>
 <div className="text-center">
 <p className="text-lg font-bold text-gray-900">${space.monthlyRevenue.toLocaleString()}</p>
 <p className="text-xs text-gray-600">Monthly Revenue</p>
 </div>
 </div>

 {/* Actions */}
 <div className="flex gap-2">
 <button
 onClick={() => navigate(`/spaces/${space.id}`)}
 className="flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200"
 style={{ 
 backgroundColor: '#4668AB',
 color: 'white'
 }}
>
 <Eye className="w-4 h-4 mr-1 inline" />
 View Details
 </button>
 <button
 onClick={() => navigate(`/spaces/${space.id}/edit`)}
 className="flex-1 py-2 px-3 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-all duration-200"
>
 <Edit3 className="w-4 h-4 mr-1 inline" />
 Edit
 </button>
 </div>
 </div>
 </motion.div>
 );

 // Filter Button Component
 const FilterButton = ({ value, label, count }) => (
 <button
 onClick={() => setFilter(value)}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
 filter === value
 ? 'text-white'
 : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
 }`}
 style={filter === value ? { backgroundColor: '#4668AB' } : {}}
>
 {label} {count !== undefined && `(${count})`}
 </button>
 );

 // Action Menu Modal
 const ActionMenu = () => (
 <AnimatePresence>
 {showActionMenu && selectedSpace && (
 <>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-black bg-opacity-50 z-50"
 onClick={() => setShowActionMenu(false)}
 />
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 20 }}
 className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 z-50"
>
 <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
 <h3 className="text-lg font-bold text-gray-900 mb-4">{selectedSpace.name}</h3>
 
 <div className="space-y-3">
 <button
 onClick={() => {
 navigate(`/spaces/${selectedSpace.id}`);
 setShowActionMenu(false);
 }}
 className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all"
>
 <Eye className="w-5 h-5 text-gray-600 mr-3" />
 <span className="font-medium text-gray-900">View Details</span>
 </button>
 
 <button
 onClick={() => {
 navigate(`/spaces/${selectedSpace.id}/edit`);
 setShowActionMenu(false);
 }}
 className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all"
>
 <Edit3 className="w-5 h-5 text-gray-600 mr-3" />
 <span className="font-medium text-gray-900">Edit Space</span>
 </button>
 
 <button
 onClick={() => {
 navigate(`/spaces/${selectedSpace.id}/photos`);
 setShowActionMenu(false);
 }}
 className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all"
>
 <Camera className="w-5 h-5 text-gray-600 mr-3" />
 <span className="font-medium text-gray-900">Manage Photos</span>
 </button>
 
 <button
 onClick={() => {
 navigate(`/spaces/${selectedSpace.id}/analytics`);
 setShowActionMenu(false);
 }}
 className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all"
>
 <TrendingUp className="w-5 h-5 text-gray-600 mr-3" />
 <span className="font-medium text-gray-900">View Analytics</span>
 </button>
 
 <div className="border-t border-gray-200 pt-3">
 <button
 onClick={() => {
 console.log('Delete space:', selectedSpace.id);
 setShowActionMenu(false);
 }}
 className="w-full flex items-center p-3 rounded-lg hover:bg-red-50 transition-all"
>
 <Trash2 className="w-5 h-5 text-red-600 mr-3" />
 <span className="font-medium text-red-600">Delete Space</span>
 </button>
 </div>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );

 if (isLoading) {
 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
 <div className="text-center">
 <div 
 className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
 style={{ borderColor: '#4668AB', borderTopColor: 'transparent' }}
 />
 <p className="text-gray-600 font-medium">Loading your spaces...</p>
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
 onClick={fetchSpacesData}
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
 <div className="p-4 space-y-6">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold text-gray-900">My Spaces</h1>
 <p className="text-gray-600 mt-1">{spaces.length} spaces • ${spaces.reduce((sum, space) => sum + space.monthlyRevenue, 0).toLocaleString()} monthly revenue</p>
 </div>
 <button
 onClick={() => navigate('/list-space')}
 className="p-3 rounded-xl text-white shadow-lg hover:scale-105 transition-all duration-200"
 style={{ 
 background: 'linear-gradient(135deg, #4668AB 0%, #5B7BC7 100%)',
 boxShadow: '0 4px 16px rgba(70, 104, 171, 0.3)'
 }}
>
 <Plus className="w-6 h-6" />
 </button>
 </div>

 {/* Filter Tabs */}
 <div className="flex gap-2 overflow-x-auto pb-2">
 <FilterButton 
 value="all" 
 label="All Spaces" 
 count={spaces.length}
 />
 <FilterButton 
 value="active" 
 label="Active" 
 count={spaces.filter(s => s.status === 'active').length}
 />
 <FilterButton 
 value="pending" 
 label="Pending" 
 count={spaces.filter(s => s.status === 'pending_verification').length}
 />
 <FilterButton 
 value="inactive" 
 label="Inactive" 
 count={spaces.filter(s => s.status === 'inactive').length}
 />
 </div>

 {/* Spaces Grid */}
 {filteredSpaces.length> 0 ? (
 <div className="space-y-4">
 {filteredSpaces.map((space, index) => (
 <SpaceCard key={space.id} space={space} index={index} />
 ))}
 </div>
 ) : (
 <div className="text-center py-12">
 <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 {filter === 'all' ? 'No spaces yet' : `No ${filter} spaces`}
 </h3>
 <p className="text-gray-600 mb-6">
 {filter === 'all' 
 ? 'Start earning by listing your first advertising space.'
 : `You don't have any ${filter} spaces at the moment.`
 }
 </p>
 {filter === 'all' && (
 <button
 onClick={() => navigate('/list-space')}
 className="px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity inline-flex items-center"
 style={{ backgroundColor: '#4668AB' }}
>
 <Plus className="w-5 h-5 mr-2" />
 List Your First Space
 </button>
 )}
 </div>
 )}

 {/* Bottom Spacing for Mobile Nav */}
 <div className="h-6" />
 </div>

 {/* Action Menu Modal */}
 <ActionMenu />
 </div>
 );
};

export default MobileSpaces;