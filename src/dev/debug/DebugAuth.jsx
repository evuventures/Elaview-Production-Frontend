// src/components/DebugAuth.jsx
// Temporary debug component to test Clerk token handling

import React, { useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DebugAuth = () => {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [tokenInfo, setTokenInfo] = useState(null);
  const [apiTest, setApiTest] = useState(null);

  const testToken = async () => {
    try {
      console.log('🔍 Testing Clerk token...');
      
      // Test getting token
      const token = await getToken();
      
      const info = {
        isSignedIn,
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        hasToken: !!token,
        tokenLength: token?.length,
        tokenStart: token ? `${token.substring(0, 20)}...` : null
      };
      
      setTokenInfo(info);
      console.log('🔍 Token info:', info);
      
  const testProtectedEndpoints = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setApiTest({ error: 'No token available' });
        return;
      }

      console.log('🔍 Testing protected endpoints...');
      
      const endpoints = [
        '/api/campaigns',
        '/api/properties', 
        '/api/users/me'
      ];

      const results = {};
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`http://localhost:5000${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          const data = await response.json();
          results[endpoint] = {
            status: response.status,
            ok: response.ok,
            data: response.ok ? data : data.message || 'Error'
          };
        } catch (error) {
          results[endpoint] = { error: error.message };
        }
      }
      
      setApiTest(results);
      console.log('🔍 Protected endpoints test:', results);
    } catch (error) {
      console.error('❌ Protected endpoints test error:', error);
      setApiTest({ error: error.message });
    }
  };
    } catch (error) {
      console.error('❌ Token test error:', error);
      setTokenInfo({ error: error.message });
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>🔍 Debug Authentication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testToken} className="w-full mb-2">
          Test Clerk Token
        </Button>
        
        <Button onClick={testProtectedEndpoints} className="w-full" variant="outline">
          Test Protected Endpoints
        </Button>
        
        {tokenInfo && (
          <div className="bg-gray-100 p-3 rounded text-xs">
            <pre>{JSON.stringify(tokenInfo, null, 2)}</pre>
          </div>
        )}
        
        {apiTest && (
          <div className="bg-blue-100 p-3 rounded text-xs">
            <h4 className="font-bold">API Test:</h4>
            <pre>{JSON.stringify(apiTest, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebugAuth;