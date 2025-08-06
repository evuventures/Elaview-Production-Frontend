// src/components/campaigns/CampaignCard.jsx
// ✅ NEW: Campaign card component for displaying campaign information

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, DollarSign, Target, Eye, TrendingUp, 
  Play, Pause, CheckCircle, AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';

export default function CampaignCard({ campaign, onView, onEdit, onDelete }) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'paused':
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
      case 'planning':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
        return <Play className="w-4 h-4" />;
      case 'paused':
      case 'pending_approval':
        return <Pause className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'draft':
      case 'planning':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    const symbols = { 
      USD: '$', 
      ILS: '₪', 
      EUR: '€', 
      GBP: '£',
      CAD: 'C$',
      AUD: 'A$'
    };
    const symbol = symbols[currency] || '$';
    return `${symbol}${parseFloat(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
              {campaign.name || campaign.title}
            </CardTitle>
            <p className="text-sm text-gray-600 mb-2">
              {campaign.brand_name}
            </p>
            <div className="flex items-center gap-2">
              <Badge className={`text-xs ${getStatusColor(campaign.status)}`}>
                <span className="mr-1">
                  {getStatusIcon(campaign.status)}
                </span>
                {campaign.status?.replace('_', ' ').toLowerCase()}
              </Badge>
            </div>
          </div>
          {campaign.media_files && campaign.media_files.length > 0 && (
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-gray-500" />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Campaign Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-gray-600">Duration</p>
                <p className="font-medium text-gray-900">
                  {formatDate(campaign.start_date || campaign.startDate)} - {formatDate(campaign.end_date || campaign.endDate)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-gray-600">Budget</p>
                <p className="font-medium text-gray-900">
                  {formatCurrency(campaign.budget || campaign.total_budget, campaign.currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Campaign Objective */}
          {campaign.primary_objective && (
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-gray-600 text-sm">Objective</p>
                <p className="font-medium text-gray-900 text-sm">
                  {campaign.primary_objective.replace('_', ' ').toLowerCase()}
                </p>
              </div>
            </div>
          )}

          {/* Performance Metrics (if available) */}
          {(campaign.impressions || campaign.clicks || campaign.conversions) && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-2">Performance</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <p className="font-semibold text-gray-900">
                    {campaign.impressions?.toLocaleString() || '0'}
                  </p>
                  <p className="text-gray-600">Impressions</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">
                    {campaign.clicks?.toLocaleString() || '0'}
                  </p>
                  <p className="text-gray-600">Clicks</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-green-600">
                    {campaign.conversions?.toLocaleString() || '0'}
                  </p>
                  <p className="text-gray-600">Conversions</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {onView && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onView(campaign)}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            )}
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(campaign)}
                className="flex-1"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 