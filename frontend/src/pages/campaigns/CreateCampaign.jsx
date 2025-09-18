import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
 Building2, Upload, DollarSign, Users, ArrowRight, 
 CheckCircle, Target, Zap, TrendingUp 
} from 'lucide-react';
import { motion } from 'framer-motion';

const businessTypes = [
 { id: 'restaurant', label: 'Restaurant/Food', icon: '🍕', audience: 'Local diners, families' },
 { id: 'retail', label: 'Retail Store', icon: '🛍️', audience: 'Shoppers, browsers' },
 { id: 'service', label: 'Professional Service', icon: '💼', audience: 'Local professionals' },
 { id: 'healthcare', label: 'Healthcare', icon: '🏥', audience: 'Patients, families' },
 { id: 'automotive', label: 'Automotive', icon: '🚗', audience: 'Drivers, commuters' },
 { id: 'other', label: 'Other', icon: '🏢', audience: 'General public' }
];

const budgetRanges = [
 { id: 'starter', range: 'Under $500/mo', description: 'Perfect for local businesses', recommended: 'Digital displays, local billboards' },
 { id: 'growth', range: '$500 - $2,000/mo', description: 'Scale your reach', recommended: 'Multiple locations, premium spots' },
 { id: 'premium', range: '$2,000+/mo', description: 'Maximum impact campaigns', recommended: 'High-traffic areas, video walls' },
 { id: 'flexible', range: 'Let me explore', description: 'See all options', recommended: 'Browse without budget limits' }
];

export default function BusinessProfileSetup() {
 const [formData, setFormData] = useState({
 businessName: '',
 businessType: '',
 budget: '',
 logo: null,
 phone: '',
 website: ''
 });
 
 const [currentStep, setCurrentStep] = useState(1);
 const [isUploading, setIsUploading] = useState(false);

 const handleFileUpload = (event) => {
 const file = event.target.files[0];
 if (file) {
 setIsUploading(true);
 // Simulate upload
 setTimeout(() => {
 setFormData(prev => ({ ...prev, logo: { name: file.name, url: URL.createObjectURL(file) } }));
 setIsUploading(false);
 }, 1500);
 }
 };

 const canProceedToNext = () => {
 if (currentStep === 1) return formData.businessName && formData.businessType;
 if (currentStep === 2) return formData.budget;
 return true;
 };

 const handleNext = () => {
 if (canProceedToNext()) {
 setCurrentStep(prev => prev + 1);
 }
 };

 const handleFinish = () => {
 alert('🎉 Profile saved! You can now browse advertising spaces tailored to your business.');
 // In real app: save to database and redirect to browse page
 };

 const containerVariants = {
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
 };

 const itemVariants = {
 hidden: { y: 20, opacity: 0 },
 visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
 };

 return (
 <div className="min-h-screen bg-background p-4 md:p-8">
 <motion.div 
 className="max-w-4xl mx-auto space-y-8"
 variants={containerVariants}
 initial="hidden"
 animate="visible"
>
 {/* Header */}
 <motion.div variants={itemVariants} className="text-center">
 <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl">
 <Building2 className="w-8 h-8 text-white" />
 </div>
 <h1 className="text-4xl font-bold text-foreground mb-3">Set Up Your Business Profile</h1>
 <p className="text-muted-foreground text-lg">Quick setup to get personalized advertising recommendations</p>
 </motion.div>

 {/* Progress */}
 <motion.div variants={itemVariants}>
 <Card className="border border-border/50 backdrop-blur-lg bg-background/95">
 <CardContent className="p-6">
 <div className="flex items-center justify-between mb-4">
 {[1, 2, 3].map(step => (
 <div key={step} className="flex items-center">
 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
 currentStep>= step 
 ? 'bg-blue-500 text-white' 
 : 'bg-gray-200 text-gray-500'
 }`}>
 {currentStep> step ? <CheckCircle className="w-5 h-5" /> : step}
 </div>
 {step < 3 && (
 <div className={`w-20 h-1 mx-2 ${
 currentStep> step ? 'bg-blue-500' : 'bg-gray-200'
 }`} />
 )}
 </div>
 ))}
 </div>
 <div className="text-center">
 <p className="text-sm text-muted-foreground">
 Step {currentStep} of 3: {
 currentStep === 1 ? 'Business Details' :
 currentStep === 2 ? 'Budget & Goals' : 'Final Touches'
 }
 </p>
 </div>
 </CardContent>
 </Card>
 </motion.div>

 {/* Step Content */}
 <motion.div variants={itemVariants}>
 <Card className="border border-border/50 backdrop-blur-lg bg-background/95">
 <CardContent className="p-8">
 
 {/* Step 1: Business Details */}
 {currentStep === 1 && (
 <div className="space-y-6">
 <div className="text-center mb-8">
 <h2 className="text-2xl font-bold text-foreground mb-2">Tell us about your business</h2>
 <p className="text-muted-foreground">This helps us show you the most relevant advertising spaces</p>
 </div>

 <div className="max-w-md mx-auto space-y-6">
 <div>
 <Label htmlFor="businessName" className="text-base font-semibold mb-3 block">Business Name *</Label>
 <Input
 id="businessName"
 value={formData.businessName}
 onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
 placeholder="Your Business Name"
 className="h-12 text-base rounded-xl"
 />
 </div>

 <div>
 <Label className="text-base font-semibold mb-3 block">Business Type *</Label>
 <div className="grid grid-cols-1 gap-3">
 {businessTypes.map(type => (
 <label 
 key={type.id} 
 className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
 formData.businessType === type.id 
 ? 'border-blue-500 bg-blue-50' 
 : 'border-gray-200 hover:border-blue-300'
 }`}
>
 <input
 type="radio"
 name="businessType"
 value={type.id}
 checked={formData.businessType === type.id}
 onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
 className="sr-only"
 />
 <span className="text-2xl mr-3">{type.icon}</span>
 <div className="flex-1">
 <p className="font-semibold text-foreground">{type.label}</p>
 <p className="text-sm text-muted-foreground">Targets: {type.audience}</p>
 </div>
 {formData.businessType === type.id && (
 <CheckCircle className="w-5 h-5 text-blue-500" />
 )}
 </label>
 ))}
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Step 2: Budget & Goals */}
 {currentStep === 2 && (
 <div className="space-y-6">
 <div className="text-center mb-8">
 <h2 className="text-2xl font-bold text-foreground mb-2">What's your advertising budget?</h2>
 <p className="text-muted-foreground">We'll recommend spaces that fit your budget and goals</p>
 </div>

 <div className="max-w-2xl mx-auto">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {budgetRanges.map(budget => (
 <label 
 key={budget.id} 
 className={`flex flex-col p-6 border rounded-xl cursor-pointer transition-all ${
 formData.budget === budget.id 
 ? 'border-blue-500 bg-blue-50' 
 : 'border-gray-200 hover:border-blue-300'
 }`}
>
 <input
 type="radio"
 name="budget"
 value={budget.id}
 checked={formData.budget === budget.id}
 onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
 className="sr-only"
 />
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center gap-2">
 <DollarSign className="w-5 h-5 text-green-600" />
 <span className="font-bold text-foreground">{budget.range}</span>
 </div>
 {formData.budget === budget.id && (
 <CheckCircle className="w-5 h-5 text-blue-500" />
 )}
 </div>
 <p className="text-sm text-muted-foreground mb-2">{budget.description}</p>
 <p className="text-xs text-blue-600 font-medium">{budget.recommended}</p>
 </label>
 ))}
 </div>
 </div>
 </div>
 )}

 {/* Step 3: Final Touches */}
 {currentStep === 3 && (
 <div className="space-y-6">
 <div className="text-center mb-8">
 <h2 className="text-2xl font-bold text-foreground mb-2">Almost done!</h2>
 <p className="text-muted-foreground">Add your logo and contact info (optional but recommended)</p>
 </div>

 <div className="max-w-md mx-auto space-y-6">
 {/* Logo Upload */}
 <div>
 <Label className="text-base font-semibold mb-3 block">Business Logo</Label>
 <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
 {formData.logo ? (
 <div className="space-y-3">
 <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
 <p className="font-medium">Logo uploaded</p>
 <button
 onClick={() => setFormData(prev => ({ ...prev, logo: null }))}
 className="text-sm text-blue-600 hover:text-blue-700"
>
 Change Logo
 </button>
 </div>
 ) : (
 <div className="space-y-3">
 <Upload className="w-8 h-8 text-gray-400 mx-auto" />
 <p className="font-medium">Upload your logo</p>
 <p className="text-sm text-muted-foreground">Square images work best</p>
 <input
 type="file"
 accept="image/*"
 onChange={handleFileUpload}
 className="hidden"
 id="logo-upload"
 />
 <label
 htmlFor="logo-upload"
 className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
>
 {isUploading ? (
 <>
 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
 Uploading...
 </>
 ) : (
 'Choose File'
 )}
 </label>
 </div>
 )}
 </div>
 </div>

 {/* Contact Info */}
 <div className="grid grid-cols-1 gap-4">
 <div>
 <Label htmlFor="phone" className="text-sm font-medium mb-2 block">Phone Number</Label>
 <Input
 id="phone"
 value={formData.phone}
 onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
 placeholder="(555) 123-4567"
 className="rounded-lg"
 />
 </div>
 <div>
 <Label htmlFor="website" className="text-sm font-medium mb-2 block">Website</Label>
 <Input
 id="website"
 value={formData.website}
 onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
 placeholder="yourwebsite.com"
 className="rounded-lg"
 />
 </div>
 </div>

 {/* Summary */}
 <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
 <h4 className="font-semibold text-blue-900 mb-2">Profile Summary</h4>
 <div className="space-y-1 text-sm text-blue-800">
 <p><strong>Business:</strong> {formData.businessName}</p>
 <p><strong>Type:</strong> {businessTypes.find(t => t.id === formData.businessType)?.label}</p>
 <p><strong>Budget:</strong> {budgetRanges.find(b => b.id === formData.budget)?.range}</p>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Navigation */}
 <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
 <Button 
 variant="outline" 
 onClick={() => setCurrentStep(prev => prev - 1)}
 disabled={currentStep === 1}
 className="px-8"
>
 Back
 </Button>
 
 {currentStep < 3 ? (
 <Button 
 onClick={handleNext}
 disabled={!canProceedToNext()}
 className="px-8 bg-blue-500 hover:bg-blue-600"
>
 Continue
 <ArrowRight className="w-4 h-4 ml-2" />
 </Button>
 ) : (
 <Button 
 onClick={handleFinish}
 className="px-8 bg-green-500 hover:bg-green-600"
>
 Start Browsing Spaces
 <Target className="w-4 h-4 ml-2" />
 </Button>
 )}
 </div>
 </CardContent>
 </Card>
 </motion.div>

 {/* Benefits */}
 <motion.div variants={itemVariants}>
 <Card className="border border-border/50 backdrop-blur-lg bg-background/95">
 <CardContent className="p-6">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
 <div>
 <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
 <Zap className="w-6 h-6 text-blue-600" />
 </div>
 <h3 className="font-semibold text-foreground mb-2">Instant Recommendations</h3>
 <p className="text-sm text-muted-foreground">Get spaces tailored to your business type and budget</p>
 </div>
 <div>
 <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
 <TrendingUp className="w-6 h-6 text-green-600" />
 </div>
 <h3 className="font-semibold text-foreground mb-2">Data-Driven Insights</h3>
 <p className="text-sm text-muted-foreground">See foot traffic, demographics, and ROI estimates</p>
 </div>
 <div>
 <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
 <Users className="w-6 h-6 text-purple-600" />
 </div>
 <h3 className="font-semibold text-foreground mb-2">Verified Listings</h3>
 <p className="text-sm text-muted-foreground">All spaces verified for quality and legitimacy</p>
 </div>
 </div>
 </CardContent>
 </Card>
 </motion.div>
 </motion.div>
 </div>
 );
}