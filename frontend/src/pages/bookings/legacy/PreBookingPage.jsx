// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { 
// Calendar, Upload, CheckCircle, AlertCircle, MapPin, 
// Building2, Zap, Clock, DollarSign, Users, TrendingUp,
// ArrowLeft, Phone, Mail, CreditCard, Shield
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// const mockSpace = {
// id: 'space-1',
// name: 'Downtown Digital Display',
// type: 'Digital Display',
// property: 'Metro Business Center',
// address: '123 Main St, Downtown',
// dailyRate: 450,
// features: ['4K Resolution', 'Prime Location', 'High Traffic'],
// image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
// footTraffic: '25,000/day',
// demographics: 'Professionals (60%), Shoppers (40%)',
// peakHours: '7-9 AM, 5-7 PM'
// };

// const quickDurations = [
// { days: 1, label: 'Today Only', price: 450, popular: false },
// { days: 7, label: '1 Week', price: 2800, popular: true },
// { days: 14, label: '2 Weeks', price: 5250, popular: false },
// { days: 30, label: '1 Month', price: 10800, popular: false }
// ];

// const businessVerificationBenefits = [
// 'Priority approval (24 hours)',
// 'Better rates for verified businesses',
// 'Direct contact with space owners',
// 'Campaign performance analytics'
// ];

// export default function SimplifiedBookingFlow() {
// const [step, setStep] = useState(1); // 1: Quick Setup, 2: Creative Upload, 3: Payment, 4: Confirmation
// const [selectedDuration, setSelectedDuration] = useState(quickDurations[1]); // Default to 1 week
// const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
// const [businessInfo, setBusinessInfo] = useState({
// name: '',
// type: '',
// phone: '',
// email: '',
// isVerified: false
// });
// const [uploadedCreative, setUploadedCreative] = useState(null);
// const [isUploading, setIsUploading] = useState(false);
// const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);

// const totalCost = selectedDuration.price;
// const endDate = new Date(new Date(startDate).getTime() + selectedDuration.days * 24 * 60 * 60 * 1000);

// const handleFileUpload = (event) => {
// const file = event.target.files[0];
// if (file) {
// setIsUploading(true);
// setTimeout(() => {
// setUploadedCreative({ 
// name: file.name, 
// url: URL.createObjectURL(file),
// size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
// });
// setIsUploading(false);
// }, 2000);
// }
// };

// const canProceedFromStep = (currentStep) => {
// switch(currentStep) {
// case 1:
// return businessInfo.name && businessInfo.type && businessInfo.phone && businessInfo.email;
// case 2:
// return uploadedCreative;
// case 3:
// return true; // Payment step
// default:
// return false;
// }
// };

// const handleNext = () => {
// if (canProceedFromStep(step)) {
// setStep(prev => prev + 1);
// }
// };

// const handleBooking = () => {
// alert('🎉 Booking submitted! You\'ll hear back within 24 hours.');
// };

// return (
// <div className="min-h-screen bg-background p-4 md:p-8">
// <div className="max-w-6xl mx-auto">
 
// {/* Header */}
// <motion.div 
// initial={{ opacity: 0, y: -20 }}
// animate={{ opacity: 1, y: 0 }}
// className="flex items-center gap-4 mb-8"
//>
// <Button variant="ghost" className="p-2">
// <ArrowLeft className="w-5 h-5" />
// </Button>
// <div>
// <h1 className="text-3xl font-bold text-foreground">Quick Booking</h1>
// <p className="text-muted-foreground">Get your ad live in 24 hours</p>
// </div>
// </motion.div>

// <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 
// {/* Main Content */}
// <div className="lg:col-span-2 space-y-6">
 
// {/* Space Summary */}
// <motion.div
// initial={{ opacity: 0, y: 20 }}
// animate={{ opacity: 1, y: 0 }}
//>
// <Card className="border border-border/50 backdrop-blur-lg bg-background/95">
// <CardContent className="p-6">
// <div className="flex gap-4">
// <img 
// src={mockSpace.image} 
// alt={mockSpace.name}
// className="w-24 h-24 rounded-lg object-cover"
// />
// <div className="flex-1">
// <div className="flex items-start justify-between mb-2">
// <div>
// <h3 className="text-lg font-bold text-foreground">{mockSpace.name}</h3>
// <p className="text-muted-foreground flex items-center gap-1 text-sm">
// <Building2 className="w-4 h-4" />
// {mockSpace.property}
// </p>
// <p className="text-muted-foreground flex items-center gap-1 text-sm">
// <MapPin className="w-4 h-4" />
// {mockSpace.address}
// </p>
// </div>
// <Badge variant="secondary" className="bg-blue-100 text-blue-800">
// <Zap className="w-3 h-3 mr-1" />
// {mockSpace.type}
// </Badge>
// </div>
 
// <div className="grid grid-cols-3 gap-4 text-sm">
// <div>
// <span className="text-muted-foreground block">Daily Traffic</span>
// <span className="font-semibold text-green-600">{mockSpace.footTraffic}</span>
// </div>
// <div>
// <span className="text-muted-foreground block">Peak Hours</span>
// <span className="font-semibold">{mockSpace.peakHours}</span>
// </div>
// <div>
// <span className="text-muted-foreground block">Daily Rate</span>
// <span className="font-semibold text-foreground">${mockSpace.dailyRate}</span>
// </div>
// </div>
// </div>
// </div>
// </CardContent>
// </Card>
// </motion.div>

// {/* Step Content */}
// <AnimatePresence mode="wait">
// <motion.div
// key={step}
// initial={{ opacity: 0, x: 20 }}
// animate={{ opacity: 1, x: 0 }}
// exit={{ opacity: 0, x: -20 }}
// transition={{ duration: 0.3 }}
//>
// <Card className="border border-border/50 backdrop-blur-lg bg-background/95">
// <CardHeader>
// <CardTitle className="flex items-center gap-2">
// {step === 1 && (
// <>
// <Users className="w-5 h-5 text-blue-500" />
// Business Details
// </>
// )}
// {step === 2 && (
// <>
// <Upload className="w-5 h-5 text-purple-500" />
// Upload Your Creative
// </>
// )}
// {step === 3 && (
// <>
// <CreditCard className="w-5 h-5 text-green-500" />
// Payment & Confirmation
// </>
// )}
// </CardTitle>
// </CardHeader>
// <CardContent className="p-6 pt-0">
 
// {/* Step 1: Business Details */}
// {step === 1 && (
// <div className="space-y-6">
// <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// <div>
// <Label htmlFor="businessName" className="text-sm font-medium mb-2 block">Business Name *</Label>
// <Input
// id="businessName"
// value={businessInfo.name}
// onChange={(e) => setBusinessInfo(prev => ({ ...prev, name: e.target.value }))}
// placeholder="Your Business Name"
// className="rounded-lg"
// />
// </div>
// <div>
// <Label htmlFor="businessType" className="text-sm font-medium mb-2 block">Business Type *</Label>
// <select
// id="businessType"
// value={businessInfo.type}
// onChange={(e) => setBusinessInfo(prev => ({ ...prev, type: e.target.value }))}
// className="w-full p-3 border border-input rounded-lg bg-background"
//>
// <option value="">Select type...</option>
// <option value="restaurant">Restaurant/Food</option>
// <option value="retail">Retail Store</option>
// <option value="service">Professional Service</option>
// <option value="healthcare">Healthcare</option>
// <option value="automotive">Automotive</option>
// <option value="other">Other</option>
// </select>
// </div>
// <div>
// <Label htmlFor="phone" className="text-sm font-medium mb-2 block">Phone Number *</Label>
// <Input
// id="phone"
// value={businessInfo.phone}
// onChange={(e) => setBusinessInfo(prev => ({ ...prev, phone: e.target.value }))}
// placeholder="(555) 123-4567"
// className="rounded-lg"
// />
// </div>
// <div>
// <Label htmlFor="email" className="text-sm font-medium mb-2 block">Email Address *</Label>
// <Input
// id="email"
// type="email"
// value={businessInfo.email}
// onChange={(e) => setBusinessInfo(prev => ({ ...prev, email: e.target.value }))}
// placeholder="your@email.com"
// className="rounded-lg"
// />
// </div>
// </div>

// {/* Business Verification Prompt */}
// {!businessInfo.isVerified && businessInfo.name && (
// <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
// <div className="flex items-start gap-3">
// <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
// <div className="flex-1">
// <h4 className="font-semibold text-blue-900 mb-2">Get Verified for Better Rates</h4>
// <ul className="text-sm text-blue-800 space-y-1 mb-3">
// {businessVerificationBenefits.map((benefit, index) => (
// <li key={index} className="flex items-center gap-2">
// <CheckCircle className="w-3 h-3 text-blue-600" />
// {benefit}
// </li>
// ))}
// </ul>
// <div className="flex gap-2">
// <Button 
// size={20} 
// className="bg-blue-600 hover:bg-blue-700"
// onClick={() => setShowVerificationPrompt(true)}
//>
// Verify Business (2 min)
// </Button>
// <Button variant="outline" size={20}>
// Skip for now
// </Button>
// </div>
// </div>
// </div>
// </div>
// )}
// </div>
// )}

// {/* Step 2: Creative Upload */}
// {step === 2 && (
// <div className="space-y-6">
// <div className="text-center mb-6">
// <h3 className="text-lg font-semibold text-foreground mb-2">Upload Your Creative</h3>
// <p className="text-muted-foreground">For this space, we recommend a square or horizontal image</p>
// </div>

// {/* Upload Area */}
// <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
// {uploadedCreative ? (
// <div className="space-y-4">
// <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
// <div>
// <p className="font-medium text-foreground">Creative uploaded successfully</p>
// <p className="text-sm text-muted-foreground">{uploadedCreative.name} ({uploadedCreative.size})</p>
// </div>
// <div className="flex justify-center gap-2">
// <Button
// variant="outline"
// size={20}
// onClick={() => setUploadedCreative(null)}
//>
// Change File
// </Button>
// <Button
// variant="outline"
// size={20}
// onClick={() => window.open(uploadedCreative.url, '_blank')}
//>
// Preview
// </Button>
// </div>
// </div>
// ) : (
// <div className="space-y-4">
// <Upload className="w-8 h-8 text-gray-400 mx-auto" />
// <div>
// <p className="font-medium">Drop your image here or click to browse</p>
// <p className="text-sm text-muted-foreground">
// JPG, PNG, or MP4 • Max 50MB • Recommended: 1920×1080
// </p>
// </div>
// <input
// type="file"
// accept="image/*,video/*"
// onChange={handleFileUpload}
// className="hidden"
// id="creative-upload"
// />
// <label
// htmlFor="creative-upload"
// className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors"
//>
// {isUploading ? (
// <>
// <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
// Uploading...
// </>
// ) : (
// 'Choose File'
// )}
// </label>
// </div>
// )}
// </div>

// {/* Quick Requirements */}
// <div className="grid grid-cols-3 gap-4 text-center">
// <div className="p-3 bg-green-50 rounded-lg border border-green-200">
// <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
// <p className="text-xs font-medium text-green-800">High Quality</p>
// </div>
// <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
// <Zap className="w-5 h-5 text-blue-600 mx-auto mb-1" />
// <p className="text-xs font-medium text-blue-800">Eye-Catching</p>
// </div>
// <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
// <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
// <p className="text-xs font-medium text-purple-800">Brand Clear</p>
// </div>
// </div>
// </div>
// )}

// {/* Step 3: Payment */}
// {step === 3 && (
// <div className="space-y-6">
// <div className="text-center mb-6">
// <h3 className="text-lg font-semibold text-foreground mb-2">Review & Confirm</h3>
// <p className="text-muted-foreground">Your booking will be submitted for approval</p>
// </div>

// {/* Booking Summary */}
// <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
// <h4 className="font-semibold text-foreground mb-3">Booking Summary</h4>
// <div className="grid grid-cols-2 gap-3 text-sm">
// <div>
// <span className="text-muted-foreground block">Business:</span>
// <span className="font-medium">{businessInfo.name}</span>
// </div>
// <div>
// <span className="text-muted-foreground block">Duration:</span>
// <span className="font-medium">{selectedDuration.label}</span>
// </div>
// <div>
// <span className="text-muted-foreground block">Start Date:</span>
// <span className="font-medium">{new Date(startDate).toLocaleDateString()}</span>
// </div>
// <div>
// <span className="text-muted-foreground block">End Date:</span>
// <span className="font-medium">{endDate.toLocaleDateString()}</span>
// </div>
// </div>
// </div>

// {/* Payment Info */}
// <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
// <div className="flex items-center gap-2 mb-2">
// <Shield className="w-4 h-4 text-blue-600" />
// <span className="font-semibold text-blue-900">Secure Payment</span>
// </div>
// <p className="text-sm text-blue-800">
// You'll only be charged after the space owner approves your booking (usually within 24 hours).
// </p>
// </div>

// {/* Terms */}
// <div className="text-xs text-muted-foreground space-y-1">
// <p>• Cancellation allowed up to 24 hours before start date</p>
// <p>• Full refund if space owner rejects booking</p>
// <p>• Creative content must comply with local advertising regulations</p>
// </div>
// </div>
// )}

// {/* Navigation */}
// <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
// <Button 
// variant="outline" 
// onClick={() => setStep(prev => prev - 1)}
// disabled={step === 1}
// className="px-6"
//>
// Back
// </Button>
 
// {step < 3 ? (
// <Button 
// onClick={handleNext}
// disabled={!canProceedFromStep(step)}
// className="px-6 bg-blue-500 hover:bg-blue-600"
//>
// Continue
// </Button>
// ) : (
// <Button 
// onClick={handleBooking}
// className="px-6 bg-green-500 hover:bg-green-600"
//>
// Submit Booking
// </Button>
// )}
// </div>
// </CardContent>
// </Card>
// </motion.div>
// </AnimatePresence>
// </div>

// {/* Booking Summary Sidebar */}
// <div className="lg:col-span-1">
// <div className="sticky top-8 space-y-6">
 
// {/* Duration Selection */}
// <Card className="border border-border/50 backdrop-blur-lg bg-background/95">
// <CardHeader>
// <CardTitle className="text-lg">Duration & Pricing</CardTitle>
// </CardHeader>
// <CardContent className="space-y-4">
// <div>
// <Label className="text-sm font-medium mb-3 block">Campaign Duration</Label>
// <div className="space-y-2">
// {quickDurations.map(duration => (
// <label 
// key={duration.days}
// className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
// selectedDuration.days === duration.days 
// ? 'border-blue-500 bg-blue-50' 
// : 'border-gray-200 hover:border-blue-300'
// }`}
//>
// <input
// type="radio"
// name="duration"
// value={duration.days}
// checked={selectedDuration.days === duration.days}
// onChange={() => setSelectedDuration(duration)}
// className="sr-only"
// />
// <div className="flex items-center gap-2">
// <span className="font-medium">{duration.label}</span>
// {duration.popular && (
// <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
// Popular
// </Badge>
// )}
// </div>
// <span className="font-semibold text-green-600">${duration.price.toLocaleString()}</span>
// </label>
// ))}
// </div>
// </div>

// <div>
// <Label htmlFor="startDate" className="text-sm font-medium mb-2 block">Start Date</Label>
// <Input
// id="startDate"
// type="date"
// value={startDate}
// onChange={(e) => setStartDate(e.target.value)}
// min={new Date().toISOString().split('T')[0]}
// className="rounded-lg"
// />
// </div>

// <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
// <div className="flex justify-between items-center mb-2">
// <span className="font-semibold">Total Cost:</span>
// <span className="text-lg font-bold text-green-600">${totalCost.toLocaleString()}</span>
// </div>
// <p className="text-xs text-muted-foreground">
// ${(totalCost / selectedDuration.days).toFixed(0)} per day
// </p>
// </div>
// </CardContent>
// </Card>

// {/* Space Insights */}
// <Card className="border border-border/50 backdrop-blur-lg bg-background/95">
// <CardHeader>
// <CardTitle className="text-lg">Location Insights</CardTitle>
// </CardHeader>
// <CardContent className="space-y-4">
// <div className="grid grid-cols-1 gap-3">
// <div className="flex items-center gap-3">
// <Users className="w-4 h-4 text-blue-500" />
// <div>
// <p className="text-sm font-medium">Daily Traffic</p>
// <p className="text-xs text-muted-foreground">{mockSpace.footTraffic}</p>
// </div>
// </div>
// <div className="flex items-center gap-3">
// <Clock className="w-4 h-4 text-purple-500" />
// <div>
// <p className="text-sm font-medium">Peak Hours</p>
// <p className="text-xs text-muted-foreground">{mockSpace.peakHours}</p>
// </div>
// </div>
// <div className="flex items-center gap-3">
// <TrendingUp className="w-4 h-4 text-green-500" />
// <div>
// <p className="text-sm font-medium">Demographics</p>
// <p className="text-xs text-muted-foreground">{mockSpace.demographics}</p>
// </div>
// </div>
// </div>
// </CardContent>
// </Card>

// {/* Quick Support */}
// <Card className="border border-border/50 backdrop-blur-lg bg-background/95">
// <CardContent className="p-4">
// <h4 className="font-semibold text-foreground mb-3">Need Help?</h4>
// <div className="space-y-2">
// <Button variant="outline" size={20} className="w-full justify-start">
// <Phone className="w-4 h-4 mr-2" />
// Call (555) 123-4567
// </Button>
// <Button variant="outline" size={20} className="w-full justify-start">
// <Mail className="w-4 h-4 mr-2" />
// Email Support
// </Button>
// </div>
// </CardContent>
// </Card>
// </div>
// </div>
// </div>
// </div>
// </div>
// );
// }