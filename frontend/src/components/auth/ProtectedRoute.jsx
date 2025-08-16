// src/components/auth/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import apiClient from '@/api/apiClient';

/**
 * Enhanced ProtectedRoute component that handles authentication, authorization, and first-time tutorial flow
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authorized
 * @param {boolean} props.requireAdmin - Whether admin access is required
 * @param {string[]} props.allowedRoles - Specific roles that are allowed (optional)
 * @param {string} props.redirectTo - Where to redirect if not authenticated (default: /sign-in)
 * @param {boolean} props.skipIntroCheck - Skip the first-time tutorial check (default: false)
 */
const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  allowedRoles = [], 
  redirectTo = '/sign-in',
  skipIntroCheck = false
}) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(requireAdmin);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingFirstTime, setIsCheckingFirstTime] = useState(!skipIntroCheck);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [hasCheckedIntro, setHasCheckedIntro] = useState(skipIntroCheck);

  // ✅ Development bypass checks
  const shouldSkipIntro = () => {
    // Environment variable bypass
    if (import.meta.env.VITE_SKIP_INTRO === 'true') {
      console.log('🚀 VITE_SKIP_INTRO bypass active');
      return true;
    }
    
    // URL parameter bypass
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('skip_intro') === 'true') {
      console.log('🚀 URL parameter bypass active');
      return true;
    }
    
    // Local storage bypass (for dev reset)
    if (localStorage.getItem('dev_reset_intro') === 'true') {
      console.log('🚀 Dev reset bypass active');
      localStorage.removeItem('dev_reset_intro');
      return false; // This actually forces intro to show
    }
    
    return false;
  };

  // ✅ Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (requireAdmin && isSignedIn && user) {
        try {
          console.log('🔐 Checking admin status for protected route...');
          const response = await apiClient.getUserProfile();
          
          if (response.success) {
            const adminStatus = response.data.isAdmin || response.isAdmin || false;
            console.log('🔐 Admin status:', adminStatus);
            setIsAdmin(adminStatus);
          }
        } catch (error) {
          console.error('❌ Failed to check admin status:', error);
          setIsAdmin(false);
        } finally {
          setIsCheckingAdmin(false);
        }
      } else {
        setIsCheckingAdmin(false);
      }
    };

    if (isLoaded) {
      checkAdminStatus();
    }
  }, [isLoaded, isSignedIn, user, requireAdmin]);

  // ✅ Check first-time login status
  useEffect(() => {
    const checkFirstTimeStatus = async () => {
      if (!skipIntroCheck && isSignedIn && user && !hasCheckedIntro) {
        try {
          console.log('🎯 Checking first-time login status...');
          
          // Check development bypasses first
          if (shouldSkipIntro()) {
            setIsFirstTime(false);
            setHasCheckedIntro(true);
            setIsCheckingFirstTime(false);
            return;
          }
          
          const response = await apiClient.get('/users/first-time-status');
          
          if (response.success) {
            const firstTimeStatus = response.data.isFirstTime;
            console.log('🎯 First-time status:', firstTimeStatus);
            setIsFirstTime(firstTimeStatus);
            setHasCheckedIntro(true);
          } else {
            console.error('❌ Failed to check first-time status:', response.error);
            // Default to false to avoid blocking user
            setIsFirstTime(false);
            setHasCheckedIntro(true);
          }
        } catch (error) {
          console.error('❌ Error checking first-time status:', error);
          // Default to false to avoid blocking user
          setIsFirstTime(false);
          setHasCheckedIntro(true);
        } finally {
          setIsCheckingFirstTime(false);
        }
      } else if (skipIntroCheck) {
        setIsCheckingFirstTime(false);
        setHasCheckedIntro(true);
      }
    };

    if (isLoaded) {
      checkFirstTimeStatus();
    }
  }, [isLoaded, isSignedIn, user, skipIntroCheck, hasCheckedIntro]);

  // Show loading state while checking
  if (!isLoaded || isCheckingAdmin || isCheckingFirstTime) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="text-center text-sm text-muted-foreground">
                {isCheckingAdmin ? 'Verifying access...' : 
                 isCheckingFirstTime ? 'Checking tutorial status...' : 
                 'Loading...'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    const returnUrl = location.pathname + location.search;
    return <Navigate to={`${redirectTo}?redirect_url=${encodeURIComponent(returnUrl)}`} replace />;
  }

  // ✅ First-time user redirect to intro (unless bypassed or specific routes)
  if (!skipIntroCheck && isFirstTime && hasCheckedIntro) {
    // Don't redirect if already on intro page or specific excluded routes
    const excludedPaths = ['/intro', '/sign-out', '/help'];
    const isExcludedPath = excludedPaths.some(path => 
      location.pathname.startsWith(path)
    );
    
    if (!isExcludedPath) {
      console.log('🎯 Redirecting first-time user to intro page');
      return <Navigate to="/intro" replace />;
    }
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    console.log('🚫 Admin access denied - user is not admin');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">
              Access Denied
            </h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access this page. Admin access is required.
            </p>
            <button 
              onClick={() => window.history.back()}
              className="text-primary hover:underline"
            >
              Go Back
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check specific role requirements
  if (allowedRoles.length > 0) {
    const userRole = user?.publicMetadata?.role || user?.privateMetadata?.role || 'USER';
    const hasAllowedRole = allowedRoles.includes(userRole);
    
    if (!hasAllowedRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-96">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-destructive mb-2">
                Access Denied
              </h2>
              <p className="text-muted-foreground mb-4">
                You don't have the required role to access this page.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Required roles: {allowedRoles.join(', ')}
              </p>
              <button 
                onClick={() => window.history.back()}
                className="text-primary hover:underline"
              >
                Go Back
              </button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // User is authenticated and authorized, render the protected content
  console.log('✅ Access granted - rendering protected content');
  return children;
};

export default ProtectedRoute;