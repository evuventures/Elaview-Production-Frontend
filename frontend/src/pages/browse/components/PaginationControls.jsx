import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800/50">
      <div className="text-sm text-gray-400">
        Showing {((currentPage - 1) * CARDS_PER_PAGE) + 1}-{Math.min(currentPage * CARDS_PER_PAGE, filteredSpaces.length)} of {filteredSpaces.length} spaces
      </div>
      
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map(pageNum => (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(pageNum)}
              className={`w-10 h-8 p-0 ${
                currentPage === pageNum
                  ? 'bg-lime-400 text-gray-900 hover:bg-lime-500'
                  : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {pageNum}
            </Button>
          ))}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}