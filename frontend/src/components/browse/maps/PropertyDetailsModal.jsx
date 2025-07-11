import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, Star, DollarSign, Building, Edit, Trash2, EyeOff } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } }
};

const PropertyDetailsModal = ({
    property,
    areas,
    isOpen,
    onClose,
    onBookArea,
    selectMode,
    onAreaSelect,
    selectedAreaIds,
    currentUserId,
    onUnlistProperty,
    onDeleteProperty
}) => {
    // Keep the original robust check to prevent rendering errors if property is null
    if (!isOpen || !property) return null;

    const availableAreas = areas.filter(a => a.status === 'active');
    const minPrice = availableAreas.length > 0 ? Math.min(...availableAreas.map(a => a.pricing?.daily_rate || Infinity)) : null;

    const isOwner = currentUserId && property.owner_id === currentUserId;

    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog open={isOpen} onOpenChange={onClose}>
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 glass border-[hsl(var(--border))] rounded-3xl overflow-hidden">
                            <DialogHeader className="p-6 border-b border-[hsl(var(--border))]">
                                <DialogTitle className="text-2xl font-bold text-[hsl(var(--foreground))]">{property.name}</DialogTitle>
                                <DialogDescription className="flex items-center gap-4 text-[hsl(var(--muted-foreground))]">
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-1 text-[hsl(var(--primary))]" />
                                        {property.location?.address}
                                    </div>
                                    <Badge variant="outline" className="border-[hsl(var(--border))] text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 rounded-full">
                                        {property.type?.replace('_', ' ')}
                                    </Badge>
                                    {isOwner && (
                                        <div className="flex items-center gap-2 ml-auto">
                                            <Button variant="outline" size="sm" onClick={() => onUnlistProperty(property.id)} className="rounded-xl border-[hsl(var(--warning))] text-[hsl(var(--warning))] hover:bg-[hsl(var(--warning))]/5 transition-brand">
                                                <EyeOff className="w-4 h-4 mr-2" /> Unlist
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => onDeleteProperty(property.id)} className="rounded-xl transition-brand">
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                            </Button>
                                        </div>
                                    )}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                                <div className="glass p-6 rounded-2xl border border-[hsl(var(--border))]">
                                    <h3 className="font-bold text-lg text-[hsl(var(--foreground))] mb-4 flex items-center gap-2"><Building className="w-5 h-5 text-[hsl(var(--primary))]" /> About Property</h3>
                                    <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">{property.description}</p>
                                    
                                    {minPrice && minPrice !== Infinity && (
                                        <div className="mt-6 flex items-center text-[hsl(var(--success))] font-bold">
                                            <DollarSign className="w-5 h-5" />
                                            <span className="text-xl">From ${minPrice}/day</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex flex-col">
                                    <h3 className="font-bold text-lg text-[hsl(var(--foreground))] mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-[hsl(var(--warning))]" /> Available Areas ({availableAreas.length})</h3>
                                    <ScrollArea className="flex-1 pr-4 -mr-4">
                                        <div className="space-y-4">
                                            {availableAreas.map(area => (
                                                <motion.div 
                                                    key={area.id} 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="glass border border-[hsl(var(--border))] rounded-2xl p-4 shadow-sm hover:shadow-[var(--shadow-brand)] transition-brand"
                                                >
                                                  <div className="flex gap-4">
                                                    <img src={area.images?.[0] || 'https://via.placeholder.com/80x60/6169A7/ffffff?text=Area'} alt={area.title} className="w-24 h-20 object-cover rounded-xl bg-gradient-to-br from-[hsl(var(--primary))]/10 to-[hsl(var(--accent-light))]/10 flex-shrink-0 shadow-sm"/>
                                                    <div className="flex-1 min-w-0">
                                                      <div className="flex items-start justify-between">
                                                        <h4 className="font-bold text-[hsl(var(--foreground))] text-md truncate">{area.title}</h4>
                                                        {selectMode && (
                                                            <Checkbox
                                                              checked={selectedAreaIds.includes(area.id)}
                                                              onCheckedChange={() => onAreaSelect(area.id)}
                                                              className="ml-2"
                                                            />
                                                        )}
                                                      </div>
                                                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 line-clamp-2 leading-relaxed">{area.description}</p>
                                                      <div className="flex items-center justify-between mt-3">
                                                        <div className="flex items-center gap-2">
                                                          <Badge variant="outline" className="text-xs border-[hsl(var(--border))] text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 rounded-full">{area.type}</Badge>
                                                          <div className="flex items-center text-[hsl(var(--success))] font-bold text-sm">
                                                            <DollarSign className="w-3 h-3" />
                                                            {area.pricing?.daily_rate}/day
                                                          </div>
                                                        </div>
                                                        {!selectMode && (
                                                          <Button size="sm" onClick={() => onBookArea(area)} className="text-xs btn-gradient rounded-xl shadow-sm hover:shadow-[var(--shadow-brand)] transition-brand">Book Now</Button>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </motion.div>
                                            ))}
                                            {availableAreas.length === 0 && (
                                                <div className="text-center py-10">
                                                    <p className="text-[hsl(var(--muted-foreground))]">No areas currently available for this property.</p>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        </DialogContent>
                    </motion.div>
                </Dialog>
            )}
        </AnimatePresence>
    );
};

export default PropertyDetailsModal;