import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Target, Calendar, DollarSign, AlertTriangle, Loader2, MapPin, Building, Sparkles } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Booking, Campaign } from '@/api/entities';
import { useUser } from '@clerk/clerk-react';
import { createPageUrl } from '@/utils';

export default function MultiSpaceBookingModal({ 
 isOpen, 
 onClose, 
 selectedAreas, 
 campaign,
 properties,
 onConfirm
}) {
 const { user } = useUser();
 const [bookingDetails, setBookingDetails] = useState([]);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const navigate = useNavigate();

 useEffect(() => {
 if (isOpen && campaign && selectedAreas.length> 0) {
 const details = selectedAreas.map(area => {
 const dailyRate = area.pricing?.daily_rate || 100; // Fallback rate
 const duration = differenceInDays(new Date(campaign.end_date), new Date(campaign.start_date)) + 1;
 const totalAmount = dailyRate * duration;
 
 const prohibited = area.content_restrictions?.prohibited_content || [];
 const campaignContent = campaign.content_type || [];
 const needsApproval = campaignContent.some(type => prohibited.includes(type));

 return { area, totalAmount, needsApproval };
 });
 setBookingDetails(details);
 }
 }, [isOpen, campaign, selectedAreas]);

 const handleConfirm = async () => {
 if (!campaign || !selectedAreas.length || !user?.id) return;
 
 setIsSubmitting(true);
 try {
 await Promise.all(
 bookingDetails.map(async (detail) => {
 const property = properties[detail.area.property_id];
 await Booking.create({
 campaign_id: campaign.id,
 area_id: detail.area.id,
 property_id: detail.area.property_id,
 advertiser_id: user.id,
 owner_id: property?.owner_id,
 start_date: format(new Date(campaign.start_date), 'yyyy-MM-dd'),
 end_date: format(new Date(campaign.end_date), 'yyyy-MM-dd'),
 total_amount: detail.totalAmount,
 campaign_name: campaign.name,
 brand_name: campaign.brand_name,
 status: 'draft',
 payment_status: 'unpaid',
 approval_required: detail.needsApproval
 });
 })
 );

 // Update campaign status to show it's ready for payment
 await Campaign.update(campaign.id, { status: 'planning' });

 onClose(); // Close this modal
 navigate(createPageUrl(`Checkout?campaign_id=${campaign.id}`)); // Redirect to checkout

 } catch (error) {
 console.error('Error creating draft bookings:', error);
 alert('Error creating bookings. Please try again.');
 }
 setIsSubmitting(false);
 };

 if (!isOpen || !campaign) return null;

 const totalCampaignCost = bookingDetails.reduce((sum, detail) => sum + detail.totalAmount, 0);

 return (
 <Dialog open={isOpen} onOpenChange={onClose}>
 <DialogContent className="max-w-4xl glass border-[hsl(var(--border))] rounded-3xl shadow-[var(--shadow-brand-lg)]">
 <DialogHeader className="p-8 border-b border-[hsl(var(--border))]">
 <DialogTitle className="text-3xl font-bold text-[hsl(var(--foreground))] flex items-center gap-3">
 <Target className="w-8 h-8 text-[hsl(var(--primary))]" />
 Confirm Your Campaign
 </DialogTitle>
 <DialogDescription className="text-lg text-muted-foreground">
 Review your selections for "{campaign.name}" before proceeding.
 </DialogDescription>
 </DialogHeader>
 
 <div className="p-8 max-h-[60vh]">
 <ScrollArea className="h-full pr-4">
 <div className="space-y-6">
 <Card className="bg-gradient-to-r from-[hsl(var(--muted))]/80 to-[hsl(var(--accent-light))]/30 border-[hsl(var(--border))] rounded-2xl p-6">
 <h3 className="text-xl font-bold text-[hsl(var(--primary))] mb-4">Campaign Summary</h3>
 <div className="grid grid-cols-2 gap-4 text-lg">
 <div className="flex items-center gap-2">
 <Calendar className="w-5 h-5 text-[hsl(var(--primary))]" />
 <span>{format(new Date(campaign.start_date), 'MMM d, yyyy')} - {format(new Date(campaign.end_date), 'MMM d, yyyy')}</span>
 </div>
 <div className="flex items-center gap-2">
 <Sparkles className="w-5 h-5 text-[hsl(var(--primary))]" />
 <span>{campaign.brand_name}</span>
 </div>
 </div>
 </Card>

 <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Selected Spaces ({bookingDetails.length})</h3>
 
 <div className="space-y-4">
 {bookingDetails.map((detail, index) => (
 <Card key={index} className="glass-strong border-[hsl(var(--border))] rounded-2xl overflow-hidden">
 <CardContent className="p-4 flex justify-between items-center">
 <div className="flex-1">
 <div className="flex items-center gap-2">
 <MapPin className="w-4 h-4 text-[hsl(var(--primary))]" />
 <p className="font-bold text-[hsl(var(--foreground))]">{detail.area.title}</p>
 </div>
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <Building className="w-4 h-4" />
 {properties[detail.area.property_id]?.name || '...'}
 </div>
 {detail.needsApproval && (
 <Badge variant="destructive" className="badge-destructive mt-2 text-xs">
 <AlertTriangle className="w-3 h-3 mr-1" />
 Owner Approval Required
 </Badge>
 )}
 </div>
 <div className="text-right">
 <p className="text-xl font-bold text-[hsl(var(--success))]">${detail.totalAmount.toLocaleString()}</p>
 <p className="text-xs text-muted-foreground">for {differenceInDays(new Date(campaign.end_date), new Date(campaign.start_date)) + 1} days</p>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 </ScrollArea>
 </div>
 
 <DialogFooter className="p-8 border-t border-[hsl(var(--border))] glass-strong rounded-b-3xl">
 <div className="w-full flex justify-between items-center">
 <div>
 <p className="text-sm text-muted-foreground">Total Campaign Cost</p>
 <p className="text-4xl font-bold bg-gradient-brand bg-clip-text text-transparent">
 ${totalCampaignCost.toLocaleString()}
 </p>
 </div>
 <Button 
 onClick={handleConfirm} 
 disabled={isSubmitting}
 size={32}
 className="btn-gradient btn-xl font-bold shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand"
>
 {isSubmitting ? (
 <Loader2 className="mr-2 h-5 w-5 animate-spin" />
 ) : (
 <DollarSign className="mr-2 h-5 w-5" />
 )}
 Proceed to Payment
 </Button>
 </div>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 );
}