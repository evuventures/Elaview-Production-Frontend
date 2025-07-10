import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon, CheckCircle, MessageSquare, ArrowLeft, ArrowRight, AlertTriangle, XCircle, Target, Crown, Sparkles, Building, DollarSign, Clock } from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, differenceInDays, isAfter, isWithinInterval, isSameDay, subMonths, addMonths } from 'date-fns';
import { Booking } from '@/api/entities';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AutoCompleteInput from '../ui/AutoCompleteInput'; // Assuming this component exists

const CalendarView = ({ startDate, endDate, hoveredDate, onDateSelect, onDateHover, unavailableDates, isLoading }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
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
      case 'available': className += ' hover:bg-gradient-to-r hover:from-[hsl(var(--muted))]/50 hover:to-[hsl(var(--accent-light))]/20 cursor-pointer hover:scale-105 hover:shadow-md transition-brand'; break;
    }

    if (isSameDay(date, startDate) && isSameDay(date, endDate)) {
      className += ' rounded-2xl';
    }
    
    if (!isSameMonth(date, currentMonth)) {
      className = className.replace('text-white', ''); 
      className += ' text-[hsl(var(--muted-foreground))] opacity-50';
    }

    if (isToday(date)) className += ' ring-2 ring-[hsl(var(--primary))] ring-offset-2';
    
    return className;
  };

  const handleDateClick = (date) => {
    const status = getDayStatus(date);
    if (status !== 'past' && status !== 'booked') {
      onDateSelect(date);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-[hsl(var(--primary))]/5 to-[hsl(var(--accent-light))]/10 border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-[var(--shadow-brand)]">
      <CardContent className="p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
            className="glass border-[hsl(var(--border))] rounded-xl hover:bg-[hsl(var(--muted))] transition-brand"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-xl font-bold text-[hsl(var(--primary))]">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
            className="glass border-[hsl(var(--border))] rounded-xl hover:bg-[hsl(var(--muted))] transition-brand"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-bold text-[hsl(var(--primary))] p-3">
              {day.substring(0, 3)}
            </div>
          ))}
          {daysInMonth.map(date => {
            const status = getDayStatus(date);
            return (
              <div
                key={format(date, 'yyyy-MM-dd')}
                className="flex justify-center items-center"
                onMouseEnter={() => onDateHover(date)}
              >
                <button
                  onClick={() => handleDateClick(date)}
                  disabled={status === 'past' || status === 'booked' || isLoading}
                  className={getDayClassName(date)}
                >
                  {format(date, 'd')}
                  {status === 'booked' && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-[hsl(var(--destructive))] rounded-full shadow-sm"></div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Enhanced Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-brand rounded-lg shadow-sm"></div>
            <span className="font-medium text-[hsl(var(--primary))]">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-[hsl(var(--destructive))]/10 to-[hsl(var(--destructive))]/20 border border-[hsl(var(--destructive))] rounded-lg"></div>
            <span className="font-medium text-[hsl(var(--primary))]">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[hsl(var(--primary))] rounded-lg bg-[hsl(var(--card))]"></div>
            <span className="font-medium text-[hsl(var(--primary))]">Available</span>
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

export default function CalendarBookingModal({ area, isOpen, onClose, onConfirm }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [bookingDetails, setBookingDetails] = useState({
    campaign_name: '',
    brand_name: '',
    content_type: [],
    content_description: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [contentWarnings, setContentWarnings] = useState([]);
  const [conflictError, setConflictError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isOpen && area) {
      loadUnavailableDates();
      checkContentRestrictions();
    }
  }, [isOpen, area, bookingDetails.content_type]);

  const checkContentRestrictions = () => {
    if (!area?.content_restrictions?.prohibited_content || area.content_restrictions.prohibited_content.length === 0) {
      setContentWarnings([]); 
      return;
    }
    
    const conflicts = bookingDetails.content_type.filter(type => 
      area.content_restrictions.prohibited_content.includes(type)
    );
    setContentWarnings(conflicts);
  };

  const loadUnavailableDates = async () => {
    setIsLoading(true);
    try {
      const bookings = await Booking.filter({ 
        area_id: area.id, 
        status: { $in: ['confirmed', 'active'] }
      });
      
      const unavailable = [];
      bookings.forEach(booking => {
        const start = new Date(booking.start_date);
        const end = new Date(booking.end_date);
        
        const days = eachDayOfInterval({ start, end });
        days.forEach(day => {
          unavailable.push(format(day, 'yyyy-MM-dd'));
        });
      });
      
      setUnavailableDates(unavailable);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
    setIsLoading(false);
  };

  const handleDateSelect = (date) => {
    setConflictError(null);

    if (startDate && !endDate) {
      if (isBefore(date, startDate)) {
        setStartDate(date);
        setEndDate(null);
      } else {
        const range = { start: startDate, end: date };
        const isConflict = unavailableDates.some(unavailableDateStr => 
          isWithinInterval(new Date(unavailableDateStr), range)
        );
        if (isConflict) {
          setConflictError('Your selection includes unavailable dates. Please choose a different range.');
          setStartDate(null);
          setEndDate(null);
        } else {
          setEndDate(date);
        }
      }
    } else {
      setStartDate(date);
      setEndDate(null);
    }
  };

  const handleDateHover = (date) => {
    if (startDate && !endDate) {
      setHoveredDate(date);
    }
  };

  const getSelectedDates = () => {
    if (!startDate || !endDate) return [];
    const sortedRange = [startDate, endDate].sort((a,b) => a.getTime() - b.getTime());
    return eachDayOfInterval({ start: sortedRange[0], end: sortedRange[1] })
        .map(d => format(d, 'yyyy-MM-dd'));
  };

  const calculateTotal = () => {
    const dates = getSelectedDates();
    if (!dates.length || !area.pricing?.daily_rate) return 0;
    return dates.length * area.pricing.daily_rate;
  };

  const handleContinue = () => {
    if (conflictError) return;
    if (!startDate || !endDate) {
      setConflictError('Please select a start and end date.');
      return;
    }
    setStep(2);
  };

  const contentTypes = [
    { value: 'alcohol', label: 'Alcohol/Beverages' },
    { value: 'tobacco', label: 'Tobacco Products' },
    { value: 'gambling', label: 'Gambling/Casino' },
    { value: 'adult_content', label: 'Adult Content' },
    { value: 'political', label: 'Political' },
    { value: 'religious', label: 'Religious' },
    { value: 'pharmaceutical', label: 'Pharmaceutical' },
    { value: 'weapons', label: 'Weapons/Military' },
    { value: 'fast_food', label: 'Fast Food' },
    { value: 'other', label: 'Other' }
  ];

  const handleContentTypeChange = (contentType, checked) => {
    setBookingDetails(prev => ({
      ...prev,
      content_type: checked 
        ? [...prev.content_type, contentType]
        : prev.content_type.filter(type => type !== contentType)
    }));
  };

  const validateDetailsForm = () => {
    const errors = {};
    if (!bookingDetails.campaign_name.trim()) errors.campaign_name = 'Campaign name is required.';
    if (!bookingDetails.brand_name.trim()) errors.brand_name = 'Brand name is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirm = () => {
    if (!validateDetailsForm()) return;

    const sensitiveContent = ['alcohol', 'tobacco', 'gambling', 'adult_content', 'political', 'religious', 'pharmaceutical', 'weapons'];
    const hasSensitiveContent = bookingDetails.content_type.some(type => sensitiveContent.includes(type));
    const hasContentRestrictions = area.content_restrictions?.prohibited_content?.length > 0;
    
    const needsApproval = hasSensitiveContent || hasContentRestrictions || contentWarnings.length > 0;

    if (contentWarnings.length > 0) {
      const confirmed = window.confirm(
        `Warning: This campaign contains content types that may not be allowed on this property: ${contentWarnings.map(c => contentTypes.find(t => t.value === c)?.label || c).join(', ')}. Your booking will be sent for manual review.`
      );
      if (!confirmed) return;
    }

    const selectedDatesArray = getSelectedDates();
    const sortedDates = selectedDatesArray.sort();

    onConfirm({
      ...bookingDetails,
      start_date: sortedDates[0],
      end_date: sortedDates[sortedDates.length - 1],
      selected_dates: selectedDatesArray,
      total_amount: calculateTotal(),
      message: bookingDetails.message || '',
      needs_approval: needsApproval,
      sensitive_content: hasSensitiveContent
    });
    
    setStep(3);
  };

  const resetModal = () => {
    setStartDate(null);
    setEndDate(null);
    setBookingDetails({ campaign_name: '', brand_name: '', content_type: [], content_description: '', message: '' });
    setStep(1);
    setConflictError(null);
    setFormErrors({});
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!area) return null;

  const selectedDatesArray = getSelectedDates();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full h-[90vh] glass-strong border-[hsl(var(--border))] rounded-3xl p-0 fixed bottom-0 md:bottom-auto shadow-[var(--shadow-brand-lg)]">
        <DialogHeader className="bg-gradient-to-r from-[hsl(var(--muted))]/80 to-[hsl(var(--accent-light))]/30 border-b border-[hsl(var(--border))] p-6 rounded-t-3xl">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <Button variant="ghost" size="icon" onClick={() => setStep(step - 1)} className="text-[hsl(var(--primary))] hover:bg-[hsl(var(--muted))] rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="flex-1 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-[var(--shadow-brand)]">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-[hsl(var(--foreground))]">{area.title}</DialogTitle>
                <p className="text-sm text-muted-foreground">Create your booking</p>
              </div>
            </div>
          </div>
          
          {/* Enhanced Step Indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`flex-1 h-3 rounded-full transition-brand ${
                  i <= step 
                    ? 'bg-gradient-brand shadow-[var(--shadow-brand)]' 
                    : 'bg-[hsl(var(--muted))]'
                }`} 
              />
            ))}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          {step === 1 && (
            <div onMouseLeave={() => setHoveredDate(null)} className="p-6 space-y-6">
              <CalendarView
                startDate={startDate}
                endDate={endDate}
                hoveredDate={hoveredDate}
                onDateSelect={handleDateSelect}
                onDateHover={handleDateHover}
                unavailableDates={unavailableDates}
                isLoading={isLoading}
              />
              
              {conflictError && (
                <Alert className="bg-gradient-to-r from-[hsl(var(--destructive))]/5 to-[hsl(var(--destructive))]/10 border-[hsl(var(--destructive))] rounded-2xl">
                  <XCircle className="h-4 w-4 text-[hsl(var(--destructive))]" />
                  <AlertTitle className="text-[hsl(var(--destructive))] font-bold">Selection Conflict</AlertTitle>
                  <AlertDescription className="text-[hsl(var(--destructive))]">{conflictError}</AlertDescription>
                </Alert>
              )}

              {selectedDatesArray.length > 0 && (
                <Card className="bg-gradient-to-r from-[hsl(var(--success))]/5 to-[hsl(var(--success))]/10 border-[hsl(var(--success))]/30 rounded-2xl overflow-hidden shadow-[var(--shadow-brand)]">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[hsl(var(--success))]" />
                        <span className="font-bold text-[hsl(var(--success))]">Selected Dates:</span>
                      </div>
                      <Badge className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))] font-bold">
                        {selectedDatesArray.length} days
                      </Badge>
                    </div>
                    <div className="text-sm text-[hsl(var(--success))] mb-4 font-medium">
                      {startDate && endDate ? 
                        `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
                        : (startDate ? `From ${format(startDate, 'MMM d, yyyy')}` : 'Select a start date')
                      }
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span className="text-[hsl(var(--success))]">Total:</span>
                      <span className="text-[hsl(var(--success))] text-2xl">${calculateTotal().toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="p-6 space-y-6">
              {/* Enhanced Campaign Details */}
              <Card className="bg-gradient-to-r from-[hsl(var(--primary))]/5 to-[hsl(var(--accent-light))]/10 border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-[var(--shadow-brand)]">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-[hsl(var(--primary))]" />
                    <h3 className="font-bold text-[hsl(var(--primary))] text-lg">Campaign Details</h3>
                  </div>
                  
                  <div>
                    <Label htmlFor="campaign_name" className="text-base font-semibold text-muted-foreground mb-2 block">Campaign Name *</Label>
                    <AutoCompleteInput
                      id="campaign_name"
                      value={bookingDetails.campaign_name}
                      onChange={(value) => {
                        setBookingDetails(prev => ({...prev, campaign_name: value}));
                        if(formErrors.campaign_name) setFormErrors(prev => ({...prev, campaign_name: null}));
                      }}
                      placeholder="e.g., Summer Sale 2024"
                      type="general"
                      className="glass border-[hsl(var(--border))] rounded-2xl py-3 px-4 focus-brand transition-brand"
                    />
                    {formErrors.campaign_name && <p className="text-[hsl(var(--destructive))] text-sm mt-2 font-medium">{formErrors.campaign_name}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="brand_name" className="text-base font-semibold text-muted-foreground mb-2 block">Brand Name *</Label>
                    <AutoCompleteInput
                      id="brand_name"
                      value={bookingDetails.brand_name}
                      onChange={(value) => {
                         setBookingDetails(prev => ({...prev, brand_name: value}));
                         if(formErrors.brand_name) setFormErrors(prev => ({...prev, brand_name: null}));
                      }}
                      placeholder="e.g., Nike, Coca-Cola"
                      type="brand"
                      className="glass border-[hsl(var(--border))] rounded-2xl py-3 px-4 focus-brand transition-brand"
                    />
                    {formErrors.brand_name && <p className="text-[hsl(var(--destructive))] text-sm mt-2 font-medium">{formErrors.brand_name}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Content Types */}
              <Card className="bg-gradient-to-r from-[hsl(var(--warning))]/5 to-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/30 rounded-2xl overflow-hidden shadow-[var(--shadow-brand)]">
                <CardContent className="p-6">
                  <Label className="text-base font-semibold text-[hsl(var(--warning))] mb-4 block">Content Types *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {contentTypes.map(type => (
                      <div key={type.value} className="flex items-center space-x-3 p-3 glass-strong rounded-xl hover:bg-[hsl(var(--card))] transition-brand">
                        <Checkbox
                          id={type.value}
                          checked={bookingDetails.content_type.includes(type.value)}
                          onCheckedChange={(checked) => handleContentTypeChange(type.value, checked)}
                          className="border-[hsl(var(--border))]"
                        />
                        <Label 
                          htmlFor={type.value} 
                          className={`text-sm font-medium cursor-pointer ${
                            contentWarnings.includes(type.value) 
                              ? 'text-[hsl(var(--destructive))] font-bold' 
                              : 'text-[hsl(var(--warning))]'
                          }`}
                        >
                          {type.label}
                          {contentWarnings.includes(type.value) && (
                            <AlertTriangle className="w-4 h-4 inline ml-1" />
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {contentWarnings.length > 0 && (
                    <Alert className="mt-4 bg-gradient-to-r from-[hsl(var(--destructive))]/5 to-[hsl(var(--destructive))]/10 border-[hsl(var(--destructive))]/50 rounded-xl">
                      <AlertTriangle className="h-4 w-4 text-[hsl(var(--destructive))]" />
                      <AlertTitle className="text-[hsl(var(--destructive))] font-bold">Content Warning</AlertTitle>
                      <AlertDescription className="text-[hsl(var(--destructive))]">
                        This property doesn't allow: {contentWarnings.map(c => contentTypes.find(t => t.value === c)?.label || c).join(', ')}.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Additional Details */}
              <Card className="bg-gradient-to-r from-[hsl(var(--muted))]/50 to-[hsl(var(--secondary))]/20 border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-[var(--shadow-brand)]">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="content_description" className="text-base font-semibold text-muted-foreground mb-2 block">Content Description</Label>
                    <textarea 
                      id="content_description"
                      value={bookingDetails.content_description}
                      onChange={(e) => setBookingDetails(prev => ({...prev, content_description: e.target.value}))}
                      placeholder="Brief description of your advertising content..."
                      className="w-full p-4 border rounded-2xl resize-none h-20 text-sm glass border-[hsl(var(--border))] focus-brand transition-brand"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message" className="text-base font-semibold text-muted-foreground mb-2 block">Message to Property Owner</Label>
                    <textarea 
                      id="message"
                      value={bookingDetails.message}
                      onChange={(e) => setBookingDetails(prev => ({...prev, message: e.target.value}))}
                      placeholder="Hi! I'd like to book this area for our upcoming campaign..."
                      className="w-full p-4 border rounded-2xl resize-none h-24 glass border-[hsl(var(--border))] focus-brand transition-brand"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Booking Summary */}
              <Card className="bg-gradient-to-r from-[hsl(var(--success))]/5 to-[hsl(var(--success))]/10 border-[hsl(var(--success))]/30 rounded-2xl overflow-hidden shadow-[var(--shadow-brand)]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Crown className="w-5 h-5 text-[hsl(var(--success))]" />
                    <h4 className="font-bold text-[hsl(var(--success))] text-lg">Booking Summary</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between p-3 glass-strong rounded-xl">
                      <span className="text-[hsl(var(--success))] font-medium">Dates:</span>
                      <span className="text-[hsl(var(--success))] font-semibold">{selectedDatesArray.length} days selected</span>
                    </div>
                    <div className="flex justify-between p-3 glass-strong rounded-xl">
                      <span className="text-[hsl(var(--success))] font-medium">Daily Rate:</span>
                      <span className="text-[hsl(var(--success))] font-semibold">${area.pricing?.daily_rate}/day</span>
                    </div>
                    <div className="flex justify-between p-4 bg-gradient-to-r from-[hsl(var(--success))]/10 to-[hsl(var(--success))]/20 rounded-xl border-t border-[hsl(var(--success))]">
                      <span className="text-[hsl(var(--success))] font-bold text-lg">Total:</span>
                      <span className="text-[hsl(var(--success))] font-bold text-xl">${calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 3 && (
            <div className="p-6 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--success))]/20 to-[hsl(var(--success))]/10 rounded-full blur-2xl"></div>
                <div className="relative w-20 h-20 bg-gradient-to-r from-[hsl(var(--success))] to-[hsl(var(--success))]/80 rounded-full flex items-center justify-center mx-auto shadow-[var(--shadow-brand-lg)]">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[hsl(var(--success))] to-[hsl(var(--success))]/80 bg-clip-text text-transparent">Request Sent!</h3>
              <p className="text-muted-foreground mb-6 text-lg">
                Your booking request has been sent to the property owner. 
                You'll receive a notification when they respond.
              </p>
              <Card className="bg-gradient-to-r from-[hsl(var(--primary))]/5 to-[hsl(var(--accent-light))]/10 border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-[var(--shadow-brand)]">
                <CardContent className="p-6 text-left">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-[hsl(var(--primary))]" />
                    <h4 className="font-bold text-[hsl(var(--primary))] text-lg">Next Steps</h4>
                  </div>
                  <ul className="space-y-3 text-sm text-[hsl(var(--primary))]">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full"></div>
                      <span className="font-medium">Owner will review your request</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full"></div>
                      <span className="font-medium">You'll receive an invoice if approved</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full"></div>
                      <span className="font-medium">Messages will be available in your inbox</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </ScrollArea>

        <div className="p-6 border-t border-[hsl(var(--border))]">
          {step === 1 && (
            <Button 
              onClick={handleContinue} 
              disabled={!startDate || !endDate || !!conflictError}
              className="w-full btn-gradient py-4 font-bold text-lg rounded-2xl shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand disabled:opacity-50"
            >
              Continue ({selectedDatesArray.length > 0 ? `${selectedDatesArray.length} days selected` : 'Select Dates'})
            </Button>
          )}
          
          {step === 2 && (
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)} 
                className="flex-1 border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-2xl py-3 font-bold transition-brand"
              >
                Back
              </Button>
              <Button 
                onClick={handleConfirm} 
                className="flex-1 btn-gradient rounded-2xl py-3 font-bold shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Request
              </Button>
            </div>
          )}
          
          {step === 3 && (
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={handleClose} 
                className="flex-1 border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-2xl py-3 font-bold transition-brand"
              >
                Close
              </Button>
              <Button 
                onClick={handleClose} 
                className="flex-1 bg-gradient-to-r from-[hsl(var(--success))] to-[hsl(var(--success))]/80 hover:from-[hsl(var(--success))]/90 hover:to-[hsl(var(--success))]/70 text-white rounded-2xl py-3 font-bold shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                View Messages
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}