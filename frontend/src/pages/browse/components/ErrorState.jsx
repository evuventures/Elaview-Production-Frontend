import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="flex items-center justify-center min-h-64 py-12">
      <div className="text-center max-w-md">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        
        {/* Error Message */}
        <h3 className="heading-3 text-slate-800 mb-2">
          Unable to Load Spaces
        </h3>
        <p className="body-medium text-slate-600 mb-1">
          We're having trouble loading the advertising spaces right now.
        </p>
        <p className="caption text-slate-500 mb-6">
          {error || 'Please check your connection and try again.'}
        </p>
        
        {/* Action Button */}
        {onRetry && (
          <Button 
            onClick={onRetry}
            className="btn-primary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        
        {/* Support Message */}
        <p className="caption text-slate-500 mt-4">
          If this problem continues, please{' '}
          <button className="text-teal-600 hover:text-teal-700 underline">
            contact support
          </button>
        </p>
      </div>
    </div>
  );
}