import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import billboard1 from './../../public/billboard1.webp'
import { 
  ArrowRight, 
  Search, 
  Handshake, 
  TrendingUp, 
  Shield, 
  Users, 
  Star,
  CheckCircle,
  Play,
  MapPin,
  Clock,
  DollarSign
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Search,
      title: "Discover Premium Spaces",
      description: "Access exclusive advertising opportunities across digital billboards, transit networks, and high-traffic locations."
    },
    {
      icon: Handshake,
      title: "Direct Connections",
      description: "Connect directly with space owners and advertisers. No middlemen, no hidden fees, just transparent business."
    },
    {
      icon: TrendingUp,
      title: "Maximize ROI",
      description: "Data-driven insights and competitive pricing ensure you get the best return on your advertising investment."
    },
    {
      icon: Shield,
      title: "Secure Transactions",
      description: "Enterprise-grade security and verified profiles give you peace of mind in every transaction."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Browse Premium Spaces",
      description: "Explore thousands of verified advertising opportunities with detailed analytics and pricing."
    },
    {
      number: "02", 
      title: "Connect & Negotiate",
      description: "Message space owners directly, negotiate terms, and secure the perfect advertising placement."
    },
    {
      number: "03",
      title: "Launch Your Campaign",
      description: "Deploy your ads with confidence using our streamlined campaign management tools."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Director, TechCorp",
      content: "Elaview transformed our advertising strategy. We found premium billboard locations that increased our brand visibility by 300%.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b820?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Michael Rodriguez",
      role: "Space Owner, Metro Holdings",
      content: "As a property owner, Elaview helps me monetize my spaces efficiently. The platform is intuitive and the payouts are reliable.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Emma Thompson",
      role: "CEO, LocalBrand Co.",
      content: "The direct connection with space owners saved us 40% on our advertising budget while improving campaign performance.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-blue-500/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-32 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm font-medium border-blue-200">
                  🚀 The Future of Advertising is Here
                </Badge>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                  <span className="text-slate-900">Buy & Sell</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                    Premium Ad Spaces
                  </span>
                  <br />
                  <span className="text-slate-900">With Confidence</span>
                </h1>
                
                <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
                  Connect with space owners and advertisers in the most trusted B2B advertising marketplace. 
                  Discover premium locations, negotiate directly, and maximize your advertising ROI.
                </p>
              </div>

              {/* ✅ UPDATED: Single CTA Button to Sign In */}
              <div className="flex justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  onClick={() => {
                    console.log('Get Started - Navigating to /sign-in');
                    navigate('/sign-in');
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">10K+</div>
                  <div className="text-sm text-slate-600">Active Spaces</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">500+</div>
                  <div className="text-sm text-slate-600">Verified Owners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">98%</div>
                  <div className="text-sm text-slate-600">Success Rate</div>
                </div>
              </div>
            </div>

            <div className="relative lg:pl-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-3xl transform rotate-6"></div>
                <div className="relative bg-white p-8 rounded-3xl shadow-2xl">
                  <img 
                    src={billboard1} 
                    alt="Modern advertising billboard in urban setting"
                    className="w-full h-64 object-cover rounded-2xl"
                  />
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-100 text-green-800 px-3 py-1">Available Now</Badge>
                      <div className="text-2xl font-bold text-blue-600">$2,400/month</div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-slate-900">Premium Digital Billboard</h3>
                      <div className="flex items-center text-slate-600 text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        Times Square, New York
                      </div>
                      <div className="flex items-center text-slate-600 text-sm">
                        <Users className="h-4 w-4 mr-1" />
                        2.5M daily impressions
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Why Choose Elaview?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We've built the most comprehensive and trusted platform for advertising space transactions, 
              designed specifically for modern businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-blue-200">
                <CardContent className="p-8">
                  <div className="bg-blue-50 group-hover:bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6 transition-colors duration-300">
                    <benefit.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{benefit.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              How Elaview Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Getting started is simple. Our streamlined process gets you connected with 
              the right opportunities in minutes, not weeks.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 right-0 w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent transform translate-x-1/2"></div>
                )}
                
                <Card className="relative bg-white border-slate-200 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-4">
                        {step.number}
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900">{step.title}</h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* ✅ UPDATED: Single CTA Button in How It Works Section */}
          <div className="text-center mt-12">
            <Button 
              size="lg"
              onClick={() => {
                console.log('Get Started Today - Navigating to /sign-in');
                navigate('/sign-in');
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Join thousands of successful businesses who trust Elaview for their advertising needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-slate-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-slate-700 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">{testimonial.name}</div>
                      <div className="text-sm text-slate-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Ready to Transform Your Advertising Strategy?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Join the most trusted B2B advertising marketplace and discover premium spaces 
              that will elevate your brand to new heights.
            </p>
            
            {/* ✅ UPDATED: Single CTA Button in Final Section */}
            <div className="flex justify-center pt-4">
              <Button 
                size="lg" 
                onClick={() => {
                  console.log('Join Elaview Today - Navigating to /sign-in');
                  navigate('/sign-in');
                }}
                className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                Join Elaview Today
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="pt-8 flex items-center justify-center space-x-8 text-blue-100">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>Free to browse</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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