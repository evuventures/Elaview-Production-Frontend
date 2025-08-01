import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Space } from '@/api/entities';
import { Loader2 } from 'lucide-react';

export default function AreaFormModal({ isOpen, onClose, onSuccess, propertyId, initialData }) {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isEditing) {
            setFormData(initialData);
        } else {
            setFormData({
                title: '',
                description: '',
                type: '',
                pricing: { daily_rate: '' },
                dimensions: { width: '', height: '' },
                status: 'active',
            });
        }
    }, [initialData, isEditing, isOpen]);

    const handleChange = (path, value) => {
        setFormData(prev => {
            const keys = path.split('.');
            if (keys.length === 1) return { ...prev, [keys[0]]: value };
            
            const newForm = { ...prev };
            let current = newForm;
            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = { ...current[keys[i]] };
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newForm;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isEditing) {
                console.log('🚀 MIGRATION: Using Space.update instead of AdvertisingArea.update');
                await Space.update(initialData.id, formData);
            } else {
                console.log('🚀 MIGRATION: Using Space.create instead of AdvertisingArea.create');
                await Space.create({ ...formData, property_id: propertyId });
            }
            onSuccess();
        } catch (error) {
            console.error("Failed to save area:", error);
            alert("An error occurred. Please check the console.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="glass border-[hsl(var(--border))] rounded-3xl shadow-[var(--shadow-brand-lg)]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[hsl(var(--foreground))]">
                        {isEditing ? 'Edit' : 'Add New'} Advertising Space
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div>
                        <Label htmlFor="title" className="text-base font-semibold text-[hsl(var(--muted-foreground))] mb-2 block">
                            Space Title
                        </Label>
                        <Input 
                            id="title" 
                            value={formData.title || ''} 
                            onChange={e => handleChange('title', e.target.value)} 
                            placeholder="e.g., Rooftop Billboard - North Face" 
                            className="glass border-[hsl(var(--border))] rounded-xl focus-brand transition-brand"
                        />
                    </div>
                    
                    <div>
                        <Label htmlFor="type" className="text-base font-semibold text-[hsl(var(--muted-foreground))] mb-2 block">
                            Space Type
                        </Label>
                        <Select value={formData.type || ''} onValueChange={value => handleChange('type', value)}>
                            <SelectTrigger className="glass border-[hsl(var(--border))] rounded-xl focus-brand transition-brand">
                                <SelectValue placeholder="Select space type" />
                            </SelectTrigger>
                            <SelectContent className="glass border-[hsl(var(--border))] rounded-xl">
                                <SelectItem value="storefront_window">Storefront Window</SelectItem>
                                <SelectItem value="building_exterior">Building Exterior</SelectItem>
                                <SelectItem value="event_space">Event Space</SelectItem>
                                <SelectItem value="retail_frontage">Retail Frontage</SelectItem>
                                <SelectItem value="pole_mount">Pole Mount</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div>
                        <Label htmlFor="daily_rate" className="text-base font-semibold text-[hsl(var(--muted-foreground))] mb-2 block">
                            Daily Rate ($)
                        </Label>
                        <Input 
                            id="daily_rate" 
                            type="number" 
                            value={formData.pricing?.daily_rate || ''} 
                            onChange={e => handleChange('pricing.daily_rate', parseFloat(e.target.value) || 0)} 
                            placeholder="e.g., 250" 
                            className="glass border-[hsl(var(--border))] rounded-xl focus-brand transition-brand"
                        />
                    </div>
                    
                    <div>
                        <Label className="text-base font-semibold text-[hsl(var(--muted-foreground))] mb-2 block">
                            Dimensions
                        </Label>
                        <div className="flex gap-4">
                            <Input 
                                value={formData.dimensions?.width || ''} 
                                onChange={e => handleChange('dimensions.width', e.target.value)} 
                                placeholder="Width (ft)" 
                                className="glass border-[hsl(var(--border))] rounded-xl focus-brand transition-brand"
                            />
                            <Input 
                                value={formData.dimensions?.height || ''} 
                                onChange={e => handleChange('dimensions.height', e.target.value)} 
                                placeholder="Height (ft)" 
                                className="glass border-[hsl(var(--border))] rounded-xl focus-brand transition-brand"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <Label htmlFor="description" className="text-base font-semibold text-[hsl(var(--muted-foreground))] mb-2 block">
                            Description
                        </Label>
                        <Textarea 
                            id="description" 
                            value={formData.description || ''} 
                            onChange={e => handleChange('description', e.target.value)} 
                            placeholder="Specific details about this area" 
                            className="glass border-[hsl(var(--border))] rounded-xl focus-brand transition-brand min-h-[100px]"
                        />
                    </div>
                    
                    <DialogFooter className="flex gap-3 pt-6 border-t border-[hsl(var(--border))]">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="rounded-xl transition-brand">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button 
                            type="submit" 
                            disabled={isLoading}
                            className="btn-gradient rounded-xl shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEditing ? 'Save Changes' : 'Create Area'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}