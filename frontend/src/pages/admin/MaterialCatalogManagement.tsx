// src/pages/admin/MaterialCatalogManagement.tsx
import React, { useState, useEffect } from 'react';
import { 
 Package, Search, Filter, ChevronLeft, ChevronRight, Plus,
 Edit3, Trash2, Eye, DollarSign, Tag, Warehouse, AlertCircle,
 CheckCircle, XCircle, Upload, Download, BarChart3, TrendingUp
} from 'lucide-react';

export default function MaterialCatalogManagement() {
 const [materials, setMaterials] = useState([]);
 const [suppliers, setSuppliers] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState('');
 const [categoryFilter, setCategoryFilter] = useState('all');
 const [supplierFilter, setSupplierFilter] = useState('all');
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [selectedMaterial, setSelectedMaterial] = useState(null);
 const [showAddModal, setShowAddModal] = useState(false);
 const [stats, setStats] = useState({
 totalItems: 0,
 inStock: 0,
 outOfStock: 0,
 totalSuppliers: 0
 });

 useEffect(() => {
 fetchMaterials();
 fetchSuppliers();
 fetchStats();
 }, [page, categoryFilter, supplierFilter, searchTerm]);

 const fetchMaterials = async () => {
 try {
 setLoading(true);
 console.log('📦 Fetching materials...');
 
 // API call to your materials endpoint
 const response = await fetch('/api/materials/items', {
 method: 'GET',
 headers: {
 'Authorization': `Bearer ${await window.Clerk.session.getToken()}`
 }
 });
 
 if (response.ok) {
 const data = await response.json();
 setMaterials(data.data || []);
 setTotalPages(data.pagination?.totalPages || 1);
 console.log('✅ Materials loaded:', data.data?.length || 0);
 } else {
 // Fallback to mock data for development
 const mockMaterials = [
 {
 id: '1',
 name: 'Premium Vinyl Banner',
 description: 'Weather-resistant vinyl banner material',
 category: 'VINYL_GRAPHICS',
 unitPrice: 8.50,
 unit: 'sq_ft',
 inStock: true,
 stockQuantity: 500,
 minimumQuantity: 10,
 leadTimeDays: 3,
 material_suppliers: {
 name: 'PrintCorp',
 company: 'PrintCorp Industries'
 },
 _count: { material_order_items: 45 }
 },
 {
 id: '2',
 name: 'Window Cling Material',
 description: 'Static cling material for windows',
 category: 'ADHESIVE_VINYL',
 unitPrice: 6.50,
 unit: 'sq_ft',
 inStock: true,
 stockQuantity: 200,
 minimumQuantity: 5,
 leadTimeDays: 2,
 material_suppliers: {
 name: 'VinylMax',
 company: 'VinylMax Solutions'
 },
 _count: { material_order_items: 23 }
 },
 {
 id: '3',
 name: 'Mesh Banner Material',
 description: 'Perforated mesh for windy locations',
 category: 'MESH_BANNERS',
 unitPrice: 9.25,
 unit: 'sq_ft',
 inStock: false,
 stockQuantity: 0,
 minimumQuantity: 15,
 leadTimeDays: 5,
 material_suppliers: {
 name: 'SignMaster',
 company: 'SignMaster Pro'
 },
 _count: { material_order_items: 12 }
 }
 ];
 setMaterials(mockMaterials);
 console.log('✅ Mock materials loaded:', mockMaterials.length);
 }
 } catch (error) {
 console.error('❌ Failed to fetch materials:', error);
 } finally {
 setLoading(false);
 }
 };

 const fetchSuppliers = async () => {
 try {
 const mockSuppliers = [
 { id: 'supplier1', name: 'PrintCorp', company: 'PrintCorp Industries' },
 { id: 'supplier2', name: 'VinylMax', company: 'VinylMax Solutions' },
 { id: 'supplier3', name: 'SignMaster', company: 'SignMaster Pro' },
 { id: 'supplier4', name: 'PlasticPlus', company: 'Plastic Plus Manufacturing' }
 ];
 setSuppliers(mockSuppliers);
 } catch (error) {
 console.error('❌ Failed to fetch suppliers:', error);
 }
 };

 const fetchStats = async () => {
 try {
 const inStockCount = materials.filter(m => m.inStock).length;
 const outOfStockCount = materials.filter(m => !m.inStock).length;
 
 setStats({
 totalItems: materials.length,
 inStock: inStockCount,
 outOfStock: outOfStockCount,
 totalSuppliers: suppliers.length
 });
 } catch (error) {
 console.error('❌ Failed to fetch stats:', error);
 setStats({
 totalItems: 3,
 inStock: 2,
 outOfStock: 1,
 totalSuppliers: 4
 });
 }
 };

 const handleAddMaterial = async (materialData) => {
 try {
 console.log('➕ Adding new material:', materialData);
 
 const newMaterial = {
 id: Date.now().toString(),
 ...materialData,
 inStock: true,
 material_suppliers: suppliers.find(s => s.id === materialData.supplierId) || { name: 'Unknown', company: 'Unknown' },
 _count: { material_order_items: 0 }
 };
 
 setMaterials(prev => [...prev, newMaterial]);
 setShowAddModal(false);
 fetchStats();
 console.log('✅ Material added successfully');
 } catch (error) {
 console.error('❌ Failed to add material:', error);
 alert('Failed to add material');
 }
 };

 const handleDeleteMaterial = async (id) => {
 if (!confirm('Are you sure you want to delete this material?')) return;
 
 try {
 console.log(`🗑️ Deleting material ${id}`);
 setMaterials(materials.filter(m => m.id !== id));
 fetchStats();
 console.log('✅ Material deleted successfully');
 } catch (error) {
 console.error('❌ Failed to delete material:', error);
 alert('Failed to delete material');
 }
 };

 const getStockBadge = (inStock, stockQuantity) => {
 if (!inStock) {
 return (
 <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
 <XCircle className="w-3 h-3" />
 Out of Stock
 </span>
 );
 }
 
 if (stockQuantity && stockQuantity < 50) {
 return (
 <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
 <AlertCircle className="w-3 h-3" />
 Low Stock ({stockQuantity})
 </span>
 );
 }
 
 return (
 <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
 <CheckCircle className="w-3 h-3" />
 In Stock ({stockQuantity || 'Available'})
 </span>
 );
 };

 const formatCurrency = (amount) => {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD'
 }).format(amount);
 };

 const AddMaterialModal = () => {
 const [formData, setFormData] = useState({
 name: '',
 description: '',
 category: 'VINYL_GRAPHICS',
 supplierId: '',
 unitPrice: '',
 unit: 'sq_ft',
 stockQuantity: '',
 minimumQuantity: '1',
 leadTimeDays: '3'
 });

 const handleSubmit = (e) => {
 e.preventDefault();
 if (!formData.name || !formData.supplierId || !formData.unitPrice) {
 alert('Please fill in all required fields');
 return;
 }
 handleAddMaterial({
 ...formData,
 unitPrice: parseFloat(formData.unitPrice),
 stockQuantity: parseInt(formData.stockQuantity) || 0,
 minimumQuantity: parseInt(formData.minimumQuantity) || 1,
 leadTimeDays: parseInt(formData.leadTimeDays) || 3
 });
 };

 return (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
 <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
 <div className="p-6 border-b border-gray-200">
 <h2 className="text-xl font-semibold text-gray-900">Add New Material</h2>
 </div>
 
 <div className="p-6 space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Material Name *
 </label>
 <input
 type="text"
 value={formData.name}
 onChange={(e) => setFormData({...formData, name: e.target.value})}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 required
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Category *
 </label>
 <select
 value={formData.category}
 onChange={(e) => setFormData({...formData, category: e.target.value})}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
 <option value="VINYL_GRAPHICS">Vinyl Graphics</option>
 <option value="ADHESIVE_VINYL">Adhesive Vinyl</option>
 <option value="MESH_BANNERS">Mesh Banners</option>
 <option value="RIGID_SIGNS">Rigid Signs</option>
 <option value="FABRIC_BANNERS">Fabric Banners</option>
 </select>
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Description
 </label>
 <textarea
 value={formData.description}
 onChange={(e) => setFormData({...formData, description: e.target.value})}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 rows={3}
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Supplier *
 </label>
 <select
 value={formData.supplierId}
 onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 required
>
 <option value="">Select Supplier</option>
 {suppliers.map(supplier => (
 <option key={supplier.id} value={supplier.id}>
 {supplier.name} - {supplier.company}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Unit Price * ($)
 </label>
 <input
 type="number"
 step="0.01"
 min="0"
 value={formData.unitPrice}
 onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 required
 />
 </div>
 </div>

 <div className="grid grid-cols-3 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Unit
 </label>
 <select
 value={formData.unit}
 onChange={(e) => setFormData({...formData, unit: e.target.value})}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
 <option value="sq_ft">Square Feet</option>
 <option value="linear_ft">Linear Feet</option>
 <option value="piece">Piece</option>
 <option value="roll">Roll</option>
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Stock Quantity
 </label>
 <input
 type="number"
 min="0"
 value={formData.stockQuantity}
 onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Lead Time (Days)
 </label>
 <input
 type="number"
 min="1"
 value={formData.leadTimeDays}
 onChange={(e) => setFormData({...formData, leadTimeDays: e.target.value})}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 />
 </div>
 </div>

 <div className="flex justify-end gap-3 pt-4">
 <button
 type="button"
 onClick={() => setShowAddModal(false)}
 className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
>
 Cancel
 </button>
 <button
 type="button"
 onClick={handleSubmit}
 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
>
 Add Material
 </button>
 </div>
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
 <h1 className="text-3xl font-bold text-gray-900">Material Catalog</h1>
 <p className="text-gray-600 mt-1">Manage your material inventory and pricing</p>
 </div>
 <button
 onClick={() => setShowAddModal(true)}
 className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium inline-flex items-center gap-2"
>
 <Plus className="w-4 h-4" />
 Add Material
 </button>
 </div>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <Package className="w-8 h-8 text-blue-600" />
 <TrendingUp className="w-5 h-5 text-green-600" />
 </div>
 <h3 className="text-2xl font-bold text-gray-900">{stats.totalItems}</h3>
 <p className="text-sm text-gray-600">Total Materials</p>
 </div>
 
 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <CheckCircle className="w-8 h-8 text-green-600" />
 <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
 Available
 </span>
 </div>
 <h3 className="text-2xl font-bold text-gray-900">{stats.inStock}</h3>
 <p className="text-sm text-gray-600">In Stock</p>
 </div>
 
 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <XCircle className="w-8 h-8 text-red-600" />
 <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
 Need Restocking
 </span>
 </div>
 <h3 className="text-2xl font-bold text-gray-900">{stats.outOfStock}</h3>
 <p className="text-sm text-gray-600">Out of Stock</p>
 </div>
 
 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <Warehouse className="w-8 h-8 text-purple-600" />
 <BarChart3 className="w-5 h-5 text-purple-600" />
 </div>
 <h3 className="text-2xl font-bold text-gray-900">{stats.totalSuppliers}</h3>
 <p className="text-sm text-gray-600">Active Suppliers</p>
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
 placeholder="Search materials by name, description, or SKU..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 />
 </div>
 </div>

 {/* Category Filter */}
 <div className="flex items-center gap-2">
 <Tag className="w-5 h-5 text-gray-400" />
 <select
 value={categoryFilter}
 onChange={(e) => setCategoryFilter(e.target.value)}
 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
 <option value="all">All Categories</option>
 <option value="VINYL_GRAPHICS">Vinyl Graphics</option>
 <option value="ADHESIVE_VINYL">Adhesive Vinyl</option>
 <option value="MESH_BANNERS">Mesh Banners</option>
 <option value="RIGID_SIGNS">Rigid Signs</option>
 <option value="FABRIC_BANNERS">Fabric Banners</option>
 </select>
 </div>

 {/* Supplier Filter */}
 <div className="flex items-center gap-2">
 <Warehouse className="w-5 h-5 text-gray-400" />
 <select
 value={supplierFilter}
 onChange={(e) => setSupplierFilter(e.target.value)}
 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
 <option value="all">All Suppliers</option>
 {suppliers.map(supplier => (
 <option key={supplier.id} value={supplier.name}>
 {supplier.name}
 </option>
 ))}
 </select>
 </div>
 </div>
 </div>

 {/* Materials Table */}
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
 {loading ? (
 <div className="p-8 text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
 <p className="mt-4 text-gray-600">Loading materials...</p>
 </div>
 ) : materials.length === 0 ? (
 <div className="p-8 text-center">
 <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
 <p className="text-gray-600">No materials found</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-gray-50 border-b border-gray-200">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Material
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Category
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Supplier
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Price
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Stock Status
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Orders
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Actions
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200">
 {materials.map((material) => (
 <tr key={material.id} className="hover:bg-gray-50">
 <td className="px-6 py-4 whitespace-nowrap">
 <div>
 <div className="text-sm font-medium text-gray-900">
 {material.name}
 </div>
 <div className="text-xs text-gray-500">
 {material.description}
 </div>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
 {material.category?.replace(/_/g, ' ')}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm text-gray-900">
 {material.material_suppliers?.name || 'Unknown'}
 </div>
 <div className="text-xs text-gray-500">
 {material.material_suppliers?.company || 'Unknown'}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm font-medium text-gray-900">
 {formatCurrency(material.unitPrice)}/{material.unit}
 </div>
 <div className="text-xs text-gray-500">
 Min: {material.minimumQuantity || 1} {material.unit}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 {getStockBadge(material.inStock, material.stockQuantity)}
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm text-gray-900">
 {material._count?.material_order_items || 0} orders
 </div>
 <div className="text-xs text-gray-500">
 {material.leadTimeDays || 0} day lead time
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <div className="flex gap-2">
 <button
 onClick={() => setSelectedMaterial(material)}
 className="text-blue-600 hover:text-blue-700"
 title="View Details"
>
 <Eye className="w-4 h-4" />
 </button>
 <button
 onClick={() => console.log('Edit material:', material.id)}
 className="text-gray-600 hover:text-gray-700"
 title="Edit Material"
>
 <Edit3 className="w-4 h-4" />
 </button>
 <button
 onClick={() => handleDeleteMaterial(material.id)}
 className="text-red-600 hover:text-red-700"
 title="Delete Material"
>
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
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

 {/* Add Material Modal */}
 {showAddModal && <AddMaterialModal />}
 </div>
 </div>
 );
}