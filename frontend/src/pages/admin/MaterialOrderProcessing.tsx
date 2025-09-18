// src/pages/admin/MaterialOrderProcessing.tsx
import React, { useState, useEffect } from 'react';
import { 
 Package, Search, Filter, ChevronLeft, ChevronRight, Clock,
 Truck, CheckCircle, AlertCircle, Eye, Edit3, DollarSign,
 Calendar, MapPin, FileText, Image, ExternalLink, Copy,
 Download, Upload, Tag, Building2, User, Phone, Mail
} from 'lucide-react';

export default function MaterialOrderProcessing() {
 const [orders, setOrders] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState('');
 const [statusFilter, setStatusFilter] = useState('all');
 const [supplierFilter, setSupplierFilter] = useState('all');
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [selectedOrder, setSelectedOrder] = useState(null);
 const [stats, setStats] = useState({
 pending: 0,
 processing: 0,
 shipped: 0,
 delivered: 0,
 totalValue: 0
 });

 useEffect(() => {
 fetchOrders();
 fetchStats();
 }, [page, statusFilter, supplierFilter, searchTerm]);

 const fetchOrders = async () => {
 try {
 setLoading(true);
 console.log('📋 Fetching material orders...');
 
 // Mock orders data for demonstration
 const mockOrders = [
 {
 id: '1',
 orderNumber: 'ORD-2025-001',
 status: 'PENDING',
 totalAmount: 245.50,
 orderDate: '2025-01-15T10:00:00Z',
 expectedDeliveryDate: '2025-01-20T00:00:00Z',
 material_suppliers: {
 id: 'sup1',
 name: 'PrintCorp',
 company: 'PrintCorp Industries',
 email: 'orders@printcorp.com',
 phone: '(555) 123-4567'
 },
 installations: {
 id: 'install1',
 title: 'Downtown Billboard Installation',
 properties: {
 title: 'Main Street Billboard',
 address: '123 Main St, Los Angeles, CA'
 }
 },
 material_order_items: [
 {
 id: 'item1',
 quantity: 32,
 unitPrice: 6.50,
 totalPrice: 208.00,
 customSpecs: { width_in: 96, height_in: 48, finish: 'matte' },
 designFileUrl: 'https://example.com/design1.pdf',
 material_items: {
 name: 'Window Cling Material',
 category: 'ADHESIVE_VINYL',
 unit: 'sq_ft'
 }
 }
 ],
 shippingAddress: {
 street: '123 Main St',
 city: 'Los Angeles',
 state: 'CA',
 zipCode: '90210'
 },
 supplierOrderId: null,
 trackingNumber: null,
 notes: 'Rush order - needed by Friday'
 },
 {
 id: '2',
 orderNumber: 'ORD-2025-002',
 status: 'PROCESSING',
 totalAmount: 387.25,
 orderDate: '2025-01-14T14:30:00Z',
 expectedDeliveryDate: '2025-01-19T00:00:00Z',
 material_suppliers: {
 id: 'sup2',
 name: 'VinylMax',
 company: 'VinylMax Solutions',
 email: 'production@vinylmax.com',
 phone: '(555) 987-6543'
 },
 installations: {
 id: 'install2',
 title: 'Shopping Center Banner',
 properties: {
 title: 'Westfield Shopping Center',
 address: '456 Commerce Blvd, Beverly Hills, CA'
 }
 },
 material_order_items: [
 {
 id: 'item2',
 quantity: 48,
 unitPrice: 8.50,
 totalPrice: 408.00,
 customSpecs: { width_in: 144, height_in: 72, finish: 'gloss' },
 designFileUrl: 'https://example.com/design2.pdf',
 material_items: {
 name: 'Premium Vinyl Banner',
 category: 'VINYL_GRAPHICS',
 unit: 'sq_ft'
 }
 }
 ],
 shippingAddress: {
 street: '456 Commerce Blvd',
 city: 'Beverly Hills',
 state: 'CA',
 zipCode: '90210'
 },
 supplierOrderId: 'VM-2025-445',
 trackingNumber: null,
 notes: 'Confirmed with supplier - in production'
 },
 {
 id: '3',
 orderNumber: 'ORD-2025-003',
 status: 'SHIPPED',
 totalAmount: 156.75,
 orderDate: '2025-01-12T09:15:00Z',
 expectedDeliveryDate: '2025-01-17T00:00:00Z',
 shippedDate: '2025-01-15T16:00:00Z',
 material_suppliers: {
 id: 'sup3',
 name: 'SignMaster',
 company: 'SignMaster Pro',
 email: 'shipping@signmaster.com',
 phone: '(555) 456-7890'
 },
 installations: {
 id: 'install3',
 title: 'Restaurant Window Display',
 properties: {
 title: 'Giuseppe\'s Italian Restaurant',
 address: '789 Sunset Blvd, Hollywood, CA'
 }
 },
 material_order_items: [
 {
 id: 'item3',
 quantity: 24,
 unitPrice: 6.50,
 totalPrice: 156.00,
 customSpecs: { width_in: 48, height_in: 36, finish: 'matte' },
 designFileUrl: 'https://example.com/design3.pdf',
 material_items: {
 name: 'Static Window Cling',
 category: 'ADHESIVE_VINYL',
 unit: 'sq_ft'
 }
 }
 ],
 shippingAddress: {
 street: '789 Sunset Blvd',
 city: 'Hollywood',
 state: 'CA',
 zipCode: '90028'
 },
 supplierOrderId: 'SM-2025-112',
 trackingNumber: '1Z999AA1234567890',
 trackingUrl: 'https://www.ups.com/track?tracknum=1Z999AA1234567890',
 notes: 'Shipped via UPS Ground'
 }
 ];

 // Apply filters
 let filteredOrders = mockOrders;
 
 if (searchTerm) {
 filteredOrders = filteredOrders.filter(o => 
 o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
 o.installations.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
 o.material_suppliers.name.toLowerCase().includes(searchTerm.toLowerCase())
 );
 }
 
 if (statusFilter !== 'all') {
 filteredOrders = filteredOrders.filter(o => o.status === statusFilter);
 }
 
 if (supplierFilter !== 'all') {
 filteredOrders = filteredOrders.filter(o => 
 o.material_suppliers.name.toLowerCase().includes(supplierFilter.toLowerCase())
 );
 }

 setOrders(filteredOrders);
 setTotalPages(Math.ceil(filteredOrders.length / 20));
 console.log('✅ Orders loaded:', filteredOrders.length);
 } catch (error) {
 console.error('❌ Failed to fetch orders:', error);
 } finally {
 setLoading(false);
 }
 };

 const fetchStats = async () => {
 try {
 const pendingCount = orders.filter(o => o.status === 'PENDING').length;
 const processingCount = orders.filter(o => o.status === 'PROCESSING').length;
 const shippedCount = orders.filter(o => o.status === 'SHIPPED').length;
 const deliveredCount = orders.filter(o => o.status === 'DELIVERED').length;
 const totalValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
 
 setStats({
 pending: pendingCount,
 processing: processingCount,
 shipped: shippedCount,
 delivered: deliveredCount,
 totalValue
 });
 } catch (error) {
 console.error('❌ Failed to fetch stats:', error);
 setStats({
 pending: 1,
 processing: 1,
 shipped: 1,
 delivered: 0,
 totalValue: 789.50
 });
 }
 };

 const handleStatusUpdate = async (orderId, newStatus, additionalData = {}) => {
 try {
 console.log(`🔄 Updating order ${orderId} status to ${newStatus}`);
 
 const updatedOrder = {
 ...orders.find(o => o.id === orderId),
 status: newStatus,
 ...additionalData
 };
 
 setOrders(orders.map(o => 
 o.id === orderId ? updatedOrder : o
 ));
 
 setSelectedOrder(null);
 fetchStats();
 console.log('✅ Order status updated successfully');
 } catch (error) {
 console.error('❌ Failed to update order status:', error);
 alert('Failed to update order status');
 }
 };

 const getStatusBadge = (status) => {
 const badges = {
 'PENDING': {
 color: 'bg-yellow-100 text-yellow-700',
 icon: Clock,
 text: 'Pending'
 },
 'PROCESSING': {
 color: 'bg-blue-100 text-blue-700',
 icon: Package,
 text: 'Processing'
 },
 'SHIPPED': {
 color: 'bg-purple-100 text-purple-700',
 icon: Truck,
 text: 'Shipped'
 },
 'DELIVERED': {
 color: 'bg-green-100 text-green-700',
 icon: CheckCircle,
 text: 'Delivered'
 }
 };
 
 const badge = badges[status] || badges['PENDING'];
 return (
 <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
 <badge.icon className="w-3 h-3" />
 {badge.text}
 </span>
 );
 };

 const formatCurrency = (amount) => {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD'
 }).format(amount);
 };

 const formatDate = (dateString) => {
 return new Date(dateString).toLocaleDateString('en-US', {
 month: 'short',
 day: 'numeric',
 year: 'numeric'
 });
 };

 const OrderDetailsModal = ({ order, onClose }) => {
 const [statusUpdate, setStatusUpdate] = useState({
 status: order.status,
 supplierOrderId: order.supplierOrderId || '',
 trackingNumber: order.trackingNumber || '',
 trackingUrl: order.trackingUrl || '',
 notes: order.notes || ''
 });

 const handleUpdateSubmit = () => {
 const additionalData = {};
 
 if (statusUpdate.supplierOrderId !== order.supplierOrderId) {
 additionalData.supplierOrderId = statusUpdate.supplierOrderId;
 }
 
 if (statusUpdate.trackingNumber !== order.trackingNumber) {
 additionalData.trackingNumber = statusUpdate.trackingNumber;
 additionalData.trackingUrl = statusUpdate.trackingUrl;
 }
 
 if (statusUpdate.status === 'SHIPPED' && !order.shippedDate) {
 additionalData.shippedDate = new Date().toISOString();
 }
 
 if (statusUpdate.status === 'DELIVERED' && !order.deliveredDate) {
 additionalData.deliveredDate = new Date().toISOString();
 }
 
 if (statusUpdate.notes !== order.notes) {
 additionalData.notes = statusUpdate.notes;
 }
 
 handleStatusUpdate(order.id, statusUpdate.status, additionalData);
 };

 return (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
 <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
 <div className="p-6 border-b border-gray-200">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-xl font-semibold text-gray-900">Order Details - {order.orderNumber}</h2>
 <p className="text-sm text-gray-600">Manage order status and tracking information</p>
 </div>
 <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
 <ChevronLeft className="w-6 h-6" />
 </button>
 </div>
 </div>
 
 <div className="p-6 space-y-6">
 {/* Order Overview */}
 <div className="grid grid-cols-2 gap-6">
 <div>
 <h3 className="font-medium text-gray-900 mb-3">Order Information</h3>
 <div className="space-y-2 text-sm">
 <div className="flex justify-between">
 <span className="text-gray-600">Order Date:</span>
 <span className="font-medium">{formatDate(order.orderDate)}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-gray-600">Total Amount:</span>
 <span className="font-medium text-green-600">{formatCurrency(order.totalAmount)}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-gray-600">Expected Delivery:</span>
 <span className="font-medium">{formatDate(order.expectedDeliveryDate)}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-gray-600">Current Status:</span>
 <div>{getStatusBadge(order.status)}</div>
 </div>
 </div>
 </div>
 
 <div>
 <h3 className="font-medium text-gray-900 mb-3">Supplier Information</h3>
 <div className="bg-gray-50 rounded-lg p-3">
 <p className="font-medium text-gray-900">{order.material_suppliers.name}</p>
 <p className="text-sm text-gray-600">{order.material_suppliers.company}</p>
 <div className="flex gap-4 mt-2 text-xs text-gray-500">
 <span className="flex items-center gap-1">
 <Mail className="w-3 h-3" />
 {order.material_suppliers.email}
 </span>
 <span className="flex items-center gap-1">
 <Phone className="w-3 h-3" />
 {order.material_suppliers.phone}
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* Installation Details */}
 <div>
 <h3 className="font-medium text-gray-900 mb-3">Installation Details</h3>
 <div className="bg-blue-50 rounded-lg p-4">
 <div className="flex items-start gap-3">
 <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
 <div>
 <p className="font-medium text-gray-900">{order.installations.title}</p>
 <p className="text-sm text-gray-600">{order.installations.properties.title}</p>
 <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
 <MapPin className="w-3 h-3" />
 {order.installations.properties.address}
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Material Items */}
 <div>
 <h3 className="font-medium text-gray-900 mb-3">Material Items</h3>
 <div className="space-y-3">
 {order.material_order_items.map((item, index) => (
 <div key={item.id} className="border border-gray-200 rounded-lg p-4">
 <div className="flex justify-between items-start mb-3">
 <div>
 <p className="font-medium text-gray-900">{item.material_items.name}</p>
 <p className="text-sm text-gray-600">{item.material_items.category.replace(/_/g, ' ')}</p>
 </div>
 <div className="text-right">
 <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
 <p className="text-sm text-gray-600">{item.quantity} {item.material_items.unit}</p>
 </div>
 </div>
 
 {/* Custom Specifications */}
 {item.customSpecs && (
 <div className="mb-3">
 <p className="text-xs font-medium text-gray-700 mb-1">Specifications:</p>
 <div className="flex gap-4 text-xs text-gray-600">
 <span>Width: {item.customSpecs.width_in}"</span>
 <span>Height: {item.customSpecs.height_in}"</span>
 <span>Finish: {item.customSpecs.finish}</span>
 </div>
 </div>
 )}
 
 {/* Design File */}
 {item.designFileUrl && (
 <div className="flex items-center gap-2">
 <FileText className="w-4 h-4 text-blue-600" />
 <a 
 href={item.designFileUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
>
 View Design File
 <ExternalLink className="w-3 h-3" />
 </a>
 <button
 onClick={() => navigator.clipboard.writeText(item.designFileUrl)}
 className="text-gray-400 hover:text-gray-600"
 title="Copy URL"
>
 <Copy className="w-3 h-3" />
 </button>
 </div>
 )}
 </div>
 ))}
 </div>
 </div>

 {/* Status Update Form */}
 <div className="border-t pt-6">
 <h3 className="font-medium text-gray-900 mb-3">Update Order Status</h3>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Status
 </label>
 <select
 value={statusUpdate.status}
 onChange={(e) => setStatusUpdate({...statusUpdate, status: e.target.value})}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
 <option value="PENDING">Pending</option>
 <option value="PROCESSING">Processing</option>
 <option value="SHIPPED">Shipped</option>
 <option value="DELIVERED">Delivered</option>
 </select>
 </div>
 
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Supplier Order ID
 </label>
 <input
 type="text"
 value={statusUpdate.supplierOrderId}
 onChange={(e) => setStatusUpdate({...statusUpdate, supplierOrderId: e.target.value})}
 placeholder="e.g., PC-2025-445"
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Tracking Number
 </label>
 <input
 type="text"
 value={statusUpdate.trackingNumber}
 onChange={(e) => setStatusUpdate({...statusUpdate, trackingNumber: e.target.value})}
 placeholder="e.g., 1Z999AA1234567890"
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Tracking URL
 </label>
 <input
 type="url"
 value={statusUpdate.trackingUrl}
 onChange={(e) => setStatusUpdate({...statusUpdate, trackingUrl: e.target.value})}
 placeholder="https://ups.com/track?tracknum=..."
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 />
 </div>
 </div>
 
 <div className="mt-4">
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Notes
 </label>
 <textarea
 value={statusUpdate.notes}
 onChange={(e) => setStatusUpdate({...statusUpdate, notes: e.target.value})}
 placeholder="Add any notes about this order..."
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 rows={3}
 />
 </div>
 </div>
 </div>

 <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
 <button
 onClick={onClose}
 className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
>
 Cancel
 </button>
 <button
 onClick={handleUpdateSubmit}
 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
>
 Update Order
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
 <button
 onClick={() => window.history.back()}
 className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
>
 <ChevronLeft className="w-4 h-4" />
 Back to Admin Dashboard
 </button>
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold text-gray-900">Material Order Processing</h1>
 <p className="text-gray-600 mt-1">Manage the dropshipping workflow and order fulfillment</p>
 </div>
 </div>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <Clock className="w-8 h-8 text-yellow-600" />
 <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
 Action Needed
 </span>
 </div>
 <h3 className="text-2xl font-bold text-gray-900">{stats.pending}</h3>
 <p className="text-sm text-gray-600">Pending Orders</p>
 </div>
 
 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <Package className="w-8 h-8 text-blue-600" />
 <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
 In Production
 </span>
 </div>
 <h3 className="text-2xl font-bold text-gray-900">{stats.processing}</h3>
 <p className="text-sm text-gray-600">Processing</p>
 </div>
 
 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <Truck className="w-8 h-8 text-purple-600" />
 <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
 In Transit
 </span>
 </div>
 <h3 className="text-2xl font-bold text-gray-900">{stats.shipped}</h3>
 <p className="text-sm text-gray-600">Shipped</p>
 </div>
 
 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <CheckCircle className="w-8 h-8 text-green-600" />
 <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
 Complete
 </span>
 </div>
 <h3 className="text-2xl font-bold text-gray-900">{stats.delivered}</h3>
 <p className="text-sm text-gray-600">Delivered</p>
 </div>
 
 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <DollarSign className="w-8 h-8 text-green-600" />
 </div>
 <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</h3>
 <p className="text-sm text-gray-600">Total Value</p>
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
 placeholder="Search by order number, installation, or supplier..."
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
 <option value="PROCESSING">Processing</option>
 <option value="SHIPPED">Shipped</option>
 <option value="DELIVERED">Delivered</option>
 </select>
 </div>

 {/* Supplier Filter */}
 <div className="flex items-center gap-2">
 <Building2 className="w-5 h-5 text-gray-400" />
 <select
 value={supplierFilter}
 onChange={(e) => setSupplierFilter(e.target.value)}
 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
 <option value="all">All Suppliers</option>
 <option value="printcorp">PrintCorp</option>
 <option value="vinylmax">VinylMax</option>
 <option value="signmaster">SignMaster</option>
 </select>
 </div>
 </div>
 </div>

 {/* Orders Table */}
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
 {loading ? (
 <div className="p-8 text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
 <p className="mt-4 text-gray-600">Loading orders...</p>
 </div>
 ) : orders.length === 0 ? (
 <div className="p-8 text-center">
 <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
 <p className="text-gray-600">No orders found</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-gray-50 border-b border-gray-200">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Order
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Installation
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Supplier
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Amount
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Status
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Tracking
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Actions
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200">
 {orders.map((order) => (
 <tr key={order.id} className="hover:bg-gray-50">
 <td className="px-6 py-4 whitespace-nowrap">
 <div>
 <div className="text-sm font-medium text-gray-900">
 {order.orderNumber}
 </div>
 <div className="text-xs text-gray-500">
 {formatDate(order.orderDate)}
 </div>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div>
 <div className="text-sm text-gray-900">
 {order.installations.title}
 </div>
 <div className="text-xs text-gray-500">
 {order.installations.properties.title}
 </div>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div>
 <div className="text-sm text-gray-900">
 {order.material_suppliers.name}
 </div>
 <div className="text-xs text-gray-500">
 {order.supplierOrderId || 'No supplier ID'}
 </div>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm font-medium text-gray-900">
 {formatCurrency(order.totalAmount)}
 </div>
 <div className="text-xs text-gray-500">
 {order.material_order_items.length} item(s)
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 {getStatusBadge(order.status)}
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 {order.trackingNumber ? (
 <div>
 <div className="text-sm font-mono text-gray-900">
 {order.trackingNumber}
 </div>
 {order.trackingUrl && (
 <a
 href={order.trackingUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
>
 Track Package
 <ExternalLink className="w-3 h-3" />
 </a>
 )}
 </div>
 ) : (
 <span className="text-xs text-gray-500">No tracking</span>
 )}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <button
 onClick={() => setSelectedOrder(order)}
 className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
>
 <Eye className="w-4 h-4" />
 Manage
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

 {/* Order Details Modal */}
 {selectedOrder && (
 <OrderDetailsModal 
 order={selectedOrder} 
 onClose={() => setSelectedOrder(null)} 
 />
 )}
 </div>
 </div>
 );
}