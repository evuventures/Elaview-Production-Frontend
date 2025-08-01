import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Building2, 
  MapPin, 
  Phone, 
  Globe, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
  Zap
} from 'lucide-react';

import apiClient from '../../../api/apiClient';

// 🏢 INDUSTRY OPTIONS - Comprehensive B2B List
const INDUSTRY_OPTIONS = [
  'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail',
  'Real Estate', 'Education', 'Professional Services', 'Marketing & Advertising',
  'Construction', 'Transportation', 'Food & Beverage', 'Entertainment',
  'Non-Profit', 'Government', 'Energy', 'Telecommunications', 'Other'
];

function BusinessDetailsModal({ 
  isOpen, 
  onClose, 
  onComplete, 
  existingData = null,
  required = false,
  requiredMessage = "Please complete your business profile to continue."
}) {
  const { user } = useUser();
  
  // ✅ FORM STATE
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    description: '',
    phone: '',
    website: '',
    taxId: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    }
  });

  // ✅ UI STATE
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // 🔄 POPULATE EXISTING DATA
  useEffect(() => {
    if (existingData) {
      console.log('📝 Populating existing business data:', existingData);
      setFormData({
        businessName: existingData.businessName || '',
        industry: existingData.businessIndustry || existingData.industry || '', // Handle both field names
        description: existingData.description || '',
        phone: existingData.phone || '',
        website: existingData.website || '',
        taxId: existingData.taxId || '',
        address: {
          street: existingData.address?.street || '',
          city: existingData.address?.city || '',
          state: existingData.address?.state || '',
          zipCode: existingData.address?.zipCode || '',
          country: existingData.address?.country || 'United States'
        }
      });
      
      // Show advanced if any advanced fields are filled
      const hasAdvancedData = existingData.phone || existingData.website || existingData.taxId;
      setShowAdvanced(hasAdvancedData);
    }
  }, [existingData]);

  // 📝 FORM HANDLERS
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
    
    // Clear address errors
    if (errors[`address.${field}`]) {
      setErrors(prev => ({ ...prev, [`address.${field}`]: null }));
    }
  };

  // ✅ REAL-TIME VALIDATION
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    if (!formData.industry) {
      newErrors.industry = 'Industry selection is required';
    }
    
    // Address validation (required for invoicing)
    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street address is required';
    }
    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }
    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State is required';
    }
    if (!formData.address.zipCode.trim()) {
      newErrors['address.zipCode'] = 'ZIP code is required';
    }

    // Optional field validation
    if (formData.phone && !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (include http://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🚀 FORM SUBMISSION
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('📝 Form validation failed:', errors);
      return;
    }

    console.log('📝 Submitting business profile:', formData);
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Transform form data to match API expectations
      const apiData = {
        ...formData,
        businessIndustry: formData.industry // Map industry to businessIndustry
      };
      delete apiData.industry; // Remove the old field name
      
      const response = await apiClient.updateBusinessProfile(apiData);
      
      if (response.success) {
        console.log('📝 Business profile saved successfully');
        setIsSuccess(true);
        
        // Brief success animation before completing
        setTimeout(() => {
          onComplete(response.data);
        }, 1000);
      } else {
        throw new Error(response.error || 'Failed to save business profile');
      }
    } catch (error) {
      console.error('📝 Error saving business profile:', error);
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🎨 RENDER HELPERS
  const renderFieldError = (fieldName) => {
    if (errors[fieldName]) {
      return (
        <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
          <AlertCircle className="w-3 h-3" />
          {errors[fieldName]}
        </div>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={required ? undefined : onClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] mx-4 overflow-hidden"
        >
          <Card className="shadow-2xl">
            {/* Header */}
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {existingData ? 'Update Business Profile' : 'Complete Your Business Profile'}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      {required ? requiredMessage : 'This information helps us provide better service'}
                    </p>
                  </div>
                </div>
                {!required && (
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <Shield className="w-3 h-3" />
                  Secure & Encrypted
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <Zap className="w-3 h-3" />
                  Quick Setup
                </div>
              </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="max-h-[70vh] overflow-y-auto p-6">
              {isSuccess ? (
                // Success State
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Profile Saved!</h3>
                  <p className="text-slate-600">Redirecting to checkout...</p>
                </motion.div>
              ) : (
                // Form State
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Essential Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="font-semibold text-slate-900">Essential Information</h3>
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    </div>

                    {/* Business Name */}
                    <div>
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        placeholder="Enter your business name"
                        className={errors.businessName ? 'border-red-300' : ''}
                      />
                      {renderFieldError('businessName')}
                    </div>

                    {/* Industry */}
                    <div>
                      <Label htmlFor="industry">Industry *</Label>
                      <select
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg bg-white ${
                          errors.industry ? 'border-red-300' : 'border-slate-300'
                        }`}
                      >
                        <option value="">Select your industry</option>
                        {INDUSTRY_OPTIONS.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                      {renderFieldError('industry')}
                    </div>

                    {/* Business Address */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Business Address *
                        <Badge variant="outline" className="text-xs">For invoicing</Badge>
                      </Label>
                      
                      <Input
                        placeholder="Street address"
                        value={formData.address.street}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                        className={errors['address.street'] ? 'border-red-300' : ''}
                      />
                      {renderFieldError('address.street')}
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Input
                            placeholder="City"
                            value={formData.address.city}
                            onChange={(e) => handleAddressChange('city', e.target.value)}
                            className={errors['address.city'] ? 'border-red-300' : ''}
                          />
                          {renderFieldError('address.city')}
                        </div>
                        <div>
                          <Input
                            placeholder="State"
                            value={formData.address.state}
                            onChange={(e) => handleAddressChange('state', e.target.value)}
                            className={errors['address.state'] ? 'border-red-300' : ''}
                          />
                          {renderFieldError('address.state')}
                        </div>
                      </div>
                      
                      <Input
                        placeholder="ZIP Code"
                        value={formData.address.zipCode}
                        onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                        className={errors['address.zipCode'] ? 'border-red-300' : ''}
                      />
                      {renderFieldError('address.zipCode')}
                    </div>
                  </div>

                  {/* Advanced Fields - Collapsible */}
                  <div className="border-t pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 p-0 h-auto font-medium text-slate-700 hover:text-slate-900"
                    >
                      Additional Details (Optional)
                      {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>

                    <AnimatePresence>
                      {showAdvanced && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 space-y-4">
                            {/* Business Description */}
                            <div>
                              <Label htmlFor="description">Business Description</Label>
                              <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Brief description of your business (optional)"
                                rows={3}
                              />
                            </div>

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="phone" className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  Phone Number
                                </Label>
                                <Input
                                  id="phone"
                                  value={formData.phone}
                                  onChange={(e) => handleInputChange('phone', e.target.value)}
                                  placeholder="(555) 123-4567"
                                  className={errors.phone ? 'border-red-300' : ''}
                                />
                                {renderFieldError('phone')}
                              </div>
                              
                              <div>
                                <Label htmlFor="website" className="flex items-center gap-2">
                                  <Globe className="w-4 h-4" />
                                  Website
                                </Label>
                                <Input
                                  id="website"
                                  value={formData.website}
                                  onChange={(e) => handleInputChange('website', e.target.value)}
                                  placeholder="https://yourwebsite.com"
                                  className={errors.website ? 'border-red-300' : ''}
                                />
                                {renderFieldError('website')}
                              </div>
                            </div>

                            {/* Tax ID */}
                            <div>
                              <Label htmlFor="taxId" className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Tax ID / EIN
                                <Badge variant="outline" className="text-xs">For tax purposes</Badge>
                              </Label>
                              <Input
                                id="taxId"
                                value={formData.taxId}
                                onChange={(e) => handleInputChange('taxId', e.target.value)}
                                placeholder="XX-XXXXXXX"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Submit Error */}
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="font-medium text-red-800">Error Saving Profile</p>
                          <p className="text-sm text-red-700">{submitError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    {!required && (
                      <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className={`${required ? 'w-full' : 'flex-1'}`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Saving Profile...
                        </>
                      ) : (
                        existingData ? 'Update Profile' : 'Complete Profile'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default BusinessDetailsModal;