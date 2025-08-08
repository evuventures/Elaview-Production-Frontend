# Elaview Frontend

**Modern React Frontend for Property Advertising Platform**

This frontend provides the user interface for Elaview, a B2B marketplace connecting landlords with advertising space with businesses looking to rent those spaces for ads. Built with React, Vite, TypeScript, and modern development tools.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Environment Variables](#environment-variables)
3. [Project Structure](#project-structure)
4. [Development Tools](#development-tools)
5. [Component Architecture](#component-architecture)
6. [API Integration](#api-integration)
7. [Development Workflows](#development-workflows)
8. [Build and Deployment](#build-and-deployment)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)
11. [Contributing](#contributing)

## Getting Started

You can set up the Elaview frontend using either traditional Node.js development or Docker. Both approaches provide the same functionality with hot module replacement.

### Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **Docker Desktop** (for Docker workflow)
- **Git** for version control
- **Backend API** (either local or Docker backend)

### 🚀 Quick Start (Docker - Recommended for New Team Members)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/evuventures/Elaview-Production-Frontend.git
   cd Elaview-Production-Frontend
   ```

2. **Set up Docker environment:**
   ```bash
   # Create Docker-specific config (will be created from template)
   ./docker-setup.sh
   
   # Edit .env.docker with your ports (if needed)
   # Your API keys go in frontend/.env (see Environment Variables section)
   ```

3. **Start the development environment:**
   ```bash
   ./docker-setup.sh
   ```

4. **Access your application:**
   - **Frontend App**: http://localhost:3000
   - **Hot Module Replacement**: Automatic browser updates

### 🛠️ Traditional Setup (For Existing Developers)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/evuventures/Elaview-Production-Frontend.git
   cd Elaview-Production-Frontend/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your environment:**
   ```bash
   # Ensure frontend/.env exists with your configuration
   # See Environment Variables section for required values
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Navigate to http://localhost:3000

## Environment Variables

The frontend uses a dual environment strategy to separate application configuration from Docker-specific settings.

### 📁 File Locations

```
Elaview-Production-Frontend/
├── frontend/.env             # ← Your app configuration (API keys, URLs)
└── .env.docker              # ← Docker-specific settings (ports only)
```

### 🔑 Application Environment (`frontend/.env`)

Contains your actual API keys, configuration, and application settings:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# Authentication (Clerk)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key

# Google Services
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key

# Payments (Stripe)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# App Configuration
VITE_APP_NAME=Elaview
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# Base44 SDK (Legacy)
VITE_BASE44_API_URL=https://api.base44.com
```

### 🐳 Docker Environment (`.env.docker`)

Contains Docker-specific overrides (minimal - just ports):

```bash
# Docker Configuration
BUILD_TARGET=development
NODE_ENV=development

# Ports
FRONTEND_PORT=3000

# API URL (when connecting to backend container)
VITE_API_BASE_URL=http://localhost:3001/api
```

### 🔄 How It Works

- **Traditional Development**: Uses `frontend/.env` directly
- **Docker Development**: Loads `frontend/.env` first, then applies `.env.docker` overrides
- **Docker Override**: Only port configuration and API URL for container networking

## Project Structure

```
Elaview-Production-Frontend/
├── 📄 PROJECT.md              # This documentation
├── 📄 README.md               # Quick reference
├── 📄 Dockerfile              # Multi-stage container definition
├── 📄 docker-compose.yml      # Service orchestration
├── 📄 docker-setup.sh         # Automated Docker setup
├── 📄 .env.docker             # Docker-specific environment
├── 📄 .dockerignore           # Docker build exclusions
└── frontend/                  # 🏠 Main application directory
    ├── 📄 .env                # Application environment variables
    ├── 📄 package.json        # Dependencies and scripts
    ├── 📄 vite.config.js      # Vite build configuration
    ├── 📄 tailwind.config.js  # Tailwind CSS configuration
    ├── 📄 tsconfig.json       # TypeScript configuration
    ├── 📄 index.html          # HTML entry point
    ├── 📄 nginx.conf          # Production nginx configuration
    ├── 📁 src/                # Source code
    │   ├── 📄 App.jsx         # Main App component
    │   ├── 📄 main.jsx        # Application entry point
    │   ├── 📄 index.css       # Global styles
    │   ├── 📁 components/     # Reusable React components
    │   │   ├── 📁 ui/         # Base UI components (Radix UI)
    │   │   ├── 📁 auth/       # Authentication components
    │   │   ├── 📁 booking/    # Booking and reservation components
    │   │   ├── 📁 browse/     # Property and space browsing
    │   │   ├── 📁 campaigns/  # Campaign management
    │   │   ├── 📁 chatbot/    # AI chatbot components
    │   │   ├── 📁 dashboard/  # Dashboard components
    │   │   ├── 📁 layout/     # Layout and navigation
    │   │   ├── 📁 messages/   # B2B messaging components
    │   │   └── 📁 payments/   # Payment processing components
    │   ├── 📁 pages/          # Page components
    │   │   ├── 📁 admin/      # Admin panel pages
    │   │   ├── 📁 auth/       # Authentication pages
    │   │   ├── 📁 bookings/   # Booking management pages
    │   │   ├── 📁 browse/     # Property browsing pages
    │   │   ├── 📁 campaigns/  # Campaign pages
    │   │   ├── 📁 checkout/   # Checkout and payment pages
    │   │   ├── 📁 dashboard/  # Dashboard pages
    │   │   └── 📁 messages/   # Messaging pages
    │   ├── 📁 hooks/          # Custom React hooks
    │   ├── 📁 lib/            # Utility libraries
    │   ├── 📁 api/            # API client and integration
    │   ├── 📁 contexts/       # React context providers
    │   ├── 📁 types/          # TypeScript type definitions
    │   └── 📁 utils/          # Helper functions
    └── 📁 public/             # Static assets
```

## Development Tools

### 🐳 Docker Tools (Recommended)

```bash
# Start development environment
./docker-setup.sh

# View logs
docker compose logs -f frontend

# Access frontend shell
docker compose exec frontend sh

# Install packages
docker compose exec frontend npm install package-name
docker compose restart frontend

# Stop services
docker compose down

# Clean restart
docker compose down -v && ./docker-setup.sh
```

### 🛠️ Traditional Tools

```bash
# Development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type checking
npx tsc --noEmit
```

### ⚡ Vite Features

- **Hot Module Replacement (HMR)**: Instant updates without page refresh
- **Fast Builds**: Optimized build performance with esbuild
- **TypeScript Support**: Native TypeScript integration
- **CSS Processing**: PostCSS and Tailwind CSS integration
- **Asset Optimization**: Automatic asset optimization and bundling

## Component Architecture

### 🎨 Design System

The frontend uses a modern design system built on **Radix UI** and **Tailwind CSS**:

#### Base UI Components (`src/components/ui/`)
- **Accessible**: Built on Radix UI primitives
- **Customizable**: Styled with Tailwind CSS
- **Consistent**: Shared design tokens and patterns

```bash
# Example UI components:
src/components/ui/
├── button.jsx          # Button variants and sizes
├── input.jsx           # Form input components
├── dialog.jsx          # Modal and dialog components
├── dropdown-menu.jsx   # Dropdown and context menus
├── card.jsx            # Card layouts
└── ...                 # 40+ UI components
```

#### Feature Components
- **Modular**: Organized by feature domain
- **Reusable**: Shared components across pages
- **Tested**: Manual testing and validation

### 🧩 Component Guidelines

```jsx
// Example component structure
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useApiClient } from '@/hooks/useApiClient';

export function PropertyCard({ property }) {
  const [isLoading, setIsLoading] = useState(false);
  const api = useApiClient();

  const handleBooking = async () => {
    setIsLoading(true);
    try {
      await api.post('/bookings', { propertyId: property.id });
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold">{property.title}</h3>
      <p className="text-gray-600">{property.description}</p>
      <Button onClick={handleBooking} disabled={isLoading}>
        {isLoading ? 'Booking...' : 'Book Now'}
      </Button>
    </div>
  );
}
```

## API Integration

### 🔌 API Client Architecture

The frontend uses a sophisticated API client with multiple integration patterns:

#### Main API Client (`src/api/apiClient.js`)
- **Rate Limiting**: Request deduplication and caching
- **Authentication**: Automatic Clerk JWT token integration
- **Error Handling**: Comprehensive error handling and retry logic
- **Type Safety**: TypeScript integration for API responses

```javascript
// Example API usage
import { useApiClient } from '@/hooks/useApiClient';

function PropertyList() {
  const api = useApiClient();
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await api.get('/properties');
        setProperties(data);
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      }
    };

    fetchProperties();
  }, [api]);

  return (
    <div>
      {properties.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
```

#### Authentication Integration
- **Clerk React**: `useUser`, `useAuth`, `useClerk` hooks
- **Automatic Tokens**: JWT tokens automatically included in API requests
- **Route Protection**: Protected routes with authentication guards

#### API Hooks (`src/hooks/`)
```javascript
// Custom hooks for API operations
export function useProperties() {
  const api = useApiClient();
  return useQuery(['properties'], () => api.get('/properties'));
}

export function useCreateProperty() {
  const api = useApiClient();
  return useMutation((data) => api.post('/properties', data));
}
```

### 🌐 API Endpoints Integration

| Feature | API Endpoints | Components |
|---------|---------------|------------|
| **Authentication** | `/api/auth/*` | `src/components/auth/` |
| **Properties** | `/api/properties/*` | `src/pages/browse/`, `src/components/properties/` |
| **Spaces** | `/api/spaces/*` | `src/components/browse/` |
| **Bookings** | `/api/bookings/*` | `src/pages/bookings/`, `src/components/booking/` |
| **Campaigns** | `/api/campaigns/*` | `src/pages/campaigns/` |
| **Payments** | `/api/checkout/*` | `src/pages/checkout/`, `src/components/payments/` |
| **Messages** | `/api/messages/*` | `src/pages/messages/` |
| **File Upload** | `/api/upload/*` | `src/components/upload/` |

## Development Workflows

### 🔄 Side-by-Side Comparison

| Task | Traditional | Docker |
|------|-------------|---------|
| **Start Development** | `cd frontend && npm run dev` | `./docker-setup.sh` |
| **View Logs** | Terminal output | `docker compose logs -f frontend` |
| **Install Package** | `npm install package` | `docker compose exec frontend npm install package` |
| **Build Production** | `npm run build` | `BUILD_TARGET=production docker compose up --build` |
| **Stop Services** | `Ctrl+C` | `docker compose down` |
| **Access Application** | http://localhost:3000 | http://localhost:3000 |

### 🚀 Daily Development

#### Morning Setup
```bash
# Docker workflow
./docker-setup.sh

# Traditional workflow  
cd frontend && npm run dev
```

#### Making Changes
```bash
# Code changes: Both workflows support hot module replacement
# Component changes are reflected immediately in the browser
# CSS changes update without page refresh
```

#### Installing Dependencies
```bash
# Docker workflow
docker compose exec frontend npm install new-package
docker compose restart frontend

# Traditional workflow
npm install new-package
# Vite restarts automatically
```

#### Building and Testing
```bash
# Docker workflow
BUILD_TARGET=production docker compose up --build
open http://localhost:3000

# Traditional workflow
npm run build
npm run preview
```

#### End of Day
```bash
# Docker workflow
docker compose down

# Traditional workflow
# Just close terminal (Ctrl+C)
```

### 🎨 Frontend Development Patterns

#### Component Development
```bash
# Create new component
mkdir src/components/feature-name
touch src/components/feature-name/FeatureComponent.jsx

# Add to component export
echo "export { FeatureComponent } from './FeatureComponent';" >> src/components/index.js
```

#### Styling with Tailwind
```jsx
// Use Tailwind utility classes
<div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">
    Property Details
  </h2>
</div>
```

#### State Management
```jsx
// Local state with useState
const [isLoading, setIsLoading] = useState(false);

// Context for global state
const { user } = useUser();
const { theme } = useTheme();

// API state with custom hooks
const { data: properties, isLoading } = useProperties();
```

## Build and Deployment

### 🏗️ Build Process

#### Development Build
```bash
# Traditional
npm run dev

# Docker
./docker-setup.sh
```

#### Production Build
```bash
# Traditional
npm run build
npm run preview

# Docker
BUILD_TARGET=production docker compose up --build
```

### 🚀 Deployment Options

#### Static Site Deployment
The frontend builds to static files that can be deployed anywhere:

```bash
# Build static files
npm run build

# Output directory: frontend/dist/
# Deploy dist/ folder to any static hosting service
```

#### Supported Platforms
- **Vercel**: Automatic deployment from git
- **Netlify**: Static site hosting with forms
- **AWS S3 + CloudFront**: Scalable CDN deployment
- **Railway**: Container deployment
- **GitHub Pages**: Free static hosting

#### Docker Deployment
```bash
# Build production container
docker build --target production -t elaview-frontend .

# Run production container
docker run -p 3000:80 elaview-frontend
```

### 🔧 Build Configuration

#### Vite Configuration (`frontend/vite.config.js`)
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
});
```

#### Environment-Specific Builds
```bash
# Development build
VITE_APP_ENV=development npm run build

# Staging build
VITE_APP_ENV=staging npm run build

# Production build
VITE_APP_ENV=production npm run build
```

## Testing

### 🧪 Testing Strategy

Currently, the frontend uses manual testing and component validation.

#### Manual Testing Checklist
- [ ] **Authentication Flow**: Sign in, sign up, sign out
- [ ] **Property Browsing**: Search, filter, view details
- [ ] **Booking Process**: Select spaces, checkout, payment
- [ ] **Dashboard Access**: User dashboard, admin panel
- [ ] **Responsive Design**: Mobile, tablet, desktop
- [ ] **API Integration**: All endpoints working correctly

#### Browser Testing
```bash
# Test in multiple browsers
open -a "Google Chrome" http://localhost:3000
open -a "Safari" http://localhost:3000
open -a "Firefox" http://localhost:3000
```

#### Mobile Testing
```bash
# Access from mobile devices on same network
# Get your IP address
ipconfig getifaddr en0  # macOS
ip route get 1 | awk '{print $7}'  # Linux

# Access from mobile: http://[your-ip]:3000
```

### 🔍 Future Testing Enhancements

#### Unit Testing (Planned)
```bash
# When implemented:
npm test
npm run test:watch
npm run test:coverage
```

#### Component Testing
```bash
# Testing library integration
npm install @testing-library/react
npm install @testing-library/jest-dom
```

#### End-to-End Testing
```bash
# Cypress or Playwright integration
npm install cypress
npm run test:e2e
```

## Troubleshooting

### 🚨 Common Issues

#### Docker Issues

| Problem | Solution |
|---------|----------|
| **Port 3000 in use** | Change `FRONTEND_PORT` in `.env.docker` |
| **Container won't start** | Check `docker compose logs frontend` |
| **HMR not working** | Restart container: `docker compose restart frontend` |
| **Environment variables missing** | Ensure `frontend/.env` exists and is configured |
| **Can't connect to backend** | Ensure backend is running and network is configured |

#### Traditional Development Issues

| Problem | Solution |
|---------|----------|
| **Port 3000 in use** | Kill process: `lsof -ti:3000 \| xargs kill -9` |
| **Dependencies out of sync** | Delete `node_modules` and run `npm install` |
| **Vite build errors** | Clear cache: `rm -rf node_modules/.vite` |
| **TypeScript errors** | Run type check: `npx tsc --noEmit` |

#### API Connection Issues

| Problem | Solution |
|---------|----------|
| **API calls failing** | Check backend is running on port 3001 |
| **CORS errors** | Verify backend CORS configuration |
| **Authentication errors** | Check Clerk configuration and API keys |
| **404 API errors** | Verify API endpoints and routing |

### 🔧 Debug Commands

#### Docker Debugging
```bash
# View all logs
docker compose logs -f

# Check container status
docker compose ps

# Access frontend shell
docker compose exec frontend sh

# Test network connectivity
docker compose exec frontend ping backend

# Complete reset
docker compose down -v && ./docker-setup.sh
```

#### Traditional Debugging
```bash
# Check Node.js version
node --version

# Verify npm packages
npm list

# Clear Vite cache
rm -rf node_modules/.vite

# Check process information
ps aux | grep node
```

#### Browser Debugging
```bash
# Open browser developer tools
# Check Console for JavaScript errors
# Check Network tab for API calls
# Check Application tab for local storage
```

### 📞 Getting Help

1. **Check Browser Console**: Look for JavaScript errors
2. **Check Network Tab**: Verify API calls are working
3. **Check Environment Variables**: Ensure all required vars are set
4. **Backend Connection**: Verify backend is accessible
5. **Clean Restart**: Try a complete environment reset

## Contributing

### 🔀 Development Process

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Set up development environment**: Choose Docker or traditional setup
4. **Make your changes**: Follow component and styling guidelines
5. **Test your changes**: Verify functionality across browsers
6. **Commit your changes**: `git commit -m 'feat: add amazing feature'`
7. **Push to your branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**: Use the PR template and include screenshots

### 🎨 Design Guidelines

#### Component Development
- **Accessibility**: Use Radix UI primitives for accessibility
- **Responsive Design**: Design mobile-first with Tailwind CSS
- **Performance**: Optimize for fast loading and smooth interactions
- **Consistency**: Follow established design patterns

#### Code Standards
- **React Patterns**: Use modern React patterns (hooks, functional components)
- **TypeScript**: Gradually migrate to TypeScript for type safety
- **CSS**: Use Tailwind CSS utility classes
- **Imports**: Use absolute imports with `@/` alias

#### File Organization
```bash
# Component structure
src/components/feature-name/
├── FeatureComponent.jsx     # Main component
├── FeatureSubComponent.jsx  # Sub-components
├── index.js                 # Export file
└── feature.types.js         # Type definitions (if using TypeScript)
```

### 🧪 Testing Requirements

- **Browser Testing**: Test in Chrome, Safari, Firefox
- **Mobile Testing**: Verify mobile responsiveness
- **API Integration**: Test all API endpoints used
- **Authentication**: Test auth flows (sign in, sign out)
- **Performance**: Check loading times and interactions

### 📋 Pull Request Checklist

- [ ] Code follows React and project coding standards
- [ ] Components are responsive and accessible
- [ ] API integration is tested and working
- [ ] Environment variables are documented (if added)
- [ ] Screenshots included for UI changes
- [ ] Documentation is updated (if applicable)
- [ ] No hardcoded values or secrets
- [ ] Changes work with both Docker and traditional setups

### 🎯 Component Guidelines

#### Creating New Components
```jsx
// Use this template for new components
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function NewComponent({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);

  const handleAction = () => {
    // Handle user interactions
  };

  return (
    <div className="component-container">
      {/* Component JSX */}
    </div>
  );
}

// PropTypes or TypeScript types
NewComponent.propTypes = {
  prop1: PropTypes.string.required,
  prop2: PropTypes.func,
};
```

#### Styling Guidelines
```jsx
// Use Tailwind utility classes
<div className="bg-white shadow-lg rounded-lg p-6">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">
    Title
  </h2>
  <p className="text-gray-600">
    Description text
  </p>
</div>

// Use responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Responsive grid */}
</div>
```

---

## 📞 Support

For questions, issues, or contributions:

- **Create an issue**: Use GitHub issues for bug reports and feature requests
- **Join discussions**: Participate in GitHub discussions  
- **Contact maintainers**: Reach out to project maintainers for urgent issues

**Happy coding!** 🚀 Your contributions help make Elaview's user experience better for everyone.