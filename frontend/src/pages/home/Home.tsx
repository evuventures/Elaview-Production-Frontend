// src/pages/home/Home.tsx
// ✅ ELAVIEW HOMEPAGE - With glassmorphism card styling matching Browse page

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import billboard1 from './../../public/billboard1.webp'
import Footer from '../../components/layout/Footer';
// ✅ Import carousel components
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
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
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  Plus
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  console.log('🏠 Home page loaded - Carousel implementation active with glassmorphism');

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

  // ✅ Carousel responsive configuration - Shows 4.5 items on desktop
  const carouselResponsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1920 },
      items: 4.5,
      slidesToSlide: 4,
      partialVisibilityGutter: 40 // This controls how much of the partial item shows
    },
    desktop: {
      breakpoint: { max: 1920, min: 1024 },
      items: 4.5,
      slidesToSlide: 4,
      partialVisibilityGutter: 30
    },
    tablet: {
      breakpoint: { max: 1024, min: 768 },
      items: 2.5,
      slidesToSlide: 2,
      partialVisibilityGutter: 20
    },
    mobile: {
      breakpoint: { max: 768, min: 0 },
      items: 1.2,
      slidesToSlide: 1,
      partialVisibilityGutter: 20
    }
  };

  // ✅ Custom arrow components for better styling
  const CustomLeftArrow = ({ onClick }: { onClick: () => void }) => {
    return (
      <button
        onClick={onClick}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white hover:bg-slate-50 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 group border border-slate-200"
        aria-label="Previous"
      >
        <ChevronLeft className="h-6 w-6 text-slate-700 group-hover:text-slate-900" />
      </button>
    );
  };

  const CustomRightArrow = ({ onClick }: { onClick: () => void }) => {
    return (
      <button
        onClick={onClick}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white hover:bg-slate-50 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 group border border-slate-200"
        aria-label="Next"
      >
        <ChevronRight className="h-6 w-6 text-slate-700 group-hover:text-slate-900" />
      </button>
    );
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
    },
    {
      id: 6,
      title: "Stadium LED Screen",
      location: "Boston, MA",
      price: 3500,
      period: "month",
      rating: 4.8,
      reviews: 178,
      image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop",
      impressions: "30K",
      impressionsPeriod: "event",
      type: "Stadium Display",
      featured: true,
      availability: "Available Now",
      size: "20x10 ft",
      audience: "Sports Fans"
    },
    {
      id: 7,
      title: "City Center Plaza",
      location: "San Francisco, CA",
      price: 2200,
      period: "month",
      rating: 4.7,
      reviews: 92,
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
      impressions: "15K",
      impressionsPeriod: "day",
      type: "Plaza Display",
      featured: false,
      availability: "Available Now",
      size: "12x8 ft",
      audience: "Urban"
    },
    {
      id: 8,
      title: "Beach Boulevard Banner",
      location: "San Diego, CA",
      price: 1600,
      period: "month",
      rating: 4.6,
      reviews: 73,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      impressions: "7K",
      impressionsPeriod: "day",
      type: "Beach Banner",
      featured: false,
      availability: "Available Now",
      size: "8x4 ft",
      audience: "Tourist"
    }
  ];

  const budgetFriendlySpaces = [
    {
      id: 9,
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
      id: 10,
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
      id: 11,
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
      id: 12,
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
      id: 13,
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
    },
    {
      id: 14,
      title: "Library Bulletin Board",
      location: "Denver, CO",
      price: 280,
      period: "month",
      rating: 4.5,
      reviews: 19,
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
      impressions: "400",
      impressionsPeriod: "day",
      type: "Bulletin Board",
      availability: "Available Now",
      size: "36x24 in",
      audience: "Students"
    },
    {
      id: 15,
      title: "Restaurant Table Tent",
      location: "Columbus, OH",
      price: 380,
      period: "month",
      rating: 4.4,
      reviews: 28,
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
      impressions: "600",
      impressionsPeriod: "day",
      type: "Table Display",
      availability: "Available Now",
      size: "4x6 in",
      audience: "Diners"
    },
    {
      id: 16,
      title: "Park Kiosk Display",
      location: "Charlotte, NC",
      price: 520,
      period: "month",
      rating: 4.6,
      reviews: 31,
      image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop",
      impressions: "850",
      impressionsPeriod: "day",
      type: "Kiosk",
      availability: "Available Now",
      size: "48x72 in",
      audience: "Families"
    }
  ];

  const topRatedSpaces = featuredSpaces.filter(space => space.rating >= 4.8);
  const bestExposureSpaces = [...featuredSpaces].sort((a, b) => 
    parseInt(b.impressions.replace(/[^0-9]/g, '')) - parseInt(a.impressions.replace(/[^0-9]/g, ''))
  );

  // ✅ GLASSMORPHISM SPACECARD - Matching Browse page styling
  const SpaceCard = ({ space, className = "" }: { space: any, className?: string }) => {
    // Verification logging for glassmorphism
    useEffect(() => {
      console.log('🎨 HOME SPACECARD GLASSMORPHISM: Enhanced styling applied', {
        spaceName: space.title,
        glassmorphismFeatures: [
          'Semi-transparent gradient background',
          'Enhanced backdrop blur (20px)',
          'Saturation boost (180%)',
          'Multi-layered shadow system',
          'Glass reflection overlays',
          'Transparent border effects',
          'Premium hover elevations'
        ],
        timestamp: new Date().toISOString()
      });
    }, [space]);

    return (
      <div
        className={`group cursor-pointer transition-all duration-500 rounded-2xl relative h-full ${className}`}
        style={{
          // ✅ GLASSMORPHISM: Main container with premium glass effect
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)', 
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.12),
                     0 4px 16px rgba(0, 0, 0, 0.08),
                     inset 0 1px 0 rgba(255, 255, 255, 0.2),
                     inset 0 -1px 0 rgba(255, 255, 255, 0.05)`,
        }}
        onMouseEnter={(e) => {
          // ✅ GLASSMORPHISM: Enhanced hover effect
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = `
            0 16px 48px rgba(0, 0, 0, 0.18),
            0 8px 24px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(255, 255, 255, 0.1)
          `;
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.45) 50%, rgba(255, 255, 255, 0.35) 100%)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0px)';
          e.currentTarget.style.boxShadow = `
            0 8px 32px rgba(0, 0, 0, 0.12),
            0 4px 16px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(255, 255, 255, 0.05)
          `;
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)';
        }}
      >
        {/* ✅ GLASSMORPHISM: Glass reflection effect overlay */}
        <div 
          className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)'
          }}
        />
        
        {/* ✅ GLASSMORPHISM: Glass highlight edge */}
        <div 
          className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 20%, rgba(255, 255, 255, 0.3) 80%, transparent 100%)'
          }}
        />

        <div className="p-0 relative z-10 h-full flex flex-col">
          {/* Enhanced Image Section with subtle glassmorphism overlays */}
          <div className="relative h-48 p-3">
            <div className="relative h-full w-full rounded-lg overflow-hidden">
              <img 
                src={space.image}
                alt={space.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e: any) => {
                  e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400';
                }}
              />
              
              {/* ✅ GLASSMORPHISM: Enhanced overlay elements with glass effect */}
              <div className="absolute top-3 left-3">
                <span 
                  className="text-white flex items-center gap-1 text-xs font-medium shadow-lg px-3 py-1 rounded-full relative overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(70, 104, 171, 0.9) 0%, rgba(70, 104, 171, 0.95) 100%)',
                    backdropFilter: 'blur(10px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(10px) saturate(150%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 16px rgba(70, 104, 171, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {/* Glass reflection on badge */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)'
                    }}
                  />
                  <span className="relative z-10">{space.type}</span>
                </span>
              </div>

              {/* Heart button */}
              <div className="absolute top-3 right-3">
                <button 
                  className="p-2 rounded-full transition-all duration-200 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
                    backdropFilter: 'blur(10px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(10px) saturate(150%)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Heart className="h-4 w-4 text-slate-600 hover:text-red-500 transition-colors relative z-10" />
                </button>
              </div>
            </div>
          </div>

          {/* ✅ GLASSMORPHISM: Enhanced Content Section with subtle glass background */}
          <div 
            className="p-4 space-y-2 relative overflow-hidden rounded-b-2xl flex-1 flex flex-col"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.4) 100%)',
              backdropFilter: 'blur(15px) saturate(150%)',
              WebkitBackdropFilter: 'blur(15px) saturate(150%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderTop: 'none',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Content glass reflection */}
            <div 
              className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 100%)'
              }}
            />

            {/* Title and rating */}
            <div className="flex items-start justify-between relative z-10">
              <div className="flex-1 min-w-0">
                <h3 
                  className="font-bold text-base text-slate-800 group-hover:transition-colors duration-300 truncate"
                  style={{
                    color: 'inherit',
                    textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#4668AB'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
                >
                  {space.title}
                </h3>
                <p className="text-xs text-slate-600 font-medium truncate" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'}}>
                  {space.type}
                </p>
              </div>
              {space.rating && (
                <div className="flex items-center text-amber-500 ml-2">
                  <Star className="w-3 h-3 mr-1 fill-current drop-shadow-sm" />
                  <span className="text-xs font-medium" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'}}>{space.rating}</span>
                </div>
              )}
            </div>
            
            {/* Location */}
            <p className="text-xs text-slate-500 flex items-center truncate relative z-10" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'}}>
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0 drop-shadow-sm" />
              {space.location}
            </p>

            {/* Spacer to push action area to bottom */}
            <div className="flex-1" />

            {/* ✅ GLASSMORPHISM: Enhanced Action Area */}
            <div className="relative z-10 space-y-2">
              {/* Price and Viewers Row */}
              <div className="flex items-center justify-between">
                <span 
                  className="text-white font-bold shadow-lg px-3 py-1 rounded-full text-xs relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(30, 41, 59, 1) 100%)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 16px rgba(30, 41, 59, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {/* Glass reflection on price badge */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)'
                    }}
                  />
                  <span className="relative z-10">${space.price.toLocaleString()}/{space.period}</span>
                </span>
                
                <div className="flex items-center text-slate-600">
                  <Eye className="w-3 h-3 mr-1 drop-shadow-sm" />
                  <span className="text-xs font-medium" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>
                    {space.impressions}/{space.impressionsPeriod}
                  </span>
                </div>
              </div>

              {/* Buttons Row */}
              <div className="flex items-center gap-2">
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/browse');
                  }}
                  size="sm"
                  className="text-white text-xs px-3 py-1 shadow-lg border-0 transition-all duration-300 relative overflow-hidden flex-1"
                  style={{ 
                    background: 'linear-gradient(135deg, #5A7BC2 0%, #4668AB 50%, #3A5490 100%)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 16px rgba(70, 104, 171, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    flexBasis: '70%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #6B8BD1 0%, #5A7BC2 50%, #4668AB 100%)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(70, 104, 171, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #5A7BC2 0%, #4668AB 50%, #3A5490 100%)';
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(70, 104, 171, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                  }}
                >
                  {/* Glass reflection on button */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)'
                    }}
                  />
                  <span className="relative z-10">View Details</span>
                </Button>

                {/* ✅ GLASSMORPHISM: Enhanced Cart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Add to cart:', space);
                  }}
                  className="p-2 rounded-lg transition-all duration-300 relative overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
                    backdropFilter: 'blur(10px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(10px) saturate(150%)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    flexBasis: '30%',
                    minWidth: 'fit-content'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                  }}
                >
                  {/* Glass reflection on button */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-lg"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%)'
                    }}
                  />
                  <Plus className="w-4 h-4 text-slate-600 relative z-10" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SectionHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
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
          height: '70vh',
          minHeight: '500px',
          maxHeight: '700px',
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
                  size="lg" 
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
                  size="lg" 
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
                  className="shadow-2xl" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ CAROUSEL SECTIONS WITH 4.5 CARD DISPLAY */}
      <div className="mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-16 space-y-16">
        
        {/* Featured Spaces Section with Carousel */}
        <section className="relative">
          <SectionHeader 
            title="Featured Spaces" 
            subtitle="Hand-picked premium advertising opportunities"
          />
          <div className="carousel-container">
            <Carousel
              responsive={carouselResponsive}
              partialVisible={true}
              swipeable={true}
              draggable={true}
              showDots={false}
              infinite={false}
              keyBoardControl={true}
              customTransition="transform 300ms ease-in-out"
              transitionDuration={300}
              containerClass="carousel-container"
              removeArrowOnDeviceType={[]}
              itemClass="pr-6"
              customLeftArrow={<CustomLeftArrow onClick={() => {}} />}
              customRightArrow={<CustomRightArrow onClick={() => {}} />}
            >
              {featuredSpaces.map((space) => (
                <div key={space.id} className="h-full pb-2">
                  <SpaceCard space={space} />
                </div>
              ))}
            </Carousel>
          </div>
        </section>

        {/* Budget-friendly Section with Carousel */}
        <section className="relative">
          <SectionHeader 
            title="Budget-friendly" 
            subtitle="Great advertising opportunities that won't break the bank"
          />
          <div className="carousel-container">
            <Carousel
              responsive={carouselResponsive}
              partialVisible={true}
              swipeable={true}
              draggable={true}
              showDots={false}
              infinite={false}
              keyBoardControl={true}
              customTransition="transform 300ms ease-in-out"
              transitionDuration={300}
              containerClass="carousel-container"
              removeArrowOnDeviceType={[]}
              itemClass="px-3"
              customLeftArrow={<CustomLeftArrow onClick={() => {}} />}
              customRightArrow={<CustomRightArrow onClick={() => {}} />}
            >
              {budgetFriendlySpaces.map((space) => (
                <div key={space.id} className="h-full pb-2">
                  <SpaceCard space={space} />
                </div>
              ))}
            </Carousel>
          </div>
        </section>

        {/* Top Rated Section with Carousel */}
        <section className="relative">
          <SectionHeader 
            title="Top Rated" 
            subtitle="Highest rated spaces by our community"
          />
          <div className="carousel-container">
            <Carousel
              responsive={carouselResponsive}
              partialVisible={true}
              swipeable={true}
              draggable={true}
              showDots={false}
              infinite={false}
              keyBoardControl={true}
              customTransition="transform 300ms ease-in-out"
              transitionDuration={300}
              containerClass="carousel-container"
              removeArrowOnDeviceType={[]}
              itemClass="px-3"
              customLeftArrow={<CustomLeftArrow onClick={() => {}} />}
              customRightArrow={<CustomRightArrow onClick={() => {}} />}
            >
              {topRatedSpaces.map((space) => (
                <div key={space.id} className="h-full pb-2">
                  <SpaceCard space={space} />
                </div>
              ))}
            </Carousel>
          </div>
        </section>

        {/* Best Exposure Section with Carousel */}
        <section className="relative">
          <SectionHeader 
            title="Best Exposure" 
            subtitle="Maximum visibility for your advertising campaigns"
          />
          <div className="carousel-container">
            <Carousel
              responsive={carouselResponsive}
              partialVisible={true}
              swipeable={true}
              draggable={true}
              showDots={false}
              infinite={false}
              keyBoardControl={true}
              customTransition="transform 300ms ease-in-out"
              transitionDuration={300}
              containerClass="carousel-container"
              removeArrowOnDeviceType={[]}
              itemClass="px-3"
              customLeftArrow={<CustomLeftArrow onClick={() => {}} />}
              customRightArrow={<CustomRightArrow onClick={() => {}} />}
            >
              {bestExposureSpaces.map((space) => (
                <div key={space.id} className="h-full pb-2">
                  <SpaceCard space={space} />
                </div>
              ))}
            </Carousel>
          </div>
        </section>

      </div>

      {/* ✅ Custom CSS for carousel container */}
      <style jsx>{`
        .carousel-container {
          position: relative;
          padding: 0;
        }
        
        @media (max-width: 768px) {
          .carousel-container {
            padding: 0 20px;
          }
        }

        /* Ensure equal height cards in carousel */
        .react-multi-carousel-item {
          display: flex;
          height: 100%;
        }

        .react-multi-carousel-item > div {
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        /* Hide default carousel buttons since we're using custom ones */
        .react-multiple-carousel__arrow {
          display: none;
        }

        /* Smooth scroll behavior */
        .react-multi-carousel-track {
          transition: transform 300ms ease-in-out;
        }
      `}</style>

      {/* Footer */}
      <Footer/>
    </div>
  );
}