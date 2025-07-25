import React from 'react';
import { Loader2 } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400 mx-auto mb-4" />
        <p className="text-gray-400">Finding the perfect advertising spaces...</p>
      </div>
    </div>
  );
}