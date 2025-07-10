import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Shield, Check, Loader2, DollarSign, Lock, Sparkles, Crown } from 'lucide-react';

export default function MockPaymentModal({ invoice, isOpen, onClose, onPaymentComplete }) {
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  
  // Reset state on close
  const handleOpenChange = (open) => {
    if (!open) {
      setIsProcessing(false);
      setPaymentSuccess(false);
      setTransactionId('');
      setCardDetails({ number: '', expiry: '', cvv: '', name: '' });
      onClose();
    }
  };

  if (!invoice) return null;

  const handlePayment = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const mockTransactionId = `TXN-${Date.now()}`;
    setTransactionId(mockTransactionId);
    setIsProcessing(false);
    setPaymentSuccess(true);
    setTimeout(() => {
      onPaymentComplete({ payment_method: 'stripe', payment_reference: mockTransactionId });
      handleOpenChange(false);
    }, 2000);
  };
  
  const formatCardNumber = (v) => v.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19);
  const formatExpiry = (v) => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substring(0, 5);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md w-full glass border-[hsl(var(--border))] rounded-3xl shadow-[var(--shadow-brand-lg)] p-0 fixed bottom-0 md:bottom-auto">
        <DialogHeader className="bg-gradient-to-r from-[hsl(var(--primary))]/5 to-[hsl(var(--accent-light))]/10 border-b border-[hsl(var(--border))] p-6 m-0 rounded-t-3xl -mt-6 -mx-6">
          <DialogTitle className="flex items-center gap-3 text-[hsl(var(--foreground))] text-2xl">
            <div className="w-10 h-10 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-[var(--shadow-brand)]">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold">Secure Payment</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Powered by Elaview</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          {paymentSuccess ? (
            <div className="text-center py-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--success))]/20 to-[hsl(var(--success))]/20 rounded-full blur-2xl"></div>
                <div className="relative w-20 h-20 bg-gradient-to-r from-[hsl(var(--success))] to-[hsl(var(--success))]/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[var(--shadow-brand-lg)]">
                  <Check className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gradient-brand mb-2">
                Payment Successful!
              </h2>
              <p className="text-[hsl(var(--muted-foreground))]">Transaction ID: {transactionId}</p>
              <Card className="mt-6 bg-gradient-to-r from-[hsl(var(--success))]/5 to-[hsl(var(--success))]/10 glass border-[hsl(var(--border))] rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5 text-[hsl(var(--success))]" />
                    <span className="text-[hsl(var(--success))] font-medium">Payment processed successfully</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* Enhanced Amount Display */}
              <Card className="bg-gradient-to-r from-[hsl(var(--primary))]/5 to-[hsl(var(--accent-light))]/10 glass border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-[var(--shadow-brand)]">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-[hsl(var(--primary))]" />
                    <p className="text-[hsl(var(--muted-foreground))] font-medium">Amount to Pay</p>
                  </div>
                  <p className="text-4xl font-bold text-gradient-brand">
                    ${(invoice.amount + (invoice.tax_amount || 0)).toLocaleString()}
                  </p>
                  <div className="mt-4 p-3 bg-gradient-to-r from-[hsl(var(--card))]/50 to-[hsl(var(--primary))]/5 rounded-xl">
                    <p className="text-sm text-[hsl(var(--primary))] font-medium">
                      Invoice: {invoice.invoice_number}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Payment Form */}
              <Card className="bg-gradient-to-r from-[hsl(var(--muted))]/50 to-[hsl(var(--muted))]/30 glass border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-[var(--shadow-brand)]">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                    <h3 className="font-bold text-[hsl(var(--foreground))]">Payment Details</h3>
                  </div>
                  
                  <div>
                    <Label className="text-base font-semibold text-[hsl(var(--muted-foreground))] mb-2 block">Card Number</Label>
                    <Input 
                      value={cardDetails.number} 
                      onChange={e => setCardDetails(p=>({...p, number: formatCardNumber(e.target.value)}))} 
                      placeholder="0000 0000 0000 0000"
                      className="glass border-[hsl(var(--border))] rounded-2xl py-3 px-4 focus-brand transition-brand"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-base font-semibold text-[hsl(var(--muted-foreground))] mb-2 block">Cardholder Name</Label>
                    <Input 
                      value={cardDetails.name} 
                      onChange={e => setCardDetails(p=>({...p, name: e.target.value}))} 
                      placeholder="John Doe"
                      className="glass border-[hsl(var(--border))] rounded-2xl py-3 px-4 focus-brand transition-brand"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-base font-semibold text-[hsl(var(--muted-foreground))] mb-2 block">Expiry Date</Label>
                      <Input 
                        value={cardDetails.expiry} 
                        onChange={e => setCardDetails(p=>({...p, expiry: formatExpiry(e.target.value)}))} 
                        placeholder="MM/YY"
                        className="glass border-[hsl(var(--border))] rounded-2xl py-3 px-4 focus-brand transition-brand"
                      />
                    </div>
                    <div>
                      <Label className="text-base font-semibold text-[hsl(var(--muted-foreground))] mb-2 block">CVV</Label>
                      <Input 
                        value={cardDetails.cvv} 
                        onChange={e => setCardDetails(p=>({...p, cvv: e.target.value.replace(/\D/g, '').substring(0,3)}))} 
                        placeholder="123"
                        className="glass border-[hsl(var(--border))] rounded-2xl py-3 px-4 focus-brand transition-brand"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Pay Button */}
              <Button 
                onClick={handlePayment} 
                disabled={isProcessing} 
                className="w-full btn-gradient font-bold py-4 text-lg rounded-2xl shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5" />
                    <span>Pay ${(invoice.amount + (invoice.tax_amount || 0)).toLocaleString()}</span>
                    <Sparkles className="w-5 h-5" />
                  </div>
                )}
              </Button>

              {/* Enhanced Security Notice */}
              <Card className="bg-gradient-to-r from-[hsl(var(--success))]/5 to-[hsl(var(--success))]/10 glass border-[hsl(var(--border))] rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-2 text-[hsl(var(--success))]">
                    <Shield className="w-4 h-4" />
                    <p className="text-sm font-medium">
                      🔒 This is a secure, mock transaction for demonstration
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}