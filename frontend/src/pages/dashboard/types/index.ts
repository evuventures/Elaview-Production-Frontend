// src/pages/dashboard/types/index.ts

export interface Booking {
  id: string;
  spaceName?: string;
  location?: string;
  status: 'live' | 'pending' | 'approved' | 'ended' | 'rejected' | string;
  startDate: string;
  endDate: string;
  dailyRate?: number;
  totalCost: number;
  businessName?: string;
  creativeUrl?: string;
  impressions?: number;
  ctr?: number;
  propertyId?: string;
  areaId?: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'draft' | 'pending' | 'inactive';
  spacesCount: number;
  activeBookings: number;
  monthlyEarnings: number;
  totalEarnings: number;
  createdDate: string;
}

export interface BookingRequest {
  id: string;
  propertyId: string;
  spaceName: string;
  advertiserName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  creativeUrl?: string;
  submittedDate: string;
}

export interface DashboardStats {
  totalSpent: number;
  activeAds: number;
  totalImpressions: number;
  avgROI: string;
  totalProperties: number;
  activeProperties: number;
  pendingBookings: number;
  monthlyRevenue: number;
  totalRevenue: number;
  occupancyRate: number;
}

export interface CreativeAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  size: number;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
  bookingId?: string;
  notes?: string;
  publicId?: string;
}

export type UserRole = 'advertiser' | 'property_owner';

export interface StatItem {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  color: string;
}

export interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}