# Environment Configuration Guide

## Frontend Environment Variables (Vite React App)

Your frontend uses **Vite** environment variables (prefixed with `VITE_`), not React (`REACT_APP_`).

### Required Environment Variables

Create a `.env` file in your root directory with:

```bash
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_aW5ub2NlbnQtbWFydGVuLTM1LmNsZXJrLmFjY291bnRzLmRldiQ

# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
# ⚠️ IMPORTANT: You need a valid Google Maps API key for the map features to work
# Get one at: https://developers.google.com/maps/documentation/javascript/get-api-key
# The current key is a demo key that may not work in production

# Gemini API Key (for AI Chatbot)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
# ⚠️ IMPORTANT: You need a valid Gemini API key for the AI chatbot to work
# Get one at: https://makersuite.google.com/app/apikey
# This enables the intelligent chatbot assistant features

# Stripe (for frontend payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# App Configuration
VITE_APP_NAME=Property Advertising Platform
VITE_APP_VERSION=1.0.0

# Development Configuration
VITE_APP_ENV=development
```

### Environment Variable Usage

In your Vite React components, access environment variables using:

```javascript
// ✅ Correct for Vite
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const apiUrl = import.meta.env.VITE_API_BASE_URL;

// ❌ Incorrect (this is for Create React App)
const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
```

## Current Integration Status

### ✅ Already Configured:
- **Clerk Authentication**: Properly set up in `main.jsx` with `ClerkProvider`
- **Google Maps**: Updated to use Vite environment variables
- **API Configuration**: Backend API routes ready
- **Database**: Prisma schema configured in backend

### 🔧 Next Steps:
1. **Add your Google Maps API Key** to the `.env` file
2. **Add your Stripe Publishable Key** if using payments
3. **Test the authentication flow** with Clerk
4. **Test the Google Maps integration**

## Backend Environment Variables

Your backend (in `/backend` folder) should have its own `.env` file with:

```bash
# Clerk
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here

# Database
DATABASE_URL="your_database_connection_string"

# Stripe (for backend)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"

# Other backend configs
PORT=5000
NODE_ENV=development
```

## Security Notes

- **Never commit `.env` files** to version control
- **Use `.env.example`** for sharing template configurations
- **Keep secret keys secure** and never expose them in frontend code
- **Use different keys** for development and production environments
