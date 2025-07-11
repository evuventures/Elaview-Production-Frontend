import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, DollarSign, Building, Target, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function BookingDetailsModal({ 
  isOpen, 
  onClose, 
  booking, 
  space, 
  property, 
  currentUser 
}) {
  if (!booking || !space) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'active':
        return 'bg-gradient-to-r from-[hsl(var(--success))]/20 to-[hsl(var(--success))]/10 text-[hsl(var(--success))] border border-[hsl(var(--success))]/30';
      case 'pending_approval':
        return 'bg-gradient-to-r from-[hsl(var(--warning))]/20 to-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border border-[hsl(var(--warning))]/30';
      case 'cancelled':
      case 'declined':
        return 'bg-gradient-to-r from-[hsl(var(--destructive))]/20 to-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] border border-[hsl(var(--destructive))]/30';
      default:
        return 'bg-gradient-to-r from-[hsl(var(--primary))]/20 to-[hsl(var(--accent-light))]/10 text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
      case 'active':
        return <CheckCircle className="w-5 h-5" />;
      case 'pending_approval':
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'cancelled':
      case 'declined':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl glass border-[hsl(var(--border))] rounded-3xl shadow-[var(--shadow-brand-lg)]">
        <DialogHeader className="bg-gradient-to-r from-[hsl(var(--primary))]/5 to-[hsl(var(--accent-light))]/10 border-b border-[hsl(var(--border))] p-6 rounded-t-3xl -mt-6 -mx-6">
          <DialogTitle className="flex items-center gap-4 text-[hsl(var(--foreground))] text-2xl">
            <div className="w-12 h-12 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-[var(--shadow-brand)]">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold">Booking Details</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Campaign: {booking.campaign_name}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Status */}
          <Card className="bg-gradient-to-r from-[hsl(var(--primary))]/5 to-[hsl(var(--accent-light))]/10 glass border-[hsl(var(--border))] rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-lg text-[hsl(var(--primary))]">Status</h4>
                <Badge className={`${getStatusColor(booking.status)} px-4 py-2 text-base font-bold rounded-full flex items-center gap-2`}>
                  {getStatusIcon(booking.status)}
                  {booking.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Space Details */}
          <Card className="bg-gradient-to-r from-[hsl(var(--success))]/5 to-[hsl(var(--success))]/10 glass border-[hsl(var(--border))] rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-12 bg-gradient-to-r from-[hsl(var(--success))] to-[hsl(var(--success))]/80 rounded-xl flex items-center justify-center shadow-[var(--shadow-brand)] flex-shrink-0 overflow-hidden">
                  {space.images?.[0] ? (
                    <img
                      src={space.images[0]}
                      alt={space.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-[hsl(var(--success))] mb-2">{space.title}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-[hsl(var(--success))]" />
                    <span className="text-sm text-[hsl(var(--success))]">{property?.name}</span>
                  </div>
                  <Badge className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border border-[hsl(var(--success))]/30 rounded-full">
                    {space.type?.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaign & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-r from-[hsl(var(--primary))]/5 to-[hsl(var(--accent-light))]/10 glass border-[hsl(var(--border))] rounded-2xl">
              <CardContent className="p-4">
                <h4 className="font-bold text-[hsl(var(--primary))] mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Campaign Dates
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--primary))]">Start:</span>
                    <span className="font-semibold text-[hsl(var(--primary))]">
                      {format(new Date(booking.start_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--primary))]">End:</span>
                    <span className="font-semibold text-[hsl(var(--primary))]">
                      {format(new Date(booking.end_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-[hsl(var(--warning))]/5 to-[hsl(var(--warning))]/10 glass border-[hsl(var(--border))] rounded-2xl">
              <CardContent className="p-4">
                <h4 className="font-bold text-[hsl(var(--warning))] mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Cost
                </h4>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--success))]">${booking.total_amount?.toLocaleString()}</div>
                  <div className="text-xs text-[hsl(var(--warning))] mt-1">Total Amount</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Brand Info */}
          {booking.brand_name && (
            <Card className="bg-gradient-to-r from-[hsl(var(--muted))]/50 to-[hsl(var(--muted))]/30 glass border-[hsl(var(--border))] rounded-2xl">
              <CardContent className="p-4">
                <h4 className="font-bold text-[hsl(var(--foreground))] mb-2">Brand Information</h4>
                <p className="text-[hsl(var(--muted-foreground))]">{booking.brand_name}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-4 p-6 bg-[hsl(var(--card))]/50 border-t border-[hsl(var(--border))] rounded-b-3xl -mb-6 -mx-6">
          <Button variant="outline" onClick={onClose} className="rounded-2xl transition-brand">
            Close
          </Button>
          <Link to={createPageUrl('Dashboard')}>
            <Button className="btn-gradient rounded-2xl transition-brand">
              View All Bookings
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}