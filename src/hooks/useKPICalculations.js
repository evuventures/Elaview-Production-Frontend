// src/hooks/useKPICalculations.js
import { useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  Building, 
  AlertCircle 
} from 'lucide-react';

/**
 * Custom hook for calculating KPI metrics for the dashboard
 * @param {Object} currentUser - Current authenticated user
 * @param {Array} bookings - Array of booking objects
 * @param {Array} invoices - Array of invoice objects  
 * @param {Array} properties - Array of property objects
 * @param {Array} campaigns - Array of campaign objects
 * @returns {Array} Array of KPI objects with calculated values
 */
export const useKPICalculations = (currentUser, bookings, invoices, properties, campaigns) => {
  const kpiData = useMemo(() => {
    if (!currentUser) return [];

    const userId = 'user1'; // Mock user ID - replace with currentUser.id when backend is connected
    
    // Filter data by current user
    const myBookingsAsOwner = bookings.filter(b => b.owner_id === userId);
    const myBookingsAsAdvertiser = bookings.filter(b => b.advertiser_id === userId);
    const myInvoices = invoices.filter(i => i.advertiser_id === userId || i.owner_id === userId);

    // Calculate financial totals
    const totalRevenue = myBookingsAsOwner
      .filter(b => b.payment_status === 'paid')
      .reduce((acc, b) => acc + (b.total_amount || 0), 0);
    
    const totalSpent = myBookingsAsAdvertiser
      .filter(b => b.payment_status === 'paid')
      .reduce((acc, b) => acc + (b.total_amount || 0), 0);

    // Calculate counts
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const propertiesListed = properties.length;

    // Calculate pending items (things that need user attention)
    const pendingApprovals = myBookingsAsOwner.filter(b => b.status === 'pending_approval').length;
    const pendingPayments = myInvoices.filter(i =>
      i.advertiser_id === userId && ['sent', 'viewed'].includes(i.status)
    ).length;
    const pendingItems = pendingApprovals + pendingPayments;

    return [
      {
        label: "REVENUE",
        value: `$${totalRevenue.toLocaleString()}`,
        change: "+12.5%",
        trend: "up",
        icon: DollarSign,
        color: "from-green-500 to-emerald-500"
      },
      {
        label: "SPENT",
        value: `$${totalSpent.toLocaleString()}`,
        change: "+8.2%",
        trend: "up",
        icon: TrendingUp,
        color: "from-blue-500 to-cyan-500"
      },
      {
        label: "ACTIVE",
        value: activeCampaigns.toString(),
        change: "+2",
        trend: activeCampaigns > 0 ? "up" : "neutral",
        icon: Target,
        color: "from-purple-500 to-pink-500"
      },
      {
        label: "LISTED",
        value: propertiesListed.toString(),
        change: "0",
        trend: "neutral",
        icon: Building,
        color: "from-orange-500 to-red-500"
      },
      {
        label: "PENDING",
        value: pendingItems.toString(),
        change: "-1",
        trend: pendingItems > 0 ? "down" : "neutral",
        urgent: pendingItems > 0,
        icon: AlertCircle,
        color: pendingItems > 0 ? "from-amber-500 to-orange-500" : "from-gray-400 to-gray-500"
      }
    ];
  }, [currentUser, bookings, invoices, properties, campaigns]);

  return kpiData;
};