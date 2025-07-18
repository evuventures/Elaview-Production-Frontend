// src/components/DeleteCampaignDialog.tsx
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

// Campaign type - adjust this to match your Dashboard types
type Campaign = {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft' | string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  lastUpdated: string;
  advertiser_id: string;
  _count?: {
    bookings: number;
  };
};

interface DeleteCampaignDialogProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (campaignId: string) => Promise<void>;
}

const DeleteCampaignDialog: React.FC<DeleteCampaignDialogProps> = ({ 
  campaign, 
  isOpen, 
  onClose, 
  onConfirmDelete 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!campaign) return;
    
    setIsDeleting(true);
    try {
      await onConfirmDelete(campaign.id);
      onClose();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      // Error handling is done in parent component
    } finally {
      setIsDeleting(false);
    }
  };

  if (!campaign) return null;

  const isActiveCampaign = campaign.status === 'ACTIVE' || campaign.status === 'active';
  const hasBookings = campaign._count?.bookings && campaign._count.bookings > 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
                Delete Campaign
              </AlertDialogTitle>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone
              </div>
            </div>
          </div>
        </AlertDialogHeader>
        
        <AlertDialogDescription asChild>
          <div className="text-gray-600 dark:text-gray-300 space-y-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="font-semibold text-gray-900 dark:text-white mb-2">Campaign Details:</div>
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Name:</span> {campaign.name}</div>
                <div><span className="font-medium">Status:</span> 
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    campaign.status === 'planning' || campaign.status === 'draft' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {campaign.status.toUpperCase()}
                  </span>
                </div>
                {campaign.budget && (
                  <div><span className="font-medium">Budget:</span> ${campaign.budget?.toLocaleString()}</div>
                )}
              </div>
            </div>

            {(isActiveCampaign || hasBookings) && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Warning</div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                      {isActiveCampaign && (
                        <div>• This campaign is currently active and may be displaying ads</div>
                      )}
                      {hasBookings && (
                        <div>• This campaign has {campaign._count?.bookings} associated booking(s)</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-gray-600 dark:text-gray-300">
              Are you sure you want to permanently delete this campaign? This will:
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 ml-4">
              <div>• Remove the campaign and all its data</div>
              <div>• Stop any active advertisements</div>
              <div>• Remove associated analytics data</div>
              <div>• This action cannot be undone</div>
            </div>
          </div>
        </AlertDialogDescription>
        
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel 
            disabled={isDeleting}
            className="rounded-xl"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl min-w-[100px]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCampaignDialog;