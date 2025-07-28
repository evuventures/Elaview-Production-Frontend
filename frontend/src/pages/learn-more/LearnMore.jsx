// src/pages/learn-more/LearnMore.jsx
import React from 'react';
import { ArrowLeft, Sparkles, Building2, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import elaviewLogo from '../../public/elaview-logo.png';

export default function LearnMore() {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#f7f5e6' }}
    >
      <div className="w-full max-w-2xl text-center">
        
        {/* Logo */}
        <div className="mb-8">
          <img 
            src={elaviewLogo} 
            alt="Elaview Logo" 
            className="h-20 w-auto mx-auto mb-6"
          />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 mb-8">
          
          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Coming Soon
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl font-light text-slate-900 leading-tight mb-6">
            Learn more about
            <span className="text-6xl block font-medium text-slate-800">Elaview</span>
          </h1>

          {/* Description */}
          <p className="text-xl text-slate-600 font-light mb-8 leading-relaxed">
            We're crafting something special to help you understand how Elaview 
            can elevate your business to the next level. Stay tuned for detailed 
            guides, success stories, and everything you need to get started.
          </p>

          {/* Feature Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="font-medium text-slate-800 mb-1">How It Works</h3>
              <p className="text-sm text-slate-600">Step-by-step guides</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="font-medium text-slate-800 mb-1">Success Stories</h3>
              <p className="text-sm text-slate-600">Real business results</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="font-medium text-slate-800 mb-1">Getting Started</h3>
              <p className="text-sm text-slate-600">Quick start tutorials</p>
            </div>
          </div>

          {/* CTA */}
          <p className="text-base text-slate-600 mb-6">
            Ready to get started? You can already sign up and begin exploring spaces.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/sign-up')}
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-8 rounded-xl transition-all duration-200 shadow-sm"
            >
              Get Started Now
            </button>
            
            <button
              onClick={() => navigate('/browse')}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-medium py-3 px-8 rounded-xl transition-all duration-200 shadow-sm"
            >
              Browse Spaces
            </button>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Questions? Contact us at{' '}
            <a 
              href="mailto:hello@elaview.com" 
              className="text-slate-700 hover:text-slate-900 font-medium"
            >
              hello@elaview.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}