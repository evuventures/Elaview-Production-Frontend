// src/pages/TestMapPage.tsx
// Simple test page for the minimal map component

import React from 'react';
import MinimalTestMap from '@/dev/debug/MinimalTestMap';

const TestMapPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Google Maps Test Page
          </h1>
          <p className="text-gray-600">
            Testing minimal Google Maps component to debug loading issues.
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">What to expect:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Status should show "Loading Google Maps API..."</li>
              <li>• Then "Creating map..."</li>
              <li>• Finally "Map with test marker loaded! 🎉✨"</li>
              <li>• You should see a map centered on Orange County with a blue marker</li>
              <li>• Check the browser console for detailed logs</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Minimal Google Maps Test</h2>
          <div className="h-[500px]">
            <MinimalTestMap />
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-900 mb-2">Debug Steps:</h3>
          <ol className="text-sm text-yellow-800 space-y-1">
            <li>1. Open browser console (F12)</li>
            <li>2. Look for logs starting with "🧪 MinimalTestMap:"</li>
            <li>3. Check if you see "Component unmounting" immediately</li>
            <li>4. Note at which step the process fails</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestMapPage;