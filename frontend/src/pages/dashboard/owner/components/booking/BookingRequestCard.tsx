// src/pages/dashboard/components/booking/BookingRequestCard.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import type { BookingRequest } from '../../types';

interface BookingRequestCardProps {
  request: BookingRequest;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isLoading?: boolean;
}

export const BookingRequestCard: React.FC<BookingRequestCardProps> = ({
  request,
  onApprove,
  onReject,
  isLoading = false
}) => {
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-white">{request.spaceName}</h4>
          <p className="text-sm text-gray-400">
            <strong>Advertiser:</strong> {request.advertiserName}
          </p>
          <p className="text-sm text-gray-400">
            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
          </p>
          {request.submittedDate && (
            <p className="text-xs text-gray-500 mt-1">
              Submitted {new Date(request.submittedDate).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="font-bold text-lime-400 text-lg">
            ${request.totalAmount.toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-600">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-400 border-red-500/50 hover:bg-red-500/10"
          onClick={() => onReject(request.id)}
          disabled={isLoading}
        >
          Decline
        </Button>
        <Button 
          size="sm" 
          className="bg-lime-400 hover:bg-lime-500 text-gray-900"
          onClick={() => onApprove(request.id)}
          disabled={isLoading}
        >
          Approve
        </Button>
      </div>
    </div>
  );
};