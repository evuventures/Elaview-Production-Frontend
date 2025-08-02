// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { VerificationProvider } from '@/components/verification/VerificationProvider'
import App from './App.jsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

// Add this at the top of main.jsx for debugging
console.log('Testing favicon accessibility...');
console.log('Favicon URL should be:', window.location.origin + '/elaview-favicon.png');

// Test if favicon loads
const testFavicon = new Image();
testFavicon.onload = () => console.log('✅ Favicon loaded successfully');
testFavicon.onerror = () => console.error('❌ Favicon failed to load');
testFavicon.src = '/elaview-favicon.png';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <QueryClientProvider client={queryClient}>
        <VerificationProvider>
          <App />
        </VerificationProvider>
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>,
)