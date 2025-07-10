import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Map, CreditCard, FileText, Users, Zap, Sparkles, Star, ArrowRight, BookOpen, HelpCircle, Lightbulb, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatCommands from '../../components/chatbot/ChatCommands';

export default function HelpPage() {
  const features = [
    {
      icon: Map,
      title: "Interactive Map Explorer",
      description: "Browse premium advertising spaces on our intelligent map. Filter by type, price, and location to discover the perfect spot for your next campaign.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40"
    },
    {
      icon: CreditCard,
      title: "Seamless Booking Flow",
      description: "Book advertising spaces instantly with our streamlined process. Upload campaign materials, manage payments, and track everything in one place.",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40"
    },
    {
      icon: MessageCircle,
      title: "Direct Communication Hub",
      description: "Chat directly with space owners in real-time. Share documents, discuss requirements, and coordinate your advertising campaigns effortlessly.",
      color: "bg-gradient-brand",
      bgColor: "bg-[hsl(var(--muted))]"
    },
    {
      icon: FileText,
      title: "Smart Document Management",
      description: "Upload and share contracts, creative files, and permits securely. Keep all your campaign documents organized and accessible anywhere.",
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50 dark:from-orange-950/40 dark:to-red-950/40"
    },
    {
      icon: Users,
      title: "Profile & Team Management",
      description: "Manage your advertiser profile, company information, and team preferences to streamline future bookings and communications.",
      color: "from-indigo-500 to-purple-500",
      bgColor: "from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40"
    },
    {
      icon: Zap,
      title: "AI-Powered Assistant",
      description: "Get instant help from our intelligent AI chatbot. Ask questions, navigate the app, search for spaces, and get support 24/7.",
      color: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-50 to-orange-50 dark:from-yellow-950/40 dark:to-orange-950/40"
    }
  ];

  const quickActions = [
    { icon: BookOpen, title: "Getting Started Guide", description: "New to Elaview? Start here!" },
    { icon: HelpCircle, title: "FAQ & Support", description: "Find answers to common questions" },
    { icon: Lightbulb, title: "Tips & Best Practices", description: "Maximize your campaign success" },
    { icon: Rocket, title: "Advanced Features", description: "Unlock powerful capabilities" }
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-gradient-brand/20 rounded-3xl -z-10 transform rotate-1"></div>
          <div className="relative glass-strong rounded-3xl p-12 border border-[hsl(var(--border))] shadow-[var(--shadow-brand)]">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-[var(--shadow-brand-lg)]">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient-brand">
              Welcome to Elaview
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Your premier marketplace for advertising spaces. Connect with space owners, 
              book premium locations, and manage your advertising campaigns all in one powerful platform.
            </p>
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 px-4 py-2 rounded-full border border-green-200 dark:border-green-700">
                <Star className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-bold text-green-700 dark:text-green-300">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-950/30 dark:to-cyan-950/30 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-700">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-blue-700 dark:text-blue-300">10K+ Users</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="group card-brand glass border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-brand rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1">
              <CardHeader className={`${feature.title === "Direct Communication Hub" ? feature.bgColor : `bg-gradient-to-r ${feature.bgColor}`} border-b border-[hsl(var(--border))] p-8`}>
                <div className={`w-16 h-16 ${feature.title === "Direct Communication Hub" ? feature.color : `bg-gradient-to-r ${feature.color}`} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-card-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-muted-foreground leading-relaxed text-base">{feature.description}</p>
                <Button variant="ghost" className="mt-4 text-primary hover:bg-[hsl(var(--muted))] rounded-xl group-hover:translate-x-1 transition-transform">
                  Learn More <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Assistant Spotlight */}
        <Card className="bg-gradient-brand/20 backdrop-blur-xl border-[hsl(var(--border))] mb-16 rounded-3xl overflow-hidden shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-gradient-brand rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[var(--shadow-brand-lg)]">
              <MessageCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-6 text-gradient-brand">
              Meet Your AI Assistant
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Need help navigating Elaview? Our intelligent AI assistant is here 24/7 to help you find spaces, 
              make bookings, answer questions, and guide you through every feature of our platform.
            </p>
            <div className="glass rounded-2xl p-6 inline-block border border-[hsl(var(--border))] shadow-lg">
              <p className="text-primary font-mono text-lg mb-3 font-semibold">
                "Find me a billboard in Los Angeles under $10,000"
              </p>
              <p className="text-muted-foreground text-sm">Try asking the chatbot in natural language!</p>
            </div>
            <div className="mt-8">
              <Button className="btn-gradient text-white rounded-2xl px-8 py-3 text-lg font-bold transition-brand">
                Try AI Assistant <Zap className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-brand glass border-[hsl(var(--border))] rounded-3xl overflow-hidden shadow-xl mb-12">
          <CardHeader className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))] p-8">
            <CardTitle className="text-3xl text-center flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-gradient-brand rounded-2xl flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              Quick Start Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  className="h-auto p-6 rounded-2xl border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-brand group"
                >
                  <div className="text-center">
                    <action.icon className="w-8 h-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                    <p className="font-bold text-base mb-2">{action.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{action.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Commands Section */}
        <div className="mb-16">
          <ChatCommands />
        </div>

        {/* Getting Started Steps */}
        <Card className="card-brand glass border-[hsl(var(--border))] rounded-3xl overflow-hidden shadow-xl">
          <CardHeader className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))] p-8">
            <CardTitle className="text-3xl text-center flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              Getting Started in 3 Simple Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-brand rounded-3xl flex items-center justify-center mx-auto shadow-[var(--shadow-brand-lg)] group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold text-2xl">1</span>
                  </div>
                  <div className="absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-[hsl(var(--border))] to-transparent transform -translate-x-1/2 hidden md:block"></div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  Explore & Discover
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Use our interactive map to explore thousands of available advertising spaces in your target locations. Filter by type, budget, and audience reach.
                </p>
              </div>
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-green-500/25 group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold text-2xl">2</span>
                  </div>
                  <div className="absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-green-200 to-[hsl(var(--border))] dark:from-green-700 dark:to-[hsl(var(--border))] transform -translate-x-1/2 hidden md:block"></div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  Book & Customize
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Select your perfect space, choose campaign dates, upload your creative materials, and complete your booking with our secure payment system.
                </p>
              </div>
              <div className="text-center group">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/25 group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold text-2xl">3</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Manage & Optimize
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Communicate with space owners, track campaign performance, manage multiple bookings, and optimize your advertising strategy from one dashboard.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support CTA */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 backdrop-blur-xl border-indigo-200/50 dark:border-indigo-700/50 rounded-3xl overflow-hidden shadow-xl">
            <CardContent className="p-12">
              <HelpCircle className="w-16 h-16 mx-auto mb-6 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-2xl font-bold mb-4 text-foreground">Need More Help?</h3>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Our support team is standing by to help you succeed. Get personalized assistance, troubleshooting, and expert advice.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl px-8 py-3 font-bold shadow-lg hover:shadow-xl transition-brand">
                  Contact Support
                </Button>
                <Button variant="outline" className="border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-2xl px-8 py-3 font-bold">
                  Browse Knowledge Base
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}