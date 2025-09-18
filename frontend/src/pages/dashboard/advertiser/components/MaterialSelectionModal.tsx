// CRITICAL UPDATE 1: src/pages/dashboard/advertiser/AdvertiserDashboard.tsx
// ✅ FIND the loading state section and REPLACE with this:

// ADD THIS IMPORT at the top:
import VideoLoader from '@/components/ui/VideoLoader';

// FIND this section (around line 150):
/*
 if (isLoading) {
 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center">
 <div className="text-center">
 <div 
 className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
 style={{ borderColor: 'rgb(70, 104, 171)', borderTopColor: 'transparent' }}
></div>
 <p className="text-gray-600">Loading advertiser dashboard...</p>
 </div>
 </div>
 );
 }
*/

// REPLACE with:
if (isLoading) {
 console.log('⏳ AdvertiserDashboard: Showing loading state');
 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center">
 <div className="text-center">
 <VideoLoader 
 size={40}
 
 
 
 centered={true}
 containerClassName="mb-4"
 />
 </div>
 </div>
 );
}

// =================================================================

// CRITICAL UPDATE 2: src/pages/dashboard/owner/OwnerDashboard.tsx
// ✅ FIND the loading state section and REPLACE with this:

// ADD THIS IMPORT at the top:
import VideoLoader from '@/components/ui/VideoLoader';

// FIND this section (around line 120):
/*
 if (isLoading) {
 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center">
 <div className="text-center">
 <div 
 className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
 style={{ borderColor: 'rgb(70, 104, 171)', borderTopColor: 'transparent' }}
></div>
 <p className="text-gray-600">Loading owner dashboard...</p>
 </div>
 </div>
 );
 }
*/

// REPLACE with:
if (isLoading) {
 console.log('⏳ OwnerDashboard: Showing loading state');
 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center">
 <div className="text-center">
 <VideoLoader 
 size={40}
 
 
 
 centered={true}
 containerClassName="mb-4"
 />
 </div>
 </div>
 );
}

// =================================================================

// CRITICAL UPDATE 3: src/components/layout/nested/MobileTopBar.jsx
// ✅ FIND the loading state section and REPLACE with this:

// ADD THIS IMPORT at the top:
import VideoLoader from '@/components/ui/VideoLoader';

// FIND this section (look for animate-spin):
/*
 <div 
 className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2"
 style={{ borderColor: '#4668AB', borderTopColor: 'transparent' }}
 />
*/

// REPLACE with:
<VideoLoader 
 size={20}
 
 centered={true}
 className="mx-auto mb-2"
/>

// =================================================================

// CRITICAL UPDATE 4: src/pages/dashboard/advertiser/components/MaterialSelectionModal.tsx
// ✅ FIND the loading state section and REPLACE with this:

// ADD THIS IMPORT at the top:
import VideoLoader from '@/components/ui/VideoLoader';

// FIND this section:
/*
 <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
*/

// REPLACE with:
<VideoLoader 
 size={24}
 
 centered={true}
 className="mx-auto mb-2"
/>

// =================================================================

// CONSOLE.LOG VERIFICATION CODES
// Add these after each update to verify the changes work:

// For AdvertiserDashboard.tsx:
console.log('✅ AdvertiserDashboard: VideoLoader component updated');

// For OwnerDashboard.tsx:
console.log('✅ OwnerDashboard: VideoLoader component updated');

// For MobileTopBar.jsx:
console.log('✅ MobileTopBar: VideoLoader component updated');

// For MaterialSelectionModal.tsx:
console.log('✅ MaterialSelectionModal: VideoLoader component updated');