import Layout from "../components/layout/Layout.tsx";
import Landing from "./landing/LandingPage.jsx"; // ✅ ADDED: Import your Landing page
import CheckoutPage from "./checkout/CheckoutPage.jsx"; // ✅ FIXED: This is for cart checkout
import AdvertisingPage from "./dashboard/advertiser/AdvertiserDashboard.tsx"; // ✅ NEW: Import the bookings management page
import Map from "./browse/BrowsePage.jsx";
import Messages from "./messages/MessagesPage.tsx";
import Profile from "./user/Profile.jsx";
import Settings from "./user/Settings.jsx";
import Help from "./help/Help.jsx";
import Dashboard from "./dashboard/owner/OwnerDashboard.tsx"; // Space Owner Dashboard
import Invoices from "./payments/Invoices.jsx";
import BookingManagement from "./bookings/BookingManagement.jsx";
import CreateCampaignWizard from "./campaigns/CreateCampaignWizard.jsx";
// ❌ REMOVED: import CreateProperty from "./properties/CreateProperty.tsx"; // OLD LEGACY COMPONENT
import CreateListingWizard from "./dashboard/owner/components/create-listing"; // ✅ NEW: Our minimal wizard
import PropertyManagement from "./properties/PropertyManagement.jsx";
import DataSeeder from "./DataSeeder.jsx";
import Admin from "./dashboard/admin/Admin.tsx";
import EditProperty from "./properties/EditProperty.jsx";
import CampaignCheckout from "./payments/Checkout.jsx"; // ✅ RENAMED: This is for campaign checkout only
import CampaignDetails from "./campaigns/CampaignDetails.jsx";
import PaymentTest from "./payments/PaymentTest.jsx";
import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";
// import Search from "../../LEGACY/search/Search.js";
import SignInPage from "./auth/SignIn.jsx";
import SignUpPage from "./auth/SignUp.jsx";
import LearnMore from "./learn-more/LearnMore.jsx"; // ✅ NEW: Learn More page

// ✅ NEW: SSO Callback and Debug components
import SSOCallback from "./auth/SSOCallback.jsx"; // ✅ NEW: Handle Google OAuth redirects
import DebugSignUpPage from "./auth/DebugSignUp.jsx"; // ✅ NEW: Debug signup issues

// ❌ TEMPORARILY DISABLED: import { ChatBotProvider } from "@/contexts/ChatBotContext";

// ✅ ADMIN PAGE IMPORTS - Core Admin Pages
import UserManagement from "./admin/UserManagement.tsx";
import PropertyApprovals from "./admin/PropertyApprovals.tsx";
import BookingOversight from "./admin/BookingOversight.tsx";

// ✅ MATERIAL SOURCING ADMIN PAGE IMPORTS
import MaterialCatalogManagement from "./admin/MaterialCatalogManagement.tsx";
import MaterialOrderProcessing from "./admin/MaterialOrderProcessing.tsx";
import ClientOnboardingSystem from "./admin/ClientOnboardingSystem.tsx";

// 🧪 TEMPORARY DEBUG IMPORTS - Remove after fixing Map component
import ApiDebugTest from "@/dev/debug/ApiDebugTest.jsx";
import MinimalTestMap from "@/dev/debug/MinimalTestMap.tsx";
// import TestMapPage from 'LEGACY/TestMapPage.js';

import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useParams } from 'react-router-dom';
import { useEffect } from 'react';

// ✅ UPDATED: Added Landing to PAGES object
const PAGES = {
    Landing: Landing, // ✅ NEW: Landing page component
    Browse: Map, // ✅ Map.jsx is your browse page
    Messages: Messages,
    CheckoutPage: CheckoutPage, // ✅ UPDATED: Cart checkout (from checkout folder)
    CampaignCheckout: CampaignCheckout, // ✅ Campaign checkout (from payments folder)
    AdvertisingPage: AdvertisingPage, // ✅ NEW: Bookings management page
    Profile: Profile,
    Settings: Settings,
    Help: Help,
    Dashboard: Dashboard, // Space Owner Dashboard
    Invoices: Invoices,
    BookingManagement: BookingManagement,
    CreateCampaign: CreateCampaignWizard,
    // ❌ REMOVED: ListSpace: CreateProperty, // OLD LEGACY COMPONENT
    ListSpace: CreateListingWizard, // ✅ NEW: Use our minimal wizard
    PropertyManagement: PropertyManagement,
    DataSeeder: DataSeeder,
    Admin: Admin,
    // ✅ CORE ADMIN SUB-PAGES
    UserManagement: UserManagement,
    PropertyApprovals: PropertyApprovals,
    BookingOversight: BookingOversight,
    // ✅ MATERIAL SOURCING ADMIN PAGES
    MaterialCatalogManagement: MaterialCatalogManagement,
    MaterialOrderProcessing: MaterialOrderProcessing,
    ClientOnboardingSystem: ClientOnboardingSystem,
    EditProperty: EditProperty,
    CampaignDetails: CampaignDetails,
    PaymentTest: PaymentTest,
    // Search: Search,
    LearnMore: LearnMore, // ✅ NEW: Learn More page
    // ✅ NEW: Auth & Debug pages
    SSOCallback: SSOCallback,
    DebugSignUp: DebugSignUpPage,
    // 🧪 TEMPORARY DEBUG PAGES
    ApiDebugTest: ApiDebugTest,
    MinimalTestMap: MinimalTestMap,
}

// ✅ FIXED: Proper redirect component that extracts URL parameters
function BookingToCheckoutRedirect() {
    const { propertyId, spaceId } = useParams();
    
    // Debug logging
    console.log('🔄 Redirecting from /booking to /checkout');
    console.log('Property ID:', propertyId);
    console.log('Space ID:', spaceId);
    
    // Construct proper redirect URL with parameters
    const redirectUrl = `/checkout/${propertyId}/${spaceId}`;
    console.log('🧭 Redirecting to:', redirectUrl);
    
    return <Navigate to={redirectUrl} replace />;
}

// ✅ PRODUCTION: Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();

    // ✅ PRODUCTION: Add route change debugging and cleanup
    useEffect(() => {
        console.log('🔄 Route changed to:', location.pathname);
        
        // ✅ PRODUCTION: Force garbage collection on route changes for performance
        if (location.pathname !== '/browse' && location.pathname !== '/map') {
            // Small delay to ensure cleanup happens after navigation
            setTimeout(() => {
                if (window.gc && typeof window.gc === 'function') {
                    window.gc();
                }
            }, 100);
        }
    }, [location.pathname]);

    return (
        <Routes>
            {/* ✅ DEFAULT ROUTE - Landing page (no layout wrapper) */}
            <Route path="/" element={<Landing />} />
            
            {/* 🧪 TEMPORARY DEBUG ROUTES - Remove after fixing Map component */}
            <Route path="/debug-api" element={
                <Layout currentPageName="Debug" key="debug-api-page">
                    <ApiDebugTest key="debug-api-component" />
                </Layout>
            } />
            <Route path="/debug-map" element={
                <Layout currentPageName="Debug" key="debug-map-page">
                    <MinimalTestMap key="debug-map-component" />
                </Layout>
            } />
            
            {/* ✅ NEW: Debug signup route for troubleshooting Clerk issues */}
            <Route path="/debug-signup" element={<DebugSignUpPage />} />
            
            {/* ✅ AUTH ROUTES - NO LAYOUT (No navigation bars) */}
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />
            
            {/* ✅ NEW: SSO Callback Route - NO LAYOUT (Handles Google OAuth redirects) */}
            <Route path="/sso-callback" element={<SSOCallback />} />
            
            {/* ✅ STANDALONE PAGES - NO LAYOUT (No navigation bars) */}
            <Route path="/learn-more" element={<LearnMore />} />
            
            {/* ✅ PUBLIC ROUTES - No authentication required */}
            <Route path="/browse" element={
                <Layout currentPageName="Browse" key="browse-page">
                    <Map key="map-browse" />
                </Layout>
            } />
            <Route path="/map" element={<Navigate to="/browse" replace />} />
            <Route path="/help" element={
                <Layout currentPageName="Help" key="help-page">
                    <Help key="help-component" />
                </Layout>
            } />
            {/* <Route path="/search" element={
                <Layout currentPageName="Search" key="search-page">
                    <Search key="search-component" />
                </Layout>
            } /> */}
            
            {/* ✅ PROTECTED ROUTES - Authentication required */}
            <Route path="/dashboard" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="dashboard-protected">
                    <Layout currentPageName="Dashboard" key="dashboard-page">
                        <Dashboard key="dashboard-component" />
                    </Layout>
                </ProtectedRoute>
            } />

            {/* ✅ NEW: Bookings Management Page (for buyers to see their bookings) */}
            <Route path="/advertise" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="bookings-protected">
                    <Layout currentPageName="Bookings" key="bookings-page">
                        <AdvertisingPage key="bookings-component" />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/messages" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="messages-protected">
                    <Layout currentPageName="Messages" key="messages-page">
                        <Messages key="messages-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/profile" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="profile-protected">
                    <Layout currentPageName="Profile" key="profile-page">
                        <Profile key="profile-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/settings" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="settings-protected">
                    <Layout currentPageName="Settings" key="settings-page">
                        <Settings key="settings-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/invoices" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="invoices-protected">
                    <Layout currentPageName="Invoices" key="invoices-page">
                        <Invoices key="invoices-component" />
                    </Layout>
                </ProtectedRoute>
            } />

            {/* ✅ FIXED: CART CHECKOUT - Now uses the correct CheckoutPage component */}
            <Route path="/checkout" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="cart-checkout-protected">
                    <Layout currentPageName="Checkout" key="cart-checkout-page">
                        <CheckoutPage key="cart-checkout-component" />
                    </Layout>
                </ProtectedRoute>
            } />

            {/* ✅ INDIVIDUAL SPACE CHECKOUT - Direct booking from space details */}
            <Route path="/checkout/:propertyId/:spaceId" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="space-checkout-protected">
                    <Layout currentPageName="Checkout" key="space-checkout-page">
                        <CheckoutPage key="space-checkout-component" />
                    </Layout>
                </ProtectedRoute>
            } />

            {/* ✅ CAMPAIGN CHECKOUT - For campaign-based checkouts only */}
            <Route path="/campaign-checkout" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="campaign-checkout-protected">
                    <Layout currentPageName="Campaign Checkout" key="campaign-checkout-page">
                        <CampaignCheckout key="campaign-checkout-component" />
                    </Layout>
                </ProtectedRoute>
            } />

            {/* ✅ FIXED: Legacy redirect that properly handles URL parameters */}
            <Route path="/booking/:propertyId/:spaceId" element={<BookingToCheckoutRedirect />} />

            <Route path="/booking-management" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="booking-management-protected">
                    <Layout currentPageName="BookingManagement" key="booking-management-page">
                        <BookingManagement key="booking-management-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/create-campaign" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="create-campaign-protected">
                    <Layout currentPageName="CreateCampaign" key="create-campaign-page">
                        <CreateCampaignWizard key="create-campaign-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            
            {/* ✅ CRITICAL FIX: List Space route uses CreateListingWizard directly (NO LAYOUT) */}
            <Route path="/list-space" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="list-space-protected">
                    <CreateListingWizard key="list-space-component" />
                </ProtectedRoute>
            } />
            
            {/* ✅ LEGACY: Redirect old create-property route to new list-space */}
            <Route path="/create-property" element={<Navigate to="/list-space" replace />} />
            <Route path="/createproperty" element={<Navigate to="/list-space" replace />} />
            
            <Route path="/property-management" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="property-management-protected">
                    <Layout currentPageName="PropertyManagement" key="property-management-page">
                        <PropertyManagement key="property-management-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/edit-property" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="edit-property-protected">
                    <Layout currentPageName="EditProperty" key="edit-property-page">
                        <EditProperty key="edit-property-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/campaign-details" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="campaign-details-protected">
                    <Layout currentPageName="CampaignDetails" key="campaign-details-page">
                        <CampaignDetails key="campaign-details-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/payment-test" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="payment-test-protected">
                    <Layout currentPageName="PaymentTest" key="payment-test-page">
                        <PaymentTest key="payment-test-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            
            {/* ✅ ADMIN ROUTES - Higher level protection */}
            <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true} allowedRoles={[]} redirectTo="/sign-in" key="admin-protected">
                    <Layout currentPageName="Admin" key="admin-page">
                        <Admin key="admin-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            
            {/* ✅ CORE ADMIN SUB-PAGES */}
            <Route path="/admin/users" element={
                <ProtectedRoute requireAdmin={true} allowedRoles={[]} redirectTo="/sign-in" key="admin-users-protected">
                    <Layout currentPageName="User Management" key="admin-users-page">
                        <UserManagement key="admin-users-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/admin/properties" element={
                <ProtectedRoute requireAdmin={true} allowedRoles={[]} redirectTo="/sign-in" key="admin-properties-protected">
                    <Layout currentPageName="Property Approvals" key="admin-properties-page">
                        <PropertyApprovals key="admin-properties-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/admin/bookings" element={
                <ProtectedRoute requireAdmin={true} allowedRoles={[]} redirectTo="/sign-in" key="admin-bookings-protected">
                    <Layout currentPageName="Booking Oversight" key="admin-bookings-page">
                        <BookingOversight key="admin-bookings-component" />
                    </Layout>
                </ProtectedRoute>
            } />

            {/* ✅ MATERIAL SOURCING ADMIN ROUTES */}
            <Route path="/admin/materials/catalog" element={
                <ProtectedRoute requireAdmin={true} allowedRoles={[]} redirectTo="/sign-in" key="admin-materials-catalog-protected">
                    <Layout currentPageName="Material Catalog" key="admin-materials-catalog-page">
                        <MaterialCatalogManagement key="admin-materials-catalog-component" />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/admin/materials/orders" element={
                <ProtectedRoute requireAdmin={true} allowedRoles={[]} redirectTo="/sign-in" key="admin-materials-orders-protected">
                    <Layout currentPageName="Material Orders" key="admin-materials-orders-page">
                        <MaterialOrderProcessing key="admin-materials-orders-component" />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/admin/clients/onboard" element={
                <ProtectedRoute requireAdmin={true} allowedRoles={[]} redirectTo="/sign-in" key="admin-clients-onboard-protected">
                    <Layout currentPageName="Client Onboarding" key="admin-clients-onboard-page">
                        <ClientOnboardingSystem key="admin-clients-onboard-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/data-seeder" element={
                <ProtectedRoute requireAdmin={true} allowedRoles={[]} redirectTo="/sign-in" key="data-seeder-protected">
                    <Layout currentPageName="DataSeeder" key="data-seeder-page">
                        <DataSeeder key="data-seeder-component" />
                    </Layout>
                </ProtectedRoute>
            } />

            {/* ✅ LEGACY ROUTE REDIRECTS - Handle old uppercase routes */}
            <Route path="/Map" element={<Navigate to="/browse" replace />} />
            <Route path="/Dashboard" element={<Navigate to="/dashboard" replace />} />
            <Route path="/Messages" element={<Navigate to="/messages" replace />} />
            <Route path="/Profile" element={<Navigate to="/profile" replace />} />
            <Route path="/Invoices" element={<Navigate to="/invoices" replace />} />
            <Route path="/Help" element={<Navigate to="/help" replace />} />
            {/* <Route path="/Search" element={<Navigate to="/search" replace />} /> */}
            
        </Routes>
    );
}

export default function Pages() {
    return (
        <Router>
            {/* ❌ TEMPORARILY DISABLED: <ChatBotProvider> */}
                <PagesContent />
            {/* ❌ TEMPORARILY DISABLED: </ChatBotProvider> */}
        </Router>
    );
}