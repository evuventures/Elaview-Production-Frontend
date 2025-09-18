// src/pages/admin/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { 
 Users, Search, Filter, ChevronLeft, ChevronRight,
 Shield, User, Building2, MapPin, MoreVertical,
 CheckCircle, XCircle, AlertCircle, Mail, Calendar
} from 'lucide-react';
import apiClient from '@/api/apiClient';
import { Link } from 'react-router-dom';

export default function UserManagement() {
 const [users, setUsers] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState('');
 const [roleFilter, setRoleFilter] = useState('all');
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [selectedUser, setSelectedUser] = useState(null);

 useEffect(() => {
 fetchUsers();
 }, [page, roleFilter, searchTerm]);

 const fetchUsers = async () => {
 try {
 setLoading(true);
 const params = {
 page,
 limit: 10,
 ...(roleFilter !== 'all' && { role: roleFilter }),
 ...(searchTerm && { search: searchTerm })
 };

 console.log('👥 Fetching users with params:', params);
 const response = await apiClient.getUsers(params);
 
 if (response.success) {
 setUsers(response.data);
 setTotalPages(response.pagination?.pages || 1);
 console.log('✅ Users loaded:', response.data.length);
 }
 } catch (error) {
 console.error('❌ Failed to fetch users:', error);
 // Set mock data for development
 setUsers([
 {
 id: 'af955ab0-6ae3-4149-8dcb-8807af898316',
 email: 'codejunkie92@gmail.com',
 firstName: 'Michael',
 lastName: 'Anderson',
 role: 'ADMIN',
 isAdmin: true,
 createdAt: '2025-07-31T06:12:57.937Z',
 _count: { properties: 0, campaigns: 0, bookings: 0 }
 }
 ]);
 } finally {
 setLoading(false);
 }
 };

 const handleRoleChange = async (userId, newRole) => {
 try {
 console.log(`🔄 Updating user ${userId} role to ${newRole}`);
 const response = await apiClient.put(`/users/${userId}/role`, { role: newRole });
 
 if (response.success) {
 // Update local state
 setUsers(users.map(user => 
 user.id === userId ? { ...user, role: newRole } : user
 ));
 console.log('✅ Role updated successfully');
 }
 } catch (error) {
 console.error('❌ Failed to update role:', error);
 alert('Failed to update user role');
 }
 };

 const handleAdminToggle = async (userId, currentIsAdmin) => {
 try {
 console.log(`🔄 Toggling admin status for user ${userId}`);
 const response = await apiClient.put(`/users/${userId}/role`, { 
 isAdmin: !currentIsAdmin 
 });
 
 if (response.success) {
 // Update local state
 setUsers(users.map(user => 
 user.id === userId ? { ...user, isAdmin: !currentIsAdmin } : user
 ));
 console.log('✅ Admin status updated successfully');
 }
 } catch (error) {
 console.error('❌ Failed to update admin status:', error);
 alert('Failed to update admin status');
 }
 };

 const getRoleBadgeColor = (role) => {
 const colors = {
 USER: 'bg-gray-100 text-gray-700',
 ADVERTISER: 'bg-blue-100 text-blue-700',
 PROPERTY_OWNER: 'bg-green-100 text-green-700',
 ADMIN: 'bg-purple-100 text-purple-700',
 SUPER_ADMIN: 'bg-red-100 text-red-700'
 };
 return colors[role] || 'bg-gray-100 text-gray-700';
 };

 const getRoleIcon = (role) => {
 switch (role) {
 case 'PROPERTY_OWNER': return Building2;
 case 'ADVERTISER': return MapPin;
 case 'ADMIN':
 case 'SUPER_ADMIN': return Shield;
 default: return User;
 }
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
 <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
 <p className="text-gray-600 mt-1">Manage all platform users and their roles</p>
 </div>
 <div className="flex items-center gap-4">
 <div className="text-sm text-gray-600">
 Total Users: <span className="font-semibold">{users.length}</span>
 </div>
 </div>
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
 placeholder="Search by name or email..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 />
 </div>
 </div>

 {/* Role Filter */}
 <div className="flex items-center gap-2">
 <Filter className="w-5 h-5 text-gray-400" />
 <select
 value={roleFilter}
 onChange={(e) => setRoleFilter(e.target.value)}
 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
 <option value="all">All Roles</option>
 <option value="USER">Users</option>
 <option value="ADVERTISER">Advertisers</option>
 <option value="PROPERTY_OWNER">Property Owners</option>
 <option value="ADMIN">Admins</option>
 </select>
 </div>
 </div>
 </div>

 {/* Users Table */}
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
 {loading ? (
 <div className="p-8 text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
 <p className="mt-4 text-gray-600">Loading users...</p>
 </div>
 ) : users.length === 0 ? (
 <div className="p-8 text-center">
 <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
 <p className="text-gray-600">No users found</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-gray-50 border-b border-gray-200">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 User
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Role
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Admin
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Activity
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Joined
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Actions
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200">
 {users.map((user) => {
 const RoleIcon = getRoleIcon(user.role);
 return (
 <tr key={user.id} className="hover:bg-gray-50">
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="flex items-center">
 <div className="flex-shrink-0 h-10 w-10">
 {user.imageUrl ? (
 <img 
 className="h-10 w-10 rounded-full" 
 src={user.imageUrl} 
 alt="" 
 />
 ) : (
 <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
 <User className="w-5 h-5 text-gray-500" />
 </div>
 )}
 </div>
 <div className="ml-4">
 <div className="text-sm font-medium text-gray-900">
 {user.firstName} {user.lastName}
 </div>
 <div className="text-sm text-gray-500 flex items-center gap-1">
 <Mail className="w-3 h-3" />
 {user.email}
 </div>
 </div>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <select
 value={user.role}
 onChange={(e) => handleRoleChange(user.id, e.target.value)}
 className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)} border-0 focus:ring-2 focus:ring-blue-500`}
>
 <option value="USER">User</option>
 <option value="ADVERTISER">Advertiser</option>
 <option value="PROPERTY_OWNER">Property Owner</option>
 <option value="ADMIN">Admin</option>
 </select>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <button
 onClick={() => handleAdminToggle(user.id, user.isAdmin)}
 className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
 user.isAdmin 
 ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
 : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
 }`}
>
 {user.isAdmin ? (
 <>
 <CheckCircle className="w-3 h-3" />
 Admin
 </>
 ) : (
 <>
 <XCircle className="w-3 h-3" />
 Not Admin
 </>
 )}
 </button>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
 <div className="space-y-1">
 <div>Properties: {user._count?.properties || 0}</div>
 <div>Campaigns: {user._count?.campaigns || 0}</div>
 <div>Bookings: {user._count?.bookings || 0}</div>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
 <div className="flex items-center gap-1">
 <Calendar className="w-3 h-3" />
 {new Date(user.createdAt).toLocaleDateString()}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <button
 onClick={() => setSelectedUser(user)}
 className="text-gray-400 hover:text-gray-600"
>
 <MoreVertical className="w-5 h-5" />
 </button>
 </td>
 </tr>
 );
 })}
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
 </div>
 </div>
 );
}