import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Campaign, Invoice, Booking, Message, AdvertisingArea, Property } from '@/api/entities';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, CheckCircle, Target, MapPin, Building, Calendar, DollarSign, Sparkles, Clock, Users } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { format, differenceInDays } from 'date-fns';
import StripeCheckout from '../../components/payments/StripeCheckout';
import { motion, AnimatePresence } from 'framer-motion';

const SuccessScreen = ({ campaign, totalAmount, paymentDetails, countdown }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-12"
  >
    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/25">
      <CheckCircle className="w-12 h-12 text-white" />
    </div>
    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
      Payment Successful!
    </h2>
    <p className="text-xl text-muted-foreground mb-6">
      Your campaign "{campaign?.name}" has been fully booked and paid for.
    </p>
    <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/40 dark:to-emerald-950/40 border border-green-200 dark:border-green-700 rounded-2xl p-6 mb-8 max-w-md mx-auto">
      <p className="text-green-700 dark:text-green-300 font-semibold mb-2">Total Paid</p>
      <p className="text-3xl font-bold text-green-600">${totalAmount.toLocaleString()}</p>
      {paymentDetails?.paymentIntent && (
        <p className="text-sm text-green-600 dark:text-green-400 mt-2">
          Payment ID: {paymentDetails.paymentIntent.id}
        </p>
      )}
    </div>
    <p className="text-muted-foreground mb-6">
      Redirecting to campaign details in {countdown} seconds...
    </p>
    <div className="flex justify-center">
      <div className="w-48 h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 ease-linear"
          style={{ width: `${((5 - countdown) / 5) * 100}%` }}
        />
      </div>
    </div>
  </motion.div>
);

export default function CheckoutPage() {
    const { user } = useUser();
    const [campaign, setCampaign] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [spaces, setSpaces] = useState({});
    const [properties, setProperties] = useState({});
    const [totalAmount, setTotalAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [countdown, setCountdown] = useState(5);
    const [currentUser, setCurrentUser] = useState(null);
    
    const location = useLocation();
    const navigate = useNavigate();

    const getCampaignId = () => new URLSearchParams(location.search).get('campaign_id');

    useEffect(() => {
        if (user) {
            setCurrentUser(user);
            const campaignId = getCampaignId();
            if (campaignId) {
                loadCheckoutData(campaignId);
            } else {
                navigate(createPageUrl('Dashboard'));
            }
        }
    }, [user, location.search]);

    // Countdown timer for redirect
    useEffect(() => {
        if (paymentSuccess && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (paymentSuccess && countdown === 0) {
            navigate(createPageUrl(`CampaignDetails?id=${campaign?.id}`));
        }
    }, [paymentSuccess, countdown, campaign, navigate]);

    const loadCheckoutData = async (campaignId) => {
        setIsLoading(true);
        try {
            if (!user?.id) {
                navigate(createPageUrl('Dashboard'));
                return;
            }

            const [camp, campaignBookings] = await Promise.all([
                Campaign.get(campaignId),
                Booking.filter({ campaign_id: campaignId, status: 'draft' })
            ]);
            
            if (!campaignBookings || campaignBookings.length === 0) {
                navigate(createPageUrl(`CampaignDetails?id=${campaignId}`));
                return;
            }

            setCampaign(camp);
            setBookings(campaignBookings);

            // Load spaces and properties safely
            const spaceIds = [...new Set(campaignBookings.map(b => b.area_id).filter(Boolean))];
            const propertyIds = [...new Set(campaignBookings.map(b => b.property_id).filter(Boolean))];
            
            const spacesMap = {};
            const propertiesMap = {};

            // Load spaces with error handling
            if (spaceIds.length > 0) {
                await Promise.all(spaceIds.map(async (id) => {
                    try {
                        const area = await AdvertisingArea.get(id);
                        spacesMap[id] = area;
                    } catch (error) {
                        console.warn(`Failed to load area ${id}:`, error);
                        spacesMap[id] = { id, title: 'Unknown Area', pricing: { daily_rate: 0 } };
                    }
                }));
            }

            // Load properties with error handling
            if (propertyIds.length > 0) {
                await Promise.all(propertyIds.map(async (id) => {
                    try {
                        const prop = await Property.get(id);
                        propertiesMap[id] = prop;
                    } catch (error) {
                        console.warn(`Failed to load property ${id}:`, error);
                        propertiesMap[id] = { id, name: 'Unknown Property' };
                    }
                }));
            }

            setSpaces(spacesMap);
            setProperties(propertiesMap);
            setTotalAmount(campaignBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0));
        } catch (error) {
            console.error("Error loading checkout data:", error);
            navigate(createPageUrl('Dashboard'));
        }
        setIsLoading(false);
    };

    const handlePaymentSuccess = async (paymentResult) => {
        setIsProcessing(true);
        try {
            const paidDate = new Date().toISOString().split('T')[0];
            const paymentReference = paymentResult.paymentIntent?.id || `STRIPE-${Date.now()}`;

            // Process each booking
            await Promise.all(bookings.map(async (booking) => {
                try {
                    // 1. Create paid Invoice
                    await Invoice.create({
                        campaign_id: booking.campaign_id,
                        booking_id: booking.id,
                        invoice_number: `INV-${booking.id}-${Date.now()}`,
                        advertiser_id: booking.advertiser_id,
                        owner_id: booking.owner_id,
                        amount: booking.total_amount,
                        tax_amount: 0,
                        status: 'paid',
                        payment_method: 'stripe',
                        due_date: paidDate,
                        paid_date: paidDate,
                        payment_reference: paymentReference
                    });

                    // 2. Update booking status
                    const needsApproval = booking.approval_required;
                    await Booking.update(booking.id, {
                        payment_status: 'paid',
                        status: needsApproval ? 'pending_approval' : 'confirmed'
                    });

                    // 3. If auto-approved, update space status
                    if (!needsApproval) {
                        await AdvertisingArea.update(booking.area_id, {
                            status: 'booked'
                        });
                    }

                    // 4. Send notifications
                    const space = spaces[booking.area_id] || {};
                    const property = properties[booking.property_id] || {};
                    
                    if (needsApproval) {
                        await Message.create({
                            sender_id: booking.advertiser_id,
                            recipient_id: booking.owner_id,
                            content: `🔍 New paid booking requires approval: "${space.title || 'Space'}" at ${property.name || 'Property'} for campaign "${campaign.name}". Payment of ${booking.total_amount} has been received.`,
                            message_type: 'booking_approval_request',
                            booking_id: booking.id,
                            area_id: booking.area_id,
                            property_id: booking.property_id
                        });
                    } else {
                        await Message.create({
                            sender_id: booking.advertiser_id,
                            recipient_id: booking.owner_id,
                            content: `✅ New booking confirmed: "${space.title || 'Space'}" at ${property.name || 'Property'} for campaign "${campaign.name}". Payment of ${booking.total_amount} received.`,
                            message_type: 'booking_confirmed',
                            booking_id: booking.id,
                            area_id: booking.area_id,
                            property_id: booking.property_id
                        });
                    }

                    // Payment confirmation to advertiser
                    await Message.create({
                        sender_id: booking.owner_id,
                        recipient_id: booking.advertiser_id,
                        content: `💳 Payment confirmed for "${space.title || 'Space'}" booking. ${needsApproval ? 'Awaiting owner approval.' : 'Your booking is now active!'}`,
                        message_type: 'payment_received',
                        booking_id: booking.id
                    });

                } catch (bookingError) {
                    console.error(`Error processing booking ${booking.id}:`, bookingError);
                }
            }));

            // Update campaign status
            await Campaign.update(campaign.id, { 
                status: 'active',
                aggregated_cost: totalAmount 
            });

            setPaymentDetails(paymentResult);
            setPaymentSuccess(true);
        } catch (error) {
            console.error("Error processing payment:", error);
            alert('Payment succeeded but there was an error finalizing your bookings. Please contact support.');
        }
        setIsProcessing(false);
    };

    const handlePaymentError = (error) => {
        console.error('Payment failed:', error);
        // Error is already handled in the StripeCheckout component
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[hsl(var(--primary))]" />
                    <p className="text-muted-foreground font-semibold text-lg">Loading checkout details...</p>
                </div>
            </div>
        );
    }

    if (!campaign || bookings.length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-md w-full glass-strong border-[hsl(var(--border))] rounded-3xl p-8 text-center">
                    <p className="text-muted-foreground mb-6">No items found for checkout.</p>
                    <Button onClick={() => navigate(createPageUrl('Dashboard'))} className="btn-gradient text-white rounded-2xl">
                        Return to Dashboard
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <AnimatePresence mode="wait">
                    {paymentSuccess ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-2xl mx-auto"
                        >
                            <Card className="glass-strong border-green-200/50 dark:border-green-700/50 rounded-3xl overflow-hidden">
                                <CardContent className="p-8">
                                    <SuccessScreen 
                                        campaign={campaign}
                                        totalAmount={totalAmount}
                                        paymentDetails={paymentDetails}
                                        countdown={countdown}
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="checkout"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            {/* Order Summary */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <Button
                                        variant="ghost"
                                        onClick={() => navigate(createPageUrl('Dashboard'))}
                                        className="p-2 hover:bg-[hsl(var(--muted))] rounded-2xl"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>
                                    <div>
                                        <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
                                        <p className="text-muted-foreground">Complete your campaign booking</p>
                                    </div>
                                </div>

                                <Card className="glass-strong border-[hsl(var(--border))] rounded-3xl overflow-hidden">
                                    <CardHeader className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))] p-6">
                                        <CardTitle className="flex items-center gap-3 text-foreground">
                                            <Target className="w-6 h-6 text-[hsl(var(--primary))]" />
                                            {campaign.name}
                                        </CardTitle>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {format(new Date(campaign.start_date), 'MMM d')} - {format(new Date(campaign.end_date), 'MMM d, yyyy')}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {campaign.brand_name}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <ScrollArea className="max-h-96">
                                            <div className="space-y-4">
                                                {bookings.map((booking, index) => {
                                                    const space = spaces[booking.area_id] || {};
                                                    const property = properties[booking.property_id] || {};
                                                    const duration = differenceInDays(new Date(booking.end_date), new Date(booking.start_date)) + 1;
                                                    
                                                    return (
                                                        <div key={booking.id} className="flex items-start gap-4 p-4 bg-[hsl(var(--muted))] rounded-2xl border border-[hsl(var(--border))]">
                                                            <div className="w-16 h-12 bg-[hsl(var(--accent-light))] rounded-xl flex items-center justify-center flex-shrink-0">
                                                                {space.images?.[0] ? (
                                                                    <img src={space.images[0]} alt={space.title} className="w-full h-full object-cover rounded-xl" />
                                                                ) : (
                                                                    <Building className="w-6 h-6 text-[hsl(var(--primary))]" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-bold text-foreground truncate">{space.title || 'Advertising Space'}</h4>
                                                                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                                                    <MapPin className="w-3 h-3" />
                                                                    <span className="truncate">{property.name || 'Property'}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {duration} days
                                                                    </Badge>
                                                                    <div className="text-right">
                                                                        <p className="font-bold text-green-600">${booking.total_amount?.toLocaleString()}</p>
                                                                        {booking.approval_required && (
                                                                            <p className="text-xs text-yellow-600">Needs approval</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </ScrollArea>
                                        
                                        <Separator className="my-6" />
                                        
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Subtotal ({bookings.length} spaces)</span>
                                                <span className="font-medium">${totalAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Processing Fee</span>
                                                <span className="font-medium">$0</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                                <span>Total</span>
                                                <span className="text-green-600">${totalAmount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Payment Section */}
                            <div>
                                <Card className="glass-strong border-[hsl(var(--border))] rounded-3xl overflow-hidden sticky top-8">
                                    <CardContent className="p-8">
                                        {isProcessing ? (
                                            <div className="text-center py-12">
                                                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[hsl(var(--primary))]" />
                                                <h3 className="text-xl font-bold mb-2">Processing Payment...</h3>
                                                <p className="text-muted-foreground">Please wait while we finalize your bookings.</p>
                                            </div>
                                        ) : (
                                            <StripeCheckout
                                                amount={totalAmount}
                                                onSuccess={handlePaymentSuccess}
                                                onError={handlePaymentError}
                                                customerInfo={{
                                                    name: currentUser?.full_name || 'Customer',
                                                    email: currentUser?.email || 'customer@example.com'
                                                }}
                                                description={`Campaign: ${campaign.name}`}
                                                isOpen={true}
                                            />
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}