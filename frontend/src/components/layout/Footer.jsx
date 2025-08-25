// src/components/layout/Footer.jsx
// ✅ REUSABLE: Standalone footer component that can be imported anywhere
// ✅ STYLED: Matches the provided footer design with proper sections
// ✅ RESPONSIVE: Works well on both desktop and mobile devices

import React from 'react';
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* ✅ Company section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Elaview</h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
              Turn your unused billboard space into a revenue stream. Our platform lets you 
              list, manage, and rent your billboard sign effortlessly
            </p>
          </div>

          {/* ✅ Product section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Product
            </h4>
            <nav className="space-y-3">
              <a 
                href="/features" 
                className="block text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Features
              </a>
              <a 
                href="/pricing" 
                className="block text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Pricing
              </a>
            </nav>
          </div>

          {/* ✅ Company section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Company
            </h4>
            <nav className="space-y-3">
              <a 
                href="/about" 
                className="block text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                About
              </a>
              <a 
                href="/contact" 
                className="block text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Contact
              </a>
            </nav>
          </div>

          {/* ✅ Legal section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Legal
            </h4>
            <nav className="space-y-3">
              <a 
                href="/terms" 
                className="block text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Terms
              </a>
              <a 
                href="/privacy" 
                className="block text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cookies
              </a>
            </nav>
          </div>
        </div>

        {/* ✅ Social media section */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Social links */}
            <div className="space-y-4 md:space-y-0">
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide text-center md:text-left">
                Follow Us
              </h4>
              <div className="flex justify-center md:justify-start space-x-4 mt-2">
                <a 
                  href="https://twitter.com/elaview" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
                  aria-label="Follow us on Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="https://facebook.com/elaview" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://instagram.com/elaview" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://linkedin.com/company/elaview" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
                  aria-label="Follow us on LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-sm text-slate-500">
                © {currentYear} Elaview. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ✅ USAGE EXAMPLE:
// To use this footer in any page, simply import and add it:
// 
// import Footer from '@/components/layout/Footer';
// 
// function MyPage() {
//   return (
//     <div className="min-h-screen flex flex-col">
//       {/* Page content */}
//       <main className="flex-1">
//         {/* Your page content here */}
//       </main>
//       
//       {/* Footer at bottom */}
//       <Footer />
//     </div>
//   );
// }

export default Footer;