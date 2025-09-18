// src/pages/home/Home.tsx
// ✅ ELAVIEW HOMEPAGE - Redesigned with modern card styling

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import billboard1 from './../../public/billboard1.webp'
import { 
 ArrowRight, 
 Search, 
 MapPin,
 Users, 
 Star,
 Heart,
 Share,
 ShoppingCart,
 Clock,
 Calendar,
 BarChart3
} from "lucide-react";

export default function Home() {
 const navigate = useNavigate();
 const { isSignedIn } = useAuth();

 // ✅ Smart List Property button with auth handling
 const handleListPropertyClick = () => {
 console.log('🏠 Home: List Property clicked, signed in:', isSignedIn);
 
 if (isSignedIn) {
 console.log('✅ Home: User authenticated, navigating to /list-space');
 navigate('/list-space');
 } else {
 console.log('🔑 Home: User not authenticated, redirecting to sign-in');
 sessionStorage.setItem('redirectAfterSignIn', '/list-space');
 navigate('/sign-in?intent=seller&redirect=/list-space');
 }
 };

 // Mock data for featured sections - replace with real data from your API
 const featuredSpaces = [
 {
 id: 1,
 title: "Times Square Digital Billboard",
 location: "New York, NY",
 price: 2400,
 period: "month",
 rating: 4.9,
 reviews: 127,
 image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop",
 impressions: "25K",
 impressionsPeriod: "day",
 type: "Digital Billboard",
 featured: true,
 availability: "Available Now",
 size: "14x48 ft",
 audience: "Business"
 },
 {
 id: 2,
 title: "Downtown Transit Station",
 location: "Chicago, IL",
 price: 1800,
 period: "month",
 rating: 4.8,
 reviews: 89,
 image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop",
 impressions: "12K",
 impressionsPeriod: "day",
 type: "Transit Ad",
 featured: false,
 availability: "Available Now",
 size: "6x4 ft",
 audience: "Commuter"
 },
 {
 id: 3,
 title: "Shopping Mall LED Display",
 location: "Los Angeles, CA",
 price: 3200,
 period: "month",
 rating: 5.0,
 reviews: 203,
 image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
 impressions: "8K",
 impressionsPeriod: "day",
 type: "LED Display",
 featured: true,
 availability: "Available Now",
 size: "10x6 ft",
 audience: "Family"
 },
 {
 id: 4,
 title: "Highway Billboard",
 location: "Miami, FL",
 price: 1500,
 period: "month",
 rating: 4.7,
 reviews: 156,
 image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
 impressions: "5K",
 impressionsPeriod: "day",
 type: "Traditional Billboard",
 featured: false,
 availability: "Available Now",
 size: "14x48 ft",
 audience: "General"
 },
 {
 id: 5,
 title: "Airport Terminal Screen",
 location: "Denver, CO",
 price: 2800,
 period: "month",
 rating: 4.9,
 reviews: 94,
 image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop",
 impressions: "18K",
 impressionsPeriod: "day",
 type: "Airport Display",
 featured: true,
 availability: "Available Now",
 size: "55 inch",
 audience: "Traveler"
 }
 ];

 const budgetFriendlySpaces = [
 {
 id: 6,
 title: "Local Coffee Shop Window",
 location: "Portland, OR",
 price: 450,
 period: "month",
 rating: 4.6,
 reviews: 34,
 image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop",
 impressions: "500",
 impressionsPeriod: "day",
 type: "Window Display",
 availability: "Available Now",
 size: "24x36 in",
 audience: "Local"
 },
 {
 id: 7,
 title: "Bus Stop Shelter Ad",
 location: "Austin, TX",
 price: 680,
 period: "month",
 rating: 4.5,
 reviews: 67,
 image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop",
 impressions: "1.2K",
 impressionsPeriod: "day",
 type: "Bus Shelter",
 availability: "Available Now",
 size: "68x47 in",
 audience: "Commuter"
 },
 {
 id: 8,
 title: "Community Center Board",
 location: "Nashville, TN",
 price: 320,
 period: "month",
 rating: 4.4,
 reviews: 23,
 image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
 impressions: "250",
 impressionsPeriod: "day",
 type: "Community Board",
 availability: "Available Now",
 size: "48x36 in",
 audience: "Community"
 },
 {
 id: 9,
 title: "Local Gym Display",
 location: "Seattle, WA",
 price: 590,
 period: "month",
 rating: 4.7,
 reviews: 45,
 image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
 impressions: "750",
 impressionsPeriod: "day",
 type: "Indoor Display",
 availability: "Available Now",
 size: "32x24 in",
 audience: "Fitness"
 },
 {
 id: 10,
 title: "Street Pole Banner",
 location: "Phoenix, AZ",
 price: 750,
 period: "month",
 rating: 4.3,
 reviews: 56,
 image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
 impressions: "900",
 impressionsPeriod: "day",
 type: "Street Banner",
 availability: "Available Now",
 size: "30x60 in",
 audience: "Pedestrian"
 }
 ];

 const topRatedSpaces = featuredSpaces.filter(space => space.rating>= 4.8);
 const bestExposureSpaces = [...featuredSpaces].sort((a, b) => 
 parseInt(b.impressions.replace(/[^0-9]/g, '')) - parseInt(a.impressions.replace(/[^0-9]/g, ''))
 );

 const SpaceCard = ({ space, className = "" }) => (
 <Card className={`group cursor-pointer transition-all duration-300 border-0 shadow-sm hover:shadow-lg bg-white rounded-2xl overflow-hidden ${className}`}>
 <div className="relative">
 <img 
 src={space.image}
 alt={space.title}
 className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
 />
 
 {/* Top badges and actions */}
 <div className="absolute top-3 left-3 flex gap-2">
 {space.featured && (
 <Badge className="bg-blue-600 text-white px-3 py-1 text-xs font-medium border-0 rounded-lg shadow-sm">
 Featured
 </Badge>
 )}
 </div>
 
 <div className="absolute top-3 right-3">
 <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md">
 <Heart className="h-4 w-4 text-slate-600 hover:text-red-500 transition-colors" />
 </button>
 </div>

 {/* Availability status */}
 <div className="absolute bottom-3 left-3">
 <Badge className="bg-green-500 text-white px-3 py-1 text-xs font-medium border-0 rounded-lg flex items-center gap-1">
 <div className="w-2 h-2 bg-white rounded-full"></div>
 {space.availability}
 </Badge>
 </div>
 </div>

 <CardContent className="p-4 space-y-3">
 {/* Title and rating */}
 <div className="flex items-start justify-between gap-2">
 <h3 className="font-semibold text-slate-900 text-base leading-tight flex-1 line-clamp-2">
 {space.title}
 </h3>
 <div className="flex items-center text-sm font-medium text-slate-700 flex-shrink-0 ml-2">
 <Star className="h-4 w-4 text-amber-400 fill-current mr-1" />
 {space.rating}
 </div>
 </div>

 {/* Location */}
 <div className="flex items-center text-sm text-slate-600">
 <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-slate-400" />
 <span className="truncate">{space.location}</span>
 </div>

 {/* Stats row */}
 <div className="grid grid-cols-3 gap-4 py-2">
 <div className="flex items-center text-xs">
 <Users className="h-4 w-4 mr-1 text-blue-500" />
 <div>
 <div className="font-semibold text-slate-900">{space.impressions}</div>
 <div className="text-slate-500">/{space.impressionsPeriod}</div>
 </div>
 </div>
 
 <div className="flex items-center text-xs">
 <Users className="h-4 w-4 mr-1 text-green-500" />
 <div>
 <div className="font-medium text-slate-700 capitalize">{space.audience}</div>
 <div className="text-slate-500">audience</div>
 </div>
 </div>
 
 <div className="flex items-center text-xs">
 <BarChart3 className="h-4 w-4 mr-1 text-purple-500" />
 <div>
 <div className="font-medium text-slate-700">{space.size}</div>
 <div className="text-slate-500">size</div>
 </div>
 </div>
 </div>

 {/* Price and action */}
 <div className="flex items-center justify-between pt-2 border-t border-slate-100">
 <div className="flex items-baseline gap-1">
 <span className="text-xl font-bold text-slate-900">${space.price.toLocaleString()}</span>
 <span className="text-sm text-slate-500">/{space.period}</span>
 </div>
 
 <div className="flex items-center gap-2">
 <div className="flex items-center text-xs text-green-600 font-medium">
 <BarChart3 className="h-3 w-3 mr-1" />
 +28% visibility
 </div>
 </div>
 </div>

 {/* Action buttons */}
 <div className="flex gap-2 pt-2">
 <Button 
 variant="outline" 
 size={20} 
 className="flex-1 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
>
 View Details
 </Button>
 <Button 
 size={20} 
 className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200 px-4 rounded-lg"
>
 <ShoppingCart className="h-4 w-4" />
 </Button>
 </div>
 </CardContent>
 </Card>
 );

 const SectionHeader = ({ title, subtitle }) => (
 <div className="mb-8">
 <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">{title}</h2>
 {subtitle && <p className="text-lg text-slate-600">{subtitle}</p>}
 </div>
 );

 return (
 <div className="min-h-screen" style={{ backgroundColor: '#F8FAFF' }}>
 {/* ✅ CONSTRAINED HERO SECTION - Max 60% of viewport height */}
 <section 
 className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
 style={{ 
 height: '60vh',
 minHeight: '500px',
 maxHeight: '700px',
 // Replace with your dynamic background image/video
 backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&h=1080&fit=crop")'
 }}
>
 <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30"></div>
 
 <div className="relative mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 h-full">
 <div className="grid lg:grid-cols-2 gap-12 items-center h-full py-8">
 {/* LEFT SIDE - Header, Subheader, CTAs, Metrics */}
 <div className="space-y-6 text-white">
 <div className="space-y-4">
 <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
 Discover Hidden Advertising Spaces
 </h1>
 
 <p className="text-xl text-slate-200 leading-relaxed max-w-xl">
 Connect with space owners and advertisers in the most trusted advertising marketplace
 </p>
 </div>

 <div className="flex flex-col sm:flex-row gap-4">
 <Button 
 size={32} 
 onClick={() => {
 console.log('Browse Spaces - Navigating to /browse');
 navigate('/browse');
 }}
 className="text-slate-900 bg-white hover:bg-slate-50 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
>
 Browse Spaces
 <Search className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
 </Button>
 
 <Button 
 size={32} 
 onClick={handleListPropertyClick}
 className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
>
 List Property
 <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
 </Button>
 </div>

 {/* Metrics */}
 <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20">
 <div>
 <div className="text-2xl font-bold text-white">10K+</div>
 <div className="text-sm text-slate-200">Active Spaces</div>
 </div>
 <div>
 <div className="text-2xl font-bold text-white">500+</div>
 <div className="text-sm text-slate-200">Verified Owners</div>
 </div>
 <div>
 <div className="text-2xl font-bold text-white">98%</div>
 <div className="text-sm text-slate-200">Success Rate</div>
 </div>
 </div>
 </div>

 {/* RIGHT SIDE - Featured Space Card */}
 <div className="flex justify-center lg:justify-end">
 <div className="w-full max-w-sm">
 <SpaceCard 
 space={featuredSpaces[0]} 
 className="bg-white/95 backdrop-blur-sm shadow-2xl" 
 />
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* ✅ AIRBNB-STYLE SECTIONS */}
 <div className="mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-16 space-y-16">
 
 {/* Featured Spaces Section */}
 <section>
 <SectionHeader 
 title="Featured Spaces" 
 subtitle="Hand-picked premium advertising opportunities"
 />
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
 {featuredSpaces.map((space) => (
 <SpaceCard key={space.id} space={space} />
 ))}
 </div>
 </section>

 {/* Budget-friendly Section */}
 <section>
 <SectionHeader 
 title="Budget-friendly" 
 subtitle="Great advertising opportunities that won't break the bank"
 />
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
 {budgetFriendlySpaces.map((space) => (
 <SpaceCard key={space.id} space={space} />
 ))}
 </div>
 </section>

 {/* Top Rated Section */}
 <section>
 <SectionHeader 
 title="Top Rated" 
 subtitle="Highest rated spaces by our community"
 />
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
 {topRatedSpaces.map((space) => (
 <SpaceCard key={space.id} space={space} />
 ))}
 </div>
 </section>

 {/* Best Exposure Section */}
 <section>
 <SectionHeader 
 title="Best Exposure" 
 subtitle="Maximum visibility for your advertising campaigns"
 />
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
 {bestExposureSpaces.map((space) => (
 <SpaceCard key={space.id} space={space} />
 ))}
 </div>
 </section>

 </div>

 {/* Footer */}
 <footer className="bg-slate-900 text-white py-12 mt-16">
 <div className="mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
 <div className="text-center">
 <div className="text-2xl font-bold mb-4">Elaview</div>
 <p className="text-slate-400 mb-6">The premium B2B advertising marketplace</p>
 <div className="text-sm text-slate-500">
 © 2024 Elaview. All rights reserved.
 </div>
 </div>
 </div>
 </footer>
 </div>
 );
}