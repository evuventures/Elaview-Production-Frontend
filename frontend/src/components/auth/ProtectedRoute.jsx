// src/components/auth/ProtectedRoute.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import apiClient from '@/api/apiClient';
import { PageLoader } from '@/components/ui/loading';

const ProtectedRoute = ({ 
 children, 
 requireAuth = true,
 requireAdmin = false, 
 allowedRoles = [], 
 redirectTo = '/sign-in',
 skipOnboardingCheck = true
}) => {
 const { isSignedIn, isLoaded } = useAuth();
 const { user } = useUser();
 const location = useLocation();
 
 const [userProfile, setUserProfile] = useState(null);
 const [isCheckingProfile, setIsCheckingProfile] = useState(false);
 
 // Load user profile if signed in
 useEffect(() => {
 const loadUserProfile = async () => {
 if (isSignedIn && user?.id && !userProfile && !isCheckingProfile) {
 setIsCheckingProfile(true);
 try {
 const response = await apiClient.getUserProfile();
 if (response?.success) {
 setUserProfile(response.data);
 }
 } catch (error) {
 console.error('Error loading user profile:', error);
 } finally {
 setIsCheckingProfile(false);
 }
 }
 };
 
 loadUserProfile();
 }, [isSignedIn, user?.id, userProfile, isCheckingProfile]);
 
 // Wait for Clerk to load
 if (!isLoaded) {
 return <PageLoader centered />;
 }
 
 // If authentication is not required, render children immediately
 if (!requireAuth) {
 return children;
 }
 
 // Check authentication for protected routes
 if (!isSignedIn) {
 console.log('User not signed in, redirecting to:', redirectTo);
 return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
 }
 
 // Check admin requirements
 if (requireAdmin && userProfile && userProfile.publicMetadata?.role !== 'admin') {
 console.log('Admin access required, redirecting');
 return <Navigate to="/" replace />;
 }
 
 // Render protected content
 return children;
};

export default ProtectedRoute;