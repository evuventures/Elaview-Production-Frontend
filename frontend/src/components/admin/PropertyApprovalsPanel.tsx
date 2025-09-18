// src/components/admin/PropertyApprovalsPanel.tsx
import React, { useState, useEffect } from 'react';
import { PropertyApproval, Property } from '@/api/entities';
import { SendEmail } from '@/api/integrations';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
 CheckCircle, 
 XCircle, 
 Clock, 
 FileText, 
 MapPin, 
 User as UserIcon,
 Mail,
 ExternalLink,
 AlertTriangle,
 Building,
 Calendar,
 Loader2
} from 'lucide-react';
import { format } from 'date-fns';

// Type assertions for JSX components
const ButtonComponent = Button as React.ComponentType<any>;
const CardComponent = Card as React.ComponentType<any>;
const CardContentComponent = CardContent as React.ComponentType<any>;
const CardHeaderComponent = CardHeader as React.ComponentType<any>;
const CardTitleComponent = CardTitle as React.ComponentType<any>;
const BadgeComponent = Badge as React.ComponentType<any>;
const TextareaComponent = Textarea as React.ComponentType<any>;
const AlertComponent = Alert as React.ComponentType<any>;
const AlertDescriptionComponent = AlertDescription as React.ComponentType<any>;

// ✅ TypeScript interfaces
interface PropertyLocation {
 address?: string;
 city?: string;
 state?: string;
 zipcode?: string;
 latitude?: number;
 longitude?: number;
}

interface PropertyData {
 id: string;
 name: string;
 type: string;
 description?: string;
 location?: PropertyLocation;
 status: 'draft' | 'pending' | 'approved' | 'rejected' | 'listed';
 owner_id: string;
 created_date?: string;
 updated_date?: string;
}

interface UserData {
 id: string;
 full_name: string;
 email: string;
 phone?: string;
 first_name?: string;
 last_name?: string;
}

interface PropertyApprovalData {
 id: string;
 property_id: string;
 owner_id: string;
 status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
 created_date: string;
 reviewed_by?: string;
 reviewed_date?: string;
 rejection_reason?: string;
 compliance_notes?: string;
 submitted_documents?: string[];
}

interface EmailParams {
 to: string;
 subject: string;
 body: string;
}

interface ProcessingState {
 [key: string]: boolean;
}

const PropertyApprovalsPanel: React.FC = () => {
 const { user } = useUser();
 
 const [approvals, setApprovals] = useState<PropertyApprovalData[]>([]);
 const [properties, setProperties] = useState<Record<string, PropertyData>>({});
 const [users, setUsers] = useState<Record<string, UserData>>({});
 const [isLoading, setIsLoading] = useState<boolean>(true);
 const [processingId, setProcessingId] = useState<string | null>(null);

 useEffect(() => {
 loadApprovals();
 }, []);

 const loadApprovals = async (): Promise<void> => {
 setIsLoading(true);
 try {
 // Note: Assuming User is available from entities, if not we'll need to import it
 const [approvalsData, propertiesData] = await Promise.all([
 PropertyApproval.list(),
 Property.list(),
 // User.list() // Uncomment when User entity is available
 ]);

 setApprovals(approvalsData || []);
 
 // Create properties lookup map
 const propertiesMap: Record<string, PropertyData> = {};
 (propertiesData || []).forEach((prop: PropertyData) => {
 propertiesMap[prop.id] = prop;
 });
 setProperties(propertiesMap);

 // Create users lookup map
 const usersMap: Record<string, UserData> = {};
 // TODO: Replace with actual User.list() when available
 // (usersData || []).forEach((user: UserData) => {
 // usersMap[user.id] = user;
 // });
 setUsers(usersMap);
 } catch (error) {
 console.error('Error loading approvals:', error);
 }
 setIsLoading(false);
 };

 const sendApprovalEmail = async (owner: UserData, property: PropertyData): Promise<void> => {
 const emailParams: EmailParams = {
 to: owner.email,
 subject: `Property Approved - ${property.name}`,
 body: `
 <h2>Great News! Your Property Has Been Approved</h2>
 
 <p>Hello ${owner.full_name},</p>
 
 <p>We're excited to inform you that your property "<strong>${property.name}</strong>" has been approved and is now live on the Elaview platform!</p>
 
 <h3>What's Next?</h3>
 <ul>
 <li>Your property is now visible to advertisers browsing our platform</li>
 <li>You can manage your listing through your dashboard</li>
 <li>You'll receive notifications when advertisers are interested in your spaces</li>
 </ul>
 
 <p>Thank you for choosing Elaview for your advertising space needs. We look forward to helping you connect with great brands!</p>
 
 <p><a href="${window.location.origin}/dashboard">View Your Dashboard</a></p>
 
 <p>Best regards,<br>The Elaview Team</p>
 `
 };

 await SendEmail(emailParams);
 };

 const sendRejectionEmail = async (owner: UserData, property: PropertyData, reason: string): Promise<void> => {
 const emailParams: EmailParams = {
 to: owner.email,
 subject: `Property Review Update - ${property.name}`,
 body: `
 <h2>Property Review Update</h2>
 
 <p>Hello ${owner.full_name},</p>
 
 <p>Thank you for submitting your property "<strong>${property.name}</strong>" for review.</p>
 
 <p>After careful consideration, we need some additional information or modifications before we can approve your listing.</p>
 
 <h3>Feedback:</h3>
 <p>${reason}</p>
 
 <h3>Next Steps:</h3>
 <ul>
 <li>Please review the feedback above</li>
 <li>Make any necessary adjustments to your property or documentation</li>
 <li>You can resubmit your property through your dashboard</li>
 </ul>
 
 <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
 
 <p><a href="${window.location.origin}/dashboard">Access Your Dashboard</a></p>
 
 <p>Best regards,<br>The Elaview Team</p>
 `
 };

 await SendEmail(emailParams);
 };

 const handleApprove = async (approval: PropertyApprovalData): Promise<void> => {
 setProcessingId(approval.id);
 try {
 if (!user?.id) {
 throw new Error('User not authenticated');
 }
 
 // Update approval status
 await PropertyApproval.update(approval.id, {
 status: 'approved',
 reviewed_by: user.id,
 reviewed_date: new Date().toISOString()
 });

 // Update property status to listed
 await Property.update(approval.property_id, {
 status: 'listed'
 });

 // Send approval email to property owner
 const property = properties[approval.property_id];
 const owner = users[approval.owner_id];
 
 if (owner && property) {
 await sendApprovalEmail(owner, property);
 }

 await loadApprovals();
 } catch (error) {
 console.error('Error approving property:', error);
 const errorMessage = error instanceof Error ? error.message : 'Error approving property. Please try again.';
 alert(errorMessage);
 }
 setProcessingId(null);
 };

 const handleReject = async (approval: PropertyApprovalData, reason: string): Promise<void> => {
 setProcessingId(approval.id);
 try {
 if (!user?.id) {
 throw new Error('User not authenticated');
 }
 
 // Update approval status
 await PropertyApproval.update(approval.id, {
 status: 'rejected',
 reviewed_by: user.id,
 reviewed_date: new Date().toISOString(),
 rejection_reason: reason
 });

 // Update property status to rejected
 await Property.update(approval.property_id, {
 status: 'rejected'
 });

 // Send rejection email to property owner
 const property = properties[approval.property_id];
 const owner = users[approval.owner_id];
 
 if (owner && property) {
 await sendRejectionEmail(owner, property, reason);
 }

 await loadApprovals();
 } catch (error) {
 console.error('Error rejecting property:', error);
 const errorMessage = error instanceof Error ? error.message : 'Error rejecting property. Please try again.';
 alert(errorMessage);
 }
 setProcessingId(null);
 };

 const handleRejectWithPrompt = (approval: PropertyApprovalData): void => {
 const reason = prompt('Please provide a reason for rejection:');
 if (reason && reason.trim()) {
 handleReject(approval, reason);
 }
 };

 const getStatusColor = (status: PropertyApprovalData['status']): string => {
 const colors: Record<PropertyApprovalData['status'], string> = {
 'pending': 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]',
 'approved': 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]',
 'rejected': 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]',
 'needs_revision': 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-[hsl(var(--primary))]'
 };
 return colors[status] || colors['pending'];
 };

 const formatDate = (dateString: string): string => {
 try {
 return format(new Date(dateString), 'MMM d, yyyy');
 } catch (error) {
 console.error('Error formatting date:', error);
 return 'Invalid date';
 }
 };

 if (isLoading) {
 return (
 <div className="flex items-center justify-center p-8">
 <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
 </div>
 );
 }

 const pendingApprovals = approvals.filter(a => a.status === 'pending');

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Property Approvals</h2>
 <BadgeComponent variant="outline" className="bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]">
 {pendingApprovals.length} Pending
 </BadgeComponent>
 </div>

 {pendingApprovals.length === 0 ? (
 <CardComponent className="glass border-[hsl(var(--border))] rounded-2xl">
 <CardContentComponent className="p-8 text-center">
 <CheckCircle className="w-16 h-16 text-[hsl(var(--success))] mx-auto mb-4" />
 <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">All Caught Up!</h3>
 <p className="text-muted-foreground">No property approvals pending at this time.</p>
 </CardContentComponent>
 </CardComponent>
 ) : (
 <div className="space-y-6">
 {pendingApprovals.map((approval) => {
 const property = properties[approval.property_id];
 const owner = users[approval.owner_id];
 
 if (!property) {
 return (
 <CardComponent key={approval.id} className="glass border-[hsl(var(--border))] rounded-2xl">
 <CardContentComponent className="p-6">
 <AlertComponent className="border-[hsl(var(--warning))] bg-[hsl(var(--warning))]/10">
 <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />
 <AlertDescriptionComponent className="text-[hsl(var(--warning))]">
 Property data not found for approval ID: {approval.id}
 </AlertDescriptionComponent>
 </AlertComponent>
 </CardContentComponent>
 </CardComponent>
 );
 }

 return (
 <CardComponent key={approval.id} className="glass border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-[var(--shadow-brand)]">
 <CardHeaderComponent className="bg-gradient-to-r from-[hsl(var(--muted))]/80 to-[hsl(var(--accent-light))]/30 border-b border-[hsl(var(--border))]">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-[var(--shadow-brand)]">
 <Building className="w-6 h-6 text-white" />
 </div>
 <div>
 <CardTitleComponent className="text-xl font-bold text-[hsl(var(--foreground))]">
 {property.name}
 </CardTitleComponent>
 <div className="flex items-center gap-4 text-sm text-muted-foreground">
 <div className="flex items-center gap-1">
 <UserIcon className="w-4 h-4" />
 {owner?.full_name || 'Owner not found'}
 </div>
 <div className="flex items-center gap-1">
 <Calendar className="w-4 h-4" />
 {formatDate(approval.created_date)}
 </div>
 </div>
 </div>
 </div>
 <BadgeComponent variant="outline" className={getStatusColor(approval.status)}>
 <Clock className="w-3 h-3 mr-1" />
 {approval.status}
 </BadgeComponent>
 </div>
 </CardHeaderComponent>

 <CardContentComponent className="p-6 space-y-6">
 {/* Property Details */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <h4 className="font-semibold text-[hsl(var(--foreground))] mb-3">Property Information</h4>
 <div className="space-y-2 text-sm">
 <div className="flex items-center gap-2">
 <MapPin className="w-4 h-4 text-[hsl(var(--primary))]" />
 <span>{property.location?.address || 'Address not provided'}</span>
 </div>
 <div>
 <span className="font-medium">Type:</span> {property.type}
 </div>
 <div>
 <span className="font-medium">Description:</span> {property.description || 'No description provided'}
 </div>
 </div>
 </div>

 <div>
 <h4 className="font-semibold text-[hsl(var(--foreground))] mb-3">Owner Contact</h4>
 {owner ? (
 <div className="space-y-2 text-sm">
 <div>
 <span className="font-medium">Name:</span> {owner.full_name}
 </div>
 <div>
 <span className="font-medium">Email:</span> {owner.email}
 </div>
 {owner.phone && (
 <div>
 <span className="font-medium">Phone:</span> {owner.phone}
 </div>
 )}
 </div>
 ) : (
 <AlertComponent className="border-[hsl(var(--warning))] bg-[hsl(var(--warning))]/10">
 <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />
 <AlertDescriptionComponent className="text-[hsl(var(--warning))] text-sm">
 Owner information not available
 </AlertDescriptionComponent>
 </AlertComponent>
 )}
 </div>
 </div>

 {/* Submitted Documents */}
 {approval.submitted_documents && approval.submitted_documents.length> 0 && (
 <div>
 <h4 className="font-semibold text-[hsl(var(--foreground))] mb-3">Submitted Documents</h4>
 <div className="space-y-2">
 {approval.submitted_documents.map((doc: string, index: number) => (
 <div key={index} className="flex items-center gap-2 p-2 bg-[hsl(var(--muted))] rounded-lg">
 <FileText className="w-4 h-4 text-[hsl(var(--primary))]" />
 <a 
 href={doc} 
 target="_blank" 
 rel="noopener noreferrer"
 className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-hover))] text-sm flex items-center gap-1 transition-brand"
>
 Document {index + 1}
 <ExternalLink className="w-3 h-3" />
 </a>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Additional Notes */}
 {approval.compliance_notes && (
 <div>
 <h4 className="font-semibold text-[hsl(var(--foreground))] mb-3">Additional Notes</h4>
 <p className="text-sm text-muted-foreground bg-[hsl(var(--muted))] p-3 rounded-lg">
 {approval.compliance_notes}
 </p>
 </div>
 )}

 {/* Action Buttons */}
 <div className="flex gap-3 pt-4 border-t border-[hsl(var(--border))]">
 <ButtonComponent
 onClick={() => handleApprove(approval)}
 disabled={processingId === approval.id}
 className="bg-gradient-to-r from-[hsl(var(--success))] to-[hsl(var(--success))]/80 hover:from-[hsl(var(--success))]/90 hover:to-[hsl(var(--success))]/70 text-white rounded-2xl flex-1 transition-brand"
>
 {processingId === approval.id ? (
 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
 ) : (
 <CheckCircle className="w-4 h-4 mr-2" />
 )}
 Approve & Publish
 </ButtonComponent>
 
 <ButtonComponent
 onClick={() => handleRejectWithPrompt(approval)}
 disabled={processingId === approval.id}
 variant="destructive"
 className="rounded-2xl flex-1 transition-brand"
>
 <XCircle className="w-4 h-4 mr-2" />
 Request Changes
 </ButtonComponent>
 </div>
 </CardContentComponent>
 </CardComponent>
 );
 })}
 </div>
 )}
 </div>
 );
};

export default PropertyApprovalsPanel;