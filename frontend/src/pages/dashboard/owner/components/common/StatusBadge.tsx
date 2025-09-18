// src/pages/dashboard/components/common/StatusBadge.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
 Play, 
 Clock, 
 CheckCircle, 
 AlertCircle, 
 Pause 
} from 'lucide-react';

interface StatusBadgeProps {
 status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
 const statusConfig = {
 live: { color: 'bg-lime-400 text-gray-900', icon: Play, text: 'Live' },
 active: { color: 'bg-lime-400 text-gray-900', icon: Play, text: 'Live' },
 pending: { color: 'bg-amber-500 text-white', icon: Clock, text: 'Pending' },
 approved: { color: 'bg-blue-500 text-white', icon: CheckCircle, text: 'Approved' },
 rejected: { color: 'bg-red-500 text-white', icon: AlertCircle, text: 'Rejected' },
 ended: { color: 'bg-gray-500 text-white', icon: Pause, text: 'Ended' }
 };

 const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
 const IconComponent = config.icon;

 return (
 <Badge variant="secondary" className={`${config.color} border-0 font-medium`}>
 <IconComponent className="w-3 h-3 mr-1" />
 {config.text}
 </Badge>
 );
};