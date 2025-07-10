// src/lib/gemini.js
// Mock Gemini Service - Replace with real implementation later

console.warn('🚨 Using mock Gemini service. Install @google/generative-ai for real functionality.');

class GeminiService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.isInitialized = false;
    console.log('Mock Gemini service initialized');
  }

  // Add the missing initialize method
  async initialize() {
    console.log('Mock Gemini service - initialize() called');
    this.isInitialized = true;
    return Promise.resolve();
  }

  async generateContent(prompt) {
    if (!this.isInitialized) {
      console.warn('Gemini service not initialized. Call initialize() first.');
      await this.initialize();
    }
    
    console.log('Mock Gemini - generateContent called with:', prompt);
    
    // Mock responses based on prompt content
    const responses = [
      "I'm a mock AI assistant. Your app is successfully running without Base44! 🎉",
      "This is a simulated response. Install @google/generative-ai for real AI functionality.",
      "Mock AI here! Your Clerk authentication is working perfectly.",
      "Simulated response: Your app migration from Base44 to Clerk was successful!",
      "Mock AI says: All systems are running smoothly with mock data."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      response: {
        text: () => randomResponse
      }
    };
  }

  async chat(message) {
    console.log('Mock Gemini - chat called with:', message);
    return this.generateContent(message);
  }

  // Add any other methods your ChatBot might be calling
  async sendMessage(message) {
    console.log('Mock Gemini - sendMessage called with:', message);
    return this.generateContent(message);
  }
}

// Create and export a default instance
const geminiService = new GeminiService('mock-api-key');

export default geminiService;
export { GeminiService };