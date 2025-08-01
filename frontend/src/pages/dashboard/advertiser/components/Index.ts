// dashboard/advertiser/components/index.ts
// Complete component exports for Material Sourcing MVP

// ✅ PHASE 1: Enhanced Booking Cards & Core Components
export { EnhancedBookingCard } from './EnhancedBookingCard';
export { StatCard } from './StatCard';
export { EmptyState } from './EmptyState';
export { SpaceSearchCard } from './SpaceSearchCard';
export { BookingCard } from './BookingCard';
export { MaterialSelectionModal } from './MaterialSelectionModal';

// ✅ PHASE 2: Installation Status Tracking Components
export { InstallationStatusTracker } from './InstallationStatusTracker';
export { InstallationPhotosViewer } from './InstallationPhotosViewer';
export { InstallationCommunication } from './InstallationCommunication';

// ✅ PHASE 3: Material Order Tracking & Timeline Components
export { MaterialOrderTracker } from './MaterialOrderTracker';
export { SupplierDashboard } from './SupplierDashboard';
export { OrderTimeline } from './OrderTimeline';
export { CostOptimizer } from './CostOptimizer';
export { DeliveryCoordinator } from './DeliveryCoordinator';

// ✅ Re-import for component groupings
import { EnhancedBookingCard } from './EnhancedBookingCard';
import { StatCard } from './StatCard';
import { EmptyState } from './EmptyState';
import { SpaceSearchCard } from './SpaceSearchCard';
import { MaterialSelectionModal } from './MaterialSelectionModal';
import { InstallationStatusTracker } from './InstallationStatusTracker';
import { InstallationPhotosViewer } from './InstallationPhotosViewer';
import { InstallationCommunication } from './InstallationCommunication';
import { MaterialOrderTracker } from './MaterialOrderTracker';
import { SupplierDashboard } from './SupplierDashboard';
import { OrderTimeline } from './OrderTimeline';
import { CostOptimizer } from './CostOptimizer';
import { DeliveryCoordinator } from './DeliveryCoordinator';

// ✅ Component Groupings for Easy Imports
export const CoreComponents = {
  EnhancedBookingCard,
  StatCard,
  EmptyState,
  SpaceSearchCard,
  MaterialSelectionModal
} as const;

export const InstallationComponents = {
  InstallationStatusTracker,
  InstallationPhotosViewer,
  InstallationCommunication
} as const;

export const MaterialOrderComponents = {
  MaterialOrderTracker,
  SupplierDashboard,
  OrderTimeline,
  CostOptimizer,
  DeliveryCoordinator
} as const;

// ✅ All Components for Bulk Import
export const AllComponents = {
  ...CoreComponents,
  ...InstallationComponents,
  ...MaterialOrderComponents
} as const;

// ✅ Type exports for component groupings
export type CoreComponentsType = typeof CoreComponents;
export type InstallationComponentsType = typeof InstallationComponents;
export type MaterialOrderComponentsType = typeof MaterialOrderComponents;
export type AllComponentsType = typeof AllComponents;