// src/components/ui/EnterpriseLoading.jsx
// ✅ Professional loading components for enterprise messaging
// ✅ Replaces VideoLoader with proper business indicators

import React from 'react';
import { Loader2, Send, CheckCircle, XCircle, RotateCcw, Wifi, WifiOff } from 'lucide-react';

// ✅ Main enterprise loader - replaces VideoLoader
export const EnterpriseLoader = ({ 
  size = 'md', 
  variant = 'spinner', 
  message = '', 
  showMessage = true,
  centered = false,
  theme = 'brand',
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const themeColors = {
    brand: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600'
  };

  const variants = {
    spinner: (
      <Loader2 className={`animate-spin ${sizeClasses[size]} ${themeColors[theme]}`} />
    ),
    dots: (
      <div className="flex space-x-1">
        <div className={`w-2 h-2 bg-current rounded-full animate-bounce ${themeColors[theme]}`} style={{ animationDelay: '0ms' }}></div>
        <div className={`w-2 h-2 bg-current rounded-full animate-bounce ${themeColors[theme]}`} style={{ animationDelay: '150ms' }}></div>
        <div className={`w-2 h-2 bg-current rounded-full animate-bounce ${themeColors[theme]}`} style={{ animationDelay: '300ms' }}></div>
      </div>
    ),
    pulse: (
      <div className={`bg-current rounded-full animate-pulse ${sizeClasses[size]} ${themeColors[theme]}`}></div>
    )
  };

  const content = (
    <div className={`flex items-center space-x-2 ${className}`}>
      {variants[variant]}
      {showMessage && message && (
        <span className={`text-sm font-medium ${themeColors[theme]}`}>{message}</span>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        {content}
      </div>
    );
  }

  return content;
};

// ✅ Message status indicators for enterprise messaging
export const MessageStatusIndicator = ({ status, error, onRetry, className = '' }) => {
  const indicators = {
    sending: (
      <div className="flex items-center space-x-1 text-gray-500">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span className="text-xs">Sending...</span>
      </div>
    ),
    sent: (
      <div className="flex items-center space-x-1 text-gray-400">
        <Send className="w-3 h-3" />
        <span className="text-xs">Sent</span>
      </div>
    ),
    delivered: (
      <div className="flex items-center space-x-1 text-blue-500">
        <CheckCircle className="w-3 h-3" />
        <span className="text-xs">Delivered</span>
      </div>
    ),
    read: (
      <div className="flex items-center space-x-1 text-green-500">
        <CheckCircle className="w-3 h-3 fill-current" />
        <span className="text-xs">Read</span>
      </div>
    ),
    failed: (
      <div className="flex items-center space-x-1 text-red-500">
        <XCircle className="w-3 h-3" />
        <span className="text-xs">Failed</span>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="text-blue-500 hover:text-blue-700 ml-1"
            title="Retry sending"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>
    )
  };

  return (
    <div className={`flex items-center justify-end mt-1 ${className}`}>
      {indicators[status] || indicators.sent}
      {error && (
        <div className="text-xs text-red-500 mt-1" title={error}>
          Error: {error.substring(0, 30)}...
        </div>
      )}
    </div>
  );
};

// ✅ Enterprise send button with loading states
export const EnterpriseSendButton = ({ 
  onSend, 
  disabled = false, 
  isSending = false,
  className = '' 
}) => {
  return (
    <button
      onClick={onSend}
      disabled={disabled || isSending}
      className={`
        inline-flex items-center justify-center
        px-4 py-2 rounded-lg
        bg-blue-600 hover:bg-blue-700
        disabled:bg-gray-300 disabled:cursor-not-allowed
        text-white font-medium
        transition-colors duration-200
        min-w-[80px] h-10
        ${className}
      `}
    >
      {isSending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Sending...
        </>
      ) : (
        <>
          <Send className="w-4 h-4 mr-2" />
          Send
        </>
      )}
    </button>
  );
};

// ✅ Connection status indicator
export const ConnectionStatusIndicator = ({ isConnected, onReconnect, reconnectAttempts = 0 }) => {
  if (isConnected) {
    return (
      <div className="relative group">
        <Wifi className="w-4 h-4 text-green-500" />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Connected
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <WifiOff 
        className="w-4 h-4 text-red-500 cursor-pointer" 
        onClick={onReconnect}
      />
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        Disconnected - Click to reconnect ({reconnectAttempts} attempts)
      </div>
    </div>
  );
};

// ✅ Enterprise typing indicator
export const TypingIndicator = ({ users = [], className = '' }) => {
  if (users.length === 0) return null;

  return (
    <div className={`flex items-center space-x-2 p-3 text-gray-500 ${className}`}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-sm">
        {users.length === 1 
          ? `${users[0]} is typing...`
          : `${users.slice(0, -1).join(', ')} and ${users[users.length - 1]} are typing...`
        }
      </span>
    </div>
  );
};

// ✅ Business message type indicators
export const BusinessMessageTypeIndicator = ({ messageType, className = '' }) => {
  const typeStyles = {
    'RFQ_REQUEST': 'bg-purple-100 text-purple-800 border-purple-200',
    'RFQ_RESPONSE': 'bg-purple-100 text-purple-800 border-purple-200',
    'CONTRACT_SENT': 'bg-orange-100 text-orange-800 border-orange-200',
    'CONTRACT_SIGNED': 'bg-green-100 text-green-800 border-green-200',
    'APPROVAL_REQUEST': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'INVOICE_SENT': 'bg-blue-100 text-blue-800 border-blue-200',
    'PAYMENT_RECEIVED': 'bg-green-100 text-green-800 border-green-200',
    'URGENT_MATTER': 'bg-red-100 text-red-800 border-red-200',
    'CAMPAIGN_PROPOSAL': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'GENERAL': 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const typeLabels = {
    'RFQ_REQUEST': 'Quote Request',
    'RFQ_RESPONSE': 'Quote Response', 
    'CONTRACT_SENT': 'Contract',
    'CONTRACT_SIGNED': 'Contract Signed',
    'APPROVAL_REQUEST': 'Approval Needed',
    'INVOICE_SENT': 'Invoice',
    'PAYMENT_RECEIVED': 'Payment Confirmed',
    'URGENT_MATTER': 'Urgent',
    'CAMPAIGN_PROPOSAL': 'Campaign Proposal',
    'GENERAL': 'Message'
  };

  const style = typeStyles[messageType] || typeStyles.GENERAL;
  const label = typeLabels[messageType] || 'Message';

  return (
    <span className={`
      inline-flex items-center px-2 py-1 rounded-md border text-xs font-medium
      ${style} ${className}
    `}>
      {label}
    </span>
  );
};

// ✅ Loading skeletons for different states
export const ConversationLoadingSkeleton = () => {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const MessageLoadingSkeleton = () => {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className={`
            max-w-xs rounded-lg p-3 space-y-2
            ${i % 2 === 0 ? 'bg-blue-100' : 'bg-gray-100'}
          `}>
            <div className="h-3 bg-gray-300 rounded animate-pulse w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};