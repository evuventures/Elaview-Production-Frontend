import React from 'react';

interface FormStep {
 id: number;
 title: string;
 description: string;
 isComplete: boolean;
 isActive: boolean;
}

interface ProgressStepsProps {
 steps: FormStep[];
 currentStep: number;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps, currentStep }) => {
 return (
 <div className="w-full">
 <div className="flex items-center justify-between mb-4">
 {steps.map((step, index) => (
 <div key={step.id} className="flex items-center flex-1">
 {/* Step Circle */}
 <div className="flex items-center">
 <div
 className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
 step.isActive
 ? 'bg-primary text-primary-foreground'
 : step.isComplete
 ? 'bg-green-500 text-white'
 : 'bg-muted text-muted-foreground border-2 border-border'
 }`}
>
 {step.isComplete ? (
 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
 <path
 fillRule="evenodd"
 d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
 clipRule="evenodd"
 />
 </svg>
 ) : (
 step.id
 )}
 </div>
 
 {/* Step Text */}
 <div className="ml-3 min-w-0">
 <div
 className={`text-sm font-medium ${
 step.isActive ? 'text-primary' : 'text-foreground'
 }`}
>
 {step.title}
 </div>
 <div className="text-xs text-muted-foreground">
 {step.description}
 </div>
 </div>
 </div>

 {/* Connector Line */}
 {index < steps.length - 1 && (
 <div className="flex-1 mx-4">
 <div
 className={`h-0.5 w-full ${
 step.isComplete ? 'bg-green-500' : 'bg-border'
 }`}
 />
 </div>
 )}
 </div>
 ))}
 </div>

 {/* Progress Bar */}
 <div className="w-full bg-muted rounded-full h-2">
 <div
 className="bg-primary h-2 rounded-full transition-all duration-300"
 style={{ width: `${(currentStep / steps.length) * 100}%` }}
 />
 </div>
 </div>
 );
};

export default ProgressSteps;