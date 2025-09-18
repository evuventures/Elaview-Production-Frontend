// src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface FooterLink {
 label: string;
 href: string;
}

interface FooterColumn {
 title: string;
 links?: FooterLink[];
 content?: React.ReactNode;
}

const Footer: React.FC = () => {
 // Footer data structure for easy maintenance
 const footerColumns: FooterColumn[] = [
 {
 title: 'ELAVIEW',
 content: (
 <p className="text-slate-400 leading-relaxed mb-5 max-w-[250px]">
 Transforming urban advertising by connecting property owners with brands.
 </p>
 )
 },
 {
 title: 'Quick Links',
 links: [
 { label: 'Browse Spaces', href: '/browse' },
 { label: 'List Your Property', href: '/list-space' },
 { label: 'How It Works', href: '/how-it-works' },
 { label: 'Success Stories', href: '/success-stories' }
 ]
 },
 {
 title: 'Resources',
 links: [
 { label: 'Blog', href: '/blog' },
 { label: 'FAQ', href: '/faq' },
 { label: 'Support', href: '/support' },
 { label: 'Advertising Guidelines', href: '/guidelines' }
 ]
 },
 {
 title: 'Contact Us',
 links: [
 { label: 'hello@elaview.com', href: 'mailto:hello@elaview.com' },
 { label: '+1 (555) 123-4567', href: 'tel:+15551234567' }
 ]
 }
 ];

 const currentYear = new Date().getFullYear();

 return (
 <footer className="bg-slate-800 text-white pt-24 pb-8 relative">
 <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
 {/* Main footer content */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 relative z-10">
 {footerColumns.map((column, index) => (
 <div key={index} className="min-w-[200px]">
 {/* Column title with accent underline */}
 <h3 className="mb-6 text-lg font-bold text-white relative pb-2">
 {column.title}
 <span 
 className="absolute bottom-0 left-0 w-10 h-[3px] rounded-sm"
 style={{ background: 'linear-gradient(to right, #0066FF, #00C2FF)' }}
 />
 </h3>
 
 {/* Column content or links */}
 {column.content ? (
 column.content
 ) : (
 <ul className="space-y-3">
 {column.links?.map((link, linkIndex) => (
 <li key={linkIndex}>
 {link.href.startsWith('mailto:') || link.href.startsWith('tel:') ? (
 <a 
 href={link.href}
 className="text-slate-400 hover:text-cyan-400 transition-all duration-300 inline-block hover:translate-x-1"
>
 {link.label}
 </a>
 ) : (
 <Link 
 to={link.href}
 className="text-slate-400 hover:text-cyan-400 transition-all duration-300 inline-block hover:translate-x-1"
>
 {link.label}
 </Link>
 )}
 </li>
 ))}
 </ul>
 )}
 </div>
 ))}
 </div>

 {/* Footer bottom with copyright */}
 <div className="text-center pt-8 border-t border-slate-800 text-slate-500 text-sm relative z-10">
 <p>&copy; {currentYear} ELAVIEW. All rights reserved.</p>
 </div>
 </div>
 </footer>
 );
};

export default Footer;