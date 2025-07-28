import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Loader2, MapPin, Camera, Trash2, AlertTriangle, Building, Sparkles, Edit3, Target } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import GoogleMap from '@/pages/browse/components/GoogleMap';
import { Property } from '@/api/entities';
import { useUser } from '@clerk/clerk-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InvokeLLM, UploadFile } from '@/api/integrations';

const LocationPicker = ({ onLocationSelect, initialPosition }) => {
  const [position, setPosition] = useState(initialPosition);

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const newPosition = { lat, lng };
    setPosition(newPosition);
    onLocationSelect(newPosition);
  };

  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '1.5rem' }}>
      <GoogleMap
        center={position || { lat: 39.8283, lng: -98.5795 }}
        zoom={position ? 13 : 4}
        onClick={handleMapClick}
        markers={position ? [{ position, title: "Selected Location" }] : []}
        style={{ height: '100%', width: '100%', borderRadius: '1.5rem' }}
      />
    </div>
  );
};

const PhotoUploader = ({ photos, onPhotosChange, maxPhotos = 5, required = false, label = "Photos" }) => {
  const [uploading, setUploading] = useState(false);
  
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const result = await UploadFile({ file });
        return result.file_url;
      });
      
      const newUrls = await Promise.all(uploadPromises);
      const updatedPhotos = [...photos, ...newUrls].slice(0, maxPhotos);
      onPhotosChange(updatedPhotos);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(updatedPhotos);
  };

  return (
    <div>
      <Label className="text-base font-semibold text-muted-foreground mb-3 block">
        {label} {required && '*'} ({photos.length}/{maxPhotos})
      </Label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative group">
            <img 
              src={photo} 
              alt={`Photo ${index + 1}`}
              className="w-full h-32 object-cover rounded-2xl border-2 border-[hsl(var(--border))] shadow-lg group-hover:scale-105 transition-transform"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-lg"
              onClick={() => removePhoto(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        
        {photos.length < maxPhotos && (
          <label className="w-full h-32 border-2 border-dashed border-[hsl(var(--border))] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--muted))] transition-brand group">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
            ) : (
              <>
                <div className="w-12 h-12 bg-[hsl(var(--accent-light))] rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6 text-[hsl(var(--primary))]" />
                </div>
                <span className="text-sm font-medium text-[hsl(var(--primary))]">Add Photo</span>
              </>
            )}
          </label>
        )}
      </div>
      
      {required && photos.length === 0 && (
        <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          At least one photo is required
        </p>
      )}
    </div>
  );
};

export default function EditPropertyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [property, setProperty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    location: {
      address: '',
      city: '',
      zipcode: '',
      latitude: null,
      longitude: null,
    },
    photos: [],
    primary_image: ''
  });
  const [errors, setErrors] = useState({});
  const [isGeocoding, setIsGeocoding] = useState(false);

  const getPropertyId = () => {
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get('id') || urlParams.get('property_id');
  };

  useEffect(() => {
    loadProperty();
  }, []);

  const loadProperty = async () => {
    const propertyId = getPropertyId();
    
    if (!propertyId) {
      navigate(createPageUrl('Dashboard'));
      return;
    }

    setIsLoading(true);
    try {
      const prop = await Property.get(propertyId);
      setProperty(prop);
      setFormData({
        name: prop.name || '',
        type: prop.type || '',
        description: prop.description || '',
        location: prop.location || {
          address: '',
          city: '',
          zipcode: '',
          latitude: null,
          longitude: null,
        },
        photos: prop.photos || [],
        primary_image: prop.primary_image || ''
      });
    } catch (error) {
      console.error("Error loading property:", error);
      navigate(createPageUrl('Dashboard'));
    }
    setIsLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleLocationChange = (field, value) => {
    setFormData(prev => ({ ...prev, location: { ...prev.location, [field]: value } }));
    if (errors.location) setErrors(prev => ({ ...prev, location: null }));
  };

  const handlePhotosChange = (photos) => {
    setFormData(prev => ({ 
      ...prev, 
      photos: photos,
      primary_image: photos.length > 0 ? photos[0] : ''
    }));
    if (errors.photos) setErrors(prev => ({ ...prev, photos: null }));
  };

  const handleAddressBlur = async () => {
    const { address, city, zipcode } = formData.location;
    const fullAddress = `${address}, ${city} ${zipcode}`.trim().replace(/^,|,$/g, '').trim();

    if (fullAddress.length < 5) return;

    setIsGeocoding(true);
    try {
      const response = await InvokeLLM({
        prompt: `Find the geographic coordinates (latitude and longitude) for this address: ${fullAddress}.`,
        response_json_schema: {
          type: "object",
          properties: { latitude: { type: "number" }, longitude: { type: "number" } },
          required: ["latitude", "longitude"]
        },
        add_context_from_internet: true
      });
      if (response && response.latitude && response.longitude) {
        setFormData(prev => ({
          ...prev,
          location: { ...prev.location, latitude: response.latitude, longitude: response.longitude }
        }));
        if (errors.location) setErrors(prev => ({ ...prev, location: null }));
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleLocationSelect = async (latlng) => {
    setFormData(prev => ({ ...prev, location: { ...prev.location, latitude: latlng.lat, longitude: latlng.lng } }));
    if (errors.location) setErrors(prev => ({ ...prev, location: null }));

    setIsGeocoding(true);
    try {
      const response = await InvokeLLM({
        prompt: `Provide the street address, city, and zip code for these coordinates: latitude=${latlng.lat}, longitude=${latlng.lng}.`,
        response_json_schema: {
          type: "object",
          properties: { address: { type: "string" }, city: { type: "string" }, zipcode: { type: "string" } },
        },
        add_context_from_internet: true
      });

      if (response && response.address) {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            address: response.address || prev.location.address,
            city: response.city || prev.location.city,
            zipcode: response.zipcode || prev.location.zipcode,
          }
        }));
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Property name is required.';
    if (!formData.type) newErrors.type = 'Property type is required.';
    if (!formData.location.address.trim()) newErrors.location_address = 'Address is required.';
    if (formData.location.latitude === null || formData.location.longitude === null) {
      newErrors.location = 'Please select a location on the map.';
    }
    if (!formData.photos || formData.photos.length === 0) {
      newErrors.photos = 'At least one property photo is required.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      await Property.update(property.id, formData);
      navigate(`${createPageUrl('PropertyManagement')}?id=${property.id}`);
    } catch (error) {
      console.error("Failed to update property:", error);
      setErrors({ form: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-[var(--shadow-brand-lg)]">
            <Loader2 className="w-10 h-10 animate-spin text-white" />
          </div>
          <p className="text-muted-foreground font-semibold text-lg">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="card-brand glass-strong border-[hsl(var(--border))] rounded-3xl overflow-hidden shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-3xl flex items-center justify-center">
                <Building className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Property not found</h3>
              <p className="text-muted-foreground mb-6 text-lg">The property you're trying to edit doesn't exist or you don't have access to it.</p>
              <Link to={createPageUrl('Dashboard')}>
                <Button className="btn-gradient text-white rounded-2xl px-8 py-3 font-bold transition-brand">
                  Return to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-brand/20 rounded-3xl transform rotate-1"></div>
          <Card className="relative glass-strong border-[hsl(var(--border))] rounded-3xl overflow-hidden shadow-[var(--shadow-brand)]">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-center gap-6">
                <Link to={`${createPageUrl('PropertyManagement')}?id=${property.id}`}>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-[hsl(var(--muted))]">
                    <ArrowLeft className="w-6 h-6" />
                  </Button>
                </Link>
                <div className="w-16 h-16 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-[var(--shadow-brand-lg)]">
                  <Edit3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand">
                    Edit Property
                  </h1>
                  <p className="text-muted-foreground text-lg md:text-xl mt-2">
                    Update your property information and photos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Form */}
        <Card className="card-brand glass border-[hsl(var(--border))] rounded-3xl overflow-hidden shadow-lg">
          <CardHeader className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))] p-8">
            <CardTitle className="text-foreground text-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Building className="w-5 h-5 text-white" />
              </div>
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div>
              <Label htmlFor="name" className="text-base font-semibold text-muted-foreground mb-2 block">Property Name *</Label>
              <Input 
                id="name"
                value={formData.name} 
                onChange={(e) => handleInputChange('name', e.target.value)} 
                placeholder="e.g., The Grand Metro Building" 
                className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm focus-brand transition-brand"
              />
              {errors.name && <p className="text-red-500 text-sm mt-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="type" className="text-base font-semibold text-muted-foreground mb-2 block">Property Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 backdrop-blur-sm">
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent className="glass-strong border-[hsl(var(--border))] rounded-2xl">
                  <SelectItem value="building">Commercial Building</SelectItem>
                  <SelectItem value="vehicle_fleet">Vehicle Fleet</SelectItem>
                  <SelectItem value="event_venue">Event Venue</SelectItem>
                  <SelectItem value="transit_station">Transit Station</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-red-500 text-sm mt-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{errors.type}</p>}
            </div>

            <PhotoUploader
              photos={formData.photos || []}
              onPhotosChange={handlePhotosChange}
              maxPhotos={5}
              required={true}
              label="Property Photos"
            />
            {errors.photos && <p className="text-red-500 text-sm mt-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{errors.photos}</p>}

            <div>
              <Label htmlFor="address" className="text-base font-semibold text-muted-foreground mb-2 block">Street Address *</Label>
              <Input 
                id="address"
                value={formData.location.address} 
                onChange={(e) => handleLocationChange('address', e.target.value)} 
                onBlur={handleAddressBlur}
                placeholder="123 Main Street" 
                className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm focus-brand transition-brand"
              />
              {errors.location_address && <p className="text-red-500 text-sm mt-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{errors.location_address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="city" className="text-base font-semibold text-muted-foreground mb-2 block">City</Label>
                <Input 
                  id="city"
                  value={formData.location.city} 
                  onChange={(e) => handleLocationChange('city', e.target.value)} 
                  onBlur={handleAddressBlur}
                  placeholder="New York" 
                  className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm focus-brand transition-brand"
                />
              </div>
              <div>
                <Label htmlFor="zipcode" className="text-base font-semibold text-muted-foreground mb-2 block">Zip Code</Label>
                <Input 
                  id="zipcode"
                  value={formData.location.zipcode} 
                  onChange={(e) => handleLocationChange('zipcode', e.target.value)} 
                  onBlur={handleAddressBlur}
                  placeholder="10001" 
                  className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm focus-brand transition-brand"
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold text-muted-foreground mb-2 block">Property Location on Map *</Label>
              <p className="text-sm text-muted-foreground mb-3">Click on the map to update location or type an address above</p>
              <div className={`relative rounded-3xl overflow-hidden border-2 ${errors.location ? 'border-red-500' : 'border-[hsl(var(--border))]'} shadow-lg`}>
                <LocationPicker 
                  onLocationSelect={handleLocationSelect} 
                  initialPosition={formData.location.latitude && formData.location.longitude ? [formData.location.latitude, formData.location.longitude] : null}
                />
                {isGeocoding && (
                  <div className="absolute inset-0 bg-[hsl(var(--background))]/80 backdrop-blur-sm flex items-center justify-center z-[1000] rounded-3xl">
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--primary))] mx-auto mb-2" />
                      <p className="text-sm font-medium text-[hsl(var(--primary))]">Finding location...</p>
                    </div>
                  </div>
                )}
              </div>
              {errors.location && <p className="text-red-500 text-sm mt-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{errors.location}</p>}
            </div>

            <div>
              <Label htmlFor="description" className="text-base font-semibold text-muted-foreground mb-2 block">Property Description</Label>
              <Textarea 
                id="description"
                value={formData.description} 
                onChange={(e) => handleInputChange('description', e.target.value)} 
                placeholder="Describe your property, its location benefits, target audience reach, and any unique features that make it attractive to advertisers..."
                className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm focus-brand transition-brand resize-none"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Link to={`${createPageUrl('PropertyManagement')}?id=${property.id}`}>
            <Button variant="outline" className="w-full sm:w-auto border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-2xl px-8 py-3 font-bold">
              Cancel Changes
            </Button>
          </Link>
          
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl px-8 py-3 font-bold shadow-lg hover:shadow-xl transition-brand"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Enhanced Error Display */}
        {errors.form && (
          <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20 rounded-2xl">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="font-medium text-base">{errors.form}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}