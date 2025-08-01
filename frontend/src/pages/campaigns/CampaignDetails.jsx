import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Campaign, Booking, Space, Property } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Target, Calendar, DollarSign, Building, Sparkles, CreditCard, Eye } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { createPageUrl } from '@/utils';

const getStatusDetails = (status) => {
    switch (status) {
      case 'draft': return { text: 'Draft', color: 'bg-gray-400', icon: <Sparkles className="w-3 h-3" /> };
      case 'active': return { text: 'Active', color: 'bg-green-500', icon: <Sparkles className="w-3 h-3" /> };
      case 'completed': return { text: 'Completed', color: 'bg-blue-500', icon: <Sparkles className="w-3 h-3" /> };
      case 'cancelled': return { text: 'Cancelled', color: 'bg-red-500', icon: <Sparkles className="w-3 h-3" /> };
      default: return { text: 'Planning', color: 'bg-yellow-500', icon: <Sparkles className="w-3 h-3" /> };
    }
};

export default function CampaignDetailsPage() {
  const [campaign, setCampaign] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [spaces, setSpaces] = useState({});
  const [properties, setProperties] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();

  const getCampaignId = () => {
    const params = new URLSearchParams(location.search);
    return params.get('id');
  };

  useEffect(() => {
    const campaignId = getCampaignId();
    if (campaignId) {
      loadCampaignDetails(campaignId);
    } else {
      setIsLoading(false);
    }
  }, [location.search]);

  const loadCampaignDetails = async (campaignId) => {
    setIsLoading(true);
    try {
      const camp = await Campaign.get(campaignId);
      setCampaign(camp);

      const campaignBookings = await Booking.filter({ campaign_id: campaignId });
      setBookings(campaignBookings);

      const spaceIds = [...new Set(campaignBookings.map(b => b.area_id))];
      const spacesData = await Promise.all(spaceIds.map(id => Space.get(id)));
      const spacesMap = spacesData.reduce((acc, space) => ({...acc, [space.id]: space}), {});
      setSpaces(spacesMap);

      const propertyIds = [...new Set(spacesData.map(s => s.property_id))];
      const propertiesData = await Promise.all(propertyIds.map(id => Property.get(id)));
      const propertiesMap = propertiesData.reduce((acc, prop) => ({...acc, [prop.id]: prop}), {});
      setProperties(propertiesMap);

    } catch (error) {
      console.error("Error loading campaign details:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const totalCost = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const paidBookings = bookings.filter(b => b.payment_status === 'paid');
  const isFullyPaid = paidBookings.length === bookings.length && bookings.length > 0;

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-[hsl(var(--primary))]" /></div>;
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-8">
        <Card className="max-w-md w-full card-brand"><CardHeader><CardTitle>Campaign Not Found</CardTitle></CardHeader><CardContent><p>The requested campaign could not be found.</p></CardContent></Card>
      </div>
    );
  }

  const statusDetails = getStatusDetails(campaign.status);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Button onClick={() => navigate(createPageUrl('Dashboard'))} variant="ghost" className="mb-6 text-[hsl(var(--primary))] font-bold">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        
        {/* Header Card */}
        <Card className="mb-8 card-brand glass-strong border-[hsl(var(--border))] shadow-[var(--shadow-brand)] rounded-3xl overflow-hidden">
          <CardHeader className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-lg">
                        <Target className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-bold">{campaign.name}</CardTitle>
                        <CardDescription className="text-xl text-muted-foreground">{campaign.brand_name}</CardDescription>
                    </div>
                </div>
                {!isFullyPaid && (
                  <Link to={createPageUrl(`Checkout?campaign_id=${campaign.id}`)}>
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl py-3 text-lg font-bold shadow-lg hover:shadow-xl transition-brand">
                        <CreditCard className="mr-2 h-5 w-5"/> Pay Now
                    </Button>
                  </Link>
                )}
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Details */}
            <div className="lg:col-span-1 space-y-8">
                <Card className="card-brand glass border-[hsl(var(--border))] rounded-3xl shadow-lg">
                    <CardHeader><CardTitle>Campaign Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <div className="flex items-center justify-between">
                            <span className="font-medium flex items-center gap-2"><Sparkles className="w-4 h-4 text-[hsl(var(--primary))]"/>Status</span>
                            <Badge className={`capitalize text-white ${statusDetails.color}`}>{statusDetails.text}</Badge>
                        </div>
                         <div className="flex items-center justify-between">
                            <span className="font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-[hsl(var(--primary))]"/>Dates</span>
                            <span>{format(new Date(campaign.start_date), 'MMM d, yyyy')} - {format(new Date(campaign.end_date), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-medium flex items-center gap-2"><Building className="w-4 h-4 text-[hsl(var(--primary))]"/>Spaces</span>
                            <span>{bookings.length}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="card-brand glass border-[hsl(var(--border))] rounded-3xl shadow-lg">
                    <CardHeader><CardTitle>Financials</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span className="font-medium flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-500"/>Total Cost</span>
                            <span className="font-bold text-lg text-foreground">${totalCost.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span className="font-medium flex items-center gap-2"><CreditCard className="w-4 h-4 text-green-500"/>Payment Status</span>
                            <Badge variant={isFullyPaid ? 'success' : 'warning'} className={isFullyPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {isFullyPaid ? 'Fully Paid' : 'Payment Due'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Booked Spaces */}
            <div className="lg:col-span-2">
                <Card className="card-brand glass border-[hsl(var(--border))] rounded-3xl shadow-lg h-full">
                    <CardHeader><CardTitle>Booked Advertising Spaces ({bookings.length})</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {bookings.map(booking => {
                                const space = spaces[booking.area_id];
                                const property = properties[space?.property_id];
                                if (!space || !property) return null;

                                return (
                                    <Card key={booking.id} className="group glass border border-[hsl(var(--border))] rounded-2xl overflow-hidden hover:shadow-md transition-brand">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <img
                                                src={space.images?.[0] || 'https://via.placeholder.com/100x75'}
                                                alt={space.title}
                                                className="w-24 h-20 object-cover rounded-xl"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-bold text-md text-foreground">{space.title}</h4>
                                                <p className="text-sm text-muted-foreground">{property.name}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <Badge variant="outline" className="text-xs">{space.type.replace('_', ' ')}</Badge>
                                                    <span className="font-bold text-green-600">${booking.total_amount.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <Link to={createPageUrl(`Map?property_id=${property.id}`)}>
                                                <Button size="sm" variant="ghost" className="rounded-xl"><Eye className="w-4 h-4 mr-2"/>View</Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}