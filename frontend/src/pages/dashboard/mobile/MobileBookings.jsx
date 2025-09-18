// src/pages/dashboard/mobile/MobileBookings.jsx
// ✅ MOBILE BOOKINGS: Booking management for space owners
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import {
 Calendar, Clock, CheckCircle, AlertCircle, DollarSign, MapPin,
 Truck, Package, Phone, Mail, Eye, MoreVertical, Filter,
 Building2, User, Star, TrendingUp, Download, FileText,
 ChevronRight, ArrowUp, ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/api/apiClient';

const MobileBookings = () => {
 const navigate = useNavigate();
 const { isSignedIn } = useAuth();
 const [bookings, setBookings] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState(null);
 const [selectedBooking, setSelectedBooking] = useState(null);
 const [showActionMenu, setShowActionMenu] = useState(false);
 const [filter, setFilter] = useState('all'); // all, active, pending_install, materials_shipped, completed
 const [sortBy, setSortBy] = useState('date_desc'); // date_desc, date_asc, amount_desc, amount_asc

 // Color scheme verification
 useEffect(() => {
 console.log('🎨 MOBILE BOOKINGS: Color scheme verification', {
 primaryBlue: '#4668AB',
 whiteBackground: '#FFFFFF',
 offWhiteCards: '#F9FAFB',
 lightGrayBorders: '#E5E7EB',
 timestamp: new Date().toISOString()
 });
 }, []);

 // Fetch bookings data
 useEffect(() => {
 if (isSignedIn) {
 fetchBookingsData();
 }
 }, [isSignedIn]);

 const fetchBookingsData = async () => {
 setIsLoading(true);
 setError(null);
 
 try {
 console.log('🔄 Mobile Bookings: Fetching bookings data...');
 
 // Simulate API delay
 await new Promise(resolve => setTimeout(resolve, 1500));
 
 // Mock bookings data
 setBookings([
 {
 id: '1',
 advertiserName: 'Tech Startup Inc.',
 advertiserEmail: 'campaigns@techstartup.com',
 advertiserPhone: '+1 (555) 123-4567',
 spaceName: 'Downtown Billboard #1',
 spaceLocation: '123 Main St, Downtown',
 startDate: '2025-01-15',
 endDate: '2025-02-15',
 totalAmount: 3200,
 status: 'pending_install',
 campaignName: 'Q1 Product Launch',
 bookingDate: '2025-01-10',
 paymentStatus: 'paid',
 installationDate: '2025-01-14',
 materials: ['Banner Print', 'Mounting Hardware'],
 rating: null,
 notes: 'Installation scheduled for early morning to minimize traffic disruption'
 },
 {
 id: '2',
 advertiserName: 'Fashion Brand Co.',
 advertiserEmail: 'marketing@fashionbrand.com',
 advertiserPhone: '+1 (555) 987-6543',
 spaceName: 'Mall Display Screen',
 spaceLocation: 'Central Mall, Level 2',
 startDate: '2025-01-10',
 endDate: '2025-01-31',
 totalAmount: 1800,
 status: 'active',
 campaignName: 'Winter Collection',
 bookingDate: '2025-01-05',
 paymentStatus: 'paid',
 installationDate: '2025-01-09',
 materials: ['Digital Assets'],
 rating: 4.8,
 notes: 'Campaign performing well, advertiser very satisfied'
 },
 {
 id: '3',
 advertiserName: 'Local Restaurant',
 advertiserEmail: 'owner@localrestaurant.com',
 advertiserPhone: '+1 (555) 456-7890',
 spaceName: 'Street Banner Location',
 spaceLocation: '456 Oak Avenue',
 startDate: '2025-01-20',
 endDate: '2025-02-20',
 totalAmount: 950,
 status: 'materials_shipped',
 campaignName: 'Grand Opening',
 bookingDate: '2025-01-12',
 paymentStatus: 'paid',
 installationDate: '2025-01-19',
 materials: ['Vinyl Banner', 'Installation Kit'],
 rating: null,
 notes: 'Materials shipped via FedEx, tracking: 123456789'
 },
 {
 id: '4',
 advertiserName: 'Real Estate Agency',
 advertiserEmail: 'ads@realestate.com',
 advertiserPhone: '+1 (555) 321-0987',
 spaceName: 'Downtown Billboard #1',
 spaceLocation: '123 Main St, Downtown',
 startDate: '2024-12-01',
 endDate: '2024-12-31',
 totalAmount: 2400,
 status: 'completed',
 campaignName: 'Holiday Home Sales',
 bookingDate: '2024-11-25',
 paymentStatus: 'paid',
 installationDate: '2024-11-30',
 materials: ['Weather Resistant Banner'],
 rating: 4.6,
 notes: 'Successful campaign, generated strong leads for client'
 },
 {
 id: '5',
 advertiserName: 'Fitness Center',
 advertiserEmail: 'marketing@fitnesscenter.com',
 advertiserPhone: '+1 (555) 654-3210',
 spaceName: 'Rooftop LED Display',
 spaceLocation: 'Business District Tower',
 startDate: '2025-02-01',
 endDate: '2025-03-01',
 totalAmount: 4500,
 status: 'confirmed',
 campaignName: 'New Year Memberships',
 bookingDate: '2025-01-08',
 paymentStatus: 'pending',
 installationDate: '2025-01-31',
 materials: ['Digital Content Package'],
 rating: null,
 notes: 'Awaiting final payment before installation'
 }
 ]);
 
 console.log('✅ Mobile Bookings: Data loaded successfully');
 
 } catch (err) {
 console.error('❌ Mobile Bookings: Error loading data:', err);
 setError('Failed to load bookings data. Please try again.');
 } finally {
 setIsLoading(false);
 }
 };

 // Filter and sort bookings
 const filteredAndSortedBookings = bookings
 .filter(booking => {
 if (filter === 'all') return true;
 return booking.status === filter;
 })
 .sort((a, b) => {
 switch (sortBy) {
 case 'date_desc':
 return new Date(b.startDate) - new Date(a.startDate);
 case 'date_asc':
 return new Date(a.startDate) - new Date(b.startDate);
 case 'amount_desc':
 return b.totalAmount - a.totalAmount;
 case 'amount_asc':
 return a.totalAmount - b.totalAmount;
 default:
 return 0;
 }
 });

 // Get status badge
 const getStatusBadge = (status, paymentStatus) => {
 const badges = {
 'pending_install': {
 color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
 icon: Clock,
 text: 'Awaiting Installation'
 },
 'active': {
 color: 'bg-green-100 text-green-700 border-green-200',
 icon: CheckCircle,
 text: 'Campaign Active'
 },
 'materials_shipped': {
 color: 'bg-blue-100 text-blue-700 border-blue-200',
 icon: Truck,
 text: 'Materials In Transit'
 },
 'completed': {
 color: 'bg-gray-100 text-gray-700 border-gray-200',
 icon: CheckCircle,
 text: 'Completed'
 },
 'confirmed': {
 color: 'bg-purple-100 text-purple-700 border-purple-200',
 icon: Calendar,
 text: paymentStatus === 'pending' ? 'Payment Pending' : 'Confirmed'
 }
 };
 
 const badge = badges[status] || badges['confirmed'];
 return (
 <Badge className={`${badge.color} text-xs`}>
 <badge.icon className="w-3 h-3 mr-1" />
 {badge.text}
 </Badge>
 );
 };

 // Calculate revenue summary
 const revenueSummary = {
 total: bookings.reduce((sum, booking) => sum + booking.totalAmount, 0),
 pending: bookings.filter(b => b.paymentStatus === 'pending').reduce((sum, booking) => sum + booking.totalAmount, 0),
 thisMonth: bookings.filter(b => {
 const bookingMonth = new Date(b.startDate).getMonth();
 const currentMonth = new Date().getMonth();
 return bookingMonth === currentMonth;
 }).reduce((sum, booking) => sum + booking.totalAmount, 0)
 };

 // Booking Card Component
 const BookingCard = ({ booking, index }) => (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.1 }}
 className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative"
>
 {/* Header */}
 <div className="flex items-start justify-between mb-3">
 <div className="flex-1">
 <h3 className="text-lg font-bold text-gray-900 mb-1">{booking.campaignName}</h3>
 <p className="text-sm text-gray-600">{booking.advertiserName}</p>
 </div>
 <div className="flex items-center gap-2">
 {getStatusBadge(booking.status, booking.paymentStatus)}
 <button
 onClick={() => {
 setSelectedBooking(booking);
 setShowActionMenu(true);
 }}
 className="p-1 rounded-lg hover:bg-gray-100 transition-all"
>
 <MoreVertical className="w-4 h-4 text-gray-400" />
 </button>
 </div>
 </div>

 {/* Space Info */}
 <div className="flex items-center text-sm text-gray-600 mb-3">
 <MapPin className="w-4 h-4 mr-2" />
 <span className="truncate">{booking.spaceName} • {booking.spaceLocation}</span>
 </div>

 {/* Date Range */}
 <div className="flex items-center text-sm text-gray-600 mb-3">
 <Calendar className="w-4 h-4 mr-2" />
 <span>
 {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
 </span>
 </div>

 {/* Amount */}
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center text-lg font-bold text-gray-900">
 <DollarSign className="w-5 h-5 mr-1" />
 <span>${booking.totalAmount.toLocaleString()}</span>
 </div>
 {booking.rating && (
 <div className="flex items-center">
 <Star className="w-4 h-4 text-yellow-400 mr-1" />
 <span className="text-sm font-medium text-gray-700">{booking.rating}</span>
 </div>
 )}
 </div>

 {/* Actions */}
 <div className="flex gap-2">
 <button
 onClick={() => navigate(`/bookings/${booking.id}`)}
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
 onClick={() => window.open(`mailto:${booking.advertiserEmail}`, '_blank')}
 className="flex-1 py-2 px-3 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-all duration-200"
>
 <Mail className="w-4 h-4 mr-1 inline" />
 Contact
 </button>
 </div>

 {/* Notes */}
 {booking.notes && (
 <div className="mt-3 p-3 bg-gray-50 rounded-lg">
 <p className="text-xs text-gray-600">{booking.notes}</p>
 </div>
 )}
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
 {showActionMenu && selectedBooking && (
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
 <h3 className="text-lg font-bold text-gray-900 mb-4">{selectedBooking.campaignName}</h3>
 
 <div className="space-y-3">
 <button
 onClick={() => {
 navigate(`/bookings/${selectedBooking.id}`);
 setShowActionMenu(false);
 }}
 className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all"
>
 <Eye className="w-5 h-5 text-gray-600 mr-3" />
 <span className="font-medium text-gray-900">View Full Details</span>
 </button>
 
 <button
 onClick={() => {
 window.open(`mailto:${selectedBooking.advertiserEmail}`, '_blank');
 setShowActionMenu(false);
 }}
 className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all"
>
 <Mail className="w-5 h-5 text-gray-600 mr-3" />
 <span className="font-medium text-gray-900">Send Email</span>
 </button>
 
 <button
 onClick={() => {
 window.open(`tel:${selectedBooking.advertiserPhone}`, '_blank');
 setShowActionMenu(false);
 }}
 className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all"
>
 <Phone className="w-5 h-5 text-gray-600 mr-3" />
 <span className="font-medium text-gray-900">Call Advertiser</span>
 </button>
 
 <button
 onClick={() => {
 console.log('Download contract for booking:', selectedBooking.id);
 setShowActionMenu(false);
 }}
 className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all"
>
 <Download className="w-5 h-5 text-gray-600 mr-3" />
 <span className="font-medium text-gray-900">Download Contract</span>
 </button>
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
 <p className="text-gray-600 font-medium">Loading your bookings...</p>
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
 onClick={fetchBookingsData}
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
 {/* Header with Revenue Summary */}
 <div>
 <div className="flex items-center justify-between mb-4">
 <div>
 <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
 <p className="text-gray-600 mt-1">{bookings.length} total bookings</p>
 </div>
 <div 
 className="p-2 rounded-lg"
 style={{ backgroundColor: '#4668AB15' }}
>
 <Calendar className="w-6 h-6" style={{ color: '#4668AB' }} />
 </div>
 </div>

 {/* Revenue Cards */}
 <div className="grid grid-cols-3 gap-3 mb-4">
 <div className="bg-white p-3 rounded-xl border border-gray-100">
 <p className="text-lg font-bold text-gray-900">${revenueSummary.total.toLocaleString()}</p>
 <p className="text-xs text-gray-600">Total Revenue</p>
 </div>
 <div className="bg-white p-3 rounded-xl border border-gray-100">
 <p className="text-lg font-bold text-gray-900">${revenueSummary.thisMonth.toLocaleString()}</p>
 <p className="text-xs text-gray-600">This Month</p>
 </div>
 <div className="bg-white p-3 rounded-xl border border-gray-100">
 <p className="text-lg font-bold text-gray-900">${revenueSummary.pending.toLocaleString()}</p>
 <p className="text-xs text-gray-600">Pending</p>
 </div>
 </div>
 </div>

 {/* Filter Tabs */}
 <div className="flex gap-2 overflow-x-auto pb-2">
 <FilterButton 
 value="all" 
 label="All" 
 count={bookings.length}
 />
 <FilterButton 
 value="active" 
 label="Active" 
 count={bookings.filter(b => b.status === 'active').length}
 />
 <FilterButton 
 value="pending_install" 
 label="Pending" 
 count={bookings.filter(b => b.status === 'pending_install').length}
 />
 <FilterButton 
 value="materials_shipped" 
 label="Shipping" 
 count={bookings.filter(b => b.status === 'materials_shipped').length}
 />
 <FilterButton 
 value="completed" 
 label="Completed" 
 count={bookings.filter(b => b.status === 'completed').length}
 />
 </div>

 {/* Bookings List */}
 {filteredAndSortedBookings.length> 0 ? (
 <div className="space-y-4">
 {filteredAndSortedBookings.map((booking, index) => (
 <BookingCard key={booking.id} booking={booking} index={index} />
 ))}
 </div>
 ) : (
 <div className="text-center py-12">
 <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 {filter === 'all' ? 'No bookings yet' : `No ${filter.replace('_', ' ')} bookings`}
 </h3>
 <p className="text-gray-600 mb-6">
 {filter === 'all' 
 ? 'Once advertisers book your spaces, you\'ll see them here.'
 : `You don't have any ${filter.replace('_', ' ')} bookings at the moment.`
 }
 </p>
 {filter === 'all' && (
 <Link
 to="/spaces"
 className="px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity inline-flex items-center"
 style={{ backgroundColor: '#4668AB' }}
>
 <Building2 className="w-5 h-5 mr-2" />
 View Your Spaces
 </Link>
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

export default MobileBookings;