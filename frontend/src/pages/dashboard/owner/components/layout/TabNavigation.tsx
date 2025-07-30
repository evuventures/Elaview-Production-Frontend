// src/pages/dashboard/components/layout/TabNavigation.tsx
import React from 'react';
import type { TabItem } from '../../types';

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange 
}) => {
  return (
    <div className="border-b border-gray-700/50 px-6 py-4">
      <div className="flex space-x-2 md:space-x-4 overflow-x-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 pb-2 px-2 text-sm font-semibold border-b-2 transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-lime-400 text-lime-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};