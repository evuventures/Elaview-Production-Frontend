import React, { useState } from 'react';
import { Campaign, Booking, Invoice, Space, Property } from '@/api/entities';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TestTube, CheckCircle, AlertTriangle, X } from 'lucide-react';

export default function PaymentTestPage() {
 const { user } = useUser();
 const [testResults, setTestResults] = useState([]);
 const [isRunning, setIsRunning] = useState(false);
 const [testData, setTestData] = useState(null);

 const addResult = (step, status, message, data = null) => {
 setTestResults(prev => [...prev, { step, status, message, data, timestamp: new Date().toISOString() }]);
 };

 const runPaymentTest = async () => {
 if (!user?.id) {
 addResult("Error", "error", "User not authenticated");
 return;
 }

 setIsRunning(true);
 setTestResults([]);

 try {
 addResult("Setup", "success", `Test user: ${user.fullName || user.emailAddresses[0]?.emailAddress}`);

 // Step 1: Create test campaign
 addResult("Step 1", "info", "Creating test campaign...");
 const campaign = await Campaign.create({
 name: "Payment Test Campaign",
 brand_name: "Test Brand",
 advertiser_id: user.id,
 start_date: "2024-02-01",
 end_date: "2024-02-07",
 content_type: ["other"],
 content_description: "Test campaign for payment flow",
 status: "draft",
 total_budget: 5000
 });
 addResult("Step 1", "success", "Campaign created", { campaign_id: campaign.id });

 // Step 2: Get available spaces for testing
 addResult("Step 2", "info", "Finding available advertising spaces...");
 const availableSpaces = await Space.filter({ status: 'active' });
 if (availableSpaces.length < 2) {
 addResult("Step 2", "error", "Not enough available spaces for testing");
 return;
 }
 
 const testSpaces = availableSpaces.slice(0, 2);
 addResult("Step 2", "success", `Found ${testSpaces.length} spaces for testing`);

 // Step 3: Create draft bookings (before payment)
 addResult("Step 3", "info", "Creating draft bookings...");
 const bookings = [];
 for (const space of testSpaces) {
 const property = await Property.get(space.property_id);
 const booking = await Booking.create({
 campaign_id: campaign.id,
 area_id: space.id,
 property_id: space.property_id,
 advertiser_id: currentUser.id,
 owner_id: property.owner_id,
 start_date: campaign.start_date,
 end_date: campaign.end_date,
 total_amount: (space.pricing?.daily_rate || 100) * 7, // 7 days
 campaign_name: campaign.name,
 brand_name: campaign.brand_name,
 status: 'draft',
 payment_status: 'unpaid',
 approval_required: false
 });
 bookings.push(booking);
 }
 addResult("Step 3", "success", `Created ${bookings.length} draft bookings`);

 // Step 4: Verify no invoices exist yet
 addResult("Step 4", "info", "Checking invoice status before payment...");
 const prePaymentInvoices = await Invoice.filter({ campaign_id: campaign.id });
 if (prePaymentInvoices.length> 0) {
 addResult("Step 4", "error", `Found ${prePaymentInvoices.length} invoices before payment - should be 0`);
 } else {
 addResult("Step 4", "success", "Correctly no invoices before payment");
 }

 // Step 5: Simulate payment processing
 addResult("Step 5", "info", "Processing payment...");
 const paymentReference = `TEST-${Date.now()}`;
 const paymentDate = new Date().toISOString().split('T')[0];
 let totalPaid = 0;

 for (const booking of bookings) {
 // Create invoice
 const invoice = await Invoice.create({
 booking_id: booking.id,
 campaign_id: campaign.id,
 invoice_number: `INV-TEST-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
 advertiser_id: currentUser.id,
 owner_id: booking.owner_id,
 amount: booking.total_amount,
 due_date: paymentDate,
 status: 'paid',
 paid_date: paymentDate,
 payment_method: 'test',
 payment_reference: paymentReference
 });

 // Update booking
 await Booking.update(booking.id, {
 payment_status: 'paid',
 status: booking.approval_required ? 'pending_approval' : 'confirmed'
 });

 totalPaid += booking.total_amount;
 }

 addResult("Step 5", "success", `Payment processed: $${totalPaid}`);

 // Step 6: Verify invoices were created correctly
 addResult("Step 6", "info", "Verifying invoice creation...");
 const postPaymentInvoices = await Invoice.filter({ campaign_id: campaign.id });
 if (postPaymentInvoices.length !== bookings.length) {
 addResult("Step 6", "error", `Expected ${bookings.length} invoices, found ${postPaymentInvoices.length}`);
 } else {
 const allPaid = postPaymentInvoices.every(inv => inv.status === 'paid');
 if (allPaid) {
 addResult("Step 6", "success", `All ${postPaymentInvoices.length} invoices marked as paid`);
 } else {
 addResult("Step 6", "error", "Some invoices not marked as paid");
 }
 }

 // Step 7: Verify booking statuses
 addResult("Step 7", "info", "Verifying booking statuses...");
 const updatedBookings = await Promise.all(
 bookings.map(b => Booking.get(b.id))
 );
 
 const paidBookings = updatedBookings.filter(b => b.payment_status === 'paid');
 if (paidBookings.length === bookings.length) {
 addResult("Step 7", "success", "All bookings marked as paid");
 } else {
 addResult("Step 7", "error", `Only ${paidBookings.length}/${bookings.length} bookings marked as paid`);
 }

 // Step 8: Update campaign status
 addResult("Step 8", "info", "Updating campaign status...");
 await Campaign.update(campaign.id, {
 status: 'active',
 aggregated_cost: totalPaid
 });
 addResult("Step 8", "success", "Campaign updated to active status");

 // Store test data for cleanup
 setTestData({
 campaign_id: campaign.id,
 booking_ids: bookings.map(b => b.id),
 invoice_ids: postPaymentInvoices.map(i => i.id)
 });

 addResult("Complete", "success", "🎉 Payment flow test completed successfully!");

 } catch (error) {
 addResult("Error", "error", `Test failed: ${error.message}`);
 console.error("Payment test error:", error);
 } finally {
 setIsRunning(false);
 }
 };

 const cleanupTestData = async () => {
 if (!testData) return;
 
 try {
 // Note: In a real system, you'd want proper cleanup methods
 addResult("Cleanup", "info", "Test data cleanup would happen here in production");
 addResult("Cleanup", "success", "Cleanup completed (simulated)");
 } catch (error) {
 addResult("Cleanup", "error", `Cleanup failed: ${error.message}`);
 }
 };

 const getStatusIcon = (status) => {
 switch (status) {
 case 'success': return <CheckCircle className="w-4 h-4 text-[hsl(var(--success))]" />;
 case 'error': return <X className="w-4 h-4 text-[hsl(var(--destructive))]" />;
 case 'info': return <TestTube className="w-4 h-4 text-[hsl(var(--primary))]" />;
 default: return <AlertTriangle className="w-4 h-4 text-[hsl(var(--warning))]" />;
 }
 };

 const getStatusColor = (status) => {
 switch (status) {
 case 'success': return 'bg-[hsl(var(--success)/0.1)] border-[hsl(var(--success)/0.3)] text-[hsl(var(--success))]';
 case 'error': return 'bg-[hsl(var(--destructive)/0.1)] border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))]';
 case 'info': return 'bg-[hsl(var(--primary)/0.1)] border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))]';
 default: return 'bg-[hsl(var(--warning)/0.1)] border-[hsl(var(--warning)/0.3)] text-[hsl(var(--warning))]';
 }
 };

 return (
 <div className="min-h-screen bg-[hsl(var(--background))] p-8">
 <div className="max-w-4xl mx-auto">
 <Card className="glass-strong shadow-[var(--shadow-brand-lg)] rounded-3xl">
 <CardHeader className="bg-[hsl(var(--primary)/0.1)] p-8 border-b border-[hsl(var(--border))]">
 <CardTitle className="text-3xl font-bold text-gradient-brand flex items-center gap-3">
 <TestTube className="w-8 h-8 text-[hsl(var(--primary))]" />
 Payment System Test
 </CardTitle>
 </CardHeader>
 <CardContent className="p-8">
 <div className="space-y-6">
 <div className="flex gap-4">
 <Button 
 onClick={runPaymentTest} 
 disabled={isRunning}
 className="btn-gradient rounded-2xl px-6 py-3 font-bold"
>
 {isRunning ? (
 <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running Test...</>
 ) : (
 <><TestTube className="mr-2 h-4 w-4" /> Run Payment Test</>
 )}
 </Button>
 
 {testData && (
 <Button 
 onClick={cleanupTestData} 
 variant="outline"
 className="border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-2xl px-6 py-3 font-bold"
>
 Cleanup Test Data
 </Button>
 )}
 </div>

 {testResults.length> 0 && (
 <div className="space-y-3">
 <h3 className="text-xl font-bold">Test Results:</h3>
 <div className="space-y-2 max-h-96 overflow-y-auto">
 {testResults.map((result, index) => (
 <div 
 key={index} 
 className={`p-3 rounded-xl border ${getStatusColor(result.status)}`}
>
 <div className="flex items-start gap-3">
 {getStatusIcon(result.status)}
 <div className="flex-1">
 <div className="flex items-center gap-2">
 <Badge variant="outline" className="text-xs">
 {result.step}
 </Badge>
 <span className="text-xs text-[hsl(var(--muted-foreground))]">
 {new Date(result.timestamp).toLocaleTimeString()}
 </span>
 </div>
 <p className="font-medium mt-1">{result.message}</p>
 {result.data && (
 <pre className="text-xs mt-2 bg-[hsl(var(--muted)/0.5)] p-2 rounded overflow-x-auto">
 {JSON.stringify(result.data, null, 2)}
 </pre>
 )}
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 <div className="bg-[hsl(var(--primary)/0.1)] rounded-2xl p-6">
 <h3 className="font-bold text-lg mb-4 text-[hsl(var(--primary))]">Expected Payment Flow:</h3>
 <ol className="space-y-2 text-sm text-[hsl(var(--primary))]">
 <li>1. Create campaign with draft status</li>
 <li>2. Create bookings with status: 'draft', payment_status: 'unpaid'</li>
 <li>3. Verify no invoices exist before payment</li>
 <li>4. Process payment → Create invoices with status: 'paid'</li>
 <li>5. Update bookings to payment_status: 'paid', status: 'confirmed'</li>
 <li>6. Update campaign to 'active' status</li>
 <li>7. Notify property owners</li>
 </ol>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 );
}