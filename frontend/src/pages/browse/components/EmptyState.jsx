import React from 'react';
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default function EmptyState({ onClearFilters }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          No advertising spaces found
        </h3>
        <p className="text-gray-400 mb-4">
          Try adjusting your filters to see more results
        </p>
        <Button 
          variant="outline" 
          onClick={onClearFilters}
          className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
}