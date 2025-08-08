# Elaview Frontend

**Modern React Frontend for Property Advertising Platform**

Elaview is a B2B marketplace that connects landlords who have physical advertising space — like building walls, windows, vehicles, or billboards — with businesses looking to rent those spaces for ads.

Using Elaview's patented technology, we calculate rental value by how much foot traffic/view rate your ad space receives!

## 🚀 Quick Start

Choose your preferred development approach:

### Docker (Recommended for New Team Members)
```bash
./docker-setup.sh
```
**Access**: Frontend at http://localhost:3000 with hot module replacement

### Traditional Development
```bash
cd frontend
npm install
npm run dev
```

## 📖 Complete Documentation

For comprehensive setup instructions, component architecture, API integration, and development workflows, see:

**[📚 PROJECT.md](./PROJECT.md)** - Complete project documentation

## 🏗️ Technology Stack

- **Framework**: React 18 with Vite
- **Language**: JavaScript + TypeScript (gradual migration)
- **Styling**: Tailwind CSS + Radix UI components
- **Routing**: React Router DOM
- **Authentication**: Clerk React integration
- **State Management**: React hooks + Context API
- **Build Tool**: Vite with hot module replacement

## 🌐 Service URLs

| Environment | Frontend App | Backend API |
|-------------|--------------|-------------|
| **Development** | http://localhost:3000 | http://localhost:3001 |
| **Production** | TBD | https://elaview-backend.up.railway.app |

## 📁 Project Structure

```
Elaview-Production-Frontend/
├── frontend/          # Main application code
│   ├── src/          # React components and logic
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/     # Page-level components
│   │   ├── api/       # API integration layer
│   │   └── hooks/     # Custom React hooks
│   ├── public/       # Static assets
│   └── .env          # Environment configuration
├── Dockerfile        # Container configuration
├── docker-compose.yml # Service orchestration
└── PROJECT.md        # Complete documentation
```

## 🎨 Key Features

- **🔐 Authentication**: Secure sign-in with Clerk
- **🏠 Property Browsing**: Interactive property and space discovery
- **📅 Booking System**: End-to-end reservation management
- **💳 Payments**: Stripe-powered payment processing
- **📱 Responsive Design**: Mobile-first, accessible interface
- **🤖 AI Chatbot**: Intelligent customer support
- **📊 Dashboard**: User and admin management interfaces

## 🤝 Contributing

1. Read [PROJECT.md](./PROJECT.md) for detailed guidelines
2. Choose Docker or traditional development setup
3. Follow React and component development patterns
4. Test across browsers and devices
5. Submit a pull request with screenshots

---

**Need Help?** Check [PROJECT.md](./PROJECT.md) for troubleshooting, detailed setup instructions, and component development workflows.