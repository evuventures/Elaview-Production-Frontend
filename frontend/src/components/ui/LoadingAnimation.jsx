import React from 'react';
import { cn } from '@/lib/utils';

// Enhanced loading configuration aligned with your design system
const LOADING_CONFIG = {
  // Colors aligned with your CSS variables
  colors: {
    primary: '#4668AB',      // Your brand blue (--color-primary)
    slate: '#1e293b',        // slate-800 (--color-slate-800)
    light: '#64748b',        // slate-500 (--color-slate-500)
    muted: '#94a3b8',        // slate-400 (--color-slate-400)
    white: '#ffffff',
    charcoal: '#0f172a',     // Your deep charcoal (--color-charcoal)
    charcoalLight: '#1e293b' // Your charcoal-light (--color-charcoal-light)
  },
  
  // Animation speeds (in seconds)
  speeds: {
    fast: 0.6,
    normal: 1.2,
    slow: 1.8
  },
  
  // Size presets for dots
  sizes: {
    xs: 4,
    sm: 6, 
    md: 8,
    lg: 12,
    xl: 16
  }
};

/**
 * Enhanced Three Bouncing Dots Loading Animation
 * Now fully aligned with your design system
 */
export const LoadingAnimation = ({
  size = 'md',
  color = 'primary', // Changed default to primary brand color
  speed = 'normal',
  message = '',
  showMessage = false,
  centered = false,
  className = ''
}) => {
  const dotSize = LOADING_CONFIG.sizes[size] || LOADING_CONFIG.sizes.md;
  const colorValue = LOADING_CONFIG.colors[color] || LOADING_CONFIG.colors.primary;
  const duration = LOADING_CONFIG.speeds[speed] || LOADING_CONFIG.speeds.normal;

  const DotsAnimation = () => (
    <div 
      className={cn("flex items-center", className)}
      style={{ gap: `${dotSize * 0.5}px` }}
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="rounded-full animate-bounce"
          style={{
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            backgroundColor: colorValue,
            animationDuration: `${duration}s`,
            animationDelay: `${index * 0.15}s`,
            animationIterationCount: 'infinite'
          }}
        />
      ))}
    </div>
  );

  const content = (
    <div className={cn(
      "inline-flex flex-col items-center justify-center gap-3",
      centered && "mx-auto"
    )}>
      <DotsAnimation />
      {showMessage && message && (
        <div 
          className="text-sm font-medium text-shadow-soft"
          style={{ color: colorValue }}
        >
          {message}
        </div>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[100px]">
        {content}
      </div>
    );
  }

  return content;
};

/**
 * Enhanced Page Loader - Full viewport centering with glassmorphism
 */
export const PageLoader = ({ 
  message = "Loading...", 
  fullscreen = false,
  centered = false // Keep for backward compatibility
}) => {
  if (fullscreen || centered) {
    // Full viewport overlay with glassmorphism
    return (
      <div className="fixed inset-0 flex items-center justify-center glass-primary backdrop-blur-lg z-50">
        <div className="text-center">
          <LoadingAnimation
            size="lg"
            color="primary"
            speed="normal"
            message={message}
            showMessage={true}
            className="mb-4"
          />
        </div>
      </div>
    );
  }
  
  // Inline loading for content areas
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingAnimation
        size="lg"
        color="primary"
        speed="normal"
        message={message}
        showMessage={true}
      />
    </div>
  );
};

/**
 * Enhanced Button Loader - Consistent sizing and colors
 */
export const ButtonLoader = ({ 
  size = "sm", 
  color = "white",
  className = ""
}) => (
  <LoadingAnimation
    size={size}
    color={color}
    speed="fast"
    showMessage={false}
    className={cn("inline-flex", className)}
  />
);

/**
 * Enhanced Inline Loader - Better spacing and typography
 */
export const InlineLoader = ({ 
  message = "", 
  size = "sm",
  color = "primary",
  className = ""
}) => (
  <div className={cn("inline-flex items-center gap-2", className)}>
    <LoadingAnimation
      size={size}
      color={color}
      speed="normal"
      showMessage={false}
    />
    {message && (
      <span className="text-sm font-medium" style={{ color: LOADING_CONFIG.colors[color] }}>
        {message}
      </span>
    )}
  </div>
);

/**
 * Enhanced Card Loader - Uses your glassmorphism design
 */
export const CardLoader = ({ className = "" }) => (
  <div className={cn("card-glass space-y-3 p-6 animate-pulse", className)}>
    <div className="h-4 bg-slate-300/50 rounded-lg w-3/4" />
    <div className="h-3 bg-slate-300/50 rounded-lg w-1/2" />
    <div className="h-3 bg-slate-300/50 rounded-lg w-2/3" />
    <div className="flex gap-2 mt-4">
      <div className="h-8 bg-slate-300/50 rounded-lg w-20" />
      <div className="h-8 bg-slate-300/50 rounded-lg w-16" />
    </div>
  </div>
);

/**
 * Enhanced Skeleton Loader - Better glassmorphism integration
 */
export const SkeletonLoader = ({ 
  lines = 3, 
  className = "",
  variant = "default" // "default", "glass", "card"
}) => {
  const baseClasses = "space-y-3 animate-pulse";
  const variantClasses = {
    default: "",
    glass: "glass-secondary p-4 rounded-lg",
    card: "card-glass p-6"
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-300/60 rounded-lg animate-pulse"
          style={{ 
            width: `${100 - (i * 12)}%`,
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};

/**
 * Enhanced Minimal Spinner - Aligned with your brand colors
 */
export const MinimalSpinner = ({ 
  size = "md", 
  color = "primary",
  className = ""
}) => {
  const dimension = LOADING_CONFIG.sizes[size] * 3;
  const colorValue = LOADING_CONFIG.colors[color];
  
  return (
    <div
      className={cn("loading-spinner-glass", className)}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        borderColor: `${colorValue}20`, // 20% opacity for border
        borderTopColor: colorValue,
        animationDuration: '0.8s'
      }}
    />
  );
};

/**
 * Enhanced Pulsing Circle - Brand color integration
 */
export const PulsingCircle = ({ 
  size = "md", 
  color = "primary",
  className = ""
}) => {
  const dimension = LOADING_CONFIG.sizes[size] * 2.5;
  const colorValue = LOADING_CONFIG.colors[color];
  
  return (
    <div
      className={cn("rounded-full animate-pulse", className)}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        backgroundColor: `${colorValue}40`, // 40% opacity
        animationDuration: '1.5s',
        boxShadow: `0 0 0 0 ${colorValue}60`
      }}
    />
  );
};

/**
 * NEW: Property Loader - Specialized for property listings
 */
export const PropertyLoader = ({ className = "" }) => (
  <div className={cn("property-listing animate-pulse", className)}>
    <div className="w-full h-48 bg-slate-300/50 rounded-t-xl" />
    <div className="p-6 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-slate-300/50 rounded-lg w-3/4" />
          <div className="h-4 bg-slate-300/50 rounded-lg w-1/2" />
        </div>
        <div className="h-6 bg-slate-300/50 rounded-full w-16" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 bg-slate-300/50 rounded-lg w-24" />
        <div className="h-8 bg-slate-300/50 rounded-lg w-20" />
      </div>
    </div>
  </div>
);

/**
 * NEW: Glass Loader - Full glassmorphism effect
 */
export const GlassLoader = ({
  message = "Loading...",
  size = "lg",
  className = ""
}) => (
  <div className={cn("glass-primary p-8 rounded-2xl text-center glass-shimmer", className)}>
    <LoadingAnimation
      size={size}
      color="primary"
      speed="normal"
      message={message}
      showMessage={true}
    />
  </div>
);

/**
 * NEW: Overlay Loader - For modal/overlay loading states
 */
export const OverlayLoader = ({
  message = "Loading...",
  blur = true,
  className = ""
}) => (
  <div className={cn(
    "fixed inset-0 flex items-center justify-center z-50",
    blur ? "backdrop-blur-sm" : "",
    className
  )}>
    <div className="glass-primary p-8 rounded-2xl text-center shadow-2xl">
      <LoadingAnimation
        size="xl"
        color="primary"
        speed="normal"
        message={message}
        showMessage={true}
      />
    </div>
  </div>
);

// Export configuration for external use
export { LOADING_CONFIG };

// Default export
export default LoadingAnimation;