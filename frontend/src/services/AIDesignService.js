// src/services/AIDesignService.js
// Frontend AI Design Service - Communicates with your backend AIDesignService

import apiClient from '../api/apiClient.js';

class AIDesignService {
  constructor() {
    this.baseURL = '/api/ai-design';
  }

  /**
   * Create AI design session
   */
  async createSession(sessionData) {
    try {
      console.log('🤖 Creating AI design session:', sessionData);
      
      const response = await apiClient.post(`${this.baseURL}/sessions`, {
        prompt: this.buildPromptFromSessionData(sessionData),
        placementType: sessionData.placementContext?.spaceType,
        businessGoals: [sessionData.primaryGoal],
        targetAudience: {
          demographics: [],
          interests: [],
          location: sessionData.placementContext?.location
        },
        brandKit: {
          colors: sessionData.brandData?.colors || [],
          fonts: [],
          logoUrl: sessionData.brandData?.logoFile ? 'uploaded-logo' : null
        }
      });

      if (response.success) {
        return {
          success: true,
          data: {
            sessionId: response.data.session.id,
            contextData: response.data.contextData,
            recommendations: response.data.recommendations,
            placementGuidance: response.data.placementGuidance,
            creditsRemaining: response.data.creditsRemaining
          }
        };
      }

      throw new Error(response.error || 'Failed to create AI session');
    } catch (error) {
      console.error('❌ AI session creation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate design variations
   */
  async generateDesigns(sessionId, sessionData) {
    try {
      console.log('🎨 Generating designs for session:', sessionId);
      
      // Get template recommendations first
      const recommendations = await this.getTemplateRecommendations(sessionId);
      
      if (!recommendations.success || !recommendations.data?.length) {
        throw new Error('No suitable templates found');
      }

      // Generate designs from top 3 templates
      const topTemplates = recommendations.data.slice(0, 3);
      const designs = [];

      for (const template of topTemplates) {
        try {
          const designResponse = await this.createDesignFromTemplate(
            sessionId, 
            template.id, 
            sessionData
          );
          
          if (designResponse.success) {
            designs.push(designResponse.data);
          }
        } catch (error) {
          console.error('❌ Error creating design from template:', error);
        }
      }

      if (designs.length === 0) {
        throw new Error('Failed to generate any designs');
      }

      return {
        success: true,
        data: { designs }
      };

    } catch (error) {
      console.error('❌ Design generation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get template recommendations
   */
  async getTemplateRecommendations(sessionId) {
    try {
      const response = await apiClient.get(`${this.baseURL}/sessions/${sessionId}/recommendations`);
      
      if (response.success) {
        return {
          success: true,
          data: response.data.recommendations
        };
      }

      throw new Error(response.error || 'Failed to get recommendations');
    } catch (error) {
      console.error('❌ Template recommendations error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create design from template using Canva
   */
  async createDesignFromTemplate(sessionId, templateId, sessionData) {
    try {
      const response = await apiClient.post('/api/canva/create-design', {
        templateId: templateId,
        designType: this.mapPlacementToDesignType(sessionData.placementContext?.spaceType),
        content: {
          headline: sessionData.brandData?.keyMessage,
          subheading: sessionData.brandData?.businessName,
          callToAction: sessionData.brandData?.cta
        },
        brandKit: {
          colors: sessionData.brandData?.colors || [],
          logoUrl: sessionData.brandData?.logoFile ? 'uploaded-logo' : null
        },
        contextData: {
          industry: sessionData.brandData?.industry,
          placementType: sessionData.placementContext?.spaceType,
          targetAudience: sessionData.targetAudience,
          campaignObjective: sessionData.primaryGoal
        }
      });

      if (response.success) {
        // Transform backend response to match frontend expectations
        return {
          success: true,
          data: {
            id: response.data.design.id,
            canvaDesignId: response.data.design.canvaDesignId,
            title: `${sessionData.brandData?.businessName} - AI Design`,
            thumbnailUrl: response.data.previewUrl || '/api/placeholder/300/200',
            editUrl: response.data.canvaUrl,
            performanceScore: response.data.design.performanceScore || 8.5,
            tags: ['ai-generated', 'optimized'],
            canEdit: !!response.data.canvaUrl
          }
        };
      }

      throw new Error(response.error || 'Failed to create design');
    } catch (error) {
      console.error('❌ Design creation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate content variations (Premium feature)
   */
  async generateContentVariations(sessionId, variationType, originalContent) {
    try {
      const response = await apiClient.post(`${this.baseURL}/variations`, {
        sessionId: sessionId,
        variationType: variationType,
        originalContent: originalContent
      });

      if (response.success) {
        const variation = response.data.variation;
        const content = JSON.parse(variation.aiGeneratedContent);
        
        return {
          success: true,
          variations: [
            content.content,
            ...(content.alternatives || [])
          ].slice(0, 3), // Max 3 variations
          reasoning: content.reasoning,
          placementOptimizations: response.data.placementOptimizations
        };
      }

      throw new Error(response.error || 'Failed to generate variations');
    } catch (error) {
      console.error('❌ Content generation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Chat with AI assistant (Premium feature)
   */
  async chatWithAI(sessionId, message) {
    try {
      const response = await apiClient.post(`${this.baseURL}/chat`, {
        sessionId: sessionId,
        message: message
      });

      if (response.success) {
        return {
          success: true,
          message: response.data.message,
          suggestions: response.data.suggestions,
          executedActions: response.data.executedActions,
          placementContext: response.data.placementContext
        };
      }

      throw new Error(response.error || 'Failed to chat with AI');
    } catch (error) {
      console.error('❌ AI chat error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Complete design and generate final outputs
   */
  async completeDesign(sessionId, selectedDesign, exportOptions) {
    try {
      const response = await apiClient.post(`${this.baseURL}/complete`, {
        sessionId: sessionId,
        selectedTemplateId: selectedDesign.templateId,
        selectedVariations: [], // Add variation IDs if applicable
        exportFormat: exportOptions.format || 'png'
      });

      if (response.success) {
        return {
          success: true,
          design: response.data,
          finalRecommendations: response.data.finalRecommendations
        };
      }

      throw new Error(response.error || 'Failed to complete design');
    } catch (error) {
      console.error('❌ Design completion error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get design recommendations
   */
  async getDesignRecommendations(contextData) {
    try {
      const response = await apiClient.post('/api/canva/recommendations', {
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
   * Export design in various formats
   */
  async exportDesign(designId, format = 'PNG') {
    try {
      const response = await apiClient.post(`/api/canva/export`, {
        designId: designId,
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

      throw new Error(response.error || 'Failed to export design');
    } catch (error) {
      console.error('❌ Export error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get session details
   */
  async getSession(sessionId) {
    try {
      const response = await apiClient.get(`${this.baseURL}/sessions/${sessionId}`);
      
      if (response.success) {
        return {
          success: true,
          session: response.data
        };
      }

      throw new Error(response.error || 'Session not found');
    } catch (error) {
      console.error('❌ Get session error:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper methods

  /**
   * Build AI prompt from session data
   */
  buildPromptFromSessionData(sessionData) {
    const parts = [
      `Create advertising content for ${sessionData.brandData?.businessName || 'a business'}`,
      sessionData.brandData?.industry && `in the ${sessionData.brandData.industry} industry`,
      sessionData.placementContext?.spaceType && `for ${sessionData.placementContext.spaceType} placement`,
      sessionData.brandData?.keyMessage && `with the message: "${sessionData.brandData.keyMessage}"`,
      sessionData.brandData?.tone && `using a ${sessionData.brandData.tone} tone`,
      sessionData.primaryGoal && `to achieve ${sessionData.primaryGoal}`,
      `Budget: $${sessionData.budgetRange?.[1] || 'not specified'}`
    ].filter(Boolean);

    return parts.join(', ') + '.';
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
   * Check if AI features are enabled
   */
  isAIEnabled() {
    return process.env.REACT_APP_AI_FEATURES_ENABLED === 'true';
  }

  /**
   * Check if Canva integration is enabled
   */
  isCanvaEnabled() {
    return process.env.REACT_APP_CANVA_INTEGRATION_ENABLED === 'true';
  }
}

export default new AIDesignService();