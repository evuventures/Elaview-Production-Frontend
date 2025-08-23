import React from 'react';
import { cn } from '@/lib/utils';

// Minimal loading configuration
const LOADING_CONFIG = {
  // Colors - focused on slate palette for minimal design
  colors: {
    slate: '#1e293b',    // slate-800 - primary minimal color
    light: '#64748b',    // slate-500 - lighter variant
    muted: '#94a3b8',    // slate-400 - most subtle
    white: '#ffffff'
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
 * Minimal Three Bouncing Dots Loading Animation
 * 
 * @param {Object} props
 * @param {string} props.size - Dot size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} props.color - Color theme: 'slate' | 'light' | 'muted' | 'white'
 * @param {string} props.speed - Animation speed: 'fast' | 'normal' | 'slow'
 * @param {string} props.message - Optional loading message
 * @param {boolean} props.showMessage - Whether to show the message
 * @param {boolean} props.centered - Center the loader in its container
 * @param {string} props.className - Additional CSS classes
 */
export const LoadingAnimation = ({
  size = 'md',
  color = 'slate',
  speed = 'normal',
  message = '',
  showMessage = false,
  centered = false,
  className = ''
}) => {
  const dotSize = LOADING_CONFIG.sizes[size] || LOADING_CONFIG.sizes.md;
  const colorValue = LOADING_CONFIG.colors[color] || LOADING_CONFIG.colors.slate;
  const duration = LOADING_CONFIG.speeds[speed] || LOADING_CONFIG.speeds.normal;

  const DotsAnimation = () => (
    <div 
      className={cn("flex items-center space-x-1", className)}
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
          className="text-sm font-medium"
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

// Preset loading states for common use cases
export const PageLoader = ({ message = "Loading..." }) => (
  <LoadingAnimation
    size="lg"
    color="slate"
    speed="normal"
    message={message}
    showMessage={true}
    centered
    className="py-12"
  />
);

export const ButtonLoader = ({ size = "sm", color = "white" }) => (
  <LoadingAnimation
    size={size}
    color={color}
    speed="fast"
    showMessage={false}
  />
);

export const InlineLoader = ({ message = "", size = "sm" }) => (
  <LoadingAnimation
    size={size}
    color="slate"
    speed="normal"
    message={message}
    showMessage={!!message}
  />
);

export const CardLoader = () => (
  <div className="space-y-3 p-4 animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-3/4" />
    <div className="h-3 bg-slate-200 rounded w-1/2" />
    <div className="h-3 bg-slate-200 rounded w-2/3" />
  </div>
);

export const SkeletonLoader = ({ lines = 3, className = "" }) => (
  <div className={cn("space-y-2 animate-pulse", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-3 bg-slate-200 rounded"
        style={{ width: `${100 - (i * 15)}%` }}
      />
    ))}
  </div>
);

// Alternative minimal loading animations
export const MinimalSpinner = ({ size = "md", color = "slate" }) => {
  const dimension = LOADING_CONFIG.sizes[size] * 3;
  const colorValue = LOADING_CONFIG.colors[color];
  
  return (
    <div
      className="animate-spin rounded-full border-2 border-t-transparent"
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

export const PulsingCircle = ({ size = "md", color = "slate" }) => {
  const dimension = LOADING_CONFIG.sizes[size] * 2;
  const colorValue = LOADING_CONFIG.colors[color];
  
  return (
    <div
      className="rounded-full animate-pulse"
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        backgroundColor: colorValue,
        animationDuration: '1.5s'
      }}
    />
  );
};

// Export configuration
export { LOADING_CONFIG };

// Default export
export default LoadingAnimation;