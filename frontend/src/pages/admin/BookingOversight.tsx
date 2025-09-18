// src/pages/admin/BookingOversight.tsx
import React, { useState, useEffect } from 'react';
import { 
 Calendar, Search, Filter, ChevronLeft, ChevronRight,
 DollarSign, Clock, CheckCircle, XCircle, AlertCircle,
 Building2, User, MapPin, Eye, TrendingUp, TrendingDown
} from 'lucide-react';
import apiClient from '@/api/apiClient';
import { Link } from 'react-router-dom';

export default function BookingOversight() {
 const [bookings, setBookings] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState('');
 const [statusFilter, setStatusFilter] = useState('all');
 const [dateRange, setDateRange] = useState('all');
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [selectedBooking, setSelectedBooking] = useState(null);
 const [stats, setStats] = useState({
 totalRevenue: 0,
 activeBookings: 0,
 pendingBookings: 0,
 completedBookings: 0
 });

 useEffect(() => {
 fetchBookings();
 fetchBookingStats();
 }, [page, statusFilter, searchTerm, dateRange]);

 const fetchBookings = async () => {
 try {
 setLoading(true);
 const params = {
 page,
 limit: 10,
 ...(statusFilter !== 'all' && { status: statusFilter }),
 ...(searchTerm && { search: searchTerm })
 };

 console.log('📅 Fetching bookings with params:', params);
 const response = await apiClient.getBookings(params);
 
 if (response.success) {
 setBookings(response.data || []);
 setTotalPages(response.pagination?.pages || 1);
 console.log('✅ Bookings loaded:', response.data?.length || 0);
 }
 } catch (error) {
 console.error('❌ Failed to fetch bookings:', error);
 // Set mock data for development
 setBookings([
 {
 id: '1',
 startDate: new Date().toISOString(),
 endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
 totalAmount: 3500,
 status: 'CONFIRMED',
 isPaid: true,
 createdAt: new Date().toISOString(),
 users: {
 firstName: 'Jane',
 lastName: 'Smith',
 email: 'jane@example.com'
 },
 properties: {
 title: 'Downtown Billboard',
 address: '123 Main St',
 city: 'Los Angeles'
 },
 campaign: {
 name: 'Summer Sale Campaign'
 }
 }
 ]);
 } finally {
 setLoading(false);
 }
 };

 const fetchBookingStats = async () => {
 try {
 // In a real app, this would be a separate endpoint
 const revenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
 setStats({
 totalRevenue: revenue,
 activeBookings: bookings.filter(b => b.status === 'IN_PROGRESS').length,
 pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
 completedBookings: bookings.filter(b => b.status === 'COMPLETED').length
 });
 } catch (error) {
 console.error('❌ Failed to fetch booking stats:', error);
 }
 };

 const getStatusBadge = (status, isPaid) => {
 const statusConfig = {
 PENDING: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
 CONFIRMED: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
 IN_PROGRESS: { color: 'bg-purple-100 text-purple-700', icon: Clock },
 COMPLETED: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
 CANCELLED: { color: 'bg-red-100 text-red-700', icon: XCircle },
 REFUNDED: { color: 'bg-gray-100 text-gray-700', icon: AlertCircle }
 };

 const config = statusConfig[status] || statusConfig.PENDING;
 const Icon = config.icon;

 return (
 <div className="flex items-center gap-2">
 <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
 <Icon className="w-3 h-3" />
 {status}
 </span>
 {isPaid && (
 <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
 <DollarSign className="w-3 h-3" />
 Paid
 </span>
 )}
 </div>
 );
 };

 const BookingModal = ({ booking, onClose }) => {
 if (!booking) return null;

 return (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
 <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
 <div className="p-6 border-b border-gray-200">
 <div className="flex items-center justify-between">
 <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
 <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
 <XCircle className="w-6 h-6" />
 </button>
 </div>
 </div>

 <div className="p-6 space-y-6">
 {/* Booking Info */}
 <div>
 <h3 className="font-medium text-gray-900 mb-3">Booking Information</h3>
 <div className="grid grid-cols-2 gap-4 text-sm">
 <div>
 <label className="text-gray-500">Booking ID</label>
 <p className="font-medium">{booking.id}</p>
 </div>
 <div>
 <label className="text-gray-500">Status</label>
 <div className="mt-1">{getStatusBadge(booking.status, booking.isPaid)}</div>
 </div>
 <div>
 <label className="text-gray-500">Start Date</label>
 <p className="font-medium">{new Date(booking.startDate).toLocaleDateString()}</p>
 </div>
 <div>
 <label className="text-gray-500">End Date</label>
 <p className="font-medium">{new Date(booking.endDate).toLocaleDateString()}</p>
 </div>
 <div>
 <label className="text-gray-500">Total Amount</label>
 <p className="font-medium text-lg">${booking.totalAmount}</p>
 </div>
 <div>
 <label className="text-gray-500">Created</label>
 <p className="font-medium">{new Date(booking.createdAt).toLocaleDateString()}</p>
 </div>
 </div>
 </div>

 {/* Customer Info */}
 <div className="border-t pt-6">
 <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
 <User className="w-6 h-6 text-gray-500" />
 </div>
 <div>
 <p className="font-medium">
 {booking.users?.firstName} {booking.users?.lastName}
 </p>
 <p className="text-sm text-gray-500">{booking.users?.email}</p>
 </div>
 </div>
 </div>

 {/* Property Info */}
 <div className="border-t pt-6">
 <h3 className="font-medium text-gray-900 mb-3">Property Information</h3>
 <div className="bg-gray-50 rounded-lg p-4">
 <p className="font-medium">{booking.properties?.title}</p>
 <p className="text-sm text-gray-600 mt-1">
 {booking.properties?.address}, {booking.properties?.city}
 </p>
 </div>
 </div>

 {/* Campaign Info */}
 {booking.campaign && (
 <div className="border-t pt-6">
 <h3 className="font-medium text-gray-900 mb-3">Campaign</h3>
 <p className="text-sm">{booking.campaign.name}</p>
 </div>
 )}

 {/* Notes */}
 {booking.notes && (
 <div className="border-t pt-6">
 <h3 className="font-medium text-gray-900 mb-3">Notes</h3>
 <p className="text-sm text-gray-600">{booking.notes}</p>
 </div>
 )}
 </div>

 <div className="p-6 border-t border-gray-200 flex justify-end">
 <button
 onClick={onClose}
 className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
>
 Close
 </button>
 </div>
 </div>
 </div>
 );
 };

 return (
 <div className="min-h-screen bg-gray-50 p-6">
 <div className="max-w-7xl mx-auto">
 {/* Header */}
 <div className="mb-8">
 <Link
 to="/admin"
 className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
>
 <ChevronLeft className="w-4 h-4" />
 Back to Admin Dashboard
 </Link>
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold text-gray-900">Booking Oversight</h1>
 <p className="text-gray-600 mt-1">Monitor and manage all platform bookings</p>
 </div>
 </div>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <DollarSign className="w-8 h-8 text-green-600" />
 <TrendingUp className="w-5 h-5 text-green-600" />
 </div>
 <h3 className="text-2xl font-bold text-gray-900">${stats.totalRevenue}</h3>
 <p className="text-sm text-gray-600">Total Revenue</p>
 </div>
 
 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <Clock className="w-8 h-8 text-purple-600" />
 <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
 Active
 </span>
 </div>
 <h3 className="text-2xl font-bold text-gray-900">{stats.activeBookings}</h3>
 <p className="text-sm text-gray-600">Active Bookings</p>
 </div>
 
 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <AlertCircle className="w-8 h-8 text-yellow-600" />
 <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
 Pending
 </span>
 </div>
 <h3 className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</h3>
 <p className="text-sm text-gray-600">Pending Bookings</p>
 </div>
 
 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <CheckCircle className="w-8 h-8 text-green-600" />
 <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
 Done
 </span>
 </div>
 <h3 className="text-2xl font-bold text-gray-900">{stats.completedBookings}</h3>
 <p className="text-sm text-gray-600">Completed</p>
 </div>
 </div>

 {/* Filters */}
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
 <div className="flex flex-col md:flex-row gap-4">
 {/* Search */}
 <div className="flex-1">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
 <input
 type="text"
 placeholder="Search by property, customer, or campaign..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 />
 </div>
 </div>

 {/* Status Filter */}
 <div className="flex items-center gap-2">
 <Filter className="w-5 h-5 text-gray-400" />
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
 <option value="all">All Status</option>
 <option value="PENDING">Pending</option>
 <option value="CONFIRMED">Confirmed</option>
 <option value="IN_PROGRESS">In Progress</option>
 <option value="COMPLETED">Completed</option>
 <option value="CANCELLED">Cancelled</option>
 </select>
 </div>

 {/* Date Range */}
 <div className="flex items-center gap-2">
 <Calendar className="w-5 h-5 text-gray-400" />
 <select
 value={dateRange}
 onChange={(e) => setDateRange(e.target.value)}
 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
 <option value="all">All Time</option>
 <option value="today">Today</option>
 <option value="week">This Week</option>
 <option value="month">This Month</option>
 <option value="year">This Year</option>
 </select>
 </div>
 </div>
 </div>

 {/* Bookings Table */}
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
 {loading ? (
 <div className="p-8 text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
 <p className="mt-4 text-gray-600">Loading bookings...</p>
 </div>
 ) : bookings.length === 0 ? (
 <div className="p-8 text-center">
 <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
 <p className="text-gray-600">No bookings found</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-gray-50 border-b border-gray-200">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Booking
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Customer
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Property
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Dates
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Amount
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Status
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Actions
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200">
 {bookings.map((booking) => (
 <tr key={booking.id} className="hover:bg-gray-50">
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm font-medium text-gray-900">
 #{booking.id.slice(0, 8)}
 </div>
 <div className="text-xs text-gray-500">
 {new Date(booking.createdAt).toLocaleDateString()}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm text-gray-900">
 {booking.users?.firstName} {booking.users?.lastName}
 </div>
 <div className="text-xs text-gray-500">
 {booking.users?.email}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm text-gray-900">
 {booking.properties?.title}
 </div>
 <div className="text-xs text-gray-500 flex items-center gap-1">
 <MapPin className="w-3 h-3" />
 {booking.properties?.city}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm text-gray-900">
 {new Date(booking.startDate).toLocaleDateString()}
 </div>
 <div className="text-xs text-gray-500">
 to {new Date(booking.endDate).toLocaleDateString()}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm font-medium text-gray-900">
 ${booking.totalAmount}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 {getStatusBadge(booking.status, booking.isPaid)}
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <button
 onClick={() => setSelectedBooking(booking)}
 className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
>
 <Eye className="w-4 h-4" />
 View
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* Pagination */}
 {totalPages> 1 && (
 <div className="mt-6 flex items-center justify-between">
 <div className="text-sm text-gray-600">
 Page {page} of {totalPages}
 </div>
 <div className="flex gap-2">
 <button
 onClick={() => setPage(Math.max(1, page - 1))}
 disabled={page === 1}
 className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
>
 <ChevronLeft className="w-4 h-4" />
 </button>
 <button
 onClick={() => setPage(Math.min(totalPages, page + 1))}
 disabled={page === totalPages}
 className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
>
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </div>
 )}

 {/* Booking Details Modal */}
 {selectedBooking && (
 <BookingModal 
 booking={selectedBooking} 
 onClose={() => setSelectedBooking(null)} 
 />
 )}
 </div>
 </div>
 );
}