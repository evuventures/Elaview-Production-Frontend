// src/pages/mobile/MobileBrowse.jsx
import React from 'react';
import { useUser } from '@clerk/clerk-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { Navigate } from 'react-router-dom';

const MobileBrowse = () => {
  const { user: currentUser } = useUser();
  const isMobile = useIsMobile();

  // Redirect to desktop version if not on mobile
  if (!isMobile) {
    return <Navigate to="/browse" replace />;
  }

  return (
    <MobileLayout 
      currentUser={currentUser}
      unreadCount={0} // Will be populated from actual data
      pendingInvoices={0} // Will be populated from actual data
      actionItemsCount={0} // Will be populated from actual data
    />
  );
};

export default MobileBrowse;
