// src/api/integrations.js
// Mock integrations for file upload and email (replacing Base44)

console.warn('🚨 Base44 integrations have been disabled. Using mock implementations.');

// ✅ IMPROVED: Better mock file upload function
export const UploadFile = async ({ file }) => {
  console.log('📎 Mock file upload:', file.name, `(${Math.round(file.size / 1024)}KB)`);
  
  // Simulate upload delay based on file size
  const uploadTime = Math.min(Math.max(file.size / 1000000, 500), 2000); // 0.5-2 seconds
  await new Promise(resolve => setTimeout(resolve, uploadTime));
  
  // Create a mock URL that looks more realistic
  const timestamp = Date.now();
  const extension = file.name.split('.').pop();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const mockUrl = `https://storage.example.com/uploads/${timestamp}_${sanitizedName}`;
  
  // Return mock upload result that matches expected format
  return {
    success: true,
    file_url: mockUrl,
    url: mockUrl, // Alternative property name
    file_id: `file_${timestamp}`,
    original_name: file.name,
    file_size: file.size,
    content_type: file.type,
    message: 'File uploaded successfully (mock)'
  };
};

// ✅ IMPROVED: Better mock email sending function
export const SendEmail = async ({ to, subject, body, from }) => {
  console.log('📧 Mock email send:');
  console.log('From:', from || 'noreply@yourapp.com');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Body preview:', body.substring(0, 100) + '...');
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    success: true,
    message_id: `email_${Date.now()}`,
    status: 'sent',
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
    const { prompt, width = 400, height = 300 } = params;
    return { 
      success: false, 
      message: 'Image generation service disabled during Base44 transition',
      image_url: `https://via.placeholder.com/${width}x${height}?text=Mock+Image`,
      prompt: prompt
    };
  },
  
  ExtractDataFromUploadedFile: async (params) => {
    console.warn('ExtractDataFromUploadedFile called - Base44 disabled. Data not extracted.');
    return { 
      success: false, 
      message: 'Data extraction service disabled during Base44 transition',
      data: {},
      file_info: params.file_url ? { url: params.file_url } : {}
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