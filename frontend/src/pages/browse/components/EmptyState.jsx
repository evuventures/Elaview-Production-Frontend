import React from 'react';
import { Button } from "@/components/ui/button";
import { Building2, Search, Filter } from "lucide-react";

export default function EmptyState({ onClearFilters }) {
  return (
    <div className="flex items-center justify-center min-h-64 py-12">
      <div className="text-center max-w-md">
        {/* Empty Icon */}
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-slate-400" />
        </div>
        
        {/* Empty Message */}
        <h3 className="heading-3 text-slate-800 mb-2">
          No Spaces Found
        </h3>
        <p className="body-medium text-slate-600 mb-1">
          We couldn't find any advertising spaces matching your current filters.
        </p>
        <p className="caption text-slate-500 mb-6">
          Try adjusting your search criteria to discover more opportunities.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={onClearFilters}
            className="btn-primary"
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
          <Button 
            variant="outline"
            className="btn-secondary"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Browse All Spaces
          </Button>
        </div>
        
        {/* Helpful Tips */}
        <div className="mt-8 p-4 bg-slate-50 rounded-lg">
          <h4 className="label text-slate-700 mb-2">Search Tips:</h4>
          <ul className="caption text-slate-600 space-y-1 text-left">
            <li>• Try expanding your price range</li>
            <li>• Consider different space types</li>
            <li>• Remove specific feature requirements</li>
            <li>• Broaden your target audience</li>
          </ul>
        </div>
      </div>
    </div>
  );
}