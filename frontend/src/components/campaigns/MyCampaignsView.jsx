import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, MessageCircle, MapPin, Calendar, DollarSign, CreditCard, AlertTriangle, Clock, HelpCircle, ExternalLink, Edit, Target, TrendingUp, Activity, Zap, Star, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, differenceInDays, isAfter, isBefore, isPast, isWithinInterval } from 'date-fns';
import RequestChangeModal from '../booking/RequestChangeModal';
import CampaignFilterControls from './CampaignFilterControls';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 staggerChildren: 0.07,
 },
 },
};

const itemVariants = {
 hidden: { y: 20, opacity: 0 },
 visible: {
 y: 0,
 opacity: 1,
 transition: {
 type: 'spring',
 stiffness: 120,
 }
 },
 exit: {
 y: -20,
 opacity: 0,
 }
};

const MyCampaignsView = ({
 bookings = [],
 invoices = [],
 allUsers = {},
 allAreasMap = {},
 allPropertiesMap = {},
 currentUser,
}) => {
 const [changeRequest, setChangeRequest] = useState({ isOpen: false, booking: null, space: null });
 const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
 const [searchTerm, setSearchTerm] = useState('');
 const [statusFilter, setStatusFilter] = useState('all');

 const userBookings = useMemo(() => {
 if (!currentUser || !Array.isArray(bookings)) return [];
 return bookings.filter(b => b && b.advertiser_id === currentUser.id);
 }, [bookings, currentUser]);

 const getStatusDetails = (status) => {
 const statusMap = {
 'draft': { text: 'Draft', color: 'bg-[hsl(var(--muted))]/10 text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]', icon: '📝' },
 'pending': { text: 'Pending', color: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]', icon: '⏳' },
 'pending_approval': { text: 'Under Review', color: 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-[hsl(var(--primary))]', icon: '🔍' },
 'confirmed': { text: 'Confirmed', color: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]', icon: '✅' },
 'active': { text: 'Running', color: 'bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] border-[hsl(var(--accent))]', icon: '🚀' },
 'completed': { text: 'Completed', color: 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-[hsl(var(--primary))]', icon: '🎯' },
 'cancelled': { text: 'Cancelled', color: 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]', icon: '❌' },
 'declined': { text: 'Declined', color: 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]', icon: '⚠️' }
 };
 return statusMap[status] || { text: 'Unknown', color: 'bg-[hsl(var(--muted))]/10 text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]', icon: '❓' };
 };

 const getPaymentStatusDetails = (status) => {
 const statusMap = {
 'unpaid': { text: 'Unpaid', color: 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]', icon: '💳' },
 'pending': { text: 'Pending', color: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]', icon: '⏳' },
 'invoice_sent': { text: 'Invoice Sent', color: 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-[hsl(var(--primary))]', icon: '📧' },
 'partial_paid': { text: 'Partial', color: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]', icon: '💰' },
 'paid': { text: 'Paid', color: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]', icon: '✅' },
 'refunded': { text: 'Refunded', color: 'bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] border-[hsl(var(--accent))]', icon: '↩️' },
 'overdue': { text: 'Overdue', color: 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]', icon: '⚠️' }
 };
 return statusMap[status] || { text: 'Unknown', color: 'bg-[hsl(var(--muted))]/10 text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]', icon: '❓' };
 };

 const getCampaignRunStatus = (booking) => {
 if (!booking || !booking.start_date || !booking.end_date) return 'Unknown';
 
 const today = new Date();
 const startDate = new Date(booking.start_date);
 const endDate = new Date(booking.end_date);
 
 if (isBefore(today, startDate)) return 'Scheduled';
 if (isWithinInterval(today, { start: startDate, end: endDate })) return 'Running';
 if (isAfter(today, endDate)) return 'Ended';
 return 'Unknown';
 };

 const filteredBookings = useMemo(() => {
 return userBookings.filter(booking => {
 if (!booking) return false;
 
 const statusMatch = statusFilter === 'all' || booking.status === statusFilter;
 
 const area = allAreasMap[booking.area_id] || {};
 const property = allPropertiesMap[booking.property_id] || {};
 const searchMatch = !searchTerm || 
 (booking.campaign_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
 (area.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
 (property.name || '').toLowerCase().includes(searchTerm.toLowerCase());

 let dateMatch = true;
 if (dateRange.from && dateRange.to && booking.start_date && booking.end_date) {
 const bookingStart = new Date(booking.start_date);
 const bookingEnd = new Date(booking.end_date);
 dateMatch = isWithinInterval(bookingStart, { start: dateRange.from, end: dateRange.to }) ||
 isWithinInterval(bookingEnd, { start: dateRange.from, end: dateRange.to }) ||
 (isBefore(bookingStart, dateRange.from) && isAfter(bookingEnd, dateRange.to));
 }

 return statusMatch && searchMatch && dateMatch;
 });
 }, [userBookings, searchTerm, statusFilter, dateRange, allAreasMap, allPropertiesMap]);
 
 const getCampaignImage = (booking) => {
 if (!booking) return 'https://via.placeholder.com/300x200/6169A7/ffffff?text=Campaign';
 
 const area = allAreasMap[booking.area_id];
 if (area && area.images && area.images.length> 0) {
 return area.images[0];
 }
 return `https://via.placeholder.com/300x200/6169A7/ffffff?text=${encodeURIComponent(booking.campaign_name || 'Campaign')}`;
 };

 const getRunStatusColor = (status) => {
 const colors = {
 'Scheduled': 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-[hsl(var(--primary))]',
 'Running': 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]',
 'Ended': 'bg-[hsl(var(--muted))]/10 text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]',
 'Unknown': 'bg-[hsl(var(--muted))]/10 text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]'
 };
 return colors[status] || colors['Unknown'];
 };

 const handleRequestChange = (booking) => {
 const space = allAreasMap[booking.area_id] || { title: 'Unknown Space' };
 setChangeRequest({ isOpen: true, booking, space });
 };

 const handleCloseChangeRequest = () => {
 setChangeRequest({ isOpen: false, booking: null, space: null });
 };

 const canRequestChange = (booking) => {
 if (!booking) return false;
 
 const validStatuses = ['confirmed', 'pending_approval', 'active'];
 const runStatus = getCampaignRunStatus(booking);
 return validStatuses.includes(booking.status) && ['Scheduled', 'Running'].includes(runStatus);
 };

 return (
 <div className="space-y-8">
 {/* Search and Filters */}
 <CampaignFilterControls
 searchTerm={searchTerm}
 setSearchTerm={setSearchTerm}
 statusFilter={statusFilter}
 setStatusFilter={setStatusFilter}
 dateRange={dateRange}
 setDateRange={setDateRange}
 />

 {/* Campaigns Grid */}
 <AnimatePresence mode="wait">
 {filteredBookings.length> 0 ? (
 <motion.div
 className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
 variants={containerVariants}
 initial="hidden"
 animate="visible"
 exit="hidden"
>
 {filteredBookings.map((booking) => {
 if (!booking) return null;
 
 const statusDetails = getStatusDetails(booking.status);
 const paymentDetails = getPaymentStatusDetails(booking.payment_status);
 const runStatus = getCampaignRunStatus(booking);
 const area = allAreasMap[booking.area_id] || {};
 const property = allPropertiesMap[booking.property_id] || {};
 const owner = allUsers[booking.owner_id] || {};

 return (
 <motion.div
 key={booking.id}
 variants={itemVariants}
 layout
 className="group glass border-[hsl(var(--border))] rounded-3xl overflow-hidden shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand hover:-translate-y-1"
>
 <div className="relative">
 <img 
 src={getCampaignImage(booking)} 
 alt={booking.campaign_name || 'Campaign'} 
 className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
 />
 <div className="absolute top-4 left-4 flex gap-2">
 <Badge className={`${statusDetails.color} backdrop-blur-sm`}>
 {statusDetails.icon} {statusDetails.text}
 </Badge>
 <Badge className={`${getRunStatusColor(runStatus)} backdrop-blur-sm`}>
 {runStatus}
 </Badge>
 </div>
 <div className="absolute top-4 right-4">
 <Badge className={`${paymentDetails.color} backdrop-blur-sm`}>
 {paymentDetails.icon}
 </Badge>
 </div>
 <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
 </div>
 
 <CardContent className="p-6 space-y-4">
 <div>
 <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2 line-clamp-2 group-hover:text-[hsl(var(--primary))] transition-colors">
 {booking.campaign_name || 'Untitled Campaign'}
 </h3>
 <p className="text-sm text-muted-foreground">
 {booking.brand_name || 'Unknown Brand'}
 </p>
 </div>

 <div className="space-y-3">
 <div className="flex items-center gap-2 text-sm">
 <MapPin className="w-4 h-4 text-[hsl(var(--primary))] flex-shrink-0" />
 <span className="font-medium text-[hsl(var(--foreground))] truncate">{area.title || 'Unknown Area'}</span>
 </div>
 <div className="flex items-center gap-2 text-sm">
 <Calendar className="w-4 h-4 text-[hsl(var(--primary))] flex-shrink-0" />
 <span className="text-muted-foreground truncate">
 {booking.start_date && booking.end_date 
 ? `${format(new Date(booking.start_date), 'MMM d')} - ${format(new Date(booking.end_date), 'MMM d, yyyy')}`
 : 'Dates not set'
 }
 </span>
 </div>
 <div className="flex items-center gap-2 text-sm">
 <DollarSign className="w-4 h-4 text-[hsl(var(--success))] flex-shrink-0" />
 <span className="font-bold text-[hsl(var(--success))]">
 ${(booking.total_amount || 0).toLocaleString()}
 </span>
 </div>
 </div>
 </CardContent>

 <CardFooter className="p-6 pt-0 flex gap-2">
 <Button 
 asChild 
 variant="outline" 
 size={20} 
 className="flex-1 glass border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-2xl transition-brand"
>
 <Link to={createPageUrl(`CampaignDetails?id=${booking.campaign_id || booking.id}`)}>
 <Eye className="w-4 h-4 mr-2" /> View
 </Link>
 </Button>
 
 {canRequestChange(booking) && (
 <Button 
 onClick={() => handleRequestChange(booking)}
 variant="outline" 
 size={20} 
 className="flex-1 glass border-[hsl(var(--warning))] hover:bg-[hsl(var(--warning))]/10 rounded-2xl transition-brand"
>
 <Edit className="w-4 h-4 mr-2" /> Edit
 </Button>
 )}
 
 <Button 
 asChild 
 size={20} 
 className="flex-1 btn-gradient rounded-2xl shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand"
>
 <Link to={createPageUrl(`Messages?recipient_id=${booking.owner_id}&booking_id=${booking.id}`)}>
 <MessageCircle className="w-4 h-4 mr-2" /> Message
 </Link>
 </Button>
 </CardFooter>
 </motion.div>
 );
 })}
 </motion.div>
 ) : (
 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key="no-campaigns">
 <Card className="glass border-[hsl(var(--border))] rounded-3xl overflow-hidden shadow-[var(--shadow-brand)]">
 <CardContent className="p-12 text-center">
 <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
 <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-[hsl(var(--muted))] to-[hsl(var(--muted))]/80 rounded-full flex items-center justify-center">
 <Target className="w-10 h-10 text-[hsl(var(--muted-foreground))]" />
 </div>
 </motion.div>
 <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-3">No Campaigns Yet</h3>
 <p className="text-muted-foreground mb-8 max-w-md mx-auto">
 Start your advertising journey by creating your first campaign. Browse available spaces and launch your brand!
 </p>
 <Button 
 asChild 
 className="btn-gradient rounded-2xl px-8 py-3 font-bold shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand"
>
 <Link to={createPageUrl('CreateCampaign')}>
 <Plus className="w-5 h-5 mr-2" /> Create Campaign
 </Link>
 </Button>
 </CardContent>
 </Card>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Request Change Modal */}
 <AnimatePresence>
 {changeRequest.isOpen && (
 <RequestChangeModal
 isOpen={changeRequest.isOpen}
 onClose={handleCloseChangeRequest}
 booking={changeRequest.booking}
 space={changeRequest.space}
 />
 )}
 </AnimatePresence>
 </div>
 );
};

export default MyCampaignsView;