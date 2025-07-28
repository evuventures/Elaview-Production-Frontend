import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingState() {
  const loadingMessages = [
    "Finding the perfect advertising spaces...",
    "Analyzing location data...",
    "Calculating ROI potential...",
    "Matching your requirements..."
  ];

  const [currentMessage, setCurrentMessage] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-64 py-12">
      <div className="text-center">
        {/* Enhanced Loading Animation */}
        <div className="relative mb-6">
          <div className="loading-spinner w-8 h-8 text-teal-500 mx-auto"></div>
          
          {/* Pulse rings around spinner */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border border-teal-200 rounded-full animate-ping opacity-20"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border border-teal-100 rounded-full animate-ping opacity-10" style={{ animationDelay: '0.5s' }}></div>
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

        {/* Progress Dots */}
        <div className="flex justify-center gap-1 mt-4">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-teal-300 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
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