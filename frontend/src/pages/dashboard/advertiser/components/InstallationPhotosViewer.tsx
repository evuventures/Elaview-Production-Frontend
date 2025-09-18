import React, { useState } from 'react';
import { 
 Camera, X, Download, ZoomIn, ZoomOut, RotateCcw, 
 CheckCircle, AlertCircle, MessageCircle, Calendar,
 ChevronLeft, ChevronRight, Maximize2
} from 'lucide-react';
import { InstallationPhotosViewerProps } from '../types';

export const InstallationPhotosViewer: React.FC<InstallationPhotosViewerProps> = ({ 
 booking, 
 showModal, 
 onClose, 
 onRequestRetake, 
 onApprovePhotos, 
 onReportIssue 
}) => {
 const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
 const [zoomLevel, setZoomLevel] = useState(1);
 const [showFullscreen, setShowFullscreen] = useState(false);

 if (!showModal) return null;

 // Combine all available photos
 const allPhotos = [
 ...(booking.installationPhotos || []),
 ...(booking.verificationImageUrl ? [booking.verificationImageUrl] : [])
 ];

 const beforePhotos = booking.beforePhotos || [];
 const afterPhotos = booking.afterPhotos || [];
 const hasBeforeAfter = beforePhotos.length> 0 && afterPhotos.length> 0;

 const currentPhoto = allPhotos[currentPhotoIndex];
 const isVerificationPhoto = currentPhoto === booking.verificationImageUrl;

 // Photo navigation
 const nextPhoto = () => {
 setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length);
 };

 const prevPhoto = () => {
 setCurrentPhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
 };

 // Zoom controls
 const zoomIn = () => setZoomLevel(prev => Math.min(prev * 1.5, 3));
 const zoomOut = () => setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
 const resetZoom = () => setZoomLevel(1);

 const downloadPhoto = (url: string, filename: string) => {
 const link = document.createElement('a');
 link.href = url;
 link.download = filename;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 };

 return (
 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
 <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
 
 {/* Header */}
 <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6">
 <div className="flex justify-between items-start">
 <div>
 <h2 className="text-2xl font-bold mb-2">Installation Photos</h2>
 <p className="text-teal-100">
 {booking.spaceName} • {booking.location}
 </p>
 {booking.installationCompletedAt && (
 <p className="text-teal-200 text-sm mt-1 flex items-center">
 <Calendar className="w-4 h-4 mr-1" />
 Completed: {new Date(booking.installationCompletedAt).toLocaleDateString()}
 </p>
 )}
 </div>
 <button 
 onClick={onClose}
 className="text-white hover:text-teal-100 p-2"
>
 <X className="w-6 h-6" />
 </button>
 </div>
 </div>

 <div className="flex h-[calc(90vh-120px)]">
 {/* Main Photo Viewer */}
 <div className="flex-1 flex flex-col">
 
 {/* Photo Controls */}
 <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
 <div className="flex items-center space-x-2">
 <span className="text-sm text-gray-600">
 {currentPhotoIndex + 1} of {allPhotos.length}
 </span>
 {isVerificationPhoto && (
 <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
 Verification Photo
 </span>
 )}
 </div>
 
 <div className="flex items-center space-x-2">
 <button
 onClick={zoomOut}
 className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
 disabled={zoomLevel <= 0.5}
>
 <ZoomOut className="w-4 h-4" />
 </button>
 <span className="text-sm text-gray-600 min-w-[60px] text-center">
 {Math.round(zoomLevel * 100)}%
 </span>
 <button
 onClick={zoomIn}
 className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
 disabled={zoomLevel>= 3}
>
 <ZoomIn className="w-4 h-4" />
 </button>
 <button
 onClick={resetZoom}
 className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
>
 <RotateCcw className="w-4 h-4" />
 </button>
 <div className="w-px h-6 bg-gray-300" />
 <button
 onClick={() => setShowFullscreen(true)}
 className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
>
 <Maximize2 className="w-4 h-4" />
 </button>
 <button
 onClick={() => downloadPhoto(currentPhoto, `installation-photo-${currentPhotoIndex + 1}.jpg`)}
 className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
>
 <Download className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* Photo Display */}
 <div className="flex-1 relative overflow-hidden bg-gray-100">
 {currentPhoto ? (
 <div className="w-full h-full flex items-center justify-center">
 <img
 src={currentPhoto}
 alt={`Installation photo ${currentPhotoIndex + 1}`}
 className="max-w-full max-h-full object-contain transition-transform duration-200"
 style={{ transform: `scale(${zoomLevel})` }}
 />
 </div>
 ) : (
 <div className="w-full h-full flex items-center justify-center text-gray-500">
 <div className="text-center">
 <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
 <p>No photos available</p>
 </div>
 </div>
 )}

 {/* Navigation Arrows */}
 {allPhotos.length> 1 && (
 <>
 <button
 onClick={prevPhoto}
 className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
>
 <ChevronLeft className="w-6 h-6" />
 </button>
 <button
 onClick={nextPhoto}
 className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
>
 <ChevronRight className="w-6 h-6" />
 </button>
 </>
 )}
 </div>

 {/* Photo Thumbnails */}
 {allPhotos.length> 1 && (
 <div className="p-4 bg-gray-50 border-t">
 <div className="flex space-x-2 overflow-x-auto">
 {allPhotos.map((photo, index) => (
 <button
 key={index}
 onClick={() => setCurrentPhotoIndex(index)}
 className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
 index === currentPhotoIndex 
 ? 'border-teal-500 ring-2 ring-teal-200' 
 : 'border-gray-300 hover:border-gray-400'
 }`}
>
 <img
 src={photo}
 alt={`Thumbnail ${index + 1}`}
 className="w-full h-full object-cover"
 />
 </button>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* Right Sidebar - Photo Details & Actions */}
 <div className="w-80 bg-gray-50 border-l flex flex-col">
 <div className="p-6 flex-1">
 
 {/* Photo Status */}
 <div className="mb-6">
 <h3 className="font-semibold text-gray-900 mb-3">Photo Status</h3>
 {booking.verificationImageUrl ? (
 <div className="bg-green-50 border border-green-200 rounded-lg p-3">
 <div className="flex items-center mb-2">
 <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
 <span className="font-medium text-green-800">Photos Verified</span>
 </div>
 <p className="text-sm text-green-700">
 Installation has been verified and approved. Your campaign is ready to start!
 </p>
 </div>
 ) : (
 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
 <div className="flex items-center mb-2">
 <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
 <span className="font-medium text-yellow-800">Awaiting Verification</span>
 </div>
 <p className="text-sm text-yellow-700">
 Installation photos are being reviewed. You'll be notified once approved.
 </p>
 </div>
 )}
 </div>

 {/* Before/After Comparison */}
 {hasBeforeAfter && (
 <div className="mb-6">
 <h3 className="font-semibold text-gray-900 mb-3">Before & After</h3>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <p className="text-xs text-gray-600 mb-1">Before</p>
 <img
 src={beforePhotos[0]}
 alt="Before installation"
 className="w-full h-20 object-cover rounded"
 />
 </div>
 <div>
 <p className="text-xs text-gray-600 mb-1">After</p>
 <img
 src={afterPhotos[0]}
 alt="After installation"
 className="w-full h-20 object-cover rounded"
 />
 </div>
 </div>
 </div>
 )}

 {/* Installation Details */}
 <div className="mb-6">
 <h3 className="font-semibold text-gray-900 mb-3">Installation Details</h3>
 <div className="space-y-2 text-sm">
 <div className="flex justify-between">
 <span className="text-gray-600">Material Type:</span>
 <span className="font-medium">{booking.materialType || 'N/A'}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-gray-600">Dimensions:</span>
 <span className="font-medium">{booking.dimensions || 'N/A'}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-gray-600">Installer:</span>
 <span className="font-medium">
 {booking.installerType === 'SELF_INSTALL' ? 'Property Owner' : 
 booking.installerDetails?.name || 'Professional'}
 </span>
 </div>
 {booking.installationCompletedAt && (
 <div className="flex justify-between">
 <span className="text-gray-600">Completed:</span>
 <span className="font-medium">
 {new Date(booking.installationCompletedAt).toLocaleDateString()}
 </span>
 </div>
 )}
 </div>
 </div>

 {/* Installation Notes */}
 {booking.installationNotes && (
 <div className="mb-6">
 <h3 className="font-semibold text-gray-900 mb-3">Installation Notes</h3>
 <div className="bg-gray-100 rounded-lg p-3">
 <p className="text-sm text-gray-700">{booking.installationNotes}</p>
 </div>
 </div>
 )}
 </div>

 {/* Action Buttons */}
 <div className="p-6 border-t bg-white space-y-3">
 {!booking.verificationImageUrl && (
 <>
 <button
 onClick={onRequestRetake}
 className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors inline-flex items-center justify-center"
>
 <Camera className="w-4 h-4 mr-2" />
 Request Better Photos
 </button>
 <button
 onClick={onApprovePhotos}
 className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center justify-center"
>
 <CheckCircle className="w-4 h-4 mr-2" />
 Approve Installation
 </button>
 </>
 )}
 
 <button
 onClick={onReportIssue}
 className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center justify-center"
>
 <MessageCircle className="w-4 h-4 mr-2" />
 Report Issue
 </button>
 
 <button
 onClick={() => {
 allPhotos.forEach((photo, index) => {
 downloadPhoto(photo, `installation-photo-${index + 1}.jpg`);
 });
 }}
 className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors inline-flex items-center justify-center"
>
 <Download className="w-4 h-4 mr-2" />
 Download All Photos
 </button>
 </div>
 </div>
 </div>
 </div>

 {/* Fullscreen Modal */}
 {showFullscreen && currentPhoto && (
 <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
 <button
 onClick={() => setShowFullscreen(false)}
 className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
>
 <X className="w-8 h-8" />
 </button>
 <img
 src={currentPhoto}
 alt="Fullscreen view"
 className="max-w-full max-h-full object-contain"
 />
 </div>
 )}
 </div>
 );
};