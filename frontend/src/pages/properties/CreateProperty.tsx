import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';

// Import types
import { 
  PropertyFormData, 
  FormErrors, 
  SavedFormData,
  getDefaultFormData,
  STORAGE_KEYS,
  validateEmail,
  validatePhone,
  validateZipCode 
} from '@/types/property';

// Import components
import PropertyBasicsStep from '@/components/new-listings/PropertyBasicsStep';
import AdvertisingAreasStep from '@/components/new-listings/AdvertisingAreasStep';
import ReviewStep from '@/components/new-listings/ReviewStep';
import SavedDataAlert from '@/components/new-listings/SavedDataAlert';
import ProgressSteps from '@/components/new-listings/ProgressSteps';

// Simple UI Components
const Button = ({ children, onClick, disabled, variant = 'default', className = '', ...props }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
      variant === 'outline' 
        ? 'border-2 border-border bg-background text-foreground hover:bg-muted' 
        : 'bg-primary text-primary-foreground hover:bg-primary/90'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Card = ({ children, className = '', ...props }: any) => (
  <div className={`bg-background border border-border rounded-lg shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

const CardContent = ({ children, className = '', ...props }: any) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

const Alert = ({ children, className = '', ...props }: any) => (
  <div className={`border border-border rounded-lg p-4 ${className}`} {...props}>
    {children}
  </div>
);

const AlertDescription = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

// ✅ API Configuration
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000,
  retries: 3
};

// ✅ FIXED: Clerk Authentication Helper
const getClerkToken = async () => {
  try {
    // Method 1: Try window.Clerk (most reliable)
    if (typeof window !== 'undefined' && window.Clerk) {
      const session = window.Clerk.session;
      if (session) {
        return await session.getToken();
      }
    }

    // Method 2: Try direct session access
    if (typeof window !== 'undefined' && window.Clerk?.client?.sessions?.[0]) {
      return await window.Clerk.client.sessions[0].getToken();
    }

    throw new Error('No valid Clerk session found');
  } catch (error) {
    console.error('Failed to get Clerk token:', error);
    throw new Error('Authentication failed - please sign in again');
  }
};

// ✅ Enhanced API Helper with proper auth
const apiCall = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    // Get fresh token for each request
    const token = await getClerkToken();
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const parsedError = JSON.parse(errorData);
        errorMessage = parsedError.message || parsedError.error || errorMessage;
      } catch {
        if (errorData) errorMessage = errorData;
      }

      // Enhanced error messages
      switch (response.status) {
        case 401:
          errorMessage = 'Authentication failed - please sign in again';
          break;
        case 403:
          errorMessage = 'Permission denied - you may not have access to this resource';
          break;
        case 422:
          errorMessage = 'Invalid data provided - please check your inputs';
          break;
        case 500:
          errorMessage = 'Server error - please try again later';
          break;
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server. Please check if the backend is running.');
    }
    
    throw error;
  }
};

// ✅ Health check without auth
const healthCheck = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/health`, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' }
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    clearTimeout(timeoutId);
    return false;
  }
};

export default function CreatePropertyPage(): JSX.Element {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  // ✅ FIXED: Use both useUser and useAuth
  const { user: currentUser } = useUser();
  const { isSignedIn, getToken } = useAuth();

  // Form state
  const [formData, setFormData] = useState<PropertyFormData>(getDefaultFormData());
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [hasSavedData, setHasSavedData] = useState<boolean>(false);

  // Form steps
  const steps = [
    {
      id: 1,
      title: 'Property Basics',
      description: 'Basic information and location',
      isComplete: currentStep > 1,
      isActive: currentStep === 1
    },
    {
      id: 2,
      title: 'Advertising Areas',
      description: 'Define advertising spaces',
      isComplete: currentStep > 2,
      isActive: currentStep === 2
    },
    {
      id: 3,
      title: 'Review & Submit',
      description: 'Review and publish',
      isComplete: false,
      isActive: currentStep === 3
    }
  ];

  // ✅ Check backend connectivity
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const isConnected = await healthCheck();
        setBackendStatus(isConnected ? 'connected' : 'disconnected');
        
        if (isConnected) {
          console.log('✅ Backend connected successfully');
        } else {
          console.error('❌ Backend health check failed');
          setErrors({
            backend: 'Backend server is not responding. Please contact support.'
          });
        }
      } catch (error) {
        setBackendStatus('disconnected');
        console.error('❌ Backend connection failed:', error);
        setErrors({
          backend: `Backend connection failed: ${error.message}`
        });
      }
    };

    checkBackend();
  }, []);

  // Load saved data
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedDataString = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
        const savedStep = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP);

        if (savedDataString) {
          const savedData: SavedFormData = JSON.parse(savedDataString);
          setFormData(savedData.data);
          setHasSavedData(true);
          
          if (savedStep) {
            setCurrentStep(parseInt(savedStep, 10));
          }
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
        localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedData();
  }, []);

  // Save form data
  const saveFormData = (data: PropertyFormData, step: number) => {
    try {
      const savedData: SavedFormData = {
        data,
        timestamp: new Date().toISOString(),
        step,
        version: '1.0'
      };

      localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(savedData));
      localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, step.toString());
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  };

  // Clear saved data
  const clearSavedData = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
      setHasSavedData(false);
    } catch (error) {
      console.warn('Could not clear saved data:', error);
    }
  };

  // Auto-save
  useEffect(() => {
    if (!isLoading) {
      saveFormData(formData, currentStep);
    }
  }, [formData, currentStep, isLoading]);

  // Validation functions
  // Replace your validateStep1 function in src/pages/properties/CreateProperty.tsx

const validateStep1 = (): boolean => {
  const newErrors: Record<string, string | null> = {};

  if (!formData.property_name.trim()) {
    newErrors.property_name = 'Property name is required';
  }

  if (!formData.property_type) {
    newErrors.property_type = 'Property type is required';
  }

  if (!formData.description.trim()) {
    newErrors.description = 'Property description is required';
  } else if (formData.description.length < 50) {
    newErrors.description = 'Description must be at least 50 characters';
  }

  if (!formData.total_sqft || formData.total_sqft <= 0) {
    newErrors.total_sqft = formData.property_type === 'VEHICLE_FLEET' 
      ? 'Number of vehicles must be greater than 0'
      : 'Total square footage must be greater than 0';
  }

  // Conditional address validation based on property type
  const isSemiTruck = formData.property_type === 'VEHICLE_FLEET';
  
  if (!isSemiTruck) {
    // Regular properties need full address
    if (!formData.location.address.trim()) {
      newErrors.location_address = 'Property address is required';
    }
  }
  
  // Both property types need city and zipcode
  if (!formData.location.city.trim()) {
    newErrors.city = 'City is required';
  }

  if (!formData.location.zipcode.trim()) {
    newErrors.zipcode = 'ZIP code is required';
  } else if (!validateZipCode(formData.location.zipcode)) {
    newErrors.zipcode = 'Invalid ZIP code format';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string | null> = {};

    if (formData.advertising_areas.length === 0) {
      newErrors.advertising_areas = 'At least one advertising area is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const handleNext = () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    } else {
      isValid = true;
    }

    if (isValid && currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // ✅ FIXED: Enhanced submission with proper auth
  const handleSubmit = async () => {
    // Pre-submission checks
    if (backendStatus === 'disconnected') {
      setErrors({
        submit: 'Cannot submit property - backend server is not available. Please contact support.'
      });
      return;
    }

    if (!isSignedIn) {
      setErrors({
        submit: 'Please sign in to create a property.'
      });
      return;
    }

    if (!validateStep1() || !validateStep2()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      console.log('🚀 Starting property submission...');
      console.log('Current user:', currentUser);
      console.log('Is signed in:', isSignedIn);

      // Prepare property payload
      const propertyPayload = {
        ...formData,
        user_id: currentUser?.id,
        status: 'review',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📝 Property payload:', propertyPayload);
      console.log('🌍 API endpoint:', `${API_CONFIG.baseUrl}/properties`);

      // Submit to database
      const result = await apiCall(`${API_CONFIG.baseUrl}/properties`, {
        method: 'POST',
        body: JSON.stringify(propertyPayload)
      });

      console.log('✅ Property created successfully:', result);
      
      // Clear saved form data
      clearSavedData();
      
      // Navigate to success page
      if (result.property_id || result.id) {
        const propertyId = result.property_id || result.id;
        navigate(`/properties/${propertyId}?created=true`);
      } else {
        navigate('/dashboard?property_created=true');
      }

    } catch (error) {
      console.error('❌ Property submission failed:', error);
      
      let errorMessage = 'Failed to create property. Please try again.';
      
      if (error.message.includes('Authentication failed')) {
        errorMessage = 'Authentication expired. Please sign in again.';
        // Optionally trigger re-authentication
      } else if (error.message.includes('Permission denied')) {
        errorMessage = 'You do not have permission to create properties. Please contact support.';
      } else if (error.message.includes('Invalid data')) {
        errorMessage = 'Invalid property data. Please check your inputs and try again.';
      } else if (error.message.includes('Server error')) {
        errorMessage = 'Server error. Please try again later or contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Test authentication
  const testAuth = async () => {
    try {
      const token = await getClerkToken();
      console.log('🔑 Auth test successful, token length:', token?.length);
      alert('Authentication working! Check console for token details.');
    } catch (error) {
      console.error('🔑 Auth test failed:', error);
      alert(`Authentication failed: ${error.message}`);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PropertyBasicsStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 2:
        return (
          <AdvertisingAreasStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 3:
        return (
          <ReviewStep
            formData={formData}
            onEdit={setCurrentStep}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading property form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Create New Property Listing
          </h1>
          <p className="text-muted-foreground">
            Add your property to connect with advertisers looking for space.
          </p>
          
          {/* ✅ Status Indicators */}
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                backendStatus === 'connected' ? 'bg-green-500' :
                backendStatus === 'disconnected' ? 'bg-red-500' :
                'bg-yellow-500 animate-pulse'
              }`}></div>
              <span className="text-sm text-muted-foreground">
                {backendStatus === 'connected' ? 'Database connected' :
                 backendStatus === 'disconnected' ? 'Database unavailable' :
                 'Checking database...'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isSignedIn ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-muted-foreground">
                {isSignedIn ? 'Authenticated' : 'Not signed in'}
              </span>
            </div>

            {/* ✅ Debug button for testing auth */}
            {process.env.NODE_ENV === 'development' && (
              <Button
                variant="outline"
                onClick={testAuth}
                className="text-xs px-2 py-1"
              >
                Test Auth
              </Button>
            )}
          </div>
        </div>

        {/* Backend Connection Error */}
        {errors.backend && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              <strong>Database Connection Error:</strong><br />
              {errors.backend}
            </AlertDescription>
          </Alert>
        )}

        {/* Authentication Error */}
        {!isSignedIn && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertDescription className="text-yellow-700">
              <strong>Authentication Required:</strong><br />
              Please sign in to create a property listing.
            </AlertDescription>
          </Alert>
        )}

        {/* Saved Data Alert */}
        {hasSavedData && (
          <div className="mb-6">
            <SavedDataAlert onDiscard={clearSavedData} />
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <ProgressSteps
            steps={steps}
            currentStep={currentStep}
          />
        </div>

        {/* Main Content */}
        <Card>
          <CardContent>
            {/* Step Content */}
            <div className="mb-8">
              {renderStepContent()}
            </div>

            {/* Global Errors */}
            {errors.submit && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {errors.submit}
                </AlertDescription>
              </Alert>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-border">
              <div>
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={isSubmitting}
                  >
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex space-x-3">
                {currentStep < 3 ? (
                  <Button
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || backendStatus === 'disconnected' || !isSignedIn}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving to Database...
                      </div>
                    ) : (
                      'Create Property'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}