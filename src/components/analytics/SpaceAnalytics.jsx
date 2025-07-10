import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Eye, DollarSign, Calendar, MapPin, Star, Target } from 'lucide-react';

// Mock analytics data generator
const generateAnalyticsData = (space) => {
  const baseTraffic = space.traffic_score || 75;
  const monthlyData = [];
  const hourlyData = [];
  const demographicData = [];
  
  // Generate monthly performance data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  months.forEach((month, index) => {
    monthlyData.push({
      month,
      impressions: Math.floor((baseTraffic * 1000) + (Math.random() * 500)),
      engagement: Math.floor(baseTraffic * 0.8 + (Math.random() * 20)),
      revenue: Math.floor((space.pricing?.daily_rate || 100) * 30 * (0.8 + Math.random() * 0.4))
    });
  });
  
  // Generate hourly traffic pattern
  for (let hour = 0; hour < 24; hour++) {
    let traffic = baseTraffic;
    
    // Simulate realistic traffic patterns
    if (hour >= 7 && hour <= 9) traffic *= 1.5; // Morning rush
    if (hour >= 17 && hour <= 19) traffic *= 1.7; // Evening rush
    if (hour >= 22 || hour <= 5) traffic *= 0.3; // Late night/early morning
    
    hourlyData.push({
      hour: `${hour}:00`,
      traffic: Math.floor(traffic + (Math.random() * 20))
    });
  }
  
  // Generate demographic data
  demographicData.push(
    { name: 'Adults 25-45', value: 40, color: 'hsl(var(--chart-1))' },
    { name: 'Young Adults 18-25', value: 25, color: 'hsl(var(--chart-2))' },
    { name: 'Adults 45-65', value: 20, color: 'hsl(var(--chart-3))' },
    { name: 'Seniors 65+', value: 10, color: 'hsl(var(--chart-4))' },
    { name: 'Teens 13-18', value: 5, color: 'hsl(var(--chart-5))' }
  );
  
  return { monthlyData, hourlyData, demographicData };
};

export default function SpaceAnalytics({ space }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  
  useEffect(() => {
    if (space) {
      setAnalyticsData(generateAnalyticsData(space));
    }
  }, [space]);
  
  if (!space || !analyticsData) {
    return <div className="p-4 text-center">Loading analytics...</div>;
  }
  
  const { monthlyData, hourlyData, demographicData } = analyticsData;
  
  const totalImpressions = monthlyData.reduce((sum, data) => sum + data.impressions, 0);
  const avgEngagement = monthlyData.reduce((sum, data) => sum + data.engagement, 0) / monthlyData.length;
  const totalRevenue = monthlyData.reduce((sum, data) => sum + data.revenue, 0);
  const projectedAnnualRevenue = totalRevenue * 2; // 6 months * 2
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[hsl(var(--muted))]/80 to-[hsl(var(--accent-light))]/30 p-6 rounded-2xl border border-[hsl(var(--border))]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">{space.title}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{space.type?.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>${space.pricing?.daily_rate}/day</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>{space.traffic_score}/100 Traffic Score</span>
              </div>
            </div>
          </div>
          <Badge className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]">
            {space.status}
          </Badge>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-[hsl(var(--primary))]/10 to-[hsl(var(--primary))]/5 border-[hsl(var(--primary))]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--primary))]">Total Impressions</p>
                <p className="text-3xl font-bold text-[hsl(var(--primary))]">{totalImpressions.toLocaleString()}</p>
                <p className="text-xs text-[hsl(var(--primary))]/70">Last 6 months</p>
              </div>
              <Eye className="w-8 h-8 text-[hsl(var(--primary))]" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-[hsl(var(--success))]/10 to-[hsl(var(--success))]/5 border-[hsl(var(--success))]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--success))]">Avg Engagement</p>
                <p className="text-3xl font-bold text-[hsl(var(--success))]">{Math.round(avgEngagement)}%</p>
                <p className="text-xs text-[hsl(var(--success))]/70">Monthly average</p>
              </div>
              <Target className="w-8 h-8 text-[hsl(var(--success))]" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-[hsl(var(--accent))]/10 to-[hsl(var(--accent))]/5 border-[hsl(var(--accent))]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--accent))]">Revenue (6mo)</p>
                <p className="text-3xl font-bold text-[hsl(var(--accent))]">${totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-[hsl(var(--accent))]/70">Actual earnings</p>
              </div>
              <DollarSign className="w-8 h-8 text-[hsl(var(--accent))]" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-[hsl(var(--warning))]/10 to-[hsl(var(--warning))]/5 border-[hsl(var(--warning))]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--warning))]">Projected Annual</p>
                <p className="text-3xl font-bold text-[hsl(var(--warning))]">${projectedAnnualRevenue.toLocaleString()}</p>
                <p className="text-xs text-[hsl(var(--warning))]/70">Based on trend</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[hsl(var(--warning))]" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <Card className="card-brand">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[hsl(var(--foreground))]">
              <BarChart className="w-5 h-5" />
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="impressions" fill="hsl(var(--chart-1))" name="Impressions" />
                <Bar dataKey="revenue" fill="hsl(var(--chart-2))" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Hourly Traffic Pattern */}
        <Card className="card-brand">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[hsl(var(--foreground))]">
              <Users className="w-5 h-5" />
              Daily Traffic Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="traffic" stroke="hsl(var(--chart-1))" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-brand">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[hsl(var(--foreground))]">
              <Users className="w-5 h-5" />
              Audience Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={demographicData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="hsl(var(--chart-1))"
                  dataKey="value"
                >
                  {demographicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Insights & Recommendations */}
        <Card className="bg-gradient-to-br from-[hsl(var(--accent))]/10 to-[hsl(var(--accent-light))]/20 border-[hsl(var(--accent))]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[hsl(var(--accent))]">
              <TrendingUp className="w-5 h-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 glass-strong rounded-lg">
              <h4 className="font-semibold text-[hsl(var(--success))] mb-2">✅ Strong Performance</h4>
              <p className="text-sm text-muted-foreground">Your traffic score of {space.traffic_score}/100 is above average for {space.type?.replace('_', ' ')} spaces.</p>
            </div>
            
            <div className="p-4 glass-strong rounded-lg">
              <h4 className="font-semibold text-[hsl(var(--primary))] mb-2">📈 Peak Hours</h4>
              <p className="text-sm text-muted-foreground">Highest engagement occurs during 5-7 PM. Consider premium pricing during these hours.</p>
            </div>
            
            <div className="p-4 glass-strong rounded-lg">
              <h4 className="font-semibold text-[hsl(var(--accent))] mb-2">🎯 Target Audience</h4>
              <p className="text-sm text-muted-foreground">Primary audience is adults 25-45. Consider content that appeals to working professionals.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}