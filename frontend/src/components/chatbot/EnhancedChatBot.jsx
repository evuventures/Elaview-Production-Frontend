import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User as UserIcon, 
  MapPin, 
  DollarSign,
  Calendar,
  CreditCard,
  MessageSquare,
  Settings,
  TestTube,
  Sparkles,
  Zap,
  Crown,
  Target,
  Star,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Eye,
  Navigation,
  Home,
  Building,
  Users,
  BarChart3,
  FileText,
  Search
} from 'lucide-react';
import { Property, Space, Booking, ChatMessage, Campaign, Invoice, Message } from '@/api/entities';
import { useUser } from '@clerk/clerk-react';
import { geminiService } from '@/lib/gemini';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// Enhanced Context Service
class WebsiteContextService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  async getPageContext(pathname) {
    const cacheKey = `page_${pathname}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    const context = await this.fetchPageContext(pathname);
    this.cache.set(cacheKey, { data: context, timestamp: Date.now() });
    return context;
  }

  async fetchPageContext(pathname) {
    const page = pathname.split('/').pop() || 'Dashboard';
    
    const contexts = {
      'Dashboard': {
        name: 'Dashboard',
        description: 'Main dashboard with campaign and listing statistics',
        availableActions: ['view_analytics', 'create_campaign', 'create_property', 'view_messages', 'view_invoices'],
        content: 'User analytics, recent activity, quick actions'
      },
      'Map': {
        name: 'Map',
        description: 'Interactive map showing advertising spaces',
        availableActions: ['search_location', 'filter_properties', 'view_property_details', 'book_space'],
        content: 'Map with property markers, search filters, location data'
      },
      'Messages': {
        name: 'Messages',
        description: 'Communication center with space owners/advertisers',
        availableActions: ['send_message', 'view_conversation', 'manage_contacts'],
        content: 'Message threads, contact list, notifications'
      },
      'Invoices': {
        name: 'Invoices',
        description: 'Payment and billing management',
        availableActions: ['view_invoice', 'make_payment', 'download_receipt', 'view_payment_history'],
        content: 'Invoice list, payment status, billing history'
      },
      'Profile': {
        name: 'Profile',
        description: 'User profile and account settings',
        availableActions: ['edit_profile', 'change_password', 'update_preferences', 'view_verification'],
        content: 'Personal information, preferences, security settings'
      },
      'CreateProperty': {
        name: 'Create Property',
        description: 'Property listing creation form',
        availableActions: ['fill_property_details', 'upload_photos', 'set_pricing', 'add_location'],
        content: 'Property form, photo upload, pricing settings'
      },
      'CreateCampaign': {
        name: 'Create Campaign',
        description: 'Advertising campaign creation',
        availableActions: ['set_campaign_details', 'select_properties', 'set_budget', 'schedule_campaign'],
        content: 'Campaign form, property selection, budget planning'
      },
      'Admin': {
        name: 'Admin',
        description: 'Administrative dashboard',
        availableActions: ['manage_users', 'approve_properties', 'view_reports', 'manage_payments'],
        content: 'User management, property approvals, system reports'
      }
    };

    return contexts[page] || {
      name: page,
      description: 'Page navigation',
      availableActions: ['navigate'],
      content: 'General page content'
    };
  }

  async getWebsiteData() {
    const cacheKey = 'website_data';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      const [properties, campaigns, areas, messages, invoices] = await Promise.all([
        Property.list().catch(() => []),
        Campaign.list().catch(() => []),
        Space.list().catch(() => []),
        Message.list().catch(() => []),
        Invoice.list().catch(() => [])
      ]);

      const data = {
        properties: properties.slice(0, 10), // Limit for performance
        campaigns: campaigns.slice(0, 10),
        spaces: areas.slice(0, 10),
        messages: messages.slice(0, 5),
        invoices: invoices.slice(0, 5),
        summary: {
          totalProperties: properties.length,
          totalCampaigns: campaigns.length,
          totalSpaces: areas.length,
          unreadMessages: messages.filter(m => !m.read).length,
          pendingInvoices: invoices.filter(i => i.status === 'pending').length
        }
      };

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching website data:', error);
      return {
        properties: [],
        campaigns: [],
        spaces: [],
        messages: [],
        invoices: [],
        summary: {
          totalProperties: 0,
          totalCampaigns: 0,
          totalSpaces: 0,
          unreadMessages: 0,
          pendingInvoices: 0
        }
      };
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

const contextService = new WebsiteContextService();

export default function ChatBot() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [currentUser, setCurrentUser] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [websiteContext, setWebsiteContext] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  // Speech Recognition Setup
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Speech Synthesis Setup
  const speechSynthesis = window.speechSynthesis;
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    if (speechSynthesis) {
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
      };
      
      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    if (transcript && !listening) {
      setInputMessage(transcript);
      resetTranscript();
      setIsListening(false);
    }
  }, [transcript, listening, resetTranscript]);

  useEffect(() => {
    loadWebsiteContext();
    if (isOpen && messages.length === 0) {
      addWelcomeMessage();
    }
  }, [isOpen, location.pathname]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadWebsiteContext = async () => {
    try {
      const [pageContext, websiteData] = await Promise.all([
        contextService.getPageContext(location.pathname),
        contextService.getWebsiteData()
      ]);
      
      setWebsiteContext({
        currentPage: pageContext,
        websiteData
      });
    } catch (error) {
      console.error('Error loading website context:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const speak = (text) => {
    if (!voiceEnabled || !speechSynthesis) return;
    
    // Stop any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Use a female voice if available
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('zira') ||
      voice.name.toLowerCase().includes('hazel')
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      alert('Your browser does not support speech recognition. Please use Chrome or Edge.');
      return;
    }
    
    setIsListening(true);
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
  };

  const stopListening = () => {
    setIsListening(false);
    SpeechRecognition.stopListening();
  };

  const addWelcomeMessage = () => {
    const currentPage = websiteContext?.currentPage?.name || 'Dashboard';
    const welcomeMessage = {
      id: 'welcome',
      type: 'bot',
      content: `✨ Hi! I'm your AI assistant for Elaview. I can see you're on the ${currentPage} page. 

I have full access to your account data and can help you with:
• Navigate to any page or feature
• Manage your properties and campaigns  
• Handle bookings and invoices
• Search and filter content
• Provide detailed analytics
• Voice commands (click the mic icon!)

What would you like to do?`,
      timestamp: new Date(),
      quickActions: [
        { text: "🎯 Find advertising spaces", action: "search_spaces" },
        { text: "📊 View my analytics", action: "view_analytics" },
        { text: "🏢 Manage properties", action: "manage_properties" },
        { text: "💰 Check financials", action: "view_financials" },
        { text: "🚀 Create campaign", action: "create_campaign" },
        { text: "🗺️ Open map", action: "open_map" }
      ]
    };
    setMessages([welcomeMessage]);
  };

  const handleQuickAction = async (action, params) => {
    const actionMessages = {
      search_spaces: "Help me find the best advertising spaces for my campaign",
      view_analytics: "Show me my account analytics and performance data",
      manage_properties: "Help me manage my property listings",
      view_financials: "Show me my financial overview including invoices and payments",
      create_campaign: "I want to create a new advertising campaign",
      open_map: "Take me to the map to browse locations",
      booking_help: "I need help with booking an advertising space",
      pricing_help: "Explain how pricing works on Elaview",
      run_test: "Run a comprehensive system test",
      test_gemini: "Test the AI capabilities",
      navigate: `Navigate to ${params?.page || 'a page'}`
    };

    const message = actionMessages[action];
    if (message) {
      await handleSendMessage(message);
    }
  };

  const executeFunction = (functionName, args) => {
    console.log('Executing function:', functionName, 'with args:', args);
    
    const functions = {
      navigate_to: (params) => {
        const { page } = params;
        const routes = {
          'Dashboard': '/',
          'Map': '/map',
          'Messages': '/messages',
          'Invoices': '/invoices',
          'Profile': '/profile',
          'CreateProperty': '/create-property',
          'CreateCampaign': '/create-campaign',
          'Admin': '/admin',
          'PropertyManagement': '/property-management',
          'BookingManagement': '/booking-management',
          'CampaignDetails': '/campaign-details',
          'Help': '/help'
        };
        
        const route = routes[page] || '/';
        navigate(route);
        return { success: true, route, page };
      },
      
      search_map: (params) => {
        const { query } = params;
        navigate(`/map?search=${encodeURIComponent(query)}`);
        return { success: true, query };
      },
      
      start_new_property: () => {
        navigate('/create-property');
        return { success: true };
      },
      
      start_new_campaign: (params) => {
        const { name } = params;
        navigate(`/create-campaign${name ? `?name=${encodeURIComponent(name)}` : ''}`);
        return { success: true, name };
      },
      
      view_analytics: () => {
        navigate('/');
        return { success: true };
      },
      
      open_messages: () => {
        navigate('/messages');
        return { success: true };
      },
      
      view_invoices: () => {
        navigate('/invoices');
        return { success: true };
      },
      
      search_content: (params) => {
        const { query, type } = params;
        // Implement search functionality
        return { success: true, query, type };
      }
    };
    
    const func = functions[functionName];
    if (func) {
      return func(args);
    }
    
    return { success: false, error: 'Function not found' };
  };

  const processUserIntent = async (message) => {
    try {
      const websiteData = await contextService.getWebsiteData();
      const pageContext = await contextService.getPageContext(location.pathname);
      const recentHistory = conversationHistory.slice(-5);
      
      const prompt = `
        You are an expert AI assistant for Elaview, an advertising space marketplace platform.
        You have complete access to the user's account data and can navigate to any part of the application.
        
        CURRENT CONTEXT:
        - User is on: ${pageContext.name} page
        - Page description: ${pageContext.description}
        - Available actions on this page: ${pageContext.availableActions.join(', ')}
        
        WEBSITE DATA SUMMARY:
        - Total properties: ${websiteData.summary.totalProperties}
        - Total campaigns: ${websiteData.summary.totalCampaigns}
        - Total advertising spaces: ${websiteData.summary.totalSpaces}
        - Unread messages: ${websiteData.summary.unreadMessages}
        - Pending invoices: ${websiteData.summary.pendingInvoices}
        
        RECENT CONVERSATION:
        ${recentHistory.map(h => `User: ${h.user}\nBot: ${h.bot}`).join('\n')}
        
        USER MESSAGE: "${message}"
        
        AVAILABLE FUNCTIONS:
        - navigate_to: Navigate to any page (Dashboard, Map, Messages, Invoices, Profile, CreateProperty, CreateCampaign, Admin, PropertyManagement, BookingManagement, Help)
        - search_map: Search for locations on the map
        - start_new_property: Create a new property listing
        - start_new_campaign: Create a new advertising campaign
        - view_analytics: View dashboard analytics
        - open_messages: Open messages/communication center
        - view_invoices: View invoices and payments
        - search_content: Search for specific content
        
        INSTRUCTIONS:
        1. Be conversational and helpful
        2. Use the website data to provide specific information
        3. If the user wants to navigate somewhere, use the appropriate function
        4. If the user asks about their data, reference the actual numbers from the website data
        5. Always respond in valid JSON format
        
        RESPONSE FORMAT:
        {
          "response": "Your helpful conversational response here",
          "function_call": {
            "name": "function_name",
            "arguments": {"param": "value"}
          }
        }
        
        If no function is needed, omit the function_call field.
      `;

      const response = await geminiService.generateResponse(prompt, {
        temperature: 0.7,
        maxOutputTokens: 1024
      });

      // Update conversation history
      setConversationHistory(prev => [...prev, { user: message, bot: response.response }]);
      
      return response;
    } catch (error) {
      console.error('Error processing intent:', error);
      return {
        response: "I'm having trouble processing your request. Let me help you with some quick actions instead.",
        error: error.message
      };
    }
  };

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const intentData = await processUserIntent(messageText);
      let responseContent = intentData.response;

      // Execute function if provided
      if (intentData.function_call) {
        const functionResult = executeFunction(intentData.function_call.name, intentData.function_call.arguments);
        console.log("Function executed:", intentData.function_call.name, "Result:", functionResult);
      }
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: responseContent,
        timestamp: new Date(),
        quickActions: intentData.quick_actions || []
      };

      setMessages(prev => [...prev, botMessage]);

      // Speak the response if voice is enabled
      if (voiceEnabled) {
        speak(responseContent);
      }

      // Save to database
      if (currentUser) {
        await ChatMessage.create({
          user_id: currentUser.id,
          message: messageText,
          response: responseContent,
          session_id: sessionId,
          actions_taken: intentData.function_call ? [intentData.function_call.name] : []
        });
      }

    } catch (error) {
      console.error('Error handling message:', error);
      
      const fallbackResponse = error.message.includes('API key') 
        ? "I need to be configured with a valid Gemini API key to provide intelligent responses. Please contact support."
        : "I'm having trouble processing your request. Here are some quick actions:";
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: fallbackResponse,
        timestamp: new Date(),
        quickActions: [
          { text: "Go to Dashboard", action: "navigate_to", params: { page: "Dashboard" } },
          { text: "View Map", action: "navigate_to", params: { page: "Map" } },
          { text: "Create Property", action: "start_new_property", params: {} },
          { text: "Messages", action: "navigate_to", params: { page: "Messages" } }
        ]
      };

      setMessages(prev => [...prev, errorMessage]);
    }

    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 z-50"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl border-2 border-blue-200 z-50 flex flex-col">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-6 h-6" />
            <div>
              <CardTitle className="text-lg">Elaview AI Assistant</CardTitle>
              <p className="text-xs opacity-90">Context-aware • Voice-enabled</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="text-white hover:bg-white/20"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4 py-2">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'bot' && <Bot className="w-5 h-5 mt-0.5 text-blue-500" />}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  {message.quickActions && message.quickActions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.quickActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAction(action.action, action.params)}
                          className="text-xs bg-white/50 hover:bg-white/70"
                        >
                          {action.text}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-blue-500" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-100"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
        
        <div className="p-4 border-t bg-white">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about Elaview..."
              className="flex-1"
              disabled={isTyping}
            />
            
            {browserSupportsSpeechRecognition && (
              <Button
                variant="outline"
                size="sm"
                onClick={isListening ? stopListening : startListening}
                className={`${isListening ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            )}
            
            {isSpeaking && (
              <Button
                variant="outline"
                size="sm"
                onClick={stopSpeaking}
                className="bg-orange-100 text-orange-600"
              >
                <VolumeX className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3" />
              {isListening ? 'Listening...' : 'Powered by Gemini AI with full context awareness'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
