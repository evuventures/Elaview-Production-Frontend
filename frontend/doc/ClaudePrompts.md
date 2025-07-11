I need you to be fully aware of my project scope, the current database, and the entire project overview, so we can continue working.

Please review the current data models, json files, and ask me any questions you need to before we can start working.

I have a prisma DB, and the data is being pushed to railway postgreSQL database. Any changes to the data model needs to first be changed in prisma, and pushed to railway.

Please NEVER provide just snippets. Always give file path comments at the top of each file.

When you suggest a change, make sure you understand the entire file I possess before you suggest any changes.





{
  "name": "base44-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@base44/sdk": "^0.1.2",
    "@clerk/clerk-react": "^5.32.4",
    "@google/generative-ai": "^0.24.1",
    "@googlemaps/js-api-loader": "^1.16.10",
    "@hookform/resolvers": "^4.1.2",
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-aspect-ratio": "^1.1.2",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-collapsible": "^1.1.3",
    "@radix-ui/react-context-menu": "^2.2.6",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-hover-card": "^1.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-menubar": "^1.1.6",
    "@radix-ui/react-navigation-menu": "^1.2.5",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toggle": "^1.1.2",
    "@radix-ui/react-toggle-group": "^1.1.2",
    "@radix-ui/react-tooltip": "^1.1.8",
    "@stripe/react-stripe-js": "^3.7.0",
    "@stripe/stripe-js": "^7.4.0",
    "@tanstack/react-query": "^5.81.5",
    "axios": "^1.10.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.0",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.5.2",
    "framer-motion": "^12.4.7",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.475.0",
    "next-themes": "^0.4.4",
    "react": "^18.2.0",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.54.2",
    "react-resizable-panels": "^2.1.7",
    "react-router-dom": "^7.2.0",
    "react-speech-recognition": "^4.0.1",
    "recharts": "^2.15.1",
    "sonner": "^2.0.1",
    "tailwind-merge": "^3.0.2",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^1.1.2",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@eslint/js": "^9.19.0",
    "@flydotio/dockerfile": "^0.7.8",
    "@types/google.maps": "^3.58.1",
    "@types/node": "^22.16.0",
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.19.0",
    "eslint-plugin-react": "^7.37.4",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.18",
    "globals": "^15.14.0",
    "postcss": "^8.5.3",
    "tailwindcss": "^3.4.17",
    "vite": "^6.1.0"
  }
}


@tailwind base;
@tailwind components;
@tailwind utilities;

/* ================================
   OPTION A: PROFESSIONAL TRUST
   Blue Palette (#404F70 to #D2F1FA)
   ================================ */

@layer base {
  :root {
    /* Brand Colors */
    --brand-primary: 220 25% 60%;        /* #6169A7 */
    --brand-primary-hover: 220 30% 50%;  /* #4B5982 */
    --brand-secondary: 220 25% 40%;      /* #404F70 */
    --brand-accent: 250 70% 75%;         /* #A08FEF */
    --brand-accent-light: 230 60% 85%;   /* #AAB9F4 */
    --brand-gradient-start: 220 25% 60%; /* #6169A7 */
    --brand-gradient-end: 250 70% 75%;   /* #A08FEF */

    /* Base colors */
    --background: 210 20% 98%;           /* #fafbfc */
    --foreground: 210 20% 10%;           /* #1a1d21 */
    
    /* Card system */
    --card: 0 0% 100%;                   /* #ffffff */
    --card-foreground: 210 20% 10%;     /* #1a1d21 */
    --card-border: 210 15% 90%;         /* #e1e5e9 */
    
    /* Muted colors */
    --muted: 210 15% 95%;               /* #f1f3f5 */
    --muted-foreground: 210 10% 45%;    /* #6c7481 */
    
    /* Primary system */
    --primary: var(--brand-primary);
    --primary-foreground: 0 0% 100%;
    --primary-hover: var(--brand-primary-hover);
    
    /* Secondary system */
    --secondary: 210 25% 92%;           /* #e8eaf2 */
    --secondary-foreground: var(--brand-secondary);
    
    /* Accent system */
    --accent: var(--brand-accent);
    --accent-foreground: 0 0% 100%;
    --accent-light: var(--brand-accent-light);
    
    /* Interactive elements */
    --border: 210 15% 90%;              /* #e1e5e9 */
    --input: 0 0% 100%;                 /* #ffffff */
    --ring: var(--brand-primary);
    
    /* Semantic colors */
    --success: 142 76% 36%;             /* #16a34a */
    --success-foreground: 0 0% 100%;
    --warning: 45 96% 64%;              /* #eab308 */
    --warning-foreground: 45 100% 10%;
    --destructive: 0 84% 60%;           /* #ef4444 */
    --destructive-foreground: 0 0% 100%;
    
    /* Sidebar system */
    --sidebar-background: 210 20% 98%;
    --sidebar-foreground: 210 20% 15%;
    --sidebar-primary: var(--brand-primary);
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 210 15% 95%;
    --sidebar-accent-foreground: var(--brand-primary);
    --sidebar-border: 210 15% 90%;
    --sidebar-ring: var(--brand-primary);
    
    /* Chart colors */
    --chart-1: var(--brand-primary);
    --chart-2: var(--brand-accent);
    --chart-3: var(--success);
    --chart-4: var(--warning);
    --chart-5: var(--destructive);
    
    /* Gradient system */
    --gradient-primary: linear-gradient(135deg, 
      hsl(var(--brand-gradient-start)), 
      hsl(var(--brand-gradient-end))
    );
    --gradient-primary-hover: linear-gradient(135deg, 
      hsl(var(--brand-primary-hover)), 
      hsl(var(--brand-accent))
    );
    
    /* Border radius */
    --radius: 0.75rem;
    --radius-sm: 0.5rem;
    --radius-lg: 1rem;
    --radius-xl: 1.5rem;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    
    /* Brand shadows */
    --shadow-brand: 0 10px 25px -5px hsl(var(--brand-primary) / 0.2);
    --shadow-brand-lg: 0 20px 40px -10px hsl(var(--brand-primary) / 0.3);
  }

  /* Dark Mode */
  .dark {
    --background: 215 30% 7%;           /* #0f1419 */
    --foreground: 210 20% 97%;          /* #f8fafc */
    --card: 215 25% 12%;                /* #1a202c */
    --card-foreground: 210 20% 97%;    /* #f8fafc */
    --card-border: 215 20% 20%;        /* #2d3748 */
    --muted: 215 20% 20%;              /* #2d3748 */
    --muted-foreground: 215 15% 65%;   /* #a0aec0 */
    --primary: var(--brand-primary);
    --primary-foreground: 0 0% 100%;
    --primary-hover: var(--brand-accent);
    --secondary: 215 20% 20%;          /* #2d3748 */
    --secondary-foreground: 210 15% 85%; /* #cbd5e1 */
    --accent: var(--brand-accent);
    --accent-foreground: 0 0% 100%;
    --accent-light: var(--brand-accent-light);
    --border: 215 20% 20%;             /* #2d3748 */
    --input: 215 20% 20%;              /* #2d3748 */
    --ring: var(--brand-primary);
    --success: 142 71% 45%;            /* #22c55e */
    --success-foreground: 0 0% 100%;
    --warning: 48 96% 77%;             /* #fbbf24 */
    --warning-foreground: 45 100% 10%;
    --destructive: 0 91% 71%;          /* #fb7185 */
    --destructive-foreground: 0 0% 100%;
    --sidebar-background: 215 30% 7%;
    --sidebar-foreground: 210 15% 85%;
    --sidebar-primary: var(--brand-primary);
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 215 20% 15%;
    --sidebar-accent-foreground: 210 15% 85%;
    --sidebar-border: 215 20% 15%;
    --sidebar-ring: var(--brand-primary);
    --shadow-brand: 0 10px 25px -5px hsl(var(--brand-primary) / 0.4);
    --shadow-brand-lg: 0 20px 40px -10px hsl(var(--brand-primary) / 0.5);
  }
}

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground font-sans antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    @apply bg-muted/30;
  }
  
  ::-webkit-scrollbar-thumb {
    background: hsl(var(--primary) / 0.5);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--primary) / 0.7);
  }
}

@layer components {
  .bg-gradient-brand {
    background: var(--gradient-primary);
  }
  
  .bg-gradient-brand-hover {
    background: var(--gradient-primary-hover);
  }
  
  .text-gradient-brand {
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent;
  }
  
  .glass {
    background: hsl(var(--card) / 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid hsl(var(--border) / 0.5);
  }
  
  .glass-strong {
    background: hsl(var(--card) / 0.95);
    backdrop-filter: blur(16px);
    border: 1px solid hsl(var(--border) / 0.3);
  }
  
  .btn-primary {
    background: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    border: 1px solid hsl(var(--primary));
    box-shadow: var(--shadow-brand);
  }
  
  .btn-primary:hover {
    background: hsl(var(--primary-hover));
    border-color: hsl(var(--primary-hover));
    box-shadow: var(--shadow-brand-lg);
    transform: translateY(-1px);
  }
  
  .btn-gradient {
    background: var(--gradient-primary);
    color: hsl(var(--primary-foreground));
    border: none;
    box-shadow: var(--shadow-brand);
  }
  
  .btn-gradient:hover {
    background: var(--gradient-primary-hover);
    box-shadow: var(--shadow-brand-lg);
    transform: translateY(-1px);
  }
  
  .card-brand {
    background: hsl(var(--card));
    border: 1px solid hsl(var(--card-border));
    box-shadow: var(--shadow);
  }
  
  .card-brand:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }
  
  .focus-brand:focus {
    outline: 2px solid hsl(var(--ring));
    outline-offset: 2px;
  }
  
  .transition-brand {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .transition-brand-slow {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

