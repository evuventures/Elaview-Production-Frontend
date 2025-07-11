// src/api/integrations.js
// Mock integrations for file upload and email (replacing Base44)

console.warn('🚨 Base44 integrations have been disabled. Using mock implementations.');

// Mock file upload function
export const UploadFile = async ({ file }) => {
  console.log('📎 Mock file upload:', file.name);
  
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create a mock URL
  const mockUrl = `https://example.com/uploads/${Date.now()}_${file.name}`;
  
  // Return mock upload result
  return {
    success: true,
    file_url: mockUrl,
    url: mockUrl, // Alternative property name
    file_id: `file_${Date.now()}`,
    message: 'File uploaded successfully (mock)'
  };
};

// Mock email sending function
export const SendEmail = async ({ to, subject, body }) => {
  console.log('📧 Mock email send:');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Body:', body.substring(0, 100) + '...');
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    message_id: `email_${Date.now()}`,
    message: 'Email sent successfully (mock)'
  };
};

// Mock Core integration for backward compatibility
export const Core = {
  InvokeLLM: async (params) => {
    console.warn('InvokeLLM called - Base44 disabled. Using mock response.');
    return {
      response: "I'm a mock AI response. The real LLM integration is disabled while transitioning from Base44.",
      quick_actions: [
        { text: "🗺️ Browse map", action: "navigate", params: { page: "Map" } },
        { text: "📊 View dashboard", action: "navigate", params: { page: "Dashboard" } }
      ]
    };
  },
  
  SendEmail: async (params) => {
    return await SendEmail(params);
  },
  
  UploadFile: async (params) => {
    return await UploadFile(params);
  },
  
  GenerateImage: async (params) => {
    console.warn('GenerateImage called - Base44 disabled. Image not generated.');
    return { 
      success: false, 
      message: 'Image generation service disabled during Base44 transition',
      image_url: 'https://via.placeholder.com/400x300?text=Mock+Image'
    };
  },
  
  ExtractDataFromUploadedFile: async (params) => {
    console.warn('ExtractDataFromUploadedFile called - Base44 disabled. Data not extracted.');
    return { 
      success: false, 
      message: 'Data extraction service disabled during Base44 transition',
      data: {}
    };
  }
};

// Export individual functions for backward compatibility
export const InvokeLLM = Core.InvokeLLM;
export const GenerateImage = Core.GenerateImage;
export const ExtractDataFromUploadedFile = Core.ExtractDataFromUploadedFile;

// Export default object for compatibility
export default {
  UploadFile,
  SendEmail,
  Core,
  InvokeLLM,
  GenerateImage,
  ExtractDataFromUploadedFile
};