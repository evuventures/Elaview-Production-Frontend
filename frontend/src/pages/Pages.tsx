import Layout from "../components/layout/Layout.tsx";
import Landing from "./landing/LandingPage.jsx";
import CheckoutPage from "./checkout/CheckoutPage.jsx";
import AdvertisingPage from "./dashboard/advertiser/AdvertiserDashboard.tsx";
import Map from "./browse/BrowsePage.jsx";
import Messages from "./messages/MessagesPage.tsx";
import Profile from "./user/Profile.jsx";
import Settings from "./user/Settings.jsx";
import Help from "./help/Help.jsx";
import Dashboard from "./dashboard/owner/OwnerDashboard.tsx";
import Invoices from "./payments/Invoices.jsx";
import BookingManagement from "./bookings/BookingManagement.jsx";
import CreateCampaignWizard from "./campaigns/CreateCampaignWizard.jsx";
import CreateListingWizard from "./dashboard/owner/components/create-listing";
import PropertyManagement from "./properties/PropertyManagement.jsx";
import DataSeeder from "./DataSeeder.jsx";
import Admin from "./dashboard/admin/Admin.tsx";
import EditProperty from "./properties/EditProperty.jsx";
import CampaignCheckout from "./payments/Checkout.jsx";
import CampaignDetails from "./campaigns/CampaignDetails.jsx";
import PaymentTest from "./payments/PaymentTest.jsx";
import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";
import EnhancedProtectedRoute from "../components/auth/ProtectedRoute.jsx"; // ✅ NEW: Enhanced route with intro logic
import SignInPage from "./auth/SignIn.jsx";
import SignUpPage from "./auth/SignUp.jsx";
import LearnMore from "./learn-more/LearnMore.jsx";
import SSOCallback from "./auth/SSOCallback.jsx";
import DebugSignUpPage from "./auth/DebugSignUp.jsx";

// ✅ NEW: Import IntroPage
import IntroPage from "./onboarding/IntroPage.jsx";

// Admin page imports
import UserManagement from "./admin/UserManagement.tsx";
import PropertyApprovals from "./admin/PropertyApprovals.tsx";
import BookingOversight from "./admin/BookingOversight.tsx";
import MaterialCatalogManagement from "./admin/MaterialCatalogManagement.tsx";
import MaterialOrderProcessing from "./admin/MaterialOrderProcessing.tsx";
import ClientOnboardingSystem from "./admin/ClientOnboardingSystem.tsx";

// Debug imports
import ApiDebugTest from "@/dev/debug/ApiDebugTest.jsx";
import MinimalTestMap from "@/dev/debug/MinimalTestMap.tsx";

import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useParams } from 'react-router-dom';
import { useEffect } from 'react';

// ✅ UPDATED: Added IntroPage to PAGES object
const PAGES = {
    Landing: Landing,
    Browse: Map,
    Messages: Messages,
    CheckoutPage: CheckoutPage,
    CampaignCheckout: CampaignCheckout,
    AdvertisingPage: AdvertisingPage,
    Profile: Profile,
    Settings: Settings,
    Help: Help,
    Dashboard: Dashboard,
    Invoices: Invoices,
    BookingManagement: BookingManagement,
    CreateCampaign: CreateCampaignWizard,
    ListSpace: CreateListingWizard,
    PropertyManagement: PropertyManagement,
    DataSeeder: DataSeeder,
    Admin: Admin,
    UserManagement: UserManagement,
    PropertyApprovals: PropertyApprovals,
    BookingOversight: BookingOversight,
    MaterialCatalogManagement: MaterialCatalogManagement,
    MaterialOrderProcessing: MaterialOrderProcessing,
    ClientOnboardingSystem: ClientOnboardingSystem,
    EditProperty: EditProperty,
    CampaignDetails: CampaignDetails,
    PaymentTest: PaymentTest,
    LearnMore: LearnMore,
    SSOCallback: SSOCallback,
    DebugSignUp: DebugSignUpPage,
    IntroPage: IntroPage, // ✅ NEW: IntroPage component
    ApiDebugTest: ApiDebugTest,
    MinimalTestMap: MinimalTestMap,
}

function BookingToCheckoutRedirect() {
    const { propertyId, spaceId } = useParams();
    
    console.log('🔄 Redirecting from /booking to /checkout');
    console.log('Property ID:', propertyId);
    console.log('Space ID:', spaceId);
    
    const redirectUrl = `/checkout/${propertyId}/${spaceId}`;
    console.log('🧭 Redirecting to:', redirectUrl);
    
    return <Navigate to={redirectUrl} replace />;
}

function PagesContent() {
    const location = useLocation();

    useEffect(() => {
        console.log('🔄 Route changed to:', location.pathname);
        
        if (location.pathname !== '/browse' && location.pathname !== '/map') {
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
            
            {/* ✅ NEW: INTRO ROUTE - First-time tutorial (no layout, no protection) */}
            <Route path="/intro" element={<IntroPage />} />
            
            {/* 🧪 TEMPORARY DEBUG ROUTES */}
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
            
            <Route path="/debug-signup" element={<DebugSignUpPage />} />
            
            {/* ✅ AUTH ROUTES - NO LAYOUT */}
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />
            
            {/* ✅ SSO CALLBACK ROUTE - NO LAYOUT */}
            <Route path="/sso-callback" element={<SSOCallback />} />
            
            {/* ✅ STANDALONE PAGES - NO LAYOUT */}
            <Route path="/learn-more" element={<LearnMore />} />
            
            {/* ✅ PUBLIC ROUTES - Enhanced Protection with Intro Check */}
            <Route path="/browse" element={
                <EnhancedProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" skipIntroCheck={false} key="browse-protected">
                    <Layout currentPageName="Browse" key="browse-page">
                        <Map key="map-browse" />
                    </Layout>
                </EnhancedProtectedRoute>
            } />
            <Route path="/map" element={<Navigate to="/browse" replace />} />
            <Route path="/help" element={
                <Layout currentPageName="Help" key="help-page">
                    <Help key="help-component" />
                </Layout>
            } />
            
            {/* ✅ PROTECTED ROUTES - Enhanced Protection with Intro Check */}
            <Route path="/dashboard" element={
                <EnhancedProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" skipIntroCheck={false} key="dashboard-protected">
                    <Layout currentPageName="Dashboard" key="dashboard-page">
                        <Dashboard key="dashboard-component" />
                    </Layout>
                </EnhancedProtectedRoute>
            } />

            <Route path="/advertise" element={
                <EnhancedProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" skipIntroCheck={false} key="bookings-protected">
                    <Layout currentPageName="Bookings" key="bookings-page">
                        <AdvertisingPage key="bookings-component" />
                    </Layout>
                </EnhancedProtectedRoute>
            } />

            <Route path="/messages" element={
                <EnhancedProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" skipIntroCheck={false} key="messages-protected">
                    <Layout currentPageName="Messages" key="messages-page">
                        <Messages key="messages-component" />
                    </Layout>
                </EnhancedProtectedRoute>
            } />
            
            <Route path="/profile" element={
                <EnhancedProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" skipIntroCheck={false} key="profile-protected">
                    <Layout currentPageName="Profile" key="profile-page">
                        <Profile key="profile-component" />
                    </Layout>
                </EnhancedProtectedRoute>
            } />
            
            <Route path="/settings" element={
                <EnhancedProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" skipIntroCheck={false} key="settings-protected">
                    <Layout currentPageName="Settings" key="settings-page">
                        <Settings key="settings-component" />
                    </Layout>
                </EnhancedProtectedRoute>
            } />
            
            <Route path="/invoices" element={
                <EnhancedProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" skipIntroCheck={false} key="invoices-protected">
                    <Layout currentPageName="Invoices" key="invoices-page">
                        <Invoices key="invoices-component" />
                    </Layout>
                </EnhancedProtectedRoute>
            } />

            {/* ✅ CHECKOUT ROUTES */}
            <Route path="/checkout" element={
                <EnhancedProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" skipIntroCheck={false} key="cart-checkout-protected">
                    <Layout currentPageName="Checkout" key="cart-checkout-page">
                        <CheckoutPage key="cart-checkout-component" />
                    </Layout>
                </EnhancedProtectedRoute>
            } />

            <Route path="/checkout/:propertyId/:spaceId" element={
                <EnhancedProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" skipIntroCheck={false} key="space-checkout-protected">
                    <Layout currentPageName="Checkout" key="space-checkout-page">
                        <CheckoutPage key="space-checkout-component" />
                    </Layout>
                </EnhancedProtectedRoute>
            } />

            <Route path="/campaign-checkout" element={
                <EnhancedProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" skipIntroCheck={false} key="campaign-checkout-protected">
                    <Layout currentPageName="Campaign Checkout" key="campaign-checkout-page">
                        <CampaignCheckout key="campaign-checkout-component" />
                    </Layout>
                </EnhancedProtectedRoute>
            } />

            {/* ✅ Legacy redirect */}
            <Route path="/booking/:propertyId/:spaceId" element={<BookingToCheckoutRedirect />} />

            <Route path="/booking-management" element={
                <EnhancedProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" skipIntroCheck={false} key="booking-management-protected">
                    <Layout currentPageName="BookingManagement" key="booking-management-page">
                        <BookingManagement key="booking-management-component" />
                    </Layout>
                </EnhancedProtectedRoute>
            } />
            
            <Route path="/create-campaign" element={
                <EnhancedProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" skipIntroCheck={false} key="create-campaign-protected">
                    <Layout currentPageName="CreateCampaign" key="create-campaign-page">
                        <CreateCampaignWizard key="create-campaign-component" />
                    </Layout>
                </EnhancedProtectedRoute>
            } />
            
            {/* ✅ List Space route - Skip intro check since it's a creation flow */}
            <Route path="/list-space" element={
                <EnhancedProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" skipIntroCheck={true} key="list-space-protected">
                    <CreateListingWizard key="list-space-component" />
                </EnhancedProtectedRoute>
            } />
            
            {/* ✅ Legacy redirects */}
            <Route path="/create-property" element={<Navigate to="/list-space" replace />} />
            <Route path="/createproperty" element={<Navigate to="/list-space" replace />} />
            
            <Route path="/property-management" element={
                <EnhancedProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" skipIntroCheck={false} key="property-management-protected">
                    <Layout currentPageName="PropertyManagement" key="property-management-page">
                        <PropertyManagement key="property-management-component" />
                    </Layout>
                </EnhancedProtectedRoute>
            } />
            
            <Route path="/edit-property" element={
                <EnhancedProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" skipIntroCheck={false} key="edit-property-protected">
                    <Layout currentPageName="EditProperty" key="edit-property-page">
                        <EditProperty key="edit-property-component" />
                    </Layout>
                </EnhancedProtectedRoute>
            } />
            
            <Route path="/campaign-details" element={
                <EnhancedProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" skipIntroCheck={false} key="campaign-details-protected">
                    <Layout currentPageName="CampaignDetails" key="campaign-details-page">
                        <CampaignDetails key="campaign-details-component" />
                    </Layout>
                </EnhancedProtectedRoute>
            } />
            
            <Route path="/payment-test" element={
                <EnhancedProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" skipIntroCheck={false} key="payment-test-protected">
                    <Layout currentPageName="PaymentTest" key="payment-test-page">
                        <PaymentTest key="payment-test-component" />
                    </Layout>
                </EnhancedProtectedRoute>
            } />
            
            {/* ✅ ADMIN ROUTES - Using original ProtectedRoute since admin flow is different */}
            <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true} allowedRoles={[]} redirectTo="/sign-in" key="admin-protected">
                    <Layout currentPageName="Admin" key="admin-page">
                        <Admin key="admin-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            
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

            {/* ✅ Legacy route redirects */}
            <Route path="/Map" element={<Navigate to="/browse" replace />} />
            <Route path="/Dashboard" element={<Navigate to="/dashboard" replace />} />
            <Route path="/Messages" element={<Navigate to="/messages" replace />} />
            <Route path="/Profile" element={<Navigate to="/profile" replace />} />
            <Route path="/Invoices" element={<Navigate to="/invoices" replace />} />
            <Route path="/Help" element={<Navigate to="/help" replace />} />
            
        </Routes>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}