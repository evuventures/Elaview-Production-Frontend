// src/pages/Pages.tsx - COMPLETE FILE
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
import Home from "./home/Home.tsx";
import MobileHomePage from "./home/mobile/MobileHomePage.jsx";
import CampaignSelection from "./TEMPUserJourney/CampaignSelection.tsx";
import AdvertiserConfirmationPage from "./TEMPUserJourney/AdvertiserConfirmationPage.tsx";
import SpaceOwnerConfirmationPage from "./TEMPUserJourney/SpaceOwnerConfirmationPage.tsx";
import AIBuilderFlow from "../components/test/AIBuilderFlow.jsx";
import UserManagement from "./admin/UserManagement.tsx";
import PropertyApprovals from "./admin/PropertyApprovals.tsx";
import BookingOversight from "./admin/BookingOversight.tsx";
import MaterialCatalogManagement from "./admin/MaterialCatalogManagement.tsx";
import MaterialOrderProcessing from "./admin/MaterialOrderProcessing.tsx";
import ClientOnboardingSystem from "./admin/ClientOnboardingSystem.tsx";
import ApiDebugTest from "@/dev/debug/ApiDebugTest.jsx";
import MinimalTestMap from "@/dev/debug/MinimalTestMap.tsx";

import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useParams } from 'react-router-dom';
import { useEffect } from 'react';

const PAGES = {
 Home: Home,
 Landing: Landing,
 Browse: Map,
 MobileHome: MobileHomePage,
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
 CampaignSelection: CampaignSelection,
 AdvertiserConfirmation: AdvertiserConfirmationPage,
 SpaceOwnerConfirmation: SpaceOwnerConfirmationPage,
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
 AIBuilderTest: AIBuilderFlow,
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
 {/* HOME PAGE - PUBLIC ACCESS */}
 <Route path="/" element={
 <ProtectedRoute requireAuth={false} skipOnboardingCheck={true} key="home-public">
 <Layout currentPageName="Home" key="home-page">
 <Home key="home-component" />
 </Layout>
 </ProtectedRoute>
 } />
 
 {/* Redirect /home to root */}
 <Route path="/home" element={<Navigate to="/" replace />} />
 
 {/* Legacy landing page redirect */}
 <Route path="/landing" element={<Navigate to="/" replace />} />
 
 {/* DEBUG ROUTES */}
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
 
 {/* AI BUILDER TEST ROUTES - ADMIN ONLY */}
 <Route path="/test/aibuilder" element={
 <ProtectedRoute requireAuth={true} requireAdmin={true} skipOnboardingCheck={true} key="ai-builder-test-protected">
 <Layout currentPageName="AI Builder Test" key="ai-builder-test-page">
 <AIBuilderFlow key="ai-builder-test-component" />
 </Layout>
 </ProtectedRoute>
 } />
 
 {/* AUTH ROUTES - NO LAYOUT */}
 <Route path="/sign-in/*" element={<SignInPage />} />
 <Route path="/sign-up/*" element={<SignUpPage />} />
 
 {/* SSO CALLBACK ROUTE - NO LAYOUT */}
 <Route path="/sso-callback" element={<SSOCallback />} />
 
 {/* STANDALONE PAGES - NO LAYOUT */}
 <Route path="/learn-more" element={<LearnMore />} />
 
 {/* MOBILE HOME PAGE */}
 <Route path="/mobile-home" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="mobile-home-protected">
 <Layout currentPageName="Mobile Home" key="mobile-home-page">
 <MobileHomePage key="mobile-home-component" />
 </Layout>
 </ProtectedRoute>
 } />
 
 {/* PUBLIC ROUTES */}
 <Route path="/browse" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="browse-protected">
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
 
 {/* PROTECTED ROUTES */}
 <Route path="/dashboard" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="dashboard-protected">
 <Layout currentPageName="Dashboard" key="dashboard-page">
 <Dashboard key="dashboard-component" />
 </Layout>
 </ProtectedRoute>
 } />

 <Route path="/advertise" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="advertise-protected">
 <Layout currentPageName="Advertise" key="advertise-page">
 <AdvertisingPage key="advertise-component" />
 </Layout>
 </ProtectedRoute>
 } />

 <Route path="/messages" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="messages-protected">
 <Layout currentPageName="Messages" key="messages-page">
 <Messages key="messages-component" />
 </Layout>
 </ProtectedRoute>
 } />
 
 {/* CAMPAIGN SELECTION ROUTE */}
 <Route path="/CampaignSelection" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="campaign-selection-protected">
 <Layout currentPageName="Campaign Selection" key="campaign-selection-page">
 <CampaignSelection key="campaign-selection-component" />
 </Layout>
 </ProtectedRoute>
 } />

 {/* ADVERTISER CONFIRMATION ROUTE */}
 <Route path="/AdvertiserConfirmation" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="advertiser-confirmation-protected">
 <Layout currentPageName="Confirm Campaign" key="advertiser-confirmation-page">
 <AdvertiserConfirmationPage key="advertiser-confirmation-component" />
 </Layout>
 </ProtectedRoute>
 } />

 {/* SPACE OWNER CONFIRMATION ROUTES */}
 <Route path="/SpaceOwnerConfirmation" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="space-owner-confirmation-protected">
 <Layout currentPageName="Campaign Approval" key="space-owner-confirmation-page">
 <SpaceOwnerConfirmationPage key="space-owner-confirmation-component" />
 </Layout>
 </ProtectedRoute>
 } />

 <Route path="/SpaceOwnerConfirmation/:campaignId" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="space-owner-confirmation-id-protected">
 <Layout currentPageName="Campaign Approval" key="space-owner-confirmation-id-page">
 <SpaceOwnerConfirmationPage key="space-owner-confirmation-id-component" />
 </Layout>
 </ProtectedRoute>
 } />
 
 {/* PROFILE & SETTINGS */}
 <Route path="/profile" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="profile-protected">
 <Layout currentPageName="Profile" key="profile-page">
 <Profile key="profile-component" />
 </Layout>
 </ProtectedRoute>
 } />
 
 <Route path="/settings" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="settings-protected">
 <Layout currentPageName="Settings" key="settings-page">
 <Settings key="settings-component" />
 </Layout>
 </ProtectedRoute>
 } />
 
 <Route path="/invoices" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="invoices-protected">
 <Layout currentPageName="Invoices" key="invoices-page">
 <Invoices key="invoices-component" />
 </Layout>
 </ProtectedRoute>
 } />

 {/* CHECKOUT ROUTES */}
 <Route path="/checkout" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="cart-checkout-protected">
 <Layout currentPageName="Checkout" key="cart-checkout-page">
 <CheckoutPage key="cart-checkout-component" />
 </Layout>
 </ProtectedRoute>
 } />

 <Route path="/checkout/:propertyId/:spaceId" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="space-checkout-protected">
 <Layout currentPageName="Checkout" key="space-checkout-page">
 <CheckoutPage key="space-checkout-component" />
 </Layout>
 </ProtectedRoute>
 } />

 <Route path="/campaign-checkout" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="campaign-checkout-protected">
 <Layout currentPageName="Campaign Checkout" key="campaign-checkout-page">
 <CampaignCheckout key="campaign-checkout-component" />
 </Layout>
 </ProtectedRoute>
 } />

 {/* Legacy redirect */}
 <Route path="/booking/:propertyId/:spaceId" element={<BookingToCheckoutRedirect />} />

 <Route path="/booking-management" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="booking-management-protected">
 <Layout currentPageName="BookingManagement" key="booking-management-page">
 <BookingManagement key="booking-management-component" />
 </Layout>
 </ProtectedRoute>
 } />
 
 <Route path="/create-campaign" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="create-campaign-protected">
 <Layout currentPageName="CreateCampaign" key="create-campaign-page">
 <CreateCampaignWizard key="create-campaign-component" />
 </Layout>
 </ProtectedRoute>
 } />
 
 {/* SPACE MANAGEMENT ROUTES */}
 <Route path="/list-space" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="list-space-protected">
 <CreateListingWizard key="list-space-component" />
 </ProtectedRoute>
 } />

 <Route path="/spaces/:spaceId/edit" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="edit-space-protected">
 <CreateListingWizard key="edit-space-component" />
 </ProtectedRoute>
 } />

 <Route path="/spaces" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="spaces-protected">
 <Layout currentPageName="Spaces" key="spaces-page">
 <MobileSpaces key="spaces-component" />
 </Layout>
 </ProtectedRoute>
 } />

 <Route path="/bookings" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="bookings-protected">
 <Layout currentPageName="Bookings" key="bookings-page">
 <MobileBookings key="bookings-component" />
 </Layout>
 </ProtectedRoute>
 } /> 
 
 {/* Legacy redirects */}
 <Route path="/create-property" element={<Navigate to="/list-space" replace />} />
 <Route path="/createproperty" element={<Navigate to="/list-space" replace />} />
 
 <Route path="/property-management" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="property-management-protected">
 <Layout currentPageName="PropertyManagement" key="property-management-page">
 <PropertyManagement key="property-management-component" />
 </Layout>
 </ProtectedRoute>
 } />
 
 <Route path="/edit-property" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="edit-property-protected">
 <Layout currentPageName="EditProperty" key="edit-property-page">
 <Settings key="edit-property-component" />
 </Layout>
 </ProtectedRoute>
 } />
 
 <Route path="/campaign-details" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="campaign-details-protected">
 <Layout currentPageName="CampaignDetails" key="campaign-details-page">
 <CampaignDetails key="campaign-details-component" />
 </Layout>
 </ProtectedRoute>
 } />
 
 <Route path="/payment-test" element={
 <ProtectedRoute requireAuth={true} skipOnboardingCheck={true} key="payment-test-protected">
 <Layout currentPageName="PaymentTest" key="payment-test-page">
 <PaymentTest key="payment-test-component" />
 </Layout>
 </ProtectedRoute>
 } />
 
 {/* ADMIN ROUTES */}
 <Route path="/admin" element={
 <ProtectedRoute requireAuth={true} requireAdmin={true} skipOnboardingCheck={true} key="admin-protected">
 <Layout currentPageName="Admin" key="admin-page">
 <Admin key="admin-component" />
 </Layout>
 </ProtectedRoute>
 } />
 
 <Route path="/admin/users" element={
 <ProtectedRoute requireAuth={true} requireAdmin={true} skipOnboardingCheck={true} key="admin-users-protected">
 <Layout currentPageName="User Management" key="admin-users-page">
 <UserManagement key="admin-users-component" />
 </Layout>
 </ProtectedRoute>
 } />
 
 <Route path="/admin/properties" element={
 <ProtectedRoute requireAuth={true} requireAdmin={true} skipOnboardingCheck={true} key="admin-properties-protected">
 <Layout currentPageName="Property Approvals" key="admin-properties-page">
 <PropertyApprovals key="admin-properties-component" />
 </Layout>
 </ProtectedRoute>
 } />
 
 <Route path="/admin/bookings" element={
 <ProtectedRoute requireAuth={true} requireAdmin={true} skipOnboardingCheck={true} key="admin-bookings-protected">
 <Layout currentPageName="Booking Oversight" key="admin-bookings-page">
 <BookingOversight key="admin-bookings-component" />
 </Layout>
 </ProtectedRoute>
 } />

 <Route path="/admin/materials/catalog" element={
 <ProtectedRoute requireAuth={true} requireAdmin={true} skipOnboardingCheck={true} key="admin-materials-catalog-protected">
 <Layout currentPageName="Material Catalog" key="admin-materials-catalog-page">
 <MaterialCatalogManagement key="admin-materials-catalog-component" />
 </Layout>
 </ProtectedRoute>
 } />

 <Route path="/admin/materials/orders" element={
 <ProtectedRoute requireAuth={true} requireAdmin={true} skipOnboardingCheck={true} key="admin-materials-orders-protected">
 <Layout currentPageName="Material Orders" key="admin-materials-orders-page">
 <MaterialOrderProcessing key="admin-materials-orders-component" />
 </Layout>
 </ProtectedRoute>
 } />

 <Route path="/admin/clients/onboard" element={
 <ProtectedRoute requireAuth={true} requireAdmin={true} skipOnboardingCheck={true} key="admin-clients-onboard-protected">
 <Layout currentPageName="Client Onboarding" key="admin-clients-onboard-page">
 <ClientOnboardingSystem key="admin-clients-onboard-component" />
 </Layout>
 </ProtectedRoute>
 } />
 
 <Route path="/data-seeder" element={
 <ProtectedRoute requireAuth={true} requireAdmin={true} skipOnboardingCheck={true} key="data-seeder-protected">
 <Layout currentPageName="DataSeeder" key="data-seeder-page">
 <DataSeeder key="data-seeder-component" />
 </Layout>
 </ProtectedRoute>
 } />

 {/* Legacy route redirects */}
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