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
import { CalendarIcon, Save, ArrowRight, ArrowLeft, Users, Target, Calendar as CalendarIconOutline, Sparkles, Zap, DollarSign, Clock, CheckCircle, AlertTriangle, Lightbulb, Rocket, BarChart3, Image as ImageIcon, Upload, File, X, Loader2, Ruler } from 'lucide-react';
import { format, addDays, isAfter } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { UploadFile } from '@/api/integrations';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { useVerification } from '@/components/verification/VerificationProvider';

const contentTypeOptions = [
    { value: 'alcohol', label: 'Alcohol & Beverages' },
    { value: 'tobacco', label: 'Tobacco & Smoking' },
    { value: 'gambling', label: 'Gambling & Betting' },
    { value: 'adult_content', label: 'Adult Content' },
    { value: 'political', label: 'Political Campaigns' },
    { value: 'religious', label: 'Religious Content' },
    { value: 'pharmaceutical', label: 'Pharmaceutical Products' },
    { value: 'weapons', label: 'Weapons & Military' },
    { value: 'fast_food', label: 'Fast Food & Restaurants' },
    { value: 'other', label: 'Other' }
];

// Step 1: Campaign Basics
const CampaignBasicsStep = ({ formData, setFormData, errors, setErrors }) => {
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
                    <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-3">Campaign Information</h2>
                <p className="text-muted-foreground text-lg">Tell us about your advertising campaign</p>
            </div>

            <div className="space-y-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

                <div>
                    <Label className="text-base font-semibold text-muted-foreground mb-2 block">Total Budget (Optional)</Label>
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
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        Set your overall campaign budget for tracking and optimization
                    </p>
                </div>
            </div>
        </div>
    );
};

// Step 2: Content Details
const ContentDetailsStep = ({ formData, setFormData, errors, setErrors }) => {
    const handleContentTypeChange = (value) => {
        setFormData(prev => ({
            ...prev,
            content_type: prev.content_type.includes(value)
                ? prev.content_type.filter(type => type !== value)
                : [...prev.content_type, value]
        }));
        if (errors.content_type) setErrors(prev => ({ ...prev, content_type: null }));
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/25">
                    <Users className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-3">Content Details</h2>
                <p className="text-muted-foreground text-lg">Describe what your campaign will advertise</p>
            </div>

            <div className="space-y-6">
                <div>
                    <Label className="text-base font-semibold text-muted-foreground mb-3 block">Content Types *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {contentTypeOptions.map((option) => (
                            <label key={option.value} className="flex items-center space-x-3 cursor-pointer p-3 rounded-2xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-brand">
                                <input
                                    type="checkbox"
                                    checked={formData.content_type.includes(option.value)}
                                    onChange={() => handleContentTypeChange(option.value)}
                                    className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
                                />
                                <span className="text-sm font-medium">{option.label}</span>
                            </label>
                        ))}
                    </div>
                    {errors.content_type && <p className="text-red-500 text-sm mt-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{errors.content_type}</p>}
                </div>

                <div>
                    <Label htmlFor="content_description" className="text-base font-semibold text-muted-foreground mb-2 block">Content Description</Label>
                    <Textarea
                        id="content_description"
                        value={formData.content_description}
                        onChange={(e) => handleInputChange('content_description', e.target.value)}
                        placeholder="Describe your advertising content, creative approach, target audience, and key messages..."
                        rows={4}
                        className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm focus-brand transition-brand resize-none"
                    />
                </div>

                <div>
                    <Label htmlFor="notes" className="text-base font-semibold text-muted-foreground mb-2 block">Additional Notes</Label>
                    <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Any additional information about your campaign, special requirements, or preferences..."
                        rows={3}
                        className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm focus-brand transition-brand resize-none"
                    />
                </div>
            </div>
        </div>
    );
};

const areaTypeOptions = [
    { value: 'billboard', label: 'Billboard' },
    { value: 'digital_display', label: 'Digital Display' },
    { value: 'transit_shelter', label: 'Transit Shelter' },
    { value: 'street_furniture', label: 'Street Furniture' },
    { value: 'building_wrap', label: 'Building Wrap' },
    { value: 'mall_display', label: 'Mall Display' },
    { value: 'stadium_board', label: 'Stadium Board' },
    { value: 'window_display', label: 'Window Display' },
    { value: 'rooftop', label: 'Rooftop' },
    { value: 'vehicle_wrap', label: 'Vehicle Wrap' },
    { value: 'poster', label: 'Poster' },
    { value: 'other', label: 'Other' }
];

// Step 3: Media & Specifications
const MediaStep = ({ formData, setFormData, errors, setErrors }) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            setFormData(prev => ({
                ...prev,
                media_files: [...(prev.media_files || []), file_url]
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
    
    const handleDimensionChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            media_dimensions: {
                ...prev.media_dimensions,
                [field]: value ? parseFloat(value) : ''
            }
        }));
        if (errors.media_dimensions) setErrors(prev => ({ ...prev, media_dimensions: null }));
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/25">
                    <ImageIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-3">Media & Specifications</h2>
                <p className="text-muted-foreground text-lg">Define your ad's format and size</p>
            </div>

            <div className="space-y-6">
                <div>
                    <Label className="text-base font-semibold text-muted-foreground mb-2 block">Media Type *</Label>
                    <Select
                        value={formData.media_type}
                        onValueChange={(value) => {
                            setFormData(prev => ({ ...prev, media_type: value }));
                            if (errors.media_type) setErrors(prev => ({ ...prev, media_type: null }));
                        }}
                    >
                        <SelectTrigger className={`bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm ${errors.media_type ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder="Select media type..." />
                        </SelectTrigger>
                        <SelectContent className="glass-strong border-[hsl(var(--border))] rounded-2xl">
                            {areaTypeOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.media_type && <p className="text-red-500 text-sm mt-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{errors.media_type}</p>}
                </div>

                <div>
                    <Label className="text-base font-semibold text-muted-foreground mb-2 block">Media Dimensions (feet) *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                type="number"
                                placeholder="Width"
                                value={formData.media_dimensions?.width || ''}
                                onChange={(e) => handleDimensionChange('width', e.target.value)}
                                className={`pl-12 bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm ${errors.media_dimensions ? 'border-red-500' : ''}`}
                            />
                        </div>
                        <div className="relative">
                            <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                type="number"
                                placeholder="Height"
                                value={formData.media_dimensions?.height || ''}
                                onChange={(e) => handleDimensionChange('height', e.target.value)}
                                className={`pl-12 bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm ${errors.media_dimensions ? 'border-red-500' : ''}`}
                            />
                        </div>
                    </div>
                    {errors.media_dimensions && <p className="text-red-500 text-sm mt-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{errors.media_dimensions}</p>}
                </div>

                <div>
                    <Label className="text-base font-semibold text-muted-foreground mb-2 block">Upload Media Files</Label>
                    <div className="relative border-2 border-dashed border-[hsl(var(--border))] rounded-2xl p-6 text-center hover:border-[hsl(var(--primary))] transition-brand">
                        <Upload className="mx-auto h-12 w-12 text-[hsl(var(--primary))]" />
                        <p className="mt-2 text-sm text-muted-foreground">
                            Drag & drop files here or click to browse
                        </p>
                        <Input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                            disabled={isUploading}
                            accept="image/*,video/*,application/pdf"
                        />
                    </div>
                    {isUploading && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                        </div>
                    )}
                    {(formData.media_files?.length > 0) && (
                        <div className="mt-4 space-y-2">
                            <h4 className="font-semibold text-sm">Uploaded Files:</h4>
                            {formData.media_files.map((fileUrl, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-[hsl(var(--muted))] rounded-lg">
                                    <div className="flex items-center gap-2 text-sm truncate">
                                        <File className="w-4 h-4 flex-shrink-0" />
                                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                                            {fileUrl.split('/').pop()}
                                        </a>
                                    </div>
                                    <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => handleRemoveFile(index)}>
                                        <X className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Step 4: Review
const ReviewStep = ({ formData }) => {
    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-[var(--shadow-brand)]">
                    <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-3">Review Your Campaign</h2>
                <p className="text-muted-foreground text-lg">Please review all information before creating your campaign</p>
            </div>

            <Card className="card-brand glass border-[hsl(var(--border))] rounded-3xl overflow-hidden shadow-lg">
                <CardHeader className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))] p-8">
                    <CardTitle className="text-foreground text-2xl">Campaign Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <Label className="text-sm font-semibold text-muted-foreground mb-1 block">Campaign Name</Label>
                            <p className="font-bold text-xl text-foreground">{formData.name}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-semibold text-muted-foreground mb-1 block">Brand Name</Label>
                            <p className="font-bold text-xl text-foreground">{formData.brand_name}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <Label className="text-sm font-semibold text-muted-foreground mb-1 block">Start Date</Label>
                            <p className="font-bold text-lg text-foreground">
                                {formData.start_date ? format(formData.start_date, 'PPP') : 'Not set'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-sm font-semibold text-muted-foreground mb-1 block">End Date</Label>
                            <p className="font-bold text-lg text-foreground">
                                {formData.end_date ? format(formData.end_date, 'PPP') : 'Not set'}
                            </p>
                        </div>
                    </div>

                    {formData.total_budget && (
                        <div>
                            <Label className="text-sm font-semibold text-muted-foreground mb-1 block">Total Budget</Label>
                            <p className="font-bold text-lg text-green-600 dark:text-green-400">
                                ${parseFloat(formData.total_budget).toLocaleString()}
                            </p>
                        </div>
                    )}

                    <Separator />

                    <div>
                        <Label className="text-sm font-semibold text-muted-foreground mb-3 block">Media Specifications</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Media Type</Label>
                                <p className="font-bold text-lg text-foreground capitalize">{formData.media_type ? areaTypeOptions.find(opt => opt.value === formData.media_type)?.label || formData.media_type.replace('_', ' ') : 'Not set'}</p>
                            </div>
                            <div>
                                <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Dimensions (W x H)</Label>
                                <p className="font-bold text-lg text-foreground">
                                    {formData.media_dimensions?.width && formData.media_dimensions?.height
                                        ? `${formData.media_dimensions.width}ft x ${formData.media_dimensions.height}ft`
                                        : 'Not set'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {formData.media_files?.length > 0 && (
                        <div>
                            <Label className="text-sm font-semibold text-muted-foreground mb-3 block">Uploaded Media</Label>
                            <div className="space-y-2">
                                {formData.media_files.map((fileUrl, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-[hsl(var(--muted))] rounded-lg text-sm">
                                        <File className="w-4 h-4 flex-shrink-0" />
                                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                                            {fileUrl.split('/').pop()}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {formData.content_type.length > 0 && (
                        <div>
                            <Label className="text-sm font-semibold text-muted-foreground mb-3 block">Content Types</Label>
                            <div className="flex flex-wrap gap-2">
                                {formData.content_type.map(type => {
                                    const option = contentTypeOptions.find(opt => opt.value === type);
                                    return (
                                        <span key={type} className="bg-[hsl(var(--accent-light))] text-[hsl(var(--primary))] px-3 py-1 rounded-full text-sm font-medium border border-[hsl(var(--border))]">
                                            {option?.label || type}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {formData.content_description && (
                        <div>
                            <Label className="text-sm font-semibold text-muted-foreground mb-1 block">Content Description</Label>
                            <p className="font-medium text-foreground leading-relaxed">{formData.content_description}</p>
                        </div>
                    )}

                    {formData.notes && (
                        <div>
                            <Label className="text-sm font-semibold text-muted-foreground mb-1 block">Additional Notes</Label>
                            <p className="font-medium text-foreground leading-relaxed">{formData.notes}</p>
                        </div>
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

    // ✅ FIXED: Use only the new verification system
    const { requestVerification, isLoading: isVerificationLoading } = useVerification();

    const [formData, setFormData] = useState({
        name: '',
        brand_name: '',
        start_date: null,
        end_date: null,
        content_type: [],
        content_description: '',
        notes: '',
        total_budget: '',
        media_type: '',
        media_dimensions: { width: '', height: '' },
        media_files: [],
    });

    const [errors, setErrors] = useState({});

    const steps = [
        { number: 1, title: 'Campaign Info', description: 'Basic details', icon: Target },
        { number: 2, title: 'Content', description: 'Content details', icon: Users },
        { number: 3, title: 'Media Specs', description: 'Format & size', icon: ImageIcon },
        { number: 4, title: 'Review', description: 'Final check', icon: CheckCircle }
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
                if (parsedData.formData.name || parsedData.formData.brand_name || parsedData.currentStep > 1) {
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
            if (formData.name || formData.brand_name || currentStep > 1) {
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
                // Ensure media_dimensions and media_files exist
                parsedData.formData.media_dimensions = parsedData.formData.media_dimensions || { width: '', height: '' };
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
            start_date: null,
            end_date: null,
            content_type: [],
            content_description: '',
            notes: '',
            total_budget: '',
            media_type: '',
            media_dimensions: { width: '', height: '' },
            media_files: [],
        });
        setCurrentStep(1);
        setErrors({});
    };

    const validateStep = (step) => {
        const newErrors = {};
        
        if (step === 1) {
            if (!formData.name.trim()) newErrors.name = 'Campaign name is required';
            if (!formData.brand_name.trim()) newErrors.brand_name = 'Brand name is required';
            if (!formData.start_date) newErrors.start_date = 'Start date is required';
            if (!formData.end_date) newErrors.end_date = 'End date is required';
            if (formData.start_date && formData.end_date && !isAfter(formData.end_date, formData.start_date)) {
                newErrors.end_date = 'End date must be after start date';
            }
        } else if (step === 2) {
            if (formData.content_type.length === 0) newErrors.content_type = 'Select at least one content type';
        } else if (step === 3) {
            if (!formData.media_type) newErrors.media_type = 'Media type is required';
            if (!formData.media_dimensions?.width || !formData.media_dimensions?.height) {
                newErrors.media_dimensions = 'Both width and height are required';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 4));
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
                advertiser_id: currentUser?.id || 'unknown',
                status: 'draft',
                start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : null,
                end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null,
                total_budget: formData.total_budget ? parseFloat(formData.total_budget) : 0,
                media_dimensions: formData.media_dimensions.width && formData.media_dimensions.height ? `${formData.media_dimensions.width}x${formData.media_dimensions.height}` : null,
                media_files: formData.media_files.length > 0 ? formData.media_files : null
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
        
        // ✅ FIXED: Use new verification system properly
        const verified = requestVerification('campaign', {
            title: 'Campaign Creation Verification',
            message: 'To create advertising campaigns, please complete your business verification.',
            onSuccess: async () => {
                await createCampaignAndNavigate();
            },
            onCancel: () => {
                console.log('User cancelled campaign verification');
            }
        });
        
        // If already verified, proceed directly
        if (verified) {
            await createCampaignAndNavigate();
        }
    };
    
    // ✅ UNCHANGED: Campaign creation logic
    const createCampaignAndNavigate = async () => {
        setIsSaving(true);
        try {
            const campaignData = {
                ...formData,
                advertiser_id: currentUser.id,
                status: 'planning',
                start_date: format(formData.start_date, 'yyyy-MM-dd'),
                end_date: format(formData.end_date, 'yyyy-MM-dd'),
                total_budget: formData.total_budget ? parseFloat(formData.total_budget) : 0,
                media_dimensions: formData.media_dimensions.width && formData.media_dimensions.height ? `${formData.media_dimensions.width}x${formData.media_dimensions.height}` : null,
                media_files: formData.media_files.length > 0 ? formData.media_files : null
            };

            const campaign = await Campaign.create(campaignData);
            localStorage.removeItem('campaignFormData');
            navigate(`${createPageUrl('Map')}?campaign_id=${campaign.id}&select_mode=true`);
        } catch (error) {
            console.error('Error creating campaign:', error);
            alert('Error creating campaign. Please try again.');
        }
        setIsSaving(false);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <CampaignBasicsStep formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />;
            case 2:
                return <ContentDetailsStep formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />;
            case 3:
                return <MediaStep formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />;
            case 4:
                return <ReviewStep formData={formData} />;
            default:
                return null;
        }
    };

    // ✅ FIXED: Clean loading condition
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
                                Define your advertising campaign details before selecting the perfect properties for your brand
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
                                                currentStep >= step.number 
                                                    ? 'bg-gradient-brand border-[hsl(var(--primary))] text-white shadow-lg' 
                                                    : 'border-[hsl(var(--border))] text-muted-foreground bg-[hsl(var(--card))]'
                                            }`}>
                                                {currentStep > step.number ? (
                                                    <CheckCircle className="w-8 h-8" />
                                                ) : (
                                                    <step.icon className="w-8 h-8" />
                                                )}
                                            </div>
                                            <div className="mt-4 text-center">
                                                <p className={`text-sm font-bold ${
                                                    currentStep >= step.number 
                                                        ? 'text-primary' 
                                                        : 'text-muted-foreground'
                                                }`}>
                                                    {step.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{step.description}</p>
                                            </div>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className={`w-24 h-1 mx-6 rounded-full transition-brand ${
                                                currentStep > step.number 
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
                        
                        {currentStep < 4 ? (
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