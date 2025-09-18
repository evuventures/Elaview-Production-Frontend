
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
 X, AlertCircle, CheckCircle2, Loader2, Send, 
 Shield, FileText, Scale
} from "lucide-react";

interface LegalAgreementModalProps {
 isOpen: boolean;
 onClose: () => void;
 onAgreeAndSubmit: () => void;
 isSubmitting?: boolean;
 campaignName?: string;
 totalCost?: number;
 totalSpaces?: number;
}

// Format currency helper
const formatCurrency = (amount: number) => {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD',
 minimumFractionDigits: 0,
 maximumFractionDigits: 0
 }).format(amount);
};

export default function LegalAgreementModal({ 
 isOpen, 
 onClose, 
 onAgreeAndSubmit, 
 isSubmitting = false,
 campaignName,
 totalCost = 0,
 totalSpaces = 0
}: LegalAgreementModalProps) {
 // Legal agreement state
 const [agreedToTerms, setAgreedToTerms] = useState(false);
 const [agreedToContent, setAgreedToContent] = useState(false);
 const [agreedToAccuracy, setAgreedToAccuracy] = useState(false);
 const [agreedToPayment, setAgreedToPayment] = useState(false);

 // Check if all legal agreements are completed
 const allAgreementsCompleted = agreedToTerms && agreedToContent && agreedToAccuracy && agreedToPayment;

 const handleSubmit = () => {
 if (!allAgreementsCompleted || isSubmitting) return;
 onAgreeAndSubmit();
 };

 const handleClose = () => {
 if (isSubmitting) return; // Don't allow closing while submitting
 onClose();
 };

 if (!isOpen) return null;

 return (
 <AnimatePresence>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
>
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-hidden"
>
 {/* Modal Header */}
 <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
 <Shield className="text-white w-6 h-6" />
 </div>
 <div>
 <h2 className="text-xl font-bold text-gray-900">Legal Agreement & Confirmation</h2>
 <p className="text-sm text-gray-600">Required before campaign submission</p>
 </div>
 </div>
 {!isSubmitting && (
 <button
 onClick={handleClose}
 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
>
 <X className="w-5 h-5 text-gray-500" />
 </button>
 )}
 </div>
 </div>

 {/* Modal Content */}
 <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
 
 {/* Campaign Summary */}
 <div className="bg-gray-50 rounded-lg p-4 mb-6">
 <h3 className="font-semibold text-gray-900 mb-2">Campaign Summary</h3>
 <div className="grid grid-cols-2 gap-4 text-sm">
 <div>
 <span className="text-gray-600">Campaign:</span>
 <p className="font-medium text-gray-900">{campaignName || 'Selected Campaign'}</p>
 </div>
 <div>
 <span className="text-gray-600">Total Investment:</span>
 <p className="font-medium text-blue-600">{formatCurrency(totalCost)}</p>
 </div>
 <div>
 <span className="text-gray-600">Advertising Spaces:</span>
 <p className="font-medium text-gray-900">{totalSpaces} location{totalSpaces !== 1 ? 's' : ''}</p>
 </div>
 <div>
 <span className="text-gray-600">Status:</span>
 <p className="font-medium text-orange-600">Pending Approval</p>
 </div>
 </div>
 </div>

 {/* Legal Agreements */}
 <div className="space-y-4">
 <div className="flex items-center gap-2 mb-4">
 <Scale className="w-5 h-5 text-blue-600" />
 <h3 className="text-lg font-semibold text-gray-900">Legal Agreements</h3>
 </div>

 {/* Content Compliance */}
 <div className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-blue-200 transition-colors">
 <div className="flex items-start">
 <input 
 type="checkbox" 
 id="content-compliance"
 checked={agreedToContent}
 onChange={(e) => setAgreedToContent(e.target.checked)}
 disabled={isSubmitting}
 className="mt-1 mr-4 w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
 />
 <div className="flex-1">
 <label htmlFor="content-compliance" className="font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
 <FileText className="w-4 h-4 text-blue-600" />
 Content Compliance Certification
 </label>
 <p className="text-sm text-gray-700 mt-2">I certify that all advertising content is appropriate, legal, and complies with applicable laws and platform guidelines. The content does not include inappropriate, offensive, misleading, or illegal material. I understand that non-compliant content may result in campaign rejection or account suspension.</p>
 </div>
 </div>
 </div>
 
 {/* Information Accuracy */}
 <div className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-blue-200 transition-colors">
 <div className="flex items-start">
 <input 
 type="checkbox" 
 id="information-accuracy"
 checked={agreedToAccuracy}
 onChange={(e) => setAgreedToAccuracy(e.target.checked)}
 disabled={isSubmitting}
 className="mt-1 mr-4 w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
 />
 <div className="flex-1">
 <label htmlFor="information-accuracy" className="font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
 <CheckCircle2 className="w-4 h-4 text-green-600" />
 Information Accuracy Declaration
 </label>
 <p className="text-sm text-gray-700 mt-2">I confirm that all campaign information, business details, contact information, and financial details provided are accurate, complete, and up-to-date. I will notify the platform of any material changes to this information.</p>
 </div>
 </div>
 </div>

 {/* Payment Agreement */}
 <div className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-blue-200 transition-colors">
 <div className="flex items-start">
 <input 
 type="checkbox" 
 id="payment-agreement"
 checked={agreedToPayment}
 onChange={(e) => setAgreedToPayment(e.target.checked)}
 disabled={isSubmitting}
 className="mt-1 mr-4 w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
 />
 <div className="flex-1">
 <label htmlFor="payment-agreement" className="font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
 <Send className="w-4 h-4 text-purple-600" />
 Payment & Billing Agreement
 </label>
 <p className="text-sm text-gray-700 mt-2">I understand and agree that payment of {formatCurrency(totalCost)} will be processed only upon space owner approval of my campaign invitation. No charges will occur without explicit approval. I authorize payment processing for approved campaign bookings.</p>
 </div>
 </div>
 </div>
 
 {/* Terms & Conditions */}
 <div className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-blue-200 transition-colors">
 <div className="flex items-start">
 <input 
 type="checkbox" 
 id="terms-conditions"
 checked={agreedToTerms}
 onChange={(e) => setAgreedToTerms(e.target.checked)}
 disabled={isSubmitting}
 className="mt-1 mr-4 w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
 />
 <div className="flex-1">
 <label htmlFor="terms-conditions" className="font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
 <Scale className="w-4 h-4 text-blue-600" />
 Terms of Service Agreement
 </label>
 <p className="text-sm text-gray-700 mt-2">I agree to the platform's Terms of Service, Privacy Policy, and Advertising Guidelines. I understand the campaign approval process, cancellation policies, and dispute resolution procedures. I acknowledge that this is a binding agreement.</p>
 <div className="mt-2">
 <a href="/terms" target="_blank" className="text-blue-600 hover:text-blue-700 text-xs underline mr-4">
 Read Terms of Service
 </a>
 <a href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700 text-xs underline mr-4">
 Privacy Policy
 </a>
 <a href="/advertising-guidelines" target="_blank" className="text-blue-600 hover:text-blue-700 text-xs underline">
 Advertising Guidelines
 </a>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Agreement Status Indicator */}
 <div className="mt-6 p-4 rounded-lg border-2 border-dashed border-gray-200">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 {allAgreementsCompleted ? (
 <CheckCircle2 className="w-5 h-5 text-green-500" />
 ) : (
 <AlertCircle className="w-5 h-5 text-orange-500" />
 )}
 <span className="font-medium text-gray-900">
 {allAgreementsCompleted 
 ? 'All agreements completed' 
 : `${[agreedToContent, agreedToAccuracy, agreedToPayment, agreedToTerms].filter(Boolean).length}/4 agreements completed`
 }
 </span>
 </div>
 <div className="text-sm text-gray-500">
 {allAgreementsCompleted ? 'Ready to submit' : 'Complete all agreements to continue'}
 </div>
 </div>
 </div>
 </div>

 {/* Modal Footer */}
 <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
 <div className="flex items-center justify-between">
 <div className="text-sm text-gray-600">
 By clicking "Agree and Submit", you're confirming all agreements above
 </div>
 <div className="flex gap-3">
 <button
 onClick={handleClose}
 disabled={isSubmitting}
 className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
>
 Cancel
 </button>
 <button
 onClick={handleSubmit}
 disabled={!allAgreementsCompleted || isSubmitting}
 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
>
 {isSubmitting ? (
 <>
 <Loader2 className="w-4 h-4 animate-spin" />
 Submitting...
 </>
 ) : (
 <>
 <Send className="w-4 h-4" />
 Agree and Submit Campaign
 </>
 )}
 </button>
 </div>
 </div>
 </div>
 </motion.div>
 </motion.div>
 </AnimatePresence>
 );
}