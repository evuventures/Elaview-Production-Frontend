// src/components/new-listings/PhotoUploader.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle, Camera, Trash2 } from 'lucide-react';
import { UploadFile } from '@/api/integrations';

// Type assertions for JSX components
const ButtonComponent = Button as React.ComponentType<any>;
const LabelComponent = Label as React.ComponentType<any>;

interface PhotoUploaderProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  required?: boolean;
  label?: string;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 5, 
  required = false, 
  label = "Photos" 
}) => {
  const [uploading, setUploading] = useState<boolean>(false);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
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

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(updatedPhotos);
  };

  return (
    <div>
      <LabelComponent className="text-base font-semibold text-muted-foreground mb-3 block">
        {label} {required && '*'} ({photos.length}/{maxPhotos})
      </LabelComponent>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative group">
            <img 
              src={photo} 
              alt={`Photo ${index + 1}`}
              className="w-full h-32 object-cover rounded-2xl border-2 border-[hsl(var(--border))] shadow-lg"
            />
            <ButtonComponent
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-lg"
              onClick={() => removePhoto(index)}
            >
              <Trash2 className="w-4 h-4" />
            </ButtonComponent>
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

export default PhotoUploader;