import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus, Eye, EyeOff } from 'lucide-react';

const MyPropertiesView = ({ properties, allAreasMap }) => {
 
 const areaCounts = useMemo(() => {
 const counts = {};
 if (!properties) return counts;

 if (!allAreasMap) {
 properties.forEach(prop => { counts[prop.id] = 0; });
 return counts;
 };

 const allAreasList = Object.values(allAreasMap);
 properties.forEach(prop => {
 counts[prop.id] = allAreasList.filter(area => area.property_id === prop.id).length;
 });

 return counts;
 }, [properties, allAreasMap]);

 if (!properties) {
 return (
 <div className="text-center p-8">
 <p className="text-muted-foreground">No properties to display.</p>
 </div>
 );
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
 {properties.map(prop => {
 const status = prop.status || 'listed'; // Default to listed for older properties
 return (
 <Card key={prop.id} className="group glass border-[hsl(var(--border))] rounded-3xl overflow-hidden shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand hover:-translate-y-1">
 <CardHeader className="p-0">
 <div className="relative h-48">
 <img
 src={prop.primary_image || 'https://images.unsplash.com/photo-1582407947304-586724b13a8a?q=80&w=800&auto=format&fit=crop'}
 alt={prop.name}
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
 <div className="absolute top-4 right-4">
 <Badge className={`rounded-full px-3 py-1 font-bold capitalize ${
 status === 'listed'
 ? 'bg-gradient-to-r from-[hsl(var(--success))] to-[hsl(var(--success))]/80 text-white border border-[hsl(var(--success))]/50'
 : 'bg-gradient-to-r from-[hsl(var(--muted-foreground))] to-[hsl(var(--muted-foreground))]/80 text-white border border-[hsl(var(--muted-foreground))]/50'
 }`}>
 {status === 'listed' ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
 {status}
 </Badge>
 </div>
 <div className="absolute bottom-4 left-4">
 <h3 className="text-2xl font-bold text-white shadow-lg">{prop.name}</h3>
 <p className="text-sm text-[hsl(var(--accent-light))] shadow-md">{prop.location?.city}</p>
 </div>
 </div>
 </CardHeader>
 <CardContent className="p-6">
 <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{prop.description}</p>
 <div className="flex justify-between items-center text-sm">
 <Badge variant="secondary" className="bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/30 rounded-full">
 {areaCounts[prop.id] || 0} Advertising Area{areaCounts[prop.id] !== 1 && 's'}
 </Badge>
 <Badge variant="outline" className="border-[hsl(var(--border))] text-[hsl(var(--primary))] rounded-full capitalize">
 {prop.type?.replace('_', ' ')}
 </Badge>
 </div>
 </CardContent>
 <CardFooter className="glass-strong p-6 border-t border-[hsl(var(--border))]">
 <Link to={createPageUrl(`propertymanagement?id=${prop.id}`)} className="w-full">
 <Button className="w-full btn-gradient rounded-2xl shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand">
 Manage Property
 </Button>
 </Link>
 </CardFooter>
 </Card>
 );
 })}
 <Link to={createPageUrl('CreateProperty')}>
 <Card className="group h-full flex items-center justify-center glass border-2 border-dashed border-[hsl(var(--primary))]/50 rounded-3xl shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] hover:border-[hsl(var(--primary))] transition-brand hover:-translate-y-1">
 <div className="text-center p-6">
 <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-[hsl(var(--primary))]/10 to-[hsl(var(--accent))]/10 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
 <Plus className="w-10 h-10 text-[hsl(var(--primary))]" />
 </div>
 <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Add New Property</h3>
 <p className="text-muted-foreground mt-2">Create a new listing for your advertising spaces.</p>
 </div>
 </Card>
 </Link>
 </div>
 );
};

export default MyPropertiesView;