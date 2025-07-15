import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Info, Crown, DollarSign, Calendar, Target, Sparkles, Clock } from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, isAfter, isWithinInterval, isSameDay, differenceInCalendarDays } from 'date-fns';
import { Booking, Message } from '@/api/entities';

const CalendarView = ({ startDate, endDate, hoveredDate, onDateSelect, onDateHover, unavailableDates, booking, isLoading }) => {
  const [currentMonth, setCurrentMonth] = useState(booking ? new Date(booking.start_date) : new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayStatus = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (isBefore(date, new Date()) && !isToday(date)) return 'past';
    if (unavailableDates.includes(dateStr)) return 'booked';

    if (startDate && isSameDay(date, startDate)) return 'selected-start';
    if (endDate && isSameDay(date, endDate)) return 'selected-end';
    if (startDate && endDate && isWithinInterval(date, { start: startDate, end: endDate })) return 'selected-middle';

    if (startDate && !endDate && hoveredDate && isAfter(hoveredDate, startDate)) {
      if (isWithinInterval(date, { start: startDate, end: hoveredDate })) return 'in-range';
    }

    if (booking && isWithinInterval(date, { start: new Date(booking.start_date), end: new Date(booking.end_date) })) return 'current';
    return 'available';
  };

  const getDayClassName = (date) => {
    const status = getDayStatus(date);
    let className = 'p-2 text-sm transition-brand relative h-12 w-12 flex items-center justify-center rounded-2xl font-semibold';

    switch (status) {
      case 'past': className += ' text-[hsl(var(--muted-foreground))] cursor-not-allowed bg-[hsl(var(--muted))]'; break;
      case 'booked': className += ' bg-gradient-to-r from-[hsl(var(--destructive))]/10 to-[hsl(var(--destructive))]/20 text-[hsl(var(--destructive))] cursor-not-allowed line-through border border-[hsl(var(--destructive))]'; break;
      case 'selected-start': className += ' bg-gradient-brand text-white shadow-[var(--shadow-brand)] scale-110'; break;
      case 'selected-end': className += ' bg-gradient-brand text-white shadow-[var(--shadow-brand)] scale-110'; break;
      case 'selected-middle': className += ' bg-gradient-to-r from-[hsl(var(--primary))]/20 to-[hsl(var(--accent))]/20 text-[hsl(var(--primary))] border border-[hsl(var(--primary))]'; break;
      case 'in-range': className += ' bg-gradient-to-r from-[hsl(var(--primary))]/10 to-[hsl(var(--accent))]/10 text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/50'; break;
      case 'current': className += ' bg-gradient-to-r from-[hsl(var(--success))]/20 to-[hsl(var(--success))]/30 text-[hsl(var(--success))] border border-[hsl(var(--success))]'; break;
      case 'available': className += ' hover:bg-gradient-to-r hover:from-[hsl(var(--muted))]/50 hover:to-[hsl(var(--accent-light))]/20 cursor-pointer hover:scale-105 hover:shadow-md transition-brand'; break;
    }
    
    if (isToday(date)) className += ' ring-2 ring-[hsl(var(--primary))] ring-offset-2';
    return className;
  };

  return (
    <Card className="bg-gradient-to-r from-[hsl(var(--primary))]/5 to-[hsl(var(--accent-light))]/10 border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-[var(--shadow-brand)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentMonth(prev => addDays(startOfMonth(prev), -1))}
            className="btn-outline rounded-xl transition-brand"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-xl font-bold text-[hsl(var(--primary))]">{format(currentMonth, 'MMMM yyyy')}</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentMonth(prev => addDays(startOfMonth(prev), 31))}
            className="btn-outline rounded-xl transition-brand"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-6">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="text-center text-sm font-bold text-[hsl(var(--primary))] p-3">{day}</div>
          ))}
          {daysInMonth.map(date => (
            <div key={format(date, 'yyyy-MM-dd')} className="flex justify-center items-center" onMouseEnter={() => onDateHover(date)}>
              <button 
                onClick={() => getDayStatus(date) !== 'past' && getDayStatus(date) !== 'booked' && onDateSelect(date)} 
                disabled={isLoading} 
                className={getDayClassName(date)}
              >
                {format(date, 'd')}
              </button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-[hsl(var(--success))]/20 to-[hsl(var(--success))]/30 border border-[hsl(var(--success))] rounded-lg"></div>
            <span className="font-medium text-[hsl(var(--primary))]">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-[hsl(var(--primary))]/20 to-[hsl(var(--accent))]/20 border border-[hsl(var(--primary))] rounded-lg"></div>
            <span className="font-medium text-[hsl(var(--primary))]">New</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-[hsl(var(--destructive))]/10 to-[hsl(var(--destructive))]/20 border border-[hsl(var(--destructive))] rounded-lg"></div>
            <span className="font-medium text-[hsl(var(--primary))]">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[hsl(var(--muted))] rounded-lg"></div>
            <span className="font-medium text-[hsl(var(--primary))]">Past</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function RequestChangeModal({ booking, space, isOpen, onClose }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen && space && booking) {
      setStartDate(new Date(booking.start_date));
      setEndDate(new Date(booking.end_date));
      loadUnavailableDates();
    }
  }, [isOpen, space, booking]);

  const loadUnavailableDates = async () => {
    if (!space?.id) return;
    
    setIsLoading(true);
    try {
      const bookings = await Booking.filter({ space_id: space.id, status: { $in: ['confirmed', 'active'] } });
      const unavailable = [];
      bookings.forEach(b => {
        if (b.id === booking?.id) return;
        eachDayOfInterval({ start: new Date(b.start_date), end: new Date(b.end_date) }).forEach(day => {
          unavailable.push(format(day, 'yyyy-MM-dd'));
        });
      });
      setUnavailableDates(unavailable);
    } catch (error) {
      console.error('Error loading unavailable dates:', error);
    }
    setIsLoading(false);
  };

  const handleDateSelect = (date) => {
    if (startDate && !endDate) {
      if (isBefore(date, startDate)) {
        setStartDate(date);
      } else {
        const range = { start: startDate, end: date };
        const isConflict = unavailableDates.some(d => isWithinInterval(new Date(d), range));
        if (isConflict) {
          alert('Your new selection includes unavailable dates. Please choose a different range.');
          if (booking) {
            setStartDate(new Date(booking.start_date));
            setEndDate(new Date(booking.end_date));
          }
        } else {
          setEndDate(date);
        }
      }
    } else {
      setStartDate(date);
      setEndDate(null);
    }
  };

  const dailyRate = space?.pricing?.daily_rate || 0;
  const originalDuration = booking ? differenceInCalendarDays(new Date(booking.end_date), new Date(booking.start_date)) + 1 : 0;
  const newDuration = startDate && endDate ? differenceInCalendarDays(endDate, startDate) + 1 : 0;
  const newTotalAmount = newDuration * dailyRate;
  const priceDifference = booking ? newTotalAmount - booking.total_amount : 0;

  const handleSubmitRequest = async () => {
    if (!startDate || !endDate) {
        alert("Please select a valid date range.");
        return;
    }
    
    if (!booking || !space) {
        alert("Missing booking or space information.");
        return;
    }
    
    setIsLoading(true);
    try {
        await Message.create({
            sender_id: booking.advertiser_id,
            recipient_id: booking.owner_id,
            booking_id: booking.id,
            space_id: space.id,
            message_type: 'campaign_change_request',
            content: `Change Request for "${booking.campaign_name || 'Campaign'}":\n${message}`,
            system_data: {
                booking_id: booking.id,
                original_start_date: booking.start_date,
                original_end_date: booking.end_date,
                new_start_date: format(startDate, 'yyyy-MM-dd'),
                new_end_date: format(endDate, 'yyyy-MM-dd'),
                price_difference: priceDifference,
                new_total_amount: newTotalAmount,
                request_status: 'pending',
            }
        });
        alert('Your change request has been sent to the property owner.');
        onClose();
    } catch (error) {
        console.error("Error sending change request:", error);
        alert('Failed to send request. Please try again.');
    }
    setIsLoading(false);
  };

  if (!booking || !space) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl glass border-[hsl(var(--border))] rounded-3xl shadow-[var(--shadow-brand-lg)] p-0">
        <DialogHeader className="bg-gradient-to-r from-[hsl(var(--warning))]/10 to-[hsl(var(--warning))]/5 border-b border-[hsl(var(--border))] p-8 m-0 rounded-t-3xl -mt-6 -mx-6">
          <DialogTitle className="flex items-center gap-4 text-[hsl(var(--foreground))] text-3xl">
            <div className="w-12 h-12 bg-gradient-to-r from-[hsl(var(--warning))] to-[hsl(var(--warning))]/80 rounded-2xl flex items-center justify-center shadow-[var(--shadow-brand)]">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold">Request Campaign Changes</h3>
              <p className="text-sm text-muted-foreground mt-1">Modify your booking dates</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Calendar Section */}
          <div onMouseLeave={() => setHoveredDate(null)}>
            <CalendarView
              startDate={startDate}
              endDate={endDate}
              hoveredDate={hoveredDate}
              onDateSelect={handleDateSelect}
              onDateHover={setHoveredDate}
              unavailableDates={unavailableDates}
              booking={booking}
              isLoading={isLoading}
            />
          </div>
          
          {/* Summary Section */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-[hsl(var(--muted))]/80 to-[hsl(var(--accent-light))]/30 border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-[var(--shadow-brand)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-6 h-6 text-[hsl(var(--primary))]" />
                  <h3 className="font-bold text-[hsl(var(--primary))] text-xl">Change Summary</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-[hsl(var(--card))]/50 to-[hsl(var(--muted))]/50 rounded-xl">
                    <p className="font-bold text-[hsl(var(--primary))] mb-2">Original Dates</p>
                    <p className="text-[hsl(var(--primary))] font-medium">{format(new Date(booking.start_date), 'MMM d, yyyy')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}</p>
                    <p className="text-sm text-[hsl(var(--primary))]/70">{originalDuration} days · ${(booking.total_amount || 0).toLocaleString()}</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-[hsl(var(--card))]/50 to-[hsl(var(--muted))]/50 rounded-xl">
                    <p className="font-bold text-[hsl(var(--primary))] mb-2">New Dates</p>
                    {startDate && endDate ? (
                      <>
                        <p className="text-[hsl(var(--primary))] font-medium">{format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}</p>
                        <p className="text-sm text-[hsl(var(--primary))]/70">{newDuration} days · ${newTotalAmount.toLocaleString()}</p>
                      </>
                    ) : (
                      <p className="text-[hsl(var(--primary))]/70">Select a new date range</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Price Difference */}
            <Card className={`backdrop-blur-sm rounded-2xl overflow-hidden shadow-[var(--shadow-brand)] border ${
              priceDifference >= 0 
                ? 'bg-gradient-to-r from-[hsl(var(--success))]/5 to-[hsl(var(--success))]/10 border-[hsl(var(--success))]/30'
                : 'bg-gradient-to-r from-[hsl(var(--primary))]/5 to-[hsl(var(--accent-light))]/10 border-[hsl(var(--primary))]/30'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className={`w-6 h-6 ${priceDifference >= 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--primary))]'}`} />
                  <h3 className={`font-bold text-xl ${priceDifference >= 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--primary))]'}`}>
                    Price Difference
                  </h3>
                </div>
                <div className="text-center">
                  <p className={`text-4xl font-bold mb-2 ${priceDifference >= 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--primary))]'}`}>
                    {priceDifference >= 0 ? '+' : ''}${priceDifference.toLocaleString()}
                  </p>
                  <p className={`text-sm font-medium ${priceDifference >= 0 ? 'text-[hsl(var(--success))]/70' : 'text-[hsl(var(--primary))]/70'}`}>
                    {priceDifference >= 0 
                      ? 'Additional amount will be invoiced upon approval.' 
                      : 'Credit will be applied to your account upon approval.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Enhanced Message Input */}
            <Card className="bg-gradient-to-r from-[hsl(var(--muted))]/50 to-[hsl(var(--secondary))]/20 border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-[var(--shadow-brand)]">
              <CardContent className="p-6">
                <label htmlFor="change-message" className="font-bold text-muted-foreground text-base mb-3 block">Message to Owner (optional)</label>
                <Textarea 
                  id="change-message" 
                  value={message} 
                  onChange={e => setMessage(e.target.value)} 
                  placeholder="Explain why you're requesting this change..."
                  className="glass border-[hsl(var(--border))] rounded-2xl py-3 px-4 focus-brand transition-brand resize-none"
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleSubmitRequest} 
                disabled={isLoading || !startDate || !endDate} 
                className="btn-gradient btn-xl w-full font-bold shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 animate-spin" />
                    <span>Sending Request...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5" />
                    <span>Submit Change Request</span>
                  </div>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="btn-outline w-full font-bold transition-brand"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}