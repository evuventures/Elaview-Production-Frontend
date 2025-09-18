import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Shield, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import { PaymentSettings } from '@/api/entities';

// Stripe Elements styling
const cardElementOptions = {
 style: {
 base: {
 fontSize: '16px',
 color: 'hsl(var(--foreground))',
 '::placeholder': {
 color: 'hsl(var(--muted-foreground))',
 },
 backgroundColor: 'rgba(255, 255, 255, 0.8)',
 padding: '12px',
 borderRadius: '12px',
 },
 invalid: {
 color: 'hsl(var(--destructive))',
 },
 },
 hidePostalCode: false,
};

const CheckoutForm = ({ amount, onSuccess, onError, customerInfo, description }) => {
 const stripe = useStripe();
 const elements = useElements();
 const [isProcessing, setIsProcessing] = useState(false);
 const [error, setError] = useState(null);
 const [cardComplete, setCardComplete] = useState(false);

 const handleSubmit = async (event) => {
 event.preventDefault();

 if (!stripe || !elements) {
 setError('Stripe has not loaded yet. Please try again.');
 return;
 }

 const cardElement = elements.getElement(CardElement);
 if (!cardElement) {
 setError('Card element not found.');
 return;
 }

 setIsProcessing(true);
 setError(null);

 try {
 // Create payment method
 const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
 type: 'card',
 card: cardElement,
 billing_details: {
 name: customerInfo.name,
 email: customerInfo.email,
 address: customerInfo.address ? {
 line1: customerInfo.address.line1,
 city: customerInfo.address.city,
 state: customerInfo.address.state,
 postal_code: customerInfo.address.postal_code,
 country: customerInfo.address.country || 'US',
 } : undefined,
 },
 });

 if (paymentMethodError) {
 throw new Error(paymentMethodError.message);
 }

 // For demo purposes, we'll simulate a successful payment
 // In production, you'd create a payment intent on your backend
 await new Promise(resolve => setTimeout(resolve, 2000));

 const mockPaymentResult = {
 paymentMethod: paymentMethod,
 paymentIntent: {
 id: `pi_${Date.now()}`,
 status: 'succeeded',
 amount: amount * 100, // Stripe uses cents
 currency: 'usd',
 created: Math.floor(Date.now() / 1000),
 },
 customer: customerInfo,
 };

 onSuccess(mockPaymentResult);
 } catch (err) {
 console.error('Payment error:', err);
 setError(err.message || 'An error occurred while processing your payment.');
 onError(err);
 } finally {
 setIsProcessing(false);
 }
 };

 const handleCardChange = (event) => {
 setCardComplete(event.complete);
 if (event.error) {
 setError(event.error.message);
 } else {
 setError(null);
 }
 };

 return (
 <form onSubmit={handleSubmit} className="space-y-6">
 <Card className="bg-gradient-to-r from-[hsl(var(--primary))]/5 to-[hsl(var(--accent-light))]/10 glass border-[hsl(var(--border))] rounded-2xl">
 <CardHeader className="pb-4">
 <CardTitle className="flex items-center gap-3 text-[hsl(var(--primary))]">
 <CreditCard className="w-6 h-6" />
 Payment Information
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="p-4 glass border border-[hsl(var(--border))] rounded-2xl">
 <CardElement 
 options={cardElementOptions}
 onChange={handleCardChange}
 />
 </div>
 
 {error && (
 <Alert className="border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5 rounded-2xl">
 <AlertTriangle className="h-4 w-4 text-[hsl(var(--destructive))]" />
 <AlertDescription className="text-[hsl(var(--destructive))]">
 {error}
 </AlertDescription>
 </Alert>
 )}

 <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[hsl(var(--success))]/5 to-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/30 rounded-2xl">
 <span className="font-semibold text-[hsl(var(--success))]">Total Amount:</span>
 <span className="text-2xl font-bold text-[hsl(var(--success))]">${amount.toLocaleString()}</span>
 </div>

 <Button
 type="submit"
 disabled={!stripe || !cardComplete || isProcessing}
 className="w-full btn-gradient font-bold py-4 text-lg rounded-2xl shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand"
>
 {isProcessing ? (
 <>
 <Loader2 className="mr-2 h-5 w-5 animate-spin" />
 Processing Payment...
 </>
 ) : (
 <>
 <Lock className="mr-2 h-5 w-5" />
 Pay ${amount.toLocaleString()}
 </>
 )}
 </Button>

 <div className="flex items-center justify-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
 <Shield className="w-4 h-4 text-[hsl(var(--success))]" />
 <span>Secured by Stripe • SSL Encrypted</span>
 </div>
 </CardContent>
 </Card>
 </form>
 );
};

const StripeCheckout = ({ 
 amount, 
 onSuccess, 
 onError, 
 customerInfo = {}, 
 description = "Campaign Payment",
 isOpen = true 
}) => {
 const [stripePromise, setStripePromise] = useState(null);
 const [paymentSettings, setPaymentSettings] = useState(null);
 const [isLoading, setIsLoading] = useState(true);
 const [setupError, setSetupError] = useState(null);

 useEffect(() => {
 const loadPaymentSettings = async () => {
 try {
 const settings = await PaymentSettings.list();
 const activeSettings = settings.find(s => s.is_enabled) || settings[0];
 
 if (!activeSettings?.stripe_publishable_key) {
 setSetupError('Stripe payment is not configured. Please contact support.');
 setIsLoading(false);
 return;
 }

 setPaymentSettings(activeSettings);
 
 // Initialize Stripe
 const stripe = await loadStripe(activeSettings.stripe_publishable_key);
 setStripePromise(Promise.resolve(stripe));
 } catch (error) {
 console.error('Error loading payment settings:', error);
 setSetupError('Failed to load payment configuration.');
 } finally {
 setIsLoading(false);
 }
 };

 if (isOpen) {
 loadPaymentSettings();
 }
 }, [isOpen]);

 if (!isOpen) return null;

 if (isLoading) {
 return (
 <div className="flex items-center justify-center p-12">
 <div className="text-center">
 <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[hsl(var(--primary))]" />
 <p className="text-[hsl(var(--muted-foreground))]">Loading payment system...</p>
 </div>
 </div>
 );
 }

 if (setupError) {
 return (
 <Alert className="border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5 rounded-2xl">
 <AlertTriangle className="h-4 w-4 text-[hsl(var(--destructive))]" />
 <AlertDescription className="text-[hsl(var(--destructive))]">
 {setupError}
 </AlertDescription>
 </Alert>
 );
 }

 if (!stripePromise) {
 return (
 <Alert className="border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5 rounded-2xl">
 <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />
 <AlertDescription className="text-[hsl(var(--warning))]">
 Payment system is not available. Please try again later.
 </AlertDescription>
 </Alert>
 );
 }

 return (
 <Elements stripe={stripePromise}>
 <div className="space-y-6">
 <div className="text-center">
 <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">Complete Your Payment</h3>
 <p className="text-[hsl(var(--muted-foreground))]">{description}</p>
 {paymentSettings?.environment === 'test' && (
 <div className="mt-4 p-3 bg-[hsl(var(--warning))]/10 border border-[hsl(var(--warning))]/30 rounded-xl">
 <p className="text-sm text-[hsl(var(--warning))] font-medium">
 🧪 Test Mode - Use card 4242 4242 4242 4242 with any future date and CVC
 </p>
 </div>
 )}
 </div>
 
 <CheckoutForm
 amount={amount}
 onSuccess={onSuccess}
 onError={onError}
 customerInfo={customerInfo}
 description={description}
 />
 </div>
 </Elements>
 );
};

export default StripeCheckout;