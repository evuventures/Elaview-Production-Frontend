import React, { useState, useEffect, useMemo } from 'react';
// REMOVE Base44 User import and replace with Clerk
import { useAuth, useUser } from '@clerk/clerk-react';
import { Invoice, Booking, Space } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
 FileText,
 Download,
 Eye,
 Send,
 DollarSign,
 Calendar,
 AlertCircle,
 Loader2,
 Plus,
 Clock,
 CheckCircle,
 AlertTriangle,
 Search,
 TrendingUp,
 CreditCard,
 Sparkles,
 Zap,
 Filter,
 BarChart3
} from 'lucide-react';
import { format, addDays, isPast } from 'date-fns';
import InvoiceModal from '../../components/invoices/InvoiceModal';
import MockPaymentModal from '../../components/payments/MockPaymentModal';

// Mock data for invoices since we don't have real backend yet
const mockInvoices = [
 {
 id: 'inv_1',
 invoice_number: 'INV-2024-001',
 advertiser_id: 'user2',
 owner_id: 'user1',
 booking_id: 'book_1',
 amount: 2500,
 due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0], // 7 days from now
 status: 'sent',
 created_date: new Date().toISOString()
 },
 {
 id: 'inv_2',
 invoice_number: 'INV-2024-002',
 advertiser_id: 'user1',
 owner_id: 'user3',
 booking_id: 'book_2',
 amount: 1800,
 due_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0], // 2 days ago (overdue)
 status: 'viewed',
 created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
 },
 {
 id: 'inv_3',
 invoice_number: 'INV-2024-003',
 advertiser_id: 'user3',
 owner_id: 'user1',
 booking_id: 'book_3',
 amount: 3200,
 due_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0],
 status: 'paid',
 paid_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString().split('T')[0],
 created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString()
 }
];

const mockUsers = {
 'user1': { id: 'user1', full_name: 'Current User' },
 'user2': { id: 'user2', full_name: 'Sarah Johnson' },
 'user3': { id: 'user3', full_name: 'Mike Chen' }
};

const mockBookings = [
 { id: 'book_1', space_id: 'space_1' },
 { id: 'book_2', space_id: 'space_2' },
 { id: 'book_3', space_id: 'space_3' }
];

const mockSpaces = {
 'space_1': { id: 'space_1', name: 'Downtown Billboard' },
 'space_2': { id: 'space_2', name: 'Highway Display' },
 'space_3': { id: 'space_3', name: 'Mall Screen' }
};

export default function InvoicesPage() {
 const [invoices, setInvoices] = useState([]);
 const [bookings, setBookings] = useState([]);
 const [spaces, setSpaces] = useState({});
 const [users, setUsers] = useState({});
 const [isLoading, setIsLoading] = useState(true);
 const [selectedInvoice, setSelectedInvoice] = useState(null);
 const [invoiceToPay, setInvoiceToPay] = useState(null);
 const [searchTerm, setSearchTerm] = useState('');
 const [statusFilter, setStatusFilter] = useState('all');

 // Use Clerk instead of Base44
 const { isSignedIn, isLoaded } = useAuth();
 const { user: currentUser } = useUser();

 useEffect(() => {
 if (isLoaded) {
 loadData();
 }
 }, [isLoaded]);

 const loadData = async () => {
 setIsLoading(true);
 try {
 if (!isSignedIn || !currentUser) {
 setIsLoading(false);
 return;
 }

 console.log('Loading invoices for user:', currentUser.fullName || currentUser.firstName);

 // Use mock data for now (replace with real API calls later)
 setInvoices(mockInvoices);
 setBookings(mockBookings);
 setSpaces(mockSpaces);
 setUsers(mockUsers);

 console.log('Mock invoices loaded successfully');
 } catch (error) {
 console.error('Error loading data:', error);
 }
 setIsLoading(false);
 };

 const getStatusColor = (status) => {
 switch (status) {
 case 'draft':
 return 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600';
 case 'sent':
 return 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-950/40 dark:to-cyan-950/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600';
 case 'viewed':
 return 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-950/40 dark:to-orange-950/40 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-600';
 case 'paid':
 return 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950/40 dark:to-emerald-950/40 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-600';
 case 'overdue':
 return 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-950/40 dark:to-pink-950/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-600';
 case 'cancelled':
 return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
 default:
 return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
 }
 };

 const filteredInvoices = useMemo(() => {
 let currentInvoices = invoices;

 if (searchTerm) {
 const lowerCaseSearchTerm = searchTerm.toLowerCase();
 currentInvoices = currentInvoices.filter(
 invoice =>
 invoice.invoice_number.toLowerCase().includes(lowerCaseSearchTerm) ||
 users[invoice.advertiser_id]?.full_name.toLowerCase().includes(lowerCaseSearchTerm) ||
 users[invoice.owner_id]?.full_name.toLowerCase().includes(lowerCaseSearchTerm)
 );
 }

 if (statusFilter !== 'all') {
 currentInvoices = currentInvoices.filter(invoice => {
 const actualStatus = isPast(new Date(invoice.due_date)) && invoice.status !== 'paid' ? 'overdue' : invoice.status;
 return actualStatus === statusFilter;
 });
 }

 return currentInvoices;
 }, [invoices, searchTerm, statusFilter, users]);

 const stats = useMemo(() => {
 const total = filteredInvoices.length;
 const paid = filteredInvoices.filter(i => i.status === 'paid').length;
 const pending = filteredInvoices.filter(i => ['sent', 'viewed'].includes(i.status)).length;
 const overdue = filteredInvoices.filter(i => isPast(new Date(i.due_date)) && i.status !== 'paid').length;
 const totalRevenue = filteredInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0);
 return { total, paid, pending, overdue, totalRevenue };
 }, [filteredInvoices]);

 const handleSendInvoice = async (invoiceId) => {
 try {
 console.log('Mock: Sending invoice', invoiceId);
 // Mock sending invoice (replace with real API call later)
 setInvoices(prev => prev.map(inv => 
 inv.id === invoiceId ? { ...inv, status: 'sent' } : inv
 ));
 } catch (error) {
 console.error('Error sending invoice:', error);
 }
 };

 const handleMarkPaid = async (invoiceId, paymentData) => {
 try {
 console.log('Mock: Marking invoice as paid', invoiceId, paymentData);
 // Mock marking as paid (replace with real API call later)
 setInvoices(prev => prev.map(inv => 
 inv.id === invoiceId ? { 
 ...inv, 
 status: 'paid',
 paid_date: new Date().toISOString().split('T')[0],
 payment_method: paymentData?.payment_method || 'Manual Mark',
 payment_reference: paymentData?.payment_reference || 'N/A'
 } : inv
 ));
 
 if (selectedInvoice && selectedInvoice.id === invoiceId) {
 setSelectedInvoice(null);
 }
 if (invoiceToPay && invoiceToPay.id === invoiceId) {
 setInvoiceToPay(null);
 }
 } catch (error) {
 console.error('Error updating payment:', error);
 }
 };

 const handleMarkAsPaid = async (invoice) => {
 try {
 console.log('Mock: Marking invoice as paid manually', invoice.id);
 await handleMarkPaid(invoice.id, {
 payment_method: 'Manual Mark',
 payment_reference: 'N/A'
 });
 } catch (error) {
 console.error('Error marking invoice as paid:', error);
 }
 };

 if (!isLoaded) {
 return (
 <div className="min-h-screen bg-background flex items-center justify-center p-4">
 <div className="text-center">
 <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 bg-gradient-brand rounded-2xl md:rounded-3xl flex items-center justify-center shadow-[var(--shadow-brand-lg)]">
 <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-white" />
 </div>
 <p className="text-muted-foreground font-semibold text-base md:text-lg">Loading authentication...</p>
 </div>
 </div>
 );
 }

 if (isLoading) {
 return (
 <div className="min-h-screen bg-background flex items-center justify-center p-4">
 <div className="text-center">
 <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 bg-gradient-brand rounded-2xl md:rounded-3xl flex items-center justify-center shadow-[var(--shadow-brand-lg)]">
 <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-white" />
 </div>
 <p className="text-muted-foreground font-semibold text-base md:text-lg">Loading your invoices...</p>
 </div>
 </div>
 );
 }

 if (!isSignedIn) {
 return (
 <div className="min-h-screen bg-background flex items-center justify-center p-4">
 <div className="text-center">
 <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 bg-gradient-brand rounded-2xl md:rounded-3xl flex items-center justify-center shadow-[var(--shadow-brand-lg)]">
 <FileText className="w-8 h-8 md:w-10 md:h-10 text-white" />
 </div>
 <p className="text-muted-foreground font-semibold text-base md:text-lg">Please sign in to view invoices</p>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-background overflow-x-hidden">
 <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-8 p-3 md:p-8">
 {/* Enhanced Header */}
 <div className="relative w-full">
 <div className="absolute inset-0 bg-gradient-brand/20 rounded-2xl md:rounded-3xl transform rotate-1"></div>
 <Card className="relative glass-strong border-[hsl(var(--border))] rounded-2xl md:rounded-3xl overflow-hidden shadow-[var(--shadow-brand)]">
 <CardContent className="p-4 md:p-12">
 <div className="flex flex-col gap-4 md:gap-6">
 <div className="flex items-center gap-3 md:gap-6">
 <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-brand rounded-2xl md:rounded-3xl flex items-center justify-center shadow-[var(--shadow-brand-lg)] flex-shrink-0">
 <FileText className="w-6 h-6 md:w-8 md:h-8 text-white" />
 </div>
 <div className="min-w-0 flex-1">
 <h1 className="text-2xl md:text-5xl font-bold mb-1 md:mb-3 text-gradient-brand leading-tight">
 Invoice Management
 </h1>
 <p className="text-muted-foreground text-sm md:text-xl">
 Track payments and manage billing (Mock Data)
 </p>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Enhanced Stats Cards */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
 {[
 {
 title: "Total",
 value: stats.total,
 icon: FileText,
 color: "from-blue-500 to-cyan-500",
 bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40"
 },
 {
 title: "Pending",
 value: stats.pending,
 icon: Clock,
 color: "from-yellow-500 to-orange-500",
 bgColor: "from-yellow-50 to-orange-50 dark:from-yellow-950/40 dark:to-orange-950/40"
 },
 {
 title: "Paid",
 value: stats.paid,
 icon: CheckCircle,
 color: "from-green-500 to-emerald-500",
 bgColor: "from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40"
 },
 {
 title: "Overdue",
 value: stats.overdue,
 icon: AlertTriangle,
 color: "from-red-500 to-pink-500",
 bgColor: "from-red-50 to-pink-50 dark:from-red-950/40 dark:to-pink-950/40"
 }
 ].map((stat, index) => (
 <Card key={index} className="group card-brand glass border-[hsl(var(--border))] rounded-xl md:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-brand">
 <CardContent className={`p-3 md:p-6 bg-gradient-to-r ${stat.bgColor} relative overflow-hidden`}>
 <div className="flex items-center justify-between mb-2 md:mb-3">
 <div className={`w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r ${stat.color} rounded-lg md:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
 <stat.icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
 </div>
 </div>
 <div>
 <p className="text-muted-foreground text-xs md:text-sm font-medium mb-1 truncate">{stat.title}</p>
 <p className="text-lg md:text-2xl font-bold text-foreground">{stat.value}</p>
 </div>
 <div className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-white/20 to-transparent rounded-full transform translate-x-8 -translate-y-8 md:translate-x-12 md:-translate-y-12"></div>
 </CardContent>
 </Card>
 ))}
 </div>

 {/* Enhanced Filters */}
 <Card className="card-brand glass border-[hsl(var(--border))] rounded-xl md:rounded-3xl overflow-hidden shadow-lg">
 <CardContent className="p-4 md:p-6">
 <div className="flex flex-col gap-3 md:gap-4">
 <div className="relative w-full">
 <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[hsl(var(--primary))]" />
 <Input
 placeholder="Search invoices..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="pl-10 md:pl-12 bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-xl md:rounded-2xl backdrop-blur-sm focus-brand transition-brand text-sm md:text-base"
 />
 </div>
 <div className="flex items-center gap-2 md:gap-3 w-full">
 <Filter className="w-4 h-4 md:w-5 md:h-5 text-[hsl(var(--primary))] flex-shrink-0" />
 <Select value={statusFilter} onValueChange={setStatusFilter}>
 <SelectTrigger className="w-full bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-xl md:rounded-2xl backdrop-blur-sm text-sm md:text-base">
 <SelectValue placeholder="Filter by status" />
 </SelectTrigger>
 <SelectContent className="glass-strong border-[hsl(var(--border))] rounded-xl md:rounded-2xl">
 <SelectItem value="all">All Status</SelectItem>
 <SelectItem value="draft">Draft</SelectItem>
 <SelectItem value="sent">Sent</SelectItem>
 <SelectItem value="viewed">Viewed</SelectItem>
 <SelectItem value="paid">Paid</SelectItem>
 <SelectItem value="overdue">Overdue</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Enhanced Invoices List */}
 <div className="space-y-3 md:space-y-4 w-full">
 {filteredInvoices.length === 0 ? (
 <Card className="card-brand glass border-[hsl(var(--border))] rounded-xl md:rounded-3xl overflow-hidden shadow-lg">
 <CardContent className="p-8 md:p-12 text-center">
 <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 bg-[hsl(var(--accent-light))] rounded-2xl md:rounded-3xl flex items-center justify-center">
 <FileText className="w-8 h-8 md:w-10 md:h-10 text-[hsl(var(--primary))]" />
 </div>
 <h3 className="text-lg md:text-2xl font-bold text-foreground mb-2 md:mb-4">No invoices found</h3>
 <p className="text-muted-foreground text-sm md:text-lg mb-4 md:mb-6">
 {searchTerm || statusFilter !== 'all'
 ? 'Try adjusting your filters.'
 : 'This is mock data. Real invoices will appear after connecting to your backend.'}
 </p>
 </CardContent>
 </Card>
 ) : (
 filteredInvoices.map(invoice => {
 const invoiceStatus = isPast(new Date(invoice.due_date)) && invoice.status !== 'paid' ? 'overdue' : invoice.status;

 return (
 <Card key={invoice.id} className="group card-brand glass border-[hsl(var(--border))] rounded-xl md:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-brand">
 <CardContent className="p-4 md:p-6">
 {/* Mobile Layout */}
 <div className="block md:hidden space-y-3">
 <div className="flex justify-between items-start gap-3">
 <div className="min-w-0 flex-1">
 <p className="font-bold text-sm text-foreground truncate">{invoice.invoice_number}</p>
 <p className="text-xs text-muted-foreground truncate">
 {users[invoice.advertiser_id]?.full_name || 'Unknown User'}
 </p>
 </div>
 <Badge className={`${getStatusColor(invoiceStatus)} text-xs rounded-full px-2 py-1 font-bold flex-shrink-0`}>
 {invoiceStatus.replace('_', ' ')}
 </Badge>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
 ${invoice.amount.toLocaleString()}
 </span>
 <span className="text-xs text-muted-foreground bg-[hsl(var(--muted))] px-2 py-1 rounded-full">
 Due: {format(new Date(invoice.due_date), 'MMM d')}
 </span>
 </div>
 <div className="flex gap-2">
 <Button
 variant="outline"
 size={20}
 onClick={() => setSelectedInvoice(invoice)}
 className="flex-1 border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-lg text-xs"
>
 <Eye className="w-3 h-3 mr-1" />
 View
 </Button>
 {invoice.status !== 'paid' && (
 <Button
 variant="outline"
 size={20}
 onClick={() => handleMarkAsPaid(invoice)}
 className="flex-1 text-green-600 border-green-300 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg text-xs"
>
 <CheckCircle className="w-3 h-3 mr-1" />
 Mark Paid
 </Button>
 )}
 </div>
 </div>

 {/* Desktop Layout */}
 <div className="hidden md:flex items-center justify-between">
 <div className="flex items-center gap-4 md:gap-6 min-w-0 flex-1">
 <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-brand rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
 <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
 </div>
 <div className="min-w-0 flex-1">
 <p className="font-bold text-base md:text-lg text-foreground truncate">{invoice.invoice_number}</p>
 <p className="text-xs md:text-sm text-muted-foreground truncate">
 {users[invoice.advertiser_id]?.full_name || 'Unknown User'}
 </p>
 </div>
 <Badge className={`${getStatusColor(invoiceStatus)} rounded-full px-3 py-1 font-bold text-xs md:text-sm flex-shrink-0`}>
 {invoiceStatus.replace('_', ' ')}
 </Badge>
 </div>
 <div className="text-right flex-shrink-0 ml-4">
 <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
 ${invoice.amount.toLocaleString()}
 </p>
 <p className="text-xs md:text-sm text-muted-foreground bg-[hsl(var(--muted))] px-2 md:px-3 py-1 rounded-full inline-block">
 Due: {format(new Date(invoice.due_date), 'MMM d, yyyy')}
 </p>
 </div>
 <div className="flex gap-2 md:gap-3 ml-4">
 <Button
 variant="outline"
 size={20}
 onClick={() => setSelectedInvoice(invoice)}
 className="border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-lg md:rounded-xl text-xs md:text-sm"
>
 <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
 View
 </Button>
 {invoice.status !== 'paid' && (
 <Button
 variant="outline"
 size={20}
 onClick={() => handleMarkAsPaid(invoice)}
 className="text-green-600 border-green-300 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg md:rounded-xl text-xs md:text-sm"
>
 <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
 Mark Paid
 </Button>
 )}
 </div>
 </div>
 </CardContent>
 </Card>
 );
 })
 )}
 </div>

 {/* Mock Modals */}
 {selectedInvoice && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
 <Card className="max-w-2xl w-full">
 <CardHeader>
 <CardTitle>Invoice Details (Mock)</CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <p><strong>Invoice:</strong> {selectedInvoice.invoice_number}</p>
 <p><strong>Amount:</strong> ${selectedInvoice.amount.toLocaleString()}</p>
 <p><strong>Status:</strong> {selectedInvoice.status}</p>
 <p><strong>Due Date:</strong> {format(new Date(selectedInvoice.due_date), 'MMM d, yyyy')}</p>
 <p className="text-sm text-muted-foreground">This is mock data. Real invoice modal will be connected later.</p>
 <div className="flex gap-3 pt-4">
 <Button onClick={() => setSelectedInvoice(null)}>Close</Button>
 {selectedInvoice.status !== 'paid' && (
 <Button onClick={() => {
 handleMarkAsPaid(selectedInvoice);
 setSelectedInvoice(null);
 }}>
 Mark as Paid
 </Button>
 )}
 </div>
 </CardContent>
 </Card>
 </div>
 )}

 {invoiceToPay && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
 <Card className="max-w-md w-full">
 <CardHeader>
 <CardTitle>Payment Modal (Mock)</CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <p><strong>Invoice:</strong> {invoiceToPay.invoice_number}</p>
 <p><strong>Amount:</strong> ${invoiceToPay.amount.toLocaleString()}</p>
 <p className="text-sm text-muted-foreground">This is a mock payment modal. Real payment processing will be connected later.</p>
 <div className="flex gap-3 pt-4">
 <Button onClick={() => setInvoiceToPay(null)}>Cancel</Button>
 <Button onClick={() => {
 handleMarkPaid(invoiceToPay.id, {
 payment_method: 'Mock Payment',
 payment_reference: 'MOCK-REF-123'
 });
 setInvoiceToPay(null);
 }}>
 Complete Payment
 </Button>
 </div>
 </CardContent>
 </Card>
 </div>
 )}
 </div>
 </div>
 );
}