import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X, Download, Share2, MapPin, Calendar, Eye, Target, Activity, BarChart3, Sparkles } from 'lucide-react';
import SpaceAnalytics from './SpaceAnalytics';

const AnalyticsModal = ({ isOpen, onClose, space }) => {
  if (!space) return null;

  const handleExport = () => {
    // Export functionality would go here
    console.log('Exporting analytics report for:', space.title);
  };

  const handleShare = () => {
    // Share functionality would go here
    console.log('Sharing analytics report for:', space.title);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] h-[95vh] flex flex-col glass-strong border-[hsl(var(--border))] rounded-3xl overflow-hidden shadow-[var(--shadow-brand-lg)] p-0">
        
        {/* Enhanced Header */}
        <DialogHeader className="bg-gradient-to-r from-[hsl(var(--muted))]/80 to-[hsl(var(--accent-light))]/30 border-b border-[hsl(var(--border))] p-8 m-0 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-[var(--shadow-brand-lg)]">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
                  Analytics Dashboard
                </DialogTitle>
                <DialogDescription className="text-lg text-muted-foreground flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-lg flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                  Comprehensive insights for "{space.title}"
                </DialogDescription>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleExport}
                className="glass hover:bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--primary))] rounded-2xl px-4 py-2 font-medium hover:shadow-[var(--shadow-brand)] transition-brand"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="glass hover:bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--primary))] rounded-2xl px-4 py-2 font-medium hover:shadow-[var(--shadow-brand)] transition-brand"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Report
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-10 h-10 p-0 hover:bg-[hsl(var(--destructive))]/10 rounded-full transition-brand"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Enhanced Space Info Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 glass-strong border border-[hsl(var(--border))] rounded-full shadow-sm">
              <div className="w-2 h-2 bg-[hsl(var(--success))] rounded-full animate-pulse"></div>
              <Target className="w-4 h-4 text-[hsl(var(--primary))]" />
              <span className="font-medium">Live Analytics</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 glass-strong border border-[hsl(var(--border))] rounded-full shadow-sm">
              <Calendar className="w-4 h-4 text-[hsl(var(--primary))]" />
              <span className="font-medium">Last 6 Months</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 glass-strong border border-[hsl(var(--border))] rounded-full shadow-sm">
              <Eye className="w-4 h-4 text-[hsl(var(--primary))]" />
              <span className="font-medium">Real-time Data</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[hsl(var(--accent))]/10 to-[hsl(var(--accent-light))]/20 rounded-full border border-[hsl(var(--accent))]/20 shadow-sm">
              <Sparkles className="w-4 h-4 text-[hsl(var(--accent))]" />
              <span className="font-medium text-[hsl(var(--accent))]">AI-Powered Insights</span>
            </div>
          </div>

          {/* Quick Stats Preview */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Traffic Score", value: `${space.traffic_score || 75}/100`, color: "text-[hsl(var(--primary))]" },
              { label: "Daily Rate", value: `$${space.pricing?.daily_rate || 100}`, color: "text-[hsl(var(--success))]" },
              { label: "Status", value: space.status || "Active", color: "text-[hsl(var(--accent))]" },
              { label: "Location Type", value: space.type?.replace('_', ' ') || "Premium", color: "text-[hsl(var(--warning))]" }
            ].map((stat, index) => (
              <div key={index} className="text-center p-3 glass-strong rounded-2xl border border-[hsl(var(--border))]">
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </DialogHeader>
        
        {/* Enhanced Content Area */}
        <div className="flex-1 overflow-hidden bg-gradient-to-br from-[hsl(var(--muted))]/30 to-[hsl(var(--accent-light))]/10">
          <ScrollArea className="h-full">
            <div className="p-8">
              <SpaceAnalytics space={space} />
            </div>
          </ScrollArea>
        </div>
        
        {/* Enhanced Footer */}
        <div className="bg-gradient-to-r from-[hsl(var(--muted))]/80 to-[hsl(var(--secondary))]/20 border-t border-[hsl(var(--border))] p-6 rounded-b-3xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[hsl(var(--success))] rounded-full animate-pulse"></div>
                <Activity className="w-4 h-4" />
                <span>Data updated 2 minutes ago</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-[hsl(var(--border))]"></div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Report generated on {new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="glass hover:bg-[hsl(var(--card))] border-[hsl(var(--border))] rounded-2xl px-4 py-2 font-medium hover:shadow-[var(--shadow-brand)] transition-brand"
              >
                Schedule Report
              </Button>
              <Button
                onClick={onClose}
                className="btn-gradient rounded-2xl px-6 py-2 font-bold shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand hover:-translate-y-0.5"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnalyticsModal;