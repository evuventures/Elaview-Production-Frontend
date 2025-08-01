// src/utils/businessValidation.js
// ✅ STEP 2: Business profile validation utilities
// Centralized validation logic for business profiles

/**
 * Validation rules for business profile fields
 * Based on B2B marketplace requirements and UX research
 */

// ===== FIELD VALIDATION FUNCTIONS =====

/**
 * Validate business name
 * Must be at least 2 characters, no special characters except basic punctuation
 */
export function validateBusinessName(name) {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Business name is required' };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Business name must be at least 2 characters' };
  }
  
  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Business name must be less than 100 characters' };
  }
  
  // Allow letters, numbers, spaces, and basic punctuation
  const namePattern = /^[a-zA-Z0-9\s\-\.\,\&\(\)\'\"]+$/;
  if (!namePattern.test(trimmedName)) {
    return { isValid: false, error: 'Business name contains invalid characters' };
  }
  
  return { isValid: true, value: trimmedName };
}

/**
 * Validate business type
 * Must be one of the predefined business types
 */
export function validateBusinessType(type) {
  const validTypes = [
    'SMALL_BUSINESS', 'MEDIUM_BUSINESS', 'LARGE_ENTERPRISE', 'STARTUP',
    'AGENCY', 'NON_PROFIT', 'FREELANCER', 'CORPORATION', 'LLC', 
    'PARTNERSHIP', 'OTHER'
  ];
  
  if (!type) {
    return { isValid: false, error: 'Business type is required' };
  }
  
  if (!validTypes.includes(type)) {
    return { isValid: false, error: 'Invalid business type' };
  }
  
  return { isValid: true, value: type };
}

/**
 * Validate business industry
 * Must be selected from predefined list
 */
export function validateBusinessIndustry(industry) {
  if (!industry || typeof industry !== 'string') {
    return { isValid: false, error: 'Business industry is required' };
  }
  
  const trimmedIndustry = industry.trim();
  
  if (trimmedIndustry.length < 2) {
    return { isValid: false, error: 'Please select a valid industry' };
  }
  
  return { isValid: true, value: trimmedIndustry };
}

/**
 * Validate business address
 * Comprehensive address validation for B2B invoicing requirements
 */
export function validateBusinessAddress(address) {
  if (!address || typeof address !== 'object') {
    return { isValid: false, error: 'Business address is required' };
  }
  
  const errors = {};
  const validatedAddress = {};
  
  // Street address validation
  if (!address.street || !address.street.trim()) {
    errors.street = 'Street address is required';
  } else if (address.street.trim().length < 5) {
    errors.street = 'Street address must be at least 5 characters';
  } else if (address.street.trim().length > 100) {
    errors.street = 'Street address must be less than 100 characters';
  } else {
    validatedAddress.street = address.street.trim();
  }
  
  // City validation
  if (!address.city || !address.city.trim()) {
    errors.city = 'City is required';
  } else if (address.city.trim().length < 2) {
    errors.city = 'City must be at least 2 characters';
  } else if (address.city.trim().length > 50) {
    errors.city = 'City must be less than 50 characters';
  } else {
    validatedAddress.city = address.city.trim();
  }
  
  // State validation
  if (!address.state || !address.state.trim()) {
    errors.state = 'State is required';
  } else if (address.state.trim().length < 2) {
    errors.state = 'State must be at least 2 characters';
  } else {
    validatedAddress.state = address.state.trim();
  }
  
  // ZIP code validation
  if (!address.zipCode || !address.zipCode.trim()) {
    errors.zipCode = 'ZIP code is required';
  } else {
    const zipPattern = /^[0-9]{5}(-[0-9]{4})?$/; // US ZIP format
    const cleanZip = address.zipCode.trim();
    if (!zipPattern.test(cleanZip)) {
      errors.zipCode = 'Please enter a valid ZIP code (12345 or 12345-6789)';
    } else {
      validatedAddress.zipCode = cleanZip;
    }
  }
  
  // Country (optional, defaults to US)
  validatedAddress.country = address.country?.trim() || 'United States';
  
  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }
  
  return { isValid: true, value: validatedAddress };
}

/**
 * Validate business phone number
 * Flexible validation for various phone formats
 */
export function validateBusinessPhone(phone) {
  if (!phone) {
    return { isValid: true, value: '' }; // Phone is optional
  }
  
  if (typeof phone !== 'string') {
    return { isValid: false, error: 'Invalid phone number format' };
  }
  
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Check length (10-15 digits is reasonable for most phone numbers)
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number must be 10-15 digits' };
  }
  
  // Basic US phone number patterns
  const phonePatterns = [
    /^\d{10}$/, // 1234567890
    /^1\d{10}$/, // 11234567890 (with country code)
    /^\(\d{3}\)\s?\d{3}-?\d{4}$/, // (123) 456-7890
    /^\d{3}-?\d{3}-?\d{4}$/, // 123-456-7890
    /^\+1\d{10}$/ // +11234567890
  ];
  
  const isValidFormat = phonePatterns.some(pattern => pattern.test(phone));
  
  if (!isValidFormat) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  
  return { isValid: true, value: phone.trim() };
}

/**
 * Validate business website URL
 * Flexible URL validation
 */
export function validateBusinessWebsite(website) {
  if (!website) {
    return { isValid: true, value: '' }; // Website is optional
  }
  
  if (typeof website !== 'string') {
    return { isValid: false, error: 'Invalid website format' };
  }
  
  let url = website.trim();
  
  // Add protocol if missing
  if (url && !url.match(/^https?:\/\//)) {
    url = 'https://' + url;
  }
  
  try {
    const urlObject = new URL(url);
    
    // Check for valid domains (must have at least one dot)
    if (!urlObject.hostname.includes('.')) {
      return { isValid: false, error: 'Please enter a valid website URL' };
    }
    
    return { isValid: true, value: url };
  } catch {
    return { isValid: false, error: 'Please enter a valid website URL' };
  }
}

/**
 * Validate Tax ID / EIN
 * US EIN format validation
 */
export function validateTaxId(taxId) {
  if (!taxId) {
    return { isValid: true, value: '' }; // Tax ID is optional but recommended
  }
  
  if (typeof taxId !== 'string') {
    return { isValid: false, error: 'Invalid tax ID format' };
  }
  
  // Remove all non-digit characters
  const digitsOnly = taxId.replace(/\D/g, '');
  
  // US EIN should be 9 digits
  if (digitsOnly.length === 9) {
    // Format as XX-XXXXXXX
    const formatted = `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2)}`;
    return { isValid: true, value: formatted };
  }
  
  // Allow other formats for international tax IDs
  if (digitsOnly.length >= 6 && digitsOnly.length <= 15) {
    return { isValid: true, value: taxId.trim() };
  }
  
  return { isValid: false, error: 'Tax ID should be 9 digits for US businesses or 6-15 characters for international' };
}

// ===== COMPREHENSIVE VALIDATION FUNCTIONS =====

/**
 * Validate entire business profile
 * Returns validation results for all fields
 */
export function validateBusinessProfile(profile) {
  const validationResults = {
    isValid: true,
    errors: {},
    values: {}
  };
  
  // Validate required fields
  const nameValidation = validateBusinessName(profile.businessName);
  if (!nameValidation.isValid) {
    validationResults.isValid = false;
    validationResults.errors.businessName = nameValidation.error;
  } else {
    validationResults.values.businessName = nameValidation.value;
  }
  
  const typeValidation = validateBusinessType(profile.businessType);
  if (!typeValidation.isValid) {
    validationResults.isValid = false;
    validationResults.errors.businessType = typeValidation.error;
  } else {
    validationResults.values.businessType = typeValidation.value;
  }
  
  const industryValidation = validateBusinessIndustry(profile.businessIndustry);
  if (!industryValidation.isValid) {
    validationResults.isValid = false;
    validationResults.errors.businessIndustry = industryValidation.error;
  } else {
    validationResults.values.businessIndustry = industryValidation.value;
  }
  
  const addressValidation = validateBusinessAddress(profile.businessAddress);
  if (!addressValidation.isValid) {
    validationResults.isValid = false;
    validationResults.errors = { ...validationResults.errors, ...addressValidation.errors };
  } else {
    validationResults.values.businessAddress = addressValidation.value;
  }
  
  // Validate optional fields
  const phoneValidation = validateBusinessPhone(profile.businessPhone);
  if (!phoneValidation.isValid) {
    validationResults.isValid = false;
    validationResults.errors.businessPhone = phoneValidation.error;
  } else {
    validationResults.values.businessPhone = phoneValidation.value;
  }
  
  const websiteValidation = validateBusinessWebsite(profile.businessWebsite);
  if (!websiteValidation.isValid) {
    validationResults.isValid = false;
    validationResults.errors.businessWebsite = websiteValidation.error;
  } else {
    validationResults.values.businessWebsite = websiteValidation.value;
  }
  
  const taxIdValidation = validateTaxId(profile.taxId);
  if (!taxIdValidation.isValid) {
    validationResults.isValid = false;
    validationResults.errors.taxId = taxIdValidation.error;
  } else {
    validationResults.values.taxId = taxIdValidation.value;
  }
  
  // Business description (always valid if present)
  if (profile.businessDescription) {
    validationResults.values.businessDescription = profile.businessDescription.trim();
  }
  
  return validationResults;
}

/**
 * Check if business profile is complete for checkout
 * Based on B2B marketplace requirements
 */
export function isBusinessProfileComplete(profile) {
  if (!profile) return false;
  
  // Essential fields for B2B checkout
  const requiredFields = [
    'businessName',
    'businessIndustry'
  ];
  
  // Check required fields
  for (const field of requiredFields) {
    if (!profile[field] || !profile[field].trim()) {
      return false;
    }
  }
  
  // Check address completeness
  if (!profile.businessAddress) return false;
  
  const requiredAddressFields = ['street', 'city', 'state', 'zipCode'];
  for (const field of requiredAddressFields) {
    if (!profile.businessAddress[field] || !profile.businessAddress[field].trim()) {
      return false;
    }
  }
  
  return true;
}

/**
 * Get missing required fields for user feedback
 * Returns array of user-friendly field names
 */
export function getMissingRequiredFields(profile) {
  const missing = [];
  
  if (!profile) {
    return ['Business Name', 'Industry', 'Business Address'];
  }
  
  if (!profile.businessName?.trim()) {
    missing.push('Business Name');
  }
  
  if (!profile.businessIndustry?.trim()) {
    missing.push('Industry');
  }
  
  if (!profile.businessAddress) {
    missing.push('Business Address');
  } else {
    const address = profile.businessAddress;
    const missingAddressFields = [];
    
    if (!address.street?.trim()) missingAddressFields.push('Street Address');
    if (!address.city?.trim()) missingAddressFields.push('City');
    if (!address.state?.trim()) missingAddressFields.push('State');
    if (!address.zipCode?.trim()) missingAddressFields.push('ZIP Code');
    
    if (missingAddressFields.length > 0) {
      missing.push(...missingAddressFields);
    }
  }
  
  return missing;
}

/**
 * Calculate profile completion percentage
 * For UI progress indicators
 */
export function calculateCompletionPercentage(profile) {
  if (!profile) return 0;
  
  const fields = [
    { key: 'businessName', weight: 20 },
    { key: 'businessIndustry', weight: 15 },
    { key: 'businessType', weight: 10 },
    { key: 'businessAddress.street', weight: 15 },
    { key: 'businessAddress.city', weight: 10 },
    { key: 'businessAddress.state', weight: 10 },
    { key: 'businessAddress.zipCode', weight: 10 },
    { key: 'businessPhone', weight: 5 },
    { key: 'businessWebsite', weight: 5 }
  ];
  
  let completedWeight = 0;
  const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);
  
  fields.forEach(field => {
    const value = getNestedValue(profile, field.key);
    if (value && value.trim && value.trim()) {
      completedWeight += field.weight;
    }
  });
  
  return Math.round((completedWeight / totalWeight) * 100);
}

/**
 * Helper function to get nested object values
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// ===== EXPORT ALL VALIDATION FUNCTIONS =====
export default {
  validateBusinessName,
  validateBusinessType,
  validateBusinessIndustry,
  validateBusinessAddress,
  validateBusinessPhone,
  validateBusinessWebsite,
  validateTaxId,
  validateBusinessProfile,
  isBusinessProfileComplete,
  getMissingRequiredFields,
  calculateCompletionPercentage
};