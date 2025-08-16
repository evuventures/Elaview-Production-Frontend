// src/pages/onboarding/IntroPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  MessageSquare, 
  Camera, 
  Target,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import apiClient from '@/api/apiClient';

const IntroPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  // ✅ Development bypass check
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const skipIntro = urlParams.get('skip_intro') === 'true' || 
                     import.meta.env.VITE_SKIP_INTRO === 'true';
    
    if (skipIntro) {
      console.log('🚀 Development bypass: Skipping intro');
      handleCompleteIntro();
    }
  }, []);

  const steps = [
    {
      id: 'welcome',
      title: `Welcome to Elaview, ${user?.firstName || 'there'}!`,
      description: 'Your B2B marketplace for advertising spaces and campaigns',
      icon: Users,
      content: (
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Users className="w-16 h-16 text-white" />
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-800">
              Connect Advertisers with Space Owners
            </h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Elaview is your one-stop platform for discovering advertising spaces, 
              running campaigns, and managing business relationships in the advertising industry.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'browse',
      title: 'Discover Advertising Spaces',
      description: 'Browse and filter available spaces on our interactive map',
      icon: MapPin,
      content: (
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <MapPin className="w-16 h-16 text-white" />
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-800">
              Interactive Space Discovery
            </h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Use our powerful map interface to find the perfect advertising spaces 
              for your campaigns. Filter by location, price, space type, and more.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Available
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Booked
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                Pending
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'messaging',
      title: 'Connect & Communicate',
      description: 'Message space owners and collaborate on campaigns',
      icon: MessageSquare,
      content: (
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <MessageSquare className="w-16 h-16 text-white" />
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-800">
              Real-time Business Communication
            </h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Built-in messaging system with support for RFQs, contracts, 
              file sharing, and project collaboration. Keep all your business 
              communications organized and professional.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-sm">
              <div className="bg-slate-50 p-3 rounded-lg">
                <strong className="text-slate-700">RFQ System</strong>
                <p className="text-slate-500">Request quotes</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <strong className="text-slate-700">File Sharing</strong>
                <p className="text-slate-500">Share contracts & assets</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'campaigns',
      title: 'Manage Your Campaigns',
      description: 'Create, track, and optimize your advertising campaigns',
      icon: Target,
      content: (
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Target className="w-16 h-16 text-white" />
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-800">
              End-to-End Campaign Management
            </h3>
            <p className="text-slate-600 max-w-md mx-auto">
              From creative upload to installation tracking, manage your entire 
              campaign lifecycle. Get real-time updates on material orders, 
              installation progress, and campaign performance.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="text-center">
                <Camera className="w-6 h-6 mx-auto text-blue-500 mb-1" />
                <span className="text-slate-600">Creative Upload</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <div className="text-center">
                <TrendingUp className="w-6 h-6 mx-auto text-green-500 mb-1" />
                <span className="text-slate-600">Track Progress</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ready',
      title: "You're All Set!",
      description: 'Ready to start your Elaview journey',
      icon: CheckCircle,
      content: (
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-800">
              Ready to Get Started!
            </h3>
            <p className="text-slate-600 max-w-md mx-auto">
              You now know the basics of Elaview. Click "Get Started" to explore 
              available advertising spaces and begin building your campaigns.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg max-w-sm mx-auto">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> You can always access help and tutorials 
                from the main navigation menu.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteIntro();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setCurrentStep(steps.length - 1);
  };

  const handleCompleteIntro = async () => {
    try {
      setIsCompleting(true);
      console.log('🎯 Completing intro tutorial...');

      // Call API to mark intro as completed
      const response = await apiClient.completeIntroTutorial();
      
      if (response.success) {
        console.log('✅ Intro completed successfully');
        
        // Small delay for UX
        setTimeout(() => {
          navigate('/browse', { replace: true });
        }, 500);
      } else {
        console.error('❌ Failed to complete intro:', response.error);
        // Still navigate to avoid blocking user
        navigate('/browse', { replace: true });
      }
    } catch (error) {
      console.error('❌ Error completing intro:', error);
      // Still navigate to avoid blocking user
      navigate('/browse', { replace: true });
    }
  };

  // ✅ Animation variants
  const stepVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  const progressVariants = {
    initial: { width: 0 },
    animate: { width: `${((currentStep + 1) / steps.length) * 100}%` }
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      {/* ✅ Development Reset Button (only in dev) */}
      {import.meta.env.DEV && (
        <button
          onClick={() => {
            localStorage.setItem('dev_reset_intro', 'true');
            window.location.reload();
          }}
          className="fixed top-4 right-4 z-50 px-3 py-1 bg-red-500 text-white text-xs rounded opacity-50 hover:opacity-100"
        >
          DEV: Reset
        </button>
      )}

      <div className="w-full max-w-4xl mx-auto">
        {/* ✅ Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-slate-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              variants={progressVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* ✅ Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
            <h1 className="text-2xl font-bold">{currentStepData.title}</h1>
            <p className="text-blue-100 mt-2">{currentStepData.description}</p>
          </div>

          {/* Content */}
          <div className="px-8 py-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {currentStepData.content}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center justify-between">
              {/* Previous Button */}
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                  currentStep === 0
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              {/* Step Indicators */}
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentStep
                        ? 'bg-blue-500'
                        : index < currentStep
                        ? 'bg-green-500'
                        : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>

              {/* Next/Complete Button */}
              <div className="flex space-x-3">
                {!isLastStep && (
                  <button
                    onClick={handleSkip}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Skip Tutorial
                  </button>
                )}
                
                <button
                  onClick={handleNext}
                  disabled={isCompleting}
                  className={`flex items-center px-6 py-2 rounded-lg font-medium transition-all ${
                    isLastStep
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                  } ${isCompleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isCompleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Setting up...
                    </>
                  ) : isLastStep ? (
                    <>
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            Need help? Visit our{' '}
            <button
              onClick={() => navigate('/help')}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Help Center
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntroPage;