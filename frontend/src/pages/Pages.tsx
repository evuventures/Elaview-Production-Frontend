// src/pages/Pages.tsx - UPDATED with Mobile Home Page routing
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
import SignInPage from "./auth/SignIn.jsx";
import SignUpPage from "./auth/SignUp.jsx";
import LearnMore from "./learn-more/LearnMore.jsx";
import SSOCallback from "./auth/SSOCallback.jsx";
import DebugSignUpPage from "./auth/DebugSignUp.jsx";
import MobileDashboard from "./dashboard/mobile/MobileDashboard.jsx";
import MobileSpaces from "./dashboard/mobile/MobileSpaces.jsx";
import MobileBookings from "./dashboard/mobile/MobileBookings.jsx";

// ✅ NEW: Mobile Home Page Import
import MobileHomePage from "./home/MobileHomePage.jsx";

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

// ✅ UPDATED: Added MobileHomePage to PAGES object
const PAGES = {
    Landing: Landing,
    Browse: Map,
    Home: MobileHomePage,  // ✅ NEW: Mobile home page
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
    ApiDebugTest: ApiDebugTest,
    MinimalTestMap: MinimalTestMap,
    MobileDashboard: MobileDashboard,
    MobileSpaces: MobileSpaces,
    MobileBookings: MobileBookings,
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
            
            {/* ✅ NEW: MOBILE HOME PAGE - Onboarding handles routing here */}
            <Route path="/home" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="home-protected">
                    <Layout currentPageName="Home" key="home-page">
                        <MobileHomePage key="home-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            
            {/* ✅ PUBLIC ROUTES - Onboarding check handled in ProtectedRoute */}
            <Route path="/browse" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="browse-protected">
                    <Layout currentPageName="Browse" key="browse-page">
                        <Map key="map-browse" />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/map" element={<Navigate to="/browse" replace />} />
            <Route path="/help" element={
                <Layout currentPageName="Help" key="help-page">
                    <Help key="help-component" />
                </Layout>
            } />
            
            {/* ✅ PROTECTED ROUTES - Standard Protection with onboarding */}
            <Route path="/dashboard" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="dashboard-protected">
                    <Layout currentPageName="Dashboard" key="dashboard-page">
                        <Dashboard key="dashboard-component" />
                    </Layout>
                </ProtectedRoute>
            } />

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
            
            {/* ✅ PROFILE & SETTINGS - Skip onboarding check since these are management pages */}
            <Route path="/profile" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" skipOnboardingCheck={true} key="profile-protected">
                    <Layout currentPageName="Profile" key="profile-page">
                        <Profile key="profile-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" skipOnboardingCheck={true} key="settings-protected">
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

            {/* ✅ CHECKOUT ROUTES */}
            <Route path="/checkout" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="cart-checkout-protected">
                    <Layout currentPageName="Checkout" key="cart-checkout-page">
                        <CheckoutPage key="cart-checkout-component" />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/checkout/:propertyId/:spaceId" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="space-checkout-protected">
                    <Layout currentPageName="Checkout" key="space-checkout-page">
                        <CheckoutPage key="space-checkout-component" />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/campaign-checkout" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="campaign-checkout-protected">
                    <Layout currentPageName="Campaign Checkout" key="campaign-checkout-page">
                        <CampaignCheckout key="campaign-checkout-component" />
                    </Layout>
                </ProtectedRoute>
            } />

            {/* ✅ Legacy redirect */}
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
            
            {/* ✅ List Space route - No special onboarding handling needed */}
            <Route path="/list-space" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="list-space-protected">
                    <CreateListingWizard key="list-space-component" />
                </ProtectedRoute>
            } />

            <Route path="/spaces" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="spaces-protected">
                    <Layout currentPageName="Spaces" key="spaces-page">
                        <MobileSpaces key="spaces-component" />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/bookings" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="bookings-protected">
                    <Layout currentPageName="Bookings" key="bookings-page">
                        <MobileBookings key="bookings-component" />
                    </Layout>
               </ProtectedRoute>
            } />         
            
            {/* ✅ Legacy redirects */}
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
            
            {/* ✅ ADMIN ROUTES - Using regular ProtectedRoute with admin requirement */}
            <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true} allowedRoles={[]} redirectTo="/sign-in" skipOnboardingCheck={true} key="admin-protected">
                    <Layout currentPageName="Admin" key="admin-page">
                        <Admin key="admin-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/admin/users" element={
                <ProtectedRoute requireAdmin={true} allowedRoles={[]} redirectTo="/sign-in" skipOnboardingCheck={true} key="admin-users-protected">
                    <Layout currentPageName="User Management" key="admin-users-page">
                        <UserManagement key="admin-users-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/admin/properties" element={
                <ProtectedRoute requireAdmin={true} allowedRoles={[]} redirectTo="/sign-in" skipOnboardingCheck={true} key="admin-properties-protected">
                    <Layout currentPageName="Property Approvals" key="admin-properties-page">
                        <PropertyApprovals key="admin-properties-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/admin/bookings" element={
                <ProtectedRoute requireAdmin={true} allowedRoles={[]} redirectTo="/sign-in" skipOnboardingCheck={true} key="admin-bookings-protected">
                    <Layout currentPageName="Booking Oversight" key="admin-bookings-page">
                        <BookingOversight key="admin-bookings-component" />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/admin/materials/catalog" element={
                <ProtectedRoute requireAdmin={true} allowedRoles={[]} redirectTo="/sign-in" skipOnboardingCheck={true} key="admin-materials-catalog-protected">
                    <Layout currentPageName="Material Catalog" key="admin-materials-catalog-page">
                        <MaterialCatalogManagement key="admin-materials-catalog-component" />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/admin/materials/orders" element={
                <ProtectedRoute requireAdmin={true} allowedRoles={[]} redirectTo="/sign-in" skipOnboardingCheck={true} key="admin-materials-orders-protected">
                    <Layout currentPageName="Material Orders" key="admin-materials-orders-page">
                        <MaterialOrderProcessing key="admin-materials-orders-component" />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/admin/clients/onboard" element={
                <ProtectedRoute requireAdmin={true} allowedRoles={[]} redirectTo="/sign-in" skipOnboardingCheck={true} key="admin-clients-onboard-protected">
                    <Layout currentPageName="Client Onboarding" key="admin-clients-onboard-page">
                        <ClientOnboardingSystem key="admin-clients-onboard-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/data-seeder" element={
                <ProtectedRoute requireAdmin={true} allowedRoles={[]} redirectTo="/sign-in" skipOnboardingCheck={true} key="data-seeder-protected">
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