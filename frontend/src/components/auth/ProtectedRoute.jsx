// src/components/auth/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import apiClient from '@/api/apiClient';

/**
 * ProtectedRoute component that handles authentication and authorization
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authorized
 * @param {boolean} props.requireAdmin - Whether admin access is required
 * @param {string[]} props.allowedRoles - Specific roles that are allowed (optional)
 * @param {string} props.redirectTo - Where to redirect if not authenticated (default: /sign-in)
 */
const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  allowedRoles = [], 
  redirectTo = '/sign-in' 
}) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(requireAdmin);
  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ NEW: Check admin status from backend
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

  // Show loading state while Clerk is initializing or checking admin status
  if (!isLoaded || isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="text-center text-sm text-muted-foreground">
                {isCheckingAdmin ? 'Verifying access...' : 'Loading...'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    // ✅ FIXED: Store the attempted URL to redirect back after sign-in
    const returnUrl = location.pathname + location.search;
    return <Navigate to={`${redirectTo}?redirect_url=${encodeURIComponent(returnUrl)}`} replace />;
  }

  // ✅ UPDATED: Check admin requirement using isAdmin from backend
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

  // Check specific role requirements (kept for backward compatibility)
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