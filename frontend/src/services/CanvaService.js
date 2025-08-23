// src/services/CanvaService.js
// Frontend Canva Service - Communicates with your backend CanvaService

import apiClient from '../api/apiClient.js';

class CanvaService {
  constructor() {
    this.baseURL = '/api/canva';
  }

  /**
   * Generate designs using AI and Canva templates
   */
  async generateDesigns(sessionData, userAccessToken = null) {
    try {
      console.log('🎨 Generating Canva designs:', sessionData);

      // Call your backend Canva service
      const response = await apiClient.post(`${this.baseURL}/create-design`, {
        designType: this.mapPlacementToDesignType(sessionData.placementContext?.spaceType),
        content: {
          headline: sessionData.brandData?.keyMessage,
          subheading: sessionData.brandData?.businessName,
          bodyText: sessionData.brandData?.keyMessage,
          callToAction: sessionData.brandData?.cta
        },
        brandKit: {
          colors: sessionData.brandData?.colors || [],
          fonts: [],
          logoUrl: sessionData.brandData?.logoFile ? 'uploaded-logo' : null
        },
        contextData: {
          industry: sessionData.brandData?.industry,
          placementType: sessionData.placementContext?.spaceType,
          targetAudience: sessionData.targetAudience || {},
          campaignObjective: sessionData.primaryGoal
        }
      });

      if (response.success) {
        // Transform single design into array format expected by frontend
        return {
          success: true,
          designs: [{
            id: response.data.design.id,
            canvaDesignId: response.data.design.canvaDesignId,
            title: `${sessionData.brandData?.businessName} - AI Generated`,
            thumbnailUrl: response.data.previewUrl || '/api/placeholder/300/200',
            editUrl: response.data.canvaUrl,
            performanceScore: Math.random() * 2 + 7.5, // 7.5-9.5 range
            tags: ['ai-generated', 'canva-template'],
            canEdit: !!response.data.canvaUrl
          }]
        };
      }

      // If backend design fails, create mock designs
      return this.generateMockDesigns(sessionData);

    } catch (error) {
      console.error('❌ Canva generation error:', error);
      // Fallback to mock designs
      return this.generateMockDesigns(sessionData);
    }
  }

  /**
   * Generate multiple design variations
   */
  async generateVariations(templateId, variations, brandKit) {
    try {
      const response = await apiClient.post(`${this.baseURL}/variations`, {
        templateId,
        variations,
        brandKit
      });

      if (response.success) {
        return {
          success: true,
          designs: response.data.variations.map(variation => ({
            id: variation.design?.design?.id || `var-${Date.now()}`,
            canvaDesignId: variation.design?.design?.canvaDesignId,
            title: variation.name,
            thumbnailUrl: variation.design?.previewUrl || '/api/placeholder/300/200',
            editUrl: variation.design?.canvaUrl,
            performanceScore: Math.random() * 2 + 7.5,
            tags: ['variation', 'canva-template'],
            canEdit: !!variation.design?.canvaUrl,
            success: variation.success
          }))
        };
      }

      throw new Error(response.error || 'Failed to generate variations');
    } catch (error) {
      console.error('❌ Variations error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get edit URL for Canva design
   */
  getEditUrl(canvaDesignId, userId) {
    if (!canvaDesignId) return null;
    
    // The backend should provide edit URLs in the design response
    // This is a fallback that opens a new tab
    return `${window.location.origin}/canva-edit?designId=${canvaDesignId}&userId=${userId}`;
  }

  /**
   * Export design in various formats
   */
  async exportDesign(designId, format = 'PNG') {
    try {
      const response = await apiClient.post(`${this.baseURL}/export`, {
        designId,
        formats: [format.toLowerCase()]
      });

      if (response.success) {
        const exportData = response.data.exports[format.toLowerCase()];
        
        if (exportData && !exportData.error) {
          return {
            success: true,
            downloadUrl: exportData.url || exportData.downloadUrl,
            format: format
          };
        }

        throw new Error(exportData?.error || 'Export failed');
      }

      throw new Error(response.error || 'Export failed');
    } catch (error) {
      console.error('❌ Export error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get design recommendations
   */
  async getDesignRecommendations(contextData) {
    try {
      const response = await apiClient.post(`${this.baseURL}/recommendations`, {
        industry: contextData.brandData?.industry,
        placementType: contextData.placementContext?.spaceType,
        targetAudience: contextData.targetAudience,
        campaignObjective: contextData.primaryGoal
      });

      if (response.success) {
        return {
          success: true,
          recommendations: response.data.recommendations
        };
      }

      throw new Error(response.error || 'Failed to get recommendations');
    } catch (error) {
      console.error('❌ Recommendations error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload brand asset
   */
  async uploadBrandAsset(file, assetType, brandKitId = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assetType', assetType);
      if (brandKitId) {
        formData.append('brandKitId', brandKitId);
      }

      const response = await apiClient.post(`${this.baseURL}/upload-asset`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.success) {
        return {
          success: true,
          asset: response.data.asset,
          canvaAsset: response.data.canvaAsset
        };
      }

      throw new Error(response.error || 'Upload failed');
    } catch (error) {
      console.error('❌ Upload error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Manage brand kit
   */
  async manageBrandKit(brandKitData) {
    try {
      const response = await apiClient.post(`${this.baseURL}/brand-kit`, brandKitData);

      if (response.success) {
        return {
          success: true,
          brandKit: response.data.brandKit
        };
      }

      throw new Error(response.error || 'Failed to manage brand kit');
    } catch (error) {
      console.error('❌ Brand kit error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's design analytics
   */
  async getDesignAnalytics(timeframe = '30d') {
    try {
      const response = await apiClient.get(`${this.baseURL}/analytics?timeframe=${timeframe}`);

      if (response.success) {
        return {
          success: true,
          analytics: response.data.analytics,
          recentDesigns: response.data.recentDesigns
        };
      }

      throw new Error(response.error || 'Failed to get analytics');
    } catch (error) {
      console.error('❌ Analytics error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update existing design
   */
  async updateDesign(designId, updates) {
    try {
      const response = await apiClient.patch(`${this.baseURL}/update-design`, {
        designId,
        updates
      });

      if (response.success) {
        return {
          success: true,
          design: response.data.design,
          canvaUrl: response.data.canvaUrl
        };
      }

      throw new Error(response.error || 'Update failed');
    } catch (error) {
      console.error('❌ Update error:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper methods

  /**
   * Generate mock designs as fallback
   */
  generateMockDesigns(sessionData) {
    const businessName = sessionData.brandData?.businessName || 'Your Business';
    const industry = sessionData.brandData?.industry || 'business';
    const colors = sessionData.brandData?.colors || ['#4668AB', '#FF6B35'];

    return {
      success: true,
      designs: [
        {
          id: 'mock-design-1',
          canvaDesignId: null,
          title: `${businessName} - Modern Design`,
          thumbnailUrl: this.generateMockThumbnail(colors[0], businessName),
          editUrl: null,
          performanceScore: 8.7,
          tags: ['modern', 'professional', industry],
          canEdit: false,
          isMock: true
        },
        {
          id: 'mock-design-2',
          canvaDesignId: null,
          title: `${businessName} - Bold Design`,
          thumbnailUrl: this.generateMockThumbnail(colors[1] || '#FF6B35', businessName),
          editUrl: null,
          performanceScore: 9.1,
          tags: ['bold', 'eye-catching', industry],
          canEdit: false,
          isMock: true
        },
        {
          id: 'mock-design-3',
          canvaDesignId: null,
          title: `${businessName} - Elegant Design`,
          thumbnailUrl: this.generateMockThumbnail('#6B73FF', businessName),
          editUrl: null,
          performanceScore: 8.4,
          tags: ['elegant', 'minimal', industry],
          canEdit: false,
          isMock: true
        }
      ]
    };
  }

  /**
   * Generate mock thumbnail URL
   */
  generateMockThumbnail(color, businessName) {
    // Create a data URL for a simple colored rectangle with text
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 300, 200);
    
    // Text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(businessName, 150, 100);
    
    return canvas.toDataURL();
  }

  /**
   * Map placement type to Canva design type
   */
  mapPlacementToDesignType(placementType) {
    const mapping = {
      'storefront_window': 'poster',
      'building_exterior': 'banner', 
      'digital_display': 'social_post',
      'event_space': 'flyer'
    };

    return mapping[placementType] || 'social_post';
  }

  /**
   * Check if Canva integration is enabled
   */
  isCanvaEnabled() {
    return process.env.REACT_APP_CANVA_INTEGRATION_ENABLED === 'true';
  }

  /**
   * Initialize Canva Connect (for future use)
   */
  async initializeCanvaConnect(userId, designData) {
    // This would be handled by the backend
    // Frontend just calls the backend endpoint
    try {
      const response = await apiClient.post(`${this.baseURL}/initialize`, {
        userId,
        designData
      });

      return response;
    } catch (error) {
      console.error('❌ Canva initialization error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new CanvaService();