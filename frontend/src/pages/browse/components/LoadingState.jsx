// src/pages/browse/components/LoadingState.jsx
// ✅ UPDATED: Now uses VideoLoader component
import React from 'react';
import { motion } from 'framer-motion';
import { LoadingAnimation } from '@/components/ui/LoadingAnimation';

export default function LoadingState() {
  const loadingMessages = [
    "Finding the perfect advertising spaces...",
    "Analyzing location data...",
    "Calculating ROI potential...",
    "Matching your requirements..."
  ];

  const [currentMessage, setCurrentMessage] = React.useState(0);

  React.useEffect(() => {
    console.log('🔄 Browse LoadingState: Component mounted');
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => {
      console.log('🔄 Browse LoadingState: Component unmounted');
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-64 py-12">
      <div className="text-center">
        {/* ✅ REPLACED: Enhanced Loading Animation with VideoLoader */}
        <div className="relative mb-6">
          <LoadingAnimation 
            size="lg"
            variant="spinner"
            color="primary"
            centered={false}
            className="mx-auto"
          />
          
          {/* Pulse rings around loader with updated colors */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-16 h-16 rounded-full animate-ping opacity-20"
              style={{ border: '1px solid #4668AB' }}
            ></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-20 h-20 rounded-full animate-ping opacity-10"
              style={{ 
                border: '1px solid #4668AB',
                animationDelay: '0.5s'
              }}
            ></div>
          </div>
        </div>

        {/* Animated Loading Message */}
        <motion.div
          key={currentMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <p className="body-medium text-slate-600">{loadingMessages[currentMessage]}</p>
          <p className="caption text-slate-500">This should only take a moment</p>
        </motion.div>

        {/* Progress Dots with updated colors */}
        <div className="flex justify-center gap-1 mt-4">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#4668AB', opacity: 0.3 }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}