// src/components/debug/MapDebugTool.jsx
// Debug tool to help identify map and API issues

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const MapDebugTool = () => {
 const [debugInfo, setDebugInfo] = useState({
 apiKey: null,
 googleMapsLoaded: false,
 apiResponse: null,
 propertiesCount: 0,
 validProperties: 0,
 apiError: null,
 timestamp: null
 });
 const [isLoading, setIsLoading] = useState(false);

 const runDiagnostics = async () => {
 setIsLoading(true);
 const info = {
 timestamp: new Date().toLocaleTimeString()
 };

 try {
 // Check API Key
 info.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 
 `Set (${import.meta.env.VITE_GOOGLE_MAPS_API_KEY.substring(0, 10)}...)` : 
 'Not set';

 // Check Google Maps
 info.googleMapsLoaded = !!(window.google && window.google.maps);

 // Test API endpoint
 console.log('🔍 Testing API endpoint...');
 const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/spaces`);
 
 if (response.ok) {
 const data = await response.json();
 info.apiResponse = data;
 info.propertiesCount = data.data ? data.data.length : 0;
 
 // Count valid properties (with coordinates)
 if (data.data) {
 info.validProperties = data.data.filter(prop => 
 prop.latitude && prop.longitude
 ).length;
 }
 
 console.log('✅ API Response:', data);
 } else {
 throw new Error(`HTTP ${response.status}: ${response.statusText}`);
 }

 } catch (error) {
 console.error('❌ API Error:', error);
 info.apiError = error.message;
 }

 setDebugInfo(info);
 setIsLoading(false);
 };

 useEffect(() => {
 runDiagnostics();
 }, []);

 const getStatusIcon = (condition) => {
 if (condition === true) return <CheckCircle className="w-4 h-4 text-green-500" />;
 if (condition === false) return <XCircle className="w-4 h-4 text-red-500" />;
 return <AlertCircle className="w-4 h-4 text-yellow-500" />;
 };

 return (
 <Card className="max-w-2xl mx-auto mt-8">
 <CardHeader>
 <div className="flex items-center justify-between">
 <CardTitle>Map Debug Information</CardTitle>
 <Button
 onClick={runDiagnostics}
 disabled={isLoading}
 variant="outline"
 size={20}
>
 <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
 Refresh
 </Button>
 </div>
 {debugInfo.timestamp && (
 <p className="text-sm text-muted-foreground">
 Last updated: {debugInfo.timestamp}
 </p>
 )}
 </CardHeader>
 <CardContent className="space-y-4">
 {/* Google Maps API Status */}
 <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
 <div>
 <h3 className="font-medium">Google Maps API Key</h3>
 <p className="text-sm text-muted-foreground">
 {debugInfo.apiKey || 'Checking...'}
 </p>
 </div>
 {getStatusIcon(!!debugInfo.apiKey && debugInfo.apiKey !== 'Not set')}
 </div>

 <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
 <div>
 <h3 className="font-medium">Google Maps Loaded</h3>
 <p className="text-sm text-muted-foreground">
 {debugInfo.googleMapsLoaded ? 'Maps API is loaded' : 'Maps API not loaded'}
 </p>
 </div>
 {getStatusIcon(debugInfo.googleMapsLoaded)}
 </div>

 {/* API Status */}
 <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
 <div>
 <h3 className="font-medium">Backend API Status</h3>
 <p className="text-sm text-muted-foreground">
 {debugInfo.apiError ? `Error: ${debugInfo.apiError}` : 'API is responding'}
 </p>
 </div>
 {getStatusIcon(!debugInfo.apiError)}
 </div>

 {/* Properties Data */}
 <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
 <div>
 <h3 className="font-medium">Properties Found</h3>
 <p className="text-sm text-muted-foreground">
 {debugInfo.propertiesCount} total, {debugInfo.validProperties} with coordinates
 </p>
 </div>
 {getStatusIcon(debugInfo.propertiesCount> 0)}
 </div>

 {/* Raw API Response */}
 {debugInfo.apiResponse && (
 <div className="mt-6">
 <h3 className="font-medium mb-2">Raw API Response (First Property)</h3>
 <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-64">
 {JSON.stringify(debugInfo.apiResponse.data?.[0] || debugInfo.apiResponse, null, 2)}
 </pre>
 </div>
 )}

 {/* Quick Actions */}
 <div className="mt-6 space-y-2">
 <h3 className="font-medium">Quick Actions</h3>
 <div className="grid grid-cols-2 gap-2">
 <Button
 onClick={() => window.location.href = '/browse-map'}
 variant="outline"
 size={20}
>
 Go to Map
 </Button>
 <Button
 onClick={() => {
 console.log('🔍 Debug Info:', debugInfo);
 alert('Debug info logged to console');
 }}
 variant="outline"
 size={20}
>
 Log to Console
 </Button>
 </div>
 </div>

 {/* Environment Info */}
 <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
 <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Environment</h3>
 <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
 <div>API Base URL: {import.meta.env.VITE_API_BASE_URL || 'Not set'}</div>
 <div>Mode: {import.meta.env.MODE}</div>
 <div>Development: {import.meta.env.DEV ? 'Yes' : 'No'}</div>
 </div>
 </div>
 </CardContent>
 </Card>
 );
};

export default MapDebugTool;