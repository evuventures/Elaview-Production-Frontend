import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Download, Check, DollarSign, CreditCard, Calendar, MapPin, User, Building, Sparkles, Crown, Star, Target, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Message } from '@/api/entities';

export default function InvoiceModal({ invoice, isOpen, onClose, onMarkPaid, onPayOnline, currentUser, booking, space, otherUser }) {
 const [showPaymentForm, setShowPaymentForm] = useState(false);
 const [paymentData, setPaymentData] = useState({
 payment_method: '',
 payment_reference: ''
 });

 if (!invoice) return null;

 const canMarkPaid = invoice.advertiser_id === currentUser?.id && invoice.status !== 'paid';
 const canPayOnline = invoice.advertiser_id === currentUser?.id && invoice.status !== 'paid';
 const isMyInvoice = invoice.owner_id === currentUser?.id;

 const handleMarkPaid = async () => {
 try {
 await onMarkPaid(invoice.id, paymentData);
 
 // Create system message for manual payment marking
 await Message.create({
 sender_id: invoice.advertiser_id,
 recipient_id: invoice.owner_id,
 content: `✅ Payment Marked as Paid: $${invoice.amount.toLocaleString()}\n\nInvoice: ${invoice.invoice_number}\nPayment Method: ${paymentData.payment_method}\nReference: ${paymentData.payment_reference}\n\nMarked as paid by ${currentUser.full_name}`,
 message_type: 'payment_received',
 booking_id: booking?.id,
 space_id: space?.id,
 system_data: {
 campaign_name: booking?.campaign_name,
 amount: invoice.amount,
 payment_method: paymentData.payment_method,
 payment_reference: paymentData.payment_reference,
 invoice_number: invoice.invoice_number
 }
 });
 
 setShowPaymentForm(false);
 setPaymentData({ payment_method: '', payment_reference: '' });
 } catch (error) {
 console.error('Error marking payment:', error);
 }
 };

 const downloadInvoice = () => {
 const invoiceContent = `
ELAVIEW INVOICE ${invoice.invoice_number}

From: ${isMyInvoice ? currentUser?.full_name : otherUser?.full_name}
To: ${isMyInvoice ? otherUser?.full_name : currentUser?.full_name}

Space: ${space?.title}
Location: ${space?.location?.address}

Campaign Period: ${format(new Date(booking?.start_date), 'MMM d, yyyy')} - ${format(new Date(booking?.end_date), 'MMM d, yyyy')}

Amount: $${invoice.amount.toLocaleString()}
Due Date: ${format(new Date(invoice.due_date), 'MMM d, yyyy')}

Status: ${invoice.status}
${invoice.paid_date ? `Paid Date: ${format(new Date(invoice.paid_date), 'MMM d, yyyy')}` : ''}
${invoice.payment_method ? `Payment Method: ${invoice.payment_method}` : ''}
${invoice.payment_reference ? `Reference: ${invoice.payment_reference}` : ''}

Notes: ${invoice.notes || 'N/A'}
 `;

 const blob = new Blob([invoiceContent], { type: 'text/plain' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `${invoice.invoice_number}.txt`;
 a.click();
 URL.revokeObjectURL(url);
 };

 const getStatusColor = (status) => {
 switch (status) {
 case 'paid':
 return 'bg-gradient-to-r from-[hsl(var(--success))]/20 to-[hsl(var(--success))]/10 text-[hsl(var(--success))] border border-[hsl(var(--success))]/30';
 case 'overdue':
 return 'bg-gradient-to-r from-[hsl(var(--destructive))]/20 to-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] border border-[hsl(var(--destructive))]/30';
 default:
 return 'bg-gradient-to-r from-[hsl(var(--warning))]/20 to-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border border-[hsl(var(--warning))]/30';
 }
 };

 return (
 <Dialog open={isOpen} onOpenChange={onClose}>
 <DialogContent className="max-w-4xl glass border-[hsl(var(--border))] rounded-3xl shadow-[var(--shadow-brand-lg)]">
 <DialogHeader className="bg-gradient-to-r from-[hsl(var(--primary))]/5 to-[hsl(var(--accent-light))]/10 border-b border-[hsl(var(--border))] p-8 m-0 rounded-t-3xl -mt-6 -mx-6">
 <DialogTitle className="flex items-center gap-4 text-[hsl(var(--foreground))] text-3xl">
 <div className="w-12 h-12 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-[var(--shadow-brand)]">
 <FileText className="w-6 h-6 text-white" />
 </div>
 <div>
 <h3 className="font-bold">Invoice {invoice.invoice_number}</h3>
 <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Elaview Advertising Services</p>
 </div>
 </DialogTitle>
 </DialogHeader>

 <div className="space-y-8 p-6">
 {/* Enhanced Invoice Header */}
 <Card className="bg-gradient-to-r from-[hsl(var(--primary))]/5 to-[hsl(var(--accent-light))]/10 glass border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-[var(--shadow-brand)]">
 <CardContent className="p-8">
 <div className="flex justify-between items-start">
 <div className="flex items-start gap-4">
 <div className="w-12 h-12 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-[var(--shadow-brand)]">
 <User className="w-6 h-6 text-white" />
 </div>
 <div>
 <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">
 {isMyInvoice ? 'Invoice To:' : 'Invoice From:'}
 </h3>
 <p className="text-[hsl(var(--foreground))] font-semibold text-lg">{otherUser?.full_name}</p>
 <p className="text-[hsl(var(--muted-foreground))]">{otherUser?.email}</p>
 </div>
 </div>
 <div className="text-right">
 <Badge className={`text-lg px-4 py-2 rounded-full font-bold ${getStatusColor(invoice.status)}`}>
 {invoice.status.toUpperCase()}
 </Badge>
 {invoice.status === 'overdue' && (
 <div className="flex items-center gap-2 mt-2 text-[hsl(var(--destructive))]">
 <AlertTriangle className="w-4 h-4" />
 <span className="text-sm font-medium">Payment Overdue</span>
 </div>
 )}
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Enhanced Invoice Details */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <Card className="bg-gradient-to-r from-[hsl(var(--success))]/5 to-[hsl(var(--success))]/10 glass border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-[var(--shadow-brand)]">
 <CardContent className="p-6">
 <h4 className="font-bold text-[hsl(var(--success))] mb-4 flex items-center gap-2 text-lg">
 <Building className="w-5 h-5" />
 Advertising Space
 </h4>
 <div className="space-y-3">
 <p className="text-[hsl(var(--foreground))] font-semibold">{space?.title}</p>
 <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
 <MapPin className="w-4 h-4 text-[hsl(var(--success))]" />
 <span className="text-sm">{space?.location?.address}</span>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="bg-gradient-to-r from-[hsl(var(--primary))]/5 to-[hsl(var(--accent-light))]/10 glass border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-[var(--shadow-brand)]">
 <CardContent className="p-6">
 <h4 className="font-bold text-[hsl(var(--primary))] mb-4 flex items-center gap-2 text-lg">
 <Target className="w-5 h-5" />
 Campaign Details
 </h4>
 <div className="space-y-3">
 <p className="text-[hsl(var(--foreground))] font-semibold">
 {booking?.campaign_name || 'Campaign'}
 </p>
 <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
 <Calendar className="w-4 h-4 text-[hsl(var(--primary))]" />
 <span className="text-sm">
 {format(new Date(booking?.start_date), 'MMM d')} - {format(new Date(booking?.end_date), 'MMM d, yyyy')}
 </span>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Enhanced Amount & Dates */}
 <Card className="bg-gradient-to-r from-[hsl(var(--warning))]/5 to-[hsl(var(--warning))]/10 glass border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-[var(--shadow-brand)]">
 <CardContent className="p-8">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div>
 <h4 className="font-bold text-[hsl(var(--warning))] mb-4 flex items-center gap-2 text-lg">
 <DollarSign className="w-5 h-5" />
 Amount Due
 </h4>
 <div className="text-4xl font-bold text-[hsl(var(--success))] mb-2">${invoice.amount.toLocaleString()}</div>
 {invoice.tax_amount> 0 && (
 <p className="text-sm text-[hsl(var(--muted-foreground))]">
 Tax: ${invoice.tax_amount.toLocaleString()}
 </p>
 )}
 <div className="mt-4 p-3 bg-gradient-to-r from-[hsl(var(--success))]/10 to-[hsl(var(--success))]/5 rounded-xl">
 <p className="text-sm font-medium text-[hsl(var(--success))]">
 Total: ${((invoice.amount || 0) + (invoice.tax_amount || 0)).toLocaleString()}
 </p>
 </div>
 </div>
 <div>
 <h4 className="font-bold text-[hsl(var(--warning))] mb-4 flex items-center gap-2 text-lg">
 <Calendar className="w-5 h-5" />
 Important Dates
 </h4>
 <div className="space-y-3">
 <div className="p-3 bg-gradient-to-r from-[hsl(var(--primary))]/10 to-[hsl(var(--accent-light))]/5 rounded-xl">
 <p className="text-sm font-medium text-[hsl(var(--primary))]">
 Due Date: {format(new Date(invoice.due_date), 'MMM d, yyyy')}
 </p>
 </div>
 {invoice.paid_date && (
 <div className="p-3 bg-gradient-to-r from-[hsl(var(--success))]/10 to-[hsl(var(--success))]/5 rounded-xl">
 <p className="text-sm font-medium text-[hsl(var(--success))]">
 Paid Date: {format(new Date(invoice.paid_date), 'MMM d, yyyy')}
 </p>
 </div>
 )}
 </div>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Enhanced Payment Information */}
 {invoice.status === 'paid' && (
 <Card className="bg-gradient-to-r from-[hsl(var(--success))]/5 to-[hsl(var(--success))]/10 glass border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-[var(--shadow-brand)]">
 <CardContent className="p-6">
 <h4 className="font-bold text-[hsl(var(--success))] mb-4 flex items-center gap-2 text-lg">
 <Check className="w-5 h-5" />
 Payment Information
 </h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="p-3 bg-gradient-to-r from-[hsl(var(--card))]/50 to-[hsl(var(--success))]/5 rounded-xl">
 <p className="text-sm font-medium text-[hsl(var(--success))]">
 Method: {invoice.payment_method}
 </p>
 </div>
 {invoice.payment_reference && (
 <div className="p-3 bg-gradient-to-r from-[hsl(var(--card))]/50 to-[hsl(var(--success))]/5 rounded-xl">
 <p className="text-sm font-medium text-[hsl(var(--success))]">
 Reference: {invoice.payment_reference}
 </p>
 </div>
 )}
 </div>
 </CardContent>
 </Card>
 )}

 {/* Enhanced Notes */}
 {invoice.notes && (
 <Card className="bg-gradient-to-r from-[hsl(var(--muted))]/50 to-[hsl(var(--muted))]/30 glass border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-[var(--shadow-brand)]">
 <CardContent className="p-6">
 <h4 className="font-bold text-[hsl(var(--foreground))] mb-4 text-lg">Notes</h4>
 <p className="text-[hsl(var(--foreground))] leading-relaxed">{invoice.notes}</p>
 </CardContent>
 </Card>
 )}

 {/* Enhanced Payment Form */}
 {showPaymentForm && (
 <Card className="bg-gradient-to-r from-[hsl(var(--primary))]/5 to-[hsl(var(--accent-light))]/10 glass border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-[var(--shadow-brand)]">
 <CardContent className="p-8">
 <h4 className="font-bold text-[hsl(var(--primary))] mb-6 flex items-center gap-2 text-xl">
 <Crown className="w-6 h-6" />
 Mark as Paid
 </h4>
 <div className="space-y-6">
 <div>
 <Label htmlFor="payment_method" className="text-base font-semibold text-[hsl(var(--muted-foreground))] mb-2 block">Payment Method *</Label>
 <Select 
 value={paymentData.payment_method} 
 onValueChange={(value) => setPaymentData(prev => ({...prev, payment_method: value}))}
>
 <SelectTrigger className="glass border-[hsl(var(--border))] rounded-2xl py-3 px-4 focus-brand transition-brand">
 <SelectValue placeholder="Select payment method" />
 </SelectTrigger>
 <SelectContent className="glass border-[hsl(var(--border))] rounded-2xl">
 <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
 <SelectItem value="check">Check</SelectItem>
 <SelectItem value="paypal">PayPal</SelectItem>
 <SelectItem value="credit_card">Credit Card</SelectItem>
 <SelectItem value="cash">Cash</SelectItem>
 <SelectItem value="other">Other</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div>
 <Label htmlFor="payment_reference" className="text-base font-semibold text-[hsl(var(--muted-foreground))] mb-2 block">Payment Reference/Transaction ID</Label>
 <Input
 id="payment_reference"
 value={paymentData.payment_reference}
 onChange={(e) => setPaymentData(prev => ({...prev, payment_reference: e.target.value}))}
 placeholder="Transaction ID, check number, etc."
 className="glass border-[hsl(var(--border))] rounded-2xl py-3 px-4 focus-brand transition-brand"
 />
 </div>
 <div className="flex gap-4">
 <Button onClick={handleMarkPaid} className="flex-1 bg-gradient-to-r from-[hsl(var(--success))] to-[hsl(var(--success))]/80 hover:from-[hsl(var(--success))]/90 hover:to-[hsl(var(--success))]/70 text-white rounded-2xl py-3 font-bold shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand">
 <Check className="w-5 h-5 mr-2" />
 Confirm Payment
 </Button>
 <Button variant="outline" onClick={() => setShowPaymentForm(false)} className="flex-1 border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-2xl py-3 font-bold transition-brand">
 Cancel
 </Button>
 </div>
 </div>
 </CardContent>
 </Card>
 )}

 {/* Enhanced Actions */}
 <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-[hsl(var(--border))]">
 <Button variant="outline" onClick={downloadInvoice} className="border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-2xl px-6 py-3 font-bold transition-brand">
 <Download className="w-5 h-5 mr-2" />
 Download Invoice
 </Button>
 
 <div className="flex flex-col sm:flex-row gap-3">
 {canPayOnline && (
 <Button 
 onClick={() => onPayOnline(invoice)}
 className="btn-gradient rounded-2xl px-6 py-3 font-bold shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand"
>
 <CreditCard className="w-5 h-5 mr-2" />
 Pay Online
 </Button>
 )}
 {canMarkPaid && !showPaymentForm && (
 <Button 
 onClick={() => setShowPaymentForm(true)}
 className="bg-gradient-to-r from-[hsl(var(--success))] to-[hsl(var(--success))]/80 hover:from-[hsl(var(--success))]/90 hover:to-[hsl(var(--success))]/70 text-white rounded-2xl px-6 py-3 font-bold shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand"
>
 <DollarSign className="w-5 h-5 mr-2" />
 Mark as Paid
 </Button>
 )}
 <Button variant="outline" onClick={onClose} className="border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-2xl px-6 py-3 font-bold transition-brand">
 Close
 </Button>
 </div>
 </div>
 </div>
 </DialogContent>
 </Dialog>
 );
}