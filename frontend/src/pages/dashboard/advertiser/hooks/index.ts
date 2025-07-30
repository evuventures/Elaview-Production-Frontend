import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import apiClient from '../../../../api/apiClient.js';
import { 
  DashboardStats, 
  Booking, 
  Material, 
  Space, 
  BookingData,
  CustomDimensions
} from '../types';

// Dashboard data hook
export const useDashboardData = () => {
  const { user, isLoaded: userLoaded } = useUser();
  const [stats, setStats] = useState<DashboardStats>({
    totalSpent: 0,
    activeCampaigns: 0,
    pendingMaterials: 0,
    completedCampaigns: 0
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching advertiser dashboard data for user:', user?.id);
      const response = await apiClient.getAdvertiserDashboard();
      
      if (response.success) {
        console.log('✅ Dashboard data received:', response.data);
        setStats(response.data.stats || {
          totalSpent: 0,
          activeCampaigns: 0,
          pendingMaterials: 0,
          completedCampaigns: 0
        });
        setBookings(response.data.bookings || []);
      } else {
        console.error('❌ Dashboard fetch failed:', response.error);
        setError(response.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('❌ Dashboard error:', err);
      setError('Failed to load dashboard data. Please try again.');
      
      // Show fallback data for development
      setStats({
        totalSpent: 0,
        activeCampaigns: 0,
        pendingMaterials: 0,
        completedCampaigns: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('👤 User loaded:', userLoaded, 'User ID:', user?.id);
    if (userLoaded && user?.id) {
      fetchDashboardData();
    } else if (userLoaded && !user) {
      console.error('❌ User not authenticated');
      setError('Please sign in to view your dashboard');
      setIsLoading(false);
    }
  }, [userLoaded, user?.id]);

  return {
    stats,
    bookings,
    isLoading,
    error,
    refetch: fetchDashboardData
  };
};

// Materials catalog hook
export const useMaterialsCatalog = () => {
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);

  const fetchMaterialsCatalog = async () => {
    setMaterialsLoading(true);
    
    try {
      console.log('📦 Fetching materials catalog...');
      const response = await apiClient.getMaterialsCatalog();
      
      if (response.success) {
        console.log('✅ Materials catalog received:', response.data);
        setAvailableMaterials(response.data.materials || []);
      } else {
        console.error('❌ Materials fetch failed:', response.error);
      }
    } catch (err) {
      console.error('❌ Materials error:', err);
      setAvailableMaterials([]);
    } finally {
      setMaterialsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterialsCatalog();
  }, []);

  return {
    availableMaterials,
    materialsLoading,
    refetch: fetchMaterialsCatalog
  };
};

// Available spaces hook
export const useAvailableSpaces = () => {
  const [searchResults, setSearchResults] = useState<Space[]>([]);
  const [spacesLoading, setSpacesLoading] = useState(false);

  const fetchAvailableSpaces = async (filters = {}) => {
    setSpacesLoading(true);
    
    try {
      console.log('🔍 Fetching available spaces...');
      const response = await apiClient.searchAvailableSpaces(filters);
      
      if (response.success) {
        console.log('✅ Available spaces received:', response.data);
        setSearchResults(response.data.spaces || []);
      } else {
        console.error('❌ Spaces fetch failed:', response.error);
      }
    } catch (err) {
      console.error('❌ Spaces error:', err);
      setSearchResults([]);
    } finally {
      setSpacesLoading(false);
    }
  };

  return {
    searchResults,
    spacesLoading,
    fetchAvailableSpaces
  };
};

// Booking creation hook
export const useBookingCreation = () => {
  const [isCreating, setIsCreating] = useState(false);

  const createBookingWithMaterials = async (bookingData: BookingData) => {
    setIsCreating(true);
    
    try {
      console.log('📋 Creating booking with materials:', bookingData);
      const response = await apiClient.createBookingWithMaterials(bookingData);
      
      if (response.success) {
        console.log('✅ Booking created successfully');
        return { success: true };
      } else {
        console.error('❌ Booking creation failed:', response.error);
        return { success: false, error: response.error };
      }
    } catch (err) {
      console.error('❌ Booking error:', err);
      return { success: false, error: 'Failed to create booking. Please try again.' };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createBookingWithMaterials,
    isCreating
  };
};

// Material selection state hook
export const useMaterialSelection = () => {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [customDimensions, setCustomDimensions] = useState<CustomDimensions>({ 
    width: '', 
    height: '' 
  });
  const [uploadedCreative, setUploadedCreative] = useState<string | null>(null);

  const resetSelection = () => {
    setSelectedMaterial(null);
    setCustomDimensions({ width: '', height: '' });
    setUploadedCreative(null);
  };

  const handleDimensionsChange = (dimensions: CustomDimensions) => {
    setCustomDimensions(dimensions);
  };

  const handleCreativeUpload = () => {
    console.log('📁 File upload clicked');
    setUploadedCreative('design-file.pdf'); // Simulate upload
  };

  return {
    selectedMaterial,
    customDimensions,
    uploadedCreative,
    setSelectedMaterial,
    handleDimensionsChange,
    handleCreativeUpload,
    resetSelection
  };
};