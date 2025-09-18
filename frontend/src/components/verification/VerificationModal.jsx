// src/components/verification/VerificationModal.jsx
import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useVerification } from './VerificationProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
 X, 
 Phone, 
 Building, 
 MapPin, 
 User, 
 Camera,
 CheckCircle,
 AlertTriangle 
} from 'lucide-react';

const fieldConfig = {
 phone: {
 icon: Phone,
 label: 'Phone Number',
 description: 'Add your phone number for account verification',
 placeholder: '+1 (555) 123-4567'
 },
 company: {
 icon: Building,
 label: 'Company Name',
 description: 'Add your company information for business verification',
 placeholder: 'Your Company Name'
 },
 address: {
 icon: MapPin,
 label: 'Business Address',
 description: 'Add your business address for property management',
 placeholder: '123 Business St, City, State 12345'
 },
 bio: {
 icon: User,
 label: 'Profile Bio',
 description: 'Add a brief description about yourself or your business',
 placeholder: 'Tell us about yourself and your business...'
 },
 profileImage: {
 icon: Camera,
 label: 'Profile Image',
 description: 'Upload a profile image to complete your account',
 placeholder: 'Upload image...'
 }
};

export default function VerificationModal() {
 const { user } = useUser();
 const { modalState, closeModal, handleVerificationComplete, checkVerificationStatus } = useVerification();
 const [isUpdating, setIsUpdating] = useState(false);
 const [formData, setFormData] = useState({});
 const [errors, setErrors] = useState({});

 // Don't render if modal is not open
 if (!modalState?.isOpen) return null;

 const handleInputChange = (field, value) => {
 setFormData(prev => ({ ...prev, [field]: value }));
 if (errors[field]) {
 setErrors(prev => ({ ...prev, [field]: null }));
 }
 };

 const validateForm = () => {
 const newErrors = {};
 
 modalState.missingFields?.forEach(field => {
 if (!formData[field]?.trim()) {
 newErrors[field] = `${fieldConfig[field]?.label || field} is required`;
 }
 });
 
 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 
 if (!validateForm()) {
 return;
 }

 setIsUpdating(true);
 setErrors({});

 try {
 // ✅ FIXED: Use unsafeMetadata instead of privateMetadata/publicMetadata
 const metadataUpdates = {};
 
 // Handle company, address, bio in unsafe metadata (allows updates)
 if (modalState.missingFields?.includes('company') && formData.company) {
 metadataUpdates.company = formData.company.trim();
 }
 
 if (modalState.missingFields?.includes('address') && formData.address) {
 metadataUpdates.address = formData.address.trim();
 }
 
 if (modalState.missingFields?.includes('bio') && formData.bio) {
 metadataUpdates.bio = formData.bio.trim();
 }

 // ✅ FIXED: Update unsafe metadata (which is allowed for user updates)
 if (Object.keys(metadataUpdates).length> 0) {
 await user.update({
 unsafeMetadata: {
 ...user.unsafeMetadata,
 ...metadataUpdates
 }
 });
 }

 // ✅ FIXED: Handle phone number through unsafeMetadata for now
 if (modalState.missingFields?.includes('phone') && formData.phone) {
 try {
 await user.update({
 unsafeMetadata: {
 ...user.unsafeMetadata,
 phone: formData.phone.trim(),
 phoneVerified: false // Mark as needing verification
 }
 });
 
 console.log('Phone stored for verification:', formData.phone);
 // TODO: Implement proper phone verification in production
 } catch (phoneError) {
 console.error('Phone storage error:', phoneError);
 // Don't fail the entire process for phone
 }
 }

 // ✅ FIXED: Handle profile image reference in unsafeMetadata
 if (modalState.missingFields?.includes('profileImage') && formData.profileImage) {
 try {
 await user.update({
 unsafeMetadata: {
 ...user.unsafeMetadata,
 hasProfileImage: true,
 profileImageName: formData.profileImage.name
 }
 });
 
 console.log('Profile image reference stored:', formData.profileImage.name);
 // TODO: Implement actual image upload to Clerk in production
 } catch (imageError) {
 console.error('Image reference storage error:', imageError);
 // Don't fail the entire process for image
 }
 }

 // Force user data refresh
 await user.reload();

 // Re-check verification status and complete
 await checkVerificationStatus();
 handleVerificationComplete();
 
 } catch (error) {
 console.error('Error updating verification info:', error);
 
 // ✅ FIXED: Better error handling for specific Clerk API errors
 if (error.message?.includes('metadata')) {
 setErrors({ submit: 'Unable to update profile information. Please try again.' });
 } else if (error.message?.includes('422')) {
 setErrors({ submit: 'Invalid data provided. Please check your information and try again.' });
 } else if (error.message?.includes('401')) {
 setErrors({ submit: 'Authentication error. Please sign in again.' });
 } else if (error.message?.includes('429')) {
 setErrors({ submit: 'Too many requests. Please wait a moment and try again.' });
 } else {
 setErrors({ submit: 'Failed to update information. Please try again.' });
 }
 } finally {
 setIsUpdating(false);
 }
 };

 const getActionTitle = () => {
 const titles = {
 campaign: 'Campaign Creation',
 property: 'Property Management',
 booking: 'Make a Booking',
 payment: 'Process Payment'
 };
 return titles[modalState.action] || 'Account Verification';
 };

 return (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
 <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
 <div>
 <CardTitle className="text-2xl font-bold">
 {modalState.title || `Complete Verification for ${getActionTitle()}`}
 </CardTitle>
 <p className="text-muted-foreground mt-2">
 {modalState.message || `Please complete the required information to continue with ${modalState.action}.`}
 </p>
 </div>
 <Button
 variant="ghost"
 size="icon"
 onClick={closeModal}
 className="h-8 w-8"
>
 <X className="h-4 w-4" />
 </Button>
 </CardHeader>

 <CardContent>
 <form onSubmit={handleSubmit} className="space-y-6">
 {errors.submit && (
 <Alert variant="destructive">
 <AlertTriangle className="h-4 w-4" />
 <AlertDescription>{errors.submit}</AlertDescription>
 </Alert>
 )}

 <div className="space-y-4">
 {modalState.missingFields?.map((field) => {
 const config = fieldConfig[field];
 if (!config) return null;

 const Icon = config.icon;

 return (
 <div key={field} className="space-y-2">
 <Label className="flex items-center gap-2 text-base font-semibold">
 <Icon className="h-4 w-4" />
 {config.label}
 <span className="text-red-500">*</span>
 </Label>
 <p className="text-sm text-muted-foreground">
 {config.description}
 </p>
 
 {field === 'bio' ? (
 <Textarea
 value={formData[field] || ''}
 onChange={(e) => handleInputChange(field, e.target.value)}
 placeholder={config.placeholder}
 rows={3}
 className="resize-none"
 required
 />
 ) : field === 'phone' ? (
 <div className="space-y-2">
 <Input
 type="tel"
 value={formData[field] || ''}
 onChange={(e) => handleInputChange(field, e.target.value)}
 placeholder={config.placeholder}
 required
 />
 <p className="text-xs text-muted-foreground">
 Note: Phone verification may require additional steps
 </p>
 </div>
 ) : field === 'profileImage' ? (
 <div className="space-y-2">
 <Input
 type="file"
 accept="image/*"
 onChange={(e) => handleInputChange(field, e.target.files?.[0] || null)}
 className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
 />
 <p className="text-xs text-muted-foreground">
 Upload a profile image (JPG, PNG, or GIF)
 </p>
 </div>
 ) : (
 <Input
 value={formData[field] || ''}
 onChange={(e) => handleInputChange(field, e.target.value)}
 placeholder={config.placeholder}
 required
 />
 )}
 
 {errors[field] && (
 <p className="text-sm text-red-500 flex items-center gap-1">
 <AlertTriangle className="h-3 w-3" />
 {errors[field]}
 </p>
 )}
 </div>
 );
 })}
 </div>

 <div className="flex items-center justify-between pt-6 border-t">
 <Button
 type="button"
 variant="outline"
 onClick={closeModal}
 disabled={isUpdating}
>
 Cancel
 </Button>
 <Button
 type="submit"
 disabled={isUpdating}
 className="min-w-[120px]"
>
 {isUpdating ? (
 <div className="flex items-center gap-2">
 <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
 Updating...
 </div>
 ) : (
 <div className="flex items-center gap-2">
 <CheckCircle className="h-4 w-4" />
 Complete Verification
 </div>
 )}
 </Button>
 </div>
 </form>
 </CardContent>
 </Card>
 </div>
 );
}