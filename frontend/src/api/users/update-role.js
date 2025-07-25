// src/api/users/update-role.js - Fixed Token Handling

/**
 * Updates user role in the database
 * @param {string} newRole - The new role ('buyer' or 'seller')
 * @param {string} token - Clerk authentication token
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const updateUserRole = async (newRole, token) => {
  try {
    console.log(`🔄 Updating role: ${newRole} -> ${newRole === 'seller' ? 'PROPERTY_OWNER' : 'ADVERTISER'}`);
    
    // Validate inputs
    if (!newRole || !token) {
      throw new Error('Missing required parameters: newRole and token are required');
    }

    if (!['buyer', 'seller'].includes(newRole)) {
      throw new Error('Invalid role. Must be "buyer" or "seller"');
    }

    // Map UI roles to database roles
    const roleMapping = {
      'buyer': 'ADVERTISER',
      'seller': 'PROPERTY_OWNER'
    };

    const dbRole = roleMapping[newRole];
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    // Make API request
    const response = await fetch(`${apiBaseUrl}/users/update-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        role: dbRole
      })
    });

    // Handle response
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // If response isn't JSON, use the text as error message
        errorMessage = errorText || errorMessage;
      }
      
      if (response.status === 401) {
        throw new Error('Invalid or expired token');
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    console.log('✅ Role update API response:', data);
    
    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('❌ Error updating role:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to update role'
    };
  }
};