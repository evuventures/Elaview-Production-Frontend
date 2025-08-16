// src/components/onboarding/IntroModal.jsx
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
  ArrowRight,
  X,
  Store,
  BarChart3
} from 'lucide-react';
import apiClient from '@/api/apiClient';

const IntroModal = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState(null);
  const navigate = useNavigate();
  const { user } = useUser();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setSelectedUserType(null);
      setIsCompleting(false);
    }
  }, [isOpen]);

  const steps = [
    {
      id: 'welcome',
      title: `Welcome to Elaview, ${user?.firstName || 'there'}!`,
      description: 'Your B2B marketplace for advertising spaces and campaigns',
      icon: Users,
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Users className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Connect Advertisers with Space Owners
            </h3>
            <p className="text-slate-600 max-w-sm mx-auto text-sm">
              Elaview is your one-stop platform for discovering advertising spaces, 
              running campaigns, and managing business relationships.
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
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <MapPin className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Interactive Space Discovery
            </h3>
            <p className="text-slate-600 max-w-sm mx-auto text-sm">
              Use our powerful map interface to find the perfect advertising spaces 
              for your campaigns. Filter by location, price, space type, and more.
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Available
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                Booked
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
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
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <MessageSquare className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Real-time Business Communication
            </h3>
            <p className="text-slate-600 max-w-sm mx-auto text-sm">
              Built-in messaging system with support for RFQs, contracts, 
              file sharing, and project collaboration.
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto text-xs">
              <div className="bg-slate-50 p-2 rounded-lg">
                <strong className="text-slate-700">RFQ System</strong>
                <p className="text-slate-500">Request quotes</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <strong className="text-slate-700">File Sharing</strong>
                <p className="text-slate-500">Share contracts</p>
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
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Target className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">
              End-to-End Campaign Management
            </h3>
            <p className="text-slate-600 max-w-sm mx-auto text-sm">
              From creative upload to installation tracking, manage your entire 
              campaign lifecycle with real-time updates.
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs">
              <div className="text-center">
                <Camera className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                <span className="text-slate-600">Upload</span>
              </div>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <div className="text-center">
                <TrendingUp className="w-5 h-5 mx-auto text-green-500 mb-1" />
                <span className="text-slate-600">Track</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'user-type',
      title: 'How would you like to get started?',
      description: 'Choose your primary use case to customize your experience',
      icon: CheckCircle,
      content: (
        <div className="space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 text-center">
              What brings you to Elaview?
            </h3>
            <div className="grid gap-3 max-w-sm mx-auto">
              <button
                onClick={() => setSelectedUserType('advertiser')}
                className={`p-4 border-2 rounded-lg transition-all text-left ${
                  selectedUserType === 'advertiser'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">I want to advertise</h4>
                    <p className="text-xs text-slate-600">Find spaces for my campaigns</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setSelectedUserType('property-owner')}
                className={`p-4 border-2 rounded-lg transition-all text-left ${
                  selectedUserType === 'property-owner'
                    ? 'border-green-500 bg-green-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Store className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">I have space to rent</h4>
                    <p className="text-xs text-slate-600">List my property for advertisers</p>
                  </div>
                </div>
              </button>
            </div>
            
            {selectedUserType && (
              <div className="bg-blue-50 p-3 rounded-lg max-w-sm mx-auto">
                <p className="text-xs text-blue-700">
                  <strong>Don't worry!</strong> You can always switch between advertiser 
                  and property owner modes later from your dashboard.
                </p>
              </div>
            )}
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
    if (currentStep === steps.length - 1 && !selectedUserType) {
      // If on the last step but no user type selected, don't proceed
      return;
    }

    try {
      setIsCompleting(true);
      console.log('🎯 Completing intro tutorial with user type:', selectedUserType);

      // Call API to mark intro as completed
      const response = await apiClient.completeIntroTutorial();
      
      if (response.success) {
        console.log('✅ Intro completed successfully');
        
        // Call onComplete callback
        if (onComplete) {
          onComplete(selectedUserType);
        }
        
        // Small delay for UX, then route based on user type
        setTimeout(() => {
          if (selectedUserType === 'property-owner') {
            navigate('/list-space', { replace: true });
          } else {
            // Default to browse (advertiser or no selection)
            onClose();
          }
        }, 500);
      } else {
        console.error('❌ Failed to complete intro:', response.error);
        // Still close modal to avoid blocking user
        onClose();
      }
    } catch (error) {
      console.error('❌ Error completing intro:', error);
      // Still close modal to avoid blocking user
      onClose();
    }
  };

  // Animation variants
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
  const canProceed = !isLastStep || selectedUserType !== null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold pr-8">{currentStepData.title}</h1>
          <p className="text-blue-100 mt-1 text-sm">{currentStepData.description}</p>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-slate-50">
          <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              variants={progressVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8 min-h-[300px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {currentStepData.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between">
            {/* Previous Button */}
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center px-3 py-2 rounded-lg transition-all text-sm ${
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
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
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
            <div className="flex space-x-2">
              {!isLastStep && (
                <button
                  onClick={handleSkip}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 transition-colors text-sm"
                >
                  Skip
                </button>
              )}
              
              <button
                onClick={handleNext}
                disabled={isCompleting || !canProceed}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  isLastStep
                    ? canProceed
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                } ${isCompleting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isCompleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Setting up...
                  </>
                ) : isLastStep ? (
                  selectedUserType === 'property-owner' ? (
                    <>
                      Create First Listing
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Start Browsing
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )
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
    </div>
  );
};

export default IntroModal;