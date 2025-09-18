import React, { useState } from 'react';
import { Menu, X, User, ChevronDown } from 'lucide-react';

export interface BasicNavbarProps {
 /** Brand/logo text */
 brandName?: string;
 /** Navigation items */
 navItems?: Array<{
 label: string;
 href: string;
 active?: boolean;
 }>;
 /** Current user information */
 user?: {
 name: string;
 email: string;
 } | null;
 /** Event handlers */
 onNavigate?: (href: string) => void;
 onSignIn?: () => void;
 onSignOut?: () => void;
}

export const BasicNavbar: React.FC<BasicNavbarProps> = ({
 brandName = 'Elaview',
 navItems = [
 { label: 'Home', href: '/home', active: true },
 { label: 'Dashboard', href: '/dashboard' },
 { label: 'Campaigns', href: '/campaigns' },
 { label: 'Analytics', href: '/analytics' },
 ],
 user = null,
 onNavigate,
 onSignIn,
 onSignOut,
}) => {
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const [userMenuOpen, setUserMenuOpen] = useState(false);

 const handleNavigate = (href: string) => {
 onNavigate?.(href);
 console.log('Navigate to:', href);
 setMobileMenuOpen(false);
 };

 const handleSignIn = () => {
 onSignIn?.();
 console.log('Sign in clicked');
 };

 const handleSignOut = () => {
 onSignOut?.();
 console.log('Sign out clicked');
 setUserMenuOpen(false);
 };

 return (
 <nav className="bg-slate-200 border-b border-slate-300">
 <div className="max-w-7xl mx-auto px-4">
 <div className="flex justify-between items-center h-16">
 
 {/* Logo */}
 <div className="flex items-center">
 <button
 onClick={() => handleNavigate('/home')}
 className="text-xl font-bold text-slate-800"
>
 {brandName}
 </button>
 </div>

 {/* Desktop Navigation */}
 <div className="hidden md:flex items-center space-x-8">
 {navItems.map((item) => (
 <button
 key={item.label}
 onClick={() => handleNavigate(item.href)}
 className={`text-sm font-medium px-3 py-2 rounded ${
 item.active
 ? 'text-slate-800 bg-slate-300'
 : 'text-slate-600 hover:text-slate-800'
 }`}
>
 {item.label}
 </button>
 ))}
 </div>

 {/* Right Side */}
 <div className="flex items-center space-x-4">
 
 {/* User Menu or Sign In */}
 {user ? (
 <div className="relative">
 <button
 onClick={() => setUserMenuOpen(!userMenuOpen)}
 className="flex items-center space-x-2 text-slate-800 hover:text-slate-600 px-3 py-2 rounded"
>
 <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
 <User className="w-4 h-4" />
 </div>
 <span className="text-sm font-medium">{user.name}</span>
 <ChevronDown className="w-4 h-4" />
 </button>

 {/* User Dropdown */}
 {userMenuOpen && (
 <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-300">
 <div className="py-1">
 <div className="px-4 py-2 text-sm text-slate-600 border-b border-slate-200">
 {user.email}
 </div>
 <button
 onClick={() => handleNavigate('/profile')}
 className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
>
 Profile
 </button>
 <button
 onClick={() => handleNavigate('/settings')}
 className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
>
 Settings
 </button>
 <div className="border-t border-slate-200">
 <button
 onClick={handleSignOut}
 className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100"
>
 Sign Out
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 ) : (
 <button
 onClick={handleSignIn}
 className="bg-slate-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-700"
>
 Sign In
 </button>
 )}

 {/* Mobile Menu Button */}
 <button
 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
 className="md:hidden p-2 text-slate-800 hover:text-slate-600"
>
 {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
 </button>
 </div>
 </div>

 {/* Mobile Menu */}
 {mobileMenuOpen && (
 <div className="md:hidden border-t border-slate-300">
 <div className="py-2 space-y-1">
 {navItems.map((item) => (
 <button
 key={item.label}
 onClick={() => handleNavigate(item.href)}
 className={`block w-full text-left px-4 py-2 text-sm font-medium ${
 item.active
 ? 'text-slate-800 bg-slate-300'
 : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
 }`}
>
 {item.label}
 </button>
 ))}
 </div>
 </div>
 )}
 </div>
 </nav>
 );
};