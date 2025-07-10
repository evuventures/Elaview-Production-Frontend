import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Activity, Zap } from 'lucide-react';
import AnalyticsModal from './AnalyticsModal';

const AnalyticsButton = ({ 
  space, 
  variant = "outline", 
  size = "sm", 
  className = "",
  children,
  showIcon = true,
  fullWidth = false,
  style = "default" // "default", "premium", "gradient", "minimal"
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!space) return null;

  // Style variations for different use cases
  const getButtonStyles = () => {
    const baseClasses = `${fullWidth ? 'w-full' : ''} transition-brand font-medium`;
    
    switch (style) {
      case "premium":
        return `${baseClasses} btn-gradient rounded-2xl shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] hover:-translate-y-0.5 ${className}`;
      
      case "gradient":
        return `${baseClasses} bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:from-[hsl(var(--primary-hover))] hover:to-[hsl(var(--accent))]/90 text-white border-0 rounded-2xl shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] hover:-translate-y-0.5 ${className}`;
      
      case "minimal":
        return `${baseClasses} glass hover:bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--primary))] rounded-2xl hover:shadow-[var(--shadow-brand)] ${className}`;
      
      default:
        return `${baseClasses} glass hover:bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--primary))] rounded-2xl hover:shadow-[var(--shadow-brand)] ${className}`;
    }
  };

  // Icon variations based on style
  const getIcon = () => {
    if (!showIcon) return null;
    
    const iconClass = "w-4 h-4 mr-2";
    
    switch (style) {
      case "premium":
        return <Zap className={iconClass} />;
      case "gradient":
        return <TrendingUp className={iconClass} />;
      case "minimal":
        return <Activity className={iconClass} />;
      default:
        return <BarChart3 className={iconClass} />;
    }
  };

  // Default button content with style-aware text
  const getDefaultContent = () => {
    switch (style) {
      case "premium":
        return (
          <>
            {getIcon()}
            Advanced Analytics
          </>
        );
      case "gradient":
        return (
          <>
            {getIcon()}
            Performance Insights
          </>
        );
      case "minimal":
        return (
          <>
            {getIcon()}
            Analytics
          </>
        );
      default:
        return (
          <>
            {getIcon()}
            View Analytics
          </>
        );
    }
  };

  const buttonContent = children || getDefaultContent();

  return (
    <>
      <Button
        variant={style === "premium" || style === "gradient" ? "default" : variant}
        size={size}
        className={getButtonStyles()}
        onClick={() => setIsModalOpen(true)}
      >
        {buttonContent}
      </Button>
      
      <AnalyticsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        space={space}
      />
    </>
  );
};

// Preset button components for common use cases
export const PremiumAnalyticsButton = (props) => (
  <AnalyticsButton {...props} style="premium" />
);

export const GradientAnalyticsButton = (props) => (
  <AnalyticsButton {...props} style="gradient" />
);

export const MinimalAnalyticsButton = (props) => (
  <AnalyticsButton {...props} style="minimal" />
);

// Usage examples as named exports
export const QuickAnalyticsButton = ({ space, className = "" }) => (
  <AnalyticsButton 
    space={space} 
    style="minimal" 
    size="sm"
    className={className}
  />
);

export const FeatureAnalyticsButton = ({ space, className = "" }) => (
  <AnalyticsButton 
    space={space} 
    style="premium" 
    size="default"
    fullWidth={false}
    className={className}
  />
);

export const FullWidthAnalyticsButton = ({ space, className = "" }) => (
  <AnalyticsButton 
    space={space} 
    style="gradient" 
    size="default"
    fullWidth={true}
    className={className}
  />
);

export default AnalyticsButton;