import React from 'react';

interface SavedDataAlertProps {
  onRestore?: () => void;
  onDiscard: () => void;
}

const SavedDataAlert: React.FC<SavedDataAlertProps> = ({ onRestore, onDiscard }) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            Draft Found
          </h3>
          <p className="mt-1 text-sm text-blue-700">
            We found a saved draft of your property listing. Would you like to continue where you left off?
          </p>
          <div className="mt-3 flex space-x-3">
            {onRestore && (
              <button
                type="button"
                onClick={onRestore}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Continue Draft
              </button>
            )}
            <button
              type="button"
              onClick={onDiscard}
              className="bg-white text-blue-600 border border-blue-300 px-3 py-1 rounded text-sm hover:bg-blue-50 transition-colors"
            >
              Start Fresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedDataAlert;