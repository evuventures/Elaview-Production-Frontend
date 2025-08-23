import React from 'react';
import { LoadingAnimation, PageLoader, ButtonLoader, InlineLoader } from './LoadingAnimation';

// Simple test component to verify all variants work
const LoadingAnimationTest = () => {
  return (
    <div className="p-8 space-y-8 bg-white">
      <h1 className="text-2xl font-bold text-center">Loading Animation Test</h1>
      
      {/* Basic variants */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Basic Variants</h2>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <LoadingAnimation variant="spinner" size="md" />
            <p className="text-xs mt-2">Spinner</p>
          </div>
          <div className="text-center">
            <LoadingAnimation variant="dots" size="md" />
            <p className="text-xs mt-2">Dots</p>
          </div>
          <div className="text-center">
            <LoadingAnimation variant="pulse" size="md" />
            <p className="text-xs mt-2">Pulse</p>
          </div>
          <div className="text-center">
            <LoadingAnimation variant="bars" size="md" />
            <p className="text-xs mt-2">Bars</p>
          </div>
          <div className="text-center">
            <LoadingAnimation variant="loader2" size="md" />
            <p className="text-xs mt-2">Loader2</p>
          </div>
        </div>
      </div>
      
      {/* Sizes */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Sizes</h2>
        <div className="flex items-center gap-8">
          <LoadingAnimation size="xs" />
          <LoadingAnimation size="sm" />
          <LoadingAnimation size="md" />
          <LoadingAnimation size="lg" />
          <LoadingAnimation size="xl" />
        </div>
      </div>
      
      {/* Colors */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Colors</h2>
        <div className="flex items-center gap-8">
          <LoadingAnimation color="primary" />
          <LoadingAnimation color="secondary" />
          <LoadingAnimation color="gray" />
          <div className="bg-gray-800 p-4 rounded">
            <LoadingAnimation color="white" />
          </div>
        </div>
      </div>
      
      {/* Preset components */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Preset Components</h2>
        <div className="space-y-6">
          <div className="border p-4 rounded">
            <PageLoader message="Loading dashboard..." />
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded flex items-center">
              <ButtonLoader size="sm" color="white" />
              <span className="ml-2">Loading...</span>
            </button>
            <InlineLoader message="Processing..." />
          </div>
        </div>
      </div>
      
      {/* Speeds */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Animation Speeds</h2>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <LoadingAnimation speed="fast" />
            <p className="text-xs mt-2">Fast</p>
          </div>
          <div className="text-center">
            <LoadingAnimation speed="normal" />
            <p className="text-xs mt-2">Normal</p>
          </div>
          <div className="text-center">
            <LoadingAnimation speed="slow" />
            <p className="text-xs mt-2">Slow</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimationTest;