import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Failed to load advertising spaces
        </h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <Button 
          onClick={onRetry}
          className="bg-lime-400 text-gray-900 hover:bg-lime-500"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}