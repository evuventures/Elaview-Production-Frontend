import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { CARDS_PER_PAGE } from '../utils/mapConstants';

export default function PaginationControls({ 
  currentPage, 
  setCurrentPage, 
  totalPages, 
  filteredSpaces 
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      // Always show first page
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Always show last page
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const startItem = ((currentPage - 1) * CARDS_PER_PAGE) + 1;
  const endItem = Math.min(currentPage * CARDS_PER_PAGE, filteredSpaces.length);

  return (
    <div className="bg-white border-t border-slate-200 shadow-soft">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Results Summary */}
        <div className="flex items-center gap-4">
          <div className="body-small text-slate-600">
            Showing <span className="font-medium text-slate-900">{startItem}-{endItem}</span> of{' '}
            <span className="font-medium text-slate-900">{filteredSpaces.length}</span> spaces
          </div>
          {totalPages > 1 && (
            <div className="caption text-slate-500">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="btn-secondary btn-small disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((pageNum, index) => (
              <React.Fragment key={index}>
                {pageNum === '...' ? (
                  <div className="px-3 py-2 text-slate-400">
                    <MoreHorizontal className="w-4 h-4" />
                  </div>
                ) : (
                  <Button
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-8 p-0 ${
                      currentPage === pageNum
                        ? 'bg-teal-500 text-white hover:bg-teal-600 border-teal-500'
                        : 'btn-secondary hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="btn-secondary btn-small disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
      
      {/* Quick Jump (Enhancement for large datasets) */}
      {totalPages > 10 && (
        <div className="border-t border-slate-200 px-6 py-3 bg-slate-25">
          <div className="flex items-center justify-center gap-3">
            <span className="caption text-slate-600">Quick jump to page:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  setCurrentPage(page);
                }
              }}
              className="form-input w-16 h-8 text-center text-sm"
            />
            <span className="caption text-slate-600">of {totalPages}</span>
          </div>
        </div>
      )}
    </div>
  );
}