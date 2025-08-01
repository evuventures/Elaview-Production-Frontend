import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Property, Space } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Edit, Trash2, DollarSign, Eye, BarChart3, Camera, Star, Users, Calendar, TrendingUp, Building, Target, ArrowLeft, Sparkles, Zap, Crown, Activity, EyeOff } from 'lucide-react';
import { createPageUrl } from '@/utils';
import AreaFormModal from '../../components/properties/AreaFormModal';
import AnalyticsButton from '../../components/analytics/AnalyticsButton';

export default function PropertyManagementPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [areas, setAreas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArea, setEditingArea] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Parse property ID from URL parameters
    const getPropertyId = () => {
        const urlParams = new URLSearchParams(location.search);
        return urlParams.get('id') || urlParams.get('property_id');
    };

    const loadData = async () => {
        const propertyId = getPropertyId();
        
        if (!propertyId) {
            setIsLoading(false);
            setProperty(null);
            return;
        }

        setIsLoading(true);
        try {
            const prop = await Property.get(propertyId);
            const adAreas = await Space.filter({ property_id: propertyId });
            setProperty(prop);
            setAreas(adAreas || []);
        } catch (error) {
            console.error("Error loading property data:", error);
            setProperty(null);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [location.search]);

    const handleFormSuccess = () => {
        setIsModalOpen(false);
        setEditingArea(null);
        loadData();
    };

    const handleAddNewArea = () => {
        setEditingArea(null);
        setIsModalOpen(true);
    };
    
    const handleEditArea = (area) => {
        setEditingArea(area);
        setIsModalOpen(true);
    };

    const handleDeleteArea = async (areaId) => {
        if (window.confirm("Are you sure you want to delete this advertising area? This cannot be undone.")) {
            try {
                await Space.delete(areaId);
                loadData();
            } catch (error) {
                console.error("Error deleting area:", error);
                alert("Failed to delete area. Please try again.");
            }
        }
    };

    const handleToggleListing = async () => {
        if (!property) return;
        const newStatus = property.status === 'listed' ? 'unlisted' : 'listed';
        try {
            await Property.update(property.id, { status: newStatus });
            loadData();
        } catch (error) {
            console.error("Failed to update property status:", error);
            alert("Failed to update property status. Please try again.");
        }
    };

    const handleDeleteProperty = async () => {
        if (!property) return;
        if (window.confirm("Are you sure you want to permanently delete this property and all its associated advertising areas? This action cannot be undone.")) {
            try {
                // First, delete all associated advertising areas
                await Promise.all(areas.map(area => Space.delete(area.id)));
                // Then, delete the property itself
                await Property.delete(property.id);
                // Redirect to the dashboard
                navigate(createPageUrl('Dashboard'));
            } catch (error) {
                console.error("Failed to delete property:", error);
                alert("Failed to delete property. It might have active bookings. Please resolve them and try again.");
            }
        }
    };

    const getAreaTypeColor = (type) => {
        const colors = {
            'billboard': 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]',
            'digital_display': 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.3)]',
            'window_display': 'bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))] border border-[hsl(var(--success)/0.3)]',
            'vehicle_wrap': 'bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))] border border-[hsl(var(--warning)/0.3)]',
            'poster': 'bg-[hsl(var(--accent-light)/0.1)] text-[hsl(var(--accent-light))] border border-[hsl(var(--accent-light)/0.3)]',
            'building_wrap': 'bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))] border border-[hsl(var(--destructive)/0.3)]',
            'street_furniture': 'bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]',
            'transit_shelter': 'bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]',
            'other': 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]'
        };
        return colors[type] || colors['other'];
    };

    const getStatusColor = (status) => {
        const colors = {
            'active': 'bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))] border border-[hsl(var(--success)/0.3)]',
            'booked': 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]',
            'maintenance': 'bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))] border border-[hsl(var(--warning)/0.3)]',
            'inactive': 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]'
        };
        return colors[status] || colors['inactive'];
    };

    const getPropertyStatusBadge = (status) => {
        if (status === 'listed') {
            return (
                <Badge className="bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))] border border-[hsl(var(--success)/0.3)] rounded-full px-4 py-2 font-bold text-sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Listed
                </Badge>
            );
        }
        return (
            <Badge className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] rounded-full px-4 py-2 font-bold text-sm">
                <EyeOff className="w-4 h-4 mr-2" />
                Unlisted
            </Badge>
        );
    };

    const PropertyImageGallery = ({ property }) => {
        const images = property.photos || [property.primary_image].filter(Boolean);
        
        if (images.length === 0) {
            return (
                <div className="w-full h-72 bg-[hsl(var(--muted))] rounded-3xl flex items-center justify-center border-2 border-dashed border-[hsl(var(--border))]">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-[hsl(var(--muted))] rounded-3xl flex items-center justify-center">
                            <Camera className="w-8 h-8 text-[hsl(var(--primary))]" />
                        </div>
                        <p className="text-[hsl(var(--muted-foreground))] font-medium">No photos available</p>
                        <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">Add photos to showcase your property</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="relative">
                <div className="aspect-video rounded-3xl overflow-hidden bg-[hsl(var(--muted))] shadow-[var(--shadow-brand)]">
                    <img 
                        src={images[selectedImageIndex]} 
                        alt={`${property.name} - Image ${selectedImageIndex + 1}`}
                        className="w-full h-full object-cover transition-brand hover:scale-105"
                    />
                    {images.length > 1 && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    )}
                </div>
                
                {images.length > 1 && (
                    <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImageIndex(index)}
                                className={`flex-shrink-0 w-20 h-16 rounded-2xl overflow-hidden border-2 transition-brand ${
                                    selectedImageIndex === index 
                                        ? 'border-[hsl(var(--primary))] ring-4 ring-[hsl(var(--primary)/0.2)] shadow-[var(--shadow-brand)] scale-105' 
                                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] hover:scale-105'
                                }`}
                            >
                                <img 
                                    src={image} 
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
                
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-2xl text-sm font-bold backdrop-blur-sm">
                    {selectedImageIndex + 1} / {images.length}
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-[var(--shadow-brand-lg)]">
                        <Building className="w-10 h-10 animate-pulse text-white" />
                    </div>
                    <p className="text-[hsl(var(--muted-foreground))] font-semibold text-lg">Loading your property...</p>
                </div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-[hsl(var(--background))] p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <Card className="glass-strong rounded-3xl overflow-hidden shadow-[var(--shadow-brand)]">
                        <CardContent className="p-12 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 bg-[hsl(var(--destructive)/0.1)] rounded-3xl flex items-center justify-center">
                                <Building className="w-10 h-10 text-[hsl(var(--destructive))]" />
                            </div>
                            <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">Property not found</h3>
                            <p className="text-[hsl(var(--muted-foreground))] mb-6 text-lg">The property you're looking for doesn't exist or you don't have access to it.</p>
                            <Link to={createPageUrl('Dashboard')}>
                                <Button className="btn-gradient rounded-2xl px-8 py-3 font-bold shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand">
                                    Return to Dashboard
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const totalRevenue = areas.reduce((sum, area) => sum + ((area.pricing?.daily_rate || 0) * 30), 0);
    const averageTrafficScore = areas.reduce((sum, area) => sum + (area.traffic_score || 0), 0) / areas.length || 0;

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Enhanced Header */}
                <div className="relative">
                    <div className="absolute inset-0 bg-[hsl(var(--primary)/0.1)] rounded-3xl transform rotate-1"></div>
                    <Card className="relative glass-strong rounded-3xl overflow-hidden shadow-[var(--shadow-brand-lg)]">
                        <CardContent className="p-8 md:p-12">
                            <div className="flex items-center gap-6 mb-6">
                                <Link to={createPageUrl('Dashboard')}>
                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-[hsl(var(--muted))]">
                                        <ArrowLeft className="w-6 h-6" />
                                    </Button>
                                </Link>
                                <div className="w-16 h-16 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-[var(--shadow-brand-lg)]">
                                    <Building className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand">
                                        Property Management
                                    </h1>
                                    <p className="text-[hsl(var(--muted-foreground))] text-lg md:text-xl mt-2">
                                        Manage your advertising spaces and track performance
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Enhanced Property Header with Photo Gallery */}
                <Card className="glass-strong rounded-3xl overflow-hidden shadow-[var(--shadow-brand)]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                        <PropertyImageGallery property={property} />
                        
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">{property.name}</h2>
                                    <div className="flex items-center gap-2">
                                        <Link to={`${createPageUrl('EditProperty')}?id=${property.id}`}>
                                            <Button variant="outline" className="border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-2xl">
                                                <Edit className="w-4 h-4 mr-2" /> Edit
                                            </Button>
                                        </Link>
                                        <Button variant="destructive" size="sm" onClick={handleDeleteProperty} className="rounded-2xl">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center text-[hsl(var(--muted-foreground))] mb-4 text-lg">
                                    <MapPin className="w-5 h-5 mr-2 text-[hsl(var(--primary))]" />
                                    <span>{property.location?.address}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge className="bg-[hsl(var(--muted))] text-[hsl(var(--primary))] border border-[hsl(var(--border))] rounded-full px-4 py-2 font-bold text-sm">
                                        {property.type?.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                    {getPropertyStatusBadge(property.status)}
                                </div>
                            </div>

                            <p className="text-[hsl(var(--muted-foreground))] leading-relaxed text-lg">{property.description}</p>
                            <Button onClick={handleToggleListing} size="lg" className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white rounded-2xl shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand">
                                {property.status === 'listed' ? (
                                    <><EyeOff className="w-5 h-5 mr-2" /> Unlist Property</>
                                ) : (
                                    <><Eye className="w-5 h-5 mr-2" /> Relist Property</>
                                )}
                            </Button>

                            {/* Enhanced Property Stats */}
                            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[hsl(var(--border))]">
                                <Card className="bg-[hsl(var(--success)/0.1)] border-[hsl(var(--success)/0.3)] rounded-2xl overflow-hidden">
                                    <CardContent className="p-6 text-center">
                                        <div className="flex items-center justify-center mb-3">
                                            <div className="w-12 h-12 bg-[hsl(var(--success))] rounded-2xl flex items-center justify-center shadow-[var(--shadow-brand)]">
                                                <DollarSign className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="text-3xl font-bold text-[hsl(var(--success))] mb-1">${totalRevenue.toLocaleString()}</div>
                                        <p className="text-sm text-[hsl(var(--success))] font-medium">Monthly Potential</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-[hsl(var(--primary)/0.1)] border-[hsl(var(--primary)/0.3)] rounded-2xl overflow-hidden">
                                    <CardContent className="p-6 text-center">
                                        <div className="flex items-center justify-center mb-3">
                                            <div className="w-12 h-12 bg-[hsl(var(--primary))] rounded-2xl flex items-center justify-center shadow-[var(--shadow-brand)]">
                                                <TrendingUp className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="text-3xl font-bold text-[hsl(var(--primary))] mb-1">{Math.round(averageTrafficScore)}</div>
                                        <p className="text-sm text-[hsl(var(--primary))] font-medium">Avg Traffic Score</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Enhanced Areas Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] flex items-center gap-3">
                            <div className="w-10 h-10 bg-[hsl(var(--success))] rounded-2xl flex items-center justify-center shadow-[var(--shadow-brand)]">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            Advertising Areas
                        </h2>
                        <p className="text-[hsl(var(--muted-foreground))] text-lg mt-2">Manage your property's advertising spaces and track performance</p>
                    </div>
                    <Button onClick={handleAddNewArea} className="btn-gradient rounded-2xl px-6 py-3 font-bold shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand">
                        <Plus className="w-5 h-5 mr-2" /> Add New Area
                    </Button>
                </div>

                {/* Enhanced Areas Grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {areas.map(area => (
                        <Card key={area.id} className="group glass-strong rounded-3xl overflow-hidden shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand hover:-translate-y-1">
                            {/* Enhanced Area Image */}
                            <div className="relative h-56 overflow-hidden">
                                <img 
                                    src={area.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=500&h=300&auto=format&fit=crop'}
                                    alt={area.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-brand"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute top-4 left-4">
                                    <Badge className={`${getStatusColor(area.status)} rounded-full px-3 py-1 font-bold`}>
                                        {area.status}
                                    </Badge>
                                </div>
                                <div className="absolute top-4 right-4">
                                    <Badge className={`${getAreaTypeColor(area.type)} rounded-full px-3 py-1 font-bold`}>
                                        {area.type?.replace('_', ' ')}
                                    </Badge>
                                </div>
                                {area.traffic_score && (
                                    <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-2xl text-sm backdrop-blur-sm">
                                        <div className="flex items-center font-bold">
                                            <Users className="w-4 h-4 mr-2" />
                                            {area.traffic_score}/100
                                        </div>
                                    </div>
                                )}
                                <div className="absolute bottom-4 right-4">
                                    <div className="w-10 h-10 bg-gradient-brand rounded-full flex items-center justify-center shadow-[var(--shadow-brand)]">
                                        <Star className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </div>

                            <CardHeader className="pb-3">
                                <CardTitle className="text-[hsl(var(--foreground))] text-xl font-bold">{area.title}</CardTitle>
                            </CardHeader>
                            
                            <CardContent className="space-y-6">
                                <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed">{area.description}</p>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center font-bold text-[hsl(var(--foreground))]">
                                        <div className="w-8 h-8 bg-[hsl(var(--success))] rounded-xl flex items-center justify-center mr-3 shadow-[var(--shadow-brand)]">
                                            <DollarSign className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-2xl">${area.pricing?.daily_rate}</span>
                                        <span className="text-sm text-[hsl(var(--muted-foreground))] ml-2">/day</span>
                                    </div>
                                    {area.dimensions && (
                                        <div className="text-sm text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-3 py-1 rounded-full font-medium">
                                            {area.dimensions.width}×{area.dimensions.height} ft
                                        </div>
                                    )}
                                </div>

                                {area.features && area.features.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {area.features.slice(0, 3).map((feature, index) => (
                                            <Badge key={index} variant="outline" className="text-xs border-[hsl(var(--border))] text-[hsl(var(--primary))] rounded-full">
                                                {feature.replace('_', ' ')}
                                            </Badge>
                                        ))}
                                        {area.features.length > 3 && (
                                            <Badge variant="outline" className="text-xs border-[hsl(var(--border))] text-[hsl(var(--primary))] rounded-full">
                                                +{area.features.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-2 pt-4 border-t border-[hsl(var(--border))]">
                                    <Button variant="outline" size="sm" className="flex-1 border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-xl" onClick={() => handleEditArea(area)}>
                                        <Edit className="w-4 h-4 mr-1" /> Edit
                                    </Button>
                                    <AnalyticsButton 
                                        space={area} 
                                        variant="outline" 
                                        size="sm" 
                                        className="flex-1 border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-xl"
                                        showIcon={true}
                                    >
                                        <BarChart3 className="w-4 h-4 mr-1" /> Analytics
                                    </AnalyticsButton>
                                    <Button variant="destructive" size="sm" className="flex-1 rounded-xl" onClick={() => handleDeleteArea(area.id)}>
                                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    
                    {areas.length === 0 && (
                        <div className="md:col-span-3 text-center py-16 bg-[hsl(var(--muted)/0.3)] rounded-3xl border-2 border-dashed border-[hsl(var(--border))]">
                            <div className="w-20 h-20 mx-auto mb-6 bg-[hsl(var(--muted))] rounded-3xl flex items-center justify-center">
                                <Target className="w-10 h-10 text-[hsl(var(--primary))]" />
                            </div>
                            <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">No advertising areas yet</h3>
                            <p className="text-[hsl(var(--muted-foreground))] mb-6 text-lg max-w-md mx-auto">Create your first advertising space to start earning revenue from your property</p>
                            <Button onClick={handleAddNewArea} className="btn-gradient rounded-2xl px-8 py-3 font-bold shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand">
                                <Plus className="w-5 h-5 mr-2" />
                                Add the first area
                            </Button>
                        </div>
                    )}
                </div>

                <AreaFormModal
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setEditingArea(null); }}
                    onSuccess={handleFormSuccess}
                    propertyId={property.id}
                    initialData={editingArea}
                />
            </div>
        </div>
    );
}