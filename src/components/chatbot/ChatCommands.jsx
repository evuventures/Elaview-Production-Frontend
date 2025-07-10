import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Navigation, 
  Search, 
  Calendar, 
  UserCheck, 
  MapPin, 
  Target, 
  CreditCard, 
  MessageSquare, 
  Settings, 
  HelpCircle,
  Sparkles,
  Bot,
  Zap,
  Crown,
  Star
} from 'lucide-react';

export default function ChatCommands() {
  const commands = [
    {
      category: "Navigation",
      icon: Navigation,
      color: "from-[hsl(var(--primary))] to-[hsl(var(--accent))]",
      bgColor: "from-[hsl(var(--primary))]/5 to-[hsl(var(--accent))]/10",
      items: [
        { command: "Take me to the map", description: "Opens the advertising spaces map", icon: "🗺️" },
        { command: "Show my bookings", description: "View your current bookings", icon: "📅" },
        { command: "Open messages", description: "Go to your message inbox", icon: "💬" },
        { command: "Go to profile", description: "Edit your profile settings", icon: "👤" }
      ]
    },
    {
      category: "Search & Discovery",
      icon: Search,
      color: "from-[hsl(var(--success))] to-[hsl(var(--success))]/80",
      bgColor: "from-[hsl(var(--success))]/5 to-[hsl(var(--success))]/10",
      items: [
        { command: "Find billboards in New York", description: "Search for specific space types", icon: "🎯" },
        { command: "Show available spaces", description: "List all available advertising spots", icon: "📍" },
        { command: "Spaces under $5000", description: "Filter by price range", icon: "💰" },
        { command: "Digital displays near me", description: "Find nearby digital advertising", icon: "📱" }
      ]
    },
    {
      category: "Booking Help",
      icon: Calendar,
      color: "from-[hsl(var(--accent))] to-[hsl(var(--accent-light))]",
      bgColor: "from-[hsl(var(--accent))]/5 to-[hsl(var(--accent-light))]/10",
      items: [
        { command: "How do I book a space?", description: "Get booking instructions", icon: "❓" },
        { command: "What's included in pricing?", description: "Learn about pricing structure", icon: "📊" },
        { command: "Cancel my booking", description: "Get help with cancellations", icon: "❌" },
        { command: "Payment options", description: "Learn about payment methods", icon: "💳" }
      ]
    },
    {
      category: "Account & Support",
      icon: UserCheck,
      color: "from-[hsl(var(--warning))] to-[hsl(var(--warning))]/80",
      bgColor: "from-[hsl(var(--warning))]/5 to-[hsl(var(--warning))]/10",
      items: [
        { command: "Update my profile", description: "Get profile editing help", icon: "✏️" },
        { command: "Contact support", description: "Get support contact information", icon: "🆘" },
        { command: "How does Elaview work?", description: "Learn about the platform", icon: "ℹ️" },
        { command: "Help", description: "General assistance and FAQ", icon: "💡" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--muted))]/50 to-[hsl(var(--accent-light))]/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-brand/10 rounded-3xl transform rotate-1"></div>
          <Card className="relative glass border-[hsl(var(--border))] rounded-3xl overflow-hidden shadow-[var(--shadow-brand-lg)]">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-[var(--shadow-brand-lg)]">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-brand bg-clip-text text-transparent">
                Chat Commands
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
                Discover powerful commands to navigate Elaview and manage your advertising campaigns with ease
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Command Categories */}
        <div className="grid gap-8 md:grid-cols-2">
          {commands.map((category) => (
            <Card key={category.category} className="group glass border-[hsl(var(--border))] rounded-3xl overflow-hidden shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand hover:-translate-y-1">
              <CardHeader className={`bg-gradient-to-r ${category.bgColor} border-b border-[hsl(var(--border))] p-8`}>
                <CardTitle className="flex items-center gap-4 text-[hsl(var(--foreground))] text-2xl">
                  <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center shadow-[var(--shadow-brand)] group-hover:scale-110 transition-transform`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{category.category}</h3>
                    <Badge variant="outline" className="mt-2 border-[hsl(var(--border))] text-[hsl(var(--primary))] bg-[hsl(var(--muted))] rounded-full px-3 py-1 font-bold">
                      {category.items.length} commands
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  {category.items.map((item, index) => (
                    <div key={index} className="group/item relative">
                      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-[hsl(var(--card))]/50 to-[hsl(var(--muted))]/50 rounded-2xl border border-[hsl(var(--border))] hover:shadow-[var(--shadow-brand)] transition-brand hover:-translate-y-1">
                        <div className="w-10 h-10 bg-gradient-to-r from-[hsl(var(--accent))]/10 to-[hsl(var(--accent-light))]/20 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-[hsl(var(--primary))] font-mono text-sm font-bold bg-[hsl(var(--primary))]/10 px-3 py-1 rounded-full">
                              "{item.command}"
                            </p>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                      {/* Decorative accent */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-brand rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Natural Language Section */}
        <Card className="glass border-[hsl(var(--border))] rounded-3xl overflow-hidden shadow-[var(--shadow-brand)]">
          <CardHeader className="bg-gradient-to-r from-[hsl(var(--accent))]/5 to-[hsl(var(--accent-light))]/10 border-b border-[hsl(var(--border))] p-8">
            <CardTitle className="flex items-center gap-4 text-[hsl(var(--foreground))] text-2xl">
              <div className="w-12 h-12 bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-light))] rounded-2xl flex items-center justify-center shadow-[var(--shadow-brand)]">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold">Natural Language</h3>
                <p className="text-sm text-muted-foreground mt-1">Speak naturally, I'll understand!</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed">
                I understand natural language too! You can ask questions in your own words, and I'll help you navigate Elaview with ease.
              </p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-6 bg-gradient-to-r from-[hsl(var(--success))]/5 to-[hsl(var(--success))]/10 rounded-2xl border border-[hsl(var(--success))]/30">
                  <h4 className="font-bold text-[hsl(var(--success))] mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Example Queries
                  </h4>
                  <div className="space-y-2 text-sm text-[hsl(var(--success))]">
                    <p className="italic">"I need a billboard in downtown LA for my restaurant"</p>
                    <p className="italic">"What are the cheapest options available?"</p>
                    <p className="italic">"Show me digital displays with high foot traffic"</p>
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-r from-[hsl(var(--primary))]/5 to-[hsl(var(--accent))]/10 rounded-2xl border border-[hsl(var(--primary))]/30">
                  <h4 className="font-bold text-[hsl(var(--primary))] mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Smart Features
                  </h4>
                  <div className="space-y-2 text-sm text-[hsl(var(--primary))]">
                    <p>• Context-aware responses</p>
                    <p>• Page-specific guidance</p>
                    <p>• Smart navigation assistance</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tips Section */}
        <Card className="bg-gradient-to-r from-[hsl(var(--warning))]/5 to-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/30 rounded-3xl overflow-hidden shadow-[var(--shadow-brand)]">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[hsl(var(--warning))] to-[hsl(var(--warning))]/80 rounded-2xl flex items-center justify-center shadow-[var(--shadow-brand)] flex-shrink-0">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[hsl(var(--warning))] text-xl mb-3">
                  💡 Pro Tips for Better Results
                </h3>
                <div className="grid gap-3 md:grid-cols-2 text-sm text-[hsl(var(--warning))]">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[hsl(var(--warning))]" />
                    <span>Be specific about your location and budget</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[hsl(var(--warning))]" />
                    <span>Ask about campaign duration for better pricing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[hsl(var(--warning))]" />
                    <span>Mention your target audience for recommendations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[hsl(var(--warning))]" />
                    <span>Use quick actions for faster navigation</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}