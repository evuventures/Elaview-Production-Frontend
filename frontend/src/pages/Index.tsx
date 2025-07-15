import Layout from "../components/layout/Layout.jsx";
import Bookings from "./bookings/BookingPage.jsx";
import Map from "./map/Map.jsx";
import Messages from "./messages/Messages.tsx";
import Profile from "./user/Profile.jsx";
import Help from "./help/Help.jsx";
import Dashboard from "./dashboard/Dashboard.tsx";
import Invoices from "./payments/Invoices.jsx";
import BookingManagement from "./bookings/BookingManagement.jsx";
import CreateCampaign from "./campaigns/CreateCampaign.jsx";
import CreateProperty from "./properties/CreateProperty.tsx"; // Keep the component name
import PropertyManagement from "./properties/PropertyManagement.jsx";
import DataSeeder from "./DataSeeder.jsx";
import Admin from "./dashboard/Admin.tsx";
import EditProperty from "./properties/EditProperty.jsx";
import Checkout from "./payments/Checkout.jsx";
import CampaignDetails from "./campaigns/CampaignDetails.jsx";
import PaymentTest from "./payments/PaymentTest.jsx";
import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";
import Search from "./search/Search.jsx";
import SignInPage from "./auth/SignIn.jsx";
import SignUpPage from "./auth/SignUp.jsx";
import { ChatBotProvider } from "@/contexts/ChatBotContext";

// 🧪 TEMPORARY DEBUG IMPORTS - Remove after fixing Map component
import ApiDebugTest from "@/dev/debug/ApiDebugTest.jsx";
import MinimalTestMap from "@/dev/debug/MinimalTestMap.tsx";
import TestMapPage from '@/pages/test/TestMapPage.tsx';

import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const PAGES = {
    Browse: Map, // ✅ Map.jsx is your browse page
    Messages: Messages,
    Bookings: Bookings,
    Profile: Profile,
    Help: Help,
    Dashboard: Dashboard,
    Invoices: Invoices,
    BookingManagement: BookingManagement,
    CreateCampaign: CreateCampaign,
    ListSpace: CreateProperty, // ✅ NEW: Use CreateProperty component for list-space route
    PropertyManagement: PropertyManagement,
    DataSeeder: DataSeeder,
    Admin: Admin,
    EditProperty: EditProperty,
    Checkout: Checkout,
    CampaignDetails: CampaignDetails,
    PaymentTest: PaymentTest,
    Search: Search,
    // 🧪 TEMPORARY DEBUG PAGES
    ApiDebugTest: ApiDebugTest,
    MinimalTestMap: MinimalTestMap,
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
            {/* ✅ DEFAULT ROUTE - Redirect to browse */}
            <Route path="/" element={<Navigate to="/browse" replace />} />
            
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
            
            {/* ✅ NATIVE AUTH ROUTES - Custom styled auth pages */}
            <Route path="/sign-in/*" element={
                <Layout currentPageName="Browse" key="sign-in-page">
                    <SignInPage />
                </Layout>
            } />
            <Route path="/sign-up/*" element={
                <Layout currentPageName="Browse" key="sign-up-page">
                    <SignUpPage />
                </Layout>
            } />
            
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
            <Route path="/search" element={
                <Layout currentPageName="Search" key="search-page">
                    <Search key="search-component" />
                </Layout>
            } />
            
            {/* ✅ PROTECTED ROUTES - Authentication required */}
            <Route path="/dashboard" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="dashboard-protected">
                    <Layout currentPageName="Dashboard" key="dashboard-page">
                        <Dashboard key="dashboard-component" />
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
            <Route path="/invoices" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="invoices-protected">
                    <Layout currentPageName="Invoices" key="invoices-page">
                        <Invoices key="invoices-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/booking/:propertyId/:spaceId" element={
    <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="booking-protected">
        <Layout currentPageName="Bookings" key="booking-page">
            <Bookings key="booking-component" />
        </Layout>
    </ProtectedRoute>
} />
            <Route path="/booking-management" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="booking-protected">
                    <Layout currentPageName="BookingManagement" key="booking-page">
                        <BookingManagement key="booking-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/create-campaign" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="create-campaign-protected">
                    <Layout currentPageName="CreateCampaign" key="create-campaign-page">
                        <CreateCampaign key="create-campaign-component" />
                    </Layout>
                </ProtectedRoute>
            } />
            
            {/* ✅ NEW: List Space route (replaces create-property) */}
            <Route path="/list-space" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="list-space-protected">
                    <Layout currentPageName="ListSpace" key="list-space-page">
                        <CreateProperty key="list-space-component" />
                    </Layout>
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
            <Route path="/checkout" element={
                <ProtectedRoute requireAdmin={false} allowedRoles={[]} redirectTo="/sign-in" key="checkout-protected">
                    <Layout currentPageName="Checkout" key="checkout-page">
                        <Checkout key="checkout-component" />
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
            <Route path="/data-seeder" element={
                <ProtectedRoute requireAdmin={true} allowedRoles={[]} redirectTo="/sign-in" key="data-seeder-protected">
                    <Layout currentPageName="DataSeeder" key="data-seeder-page">
                        <DataSeeder key="data-seeder-component" />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/test-map" element={<TestMapPage />} />

            {/* ✅ LEGACY ROUTE REDIRECTS - Handle old uppercase routes */}
            <Route path="/Map" element={<Navigate to="/browse" replace />} />
            <Route path="/Dashboard" element={<Navigate to="/dashboard" replace />} />
            <Route path="/Messages" element={<Navigate to="/messages" replace />} />
            <Route path="/Profile" element={<Navigate to="/profile" replace />} />
            <Route path="/Invoices" element={<Navigate to="/invoices" replace />} />
            <Route path="/Help" element={<Navigate to="/help" replace />} />
            <Route path="/Search" element={<Navigate to="/search" replace />} />
            
        </Routes>
    );
}

export default function Pages() {
    return (
        <Router>
            <ChatBotProvider>
                <PagesContent />
            </ChatBotProvider>
        </Router>
    );
}