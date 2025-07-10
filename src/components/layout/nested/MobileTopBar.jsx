// src/components/layout/MobileTopBar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';

const MobileTopBar = () => {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 glass-strong border-b border-border z-30 shadow-md">
      <div className="flex items-center justify-between h-16 px-4">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center shadow-brand">
            <Crown className="text-white w-4 h-4" />
          </div>
          <h2 className="font-bold text-xl text-gradient-brand">
            Elaview
          </h2>
        </Link>
      </div>
    </div>
  );
};

export default MobileTopBar;