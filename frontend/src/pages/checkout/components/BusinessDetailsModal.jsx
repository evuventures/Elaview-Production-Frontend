// src/pages/checkout/components/BusinessDetailsModal.jsx
// ✅ STEP 2: One-time business profile collection modal
// Shows when user attempts checkout but has incomplete business profile

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { 
  X, Building2, Phone, Globe, FileText, MapPin, 
  CheckCircle, AlertCircle, Loader2, Save
} from 'lucide-react';
import { Button } from "../../../components/ui/button";
import apiClient from '../../../api/apiClient';

const BUSINESS_TYPES = [
  { value: 'SMALL_BUSINESS', label: 'Small Business (1-50 employees)' },
  { value: 'MEDIUM_BUSINESS', label: 'Medium Business (51-500 employees)' },
  { value: 'LARGE_ENTERPRISE', label: 'Large Enterprise (500+ employees)' },
  { value: 'STARTUP', label: 'Startup' },
  { value: 'AGENCY', label: 'Marketing/Advertising Agency' },
  { value: 'NON_PROFIT', label: 'Non-Profit Organization' },
  { value: 'FREELANCER', label: 'Freelancer/Individual' },
  { value: 'CORPORATION', label: 'Public Corporation' },
  { value: 'LLC', label: 'Limited Liability Company' },
  { value: 'PARTNERSHIP', label: 'Business Partnership' },
  { value: 'OTHER', label: 'Other' }
];

const INDUSTRY_OPTIONS = [
  'Advertising & Marketing', 'Agriculture', 'Automotive', 'Beauty & Cosmetics',
  'Construction', 'Consulting', 'E-commerce', 'Education', 'Entertainment',
  'Fashion & Apparel', 'Finance & Banking', 'Food & Beverage', 'Healthcare',
  'Hospitality & Tourism', 'Insurance', 'Legal Services', 'Manufacturing',
  'Media & Publishing', 'Non-Profit', 'Professional Services', 'Real Estate',
  'Retail', 'Software & Technology', 'Sports & Recreation', 'Transportation',
  'Other'
];

export default function BusinessDetailsModal({ 
  isOpen, 
  onClose, 
  onComplete,
  requiredMessage = "Complete your business profile to proceed with checkout"
}) {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'SMALL_BUSINESS',
    businessIndustry: '',
    businessAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    businessPhone: '',
    businessWebsite: '',
    taxId: '',
    businessDescription: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'success', 'error'

  // Load existing business data if available
  useEffect(() => {
    if (isOpen && user?.id) {
      loadExistingBusinessData();
    }
  }, [isOpen, user?.id]);

  const loadExistingBusinessData = async () => {
    try {
      const response = await apiClient.getUserBusinessProfile();
      if (response.success && response.data) {
        const businessData = response.data;
        setFormData({
          businessName: businessData.businessName || '',
          businessType: businessData.businessType || 'SMALL_BUSINESS',
          businessIndustry: businessData.businessIndustry || '',
          businessAddress: businessData.businessAddress || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'United States'
          },
          businessPhone: businessData.businessPhone || '',
          businessWebsite: businessData.businessWebsite || '',
          taxId: businessData.taxId || '',
          businessDescription: businessData.businessDescription || ''
        });
      }
    } catch (error) {
      console.error('❌ Failed to load business data:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    
    if (!formData.businessIndustry) {
      newErrors.businessIndustry = 'Please select your industry';
    }
    
    if (!formData.businessAddress.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    
    if (!formData.businessAddress.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.businessAddress.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.businessAddress.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }
    
    // Optional but validated fields
    if (formData.businessWebsite && !isValidUrl(formData.businessWebsite)) {
      newErrors.businessWebsite = 'Please enter a valid website URL';
    }
    
    if (formData.businessPhone && !isValidPhone(formData.businessPhone)) {
      newErrors.businessPhone = 'Please enter a valid phone number';
    }
    
    if (formData.taxId && formData.taxId.length < 9) {
      newErrors.taxId = 'Tax ID should be at least 9 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      const urlPattern = /^https?:\/\/.+/i;
      return urlPattern.test(url) || url.includes('.');
    } catch {
      return false;
    }
  };

  const isValidPhone = (phone) => {
    const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    return phonePattern.test(cleanPhone) && cleanPhone.length >= 10;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      businessAddress: {
        ...prev.businessAddress,
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('❌ Form validation failed:', errors);
      return;
    }
    
    setLoading(true);
    setSaveStatus('saving');
    
    try {
      console.log('💼 Saving business profile:', formData);
      
      const response = await apiClient.updateBusinessProfile(formData);
      
      if (response.success) {
        console.log('✅ Business profile saved successfully');
        setSaveStatus('success');
        
        // Show success state briefly, then complete
        setTimeout(() => {
          setSaveStatus(null);
          onComplete?.(response.data);
        }, 1500);
      } else {
        console.error('❌ Failed to save business profile:', response.error);
        setSaveStatus('error');
        setErrors({ submit: response.error || 'Failed to save business profile' });
      }
    } catch (error) {
      console.error('❌ Business profile save error:', error);
      setSaveStatus('error');
      setErrors({ submit: 'Failed to save business profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose?.()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Complete Business Profile</h2>
                  <p className="text-teal-100 text-sm">{requiredMessage}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Basics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-600" />
                  Business Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Business Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                        errors.businessName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Your company or business name"
                    />
                    {errors.businessName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.businessName}
                      </p>
                    )}
                  </div>

                  {/* Business Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type *
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    >
                      {BUSINESS_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry *
                    </label>
                    <select
                      value={formData.businessIndustry}
                      onChange={(e) => handleInputChange('businessIndustry', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                        errors.businessIndustry ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select your industry</option>
                      {INDUSTRY_OPTIONS.map(industry => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                    {errors.businessIndustry && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.businessIndustry}
                      </p>
                    )}
                  </div>
                </div>

                {/* Business Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Description
                  </label>
                  <textarea
                    value={formData.businessDescription}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="Brief description of your business (optional)"
                  />
                </div>
              </div>

              {/* Business Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-600" />
                  Business Address
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Street Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={formData.businessAddress.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                        errors.street ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Street address"
                    />
                    {errors.street && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.street}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.businessAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                        errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="City"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.city}
                      </p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.businessAddress.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                        errors.state ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="State"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.state}
                      </p>
                    )}
                  </div>

                  {/* ZIP Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={formData.businessAddress.zipCode}
                      onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                        errors.zipCode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="ZIP code"
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.zipCode}
                      </p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.businessAddress.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              {/* Contact & Tax Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-teal-600" />
                  Contact & Tax Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Business Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.businessPhone}
                      onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                        errors.businessPhone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="(555) 123-4567"
                    />
                    {errors.businessPhone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.businessPhone}
                      </p>
                    )}
                  </div>

                  {/* Business Website */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Website
                    </label>
                    <input
                      type="url"
                      value={formData.businessWebsite}
                      onChange={(e) => handleInputChange('businessWebsite', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                        errors.businessWebsite ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="https://yourwebsite.com"
                    />
                    {errors.businessWebsite && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.businessWebsite}
                      </p>
                    )}
                  </div>

                  {/* Tax ID */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax ID / EIN
                    </label>
                    <input
                      type="text"
                      value={formData.taxId}
                      onChange={(e) => handleInputChange('taxId', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                        errors.taxId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="XX-XXXXXXX (for tax documentation)"
                    />
                    {errors.taxId && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.taxId}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Required for invoicing and tax documentation
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || saveStatus === 'saving'}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : saveStatus === 'success' ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save & Continue
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}