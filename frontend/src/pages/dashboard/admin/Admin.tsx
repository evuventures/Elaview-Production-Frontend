// Admin Dashboard - Enhanced with Glassmorphism & Edge-to-Edge Mobile Design
// ✅ EDGE-TO-EDGE: Native mobile layout with zero container padding on mobile
// ✅ GLASSMORPHISM: Premium glass containers with immersive edge-to-edge experience
// ✅ NAVIGATION AWARE: Respects navbar height calculations
// ✅ CONDENSED LAYOUT: Optimized navigation and content to fit within available height
// ✅ BUSINESS CONTEXT: Tailored for B2B admin control panel needs

import React, { useState, useEffect } from 'react';
import { 
 Users, Building2, Calendar, FileText, 
 TrendingUp, DollarSign, Shield, Settings,
 ChevronRight, AlertCircle, CheckCircle,
 Package, Truck, UserPlus, Menu, X,
 BarChart3, Database, Activity, Loader2
} from 'lucide-react';

// ✅ GLASSMORPHISM: Enhanced Z-Index Scale for glass layering
const Z_INDEX = {
 BACKGROUND: 1,
 GLASS_CONTAINERS: 10,
 GLASS_OVERLAYS: 15,
 CONTENT: 20,
 MODAL_BACKDROP: 50,
 MODAL_CONTENT: 55,
 DROPDOWN: 60,
 TOAST: 70
};

// ✅ EDGE-TO-EDGE: Navigation heights for native mobile experience
const NAVIGATION_HEIGHTS = {
 DESKTOP: 64, // h-16 = 64px from navbar
 MOBILE_TOP: 64, // h-16 = 64px from mobile navbar 
 MOBILE_BOTTOM: 80 // Estimated mobile bottom nav height
};

// ✅ EDGE-TO-EDGE: Desktop keeps padding, mobile goes edge-to-edge
const CONTAINER_PADDING = {
 DESKTOP: 24, // Desktop maintains spacing for premium look
 MOBILE: 0 // Mobile goes edge-to-edge for native feel
};

// ✅ EDGE-TO-EDGE: Calculate CSS values for native mobile experience
const CSS_VALUES = {
 DESKTOP_TOTAL_PADDING: NAVIGATION_HEIGHTS.DESKTOP + (CONTAINER_PADDING.DESKTOP * 2),
 MOBILE_TOTAL_PADDING: NAVIGATION_HEIGHTS.MOBILE_TOP + NAVIGATION_HEIGHTS.MOBILE_BOTTOM + (CONTAINER_PADDING.MOBILE * 2),
 DESKTOP_TOP_PADDING: NAVIGATION_HEIGHTS.DESKTOP + CONTAINER_PADDING.DESKTOP,
 MOBILE_TOP_PADDING: NAVIGATION_HEIGHTS.MOBILE_TOP + CONTAINER_PADDING.MOBILE,
 MOBILE_BOTTOM_PADDING: NAVIGATION_HEIGHTS.MOBILE_BOTTOM + CONTAINER_PADDING.MOBILE
};

// ✅ GLASSMORPHISM: Enhanced Loading Component

export default function AdminDashboard() {
 const [stats, setStats] = useState(null);
 const [loading, setLoading] = useState(true);
 const [sidebarOpen, setSidebarOpen] = useState(false);

 // ✅ EDGE-TO-EDGE: Enhanced console logging for mobile native experience
 useEffect(() => {
 console.log('🎨 ADMIN DASHBOARD GLASSMORPHISM: Native mobile styling applied', {
 navigationHeights: NAVIGATION_HEIGHTS,
 containerPadding: CONTAINER_PADDING,
 calculatedValues: CSS_VALUES,
 glassmorphismOptimizations: [
 'EDGE-TO-EDGE: Mobile containers extend to screen edges',
 'FLOATING GLASS: Premium glass containers with backdrop blur',
 'NAVIGATION AWARE: Respects navbar height calculations',
 'CONDENSED LAYOUT: Optimized navigation sections for height constraints',
 'BRAND CONSISTENCY: Matches messages page styling patterns',
 'RESPONSIVE DESIGN: Desktop preserves premium spacing',
 'ADMIN SPECIFIC: Enhanced multi-section navigation with glass effects'
 ],
 timestamp: new Date().toISOString()
 });
 }, []);

 useEffect(() => {
 fetchAdminStats();
 }, []);

 const fetchAdminStats = async () => {
 try {
 console.log('📊 Simulating admin statistics fetch...');
 
 // Simulate API delay
 await new Promise(resolve => setTimeout(resolve, 2000));
 
 // Mock successful response
 console.log('✅ Admin stats loaded (simulated)');
 setStats({
 totalUsers: 1,
 totalProperties: 0,
 totalBookings: 0,
 totalCampaigns: 0,
 recentUsers: 1,
 recentBookings: 0
 });
 } catch (error) {
 console.error('❌ Failed to fetch admin stats (simulated):', error);
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
 return false; // Simplified for demo
 };

 // ✅ GLASSMORPHISM: Enhanced loading state
 if (loading) {
 return (
 <div 
 className="dashboard-loading-state relative"
 style={{ 
 position: 'fixed',
 top: 0,
 left: 0,
 right: 0,
 bottom: 0,
 width: '100vw',
 height: '100vh',
 overflow: 'hidden',
 background: 'linear-gradient(135deg, #F8FAFF 0%, #E8F2FF 50%, #F0F8FF 100%)'
 }}
>
 {/* Enhanced background pattern */}
 <div 
 className="absolute inset-0 opacity-30"
 style={{
 background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 198, 119, 0.3) 0%, transparent 50%)'
 }}
 />
 
 <div className="flex items-center justify-center" style={{ height: '100vh' }}>
 <div 
 className="relative rounded-2xl p-8 text-center max-w-md mx-4 overflow-hidden"
 style={{
 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)',
 backdropFilter: 'blur(20px) saturate(180%)',
 WebkitBackdropFilter: 'blur(20px) saturate(180%)',
 border: '1px solid rgba(255, 255, 255, 0.18)',
 boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)',
 zIndex: Z_INDEX.GLASS_CONTAINERS
 }}
>
 <div 
 className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
 style={{
 background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
 zIndex: Z_INDEX.GLASS_OVERLAYS
 }}
 />
 
 <div style={{ zIndex: Z_INDEX.CONTENT }} className="relative">
 <Shield className="w-16 h-16 text-purple-600 mx-auto mb-4" />
 <EnterpriseLoader 
 size={40}
 
 
 
 centered={true}
 />
 </div>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div 
 className="flex dashboard-container"
 style={{ 
 position: 'fixed',
 top: 0,
 left: 0,
 right: 0,
 bottom: 0,
 width: '100vw',
 height: '100vh',
 overflow: 'hidden',
 background: 'linear-gradient(135deg, #F8FAFF 0%, #E8F2FF 25%, #F0F8FF 50%, #E8F2FF 75%, #F8FAFF 100%)'
 }}
>
 {/* ✅ GLASSMORPHISM: Enhanced background with subtle patterns */}
 <div 
 className="absolute inset-0 opacity-40"
 style={{
 background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 198, 119, 0.1) 0%, transparent 50%)',
 zIndex: Z_INDEX.BACKGROUND
 }}
 />

 {/* ✅ EDGE-TO-EDGE: Mobile goes full-width, desktop maintains premium spacing */}
 <style>{`
 /* ✅ EDGE-TO-EDGE: Desktop layout with premium spacing */
 @media (min-width: 768px) {
 .dashboard-container {
 padding: ${CONTAINER_PADDING.DESKTOP}px;
 padding-top: ${CSS_VALUES.DESKTOP_TOP_PADDING}px;
 padding-bottom: ${CONTAINER_PADDING.DESKTOP}px;
 }
 .glassmorphism-sidebar {
 height: calc(100vh - ${CSS_VALUES.DESKTOP_TOTAL_PADDING}px) !important;
 max-height: calc(100vh - ${CSS_VALUES.DESKTOP_TOTAL_PADDING}px) !important;
 }
 .glassmorphism-main {
 height: calc(100vh - ${CSS_VALUES.DESKTOP_TOTAL_PADDING}px) !important;
 max-height: calc(100vh - ${CSS_VALUES.DESKTOP_TOTAL_PADDING}px) !important;
 }
 }
 
 /* ✅ EDGE-TO-EDGE: Mobile native edge-to-edge layout */
 @media (max-width: 767px) {
 .dashboard-container {
 padding: ${CONTAINER_PADDING.MOBILE}px;
 padding-top: ${CSS_VALUES.MOBILE_TOP_PADDING}px;
 padding-bottom: ${CSS_VALUES.MOBILE_BOTTOM_PADDING}px;
 }
 .glassmorphism-sidebar {
 height: calc(100vh - ${CSS_VALUES.MOBILE_TOTAL_PADDING}px) !important;
 max-height: calc(100vh - ${CSS_VALUES.MOBILE_TOTAL_PADDING}px) !important;
 /* ✅ EDGE-TO-EDGE: Mobile containers extend to edges */
 border-radius: 0 !important;
 border-left: none !important;
 border-right: none !important;
 }
 .glassmorphism-main {
 height: calc(100vh - ${CSS_VALUES.MOBILE_TOTAL_PADDING}px) !important;
 max-height: calc(100vh - ${CSS_VALUES.MOBILE_TOTAL_PADDING}px) !important;
 /* ✅ EDGE-TO-EDGE: Mobile containers extend to edges */
 border-radius: 0 !important;
 border-left: none !important;
 border-right: none !important;
 }
 
 /* ✅ EDGE-TO-EDGE: Remove spacing between containers on mobile */
 .dashboard-container> div {
 margin-left: 0 !important;
 margin-right: 0 !important;
 }
 }
 
 /* ✅ CRITICAL: Prevent any scrolling */
 .dashboard-container, .glassmorphism-sidebar, .glassmorphism-main {
 overflow: hidden !important;
 }
 
 /* ✅ EDGE-TO-EDGE: Loading states respect the same patterns */
 .dashboard-loading-state {
 padding: ${CONTAINER_PADDING.DESKTOP}px !important;
 }
 
 @media (min-width: 768px) {
 .dashboard-loading-state {
 padding-top: ${CSS_VALUES.DESKTOP_TOP_PADDING}px !important;
 padding-bottom: ${CONTAINER_PADDING.DESKTOP}px !important;
 }
 }
 
 @media (max-width: 767px) {
 .dashboard-loading-state {
 padding: ${CONTAINER_PADDING.MOBILE}px !important;
 padding-top: ${CSS_VALUES.MOBILE_TOP_PADDING}px !important;
 padding-bottom: ${CSS_VALUES.MOBILE_BOTTOM_PADDING}px !important;
 }
 }
 `}</style>

 {/* Mobile sidebar backdrop */}
 {sidebarOpen && (
 <div 
 className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
 onClick={() => setSidebarOpen(false)}
 />
 )}
 
 {/* ✅ GLASSMORPHISM: FLOATING SIDEBAR */}
 <div 
 className={`glassmorphism-sidebar w-80 md:mr-6 rounded-2xl overflow-hidden relative transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
 sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
 }`}
 style={{
 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)',
 backdropFilter: 'blur(20px) saturate(180%)',
 WebkitBackdropFilter: 'blur(20px) saturate(180%)',
 border: '1px solid rgba(255, 255, 255, 0.18)',
 boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)',
 zIndex: Z_INDEX.GLASS_CONTAINERS
 }}
>
 {/* Glass reflection overlay */}
 <div 
 className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
 style={{
 background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
 zIndex: Z_INDEX.GLASS_OVERLAYS
 }}
 />

 <div className="flex flex-col relative h-full" style={{ zIndex: Z_INDEX.CONTENT }}>
 {/* ✅ GLASSMORPHISM: Enhanced Header */}
 <div 
 className="flex items-center justify-between p-4 relative"
 style={{
 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.4) 100%)',
 backdropFilter: 'blur(15px) saturate(150%)',
 WebkitBackdropFilter: 'blur(15px) saturate(150%)',
 borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
 }}
>
 <div className="flex items-center gap-3">
 <Shield className="w-6 h-6 text-purple-600" />
 <h1 className="text-lg font-bold text-gray-900" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>
 Admin Panel
 </h1>
 </div>
 <button
 onClick={() => setSidebarOpen(false)}
 className="lg:hidden p-1.5 rounded-md transition-all duration-300"
 style={{
 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
 backdropFilter: 'blur(10px)',
 border: '1px solid rgba(255, 255, 255, 0.3)'
 }}
>
 <X className="w-4 h-4" />
 </button>
 </div>
 
 {/* ✅ CONDENSED Navigation */}
 <nav className="flex-1 overflow-y-auto p-4">
 <div className="space-y-4">
 {sidebarSections.map((section, sectionIndex) => (
 <div key={sectionIndex}>
 <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
 {section.title}
 </h3>
 <div className="space-y-1">
 {section.items.map((item, itemIndex) => (
 <button
 key={itemIndex}
 onClick={() => {
 console.log(`Navigation: ${item.link}`);
 setSidebarOpen(false);
 }}
 className={`
 group flex items-center w-full px-2.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden
 ${isActiveLink(item.link) 
 ? 'text-purple-700' 
 : 'text-gray-700 hover:bg-white hover:bg-opacity-50'
 }
 `}
 style={isActiveLink(item.link) ? {
 background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(147, 51, 234, 0.25) 50%, rgba(147, 51, 234, 0.15) 100%)',
 backdropFilter: 'blur(10px)',
 border: '1px solid rgba(147, 51, 234, 0.2)'
 } : {}}
>
 {/* Glass reflection on navigation items */}
 {isActiveLink(item.link) && (
 <div 
 className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-lg"
 style={{
 background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)'
 }}
 />
 )}
 
 <item.icon className={`
 flex-shrink-0 w-4 h-4 mr-2.5 transition-colors relative z-10
 ${isActiveLink(item.link) ? 'text-purple-600' : item.color}
 `} />
 <div className="flex-1 min-w-0 relative z-10">
 <div className="font-medium text-xs">{item.title}</div>
 <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
 {item.description}
 </div>
 </div>
 {!isActiveLink(item.link) && (
 <ChevronRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity relative z-10" />
 )}
 </button>
 ))}
 </div>
 </div>
 ))}
 </div>
 </nav>
 </div>
 </div>

 {/* ✅ GLASSMORPHISM: MAIN CONTENT AREA */}
 <div 
 className="glassmorphism-main flex-1 rounded-2xl overflow-hidden relative"
 style={{
 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)',
 backdropFilter: 'blur(20px) saturate(180%)',
 WebkitBackdropFilter: 'blur(20px) saturate(180%)',
 border: '1px solid rgba(255, 255, 255, 0.18)',
 boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)',
 zIndex: Z_INDEX.GLASS_CONTAINERS
 }}
>
 {/* Glass reflection overlay */}
 <div 
 className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
 style={{
 background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
 zIndex: Z_INDEX.GLASS_OVERLAYS
 }}
 />

 <div className="flex flex-col relative h-full" style={{ zIndex: Z_INDEX.CONTENT }}>
 {/* ✅ GLASSMORPHISM: Enhanced Header */}
 <div 
 className="flex-shrink-0 p-4 relative"
 style={{
 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.4) 100%)',
 backdropFilter: 'blur(15px) saturate(150%)',
 WebkitBackdropFilter: 'blur(15px) saturate(150%)',
 borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
 }}
>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <button
 onClick={() => setSidebarOpen(true)}
 className="lg:hidden p-2 rounded-md transition-all duration-300"
 style={{
 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
 backdropFilter: 'blur(10px)',
 border: '1px solid rgba(255, 255, 255, 0.3)'
 }}
>
 <Menu className="w-5 h-5" />
 </button>
 <div>
 <h1 className="text-xl font-bold text-gray-900" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>
 Dashboard
 </h1>
 <p className="text-sm text-gray-600" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'}}>
 Welcome to the Elaview admin control panel
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Main Content Area */}
 <main className="flex-1 overflow-auto p-4">
 {/* ✅ GLASSMORPHISM: Quick Stats */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
 {quickStats.map((stat, index) => (
 <div 
 key={index} 
 className="p-4 rounded-xl relative overflow-hidden"
 style={{
 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.4) 100%)',
 backdropFilter: 'blur(15px) saturate(150%)',
 WebkitBackdropFilter: 'blur(15px) saturate(150%)',
 border: '1px solid rgba(255, 255, 255, 0.2)',
 boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
 }}
>
 {/* Glass reflection on stat cards */}
 <div 
 className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-xl"
 style={{
 background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)'
 }}
 />
 
 <div className="relative z-10">
 <div className="flex items-center justify-between mb-3">
 <stat.icon className={`w-6 h-6 ${stat.color}`} />
 <span className="text-xs text-gray-500">{stat.changeLabel}</span>
 </div>
 <h3 className="text-xl font-bold text-gray-900">{stat.value}</h3>
 <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
 {stat.change> 0 && (
 <p className="text-xs text-green-600 mt-2">+{stat.change} new</p>
 )}
 </div>
 </div>
 ))}
 </div>

 {/* ✅ GLASSMORPHISM: Quick Actions */}
 <div 
 className="p-4 rounded-xl mb-6 relative overflow-hidden"
 style={{
 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.4) 100%)',
 backdropFilter: 'blur(15px) saturate(150%)',
 WebkitBackdropFilter: 'blur(15px) saturate(150%)',
 border: '1px solid rgba(255, 255, 255, 0.2)',
 boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
 }}
>
 {/* Glass reflection */}
 <div 
 className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-xl"
 style={{
 background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)'
 }}
 />
 
 <div className="relative z-10">
 <h2 className="text-lg font-semibold text-gray-900 mb-3" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>
 Quick Actions
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
 {[
 {
 icon: UserPlus,
 title: 'Onboard Client',
 description: 'Set up new client',
 link: '/admin/clients/onboard',
 gradient: 'from-blue-50 to-blue-100',
 hoverGradient: 'hover:from-blue-100 hover:to-blue-200',
 textColor: 'text-blue-900',
 iconColor: 'text-blue-600',
 descColor: 'text-blue-700'
 },
 {
 icon: Package,
 title: 'Manage Materials',
 description: 'Update catalog',
 link: '/admin/materials/catalog',
 gradient: 'from-indigo-50 to-indigo-100',
 hoverGradient: 'hover:from-indigo-100 hover:to-indigo-200',
 textColor: 'text-indigo-900',
 iconColor: 'text-indigo-600',
 descColor: 'text-indigo-700'
 },
 {
 icon: BarChart3,
 title: 'View Reports',
 description: 'Analytics & insights',
 link: '/admin/reports',
 gradient: 'from-orange-50 to-orange-100',
 hoverGradient: 'hover:from-orange-100 hover:to-orange-200',
 textColor: 'text-orange-900',
 iconColor: 'text-orange-600',
 descColor: 'text-orange-700'
 },
 {
 icon: Database,
 title: 'Seed Data',
 description: 'Manage test data',
 link: '/data-seeder',
 gradient: 'from-amber-50 to-amber-100',
 hoverGradient: 'hover:from-amber-100 hover:to-amber-200',
 textColor: 'text-amber-900',
 iconColor: 'text-amber-600',
 descColor: 'text-amber-700'
 }
 ].map((action, index) => (
 <button
 key={index}
 onClick={() => console.log(`Navigation: ${action.link}`)}
 className={`flex items-center gap-3 p-3 bg-gradient-to-r ${action.gradient} rounded-lg ${action.hoverGradient} transition-all duration-200 group relative overflow-hidden`}
>
 {/* Glass reflection on action buttons */}
 <div 
 className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-lg"
 style={{
 background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%)'
 }}
 />
 
 <action.icon className={`w-6 h-6 ${action.iconColor} relative z-10`} />
 <div className="relative z-10">
 <div className={`font-semibold text-sm ${action.textColor}`}>{action.title}</div>
 <div className={`text-xs ${action.descColor}`}>{action.description}</div>
 </div>
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* ✅ GLASSMORPHISM: Recent Activity */}
 <div 
 className="p-4 rounded-xl relative overflow-hidden"
 style={{
 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.4) 100%)',
 backdropFilter: 'blur(15px) saturate(150%)',
 WebkitBackdropFilter: 'blur(15px) saturate(150%)',
 border: '1px solid rgba(255, 255, 255, 0.2)',
 boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
 }}
>
 {/* Glass reflection */}
 <div 
 className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-xl"
 style={{
 background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)'
 }}
 />
 
 <div className="relative z-10">
 <h2 className="text-lg font-semibold text-gray-900 mb-3" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>
 Recent Activity
 </h2>
 <div className="space-y-3">
 {[
 {
 icon: CheckCircle,
 iconColor: 'text-blue-600',
 bgColor: 'bg-blue-50',
 title: 'Admin access configured',
 description: 'You now have full admin privileges',
 timestamp: 'Just now'
 },
 {
 icon: Package,
 iconColor: 'text-green-600',
 bgColor: 'bg-green-50',
 title: 'Material sourcing system ready',
 description: 'All admin pages for material management are now available',
 timestamp: 'System'
 },
 {
 icon: AlertCircle,
 iconColor: 'text-gray-600',
 bgColor: 'bg-gray-50',
 title: 'No pending approvals',
 description: 'All property listings are up to date',
 timestamp: 'System'
 }
 ].map((activity, index) => (
 <div key={index} className={`flex items-center gap-3 p-3 ${activity.bgColor} rounded-lg relative overflow-hidden`}>
 {/* Glass effect on activity items */}
 <div 
 className="absolute inset-0 pointer-events-none rounded-lg"
 style={{
 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.4) 100%)',
 backdropFilter: 'blur(10px)'
 }}
 />
 
 <activity.icon className={`w-4 h-4 ${activity.iconColor} flex-shrink-0 relative z-10`} />
 <div className="flex-1 relative z-10">
 <p className="text-sm font-medium text-gray-900">{activity.title}</p>
 <p className="text-xs text-gray-600">{activity.description}</p>
 </div>
 <span className="text-xs text-gray-500 relative z-10">{activity.timestamp}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </main>
 </div>
 </div>
 </div>
 );
}