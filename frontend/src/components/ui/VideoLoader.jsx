// src/components/ui/VideoLoader.jsx
// ✅ TEMPORARY FIX: Only imports the .mov file that exists
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// Import all video formats for browser compatibility
import ElaviewAnimationMP4 from '@/assets/animations/ElaviewLoadingAnimation.mp4';
import ElaviewAnimationWebM from '@/assets/animations/ElaviewLoadingAnimation.webm';
import ElaviewAnimationMOV from '@/assets/animations/ElaviewLoadingAnimation.mov';

const VideoLoader = ({
  size = 'md',
  message,
  showMessage = false,
  className = '',
  centered = true,
  theme = 'brand',
  lazy = false,
  containerClassName = '',
  autoPlay = true
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [shouldShowFallback, setShouldShowFallback] = useState(false);
  const videoRef = useRef(null);
  const fallbackTimeoutRef = useRef(null);

  // ✅ CONSOLE LOG: Component initialization
  useEffect(() => {
    console.log(`🎬 VideoLoader initialized - Size: ${size}, Theme: ${theme}, Message: ${message || 'none'}`);
    console.log('🎬 VideoLoader: Using video formats - WebM, MP4, MOV');
    
    // Set fallback timeout in case video takes too long
    fallbackTimeoutRef.current = setTimeout(() => {
      if (!isVideoLoaded) {
        console.log('⚠️ VideoLoader: Falling back to spinner after timeout');
        setShouldShowFallback(true);
      }
    }, 2000); // 2 second timeout

    return () => {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
      }
    };
  }, [size, theme, message, isVideoLoaded]);

  // ✅ CONSOLE LOG: Video loading events
  const handleVideoLoad = () => {
    console.log('✅ VideoLoader: Video loaded successfully');
    setIsVideoLoaded(true);
    setVideoError(false);
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
    }
  };

  const handleVideoError = (e) => {
    console.error('❌ VideoLoader: Video failed to load', e);
    setVideoError(true);
    setShouldShowFallback(true);
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
    }
  };

  // Size mappings based on your current implementations
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // Theme colors for fallback spinner
  const themeColors = {
    brand: 'border-[#4668AB]',
    teal: 'border-teal-500',
    blue: 'border-blue-500',
    white: 'border-white',
    gray: 'border-gray-500'
  };

  // ✅ FALLBACK SPINNER: Matches your current CSS implementation
  const FallbackSpinner = () => (
    <div
      className={`
        ${sizeClasses[size]}
        border-2 border-t-transparent rounded-full animate-spin
        ${themeColors[theme]}
        ${className}
      `}
      style={{
        borderTopColor: 'transparent'
      }}
    />
  );

  // ✅ VIDEO COMPONENT: Your new 3-second animation (all optimized formats)
  const VideoComponent = () => (
    <motion.video
      ref={videoRef}
      className={`${sizeClasses[size]} ${className}`}
      autoPlay={autoPlay}
      loop
      muted
      playsInline
      preload={lazy ? 'none' : 'auto'}
      onLoadedData={handleVideoLoad}
      onError={handleVideoError}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Multiple source formats for browser compatibility */}
      <source src={ElaviewAnimationWebM} type="video/webm" />
      <source src={ElaviewAnimationMP4} type="video/mp4" />
      <source src={ElaviewAnimationMOV} type="video/quicktime" />
      {/* Fallback message for unsupported browsers */}
      Your browser does not support the video tag.
    </motion.video>
  );

  // ✅ CONTAINER COMPONENT
  const LoaderContainer = ({ children }) => (
    <div
      className={`
        ${centered ? 'flex items-center justify-center' : ''}
        ${containerClassName}
      `}
    >
      <div className={centered ? 'text-center' : ''}>
        {children}
        {showMessage && message && (
          <motion.p
            className="mt-2 text-sm text-slate-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {message}
          </motion.p>
        )}
      </div>
    </div>
  );

  // ✅ RENDER LOGIC: Video with fallback
  return (
    <LoaderContainer>
      {(videoError || shouldShowFallback) ? (
        <FallbackSpinner />
      ) : (
        <VideoComponent />
      )}
    </LoaderContainer>
  );
};

export default VideoLoader;