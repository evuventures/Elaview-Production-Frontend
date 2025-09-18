import React from 'react';
import { 
 Clock, Package, Truck, CheckCircle, AlertCircle, Wrench, 
 Camera, Phone, MessageCircle, Calendar, User, MapPin
} from 'lucide-react';
import { InstallationStatusTrackerProps } from '../types';
import { 
 getInstallationStatusBadge, 
 formatDeliveryDate, 
 calculateDaysUntilDeadline,
 getInstallerTypeDisplay 
} from '../utils';

export const InstallationStatusTracker: React.FC<InstallationStatusTrackerProps> = ({ 
 booking, 
 onRequestUpdate, 
 onContactOwner, 
 onViewPhotos, 
 onReportIssue 
}) => {
 const installationBadge = getInstallationStatusBadge(booking.installationStatus);
 const daysUntilDeadline = booking.installDeadline ? 
 calculateDaysUntilDeadline(booking.installDeadline) : null;
 
 // Define installation steps with dynamic status
 const installationSteps = [
 {
 id: 'materials_delivered',
 title: 'Materials Delivered',
 status: booking.materialStatus === 'DELIVERED' || booking.materialStatus === 'INSTALLED' ? 'completed' : 
 booking.materialStatus === 'SHIPPED' ? 'in_progress' : 'pending',
 timestamp: booking.materialDeliveredAt,
 icon: Package,
 description: 'Materials arrived at property location'
 },
 {
 id: 'installation_scheduled',
 title: 'Installation Scheduled',
 status: booking.scheduledInstallDate ? 'completed' : 
 booking.materialStatus === 'DELIVERED' ? 'pending' : 'disabled',
 timestamp: booking.scheduledInstallDate,
 icon: Calendar,
 description: booking.scheduledInstallDate ? 
 `Scheduled for ${new Date(booking.scheduledInstallDate).toLocaleDateString()}` :
 'Awaiting scheduling by property owner'
 },
 {
 id: 'installation_started',
 title: 'Installation Started',
 status: booking.installationStatus === 'IN_PROGRESS' || booking.installationStatus === 'COMPLETED' ? 'completed' :
 booking.installationStatus === 'SCHEDULED' || booking.installationStatus === 'MATERIALS_READY' ? 'pending' : 'disabled',
 timestamp: booking.installationStartedAt,
 icon: Wrench,
 description: 'Property owner began installation process'
 },
 {
 id: 'installation_completed',
 title: 'Installation Completed',
 status: booking.installationStatus === 'COMPLETED' ? 'completed' : 
 booking.installationStatus === 'IN_PROGRESS' ? 'in_progress' : 'pending',
 timestamp: booking.installationCompletedAt,
 icon: CheckCircle,
 description: 'Installation finished and verified'
 },
 {
 id: 'photos_verified',
 title: 'Photos Verified',
 status: booking.verificationImageUrl ? 'completed' : 
 booking.installationStatus === 'COMPLETED' ? 'pending' : 'disabled',
 timestamp: booking.photosVerifiedAt,
 icon: Camera,
 description: booking.verificationImageUrl ? 
 'Installation photos approved' : 
 'Awaiting verification photos'
 }
 ];

 const getStepStatusColor = (status: string) => {
 switch(status) {
 case 'completed': return 'bg-green-100 text-green-800 border-green-200';
 case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
 case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
 default: return 'bg-gray-100 text-gray-500 border-gray-200';
 }
 };

 const getStepIconColor = (status: string) => {
 switch(status) {
 case 'completed': return 'text-green-600 bg-green-100';
 case 'in_progress': return 'text-blue-600 bg-blue-100';
 case 'pending': return 'text-yellow-600 bg-yellow-100';
 default: return 'text-gray-400 bg-gray-100';
 }
 };

 return (
 <div className="bg-white rounded-lg border border-gray-200 p-6">
 {/* Header */}
 <div className="flex items-center justify-between mb-6">
 <div>
 <h3 className="text-lg font-semibold text-gray-900 flex items-center">
 <Wrench className="w-5 h-5 mr-2 text-gray-600" />
 Installation Progress
 </h3>
 <p className="text-sm text-gray-600 mt-1">
 Track your campaign installation from delivery to completion
 </p>
 </div>
 
 {/* Current Status Badge */}
 <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${installationBadge.color}`}>
 <installationBadge.icon className="w-4 h-4 mr-1" />
 {installationBadge.text}
 </span>
 </div>

 {/* Deadline Warning */}
 {daysUntilDeadline !== null && daysUntilDeadline <= 3 && booking.installationStatus !== 'COMPLETED' && (
 <div className={`mb-6 p-4 rounded-lg border ${
 daysUntilDeadline < 0 ? 'bg-red-50 border-red-200' : 
 daysUntilDeadline <= 1 ? 'bg-orange-50 border-orange-200' : 
 'bg-yellow-50 border-yellow-200'
 }`}>
 <div className="flex items-center">
 <AlertCircle className={`w-5 h-5 mr-2 ${
 daysUntilDeadline < 0 ? 'text-red-600' : 
 daysUntilDeadline <= 1 ? 'text-orange-600' : 
 'text-yellow-600'
 }`} />
 <div className="flex-1">
 <p className={`font-medium ${
 daysUntilDeadline < 0 ? 'text-red-800' : 
 daysUntilDeadline <= 1 ? 'text-orange-800' : 
 'text-yellow-800'
 }`}>
 {daysUntilDeadline < 0 ? 'Installation Overdue' : 
 daysUntilDeadline === 0 ? 'Installation Due Today' : 
 `Installation Due in ${daysUntilDeadline} Day${daysUntilDeadline> 1 ? 's' : ''}`}
 </p>
 <p className={`text-sm ${
 daysUntilDeadline < 0 ? 'text-red-700' : 
 daysUntilDeadline <= 1 ? 'text-orange-700' : 
 'text-yellow-700'
 }`}>
 Campaign start date: {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}
 </p>
 </div>
 {daysUntilDeadline <= 1 && (
 <button
 onClick={onContactOwner}
 className={`px-3 py-1 rounded text-sm font-medium ${
 daysUntilDeadline < 0 ? 'bg-red-600 text-white hover:bg-red-700' : 
 'bg-orange-600 text-white hover:bg-orange-700'
 }`}
>
 Contact Owner
 </button>
 )}
 </div>
 </div>
 )}

 {/* Installation Timeline */}
 <div className="space-y-4 mb-6">
 {installationSteps.map((step, index) => (
 <div key={step.id} className="flex items-start">
 {/* Timeline Line */}
 <div className="flex flex-col items-center mr-4">
 <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getStepIconColor(step.status)}`}>
 <step.icon className="w-5 h-5" />
 </div>
 {index < installationSteps.length - 1 && (
 <div className={`w-0.5 h-8 mt-2 ${
 step.status === 'completed' ? 'bg-green-300' : 'bg-gray-300'
 }`} />
 )}
 </div>
 
 {/* Step Content */}
 <div className="flex-1 min-w-0">
 <div className={`p-3 rounded-lg border ${getStepStatusColor(step.status)}`}>
 <div className="flex items-center justify-between mb-1">
 <h4 className="font-medium">{step.title}</h4>
 {step.timestamp && (
 <span className="text-xs opacity-75">
 {formatDeliveryDate(step.timestamp)}
 </span>
 )}
 </div>
 <p className="text-sm opacity-90">{step.description}</p>
 
 {/* Step-specific Actions */}
 {step.id === 'materials_delivered' && step.status === 'completed' && !booking.scheduledInstallDate && (
 <button
 onClick={onRequestUpdate}
 className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
>
 Request Schedule Update →
 </button>
 )}
 
 {step.id === 'installation_completed' && step.status === 'completed' && !booking.verificationImageUrl && (
 <button
 onClick={() => onRequestUpdate()}
 className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
>
 Request Verification Photos →
 </button>
 )}
 
 {step.id === 'photos_verified' && step.status === 'completed' && (
 <button
 onClick={onViewPhotos}
 className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
>
 View Installation Photos →
 </button>
 )}
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* Installation Details */}
 <div className="bg-gray-50 rounded-lg p-4 mb-6">
 <h4 className="font-medium text-gray-900 mb-3">Installation Details</h4>
 <div className="grid grid-cols-2 gap-4 text-sm">
 <div>
 <p className="text-gray-600">Installation Type</p>
 <p className="font-medium">{getInstallerTypeDisplay(booking.installerType)}</p>
 </div>
 <div>
 <p className="text-gray-600">Estimated Duration</p>
 <p className="font-medium">{booking.estimatedInstallTime || 30} minutes</p>
 </div>
 <div>
 <p className="text-gray-600">Property Owner</p>
 <p className="font-medium flex items-center">
 <User className="w-3 h-3 mr-1" />
 {booking.propertyOwnerName || 'N/A'}
 </p>
 </div>
 <div>
 <p className="text-gray-600">Location</p>
 <p className="font-medium flex items-center">
 <MapPin className="w-3 h-3 mr-1" />
 {booking.location || 'N/A'}
 </p>
 </div>
 </div>
 
 {/* Professional Installer Info */}
 {booking.installerType === 'PLATFORM_INSTALLER' && booking.installerDetails && (
 <div className="mt-4 pt-4 border-t border-gray-200">
 <p className="text-gray-600 text-sm mb-2">Professional Installer</p>
 <div className="flex items-center justify-between">
 <div className="flex items-center">
 <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
 <User className="w-4 h-4 text-gray-600" />
 </div>
 <div>
 <p className="font-medium">{booking.installerDetails.name}</p>
 <p className="text-xs text-gray-600">
 ⭐ {booking.installerDetails.rating} ({booking.installerDetails.reviewCount} reviews)
 </p>
 </div>
 </div>
 <button
 onClick={() => console.log('Contact installer:', booking.installerDetails?.id)}
 className="text-sm text-teal-600 hover:text-teal-700 font-medium"
>
 Contact
 </button>
 </div>
 </div>
 )}
 </div>

 {/* Action Buttons */}
 <div className="flex gap-3">
 <button
 onClick={onContactOwner}
 className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors inline-flex items-center justify-center"
>
 <MessageCircle className="w-4 h-4 mr-2" />
 Message Owner
 </button>
 
 {booking.installationStatus === 'FAILED' || booking.installationStatus === 'NEEDS_REWORK' ? (
 <button
 onClick={onReportIssue}
 className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center justify-center"
>
 <AlertCircle className="w-4 h-4 mr-2" />
 Report Issue
 </button>
 ) : (
 <button
 onClick={onRequestUpdate}
 className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center justify-center"
>
 <Phone className="w-4 h-4 mr-2" />
 Request Update
 </button>
 )}
 
 {booking.verificationImageUrl && (
 <button
 onClick={onViewPhotos}
 className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors inline-flex items-center justify-center"
>
 <Camera className="w-4 h-4 mr-2" />
 View Photos
 </button>
 )}
 </div>

 {/* Installation Issues */}
 {(booking.installationStatus === 'FAILED' || booking.installationStatus === 'NEEDS_REWORK') && (
 <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
 <div className="flex items-start">
 <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
 <div className="flex-1">
 <h4 className="font-medium text-red-800">Installation Issue</h4>
 <p className="text-sm text-red-700 mt-1">
 {booking.installationNotes || 
 'There was an issue with the installation. Please contact the property owner or our support team.'}
 </p>
 <div className="mt-3 flex gap-2">
 <button
 onClick={onReportIssue}
 className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
>
 Get Help
 </button>
 <button
 onClick={onContactOwner}
 className="text-sm bg-white text-red-600 border border-red-300 px-3 py-1 rounded hover:bg-red-50"
>
 Contact Owner
 </button>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};