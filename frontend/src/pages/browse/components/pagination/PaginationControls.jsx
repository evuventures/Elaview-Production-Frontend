// src/pages/browse/components/PaginationControls.jsx
// ✅ AIRBNB STYLE: Enhanced pagination matching Airbnb's design
// ✅ IMPROVED: Better mobile responsiveness and touch targets
// ✅ OPTIMIZED: Smart page number display with ellipsis

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function PaginationControls({
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  itemsPerPage = 18
}) {
  if (totalPages <= 1) return null;

  // ✅ Calculate display range
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // ✅ AIRBNB STYLE: Smart page number generation
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination with ellipsis
      if (currentPage <= 4) {
        // Near the beginning
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Near the end
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      // Smooth scroll to top on page change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 py-4">
      {/* ✅ AIRBNB STYLE: Results info */}
      <div className="text-center">
        <p className="text-sm text-slate-600">
          Showing <span className="font-medium">{startItem}–{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </p>
      </div>

      {/* ✅ AIRBNB STYLE: Pagination controls */}
      <div className="flex items-center space-x-1">
        {/* Previous button */}
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
          size="sm"
          className={`h-10 px-3 flex items-center gap-2 border border-slate-300 transition-all duration-200 ${
            currentPage === 1
              ? 'text-slate-400 cursor-not-allowed bg-slate-50'
              : 'text-slate-700 hover:text-slate-900 hover:border-slate-400 bg-white hover:bg-slate-50'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className="px-2 py-2 text-slate-500"
                >
                  ...
                </div>
              );
            }

            const isCurrentPage = page === currentPage;
            
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isCurrentPage
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-300'
                }`}
                aria-current={isCurrentPage ? 'page' : undefined}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="outline"
          size="sm"
          className={`h-10 px-3 flex items-center gap-2 border border-slate-300 transition-all duration-200 ${
            currentPage === totalPages
              ? 'text-slate-400 cursor-not-allowed bg-slate-50'
              : 'text-slate-700 hover:text-slate-900 hover:border-slate-400 bg-white hover:bg-slate-50'
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* ✅ AIRBNB STYLE: Mobile-friendly page indicator */}
      <div className="sm:hidden">
        <div className="flex items-center justify-center space-x-2">
          <div className="h-1 bg-slate-200 rounded-full overflow-hidden" style={{ width: '120px' }}>
            <div 
              className="h-full bg-slate-900 rounded-full transition-all duration-300"
              style={{ width: `${(currentPage / totalPages) * 100}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 min-w-[50px] text-center">
            {currentPage} of {totalPages}
          </span>
        </div>
      </div>
    </div>
  );
}