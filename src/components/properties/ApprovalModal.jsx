import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PropertyApproval, Property } from '@/api/entities';
import { UploadFile, SendEmail } from '@/api/integrations';
import { 
  CheckCircle, 
  AlertTriangle, 
  Upload, 
  FileText, 
  Shield, 
  Clock, 
  Mail,
  Loader2,
  X,
  Info
} from 'lucide-react';

const ApprovalModal = ({ 
  isOpen, 
  onClose, 
  property, 
  onApprovalSubmitted,
  onSkipApproval 
}) => {
  const [approvalChoice, setApprovalChoice] = useState(null); // 'approved' or 'needs_approval'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(file => UploadFile({ file }));
      const uploadResults = await Promise.all(uploadPromises);
      const newDocuments = uploadResults.map((result, index) => ({
        url: result.file_url,
        name: files[index].name
      }));
      setUploadedDocuments(prev => [...prev, ...newDocuments]);
    } catch (error) {
      console.error('Error uploading documents:', error);
      alert('Error uploading documents. Please try again.');
    }
    setIsUploading(false);
  };

  const removeDocument = (index) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitForApproval = async () => {
    setIsSubmitting(true);
    try {
      // Create approval request
      const approvalRequest = await PropertyApproval.create({
        property_id: property.id,
        owner_id: property.owner_id,
        submission_type: 'new_property',
        submitted_documents: uploadedDocuments.map(doc => doc.url),
        compliance_notes: additionalNotes
      });

      // Update property status to pending approval
      await Property.update(property.id, {
        status: 'pending_approval'
      });

      // Send email notification to admin
      await SendEmail({
        to: 'admin@elaview.com', // Replace with actual admin email
        subject: `New Property Approval Required - ${property.name}`,
        body: `
          <h2>New Property Approval Request</h2>
          
          <p>A new property has been submitted for approval and requires your review.</p>
          
          <h3>Property Details:</h3>
          <ul>
            <li><strong>Property Name:</strong> ${property.name}</li>
            <li><strong>Owner:</strong> ${property.owner_email || 'Not specified'}</li>
            <li><strong>Type:</strong> ${property.type}</li>
            <li><strong>Location:</strong> ${property.location?.address || 'Not specified'}</li>
            <li><strong>Description:</strong> ${property.description || 'No description provided'}</li>
          </ul>
          
          ${uploadedDocuments.length > 0 ? `
          <h3>Submitted Documents:</h3>
          <ul>
            ${uploadedDocuments.map(doc => `<li><a href="${doc.url}">${doc.name}</a></li>`).join('')}
          </ul>
          ` : ''}
          
          ${additionalNotes ? `
          <h3>Additional Notes:</h3>
          <p>${additionalNotes}</p>
          ` : ''}
          
          <p>Please review this submission in the admin panel and approve or reject accordingly.</p>
          
          <p><a href="${window.location.origin}/admin?tab=approvals">Review in Admin Panel</a></p>
        `
      });

      onApprovalSubmitted(approvalRequest);
    } catch (error) {
      console.error('Error submitting for approval:', error);
      alert('Error submitting approval request. Please try again.');
    }
    setIsSubmitting(false);
  };

  const handleAlreadyApproved = async () => {
    setIsSubmitting(true);
    try {
      // Update property to listed status
      await Property.update(property.id, {
        status: 'listed'
      });

      onSkipApproval();
    } catch (error) {
      console.error('Error updating property status:', error);
      alert('Error updating property. Please try again.');
    }
    setIsSubmitting(false);
  };

  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl glass border-[hsl(var(--border))] rounded-3xl shadow-[var(--shadow-brand-lg)]">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-[var(--shadow-brand)]">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-[hsl(var(--foreground))]">
                Property Approval Required
              </DialogTitle>
              <DialogDescription className="text-[hsl(var(--muted-foreground))]">
                Before listing "{property.name}" on our platform
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <Alert className="bg-[hsl(var(--primary))]/5 border-[hsl(var(--primary))]/30 rounded-2xl">
            <Info className="h-4 w-4 text-[hsl(var(--primary))]" />
            <AlertTitle className="text-[hsl(var(--primary))] font-bold">
              Compliance Check Required
            </AlertTitle>
            <AlertDescription className="text-[hsl(var(--primary))]">
              All advertising spaces must be properly permitted and compliant with local regulations before being listed on our platform.
            </AlertDescription>
          </Alert>

          {!approvalChoice && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                Is your property already approved and permitted for advertising?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className="cursor-pointer bg-[hsl(var(--success))]/5 border-[hsl(var(--success))]/30 hover:bg-[hsl(var(--success))]/10 transition-brand rounded-2xl"
                  onClick={() => setApprovalChoice('approved')}
                >
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-[hsl(var(--success))] mx-auto mb-4" />
                    <h4 className="font-bold text-[hsl(var(--success))] mb-2">
                      Yes, Already Approved
                    </h4>
                    <p className="text-sm text-[hsl(var(--success))]">
                      I have all necessary permits and approvals for advertising on this property
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer bg-[hsl(var(--warning))]/5 border-[hsl(var(--warning))]/30 hover:bg-[hsl(var(--warning))]/10 transition-brand rounded-2xl"
                  onClick={() => setApprovalChoice('needs_approval')}
                >
                  <CardContent className="p-6 text-center">
                    <Clock className="w-12 h-12 text-[hsl(var(--warning))] mx-auto mb-4" />
                    <h4 className="font-bold text-[hsl(var(--warning))] mb-2">
                      Need Approval
                    </h4>
                    <p className="text-sm text-[hsl(var(--warning))]">
                      I need help obtaining permits or want Elaview to review my property
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {approvalChoice === 'approved' && (
            <Card className="bg-[hsl(var(--success))]/5 border-[hsl(var(--success))]/30 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[hsl(var(--success))]">
                  <CheckCircle className="w-5 h-5" />
                  Confirm Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[hsl(var(--success))] text-sm">
                  By proceeding, you confirm that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-[hsl(var(--success))] text-sm">
                  <li>You have all necessary permits for advertising on this property</li>
                  <li>The property complies with local zoning and advertising regulations</li>
                  <li>You have authorization from property owners (if applicable)</li>
                  <li>All safety and accessibility requirements are met</li>
                </ul>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setApprovalChoice(null)}
                    className="rounded-2xl transition-brand"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleAlreadyApproved}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-[hsl(var(--success))] to-[hsl(var(--success))]/80 hover:from-[hsl(var(--success))]/90 hover:to-[hsl(var(--success))]/70 text-white rounded-2xl flex-1 transition-brand"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Publish Property
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {approvalChoice === 'needs_approval' && (
            <Card className="bg-[hsl(var(--warning))]/5 border-[hsl(var(--warning))]/30 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[hsl(var(--warning))]">
                  <Mail className="w-5 h-5" />
                  Submit for Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-[hsl(var(--warning))] text-sm">
                  Our team will review your property and help ensure it meets all regulatory requirements. Please upload any relevant documents you may have.
                </p>

                {/* Document Upload */}
                <div>
                  <Label className="text-base font-semibold text-[hsl(var(--warning))] mb-3 block">
                    Upload Documents (Optional)
                  </Label>
                  <div className="border-2 border-dashed border-[hsl(var(--warning))]/50 rounded-2xl p-6 text-center bg-[hsl(var(--card))]/50">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="document-upload"
                      disabled={isUploading}
                    />
                    <label htmlFor="document-upload" className="cursor-pointer">
                      {isUploading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--warning))]" />
                          <span className="text-[hsl(var(--warning))]">Uploading...</span>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-12 h-12 text-[hsl(var(--warning))] mx-auto mb-4" />
                          <p className="text-[hsl(var(--warning))] font-medium">
                            Click to upload permits, licenses, or property documents
                          </p>
                          <p className="text-xs text-[hsl(var(--warning))]/70 mt-2">
                            PDF, DOC, or image files
                          </p>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Uploaded Documents List */}
                  {uploadedDocuments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 glass border border-[hsl(var(--border))] rounded-xl">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[hsl(var(--warning))]" />
                            <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                              {doc.name}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(index)}
                            className="text-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/5 rounded-lg transition-brand"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="notes" className="text-base font-semibold text-[hsl(var(--warning))] mb-2 block">
                    Additional Information (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Any additional context about your property, existing permits, or specific questions for our team..."
                    className="glass border-[hsl(var(--border))] rounded-2xl focus-brand transition-brand min-h-[100px]"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setApprovalChoice(null)}
                    className="rounded-2xl transition-brand"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmitForApproval}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-[hsl(var(--warning))] to-[hsl(var(--warning))]/80 hover:from-[hsl(var(--warning))]/90 hover:to-[hsl(var(--warning))]/70 text-white rounded-2xl flex-1 transition-brand"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Submit for Review
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalModal;