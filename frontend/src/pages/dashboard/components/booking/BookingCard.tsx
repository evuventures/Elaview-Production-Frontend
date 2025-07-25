// src/pages/dashboard/components/booking/BookingCard.tsx
import React from 'react';
import { MapPin } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import type { Booking } from '../../types';

interface BookingCardProps {
  booking: Booking;
  onClick?: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onClick }) => {
  return (
    <div 
      className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-4 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white">{booking.spaceName}</h3>
            <StatusBadge status={booking.status} />
          </div>
          <p className="text-sm text-gray-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {booking.location}
          </p>
          <p className="text-sm text-gray-400">
            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <div className="font-semibold text-lime-400">${booking.totalCost.toLocaleString()}</div>
          <div className="text-sm text-gray-400">${Math.round(booking.dailyRate || 0)}/day</div>
        </div>
      </div>
    </div>
  );
};