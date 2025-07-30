// import React, { useState } from 'react';
// import { Play, CheckCircle, XCircle, Clock, Shield, AlertTriangle } from 'lucide-react';

// export default function APIEndpointTester() {
//   const [testResults, setTestResults] = useState({});
//   const [isRunning, setIsRunning] = useState(false);
//   const [selectedTest, setSelectedTest] = useState(null);

//   // Define all endpoints to test
//   const endpoints = [
//     // Core Dashboard
//     { name: 'Health Check', method: 'GET', path: '/health', auth: false, priority: 'high' },
//     { name: 'Space Owner Dashboard', method: 'GET', path: '/dashboard/space-owner', auth: true, priority: 'high' },
//     { name: 'Advertiser Dashboard', method: 'GET', path: '/dashboard/advertiser', auth: true, priority: 'high' },
//     { name: 'Dashboard Stats', method: 'GET', path: '/dashboard/stats', auth: true, priority: 'medium' },
    
//     // User Management
//     { name: 'User Profile', method: 'GET', path: '/users/profile', auth: true, priority: 'high' },
//     { name: 'All Users', method: 'GET', path: '/users', auth: true, priority: 'low' },
    
//     // Properties & Areas
//     { name: 'Properties List', method: 'GET', path: '/properties', auth: true, priority: 'high' },
//     { name: 'Advertising Areas', method: 'GET', path: '/areas', auth: true, priority: 'high' },
    
//     // Business Logic
//     { name: 'Campaigns List', method: 'GET', path: '/campaigns', auth: true, priority: 'high' },
//     { name: 'Bookings List', method: 'GET', path: '/bookings', auth: true, priority: 'high' },
//     { name: 'Messages List', method: 'GET', path: '/messages', auth: true, priority: 'medium' },
//     { name: 'Invoices List', method: 'GET', path: '/invoices', auth: true, priority: 'medium' },
    
//     // Materials System
//     { name: 'Materials Catalog', method: 'GET', path: '/materials/catalog', auth: true, priority: 'medium' },
//     { name: 'Materials Suppliers', method: 'GET', path: '/materials/suppliers', auth: true, priority: 'low' },
//     { name: 'Materials Items', method: 'GET', path: '/materials/items', auth: true, priority: 'low' },
//     { name: 'Materials Orders', method: 'GET', path: '/materials/orders', auth: true, priority: 'low' },
//     { name: 'Materials Stats', method: 'GET', path: '/materials/stats', auth: true, priority: 'low' },
    
//     // Notifications
//     { name: 'Notifications Count', method: 'GET', path: '/notifications/count', auth: true, priority: 'medium' },
//     { name: 'Unread Notifications', method: 'GET', path: '/notifications/unread', auth: true, priority: 'medium' },
//     { name: 'All Notifications', method: 'GET', path: '/notifications', auth: true, priority: 'low' },
    
//     // Optional Features
//     { name: 'Installations', method: 'GET', path: '/installations', auth: true, priority: 'low' },
//     { name: 'Conversations', method: 'GET', path: '/conversations', auth: true, priority: 'low' },
//     { name: 'Creatives', method: 'GET', path: '/creatives', auth: true, priority: 'low' },
//   ];

//   const testEndpoint = async (endpoint) => {
//     const baseURL = 'http://localhost:5000/api';
    
//     try {
//       // Get auth token if needed
//       let token = null;
//       if (endpoint.auth && window.Clerk) {
//         const session = await window.Clerk.session;
//         if (session) {
//           token = await session.getToken();
//         }
//       }

//       const response = await fetch(`${baseURL}${endpoint.path}`, {
//         method: endpoint.method,
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token && { 'Authorization': `Bearer ${token}` })
//         }
//       });

//       const responseTime = Date.now();
//       let responseData = null;
      
//       try {
//         responseData = await response.json();
//       } catch (e) {
//         responseData = await response.text();
//       }

//       return {
//         success: response.ok,
//         status: response.status,
//         statusText: response.statusText,
//         responseTime: responseTime,
//         data: responseData,
//         error: null
//       };
//     } catch (error) {
//       return {
//         success: false,
//         status: 0,
//         statusText: 'Network Error',
//         responseTime: null,
//         data: null,
//         error: error.message
//       };
//     }
//   };

//   const runAllTests = async () => {
//     setIsRunning(true);
//     setTestResults({});
    
//     for (const endpoint of endpoints) {
//       const result = await testEndpoint(endpoint);
//       setTestResults(prev => ({
//         ...prev,
//         [endpoint.path]: { ...endpoint, ...result }
//       }));
      
//       // Small delay to avoid overwhelming server
//       await new Promise(resolve => setTimeout(resolve, 200));
//     }
    
//     setIsRunning(false);
//   };

//   const runSingleTest = async (endpoint) => {
//     setSelectedTest(endpoint.path);
//     const result = await testEndpoint(endpoint);
//     setTestResults(prev => ({
//       ...prev,
//       [endpoint.path]: { ...endpoint, ...result }
//     }));
//     setSelectedTest(null);
//   };

//   const getStatusColor = (result) => {
//     if (!result) return 'text-gray-400';
//     if (result.success) return 'text-green-600';
//     if (result.status === 401 || result.status === 403) return 'text-yellow-600';
//     return 'text-red-600';
//   };

//   const getStatusIcon = (result) => {
//     if (!result) return <Clock className="w-4 h-4 text-gray-400" />;
//     if (result.success) return <CheckCircle className="w-4 h-4 text-green-600" />;
//     if (result.status === 401 || result.status === 403) return <Shield className="w-4 h-4 text-yellow-600" />;
//     return <XCircle className="w-4 h-4 text-red-600" />;
//   };

//   const getPriorityColor = (priority) => {
//     switch (priority) {
//       case 'high': return 'bg-red-100 text-red-800';
//       case 'medium': return 'bg-yellow-100 text-yellow-800';
//       case 'low': return 'bg-green-100 text-green-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const summary = {
//     total: endpoints.length,
//     tested: Object.keys(testResults).length,
//     working: Object.values(testResults).filter(r => r.success).length,
//     failing: Object.values(testResults).filter(r => !r.success && r.status !== 401 && r.status !== 403).length,
//     authIssues: Object.values(testResults).filter(r => r.status === 401 || r.status === 403).length,
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-6 bg-white">
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">API Endpoint Tester</h1>
//         <p className="text-gray-600">Test all your backend API endpoints to see what's working and what needs attention.</p>
//       </div>

//       {/* Summary Stats */}
//       <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
//         <div className="bg-blue-50 p-4 rounded-lg">
//           <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
//           <div className="text-sm text-blue-800">Total Endpoints</div>
//         </div>
//         <div className="bg-gray-50 p-4 rounded-lg">
//           <div className="text-2xl font-bold text-gray-600">{summary.tested}</div>
//           <div className="text-sm text-gray-800">Tested</div>
//         </div>
//         <div className="bg-green-50 p-4 rounded-lg">
//           <div className="text-2xl font-bold text-green-600">{summary.working}</div>
//           <div className="text-sm text-green-800">Working</div>
//         </div>
//         <div className="bg-red-50 p-4 rounded-lg">
//           <div className="text-2xl font-bold text-red-600">{summary.failing}</div>
//           <div className="text-sm text-red-800">Failing</div>
//         </div>
//         <div className="bg-yellow-50 p-4 rounded-lg">
//           <div className="text-2xl font-bold text-yellow-600">{summary.authIssues}</div>
//           <div className="text-sm text-yellow-800">Auth Issues</div>
//         </div>
//       </div>

//       {/* Controls */}
//       <div className="mb-6">
//         <button
//           onClick={runAllTests}
//           disabled={isRunning}
//           className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg flex items-center gap-2"
//         >
//           <Play className="w-4 h-4" />
//           {isRunning ? 'Testing...' : 'Run All Tests'}
//         </button>
//       </div>

//       {/* Results Table */}
//       <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Endpoint
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Priority
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Method
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Auth
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {endpoints.map((endpoint) => {
//                 const result = testResults[endpoint.path];
//                 const isCurrentlyTesting = selectedTest === endpoint.path;
                
//                 return (
//                   <tr key={endpoint.path} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         {getStatusIcon(result)}
//                         <div className="ml-3">
//                           <div className="text-sm font-medium text-gray-900">{endpoint.name}</div>
//                           <div className="text-sm text-gray-500">{endpoint.path}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(endpoint.priority)}`}>
//                         {endpoint.priority}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{endpoint.method}</span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {endpoint.auth ? <Shield className="w-4 h-4 text-yellow-500" /> : <span className="text-gray-400">-</span>}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {result ? (
//                         <div className={getStatusColor(result)}>
//                           <div className="text-sm font-medium">
//                             {result.status} {result.statusText}
//                           </div>
//                           {result.error && (
//                             <div className="text-xs text-red-600">{result.error}</div>
//                           )}
//                         </div>
//                       ) : (
//                         <span className="text-gray-400 text-sm">Not tested</span>
//                       )}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                       <button
//                         onClick={() => runSingleTest(endpoint)}
//                         disabled={isCurrentlyTesting || isRunning}
//                         className="text-blue-600 hover:text-blue-900 disabled:text-blue-300"
//                       >
//                         {isCurrentlyTesting ? 'Testing...' : 'Test'}
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Recommendations */}
//       {summary.tested > 0 && (
//         <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
//             <AlertTriangle className="w-5 h-5" />
//             Recommendations
//           </h3>
//           <ul className="text-sm text-blue-800 space-y-1">
//             {summary.failing > 0 && (
//               <li>• Fix {summary.failing} failing endpoints - these are causing 500/400 errors</li>
//             )}
//             {summary.authIssues > 0 && (
//               <li>• {summary.authIssues} endpoints need authentication - make sure you're logged in</li>
//             )}
//             <li>• Focus on HIGH priority endpoints first - these are used by your main features</li>
//             <li>• MEDIUM priority endpoints affect user experience</li>
//             <li>• LOW priority endpoints can be implemented later</li>
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }