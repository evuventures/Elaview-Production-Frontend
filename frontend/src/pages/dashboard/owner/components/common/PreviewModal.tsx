// src/pages/dashboard/components/common/PreviewModal.tsx
import React from 'react';
import { X, Download, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from './EmptyState';
import { formatFileSize } from '../../utils/fileUtils';
import type { CreativeAsset } from '../../types';

interface PreviewModalProps {
 creative: CreativeAsset | null;
 isOpen: boolean;
 onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
 creative,
 isOpen,
 onClose
}) => {
 if (!isOpen || !creative) return null;

 const handleDownload = () => {
 // Create a temporary link to download the file
 const link = document.createElement('a');
 link.href = creative.url;
 link.download = creative.name;
 link.target = '_blank';
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 };

 return (
 <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
 <div className="bg-gray-800 border border-gray-600 rounded-xl max-w-4xl max-h-[90vh] overflow-hidden">
 <div className="flex items-center justify-between p-4 border-b border-gray-600">
 <div>
 <h3 className="text-lg font-semibold text-white">{creative.name}</h3>
 <p className="text-sm text-gray-400">
 {formatFileSize(creative.size)} • {creative.type}
 </p>
 </div>
 <div className="flex items-center gap-2">
 <Button 
 variant="outline" 
 size={20} 
 onClick={handleDownload}
 className="text-gray-300 border-gray-600 hover:bg-gray-600"
>
 <Download className="w-4 h-4 mr-1" />
 Download
 </Button>
 <Button 
 variant="ghost" 
 size={20} 
 onClick={onClose}
 className="text-gray-400 hover:text-white"
>
 <X className="w-5 h-5" />
 </Button>
 </div>
 </div>
 
 <div className="p-4 max-h-[70vh] overflow-auto">
 {creative.type === 'image' && (
 <img 
 src={creative.url} 
 alt={creative.name}
 className="max-w-full max-h-full mx-auto rounded-lg"
 />
 )}
 
 {creative.type === 'video' && (
 <video 
 src={creative.url} 
 controls
 className="max-w-full max-h-full mx-auto rounded-lg"
>
 Your browser does not support the video tag.
 </video>
 )}
 
 {creative.type === 'document' && (
 <div className="py-8">
 <EmptyState
 icon={File}
 title="Document Preview"
 description="Cannot preview this file type directly"
 actionButton={
 <Button 
 variant="outline" 
 onClick={handleDownload}
 className="border-gray-600 text-gray-300 hover:bg-gray-600"
>
 <Download className="w-4 h-4 mr-2" />
 Download File
 </Button>
 }
 />
 </div>
 )}
 </div>
 </div>
 </div>
 );
};