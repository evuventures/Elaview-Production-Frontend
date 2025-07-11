import React, { useState, useEffect } from 'react';
import { Property, AdvertisingArea, Booking, Message, Invoice } from '@/api/entities';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Shield, Users, Building, MessageSquare, DollarSign, Database,
  Settings, BarChart3, AlertTriangle, Eye, Edit, Trash2, Crown,
  UserCheck, UserX, Search, Download, Upload, RefreshCw, Activity,
  Sparkles, Zap, Target, Award, Star, TrendingUp, Loader2, Calendar, CreditCard,
  LucideIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyApprovalsPanel from '../../components/admin/PropertyApprovalsPanel';

// Type assertions for JSX components
const CardComponent = Card as React.ComponentType<any>;
const CardContentComponent = CardContent as React.ComponentType<any>;
const CardHeaderComponent = CardHeader as React.ComponentType<any>;
const CardTitleComponent = CardTitle as React.ComponentType<any>;
const ButtonComponent = Button as React.ComponentType<any>;
const BadgeComponent = Badge as React.ComponentType<any>;
const InputComponent = Input as React.ComponentType<any>;
const LabelComponent = Label as React.ComponentType<any>;
const SelectComponent = Select as React.ComponentType<any>;
const SelectContentComponent = SelectContent as React.ComponentType<any>;
const SelectItemComponent = SelectItem as React.ComponentType<any>;
const SelectTriggerComponent = SelectTrigger as React.ComponentType<any>;
const SelectValueComponent = SelectValue as React.ComponentType<any>;

// Type definitions for entities
type Property = {
  id: string;
  name: string;
  address?: string;
  location?: { address: string };
  status: 'active' | 'pending_approval' | string;
  owner_id: string;
  created_date: string;
  primary_image?: string;
  type?: string;
};

type AdvertisingArea = {
  id: string;
  property_id: string;
  name: string;
  status?: string;
};

type Booking = {
  id: string;
  user_id: string;
  property_id: string;
  area_id: string;
  status: 'active' | 'pending' | 'pending_approval' | string;
  start_date: string;
  end_date: string;
  total_amount?: number;
  created_date: string;
};

type Message = {
  id: string;
  is_read: boolean;
  content?: string;
  created_date: string;
};

type Invoice = {
  id: string;
  status: 'paid' | 'pending' | string;
  amount: number;
  created_date: string;
};

// Type definitions
interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'user' | 'admin';
  profile_image?: string;
}

interface SystemStats {
  totalRevenue: number;
  activeBookings: number;
  pendingApprovals: number;
  unreadMessages: number;
}

interface StatCard {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  change: string;
}

interface TabDefinition {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

interface OverviewTabProps {
  users: User[];
  properties: Property[];
  stats: SystemStats;
}

interface UsersTabProps {
  filteredUsers: User[];
  handleUpdateUserRole: (userId: string, newRole: 'user' | 'admin') => Promise<void>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

interface PropertiesTabProps {
  properties: Property[];
  areas: AdvertisingArea[];
  bookings: Booking[];
  users: User[];
  handleDeleteProperty: (propertyId: string) => Promise<void>;
  createPageUrl: (page: string) => string;
}

interface BookingsTabProps {
  bookings: Booking[];
  users: User[];
  properties: Property[];
  createPageUrl: (page: string) => string;
}

interface SystemTabProps {
  loadAllData: () => Promise<void>;
  createPageUrl: (page: string) => string;
}

// --- New Tab Components ---

const OverviewTab: React.FC<OverviewTabProps> = ({ users, properties, stats }) => (
    <>
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-brand/20 rounded-3xl transform rotate-1"></div>
          <CardComponent className="card-brand glass-strong rounded-3xl overflow-hidden shadow-xl">
            <CardContentComponent className="p-8 md:p-12">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/25">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-muted-foreground text-lg md:text-xl mt-2">
                    System administration and management for Elaview
                  </p>
                </div>
              </div>
            </CardContentComponent>
          </CardComponent>
        </div>

        {/* Enhanced System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {([
            {
              title: "Total Users",
              value: users.length,
              icon: Users,
              color: "from-blue-500 to-cyan-500",
              bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40",
              change: "+12"
            },
            {
              title: "Total Properties",
              value: properties.length,
              icon: Building,
              color: "from-green-500 to-emerald-500",
              bgColor: "from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40",
              change: "+8"
            },
            {
              title: "Total Revenue",
              value: `$${stats.totalRevenue.toLocaleString()}`,
              icon: DollarSign,
              color: "bg-gradient-brand",
              bgColor: "bg-[hsl(var(--muted))]",
              change: "+24%"
            },
            {
              title: "Pending Approvals",
              value: stats.pendingApprovals,
              icon: AlertTriangle,
              color: "from-orange-500 to-red-500",
              bgColor: "from-orange-50 to-red-50 dark:from-orange-950/40 dark:to-red-950/40",
              change: stats.pendingApprovals > 0 ? "Action needed" : "All clear"
            }
          ] as StatCard[]).map((stat, index) => (
            <CardComponent key={index} className="group card-brand glass rounded-3xl overflow-hidden transition-brand hover:-translate-y-1">
              <CardContentComponent className={`p-6 ${stat.title === "Total Revenue" ? stat.bgColor : `bg-gradient-to-r ${stat.bgColor}`} relative overflow-hidden`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 ${stat.title === "Total Revenue" ? stat.color : `bg-gradient-to-r ${stat.color}`} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <BadgeComponent variant="outline" className={`${
                    stat.title === "Pending Approvals" && stats.pendingApprovals > 0
                      ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                      : 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                  } rounded-full px-3 py-1 text-xs font-bold`}>
                    {stat.change}
                  </BadgeComponent>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
              </CardContentComponent>
            </CardComponent>
          ))}
        </div>
    </>
);

const UsersTab: React.FC<UsersTabProps> = ({ filteredUsers, handleUpdateUserRole, searchTerm, setSearchTerm }) => (
    <CardComponent className="card-brand glass rounded-3xl overflow-hidden shadow-lg">
        <CardHeaderComponent className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))] p-8">
            <CardTitleComponent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    User Management
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--primary))]" />
                    <InputComponent
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        className="pl-12 w-full sm:w-64 bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl backdrop-blur-sm focus-brand transition-brand"
                    />
                </div>
            </CardTitleComponent>
        </CardHeaderComponent>
        <CardContentComponent className="p-8">
            <div className="space-y-4">
                {filteredUsers.map(user => (
                    <CardComponent key={user.id} className="group glass border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-brand hover:-translate-y-1">
                        <CardContentComponent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img
                                            src={user.profile_image || `https://ui-avatars.com/api/?name=${user.full_name}&background=6169A7&color=fff&size=48`}
                                            alt={user.full_name}
                                            className="w-12 h-12 rounded-2xl shadow-lg"
                                        />
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                            user.role === 'admin' ? 'bg-[hsl(var(--primary))]' : 'bg-green-500'
                                        }`}></div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-foreground">{user.full_name}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <BadgeComponent variant="outline" className={`${
                                        user.role === 'admin'
                                            ? 'bg-[hsl(var(--accent-light))] text-[hsl(var(--primary))] border border-[hsl(var(--primary))]'
                                            : 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300 border border-green-300 dark:border-green-600'
                                    } rounded-full px-3 py-1 font-bold`}>
                                        {user.role}
                                    </BadgeComponent>
                                    <SelectComponent
                                        value={user.role}
                                        onValueChange={(newRole: 'user' | 'admin') => handleUpdateUserRole(user.id, newRole)}
                                    >
                                        <SelectTriggerComponent className="w-32 bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl backdrop-blur-sm">
                                            <SelectValueComponent />
                                        </SelectTriggerComponent>
                                        <SelectContentComponent className="glass-strong border-[hsl(var(--border))] rounded-2xl">
                                            <SelectItemComponent value="user">User</SelectItemComponent>
                                            <SelectItemComponent value="admin">Admin</SelectItemComponent>
                                        </SelectContentComponent>
                                    </SelectComponent>
                                </div>
                            </div>
                        </CardContentComponent>
                    </CardComponent>
                ))}
            </div>
        </CardContentComponent>
    </CardComponent>
);

const PropertiesTab: React.FC<PropertiesTabProps> = ({ properties, areas, bookings, users, handleDeleteProperty, createPageUrl }) => (
    <CardComponent className="card-brand glass rounded-3xl overflow-hidden shadow-lg">
        <CardHeaderComponent className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))] p-8">
            <CardTitleComponent className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Building className="w-5 h-5 text-white" />
                </div>
                Properties Management
            </CardTitleComponent>
        </CardHeaderComponent>
        <CardContentComponent className="p-8">
            <div className="space-y-6">
                {properties.map(property => {
                    const propertyAreas = areas.filter(area => area.property_id === property.id);
                    const propertyBookings = bookings.filter(booking => booking.property_id === property.id);
                    const owner = users.find(u => u.id === property.owner_id);

                    return (
                        <CardComponent key={property.id} className="group glass border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-brand hover:-translate-y-1">
                            <CardContentComponent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-6">
                                        <img
                                            src={property.primary_image || 'https://via.placeholder.com/100x80/6169A7/ffffff?text=Property'}
                                            alt={property.name}
                                            className="w-24 h-20 object-cover rounded-2xl border border-[hsl(var(--border))] shadow-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-xl text-foreground mb-2">{property.name}</h3>
                                            <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                                                <Users className="w-4 h-4 text-green-500" />
                                                Owner: {owner?.full_name || 'Unknown'}
                                            </p>
                                            <p className="text-sm text-muted-foreground mb-3">{property.location?.address}</p>
                                            <div className="flex gap-6 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Target className="w-4 h-4 text-blue-500" />
                                                    <span className="font-medium">{propertyAreas.length} areas</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <BarChart3 className="w-4 h-4 text-[hsl(var(--primary))]" />
                                                    <span className="font-medium">{propertyBookings.length} bookings</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Link to={`${createPageUrl('PropertyManagement')}?id=${property.id}`}>
                                            <ButtonComponent variant="outline" size="sm" className="border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-xl">
                                                <Eye className="w-4 h-4 mr-2" />
                                                View
                                            </ButtonComponent>
                                        </Link>
                                        <ButtonComponent
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteProperty(property.id)}
                                            className="rounded-xl"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </ButtonComponent>
                                    </div>
                                </div>
                            </CardContentComponent>
                        </CardComponent>
                    );
                })}
            </div>
        </CardContentComponent>
    </CardComponent>
);

const BookingsTab: React.FC<BookingsTabProps> = ({ bookings, users, properties, createPageUrl }) => (
    <CardComponent className="card-brand glass rounded-3xl overflow-hidden shadow-lg">
        <CardHeaderComponent className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))] p-8">
            <CardTitleComponent className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-5 h-5 text-white" />
                </div>
                Bookings Management
            </CardTitleComponent>
        </CardHeaderComponent>
        <CardContentComponent className="p-8">
            <div className="space-y-4">
                {bookings.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No bookings found.</p>
                ) : (
                    bookings.map(booking => {
                        const user = users.find(u => u.id === booking.user_id);
                        const property = properties.find(p => p.id === booking.property_id);
                        return (
                            <CardComponent key={booking.id} className="group glass border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-brand hover:-translate-y-1">
                                <CardContentComponent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-foreground">{property?.name || 'Unknown Property'}</h3>
                                            <p className="text-sm text-muted-foreground">Booked by: {user?.full_name || 'Unknown User'}</p>
                                            <p className="text-sm text-muted-foreground">Dates: {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}</p>
                                        </div>
                                        <BadgeComponent variant="outline" className={`px-3 py-1 rounded-full font-bold ${
                                            booking.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                                            booking.status === 'pending' || booking.status === 'pending_approval' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400' :
                                            'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400'
                                        }`}>
                                            {booking.status}
                                        </BadgeComponent>
                                    </div>
                                    <div className="mt-4 text-right">
                                        <Link to={`${createPageUrl('BookingDetails')}?id=${booking.id}`}>
                                            <ButtonComponent variant="outline" size="sm" className="border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-xl">
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Details
                                            </ButtonComponent>
                                        </Link>
                                    </div>
                                </CardContentComponent>
                            </CardComponent>
                        );
                    })
                )}
            </div>
        </CardContentComponent>
    </CardComponent>
);

const PaymentSettingsPanel: React.FC = () => {
  const [publishableKey, setPublishableKey] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const fetchStripeKeys = async (): Promise<void> => {
      setIsLoading(true);
      setMessage('');
      setIsError(false);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const storedPublishableKey = localStorage.getItem('stripe_publishable_key') || 'pk_test_********************';
        const storedSecretKey = localStorage.getItem('stripe_secret_key') || 'sk_test_********************';

        setPublishableKey(storedPublishableKey);
        setSecretKey(storedSecretKey);
        setMessage('Keys loaded successfully.');
      } catch (error) {
        console.error('Failed to load Stripe keys:', error);
        setMessage('Failed to load Stripe keys.');
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStripeKeys();
  }, []);

  const handleSaveStripeKeys = async (): Promise<void> => {
    setIsLoading(true);
    setMessage('');
    setIsError(false);
    try {
      console.log('Saving Stripe Publishable Key:', publishableKey);
      console.log('Saving Stripe Secret Key:', secretKey);

      await new Promise(resolve => setTimeout(resolve, 1000));

      localStorage.setItem('stripe_publishable_key', publishableKey);
      localStorage.setItem('stripe_secret_key', secretKey);

      setMessage('Stripe keys saved successfully!');
      setIsError(false);
    } catch (error) {
      console.error('Error saving Stripe keys:', error);
      setMessage('Failed to save Stripe keys. Please try again.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CardComponent className="card-brand glass rounded-3xl overflow-hidden shadow-lg">
      <CardHeaderComponent className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))] p-8">
        <CardTitleComponent className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          Payment Gateway Settings
        </CardTitleComponent>
      </CardHeaderComponent>
      <CardContentComponent className="p-8 space-y-6">
        <p className="text-muted-foreground">Configure your Stripe API keys for payment processing. These keys are used by your backend to securely interact with Stripe.</p>
        <div className="space-y-4">
          <div>
            <LabelComponent htmlFor="publishableKey" className="mb-2 block">Stripe Publishable Key</LabelComponent>
            <InputComponent
              id="publishableKey"
              type="text"
              value={publishableKey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPublishableKey(e.target.value)}
              placeholder="pk_test_..."
              className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-xl backdrop-blur-sm"
              disabled={isLoading}
            />
          </div>
          <div>
            <LabelComponent htmlFor="secretKey" className="mb-2 block">Stripe Secret Key</LabelComponent>
            <InputComponent
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSecretKey(e.target.value)}
              placeholder="sk_test_..."
              className="bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-xl backdrop-blur-sm"
              disabled={isLoading}
            />
          </div>
        </div>
        {message && (
          <p className={`text-sm ${isError ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </p>
        )}
        <ButtonComponent
          onClick={handleSaveStripeKeys}
          className="btn-gradient rounded-2xl px-8 py-3 font-bold transition-brand"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Stripe Keys'
          )}
        </ButtonComponent>
        <p className="text-sm text-muted-foreground mt-4">
            <AlertTriangle className="inline-block w-4 h-4 mr-1 text-yellow-500" />
            <span className="font-semibold">Important:</span> For production, secret keys should always be stored and used on your backend, never directly exposed in client-side code. This interface is for configuration purposes only.
        </p>
      </CardContentComponent>
    </CardComponent>
  );
};

const SystemTab: React.FC<SystemTabProps> = ({ loadAllData, createPageUrl }) => (
    <CardComponent className="card-brand glass rounded-3xl overflow-hidden shadow-lg">
        <CardHeaderComponent className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))] p-8">
            <CardTitleComponent className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Settings className="w-5 h-5 text-white" />
                </div>
                System Settings
            </CardTitleComponent>
        </CardHeaderComponent>
        <CardContentComponent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h3 className="font-bold text-foreground text-xl flex items-center gap-2">
                        <Database className="w-5 h-5 text-blue-500" />
                        Data Management
                    </h3>
                    <div className="space-y-4">
                        <ButtonComponent
                            variant="outline"
                            className="w-full justify-start bg-[hsl(var(--input))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-2xl py-3"
                            onClick={() => loadAllData()}
                        >
                            <RefreshCw className="w-5 h-5 mr-3" />
                            Refresh All Data
                        </ButtonComponent>
                        <ButtonComponent variant="outline" className="w-full justify-start bg-[hsl(var(--input))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-2xl py-3">
                            <Download className="w-5 h-5 mr-3" />
                            Export System Data
                        </ButtonComponent>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="font-bold text-foreground text-xl flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-500" />
                        System Monitoring
                    </h3>
                    <div className="space-y-4">
                        <CardComponent className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/40 dark:to-emerald-950/40 backdrop-blur-sm border-green-200/50 dark:border-green-700/50 rounded-2xl overflow-hidden">
                            <CardContentComponent className="p-4">
                                <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">System Status</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg"></div>
                                    <span className="text-sm font-bold text-green-700 dark:text-green-300">All Systems Operational</span>
                                </div>
                            </CardContentComponent>
                        </CardComponent>
                        <CardComponent className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-950/40 dark:to-cyan-950/40 backdrop-blur-sm border-blue-200/50 dark:border-blue-700/50 rounded-2xl overflow-hidden">
                            <CardContentComponent className="p-4">
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">Database</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg"></div>
                                    <span className="text-sm font-bold text-blue-700 dark:text-blue-300">Connected & Optimized</span>
                                </div>
                            </CardContentComponent>
                        </CardComponent>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-[hsl(var(--border))]">
                <Link to={createPageUrl('DataSeeder')}>
                    <ButtonComponent className="btn-gradient rounded-2xl px-8 py-3 font-bold transition-brand">
                        <Database className="w-5 h-5 mr-2" />
                        Access Data Seeder
                    </ButtonComponent>
                </Link>
                <p className="text-sm text-muted-foreground mt-3">
                    Generate sample properties and advertising areas for testing
                </p>
            </div>
        </CardContentComponent>
    </CardComponent>
);

// Framer Motion animation properties for tab transitions
const tabAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
};

// --- AdminPage Component ---

const AdminPage: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [areas, setAreas] = useState<AdvertisingArea[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    if (isLoaded) {
      checkAdminAccess();
    }
  }, [isLoaded]);

  const checkAdminAccess = async (): Promise<void> => {
    try {
      if (!user) {
        window.location.href = createPageUrl('Dashboard');
        return;
      }
      
      // Check if user has admin role - this would come from your backend
      // For now, we'll assume admin check is done via publicMetadata or similar
      const isAdmin = user.publicMetadata?.role === 'admin' || user.emailAddresses[0]?.emailAddress === 'admin@elaview.com';
      
      if (!isAdmin) {
        window.location.href = createPageUrl('Dashboard');
        return;
      }
      
      setCurrentUser(user);
      await loadAllData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      window.location.href = createPageUrl('Dashboard');
    }
    setIsLoading(false);
  };

  const loadAllData = async (): Promise<void> => {
    try {
      const [propertiesData, areasData, bookingsData, messagesData, invoicesData] = await Promise.all([
        Property.list(),
        AdvertisingArea.list(),
        Booking.list(),
        Message.list(),
        Invoice.list()
      ]);

      // For users, we'll need to get them from your backend API
      // This is a placeholder - replace with actual API call
      setUsers([]); // TODO: Replace with actual users from backend
      setProperties(propertiesData);
      setAreas(areasData);
      setBookings(bookingsData);
      setMessages(messagesData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'user' | 'admin'): Promise<void> => {
    try {
      // TODO: Replace with actual API call to update user role
      console.log(`Updating user ${userId} to role ${newRole}`);
      await loadAllData();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteProperty = async (propertyId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this property and all its advertising areas? This action cannot be undone.')) {
      try {
        const areasToDelete = areas.filter(area => area.property_id === propertyId);
        await Promise.all(areasToDelete.map(area => AdvertisingArea.delete(area.id)));
        await Property.delete(propertyId);
        await loadAllData();
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('Failed to delete property. Check console for details.');
      }
    }
  };

  const getSystemStats = (): SystemStats => {
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0);
    const activeBookings = bookings.filter(b => b.status === 'active').length;
    const pendingApprovals = properties.filter(p => p.status === 'pending_approval').length;
    const unreadMessages = messages.filter(m => !m.is_read).length;

    return { totalRevenue, activeBookings, pendingApprovals, unreadMessages };
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-[var(--shadow-brand-lg)]">
            <Loader2 className="w-10 h-10 animate-spin text-white" />
          </div>
          <p className="text-muted-foreground font-semibold text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !(currentUser.publicMetadata?.role === 'admin' || currentUser.emailAddresses[0]?.emailAddress === 'admin@elaview.com')) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-md mx-auto">
          <CardComponent className="card-brand glass-strong rounded-3xl overflow-hidden shadow-lg">
            <CardContentComponent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/25">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Access Denied</h3>
              <p className="text-muted-foreground mb-6 text-lg">You don't have permission to access the admin area.</p>
              <Link to={createPageUrl('Dashboard')}>
                <ButtonComponent className="btn-gradient rounded-2xl px-8 py-3 font-bold transition-brand">
                  Return to Dashboard
                </ButtonComponent>
              </Link>
            </CardContentComponent>
          </CardComponent>
        </div>
      </div>
    );
  }

  const stats = getSystemStats();

  const tabs: TabDefinition[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-amber-400 to-orange-500' },
    { id: 'users', label: 'Users', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { id: 'properties', label: 'Properties', icon: Building, color: 'from-green-500 to-emerald-500' },
    { id: 'approvals', label: 'Approvals', icon: Shield, color: 'from-red-500 to-orange-500' },
    { id: 'bookings', label: 'Bookings', icon: Calendar, color: 'bg-gradient-brand' },
    { id: 'payments', label: 'Payment Settings', icon: CreditCard, color: 'from-orange-500 to-red-500' },
    { id: 'system', label: 'System', icon: Settings, color: 'from-gray-500 to-gray-600' },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Admin Tabs */}
        <CardComponent className="card-brand glass rounded-3xl overflow-hidden shadow-lg">
          <CardContentComponent className="p-2">
            <div className="flex bg-[hsl(var(--muted))] rounded-2xl p-1 overflow-x-auto">
              {tabs.map(tab => (
                <ButtonComponent
                  key={tab.id}
                  variant="ghost"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 font-bold rounded-xl transition-brand whitespace-nowrap ${
                    activeTab === tab.id
                      ? `${tab.id === 'bookings' ? tab.color : `bg-gradient-to-r ${tab.color}`} text-white shadow-lg`
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </ButtonComponent>
              ))}
            </div>
          </CardContentComponent>
        </CardComponent>

        {/* Enhanced Tab Content */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
                <motion.div key="overview" {...tabAnimation}>
                    <OverviewTab users={users} properties={properties} stats={stats} />
                </motion.div>
            )}
            {activeTab === 'users' && (
                <motion.div key="users" {...tabAnimation}>
                    <UsersTab
                        filteredUsers={filteredUsers}
                        handleUpdateUserRole={handleUpdateUserRole}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />
                </motion.div>
            )}
            {activeTab === 'properties' && (
                <motion.div key="properties" {...tabAnimation}>
                    <PropertiesTab
                        properties={properties}
                        areas={areas}
                        bookings={bookings}
                        users={users}
                        handleDeleteProperty={handleDeleteProperty}
                        createPageUrl={createPageUrl}
                    />
                </motion.div>
            )}
            {activeTab === 'approvals' && (
                <motion.div key="approvals" {...tabAnimation}>
                    <PropertyApprovalsPanel />
                </motion.div>
            )}
            {activeTab === 'bookings' && (
                <motion.div key="bookings" {...tabAnimation}>
                    <BookingsTab
                        bookings={bookings}
                        users={users}
                        properties={properties}
                        createPageUrl={createPageUrl}
                    />
                </motion.div>
            )}
            {activeTab === 'payments' && (
                <motion.div key="payments" {...tabAnimation}>
                    <PaymentSettingsPanel />
                </motion.div>
            )}
            {activeTab === 'system' && (
                <motion.div key="system" {...tabAnimation}>
                    <SystemTab loadAllData={loadAllData} createPageUrl={createPageUrl} />
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;