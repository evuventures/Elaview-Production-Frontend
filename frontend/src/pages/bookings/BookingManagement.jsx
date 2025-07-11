import React, { useState, useEffect, useMemo } from 'react';
import { Booking, AdvertisingArea, Property } from '@/api/entities';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Inbox, Target, Search } from 'lucide-react';
import BookingManagementCard from '@/components/booking/BookingManagementCard';
import { Input } from '@/components/ui/input';

export default function BookingManagementPage() {
    const { user } = useUser();
    const [campaignGroups, setCampaignGroups] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user) {
            loadBookingData();
        }
    }, [user]);

    const loadBookingData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (!user?.id) {
                setCampaignGroups({});
                setIsLoading(false);
                return;
            }

            const allBookings = await Booking.filter({ 
                owner_id: user.id,
                status: { $in: ['pending', 'pending_approval', 'confirmed', 'active'] } 
            });

            if (!allBookings || allBookings.length === 0) {
                setCampaignGroups({});
                setIsLoading(false);
                return;
            }

            const advertiserIds = [...new Set(allBookings.map(b => b.advertiser_id))];
            const areaIds = [...new Set(allBookings.map(b => b.area_id))];
            
            // Note: We'll need to replace User.get with actual API calls to get user data
            const [areasData] = await Promise.all([
                Promise.all(areaIds.map(id => AdvertisingArea.get(id)))
            ]);

            // TODO: Replace with actual API calls to get advertiser data
            const advertisers = {}; // placeholder
            const areas = areasData.reduce((acc, area) => ({ ...acc, [area.id]: area }), {});
            
            const groupedByCampaign = allBookings.reduce((acc, booking) => {
                const campaignId = booking.campaign_id;
                if (!acc[campaignId]) {
                    acc[campaignId] = {
                        campaignId,
                        campaignName: booking.campaign_name,
                        brandName: booking.brand_name,
                        advertiser: advertisers[booking.advertiser_id],
                        bookings: [],
                        totalAmount: 0,
                        startDate: booking.start_date,
                        endDate: booking.end_date,
                        status: 'pending_approval'
                    };
                }
                
                acc[campaignId].bookings.push({
                    ...booking,
                    area: areas[booking.area_id]
                });
                acc[campaignId].totalAmount += booking.total_amount;
                
                // Logic to determine overall status
                if (acc[campaignId].bookings.some(b => b.status === 'pending_approval')) {
                    acc[campaignId].status = 'pending_approval';
                } else if (acc[campaignId].bookings.some(b => b.status === 'pending')) {
                    acc[campaignId].status = 'pending';
                } else {
                    acc[campaignId].status = 'confirmed';
                }

                return acc;
            }, {});

            setCampaignGroups(groupedByCampaign);
        } catch (e) {
            console.error("Error loading booking data:", e);
            setError("Failed to load booking requests.");
        }
        setIsLoading(false);
    };

    const handleUpdateRequest = async () => {
        await loadBookingData();
    };

    const filteredCampaigns = useMemo(() => {
        if (!searchTerm) return Object.values(campaignGroups);
        const lowercasedFilter = searchTerm.toLowerCase();
        return Object.values(campaignGroups).filter(group => {
            return (
                group.campaignName?.toLowerCase().includes(lowercasedFilter) ||
                group.brandName?.toLowerCase().includes(lowercasedFilter) ||
                group.advertiser?.full_name.toLowerCase().includes(lowercasedFilter)
            );
        });
    }, [searchTerm, campaignGroups]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-16 h-16 animate-spin text-[hsl(var(--primary))]" />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <Card className="card-brand glass-strong border-[hsl(var(--border))] rounded-3xl shadow-xl mb-8">
                    <CardHeader className="p-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-4xl font-bold text-gradient-brand flex items-center gap-3">
                                    <Target className="w-8 h-8 text-[hsl(var(--primary))]" />
                                    Booking Requests
                                </CardTitle>
                                <CardDescription className="text-lg text-muted-foreground mt-2">
                                    Manage incoming campaign requests for your properties.
                                </CardDescription>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    placeholder="Search campaigns..."
                                    className="pl-10 pr-4 py-3 w-72 bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl focus-brand"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {error && <p className="text-center text-red-500">{error}</p>}
                
                {filteredCampaigns.length > 0 ? (
                    <div className="space-y-6">
                        {filteredCampaigns.map(group => (
                            <BookingManagementCard 
                                key={group.campaignId} 
                                campaignGroup={group} 
                                onUpdate={handleUpdateRequest}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Inbox className="w-24 h-24 mx-auto text-gray-400" />
                        <h3 className="mt-4 text-2xl font-semibold">All Caught Up!</h3>
                        <p className="mt-2 text-gray-500">You have no new booking requests at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}