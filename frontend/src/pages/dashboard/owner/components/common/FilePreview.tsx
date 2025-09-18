// src/pages/dashboard/components/common/FilePreview.tsx
import React from 'react';
import { FileImage, Video, File, Play } from 'lucide-react';
import type { CreativeAsset } from '../../types';

interface FilePreviewProps {
 creative: CreativeAsset;
 size?: 'small' | 'large';
 showPlayIcon?: boolean;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ 
 creative, 
 size = 'small',
 showPlayIcon = true
}) => {
 const dimensions = size === 'large' ? 'w-24 h-24' : 'w-10 h-10';
 
 if (creative.type === 'image') {
 return (
 <div className={`${dimensions} rounded-lg overflow-hidden bg-gray-600 flex-shrink-0`}>
 <img 
 src={creative.url} 
 alt={creative.name}
 className="w-full h-full object-cover"
 onError={(e) => {
 // Fallback to icon if image fails to load
 const target = e.target as HTMLImageElement;
 target.style.display = 'none';
 target.nextElementSibling?.classList.remove('hidden');
 }}
 />
 <div className="hidden w-full h-full flex items-center justify-center">
 <FileImage className="w-6 h-6 text-gray-400" />
 </div>
 </div>
 );
 }
 
 if (creative.type === 'video') {
 return (
 <div className={`${dimensions} rounded-lg overflow-hidden bg-gray-600 flex-shrink-0 relative`}>
 <video 
 src={creative.url} 
 className="w-full h-full object-cover"
 muted
 onError={(e) => {
 // Fallback to icon if video fails to load
 const target = e.target as HTMLVideoElement;
 target.style.display = 'none';
 target.nextElementSibling?.classList.remove('hidden');
 }}
 />
 <div className="hidden w-full h-full flex items-center justify-center absolute inset-0">
 <Video className="w-6 h-6 text-gray-400" />
 </div>
 {showPlayIcon && (
 <div className="absolute inset-0 flex items-center justify-center bg-black/30">
 <Play className="w-4 h-4 text-white" />
 </div>
 )}
 </div>
 );
 }
 
 // Document fallback
 return (
 <div className={`${dimensions} bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0`}>
 <File className="w-6 h-6 text-gray-400" />
 </div>
 );
};