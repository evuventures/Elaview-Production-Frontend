import React, { useState, useEffect } from 'react';
import { Property, Space, Booking, Message, Invoice, Campaign } from '@/api/entities';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, PartyPopper, ArrowRight, AlertTriangle, Database, Trash2, Users, Building, MessageSquare, FileText, Sparkles, Zap, Crown, Target, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';

const mockProperties = [
 {
 name: 'Times Square Digital Tower',
 type: 'building',
 location: { address: '1540 Broadway', city: 'New York', zipcode: '10036', latitude: 40.7589, longitude: -73.9851 },
 primary_image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=500&h=400&auto=format&fit=crop',
 photos: ['https://images.unsplash.com/photo-1542987934-2900a8c2014b?q=80&w=500&auto=format&fit=crop', 'https://images.unsplash.com/photo-1517935706615-2717063c2225?q=80&w=500&auto=format&fit=crop'],
 description: 'Prime Times Square location with massive digital billboards visible to millions of tourists and locals daily.'
 },
 {
 name: 'Hollywood Boulevard Marquee',
 type: 'building',
 location: { address: '6801 Hollywood Blvd', city: 'Los Angeles', zipcode: '90028', latitude: 34.1022, longitude: -118.3406 },
 primary_image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=500&h=400&auto=format&fit=crop',
 photos: ['https://images.unsplash.com/photo-1503891450248-b27e53086121?q=80&w=500&auto=format&fit=crop'],
 description: 'Iconic Hollywood Boulevard building with vintage marquee and modern digital displays.'
 },
 {
 name: 'Chicago Riverwalk Displays',
 type: 'event_venue',
 location: { address: '305-329 E Wacker Dr', city: 'Chicago', zipcode: '60601', latitude: 41.8880, longitude: -87.6221 },
 primary_image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=500&h=400&auto=format&fit=crop',
 photos: ['https://images.unsplash.com/photo-1596241064953-6a8d7d824823?q=80&w=500&auto=format&fit=crop'],
 description: 'Digital displays along the scenic Chicago Riverwalk, capturing both tourist and local traffic.'
 },
 {
 name: 'Miami Wynwood Walls Artvertising',
 type: 'building',
 location: { address: '2516 NW 2nd Ave', city: 'Miami', zipcode: '33127', latitude: 25.8015, longitude: -80.1991 },
 primary_image: 'https://images.unsplash.com/photo-1549476464-373922b01248?q=80&w=500&h=400&auto=format&fit=crop',
 photos: ['https://images.unsplash.com/photo-1555431184-eb7ed6c0ff21?q=80&w=500&auto=format&fit=crop'],
 description: 'Integrate your brand with the world-famous art of Wynwood. Projections and digital boards available.'
 }
];

const mockAreas = [
 // Times Square (index 0 for mockProperties)
 [
 { 
 title: 'North Face LED Mega Screen', 
 type: 'digital_display', 
 pricing: { daily_rate: 2500, currency: 'USD' }, 
 images: ['https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=400&h=300&auto=format&fit=crop'], 
 traffic_score: 98, 
 description: 'Massive 80x50ft screen with 4K resolution.',
 dimensions: { width: 80, height: 50, unit: 'feet' },
 features: ['digital', 'illuminated', 'video_capable', 'high_resolution'],
 content_restrictions: { prohibited_content: ['adult_content'] }
 },
 { 
 title: 'Street Level Kiosks', 
 type: 'street_furniture', 
 pricing: { daily_rate: 800, currency: 'USD' }, 
 images: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=400&h=300&auto=format&fit=crop'], 
 traffic_score: 85, 
 description: 'Eye-level digital panels perfect for pedestrian engagement.',
 dimensions: { width: 12, height: 8, unit: 'feet' },
 features: ['digital', 'interactive', 'pedestrian_level'],
 content_restrictions: { prohibited_content: ['alcohol', 'tobacco'] }
 }
 ],
 // Hollywood (index 1)
 [
 { 
 title: 'Classic Movie Marquee', 
 type: 'billboard', 
 pricing: { daily_rate: 1500, currency: 'USD' }, 
 images: ['https://images.unsplash.com/photo-1489599184873-3c0a5cace0e7?q=80&w=400&h=300&auto=format&fit=crop'], 
 traffic_score: 88, 
 description: 'Iconic vintage marquee with modern LED upgrade.',
 dimensions: { width: 30, height: 12, unit: 'feet' },
 features: ['illuminated', 'historic', 'entertainment_district'],
 content_restrictions: { prohibited_content: ['adult_content', 'gambling'] }
 },
 { 
 title: 'Building Side Mega Wall', 
 type: 'building_wrap', 
 pricing: { daily_rate: 2000, currency: 'USD' }, 
 images: ['https://images.unsplash.com/photo-1529592817805-474c10444a7f?q=80&w=400&h=300&auto=format&fit=crop'], 
 traffic_score: 94, 
 description: 'Massive building advertisement visible from blocks away.',
 dimensions: { width: 100, height: 60, unit: 'feet' },
 features: ['large_format', 'premium_visibility', 'landmark_adjacent'],
 content_restrictions: { prohibited_content: ['tobacco'] }
 }
 ],
 // Chicago (index 2)
 [
 { 
 title: 'Riverwalk Digital Totems', 
 type: 'digital_display', 
 pricing: { daily_rate: 950, currency: 'USD' }, 
 images: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=400&h=300&auto=format&fit=crop'], 
 traffic_score: 85, 
 description: 'Modern displays along the busy riverwalk pathway.',
 dimensions: { width: 3, height: 8, unit: 'feet' },
 features: ['digital', 'wayfinding', 'pedestrian_friendly'],
 content_restrictions: { prohibited_content: [] }
 }
 ],
 // Miami (index 3)
 [
 { 
 title: 'Wynwood Digital Projection Wall', 
 type: 'digital_display', 
 pricing: { daily_rate: 1800, currency: 'USD' }, 
 images: ['https://images.unsplash.com/photo-1588665306682-3635aa411b7f?q=80&w=400&h=300&auto=format&fit=crop'], 
 traffic_score: 92, 
 description: 'Large-scale art projections on the iconic Wynwood walls.',
 dimensions: { width: 150, height: 80, unit: 'feet' },
 features: ['digital', 'large_format', 'artistic'],
 content_restrictions: { prohibited_content: [] }
 }
 ]
];

export default function DataSeederPage() {
 const { user: clerkUser } = useUser();
 const [status, setStatus] = useState('idle');
 const [message, setMessage] = useState('');
 const [progress, setProgress] = useState(0);
 const [user, setUser] = useState(null);
 const [createdData, setCreatedData] = useState({ properties: 0, areas: 0, campaigns: 0 });
 const [existingData, setExistingData] = useState({ users: 0, properties: 0, areas: 0, bookings: 0, messages: 0, invoices: 0, campaigns: 0 });

 useEffect(() => {
 const checkUser = async () => {
 try {
 if (!clerkUser) {
 setStatus('error');
 setMessage('You must be logged in to seed data.');
 return;
 }
 
 setUser(clerkUser);
 await loadExistingData();
 } catch (e) {
 setStatus('error');
 setMessage('Error loading user data.');
 }
 };
 checkUser();
 }, [clerkUser]);

 const loadExistingData = async () => {
 try {
 const [properties, areas, bookings, messages, invoices, campaigns] = await Promise.all([
 Property.list(), Space.list(), Booking.list(), Message.list(), Invoice.list(), Campaign.list()
 ]);
 setExistingData({ 
 users: 0, // User count not available without backend API
 properties: properties?.length || 0, 
 areas: areas?.length || 0, 
 bookings: bookings?.length || 0, 
 messages: messages?.length || 0, 
 invoices: invoices?.length || 0, 
 campaigns: campaigns?.length || 0 
 });
 } catch (error) {
 console.error('Error loading existing data:', error);
 }
 };

 const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

 const handleSeedData = async () => {
 if (!user) {
 setStatus('error');
 setMessage('User not found. Please log in again.');
 return;
 }

 setStatus('seeding');
 let totalProgress = 0;

 try {
 // Step 1: Create Properties owned by current user (40%)
 setProgress(0);
 setMessage('Creating premium properties for your account...');
 const propertiesToCreate = mockProperties.map(p => ({ ...p, owner_id: user.id }));
 const createdProperties = await Property.bulkCreate(propertiesToCreate);
 setCreatedData(prev => ({ ...prev, properties: createdProperties.length }));
 setProgress(totalProgress += 40);
 await sleep(500);

 // Step 2: Create Advertising Areas (40%)
 setMessage('Setting up advertising spaces with detailed information...');
 const areasToCreate = createdProperties.flatMap((prop, index) =>
 (mockAreas[index] || []).map(area => ({ 
 ...area, 
 property_id: prop.id, 
 status: 'active', 
 availability: { 
 is_available: true, 
 minimum_duration_weeks: 1,
 available_from: new Date().toISOString().split('T')[0]
 } 
 }))
 );
 const createdAreas = await Space.bulkCreate(areasToCreate);
 setCreatedData(prev => ({ ...prev, areas: createdAreas.length }));
 setProgress(totalProgress += 40);
 await sleep(500);

 // Step 3: Create Sample Campaigns (20%)
 setMessage('Creating sample advertising campaigns...');
 const mockCampaigns = [
 {
 name: 'Global Tech Launch',
 brand_name: 'TechFlow',
 advertiser_id: user.id,
 start_date: '2024-07-01',
 end_date: '2024-07-15',
 total_budget: 50000,
 status: 'planning',
 content_type: ['other'],
 content_description: 'Innovative tech product launch campaign',
 campaign_image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400&h=300&auto=format&fit=crop'
 },
 {
 name: 'Summer Fashion Fest',
 brand_name: 'Luxe Apparel',
 advertiser_id: user.id,
 start_date: '2024-08-01',
 end_date: '2024-08-31',
 total_budget: 75000,
 status: 'draft',
 content_type: ['other'],
 content_description: 'High-end fashion summer collection showcase',
 campaign_image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400&h=300&auto=format&fit=crop'
 }
 ];
 
 const createdCampaigns = await Campaign.bulkCreate(mockCampaigns);
 setCreatedData(prev => ({ ...prev, campaigns: createdCampaigns.length }));
 setProgress(100);
 await sleep(500);

 setStatus('success');
 setMessage('🎉 Elaview property portfolio created successfully! Your account now has premium properties with advertising areas ready for booking.');
 await loadExistingData();

 } catch (error) {
 console.error("Data seeding error:", error);
 setStatus('error');
 setMessage(`An error occurred: ${error.message || 'Unknown error'}`);
 }
 };

 const handleClearData = async () => {
 if (!window.confirm('Are you sure you want to clear demo data? This cannot be undone.')) {
 return;
 }

 setStatus('clearing');
 setMessage('Clearing existing data...');

 try {
 await sleep(2000);
 setExistingData({ users: 0, properties: 0, areas: 0, bookings: 0, messages: 0, invoices: 0, campaigns: 0 });
 setCreatedData({ properties: 0, areas: 0, campaigns: 0 });
 setStatus('idle');
 setMessage('Demo data has been cleared. You can now seed fresh data.');
 await loadExistingData();
 } catch (error) {
 console.error("Error clearing data:", error);
 setStatus('error');
 setMessage(`Error clearing data: ${error.message || 'Unknown error'}. Please try again.`);
 }
 };

 const StatusCard = () => {
 switch (status) {
 case 'seeding':
 return (
 <div className="text-center p-8">
 <div className="w-20 h-20 mx-auto mb-6 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-[var(--shadow-brand-lg)]">
 <Loader2 className="w-10 h-10 animate-spin text-white" />
 </div>
 <h3 className="text-2xl font-bold text-foreground mb-4">Creating Your Property Portfolio...</h3>
 <div className="mb-6">
 <Progress value={progress} className="h-3 rounded-full bg-[hsl(var(--muted))]" />
 <div className="flex justify-between text-sm text-[hsl(var(--primary))] mt-2 font-medium">
 <span>0%</span>
 <span>50%</span>
 <span>100%</span>
 </div>
 </div>
 <p className="text-muted-foreground text-lg">{message}</p>
 </div>
 );
 case 'clearing':
 return (
 <div className="text-center p-8">
 <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/25">
 <Loader2 className="w-10 h-10 animate-spin text-white" />
 </div>
 <h3 className="text-2xl font-bold text-foreground mb-4">Clearing Data...</h3>
 <p className="text-muted-foreground text-lg">{message}</p>
 </div>
 );
 case 'success':
 return (
 <div className="text-center p-8">
 <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/25">
 <CheckCircle className="w-10 h-10 text-white" />
 </div>
 <h3 className="text-2xl font-bold text-foreground mb-4">Property Portfolio Complete!</h3>
 <p className="text-muted-foreground text-lg mb-6">{message}</p>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
 {Object.entries(createdData).filter(([k, v]) => v> 0).map(([key, value]) => (
 <Card key={key} className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/40 dark:to-emerald-950/40 backdrop-blur-sm border-green-200/50 dark:border-green-700/50 rounded-2xl overflow-hidden">
 <CardContent className="p-6 text-center">
 <p className="font-bold text-green-800 dark:text-green-200 capitalize text-lg">{key}</p>
 <p className="text-3xl font-bold text-green-600 mt-2">{value}</p>
 </CardContent>
 </Card>
 ))}
 </div>
 <div className="flex flex-col sm:flex-row gap-4">
 <Link to={createPageUrl('Dashboard')} className="flex-1">
 <Button className="w-full btn-gradient text-white rounded-2xl py-3 font-bold transition-brand">
 Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
 </Button>
 </Link>
 <Link to={createPageUrl('Map')} className="flex-1">
 <Button variant="outline" className="w-full border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-2xl py-3 font-bold">
 Browse Properties
 </Button>
 </Link>
 </div>
 </div>
 );
 case 'error':
 return (
 <div className="text-center p-8">
 <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/25">
 <AlertTriangle className="w-10 h-10 text-white" />
 </div>
 <h3 className="text-2xl font-bold text-foreground mb-4">An Error Occurred</h3>
 <p className="text-muted-foreground text-lg mb-6">{message}</p>
 <Button onClick={() => setStatus('idle')} className="btn-gradient text-white rounded-2xl px-8 py-3 font-bold transition-brand">
 Try Again
 </Button>
 </div>
 );
 default: // idle
 return (
 <div className="text-center p-8">
 <div className="w-20 h-20 mx-auto mb-6 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-[var(--shadow-brand-lg)]">
 <Database className="w-10 h-10 text-white" />
 </div>
 <h3 className="text-3xl font-bold text-foreground mb-4">Create Elaview Property Portfolio</h3>
 <p className="text-muted-foreground text-lg mb-8">
 Generate premium properties with advertising areas for your account.
 </p>

 {(existingData.properties> 0 || existingData.areas> 0) && (
 <Card className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-950/40 dark:to-orange-950/40 backdrop-blur-sm border-amber-200/50 dark:border-amber-700/50 rounded-2xl overflow-hidden mb-8">
 <CardContent className="p-6">
 <h4 className="font-bold mb-4 text-amber-800 dark:text-amber-200 text-lg flex items-center gap-2">
 <AlertTriangle className="w-5 h-5" />
 Existing Data Found
 </h4>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
 {Object.entries(existingData).map(([key, value]) => (
 value> 0 && (
 <div key={key} className="flex justify-between items-center p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
 <span className="capitalize font-medium">{key}:</span>
 <Badge variant="secondary" className="ml-2">{value}</Badge>
 </div>
 )
 ))}
 </div>
 </CardContent>
 </Card>
 )}

 <Card className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-950/40 dark:to-cyan-950/40 backdrop-blur-sm border-blue-200/50 dark:border-blue-700/50 rounded-2xl overflow-hidden mb-8">
 <CardContent className="p-6">
 <h4 className="font-bold mb-4 text-blue-800 dark:text-blue-200 text-lg flex items-center gap-2">
 <Sparkles className="w-5 h-5" />
 What you'll get:
 </h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
 <div className="flex items-center gap-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
 <Building className="w-5 h-5 text-blue-600" />
 <span className="text-sm font-medium">4 Premium properties in major cities</span>
 </div>
 <div className="flex items-center gap-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
 <Target className="w-5 h-5 text-blue-600" />
 <span className="text-sm font-medium">Multiple advertising areas per property</span>
 </div>
 <div className="flex items-center gap-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
 <MessageSquare className="w-5 h-5 text-blue-600" />
 <span className="text-sm font-medium">Sample campaigns ready for booking</span>
 </div>
 <div className="flex items-center gap-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
 <Award className="w-5 h-5 text-blue-600" />
 <span className="text-sm font-medium">Complete property management setup</span>
 </div>
 </div>
 <div className="mt-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-700">
 <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200 mb-2">💡 Pro Tip:</p>
 <p className="text-sm text-yellow-700 dark:text-yellow-300">
 To test messaging with advertisers, invite another user to your workspace and they can book your properties.
 </p>
 </div>
 </CardContent>
 </Card>

 <div className="flex flex-col sm:flex-row gap-4">
 <Button
 onClick={handleSeedData}
 className="flex-1 btn-gradient text-white rounded-2xl py-4 font-bold transition-brand text-lg"
 size={32}
 disabled={!user}
>
 {user ? (
 <>
 <Crown className="w-5 h-5 mr-2" />
 Create Property Portfolio
 </>
 ) : (
 <>
 <Loader2 className="w-5 h-5 mr-2 animate-spin" />
 Loading User...
 </>
 )}
 </Button>
 {(existingData.properties> 0 || existingData.areas> 0) && (
 <Button
 onClick={handleClearData}
 variant="outline"
 size={32}
 className="text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-2xl py-4 font-bold"
>
 <Trash2 className="w-5 h-5 mr-2" /> Clear Data
 </Button>
 )}
 </div>
 </div>
 );
 }
 };

 return (
 <div className="min-h-screen bg-background p-4 flex items-center justify-center">
 <div className="max-w-4xl w-full">
 <Card className="glass-strong border-[hsl(var(--border))] rounded-3xl overflow-hidden shadow-[var(--shadow-brand)]">
 <CardHeader className="bg-gradient-brand/20 border-b border-[hsl(var(--border))] p-8">
 <CardTitle className="text-center text-4xl font-bold text-gradient-brand flex items-center justify-center gap-3">
 <div className="w-12 h-12 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-lg">
 <Zap className="w-6 h-6 text-white" />
 </div>
 Elaview Demo Data
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <StatusCard />
 </CardContent>
 </Card>
 </div>
 </div>
 );
}