import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Phone, MessageCircle, Clock, CheckCircle, 
  AlertCircle, Camera, Paperclip, User, Calendar,
  X, MoreVertical, Copy, Flag
} from 'lucide-react';
import { InstallationCommunicationProps, InstallationMessage } from '../types';

export const InstallationCommunication: React.FC<InstallationCommunicationProps> = ({ 
  booking, 
  messages, 
  showModal, 
  onClose, 
  onSendMessage, 
  onRequestCall, 
  onEscalateIssue 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!showModal) return null;

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickMessages = [
    "Hi! Just checking on the installation progress. Any updates?",
    "When do you think the installation will be completed?",
    "Could you please send photos of the current progress?",
    "Is there anything you need from me to complete the installation?",
    "The materials should have been delivered. Did you receive them?",
    "Could we schedule a time to discuss the installation?"
  ];

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const getMessageStatusIcon = (status: string) => {
    switch(status) {
      case 'sent': return <Clock className="w-3 h-3 text-gray-400" />;
      case 'delivered': return <CheckCircle className="w-3 h-3 text-gray-500" />;
      case 'read': return <CheckCircle className="w-3 h-3 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[80vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {booking.propertyOwnerName || 'Property Owner'}
                </h2>
                <p className="text-teal-100 text-sm">
                  Installation: {booking.spaceName} • {booking.location}
                </p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-teal-200 text-xs">Active</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={onRequestCall}
                className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                title="Request phone call"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                title="More options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              <button 
                onClick={onClose}
                className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Quick Actions Dropdown */}
          {showQuickActions && (
            <div className="absolute right-6 top-20 bg-white rounded-lg shadow-lg py-2 z-10 min-w-[200px]">
              <button
                onClick={() => {
                  onRequestCall();
                  setShowQuickActions(false);
                }}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Phone className="w-4 h-4 mr-3" />
                Request Phone Call
              </button>
              <button
                onClick={() => {
                  onEscalateIssue();
                  setShowQuickActions(false);
                }}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Flag className="w-4 h-4 mr-3" />
                Escalate to Support
              </button>
              <div className="border-t my-1" />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Installation ID: ${booking.id}`);
                  setShowQuickActions(false);
                }}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Copy className="w-4 h-4 mr-3" />
                Copy Installation ID
              </button>
            </div>
          )}
        </div>

        {/* Installation Status Bar */}
        <div className="bg-gray-50 border-b px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 font-medium text-blue-600">
                  {booking.installationStatus?.replace('_', ' ').toLowerCase() || 'N/A'}
                </span>
              </div>
              {booking.installDeadline && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-gray-600">
                    Due: {new Date(booking.installDeadline).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            
            {booking.materialStatus === 'DELIVERED' && booking.installationStatus === 'PENDING' && (
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                Materials Ready - Awaiting Installation
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-600 mb-6">
                  Start a conversation with the property owner about the installation
                </p>
                <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
                  {quickMessages.slice(0, 3).map((message, index) => (
                    <button
                      key={index}
                      onClick={() => setNewMessage(message)}
                      className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                    >
                      "{message}"
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isFromAdvertiser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isFromAdvertiser
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    
                    {/* Message attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center text-xs opacity-90">
                            {attachment.type === 'image' ? (
                              <div className="flex items-center">
                                <Camera className="w-3 h-3 mr-1" />
                                <img
                                  src={attachment.url}
                                  alt="Attachment"
                                  className="w-16 h-16 object-cover rounded mt-1"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Paperclip className="w-3 h-3 mr-1" />
                                <span>{attachment.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className={`flex items-center justify-between mt-1 text-xs ${
                      message.isFromAdvertiser ? 'text-teal-100' : 'text-gray-500'
                    }`}>
                      <span>{formatMessageTime(message.timestamp)}</span>
                      {message.isFromAdvertiser && getMessageStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Message Suggestions */}
          {messages.length === 0 && (
            <div className="px-6 py-3 border-t bg-gray-50">
              <p className="text-xs text-gray-600 mb-2">Quick messages:</p>
              <div className="flex flex-wrap gap-2">
                {quickMessages.slice(0, 4).map((message, index) => (
                  <button
                    key={index}
                    onClick={() => setNewMessage(message)}
                    className="text-xs bg-white hover:bg-gray-100 px-3 py-1 rounded-full border text-gray-700 transition-colors"
                  >
                    {message.length > 40 ? `${message.substring(0, 40)}...` : message}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="p-6 border-t bg-white">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    setIsTyping(e.target.value.length > 0);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className={`p-3 rounded-lg transition-colors ${
                  newMessage.trim()
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <div className="flex items-center space-x-4">
                <button className="hover:text-gray-700 transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button className="hover:text-gray-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};