import React, { useState, useEffect } from 'react';
import { Campaign } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Save, ArrowRight, ArrowLeft, Users, Target, Lightbulb, Rocket, BarChart3, Image as ImageIcon, Upload, File, X, Loader2, Palette, MapPin, Clock, TrendingUp, Eye, MessageSquare, DollarSign, CheckCircle, AlertTriangle, Sparkles, Zap } from 'lucide-react';
import { format, addDays, isAfter } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { UploadFile } from '@/api/integrations';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { useVerification } from '@/components/verification/VerificationProvider';

// Enhanced content types with compliance info
const contentTypeOptions = [
 { value: 'automotive', label: 'Automotive', compliance: [] },
 { value: 'beauty_wellness', label: 'Beauty & Wellness', compliance: [] },
 { value: 'clothing_fashion', label: 'Clothing & Fashion', compliance: [] },
 { value: 'education', label: 'Education & Training', compliance: [] },
 { value: 'entertainment', label: 'Entertainment & Events', compliance: [] },
 { value: 'financial', label: 'Financial Services', compliance: ['disclaimer_required'] },
 { value: 'food_beverage', label: 'Food & Beverage', compliance: [] },
 { value: 'healthcare', label: 'Healthcare & Medical', compliance: ['medical_disclaimers'] },
 { value: 'home_garden', label: 'Home & Garden', compliance: [] },
 { value: 'nonprofit', label: 'Non-profit & Charity', compliance: [] },
 { value: 'real_estate', label: 'Real Estate', compliance: [] },
 { value: 'retail', label: 'Retail & E-commerce', compliance: [] },
 { value: 'technology', label: 'Technology & Software', compliance: [] },
 { value: 'travel_hospitality', label: 'Travel & Hospitality', compliance: [] },
 { value: 'alcohol', label: 'Alcohol & Beverages', compliance: ['age_restriction', 'location_limits'] },
 { value: 'tobacco', label: 'Tobacco & Smoking', compliance: ['age_restriction', 'health_warnings'] },
 { value: 'gambling', label: 'Gambling & Betting', compliance: ['age_restriction', 'location_limits'] },
 { value: 'pharmaceutical', label: 'Pharmaceutical Products', compliance: ['fda_approval', 'medical_disclaimers'] },
 { value: 'political', label: 'Political Campaigns', compliance: ['disclosure_required', 'election_rules'] },
 { value: 'other', label: 'Other', compliance: [] }
];

// Campaign objectives
const campaignObjectives = [
 { value: 'brand_awareness', label: 'Brand Awareness', icon: Eye, description: 'Increase brand recognition and visibility' },
 { value: 'lead_generation', label: 'Lead Generation', icon: Users, description: 'Generate qualified leads and inquiries' },
 { value: 'sales', label: 'Drive Sales', icon: DollarSign, description: 'Increase direct sales and conversions' },
 { value: 'foot_traffic', label: 'Foot Traffic', icon: MapPin, description: 'Drive visits to physical locations' },
 { value: 'engagement', label: 'Engagement', icon: MessageSquare, description: 'Boost social media and online engagement' },
 { value: 'event_promotion', label: 'Event Promotion', icon: CalendarIcon, description: 'Promote events and drive attendance' }
];

// Placement environment types
const environmentTypes = [
 { value: 'urban_outdoor', label: 'Urban Outdoor', description: 'Busy city streets, downtown areas' },
 { value: 'highway_roadside', label: 'Highway & Roadside', description: 'Major highways and arterial roads' },
 { value: 'transit_stations', label: 'Transit Stations', description: 'Bus stops, train stations, airports' },
 { value: 'retail_indoor', label: 'Retail Indoor', description: 'Shopping malls, stores, supermarkets' },
 { value: 'office_buildings', label: 'Office Buildings', description: 'Corporate buildings, elevators, lobbies' },
 { value: 'entertainment', label: 'Entertainment Venues', description: 'Theaters, stadiums, concert halls' },
 { value: 'hospitality', label: 'Hospitality', description: 'Hotels, restaurants, bars' },
 { value: 'healthcare', label: 'Healthcare Facilities', description: 'Hospitals, clinics, waiting rooms' },
 { value: 'education', label: 'Educational', description: 'Universities, schools, libraries' },
 { value: 'gas_stations', label: 'Gas Stations', description: 'Fuel stations and convenience stores' }
];

// Technical format options
const technicalFormats = [
 { value: 'static_image', label: 'Static Images', description: 'Traditional still images' },
 { value: 'animated_gif', label: 'Animated GIFs', description: 'Simple animations and motion' },
 { value: 'video', label: 'Video Content', description: 'Full motion video (future support)' },
 { value: 'interactive', label: 'Interactive', description: 'Touch-enabled interactions (future)' }
];

// Step 1: Campaign Strategy & Goals
const CampaignStrategyStep = ({ formData, setFormData, errors, setErrors }) => {
 const handleInputChange = (field, value) => {
 setFormData(prev => ({ ...prev, [field]: value }));
 if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
 };

 const handleDemographicsChange = (field, value) => {
 setFormData(prev => ({
 ...prev,
 target_demographics: {
 ...prev.target_demographics,
 [field]: value
 }
 }));
 };

 return (
 <div className="space-y-8">
 <div className="text-center mb-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
 <Target className="w-8 h-8 text-white" />
 </div>
 <h2 className="text-3xl font-bold text-foreground mb-3">Campaign Strategy</h2>
 <p className="text-muted-foreground text-lg">Define your campaign goals and target audience</p>
 </div>

 <div className="space-y-6">
 {/* Basic Info */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <Label htmlFor="name" className="text-base font-semibold text-muted-foreground mb-2 block">Campaign Name *</Label>
 <Input
 id="name"
 value={formData.name}
 onChange={(e) => handleInputChange('name', e.target.value)}
 placeholder="Summer Product Launch 2024"
 className={`bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm focus-brand transition-brand ${errors.name ? 'border-red-500' : ''}`}
 />
 {errors.name && <p className="text-red-500 text-sm mt-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{errors.name}</p>}
 </div>

 <div>
 <Label htmlFor="brand_name" className="text-base font-semibold text-muted-foreground mb-2 block">Brand Name *</Label>
 <Input
 id="brand_name"
 value={formData.brand_name}
 onChange={(e) => handleInputChange('brand_name', e.target.value)}
 placeholder="Your Brand Inc."
 className={`bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm focus-brand transition-brand ${errors.brand_name ? 'border-red-500' : ''}`}
 />
 {errors.brand_name && <p className="text-red-500 text-sm mt-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{errors.brand_name}</p>}
 </div>
 </div>

 {/* Campaign Objective */}
 <div>
 <Label className="text-base font-semibold text-muted-foreground mb-3 block">Primary Campaign Objective *</Label>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
 {campaignObjectives.map((objective) => {
 const IconComponent = objective.icon;
 return (
 <label key={objective.value} className={`flex items-start space-x-3 cursor-pointer p-4 rounded-2xl border transition-brand hover:bg-[hsl(var(--muted))] ${
 formData.primary_objective === objective.value 
 ? 'border-[hsl(var(--primary))] bg-[hsl(var(--accent-light))]' 
 : 'border-[hsl(var(--border))]'
 }`}>
 <input
 type="radio"
 name="primary_objective"
 value={objective.value}
 checked={formData.primary_objective === objective.value}
 onChange={(e) => handleInputChange('primary_objective', e.target.value)}
 className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))] mt-1"
 />
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <IconComponent className="w-4 h-4 text-[hsl(var(--primary))]" />
 <span className="font-medium text-sm">{objective.label}</span>
 </div>
 <p className="text-xs text-muted-foreground">{objective.description}</p>
 </div>
 </label>
 );
 })}
 </div>
 {errors.primary_objective && <p className="text-red-500 text-sm mt-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{errors.primary_objective}</p>}
 </div>

 {/* Target Demographics */}
 <div>
 <Label className="text-base font-semibold text-muted-foreground mb-3 block">Target Audience Demographics</Label>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <Label className="text-sm font-medium text-muted-foreground mb-2 block">Age Range</Label>
 <Select
 value={formData.target_demographics?.age_range || ''}
 onValueChange={(value) => handleDemographicsChange('age_range', value)}
>
 <SelectTrigger className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-xl">
 <SelectValue placeholder="Select age range..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="18-24">18-24 years</SelectItem>
 <SelectItem value="25-34">25-34 years</SelectItem>
 <SelectItem value="35-44">35-44 years</SelectItem>
 <SelectItem value="45-54">45-54 years</SelectItem>
 <SelectItem value="55-64">55-64 years</SelectItem>
 <SelectItem value="65+">65+ years</SelectItem>
 <SelectItem value="all">All ages</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div>
 <Label className="text-sm font-medium text-muted-foreground mb-2 block">Income Level</Label>
 <Select
 value={formData.target_demographics?.income_level || ''}
 onValueChange={(value) => handleDemographicsChange('income_level', value)}
>
 <SelectTrigger className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-xl">
 <SelectValue placeholder="Select income level..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="under-25k">Under $25k</SelectItem>
 <SelectItem value="25k-50k">$25k - $50k</SelectItem>
 <SelectItem value="50k-75k">$50k - $75k</SelectItem>
 <SelectItem value="75k-100k">$75k - $100k</SelectItem>
 <SelectItem value="100k-150k">$100k - $150k</SelectItem>
 <SelectItem value="150k+">$150k+</SelectItem>
 <SelectItem value="all">All income levels</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div>
 <Label className="text-sm font-medium text-muted-foreground mb-2 block">Primary Interest</Label>
 <Select
 value={formData.target_demographics?.primary_interest || ''}
 onValueChange={(value) => handleDemographicsChange('primary_interest', value)}
>
 <SelectTrigger className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-xl">
 <SelectValue placeholder="Select interest..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="shopping">Shopping & Retail</SelectItem>
 <SelectItem value="dining">Dining & Food</SelectItem>
 <SelectItem value="entertainment">Entertainment</SelectItem>
 <SelectItem value="fitness">Health & Fitness</SelectItem>
 <SelectItem value="travel">Travel & Tourism</SelectItem>
 <SelectItem value="technology">Technology</SelectItem>
 <SelectItem value="automotive">Automotive</SelectItem>
 <SelectItem value="finance">Finance & Business</SelectItem>
 <SelectItem value="general">General Consumer</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 </div>

 {/* Campaign Dates and Budget */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div>
 <Label className="text-base font-semibold text-muted-foreground mb-2 block">Start Date *</Label>
 <Popover>
 <PopoverTrigger asChild>
 <Button
 variant="outline"
 className={`w-full justify-start text-left font-normal bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 backdrop-blur-sm hover:bg-[hsl(var(--muted))] ${errors.start_date ? 'border-red-500' : ''}`}
>
 <CalendarIcon className="mr-3 h-5 w-5 text-[hsl(var(--primary))]" />
 {formData.start_date ? format(formData.start_date, 'PPP') : 'Select start date'}
 </Button>
 </PopoverTrigger>
 <PopoverContent className="w-auto p-0 glass-strong border-[hsl(var(--border))] rounded-2xl">
 <Calendar
 mode="single"
 selected={formData.start_date}
 onSelect={(date) => handleInputChange('start_date', date)}
 disabled={(date) => date < new Date()}
 />
 </PopoverContent>
 </Popover>
 {errors.start_date && <p className="text-red-500 text-sm mt-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{errors.start_date}</p>}
 </div>

 <div>
 <Label className="text-base font-semibold text-muted-foreground mb-2 block">End Date *</Label>
 <Popover>
 <PopoverTrigger asChild>
 <Button
 variant="outline"
 className={`w-full justify-start text-left font-normal bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 backdrop-blur-sm hover:bg-[hsl(var(--muted))] ${errors.end_date ? 'border-red-500' : ''}`}
>
 <CalendarIcon className="mr-3 h-5 w-5 text-[hsl(var(--primary))]" />
 {formData.end_date ? format(formData.end_date, 'PPP') : 'Select end date'}
 </Button>
 </PopoverTrigger>
 <PopoverContent className="w-auto p-0 glass-strong border-[hsl(var(--border))] rounded-2xl">
 <Calendar
 mode="single"
 selected={formData.end_date}
 onSelect={(date) => handleInputChange('end_date', date)}
 disabled={(date) => date < (formData.start_date || new Date())}
 />
 </PopoverContent>
 </Popover>
 {errors.end_date && <p className="text-red-500 text-sm mt-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{errors.end_date}</p>}
 </div>

 <div>
 <Label className="text-base font-semibold text-muted-foreground mb-2 block">Total Budget</Label>
 <div className="relative">
 <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
 <Input
 type="number"
 value={formData.total_budget}
 onChange={(e) => handleInputChange('total_budget', e.target.value)}
 placeholder="50000"
 className="pl-12 bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm focus-brand transition-brand"
 />
 </div>
 <p className="text-sm text-muted-foreground mt-2">Optional: Set your overall campaign budget</p>
 </div>
 </div>
 </div>
 </div>
 );
};

// Step 2: Creative Content & Brand
const CreativeContentStep = ({ formData, setFormData, errors, setErrors }) => {
 const [isUploading, setIsUploading] = useState(false);

 const handleInputChange = (field, value) => {
 setFormData(prev => ({ ...prev, [field]: value }));
 if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
 };

 const handleContentTypeChange = (value) => {
 setFormData(prev => ({
 ...prev,
 content_type: prev.content_type.includes(value)
 ? prev.content_type.filter(type => type !== value)
 : [...prev.content_type, value]
 }));
 if (errors.content_type) setErrors(prev => ({ ...prev, content_type: null }));
 };

 const handleBrandGuidelinesChange = (field, value) => {
 setFormData(prev => ({
 ...prev,
 brand_guidelines: {
 ...prev.brand_guidelines,
 [field]: value
 }
 }));
 };

 const handleFileChange = async (event) => {
 const file = event.target.files[0];
 if (!file) return;

 setIsUploading(true);
 try {
 const { file_url } = await UploadFile({ file });
 setFormData(prev => ({
 ...prev,
 media_files: [...(prev.media_files || []), {
 url: file_url,
 name: file.name,
 type: file.type,
 size: file.size
 }]
 }));
 } catch (error) {
 console.error("Error uploading file:", error);
 alert("File upload failed. Please try again.");
 }
 setIsUploading(false);
 };

 const handleRemoveFile = (index) => {
 setFormData(prev => ({
 ...prev,
 media_files: prev.media_files.filter((_, i) => i !== index)
 }));
 };

 const getComplianceInfo = () => {
 const selectedTypes = formData.content_type;
 const allCompliance = selectedTypes.reduce((acc, type) => {
 const option = contentTypeOptions.find(opt => opt.value === type);
 return [...acc, ...(option?.compliance || [])];
 }, []);
 return [...new Set(allCompliance)];
 };

 const complianceRequirements = getComplianceInfo();

 return (
 <div className="space-y-8">
 <div className="text-center mb-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
 <Palette className="w-8 h-8 text-white" />
 </div>
 <h2 className="text-3xl font-bold text-foreground mb-3">Creative Content</h2>
 <p className="text-muted-foreground text-lg">Define your creative assets and brand guidelines</p>
 </div>

 <div className="space-y-6">
 {/* Content Types */}
 <div>
 <Label className="text-base font-semibold text-muted-foreground mb-3 block">Content Category *</Label>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
 {contentTypeOptions.map((option) => (
 <label key={option.value} className="flex items-start space-x-3 cursor-pointer p-3 rounded-2xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-brand">
 <input
 type="checkbox"
 checked={formData.content_type.includes(option.value)}
 onChange={() => handleContentTypeChange(option.value)}
 className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))] mt-1"
 />
 <div className="flex-1">
 <span className="text-sm font-medium">{option.label}</span>
 {option.compliance.length> 0 && (
 <div className="flex flex-wrap gap-1 mt-1">
 {option.compliance.map(comp => (
 <span key={comp} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
 {comp.replace('_', ' ')}
 </span>
 ))}
 </div>
 )}
 </div>
 </label>
 ))}
 </div>
 {errors.content_type && <p className="text-red-500 text-sm mt-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{errors.content_type}</p>}
 
 {complianceRequirements.length> 0 && (
 <Alert className="mt-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
 <AlertTriangle className="h-4 w-4 text-yellow-600" />
 <AlertTitle className="text-yellow-800 dark:text-yellow-200">Compliance Requirements</AlertTitle>
 <AlertDescription className="text-yellow-700 dark:text-yellow-300">
 Your selected content types require: {complianceRequirements.join(', ')}
 </AlertDescription>
 </Alert>
 )}
 </div>

 {/* Creative Concept */}
 <div>
 <Label htmlFor="creative_concept" className="text-base font-semibold text-muted-foreground mb-2 block">Creative Concept & Message *</Label>
 <Textarea
 id="creative_concept"
 value={formData.creative_concept}
 onChange={(e) => handleInputChange('creative_concept', e.target.value)}
 placeholder="Describe your core message, creative story, and what you want to communicate to your audience..."
 rows={4}
 className={`bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm focus-brand transition-brand resize-none ${errors.creative_concept ? 'border-red-500' : ''}`}
 />
 {errors.creative_concept && <p className="text-red-500 text-sm mt-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{errors.creative_concept}</p>}
 </div>

 {/* Call to Action */}
 <div>
 <Label htmlFor="call_to_action" className="text-base font-semibold text-muted-foreground mb-2 block">Call to Action</Label>
 <Select
 value={formData.call_to_action || ''}
 onValueChange={(value) => handleInputChange('call_to_action', value)}
>
 <SelectTrigger className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm">
 <SelectValue placeholder="Select your call to action..." />
 </SelectTrigger>
 <SelectContent className="glass-strong border-[hsl(var(--border))] rounded-2xl">
 <SelectItem value="visit_store">Visit Store</SelectItem>
 <SelectItem value="call_now">Call Now</SelectItem>
 <SelectItem value="learn_more">Learn More</SelectItem>
 <SelectItem value="shop_now">Shop Now</SelectItem>
 <SelectItem value="download_app">Download App</SelectItem>
 <SelectItem value="sign_up">Sign Up</SelectItem>
 <SelectItem value="get_quote">Get Quote</SelectItem>
 <SelectItem value="book_now">Book Now</SelectItem>
 <SelectItem value="contact_us">Contact Us</SelectItem>
 <SelectItem value="custom">Custom CTA</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {/* Brand Guidelines */}
 <div>
 <Label className="text-base font-semibold text-muted-foreground mb-3 block">Brand Guidelines</Label>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <Label className="text-sm font-medium text-muted-foreground mb-2 block">Primary Brand Colors</Label>
 <Input
 value={formData.brand_guidelines?.primary_colors || ''}
 onChange={(e) => handleBrandGuidelinesChange('primary_colors', e.target.value)}
 placeholder="#1234AB, #FF5733, etc."
 className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-xl py-2 px-3 text-sm"
 />
 </div>
 <div>
 <Label className="text-sm font-medium text-muted-foreground mb-2 block">Brand Fonts</Label>
 <Input
 value={formData.brand_guidelines?.fonts || ''}
 onChange={(e) => handleBrandGuidelinesChange('fonts', e.target.value)}
 placeholder="Helvetica, Arial, Roboto, etc."
 className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-xl py-2 px-3 text-sm"
 />
 </div>
 </div>
 </div>

 {/* Media Upload */}
 <div>
 <Label className="text-base font-semibold text-muted-foreground mb-2 block">Upload Creative Assets</Label>
 <div className="relative border-2 border-dashed border-[hsl(var(--border))] rounded-2xl p-6 text-center hover:border-[hsl(var(--primary))] transition-brand">
 <Upload className="mx-auto h-12 w-12 text-[hsl(var(--primary))]" />
 <p className="mt-2 text-sm text-muted-foreground">
 Upload your logos, images, and creative assets
 </p>
 <p className="text-xs text-muted-foreground mt-1">
 Supported: JPG, PNG, GIF, PDF (Max 10MB each)
 </p>
 <Input
 type="file"
 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
 onChange={handleFileChange}
 disabled={isUploading}
 accept="image/*,application/pdf"
 />
 </div>
 {isUploading && (
 <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
 <Loader2 className="w-4 h-4 animate-spin" />
 Uploading...
 </div>
 )}
 {(formData.media_files?.length> 0) && (
 <div className="mt-4 space-y-2">
 <h4 className="font-semibold text-sm">Uploaded Assets:</h4>
 {formData.media_files.map((file, index) => (
 <div key={index} className="flex items-center justify-between p-2 bg-[hsl(var(--muted))] rounded-lg">
 <div className="flex items-center gap-2 text-sm truncate">
 <File className="w-4 h-4 flex-shrink-0" />
 <span className="truncate">{file.name || file.url.split('/').pop()}</span>
 <span className="text-xs text-muted-foreground">
 ({file.size ? Math.round(file.size / 1024) + 'KB' : 'Unknown size'})
 </span>
 </div>
 <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => handleRemoveFile(index)}>
 <X className="w-4 h-4 text-red-500" />
 </Button>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Additional Notes */}
 <div>
 <Label htmlFor="notes" className="text-base font-semibold text-muted-foreground mb-2 block">Additional Creative Notes</Label>
 <Textarea
 id="notes"
 value={formData.notes}
 onChange={(e) => handleInputChange('notes', e.target.value)}
 placeholder="Any specific requirements, creative preferences, or important notes for your campaign..."
 rows={3}
 className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm focus-brand transition-brand resize-none"
 />
 </div>
 </div>
 </div>
 );
};

// Step 3: Placement Preferences
const PlacementPreferencesStep = ({ formData, setFormData, errors, setErrors }) => {
 const handleInputChange = (field, value) => {
 setFormData(prev => ({ ...prev, [field]: value }));
 if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
 };

 const handleEnvironmentChange = (value) => {
 setFormData(prev => ({
 ...prev,
 placement_preferences: {
 ...prev.placement_preferences,
 environments: prev.placement_preferences?.environments?.includes(value)
 ? prev.placement_preferences.environments.filter(env => env !== value)
 : [...(prev.placement_preferences?.environments || []), value]
 }
 }));
 };

 const handleAudienceContextChange = (value) => {
 setFormData(prev => ({
 ...prev,
 placement_preferences: {
 ...prev.placement_preferences,
 audience_contexts: prev.placement_preferences?.audience_contexts?.includes(value)
 ? prev.placement_preferences.audience_contexts.filter(ctx => ctx !== value)
 : [...(prev.placement_preferences?.audience_contexts || []), value]
 }
 }));
 };

 const handleGeographicChange = (field, value) => {
 setFormData(prev => ({
 ...prev,
 geographic_targeting: {
 ...prev.geographic_targeting,
 [field]: value
 }
 }));
 };

 return (
 <div className="space-y-8">
 <div className="text-center mb-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/25">
 <MapPin className="w-8 h-8 text-white" />
 </div>
 <h2 className="text-3xl font-bold text-foreground mb-3">Placement Preferences</h2>
 <p className="text-muted-foreground text-lg">Choose where and how your ads should appear</p>
 </div>

 <div className="space-y-6">
 {/* Geographic Targeting */}
 <div>
 <Label className="text-base font-semibold text-muted-foreground mb-3 block">Geographic Targeting</Label>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <Label className="text-sm font-medium text-muted-foreground mb-2 block">Target Cities/Regions</Label>
 <Textarea
 value={formData.geographic_targeting?.cities || ''}
 onChange={(e) => handleGeographicChange('cities', e.target.value)}
 placeholder="New York, Los Angeles, Chicago, etc."
 rows={2}
 className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-xl py-2 px-3 text-sm resize-none"
 />
 </div>
 <div>
 <Label className="text-sm font-medium text-muted-foreground mb-2 block">Radius from Locations (miles)</Label>
 <Select
 value={formData.geographic_targeting?.radius || ''}
 onValueChange={(value) => handleGeographicChange('radius', value)}
>
 <SelectTrigger className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-xl">
 <SelectValue placeholder="Select radius..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="5">5 miles</SelectItem>
 <SelectItem value="10">10 miles</SelectItem>
 <SelectItem value="25">25 miles</SelectItem>
 <SelectItem value="50">50 miles</SelectItem>
 <SelectItem value="100">100 miles</SelectItem>
 <SelectItem value="statewide">Statewide</SelectItem>
 <SelectItem value="national">National</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 </div>

 {/* Environment Types */}
 <div>
 <Label className="text-base font-semibold text-muted-foreground mb-3 block">Preferred Environment Types</Label>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {environmentTypes.map((environment) => (
 <label key={environment.value} className="flex items-start space-x-3 cursor-pointer p-3 rounded-2xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-brand">
 <input
 type="checkbox"
 checked={formData.placement_preferences?.environments?.includes(environment.value) || false}
 onChange={() => handleEnvironmentChange(environment.value)}
 className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))] mt-1"
 />
 <div className="flex-1">
 <span className="text-sm font-medium">{environment.label}</span>
 <p className="text-xs text-muted-foreground mt-1">{environment.description}</p>
 </div>
 </label>
 ))}
 </div>
 </div>

 {/* Audience Contexts */}
 <div>
 <Label className="text-base font-semibold text-muted-foreground mb-3 block">Target Audience Contexts</Label>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {[
 { value: 'commuters', label: 'Commuters' },
 { value: 'shoppers', label: 'Shoppers' },
 { value: 'travelers', label: 'Travelers' },
 { value: 'diners', label: 'Diners' },
 { value: 'students', label: 'Students' },
 { value: 'professionals', label: 'Professionals' },
 { value: 'tourists', label: 'Tourists' },
 { value: 'residents', label: 'Local Residents' }
 ].map((context) => (
 <label key={context.value} className="flex items-center space-x-2 cursor-pointer p-2 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-brand">
 <input
 type="checkbox"
 checked={formData.placement_preferences?.audience_contexts?.includes(context.value) || false}
 onChange={() => handleAudienceContextChange(context.value)}
 className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
 />
 <span className="text-sm font-medium">{context.label}</span>
 </label>
 ))}
 </div>
 </div>

 {/* Time Preferences */}
 <div>
 <Label className="text-base font-semibold text-muted-foreground mb-3 block">Time-of-Day Preferences</Label>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <Label className="text-sm font-medium text-muted-foreground mb-2 block">Primary Times</Label>
 <Select
 value={formData.placement_preferences?.primary_time || ''}
 onValueChange={(value) => handleInputChange('placement_preferences', {
 ...formData.placement_preferences,
 primary_time: value
 })}
>
 <SelectTrigger className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-xl">
 <SelectValue placeholder="Select primary time..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="morning_rush">Morning Rush (6-9 AM)</SelectItem>
 <SelectItem value="business_hours">Business Hours (9 AM-5 PM)</SelectItem>
 <SelectItem value="lunch_time">Lunch Time (11 AM-2 PM)</SelectItem>
 <SelectItem value="evening_rush">Evening Rush (5-7 PM)</SelectItem>
 <SelectItem value="evening">Evening (7-11 PM)</SelectItem>
 <SelectItem value="weekend">Weekends</SelectItem>
 <SelectItem value="all_day">All Day</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div>
 <Label className="text-sm font-medium text-muted-foreground mb-2 block">Seasonal Preferences</Label>
 <Select
 value={formData.placement_preferences?.seasonal || ''}
 onValueChange={(value) => handleInputChange('placement_preferences', {
 ...formData.placement_preferences,
 seasonal: value
 })}
>
 <SelectTrigger className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-xl">
 <SelectValue placeholder="Select season..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="spring">Spring</SelectItem>
 <SelectItem value="summer">Summer</SelectItem>
 <SelectItem value="fall">Fall</SelectItem>
 <SelectItem value="winter">Winter</SelectItem>
 <SelectItem value="year_round">Year Round</SelectItem>
 <SelectItem value="holiday_season">Holiday Season</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div>
 <Label className="text-sm font-medium text-muted-foreground mb-2 block">Weather Targeting</Label>
 <Select
 value={formData.placement_preferences?.weather || ''}
 onValueChange={(value) => handleInputChange('placement_preferences', {
 ...formData.placement_preferences,
 weather: value
 })}
>
 <SelectTrigger className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-xl">
 <SelectValue placeholder="Weather preference..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="sunny">Sunny Days</SelectItem>
 <SelectItem value="rainy">Rainy Days</SelectItem>
 <SelectItem value="hot">Hot Weather (75°F+)</SelectItem>
 <SelectItem value="cold">Cold Weather (Below 50°F)</SelectItem>
 <SelectItem value="any">Any Weather</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 </div>

 {/* Success Metrics */}
 <div>
 <Label className="text-base font-semibold text-muted-foreground mb-3 block">Key Success Metrics to Track</Label>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {[
 { value: 'impressions', label: 'Impressions', icon: Eye },
 { value: 'brand_awareness', label: 'Brand Awareness', icon: TrendingUp },
 { value: 'foot_traffic', label: 'Foot Traffic', icon: MapPin },
 { value: 'engagement', label: 'Engagement', icon: MessageSquare },
 { value: 'website_visits', label: 'Website Visits', icon: BarChart3 },
 { value: 'conversions', label: 'Conversions', icon: Target },
 { value: 'recall', label: 'Ad Recall', icon: Lightbulb },
 { value: 'reach', label: 'Unique Reach', icon: Users }
 ].map((metric) => {
 const IconComponent = metric.icon;
 return (
 <label key={metric.value} className="flex items-center space-x-2 cursor-pointer p-3 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-brand">
 <input
 type="checkbox"
 checked={formData.success_metrics?.includes(metric.value) || false}
 onChange={(e) => {
 const checked = e.target.checked;
 handleInputChange('success_metrics', 
 checked 
 ? [...(formData.success_metrics || []), metric.value]
 : (formData.success_metrics || []).filter(m => m !== metric.value)
 );
 }}
 className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
 />
 <IconComponent className="w-4 h-4 text-[hsl(var(--primary))]" />
 <span className="text-sm font-medium">{metric.label}</span>
 </label>
 );
 })}
 </div>
 </div>
 </div>
 </div>
 );
};

// Step 4: Technical Specifications
const TechnicalSpecsStep = ({ formData, setFormData, errors, setErrors }) => {
 const handleInputChange = (field, value) => {
 setFormData(prev => ({ ...prev, [field]: value }));
 if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
 };

 const handleTechnicalSpecChange = (field, value) => {
 setFormData(prev => ({
 ...prev,
 technical_specs: {
 ...prev.technical_specs,
 [field]: value
 }
 }));
 };

 const handleFormatChange = (value) => {
 setFormData(prev => ({
 ...prev,
 technical_specs: {
 ...prev.technical_specs,
 formats: prev.technical_specs?.formats?.includes(value)
 ? prev.technical_specs.formats.filter(format => format !== value)
 : [...(prev.technical_specs?.formats || []), value]
 }
 }));
 };

 const handleAspectRatioChange = (value) => {
 setFormData(prev => ({
 ...prev,
 technical_specs: {
 ...prev.technical_specs,
 aspect_ratios: prev.technical_specs?.aspect_ratios?.includes(value)
 ? prev.technical_specs.aspect_ratios.filter(ratio => ratio !== value)
 : [...(prev.technical_specs?.aspect_ratios || []), value]
 }
 }));
 };

 return (
 <div className="space-y-8">
 <div className="text-center mb-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/25">
 <ImageIcon className="w-8 h-8 text-white" />
 </div>
 <h2 className="text-3xl font-bold text-foreground mb-3">Technical Specifications</h2>
 <p className="text-muted-foreground text-lg">Define format preferences for your campaign</p>
 </div>

 <div className="space-y-6">
 {/* Preferred Formats */}
 <div>
 <Label className="text-base font-semibold text-muted-foreground mb-3 block">Preferred Content Formats</Label>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {technicalFormats.map((format) => (
 <label key={format.value} className="flex items-start space-x-3 cursor-pointer p-4 rounded-2xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-brand">
 <input
 type="checkbox"
 checked={formData.technical_specs?.formats?.includes(format.value) || false}
 onChange={() => handleFormatChange(format.value)}
 className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))] mt-1"
 />
 <div className="flex-1">
 <span className="text-sm font-medium">{format.label}</span>
 <p className="text-xs text-muted-foreground mt-1">{format.description}</p>
 </div>
 </label>
 ))}
 </div>
 </div>

 {/* Aspect Ratios */}
 <div>
 <Label className="text-base font-semibold text-muted-foreground mb-3 block">Preferred Aspect Ratios</Label>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {[
 { value: '16:9', label: '16:9 (Landscape)', description: 'Widescreen format' },
 { value: '4:3', label: '4:3 (Standard)', description: 'Traditional format' },
 { value: '9:16', label: '9:16 (Portrait)', description: 'Vertical format' },
 { value: '1:1', label: '1:1 (Square)', description: 'Square format' },
 { value: '21:9', label: '21:9 (Ultra-wide)', description: 'Cinema format' },
 { value: '3:4', label: '3:4 (Portrait)', description: 'Tall format' },
 { value: '2:1', label: '2:1 (Banner)', description: 'Wide banner' },
 { value: 'custom', label: 'Custom', description: 'Flexible sizing' }
 ].map((ratio) => (
 <label key={ratio.value} className="flex items-start space-x-2 cursor-pointer p-3 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-brand">
 <input
 type="checkbox"
 checked={formData.technical_specs?.aspect_ratios?.includes(ratio.value) || false}
 onChange={() => handleAspectRatioChange(ratio.value)}
 className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))] mt-1"
 />
 <div className="flex-1">
 <span className="text-xs font-medium">{ratio.label}</span>
 <p className="text-xs text-muted-foreground">{ratio.description}</p>
 </div>
 </label>
 ))}
 </div>
 </div>

 {/* Resolution Requirements */}
 <div>
 <Label className="text-base font-semibold text-muted-foreground mb-3 block">Resolution Preferences</Label>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <Label className="text-sm font-medium text-muted-foreground mb-2 block">Minimum Quality</Label>
 <Select
 value={formData.technical_specs?.min_resolution || ''}
 onValueChange={(value) => handleTechnicalSpecChange('min_resolution', value)}
>
 <SelectTrigger className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-xl">
 <SelectValue placeholder="Select minimum..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="720p">720p HD</SelectItem>
 <SelectItem value="1080p">1080p Full HD</SelectItem>
 <SelectItem value="1440p">1440p 2K</SelectItem>
 <SelectItem value="4k">4K Ultra HD</SelectItem>
 <SelectItem value="flexible">Flexible</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div>
 <Label className="text-sm font-medium text-muted-foreground mb-2 block">Content Duration (Video)</Label>
 <Select
 value={formData.technical_specs?.max_duration || ''}
 onValueChange={(value) => handleTechnicalSpecChange('max_duration', value)}
>
 <SelectTrigger className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-xl">
 <SelectValue placeholder="Max duration..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="10">10 seconds</SelectItem>
 <SelectItem value="15">15 seconds</SelectItem>
 <SelectItem value="30">30 seconds</SelectItem>
 <SelectItem value="60">60 seconds</SelectItem>
 <SelectItem value="unlimited">No limit</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div>
 <Label className="text-sm font-medium text-muted-foreground mb-2 block">File Size Limit</Label>
 <Select
 value={formData.technical_specs?.max_file_size || ''}
 onValueChange={(value) => handleTechnicalSpecChange('max_file_size', value)}
>
 <SelectTrigger className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-xl">
 <SelectValue placeholder="Max file size..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="5mb">5 MB</SelectItem>
 <SelectItem value="10mb">10 MB</SelectItem>
 <SelectItem value="25mb">25 MB</SelectItem>
 <SelectItem value="50mb">50 MB</SelectItem>
 <SelectItem value="100mb">100 MB</SelectItem>
 <SelectItem value="flexible">Flexible</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 </div>

 {/* Special Requirements */}
 <div>
 <Label htmlFor="technical_notes" className="text-base font-semibold text-muted-foreground mb-2 block">Special Technical Requirements</Label>
 <Textarea
 id="technical_notes"
 value={formData.technical_specs?.special_requirements || ''}
 onChange={(e) => handleTechnicalSpecChange('special_requirements', e.target.value)}
 placeholder="Any specific technical requirements, accessibility needs, or special considerations..."
 rows={3}
 className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm focus-brand transition-brand resize-none"
 />
 </div>

 {/* Info Box */}
 <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
 <Lightbulb className="h-4 w-4 text-blue-600" />
 <AlertTitle className="text-blue-800 dark:text-blue-200">Flexible Specifications</AlertTitle>
 <AlertDescription className="text-blue-700 dark:text-blue-300">
 Don't worry about exact dimensions - these preferences help us recommend the best spaces for your campaign. 
 Final specifications can be adjusted when booking individual spaces.
 </AlertDescription>
 </Alert>
 </div>
 </div>
 );
};

// Step 5: Review & Summary
const ReviewStep = ({ formData }) => {
 const getObjectiveLabel = (value) => {
 const objective = campaignObjectives.find(obj => obj.value === value);
 return objective ? objective.label : value;
 };

 const getContentTypeLabels = (types) => {
 return types.map(type => {
 const option = contentTypeOptions.find(opt => opt.value === type);
 return option ? option.label : type;
 });
 };

 const getEnvironmentLabels = (environments) => {
 return environments?.map(env => {
 const option = environmentTypes.find(opt => opt.value === env);
 return option ? option.label : env;
 }) || [];
 };

 return (
 <div className="space-y-8">
 <div className="text-center mb-8">
 <div className="w-16 h-16 mx-auto mb-4 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-[var(--shadow-brand)]">
 <CheckCircle className="w-8 h-8 text-white" />
 </div>
 <h2 className="text-3xl font-bold text-foreground mb-3">Campaign Summary</h2>
 <p className="text-muted-foreground text-lg">Review your campaign details before creation</p>
 </div>

 <Card className="card-brand glass border-[hsl(var(--border))] rounded-3xl overflow-hidden shadow-lg">
 <CardHeader className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))] p-8">
 <CardTitle className="text-foreground text-2xl">Campaign Overview</CardTitle>
 </CardHeader>
 <CardContent className="p-8 space-y-8">
 {/* Basic Info */}
 <div>
 <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
 <Target className="w-5 h-5 text-[hsl(var(--primary))]" />
 Campaign Information
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <Label className="text-sm font-semibold text-muted-foreground mb-1 block">Campaign Name</Label>
 <p className="font-bold text-xl text-foreground">{formData.name}</p>
 </div>
 <div>
 <Label className="text-sm font-semibold text-muted-foreground mb-1 block">Brand Name</Label>
 <p className="font-bold text-xl text-foreground">{formData.brand_name}</p>
 </div>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
 <div>
 <Label className="text-sm font-semibold text-muted-foreground mb-1 block">Primary Objective</Label>
 <p className="font-bold text-lg text-[hsl(var(--primary))]">
 {getObjectiveLabel(formData.primary_objective)}
 </p>
 </div>
 <div>
 <Label className="text-sm font-semibold text-muted-foreground mb-1 block">Campaign Duration</Label>
 <p className="font-bold text-lg text-foreground">
 {formData.start_date && formData.end_date 
 ? `${format(formData.start_date, 'MMM d')} - ${format(formData.end_date, 'MMM d, yyyy')}`
 : 'Not set'}
 </p>
 </div>
 {formData.total_budget && (
 <div>
 <Label className="text-sm font-semibold text-muted-foreground mb-1 block">Total Budget</Label>
 <p className="font-bold text-lg text-green-600 dark:text-green-400">
 ${parseFloat(formData.total_budget).toLocaleString()}
 </p>
 </div>
 )}
 </div>
 </div>

 <Separator />

 {/* Target Audience */}
 {(formData.target_demographics?.age_range || formData.target_demographics?.income_level) && (
 <>
 <div>
 <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
 <Users className="w-5 h-5 text-[hsl(var(--primary))]" />
 Target Audience
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {formData.target_demographics?.age_range && (
 <div>
 <Label className="text-sm font-semibold text-muted-foreground mb-1 block">Age Range</Label>
 <p className="font-medium text-foreground">{formData.target_demographics.age_range}</p>
 </div>
 )}
 {formData.target_demographics?.income_level && (
 <div>
 <Label className="text-sm font-semibold text-muted-foreground mb-1 block">Income Level</Label>
 <p className="font-medium text-foreground">{formData.target_demographics.income_level}</p>
 </div>
 )}
 {formData.target_demographics?.primary_interest && (
 <div>
 <Label className="text-sm font-semibold text-muted-foreground mb-1 block">Primary Interest</Label>
 <p className="font-medium text-foreground">{formData.target_demographics.primary_interest}</p>
 </div>
 )}
 </div>
 </div>
 <Separator />
 </>
 )}

 {/* Creative Content */}
 <div>
 <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
 <Palette className="w-5 h-5 text-[hsl(var(--primary))]" />
 Creative Content
 </h3>
 
 {formData.content_type.length> 0 && (
 <div className="mb-4">
 <Label className="text-sm font-semibold text-muted-foreground mb-2 block">Content Categories</Label>
 <div className="flex flex-wrap gap-2">
 {getContentTypeLabels(formData.content_type).map(label => (
 <span key={label} className="bg-[hsl(var(--accent-light))] text-[hsl(var(--primary))] px-3 py-1 rounded-full text-sm font-medium border border-[hsl(var(--border))]">
 {label}
 </span>
 ))}
 </div>
 </div>
 )}

 {formData.creative_concept && (
 <div className="mb-4">
 <Label className="text-sm font-semibold text-muted-foreground mb-1 block">Creative Concept</Label>
 <p className="font-medium text-foreground leading-relaxed">{formData.creative_concept}</p>
 </div>
 )}

 {formData.call_to_action && (
 <div className="mb-4">
 <Label className="text-sm font-semibold text-muted-foreground mb-1 block">Call to Action</Label>
 <p className="font-medium text-foreground">{formData.call_to_action.replace('_', ' ')}</p>
 </div>
 )}

 {formData.media_files?.length> 0 && (
 <div>
 <Label className="text-sm font-semibold text-muted-foreground mb-2 block">Creative Assets ({formData.media_files.length})</Label>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
 {formData.media_files.slice(0, 4).map((file, index) => (
 <div key={index} className="p-2 bg-[hsl(var(--muted))] rounded-lg text-center">
 <File className="w-6 h-6 mx-auto mb-1 text-[hsl(var(--primary))]" />
 <p className="text-xs truncate">{file.name || 'Asset ' + (index + 1)}</p>
 </div>
 ))}
 {formData.media_files.length> 4 && (
 <div className="p-2 bg-[hsl(var(--muted))] rounded-lg text-center">
 <div className="w-6 h-6 mx-auto mb-1 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center">
 <span className="text-white text-xs">+{formData.media_files.length - 4}</span>
 </div>
 <p className="text-xs">More files</p>
 </div>
 )}
 </div>
 </div>
 )}
 </div>

 <Separator />

 {/* Placement Preferences */}
 <div>
 <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
 <MapPin className="w-5 h-5 text-[hsl(var(--primary))]" />
 Placement Preferences
 </h3>
 
 {formData.geographic_targeting?.cities && (
 <div className="mb-4">
 <Label className="text-sm font-semibold text-muted-foreground mb-1 block">Target Locations</Label>
 <p className="font-medium text-foreground">{formData.geographic_targeting.cities}</p>
 </div>
 )}

 {formData.placement_preferences?.environments?.length> 0 && (
 <div className="mb-4">
 <Label className="text-sm font-semibold text-muted-foreground mb-2 block">Environment Types</Label>
 <div className="flex flex-wrap gap-2">
 {getEnvironmentLabels(formData.placement_preferences.environments).map(label => (
 <span key={label} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
 {label}
 </span>
 ))}
 </div>
 </div>
 )}

 {formData.success_metrics?.length> 0 && (
 <div>
 <Label className="text-sm font-semibold text-muted-foreground mb-2 block">Success Metrics</Label>
 <div className="flex flex-wrap gap-2">
 {formData.success_metrics.map(metric => (
 <span key={metric} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
 {metric.replace('_', ' ')}
 </span>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* Technical Specs */}
 {(formData.technical_specs?.formats?.length> 0 || formData.technical_specs?.aspect_ratios?.length> 0) && (
 <>
 <Separator />
 <div>
 <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
 <ImageIcon className="w-5 h-5 text-[hsl(var(--primary))]" />
 Technical Specifications
 </h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {formData.technical_specs?.formats?.length> 0 && (
 <div>
 <Label className="text-sm font-semibold text-muted-foreground mb-2 block">Preferred Formats</Label>
 <div className="flex flex-wrap gap-2">
 {formData.technical_specs.formats.map(format => (
 <span key={format} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
 {format.replace('_', ' ')}
 </span>
 ))}
 </div>
 </div>
 )}

 {formData.technical_specs?.aspect_ratios?.length> 0 && (
 <div>
 <Label className="text-sm font-semibold text-muted-foreground mb-2 block">Aspect Ratios</Label>
 <div className="flex flex-wrap gap-2">
 {formData.technical_specs.aspect_ratios.map(ratio => (
 <span key={ratio} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
 {ratio}
 </span>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>
 </>
 )}

 {formData.notes && (
 <>
 <Separator />
 <div>
 <Label className="text-sm font-semibold text-muted-foreground mb-1 block">Additional Notes</Label>
 <p className="font-medium text-foreground leading-relaxed">{formData.notes}</p>
 </div>
 </>
 )}
 </CardContent>
 </Card>
 </div>
 );
};

export default function CreateCampaignPage() {
 const navigate = useNavigate();
 const [currentStep, setCurrentStep] = useState(1);
 const { user: currentUser } = useUser();
 const [isLoading, setIsLoading] = useState(true);
 const [isSaving, setIsSaving] = useState(false);
 const [hasSavedData, setHasSavedData] = useState(false);

 const { requestVerification, isLoading: isVerificationLoading } = useVerification();

 const [formData, setFormData] = useState({
 name: '',
 brand_name: '',
 primary_objective: '',
 target_demographics: {},
 start_date: null,
 end_date: null,
 total_budget: '',
 content_type: [],
 creative_concept: '',
 call_to_action: '',
 brand_guidelines: {},
 media_files: [],
 placement_preferences: {},
 geographic_targeting: {},
 success_metrics: [],
 technical_specs: {},
 notes: '',
 });

 const [errors, setErrors] = useState({});

 const steps = [
 { number: 1, title: 'Strategy', description: 'Goals & audience', icon: Target },
 { number: 2, title: 'Creative', description: 'Content & assets', icon: Palette },
 { number: 3, title: 'Placement', description: 'Location preferences', icon: MapPin },
 { number: 4, title: 'Technical', description: 'Format specs', icon: ImageIcon },
 { number: 5, title: 'Review', description: 'Final check', icon: CheckCircle }
 ];

 // Framer Motion variants
 const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 staggerChildren: 0.1,
 },
 },
 };

 const itemVariants = {
 hidden: { y: 20, opacity: 0 },
 visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
 };

 // Check for saved data on load
 useEffect(() => {
 try {
 const savedData = localStorage.getItem('campaignFormData');
 if (savedData) {
 const parsedData = JSON.parse(savedData);
 if (parsedData.formData.name || parsedData.formData.brand_name || parsedData.currentStep> 1) {
 setHasSavedData(true);
 }
 }
 } catch (error) {
 console.error("Failed to load saved campaign data:", error);
 localStorage.removeItem('campaignFormData');
 }
 }, []);

 // Auto-save progress
 useEffect(() => {
 try {
 if (formData.name || formData.brand_name || currentStep> 1) {
 const dataToSave = {
 formData,
 currentStep,
 timestamp: new Date().toISOString()
 };
 localStorage.setItem('campaignFormData', JSON.stringify(dataToSave));
 }
 } catch (error) {
 console.error("Failed to save campaign data:", error);
 }
 }, [formData, currentStep]);

 // Set loading state based on user availability
 useEffect(() => {
 if (currentUser) {
 setIsLoading(false);
 }
 }, [currentUser]);

 const handleRestore = () => {
 try {
 const savedData = localStorage.getItem('campaignFormData');
 if (savedData) {
 const parsedData = JSON.parse(savedData);
 // Convert date strings back to Date objects
 if (parsedData.formData.start_date) {
 parsedData.formData.start_date = new Date(parsedData.formData.start_date);
 }
 if (parsedData.formData.end_date) {
 parsedData.formData.end_date = new Date(parsedData.formData.end_date);
 }
 // Ensure all nested objects exist
 parsedData.formData.target_demographics = parsedData.formData.target_demographics || {};
 parsedData.formData.brand_guidelines = parsedData.formData.brand_guidelines || {};
 parsedData.formData.placement_preferences = parsedData.formData.placement_preferences || {};
 parsedData.formData.geographic_targeting = parsedData.formData.geographic_targeting || {};
 parsedData.formData.success_metrics = parsedData.formData.success_metrics || [];
 parsedData.formData.technical_specs = parsedData.formData.technical_specs || {};
 parsedData.formData.media_files = parsedData.formData.media_files || [];
 setFormData(parsedData.formData);
 setCurrentStep(parsedData.currentStep || 1);
 setHasSavedData(false);
 }
 } catch (error) {
 console.error("Failed to restore campaign data:", error);
 localStorage.removeItem('campaignFormData');
 }
 };

 const handleDiscard = () => {
 localStorage.removeItem('campaignFormData');
 setHasSavedData(false);
 setFormData({
 name: '',
 brand_name: '',
 primary_objective: '',
 target_demographics: {},
 start_date: null,
 end_date: null,
 total_budget: '',
 content_type: [],
 creative_concept: '',
 call_to_action: '',
 brand_guidelines: {},
 media_files: [],
 placement_preferences: {},
 geographic_targeting: {},
 success_metrics: [],
 technical_specs: {},
 notes: '',
 });
 setCurrentStep(1);
 setErrors({});
 };

 const validateStep = (step) => {
 const newErrors = {};
 
 if (step === 1) {
 if (!formData.name.trim()) newErrors.name = 'Campaign name is required';
 if (!formData.brand_name.trim()) newErrors.brand_name = 'Brand name is required';
 if (!formData.primary_objective) newErrors.primary_objective = 'Campaign objective is required';
 if (!formData.start_date) newErrors.start_date = 'Start date is required';
 if (!formData.end_date) newErrors.end_date = 'End date is required';
 if (formData.start_date && formData.end_date && !isAfter(formData.end_date, formData.start_date)) {
 newErrors.end_date = 'End date must be after start date';
 }
 } else if (step === 2) {
 if (formData.content_type.length === 0) newErrors.content_type = 'Select at least one content category';
 if (!formData.creative_concept.trim()) newErrors.creative_concept = 'Creative concept is required';
 }

 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };

 const handleNext = () => {
 if (validateStep(currentStep)) {
 setCurrentStep(prev => Math.min(prev + 1, 5));
 }
 };

 const handleBack = () => {
 setCurrentStep(prev => Math.max(prev - 1, 1));
 };

 const handleSaveDraft = async () => {
 if (!currentUser) return;
 
 setIsSaving(true);
 try {
 const campaignData = {
 ...formData,
 advertiser_id: currentUser.id,
 status: 'draft',
 start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : null,
 end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null,
 total_budget: formData.total_budget ? parseFloat(formData.total_budget) : 0,
 // Convert objects to JSON for database storage
 target_demographics: JSON.stringify(formData.target_demographics),
 brand_guidelines: JSON.stringify(formData.brand_guidelines),
 placement_preferences: JSON.stringify(formData.placement_preferences),
 geographic_targeting: JSON.stringify(formData.geographic_targeting),
 success_metrics: JSON.stringify(formData.success_metrics),
 technical_specs: JSON.stringify(formData.technical_specs),
 media_files: formData.media_files.length> 0 ? JSON.stringify(formData.media_files) : null
 };

 await Campaign.create(campaignData);
 localStorage.removeItem('campaignFormData');
 navigate(createPageUrl('Dashboard'));
 } catch (error) {
 console.error('Error saving campaign:', error);
 alert('Error saving campaign. Please try again.');
 }
 setIsSaving(false);
 };

 const handleCreateAndContinue = async () => {
 if (!validateStep(currentStep) || !currentUser) return;
 
 requestVerification('campaign', {
 title: 'Campaign Creation Verification',
 message: 'To create advertising campaigns, please complete your business verification.',
 onSuccess: async () => {
 await createCampaignAndNavigate();
 },
 onCancel: () => {
 console.log('User cancelled campaign verification');
 }
 });
 
 // ✅ REMOVED: The duplicate call that was causing two campaigns
 // Let the verification system handle it via onSuccess callback only
 };
 
 const createCampaignAndNavigate = async () => {
 console.log('🔥 createCampaignAndNavigate called - isSaving:', isSaving);
 console.log('🔥 Call stack:', new Error().stack);
 
 if (isSaving) {
 console.log('⚠️ Already saving, preventing duplicate submission');
 return;
 }
 
 setIsSaving(true);
 console.log('🚀 Starting campaign creation...');
 
 try {
 const campaignData = {
 ...formData,
 advertiser_id: currentUser.id,
 status: 'planning',
 start_date: format(formData.start_date, 'yyyy-MM-dd'),
 end_date: format(formData.end_date, 'yyyy-MM-dd'),
 total_budget: formData.total_budget ? parseFloat(formData.total_budget) : 0,
 // Convert objects to JSON for database storage
 target_demographics: JSON.stringify(formData.target_demographics),
 brand_guidelines: JSON.stringify(formData.brand_guidelines),
 placement_preferences: JSON.stringify(formData.placement_preferences),
 geographic_targeting: JSON.stringify(formData.geographic_targeting),
 success_metrics: JSON.stringify(formData.success_metrics),
 technical_specs: JSON.stringify(formData.technical_specs),
 media_files: formData.media_files.length> 0 ? JSON.stringify(formData.media_files) : null
 };
 
 console.log('📊 Campaign data prepared:', campaignData.name);
 
 const campaign = await Campaign.create(campaignData);
 
 console.log('✅ Campaign created successfully:', campaign.id);
 
 localStorage.removeItem('campaignFormData');
 navigate(`${createPageUrl('Map')}?campaign_id=${campaign.id}&select_mode=true`);
 
 console.log('🧭 Navigation initiated to map page');
 
 } catch (error) {
 console.error('❌ Error creating campaign:', error);
 alert('Error creating campaign. Please try again.');
 } finally {
 console.log('🏁 Campaign creation finished, setting isSaving to false');
 setIsSaving(false);
 }
 };

 const renderStep = () => {
 switch (currentStep) {
 case 1:
 return <CampaignStrategyStep formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />;
 case 2:
 return <CreativeContentStep formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />;
 case 3:
 return <PlacementPreferencesStep formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />;
 case 4:
 return <TechnicalSpecsStep formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />;
 case 5:
 return <ReviewStep formData={formData} />;
 default:
 return null;
 }
 };

 if (isLoading || isVerificationLoading) {
 return (
 <div className="min-h-screen bg-background flex items-center justify-center p-4">
 <div className="text-center">
 <div className="w-20 h-20 mx-auto mb-6 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-[var(--shadow-brand-lg)]">
 <Target className="w-10 h-10 text-white animate-pulse" />
 </div>
 <p className="text-muted-foreground font-semibold text-lg">Setting up your campaign...</p>
 </div>
 </div>
 );
 }

 return (
 <motion.div 
 className="min-h-screen bg-background p-4 md:p-8"
 variants={containerVariants}
 initial="hidden"
 animate="visible"
>
 <div className="max-w-5xl mx-auto space-y-8">
 {/* Restore Progress Alert */}
 {hasSavedData && (
 <motion.div variants={itemVariants}>
 <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6">
 <div className="flex items-center gap-4">
 <Zap className="h-6 w-6 text-yellow-600 flex-shrink-0" />
 <div>
 <AlertTitle className="text-yellow-800 dark:text-yellow-200 font-bold text-lg">Unsaved Progress Found!</AlertTitle>
 <AlertDescription className="text-yellow-700 dark:text-yellow-300">
 It looks like you left in the middle of creating a campaign.
 </AlertDescription>
 </div>
 </div>
 <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto self-end md:self-center">
 <Button 
 onClick={handleRestore} 
 className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl"
>
 <Sparkles className="w-4 h-4 mr-2" />
 Restore
 </Button>
 <Button 
 variant="outline" 
 onClick={handleDiscard} 
 className="flex-1 rounded-xl border-yellow-300 hover:bg-yellow-100 dark:border-yellow-700 dark:hover:bg-yellow-900"
>
 Start Fresh
 </Button>
 </div>
 </Alert>
 </motion.div>
 )}

 {/* Enhanced Header */}
 <motion.div variants={itemVariants} className="relative">
 <div className="absolute inset-0 bg-gradient-brand/20 rounded-3xl transform rotate-1"></div>
 <Card className="relative glass-strong border-[hsl(var(--border))] rounded-3xl overflow-hidden shadow-[var(--shadow-brand)]">
 <CardContent className="p-8 md:p-12 text-center">
 <div className="w-20 h-20 mx-auto mb-6 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-[var(--shadow-brand-lg)]">
 <Target className="w-10 h-10 text-white" />
 </div>
 <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-brand">
 Create New Campaign
 </h1>
 <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
 Build a strategic advertising campaign that reaches your target audience across multiple advertising spaces
 </p>
 </CardContent>
 </Card>
 </motion.div>

 {/* Enhanced Progress Steps */}
 <motion.div variants={itemVariants}>
 <Card className="card-brand glass border-[hsl(var(--border))] rounded-3xl overflow-hidden shadow-lg">
 <CardContent className="p-8">
 <div className="flex items-center justify-between">
 {steps.map((step, index) => (
 <div key={step.number} className="flex items-center">
 <div className="flex flex-col items-center">
 <div className={`flex items-center justify-center w-16 h-16 rounded-3xl border-2 transition-brand ${
 currentStep>= step.number 
 ? 'bg-gradient-brand border-[hsl(var(--primary))] text-white shadow-lg' 
 : 'border-[hsl(var(--border))] text-muted-foreground bg-[hsl(var(--card))]'
 }`}>
 {currentStep> step.number ? (
 <CheckCircle className="w-8 h-8" />
 ) : (
 <step.icon className="w-8 h-8" />
 )}
 </div>
 <div className="mt-4 text-center">
 <p className={`text-sm font-bold ${
 currentStep>= step.number 
 ? 'text-primary' 
 : 'text-muted-foreground'
 }`}>
 {step.title}
 </p>
 <p className="text-xs text-muted-foreground">{step.description}</p>
 </div>
 </div>
 {index < steps.length - 1 && (
 <div className={`w-16 h-1 mx-6 rounded-full transition-brand ${
 currentStep> step.number 
 ? 'bg-gradient-brand' 
 : 'bg-[hsl(var(--border))]'
 }`} />
 )}
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </motion.div>

 {/* Step Content */}
 <motion.div variants={itemVariants}>
 <Card className="card-brand glass border-[hsl(var(--border))] rounded-3xl overflow-hidden shadow-lg">
 <CardContent className="p-8 md:p-12">
 {renderStep()}
 </CardContent>
 </Card>
 </motion.div>

 {/* Navigation */}
 <motion.div variants={itemVariants} className="flex justify-between items-center">
 <Button 
 variant="outline" 
 onClick={handleBack} 
 disabled={currentStep === 1}
 className="px-8 py-3 border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-2xl font-bold transition-brand"
>
 <ArrowLeft className="w-5 h-5 mr-2" />
 Back
 </Button>
 
 <div className="flex gap-4">
 <Button 
 onClick={handleSaveDraft}
 variant="outline" 
 className="px-8 py-3 border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-2xl font-bold transition-brand"
 disabled={isSaving}
>
 <Save className="w-5 h-5 mr-2" />
 Save Draft
 </Button>
 
 {currentStep < 5 ? (
 <Button 
 onClick={handleNext}
 className="px-8 py-3 btn-gradient rounded-2xl font-bold transition-brand"
>
 Continue
 <ArrowRight className="w-5 h-5 ml-2" />
 </Button>
 ) : (
 <Button 
 onClick={handleCreateAndContinue}
 disabled={isSaving}
 className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-brand"
>
 {isSaving ? (
 <>
 <Zap className="w-5 h-5 mr-2 animate-pulse" />
 Creating Campaign...
 </>
 ) : (
 <>
 <Rocket className="w-5 h-5 mr-2" />
 Create & Select Properties
 </>
 )}
 </Button>
 )}
 </div>
 </motion.div>
 </div>
 </motion.div>
 );
}