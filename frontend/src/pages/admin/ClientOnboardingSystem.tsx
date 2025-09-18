// src/pages/admin/ClientOnboardingSystem.tsx
import React, { useState, useEffect } from 'react';
import { 
 Plus, Users, Building2, MapPin, DollarSign, Upload,
 ChevronLeft, ChevronRight, Eye, Edit3, Trash2, Copy,
 Mail, Phone, CheckCircle, AlertCircle, Clock, User,
 FileText, Camera, Tag, Ruler, Settings, Star
} from 'lucide-react';

export default function ClientOnboardingSystem() {
 const [activeTab, setActiveTab] = useState('onboard');
 const [clients, setClients] = useState([]);
 const [loading, setLoading] = useState(false);
 const [showOnboardingModal, setShowOnboardingModal] = useState(false);
 const [selectedClient, setSelectedClient] = useState(null);
 const [stats, setStats] = useState({
 totalClients: 0,
 pendingSetup: 0,
 activeClients: 0,
 totalSpaces: 0
 });

 useEffect(() => {
 fetchClients();
 fetchStats();
 }, []);

 const fetchClients = async () => {
 try {
 setLoading(true);
 console.log('👥 Fetching clients...');
 
 // Mock clients data
 const mockClients = [
 {
 id: 'client1',
 businessName: 'Downtown Coffee Co.',
 contactName: 'Sarah Johnson',
 email: 'sarah@downtowncoffee.com',
 phone: '(555) 123-4567',
 address: '123 Main Street, Los Angeles, CA 90210',
 status: 'active',
 createdAt: '2025-01-15T10:00:00Z',
 properties: [
 {
 id: 'prop1',
 title: 'Downtown Coffee - Storefront',
 address: '123 Main Street',
 spaceCount: 2,
 totalRevenue: 450
 }
 ],
 notes: 'Premium client - high visibility location'
 },
 {
 id: 'client2',
 businessName: 'Sunset Mall',
 contactName: 'Mike Chen',
 email: 'mike@sunsetmall.com',
 phone: '(555) 987-6543',
 address: '456 Sunset Blvd, Beverly Hills, CA 90210',
 status: 'pending_setup',
 createdAt: '2025-01-16T14:30:00Z',
 properties: [],
 notes: 'Large mall - multiple advertising opportunities'
 },
 {
 id: 'client3',
 businessName: 'Metro Transit Authority',
 contactName: 'Jennifer Martinez',
 email: 'j.martinez@metro.gov',
 phone: '(555) 456-7890',
 address: '789 Transit Ave, Los Angeles, CA 90012',
 status: 'active',
 createdAt: '2025-01-12T09:15:00Z',
 properties: [
 {
 id: 'prop2',
 title: 'Metro Station - Platform A',
 address: '789 Transit Ave',
 spaceCount: 5,
 totalRevenue: 1250
 },
 {
 id: 'prop3',
 title: 'Metro Station - Platform B',
 address: '789 Transit Ave',
 spaceCount: 3,
 totalRevenue: 750
 }
 ],
 notes: 'Government client - requires special compliance'
 }
 ];

 setClients(mockClients);
 console.log('✅ Clients loaded:', mockClients.length);
 } catch (error) {
 console.error('❌ Failed to fetch clients:', error);
 } finally {
 setLoading(false);
 }
 };

 const fetchStats = async () => {
 try {
 const totalClients = clients.length;
 const pendingSetup = clients.filter(c => c.status === 'pending_setup').length;
 const activeClients = clients.filter(c => c.status === 'active').length;
 const totalSpaces = clients.reduce((sum, c) => sum + c.properties.reduce((pSum, p) => pSum + p.spaceCount, 0), 0);
 
 setStats({
 totalClients,
 pendingSetup,
 activeClients,
 totalSpaces
 });
 } catch (error) {
 console.error('❌ Failed to fetch stats:', error);
 setStats({
 totalClients: 3,
 pendingSetup: 1,
 activeClients: 2,
 totalSpaces: 10
 });
 }
 };

 const handleCreateClient = async (clientData) => {
 try {
 console.log('➕ Creating new client:', clientData);
 
 const newClient = {
 id: Date.now().toString(),
 ...clientData,
 status: 'pending_setup',
 createdAt: new Date().toISOString(),
 properties: []
 };
 
 setClients(prev => [...prev, newClient]);
 setShowOnboardingModal(false);
 fetchStats();
 console.log('✅ Client created successfully');
 } catch (error) {
 console.error('❌ Failed to create client:', error);
 alert('Failed to create client');
 }
 };

 const getStatusBadge = (status) => {
 const badges = {
 'pending_setup': {
 color: 'bg-yellow-100 text-yellow-700',
 icon: Clock,
 text: 'Pending Setup'
 },
 'active': {
 color: 'bg-green-100 text-green-700',
 icon: CheckCircle,
 text: 'Active'
 },
 'inactive': {
 color: 'bg-gray-100 text-gray-700',
 icon: AlertCircle,
 text: 'Inactive'
 }
 };
 
 const badge = badges[status] || badges['pending_setup'];
 return (
 <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
 <badge.icon className="w-3 h-3" />
 {badge.text}
 </span>
 );
 };

 const formatCurrency = (amount) => {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD'
 }).format(amount);
 };

 const formatDate = (dateString) => {
 return new Date(dateString).toLocaleDateString('en-US', {
 month: 'short',
 day: 'numeric',
 year: 'numeric'
 });
 };

 const OnboardingModal = () => {
 const [step, setStep] = useState(1);
 const [formData, setFormData] = useState({
 // Client Information
 businessName: '',
 contactName: '',
 email: '',
 phone: '',
 address: '',
 city: '',
 state: 'CA',
 zipCode: '',
 website: '',
 businessType: 'retail',
 notes: '',
 
 // Property Information
 properties: [{
 title: '',
 description: '',
 address: '',
 propertyType: 'COMMERCIAL',
 spaces: [{
 name: '',
 type: 'storefront_window',
 dimensions: '',
 basePrice: '',
 surfaceType: 'WINDOW_GLASS',
 accessDifficulty: 1,
 materialCompatibility: ['ADHESIVE_VINYL'],
 description: ''
 }]
 }]
 });

 const handleNext = () => {
 if (step < 3) setStep(step + 1);
 };

 const handlePrev = () => {
 if (step> 1) setStep(step - 1);
 };

 const handleSubmit = () => {
 if (!formData.businessName || !formData.contactName || !formData.email) {
 alert('Please fill in all required client information');
 return;
 }
 handleCreateClient(formData);
 };

 const addProperty = () => {
 setFormData({
 ...formData,
 properties: [...formData.properties, {
 title: '',
 description: '',
 address: '',
 propertyType: 'COMMERCIAL',
 spaces: [{
 name: '',
 type: 'storefront_window',
 dimensions: '',
 basePrice: '',
 surfaceType: 'WINDOW_GLASS',
 accessDifficulty: 1,
 materialCompatibility: ['ADHESIVE_VINYL'],
 description: ''
 }]
 }]
 });
 };

 const addSpace = (propertyIndex) => {
 const updatedProperties = [...formData.properties];
 updatedProperties[propertyIndex].spaces.push({
 name: '',
 type: 'storefront_window',
 dimensions: '',
 basePrice: '',
 surfaceType: 'WINDOW_GLASS',
 accessDifficulty: 1,
 materialCompatibility: ['ADHESIVE_VINYL'],
 description: ''
 });
 setFormData({ ...formData, properties: updatedProperties });
 };

 return (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
 <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
 <div className="p-6 border-b border-gray-200">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-xl font-semibold text-gray-900">Client Onboarding</h2>
 <p className="text-sm text-gray-600">Step {step} of 3 - Set up a new client and their advertising spaces</p>
 </div>
 <button onClick={() => setShowOnboardingModal(false)} className="text-gray-400 hover:text-gray-600">
 <ChevronLeft className="w-6 h-6" />
 </button>
 </div>
 
 {/* Progress Bar */}
 <div className="mt-4">
 <div className="flex items-center">
 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
 step>= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
 }`}>
 1
 </div>
 <div className={`flex-1 h-1 mx-2 ${step>= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
 step>= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
 }`}>
 2
 </div>
 <div className={`flex-1 h-1 mx-2 ${step>= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
 step>= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
 }`}>
 3
 </div>
 </div>
 <div className="flex justify-between mt-2 text-xs text-gray-600">
 <span>Client Info</span>
 <span>Properties</span>
 <span>Review</span>
 </div>
 </div>
 </div>
 
 <div className="p-6">
 {/* Step 1: Client Information */}
 {step === 1 && (
 <div className="space-y-4">
 <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
 
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Business Name *
 </label>
 <input
 type="text"
 value={formData.businessName}
 onChange={(e) => setFormData({...formData, businessName: e.target.value})}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 required
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Contact Name *
 </label>
 <input
 type="text"
 value={formData.contactName}
 onChange={(e) => setFormData({...formData, contactName: e.target.value})}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 required
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Email *
 </label>
 <input
 type="email"
 value={formData.email}
 onChange={(e) => setFormData({...formData, email: e.target.value})}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 required
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Phone
 </label>
 <input
 type="tel"
 value={formData.phone}
 onChange={(e) => setFormData({...formData, phone: e.target.value})}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Business Address
 </label>
 <input
 type="text"
 value={formData.address}
 onChange={(e) => setFormData({...formData, address: e.target.value})}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 placeholder="Street address"
 />
 </div>

 <div className="grid grid-cols-3 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 City
 </label>
 <input
 type="text"
 value={formData.city}
 onChange={(e) => setFormData({...formData, city: e.target.value})}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 State
 </label>
 <select
 value={formData.state}
 onChange={(e) => setFormData({...formData, state: e.target.value})}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
 <option value="CA">California</option>
 <option value="NY">New York</option>
 <option value="TX">Texas</option>
 <option value="FL">Florida</option>
 </select>
 </div>
 
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 ZIP Code
 </label>
 <input
 type="text"
 value={formData.zipCode}
 onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Website
 </label>
 <input
 type="url"
 value={formData.website}
 onChange={(e) => setFormData({...formData, website: e.target.value})}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 placeholder="https://..."
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Business Type
 </label>
 <select
 value={formData.businessType}
 onChange={(e) => setFormData({...formData, businessType: e.target.value})}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
 <option value="retail">Retail</option>
 <option value="restaurant">Restaurant</option>
 <option value="office">Office Building</option>
 <option value="transit">Transit Authority</option>
 <option value="mall">Shopping Mall</option>
 <option value="other">Other</option>
 </select>
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Notes
 </label>
 <textarea
 value={formData.notes}
 onChange={(e) => setFormData({...formData, notes: e.target.value})}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 rows={3}
 placeholder="Any additional notes about this client..."
 />
 </div>
 </div>
 )}

 {/* Step 2: Properties & Spaces */}
 {step === 2 && (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <h3 className="text-lg font-medium text-gray-900">Properties & Advertising Spaces</h3>
 <button
 onClick={addProperty}
 className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 inline-flex items-center gap-1"
>
 <Plus className="w-3 h-3" />
 Add Property
 </button>
 </div>

 {formData.properties.map((property, propertyIndex) => (
 <div key={propertyIndex} className="border border-gray-200 rounded-lg p-4">
 <h4 className="font-medium text-gray-900 mb-3">Property {propertyIndex + 1}</h4>
 
 <div className="grid grid-cols-2 gap-4 mb-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Property Title
 </label>
 <input
 type="text"
 value={property.title}
 onChange={(e) => {
 const updatedProperties = [...formData.properties];
 updatedProperties[propertyIndex].title = e.target.value;
 setFormData({ ...formData, properties: updatedProperties });
 }}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 placeholder="e.g., Downtown Coffee - Main Location"
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Property Type
 </label>
 <select
 value={property.propertyType}
 onChange={(e) => {
 const updatedProperties = [...formData.properties];
 updatedProperties[propertyIndex].propertyType = e.target.value;
 setFormData({ ...formData, properties: updatedProperties });
 }}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
 <option value="COMMERCIAL">Commercial</option>
 <option value="RETAIL">Retail</option>
 <option value="OFFICE">Office</option>
 <option value="BILLBOARD">Billboard</option>
 <option value="TRANSIT_STATION">Transit Station</option>
 </select>
 </div>
 </div>

 <div className="mb-4">
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Property Address
 </label>
 <input
 type="text"
 value={property.address}
 onChange={(e) => {
 const updatedProperties = [...formData.properties];
 updatedProperties[propertyIndex].address = e.target.value;
 setFormData({ ...formData, properties: updatedProperties });
 }}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 placeholder="Full property address"
 />
 </div>

 {/* Advertising Spaces */}
 <div className="border-t pt-4">
 <div className="flex items-center justify-between mb-3">
 <h5 className="font-medium text-gray-800">Advertising Spaces</h5>
 <button
 onClick={() => addSpace(propertyIndex)}
 className="text-blue-600 hover:text-blue-700 text-sm inline-flex items-center gap-1"
>
 <Plus className="w-3 h-3" />
 Add Space
 </button>
 </div>

 {property.spaces.map((space, spaceIndex) => (
 <div key={spaceIndex} className="bg-gray-50 rounded-lg p-3 mb-3">
 <h6 className="text-sm font-medium text-gray-700 mb-2">Space {spaceIndex + 1}</h6>
 
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-medium text-gray-600 mb-1">
 Space Name
 </label>
 <input
 type="text"
 value={space.name}
 onChange={(e) => {
 const updatedProperties = [...formData.properties];
 updatedProperties[propertyIndex].spaces[spaceIndex].name = e.target.value;
 setFormData({ ...formData, properties: updatedProperties });
 }}
 className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
 placeholder="e.g., Front Window"
 />
 </div>
 
 <div>
 <label className="block text-xs font-medium text-gray-600 mb-1">
 Space Type
 </label>
 <select
 value={space.type}
 onChange={(e) => {
 const updatedProperties = [...formData.properties];
 updatedProperties[propertyIndex].spaces[spaceIndex].type = e.target.value;
 setFormData({ ...formData, properties: updatedProperties });
 }}
 className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
>
 <option value="storefront_window">Storefront Window</option>
 <option value="building_exterior">Building Exterior</option>
 <option value="pole_mount">Pole Mount</option>
 <option value="retail_frontage">Retail Frontage</option>
 <option value="other">Other</option>
 </select>
 </div>
 
 <div>
 <label className="block text-xs font-medium text-gray-600 mb-1">
 Dimensions
 </label>
 <input
 type="text"
 value={space.dimensions}
 onChange={(e) => {
 const updatedProperties = [...formData.properties];
 updatedProperties[propertyIndex].spaces[spaceIndex].dimensions = e.target.value;
 setFormData({ ...formData, properties: updatedProperties });
 }}
 className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
 placeholder="e.g., 4ft x 6ft"
 />
 </div>
 
 <div>
 <label className="block text-xs font-medium text-gray-600 mb-1">
 Base Price ($)
 </label>
 <input
 type="number"
 value={space.basePrice}
 onChange={(e) => {
 const updatedProperties = [...formData.properties];
 updatedProperties[propertyIndex].spaces[spaceIndex].basePrice = e.target.value;
 setFormData({ ...formData, properties: updatedProperties });
 }}
 className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
 placeholder="Monthly rate"
 />
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Step 3: Review */}
 {step === 3 && (
 <div className="space-y-6">
 <h3 className="text-lg font-medium text-gray-900 mb-4">Review & Confirm</h3>
 
 {/* Client Summary */}
 <div className="bg-blue-50 rounded-lg p-4">
 <h4 className="font-medium text-gray-900 mb-2">Client Information</h4>
 <div className="grid grid-cols-2 gap-3 text-sm">
 <div>
 <span className="text-gray-600">Business:</span>
 <span className="font-medium ml-2">{formData.businessName}</span>
 </div>
 <div>
 <span className="text-gray-600">Contact:</span>
 <span className="font-medium ml-2">{formData.contactName}</span>
 </div>
 <div>
 <span className="text-gray-600">Email:</span>
 <span className="font-medium ml-2">{formData.email}</span>
 </div>
 <div>
 <span className="text-gray-600">Phone:</span>
 <span className="font-medium ml-2">{formData.phone}</span>
 </div>
 </div>
 </div>

 {/* Properties Summary */}
 <div className="bg-green-50 rounded-lg p-4">
 <h4 className="font-medium text-gray-900 mb-2">Properties & Spaces</h4>
 <div className="space-y-2">
 {formData.properties.map((property, index) => (
 <div key={index} className="text-sm">
 <div className="font-medium">{property.title || `Property ${index + 1}`}</div>
 <div className="text-gray-600 ml-4">
 {property.spaces.length} advertising space(s)
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Action Items */}
 <div className="bg-yellow-50 rounded-lg p-4">
 <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
 <ul className="text-sm text-gray-700 space-y-1">
 <li>• Client will receive welcome email with login instructions</li>
 <li>• Properties will be created and pending approval</li>
 <li>• You can add photos and additional details after creation</li>
 <li>• Client can start receiving bookings once approved</li>
 </ul>
 </div>
 </div>
 )}
 </div>

 <div className="p-6 border-t border-gray-200 flex justify-between">
 <div>
 {step> 1 && (
 <button
 onClick={handlePrev}
 className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium inline-flex items-center gap-1"
>
 <ChevronLeft className="w-4 h-4" />
 Previous
 </button>
 )}
 </div>
 
 <div className="flex gap-3">
 <button
 onClick={() => setShowOnboardingModal(false)}
 className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
>
 Cancel
 </button>
 {step < 3 ? (
 <button
 onClick={handleNext}
 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-flex items-center gap-1"
>
 Next
 <ChevronRight className="w-4 h-4" />
 </button>
 ) : (
 <button
 onClick={handleSubmit}
 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
>
 Create Client
 </button>
 )}
 </div>
 </div>
 </div>
 </div>
 );
 };

 return (
 <div className="min-h-screen bg-gray-50 p-6">
 <div className="max-w-7xl mx-auto">
 {/* Header */}
 <div className="mb-8">
 <button
 onClick={() => window.history.back()}
 className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
>
 <ChevronLeft className="w-4 h-4" />
 Back to Admin Dashboard
 </button>
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold text-gray-900">Client Onboarding</h1>
 <p className="text-gray-600 mt-1">Manually set up new clients and their advertising spaces</p>
 </div>
 <button
 onClick={() => setShowOnboardingModal(true)}
 className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium inline-flex items-center gap-2"
>
 <Plus className="w-4 h-4" />
 Onboard Client
 </button>
 </div>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <Users className="w-8 h-8 text-blue-600" />
 </div>
 <h3 className="text-2xl font-bold text-gray-900">{stats.totalClients}</h3>
 <p className="text-sm text-gray-600">Total Clients</p>
 </div>
 
 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <Clock className="w-8 h-8 text-yellow-600" />
 <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
 Setup Needed
 </span>
 </div>
 <h3 className="text-2xl font-bold text-gray-900">{stats.pendingSetup}</h3>
 <p className="text-sm text-gray-600">Pending Setup</p>
 </div>
 
 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <CheckCircle className="w-8 h-8 text-green-600" />
 <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
 Active
 </span>
 </div>
 <h3 className="text-2xl font-bold text-gray-900">{stats.activeClients}</h3>
 <p className="text-sm text-gray-600">Active Clients</p>
 </div>
 
 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <Building2 className="w-8 h-8 text-purple-600" />
 </div>
 <h3 className="text-2xl font-bold text-gray-900">{stats.totalSpaces}</h3>
 <p className="text-sm text-gray-600">Ad Spaces Created</p>
 </div>
 </div>

 {/* Clients Table */}
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
 <div className="p-4 border-b border-gray-200">
 <h2 className="text-lg font-semibold text-gray-900">Recent Clients</h2>
 </div>
 
 {loading ? (
 <div className="p-8 text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
 <p className="mt-4 text-gray-600">Loading clients...</p>
 </div>
 ) : clients.length === 0 ? (
 <div className="p-8 text-center">
 <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
 <p className="text-gray-600">No clients found</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-gray-50 border-b border-gray-200">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Client
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Contact
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Properties
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Revenue
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Status
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Created
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Actions
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200">
 {clients.map((client) => (
 <tr key={client.id} className="hover:bg-gray-50">
 <td className="px-6 py-4 whitespace-nowrap">
 <div>
 <div className="text-sm font-medium text-gray-900">
 {client.businessName}
 </div>
 <div className="text-xs text-gray-500">
 {client.notes}
 </div>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div>
 <div className="text-sm text-gray-900 flex items-center gap-1">
 <User className="w-3 h-3" />
 {client.contactName}
 </div>
 <div className="text-xs text-gray-500 flex items-center gap-1">
 <Mail className="w-3 h-3" />
 {client.email}
 </div>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div>
 <div className="text-sm text-gray-900">
 {client.properties.length} propert{client.properties.length === 1 ? 'y' : 'ies'}
 </div>
 <div className="text-xs text-gray-500">
 {client.properties.reduce((sum, p) => sum + p.spaceCount, 0)} spaces
 </div>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm font-medium text-green-600">
 {formatCurrency(client.properties.reduce((sum, p) => sum + p.totalRevenue, 0))}
 </div>
 <div className="text-xs text-gray-500">Monthly</div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 {getStatusBadge(client.status)}
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm text-gray-900">
 {formatDate(client.createdAt)}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <div className="flex gap-2">
 <button
 onClick={() => setSelectedClient(client)}
 className="text-blue-600 hover:text-blue-700"
 title="View Details"
>
 <Eye className="w-4 h-4" />
 </button>
 <button
 onClick={() => console.log('Edit client:', client.id)}
 className="text-gray-600 hover:text-gray-700"
 title="Edit Client"
>
 <Edit3 className="w-4 h-4" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* Onboarding Modal */}
 {showOnboardingModal && <OnboardingModal />}
 </div>
 </div>
 );
}