import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { User, Calendar, MapPin, DollarSign, Check, X, Loader2, MessageSquare, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Booking, Message } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function BookingManagementCard({ campaignGroup, onUpdate }) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleResponse = async (newStatus) => {
        setIsProcessing(true);
        try {
            const updatePromises = campaignGroup.bookings.map(booking => 
                Booking.update(booking.id, { status: newStatus })
            );
            await Promise.all(updatePromises);
            
            const messageContent = newStatus === 'confirmed'
                ? `🚀 Great news! Your campaign "${campaignGroup.campaignName}" has been approved.`
                : `⚠️ Update on your campaign "${campaignGroup.campaignName}": The property owner has declined the request.`;

            // Send one message for the whole campaign
            await Message.create({
                sender_id: campaignGroup.bookings[0].owner_id,
                recipient_id: campaignGroup.advertiser.id,
                content: messageContent,
                message_type: newStatus === 'confirmed' ? 'booking_approved' : 'booking_declined',
                booking_id: campaignGroup.bookings[0].id, // Link to first booking
                system_data: { campaign_id: campaignGroup.campaignId }
            });

            onUpdate(); // Trigger parent to reload data
        } catch (error) {
            console.error(`Error ${newStatus === 'confirmed' ? 'approving' : 'declining'} campaign:`, error);
        }
        setIsProcessing(false);
    };

    const getStatusDetails = (status) => {
        const details = {
            'pending_approval': { text: 'Approval Required', color: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]', icon: <AlertTriangle className="w-4 h-4" /> },
            'pending': { text: 'Pending', color: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]', icon: <AlertTriangle className="w-4 h-4" /> },
            'confirmed': { text: 'Confirmed', color: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]', icon: <Check className="w-4 h-4" /> },
            'active': { text: 'Active', color: 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-[hsl(var(--primary))]', icon: <Check className="w-4 h-4" /> },
        };
        return details[campaignGroup.status] || { text: 'Unknown', color: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]', icon: null };
    };

    const statusDetails = getStatusDetails(campaignGroup.status);

    return (
        <Card className="glass border-[hsl(var(--border))] rounded-3xl shadow-[var(--shadow-brand)] overflow-hidden">
            <CardHeader className="p-6 bg-gradient-to-r from-[hsl(var(--muted))]/50 to-[hsl(var(--accent-light))]/30 border-b border-[hsl(var(--border))]">
                <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                        <Badge className={`mb-2 ${statusDetails.color} flex items-center gap-1`}>
                            {statusDetails.icon} {statusDetails.text}
                        </Badge>
                        <CardTitle className="text-2xl font-bold text-[hsl(var(--foreground))]">{campaignGroup.campaignName}</CardTitle>
                        <CardDescription className="text-md text-muted-foreground">Brand: {campaignGroup.brandName}</CardDescription>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-2 text-muted-foreground">
                            <User className="w-4 h-4" />
                            <span>{campaignGroup.advertiser.full_name}</span>
                        </div>
                        <div className="flex items-center justify-end gap-2 text-muted-foreground">
                            <DollarSign className="w-4 h-4" />
                            <span>Total Value: ${campaignGroup.totalAmount.toLocaleString()}</span>
                        </div>
                         <div className="flex items-center justify-end gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(campaignGroup.startDate), 'MMM d, yyyy')} - {format(new Date(campaignGroup.endDate), 'MMM d, yyyy')}</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1" className="border-b-0">
                        <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-[hsl(var(--primary))] hover:no-underline">
                            Show Booked Spaces ({campaignGroup.bookings.length})
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 bg-[hsl(var(--muted))]/20">
                            <div className="space-y-4">
                                {campaignGroup.bookings.map(booking => (
                                    <div key={booking.id} className="p-4 glass-strong rounded-xl border border-[hsl(var(--border))] flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-[hsl(var(--foreground))]">{booking.area?.title || 'Loading...'}</p>
                                            <p className="text-sm text-muted-foreground">${booking.total_amount.toLocaleString()}</p>
                                        </div>
                                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="capitalize">{booking.status.replace('_', ' ')}</Badge>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
            {campaignGroup.status !== 'confirmed' && campaignGroup.status !== 'active' && (
                <CardFooter className="p-6 glass-strong border-t border-[hsl(var(--border))] flex justify-end gap-4">
                    <Button variant="outline" asChild className="border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-xl transition-brand">
                        <Link to={createPageUrl(`Messages?recipient_id=${campaignGroup.advertiser.id}&campaign_id=${campaignGroup.campaignId}`)}>
                            <MessageSquare className="w-4 h-4 mr-2" /> Message Advertiser
                        </Link>
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => handleResponse('declined')}
                        disabled={isProcessing}
                        className="rounded-xl transition-brand"
                    >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-2" /> Decline All</>}
                    </Button>
                    <Button
                        onClick={() => handleResponse('confirmed')}
                        disabled={isProcessing}
                        className="bg-gradient-to-r from-[hsl(var(--success))] to-[hsl(var(--success))]/80 hover:from-[hsl(var(--success))]/90 hover:to-[hsl(var(--success))]/70 text-white rounded-xl transition-brand"
                    >
                         {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Approve All</>}
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}