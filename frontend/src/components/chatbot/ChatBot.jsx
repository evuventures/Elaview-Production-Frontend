import React, { useState, useEffect, useRef } from 'react';
import { useChatBotContext } from '@/contexts/ChatBotContext';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { GeminiService } from '@/lib/gemini';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
 MessageCircle, 
 X, 
 Mic, 
 MicOff, 
 Send, 
 Trash2, 
 Bot,
 User,
 Settings,
 Search,
 Star,
 TrendingUp,
 Calendar,
 DollarSign,
 Home,
 Map,
 FileText,
 Users,
 HelpCircle,
 Plus,
 BarChart3,
 Mail,
 CreditCard,
 Building,
 Zap,
 Volume2,
 VolumeX,
 Loader2
} from 'lucide-react';

const ChatBot = ({ isOpen, onClose }) => {
 const [messages, setMessages] = useState([]);
 const [inputMessage, setInputMessage] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [isListening, setIsListening] = useState(false);
 const [isSpeaking, setIsSpeaking] = useState(false);
 const [voiceEnabled, setVoiceEnabled] = useState(false);
 const [recognition, setRecognition] = useState(null);
 const [speechSynthesis, setSpeechSynthesis] = useState(null);
 const [currentVoice, setCurrentVoice] = useState(null);
 const [showQuickActions, setShowQuickActions] = useState(true);
 const [showSuggestions, setShowSuggestions] = useState(true);

 const messagesEndRef = useRef(null);
 const inputRef = useRef(null);
 const geminiService = useRef(new GeminiService());

 const { 
 globalContext, 
 getContextSummary, 
 searchContent, 
 getSmartSuggestions,
 refreshData,
 isSignedIn,
 isLoaded
 } = useChatBotContext();

 const { user } = useAuth();
 const navigate = useNavigate();

 // Initialize voice recognition and synthesis
 useEffect(() => {
 if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
 const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
 const recognitionInstance = new SpeechRecognition();
 
 recognitionInstance.continuous = true;
 recognitionInstance.interimResults = true;
 recognitionInstance.lang = 'en-US';
 
 recognitionInstance.onresult = (event) => {
 const transcript = Array.from(event.results)
 .map(result => result[0])
 .map(result => result.transcript)
 .join('');
 
 if (event.results[event.results.length - 1].isFinal) {
 setInputMessage(transcript);
 setIsListening(false);
 }
 };
 
 recognitionInstance.onerror = (event) => {
 console.error('Speech recognition error:', event.error);
 setIsListening(false);
 toast.error('Voice recognition failed. Please try again.');
 };
 
 recognitionInstance.onend = () => {
 setIsListening(false);
 };
 
 setRecognition(recognitionInstance);
 }

 if ('speechSynthesis' in window) {
 setSpeechSynthesis(window.speechSynthesis);
 
 // Wait for voices to be loaded
 const loadVoices = () => {
 const voices = window.speechSynthesis.getVoices();
 const englishVoice = voices.find(voice => voice.lang.startsWith('en-')) || voices[0];
 setCurrentVoice(englishVoice);
 };
 
 if (window.speechSynthesis.getVoices().length> 0) {
 loadVoices();
 } else {
 window.speechSynthesis.onvoiceschanged = loadVoices;
 }
 }

 // Initialize Gemini service
 geminiService.current.initialize().catch(console.error);
 }, []);

 // Auto-scroll to bottom when messages change
 useEffect(() => {
 scrollToBottom();
 }, [messages]);

 // Add welcome message on first load
 useEffect(() => {
 if (isOpen && messages.length === 0) {
 const welcomeMessage = {
 id: Date.now(),
 type: 'bot',
 content: isSignedIn 
 ? `Hello ${user?.firstName || 'there'}! I'm your ElaView assistant. I can help you manage your properties, campaigns, bookings, and more. What would you like to know?`
 : 'Welcome to ElaView! I can help you explore our platform and answer your questions. Sign in to access personalized features.',
 timestamp: new Date()
 };
 setMessages([welcomeMessage]);
 }
 }, [isOpen, isSignedIn, user?.firstName]);

 const scrollToBottom = () => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
 setIsLoading(true);
 setShowQuickActions(false);
 setShowSuggestions(false);

 try {
 // Handle quick actions and navigation
 const response = await handleUserMessage(messageText);
 
 const botMessage = {
 id: Date.now() + 1,
 type: 'bot',
 content: response,
 timestamp: new Date()
 };

 setMessages(prev => [...prev, botMessage]);

 // Speak the response if voice is enabled
 if (voiceEnabled && speechSynthesis && currentVoice) {
 speak(response);
 }

 } catch (error) {
 console.error('Error sending message:', error);
 const errorMessage = {
 id: Date.now() + 1,
 type: 'bot',
 content: 'I apologize, but I encountered an error. Please try again or contact support if the problem persists.',
 timestamp: new Date()
 };
 setMessages(prev => [...prev, errorMessage]);
 toast.error('Failed to send message');
 } finally {
 setIsLoading(false);
 }
 };

 const handleUserMessage = async (messageText) => {
 const lowerMessage = messageText.toLowerCase();
 
 // Check for navigation commands
 if (lowerMessage.includes('go to') || lowerMessage.includes('navigate to') || lowerMessage.includes('open')) {
 return handleNavigationCommand(lowerMessage);
 }
 
 // Check for quick actions
 if (lowerMessage.includes('create property') || lowerMessage.includes('add property')) {
 navigate('/create-property');
 return "I'll take you to the property creation page.";
 }
 
 if (lowerMessage.includes('create campaign') || lowerMessage.includes('add campaign')) {
 navigate('/create-campaign');
 return "I'll take you to the campaign creation page.";
 }

 if (lowerMessage.includes('refresh') || lowerMessage.includes('update')) {
 await refreshData();
 return "I've refreshed all your data. Everything is up to date!";
 }

 // Search functionality
 if (lowerMessage.includes('search for') || lowerMessage.includes('find')) {
 const searchQuery = messageText.replace(/search for|find/gi, '').trim();
 if (searchQuery) {
 const results = searchContent(searchQuery);
 return formatSearchResults(results, searchQuery);
 }
 }

 // Context-aware responses
 const contextSummary = getContextSummary();
 const contextPrompt = buildContextPrompt(messageText, contextSummary);
 
 // Generate AI response using Gemini
 const aiResponse = await geminiService.current.generateResponse(contextPrompt, {
 temperature: 0.7,
 maxOutputTokens: 300
 });

 return aiResponse || "I'm here to help! Could you please rephrase your question?";
 };

 const handleNavigationCommand = (message) => {
 const routes = {
 'dashboard': '/',
 'map': '/map',
 'properties': '/property-management',
 'campaigns': '/dashboard',
 'messages': '/messages',
 'invoices': '/invoices',
 'profile': '/profile',
 'admin': '/admin',
 'help': '/help',
 'booking': '/booking-management'
 };

 for (const [key, route] of Object.entries(routes)) {
 if (message.includes(key)) {
 navigate(route);
 return `I'll take you to the ${key} page.`;
 }
 }

 return "I couldn't find that page. Please try: dashboard, map, properties, campaigns, messages, invoices, profile, admin, help, or booking.";
 };

 const formatSearchResults = (results, query) => {
 if (results.total === 0) {
 return `I couldn't find any results for "${query}". Try searching for properties, campaigns, messages, or invoices.`;
 }

 let response = `I found ${results.total} results for "${query}":\n\n`;
 
 if (results.properties.length> 0) {
 response += `Properties (${results.properties.length}):\n`;
 results.properties.slice(0, 3).forEach(prop => {
 response += `• ${prop.name} - ${prop.type} (${prop.status})\n`;
 });
 response += '\n';
 }

 if (results.campaigns.length> 0) {
 response += `Campaigns (${results.campaigns.length}):\n`;
 results.campaigns.slice(0, 3).forEach(camp => {
 response += `• ${camp.name} - ${camp.status}\n`;
 });
 response += '\n';
 }

 if (results.messages.length> 0) {
 response += `Messages (${results.messages.length}):\n`;
 results.messages.slice(0, 3).forEach(msg => {
 response += `• ${msg.subject || 'Message'} from ${msg.sender_name}\n`;
 });
 response += '\n';
 }

 if (results.invoices.length> 0) {
 response += `Invoices (${results.invoices.length}):\n`;
 results.invoices.slice(0, 3).forEach(inv => {
 response += `• ${inv.invoice_number} - $${inv.amount} (${inv.status})\n`;
 });
 }

 return response;
 };

 const buildContextPrompt = (userMessage, contextSummary) => {
 const systemPrompt = `You are ElaView Assistant, a helpful AI chatbot for a property management and advertising platform. 

Current User Context:
- User is ${isSignedIn ? 'signed in' : 'not signed in'}
- Total Properties: ${contextSummary.totalProperties}
- Active Properties: ${contextSummary.activeProperties}
- Total Campaigns: ${contextSummary.totalCampaigns}
- Active Campaigns: ${contextSummary.activeCampaigns}
- Unread Messages: ${contextSummary.unreadMessages}
- Pending Invoices: ${contextSummary.pendingInvoices}
- Current Page: ${contextSummary.currentPage}
- Total Revenue: $${contextSummary.totalRevenue}

Platform Features:
- Property Management: Create, edit, and manage properties
- Campaign Management: Create and manage advertising campaigns
- Booking System: Handle property bookings and reservations
- Financial Management: Track invoices and payments
- Communication: Message system for client communication
- Analytics: View performance metrics and insights

Respond in a helpful, friendly manner. Keep responses concise but informative. If the user asks about specific data, reference the context provided. If they want to navigate somewhere, mention that you can help them get there.

User Question: ${userMessage}`;

 return systemPrompt;
 };

 const startListening = () => {
 if (recognition) {
 setIsListening(true);
 recognition.start();
 toast.success('Listening... Speak now!');
 }
 };

 const stopListening = () => {
 if (recognition) {
 recognition.stop();
 setIsListening(false);
 }
 };

 const speak = (text) => {
 if (speechSynthesis && currentVoice) {
 // Stop any current speech
 speechSynthesis.cancel();
 
 const utterance = new SpeechSynthesisUtterance(text);
 utterance.voice = currentVoice;
 utterance.rate = 0.9;
 utterance.pitch = 1;
 utterance.volume = 0.8;
 
 utterance.onstart = () => setIsSpeaking(true);
 utterance.onend = () => setIsSpeaking(false);
 utterance.onerror = () => setIsSpeaking(false);
 
 speechSynthesis.speak(utterance);
 }
 };

 const stopSpeaking = () => {
 if (speechSynthesis) {
 speechSynthesis.cancel();
 setIsSpeaking(false);
 }
 };

 const clearConversation = () => {
 setMessages([]);
 setShowQuickActions(true);
 setShowSuggestions(true);
 toast.success('Conversation cleared');
 };

 const handleKeyPress = (e) => {
 if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault();
 handleSendMessage();
 }
 };

 const quickActions = isSignedIn ? [
 { icon: Plus, label: 'Create Property', action: () => navigate('/create-property') },
 { icon: BarChart3, label: 'View Analytics', action: () => handleSendMessage('show me my analytics') },
 { icon: Mail, label: 'Check Messages', action: () => handleSendMessage('show unread messages') },
 { icon: CreditCard, label: 'View Invoices', action: () => navigate('/invoices') },
 { icon: Calendar, label: 'Recent Bookings', action: () => handleSendMessage('show recent bookings') },
 { icon: Building, label: 'My Properties', action: () => navigate('/property-management') }
 ] : [
 { icon: Home, label: 'Explore Platform', action: () => handleSendMessage('tell me about ElaView') },
 { icon: Map, label: 'View Map', action: () => navigate('/map') },
 { icon: HelpCircle, label: 'How it Works', action: () => handleSendMessage('how does this platform work') },
 { icon: Star, label: 'Features', action: () => handleSendMessage('what features are available') }
 ];

 const suggestions = isSignedIn ? [
 'Show me my top performing property',
 'What are my pending invoices?',
 'How many unread messages do I have?',
 'Create a new campaign',
 'Show me recent activity'
 ] : [
 'How do I create a property listing?',
 'What is ElaView?',
 'How do I sign up?',
 'What are advertising areas?',
 'Show me available properties'
 ];

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
 <Card className="w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl">
 <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
 <Bot className="w-5 h-5 text-primary-foreground" />
 </div>
 <div>
 <CardTitle className="text-lg">ElaView Assistant</CardTitle>
 <p className="text-sm text-muted-foreground">
 {isSignedIn ? 'Your personal property assistant' : 'Explore ElaView platform'}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <Button
 variant="ghost"
 size={20}
 onClick={() => setVoiceEnabled(!voiceEnabled)}
 className={voiceEnabled ? 'text-primary' : ''}
>
 {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
 </Button>
 <Button variant="ghost" size={20} onClick={clearConversation}>
 <Trash2 className="w-4 h-4" />
 </Button>
 <Button variant="ghost" size={20} onClick={onClose}>
 <X className="w-4 h-4" />
 </Button>
 </div>
 </CardHeader>

 <CardContent className="flex-1 flex flex-col gap-4 p-4">
 {/* Messages */}
 <ScrollArea className="flex-1 pr-4">
 <div className="space-y-4">
 {messages.map((message) => (
 <div
 key={message.id}
 className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
>
 {message.type === 'bot' && (
 <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
 <Bot className="w-4 h-4 text-primary-foreground" />
 </div>
 )}
 <div
 className={`max-w-[80%] rounded-lg px-4 py-2 ${
 message.type === 'user'
 ? 'bg-primary text-primary-foreground'
 : 'bg-muted'
 }`}
>
 <p className="text-sm whitespace-pre-wrap">{message.content}</p>
 <p className="text-xs opacity-70 mt-1">
 {message.timestamp.toLocaleTimeString()}
 </p>
 </div>
 {message.type === 'user' && (
 <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
 <User className="w-4 h-4 text-secondary-foreground" />
 </div>
 )}
 </div>
 ))}
 {isLoading && (
 <div className="flex gap-3 justify-start">
 <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
 <Bot className="w-4 h-4 text-primary-foreground" />
 </div>
 <div className="bg-muted rounded-lg px-4 py-2">
 <div className="flex items-center gap-2">
 <Loader2 className="w-4 h-4 animate-spin" />
 <span className="text-sm">Thinking...</span>
 </div>
 </div>
 </div>
 )}
 </div>
 <div ref={messagesEndRef} />
 </ScrollArea>

 {/* Quick Actions */}
 {showQuickActions && (
 <div className="space-y-3">
 <h4 className="text-sm font-medium">Quick Actions</h4>
 <div className="grid grid-cols-2 gap-2">
 {quickActions.map((action, index) => (
 <Button
 key={index}
 variant="outline"
 size={20}
 className="justify-start gap-2"
 onClick={action.action}
>
 <action.icon className="w-4 h-4" />
 {action.label}
 </Button>
 ))}
 </div>
 </div>
 )}

 {/* Suggestions */}
 {showSuggestions && (
 <div className="space-y-3">
 <h4 className="text-sm font-medium">Suggestions</h4>
 <div className="flex flex-wrap gap-2">
 {suggestions.map((suggestion, index) => (
 <Badge
 key={index}
 variant="secondary"
 className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
 onClick={() => handleSendMessage(suggestion)}
>
 {suggestion}
 </Badge>
 ))}
 </div>
 </div>
 )}

 <Separator />

 {/* Input Area */}
 <div className="space-y-2">
 <div className="flex gap-2">
 <Input
 ref={inputRef}
 value={inputMessage}
 onChange={(e) => setInputMessage(e.target.value)}
 onKeyPress={handleKeyPress}
 placeholder="Ask me anything about your properties, campaigns, or ElaView..."
 className="flex-1"
 disabled={isLoading}
 />
 <Button
 size="icon"
 onClick={isListening ? stopListening : startListening}
 disabled={!recognition || isLoading}
 variant={isListening ? 'destructive' : 'outline'}
>
 {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
 </Button>
 <Button
 size="icon"
 onClick={() => handleSendMessage()}
 disabled={!inputMessage.trim() || isLoading}
>
 <Send className="w-4 h-4" />
 </Button>
 </div>
 
 {isSpeaking && (
 <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
 <div className="flex items-center gap-2">
 <Volume2 className="w-4 h-4" />
 <span className="text-sm">Speaking...</span>
 </div>
 <Button size={20} variant="ghost" onClick={stopSpeaking}>
 <X className="w-4 h-4" />
 </Button>
 </div>
 )}
 </div>
 </CardContent>
 </Card>
 </div>
 );
};

export default ChatBot;
