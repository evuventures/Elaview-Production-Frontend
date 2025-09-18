// src/components/debug/ApiDebugTest.jsx
// Debug component to test different API call methods

import React, { useState } from 'react';
import { Property } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ApiDebugTest = () => {
 const [results, setResults] = useState({});
 const [loading, setLoading] = useState({});

 const addResult = (testName, result) => {
 setResults(prev => ({ ...prev, [testName]: result }));
 setLoading(prev => ({ ...prev, [testName]: false }));
 };

 const startTest = (testName) => {
 setLoading(prev => ({ ...prev, [testName]: true }));
 };

 // TEST 1: Direct fetch (what's failing in Map component)
 const testDirectFetch = async () => {
 startTest('directFetch');
 try {
 console.log('🧪 Testing direct fetch(\'/api/spaces\')...');
 const response = await fetch('/api/spaces');
 console.log('🧪 Response status:', response.status);
 console.log('🧪 Response headers:', [...response.headers.entries()]);
 
 const text = await response.text();
 console.log('🧪 Raw response:', text.substring(0, 200));
 
 let data;
 try {
 data = JSON.parse(text);
 } catch (e) {
 data = { error: 'Not JSON', text: text.substring(0, 100) };
 }
 
 addResult('directFetch', {
 status: response.status,
 success: response.ok,
 data: data,
 url: response.url
 });
 } catch (error) {
 console.error('🧪 Direct fetch error:', error);
 addResult('directFetch', { error: error.message });
 }
 };

 // TEST 2: Full URL fetch
 const testFullUrlFetch = async () => {
 startTest('fullUrlFetch');
 try {
 const fullUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/spaces`;
 console.log('🧪 Testing full URL fetch:', fullUrl);
 
 const response = await fetch(fullUrl);
 const data = await response.json();
 
 addResult('fullUrlFetch', {
 status: response.status,
 success: response.ok,
 data: data,
 url: response.url
 });
 } catch (error) {
 console.error('🧪 Full URL fetch error:', error);
 addResult('fullUrlFetch', { error: error.message });
 }
 };

 // TEST 3: Entity API call (what's working)
 const testEntityCall = async () => {
 startTest('entityCall');
 try {
 console.log('🧪 Testing Property.list() entity call...');
 const data = await Property.list();
 
 addResult('entityCall', {
 success: true,
 data: data,
 count: data.length || data.data?.length || 0
 });
 } catch (error) {
 console.error('🧪 Entity call error:', error);
 addResult('entityCall', { error: error.message });
 }
 };

 // TEST 4: Manual API client call
 const testApiClient = async () => {
 startTest('apiClient');
 try {
 console.log('🧪 Testing manual API client call...');
 // Import the API client directly
 const apiResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/spaces`, {
 method: 'GET',
 headers: {
 'Content-Type': 'application/json',
 },
 });
 
 const data = await apiResponse.json();
 
 addResult('apiClient', {
 status: apiResponse.status,
 success: apiResponse.ok,
 data: data
 });
 } catch (error) {
 console.error('🧪 API client error:', error);
 addResult('apiClient', { error: error.message });
 }
 };

 // TEST 5: Check environment variables
 const testEnvironment = () => {
 const env = {
 VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
 MODE: import.meta.env.MODE,
 DEV: import.meta.env.DEV,
 currentUrl: window.location.href,
 origin: window.location.origin
 };
 
 addResult('environment', env);
 };

 const runAllTests = async () => {
 testEnvironment();
 await testDirectFetch();
 await testFullUrlFetch();
 await testEntityCall();
 await testApiClient();
 };

 const ResultCard = ({ title, result, isLoading }) => (
 <Card className="mb-4">
 <CardHeader>
 <CardTitle className="text-sm flex items-center justify-between">
 {title}
 {isLoading && <span className="text-blue-500">Loading...</span>}
 {result?.success && <span className="text-green-500">✅</span>}
 {result?.error && <span className="text-red-500">❌</span>}
 </CardTitle>
 </CardHeader>
 <CardContent>
 <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
 {JSON.stringify(result, null, 2)}
 </pre>
 </CardContent>
 </Card>
 );

 return (
 <div className="p-6 max-w-4xl mx-auto">
 <h1 className="text-2xl font-bold mb-6">API Debug Tests</h1>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
 <Button onClick={testDirectFetch} disabled={loading.directFetch}>
 Test Direct Fetch (/api/spaces)
 </Button>
 <Button onClick={testFullUrlFetch} disabled={loading.fullUrlFetch}>
 Test Full URL Fetch
 </Button>
 <Button onClick={testEntityCall} disabled={loading.entityCall}>
 Test Entity Call (Working)
 </Button>
 <Button onClick={testApiClient} disabled={loading.apiClient}>
 Test API Client
 </Button>
 <Button onClick={testEnvironment}>
 Check Environment
 </Button>
 <Button onClick={runAllTests} variant="default">
 Run All Tests
 </Button>
 </div>

 <div className="space-y-4">
 <ResultCard 
 title="1. Direct Fetch (Map Component Method)" 
 result={results.directFetch} 
 isLoading={loading.directFetch}
 />
 
 <ResultCard 
 title="2. Full URL Fetch" 
 result={results.fullUrlFetch} 
 isLoading={loading.fullUrlFetch}
 />
 
 <ResultCard 
 title="3. Entity Call (Working Method)" 
 result={results.entityCall} 
 isLoading={loading.entityCall}
 />
 
 <ResultCard 
 title="4. Manual API Client" 
 result={results.apiClient} 
 isLoading={loading.apiClient}
 />
 
 <ResultCard 
 title="5. Environment Variables" 
 result={results.environment} 
 isLoading={false}
 />
 </div>

 <div className="mt-6 p-4 bg-blue-50 rounded">
 <h3 className="font-semibold mb-2">🔍 Debugging Notes:</h3>
 <ul className="text-sm space-y-1">
 <li>• <strong>Direct Fetch</strong>: This is what's failing in your Map component</li>
 <li>• <strong>Entity Call</strong>: This is working (we see 15 properties in console)</li>
 <li>• <strong>Goal</strong>: Find why direct fetch returns HTML instead of JSON</li>
 <li>• <strong>Expected</strong>: All methods should return the same JSON data</li>
 </ul>
 </div>
 </div>
 );
};

export default ApiDebugTest;