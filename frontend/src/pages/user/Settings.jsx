import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import apiClient from '@/api/apiClient';
import {
  Settings as SettingsIcon,
  Search,
  Bell,
  Shield,
  Globe,
  Monitor,
  CreditCard,
  Accessibility,
  ChevronRight,
  Save,
  Loader2,
} from 'lucide-react';

// Simple local storage helper
const STORAGE_KEY = 'elaview.preferences.v1';
const loadLocalPrefs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const saveLocalPrefs = (prefs) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
};

const DEFAULT_PREFS = {
  ui: {
    theme: 'system', // 'light' | 'dark' | 'system'
    reduceMotion: false,
    compactMode: false,
    mapUnits: 'metric', // 'metric' | 'imperial'
  },
  language: {
    locale: 'en-US',
  },
  privacy: {
    analytics: true,
    personalization: true,
    crashReports: true,
  },
  notifications: {
    email: true,
    sms: false,
    inApp: true,
    marketing: false,
  },
  billing: {
    savePaymentMethods: true,
    defaultCurrency: 'USD',
  },
};

const sections = [
  { id: 'appearance', icon: Monitor, label: 'Appearance' },
  { id: 'privacy', icon: Shield, label: 'Privacy & security' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'language', icon: Globe, label: 'Language & region' },
  { id: 'billing', icon: CreditCard, label: 'Payments & billing' },
  { id: 'accessibility', icon: Accessibility, label: 'Accessibility' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user: clerkUser, isLoaded } = useUser();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState('appearance');
  const [query, setQuery] = useState('');
  const [userId, setUserId] = useState(null);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  // Load preferences from backend or local storage
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        // Start with local storage
        const local = loadLocalPrefs();
        if (local) setPrefs(prev => ({ ...prev, ...local }));

        if (isLoaded && clerkUser) {
          // Attempt backend profile load for user id and preferences
          const profile = await apiClient.getUserProfile().catch(() => null);
          if (!cancelled && profile?.success && profile.data) {
            setUserId(profile.data.id);
            const serverPrefs = profile.data.communicationPreferences || null;
            if (serverPrefs) {
              // Merge server into current
              setPrefs(prev => ({
                ...prev,
                ...(typeof serverPrefs === 'object' ? serverPrefs : {}),
              }));
            }
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    init();
    return () => { cancelled = true; };
  }, [isLoaded, clerkUser]);

  const filteredSections = useMemo(() => {
    if (!query.trim()) return sections;
    const q = query.toLowerCase();
    return sections.filter(s => s.label.toLowerCase().includes(q));
  }, [query]);

  const onSave = async () => {
    setSaving(true);
    try {
      // Persist locally
      saveLocalPrefs(prefs);

      // Persist to backend if we have an id
      if (userId) {
        await apiClient.updateUser(userId, {
          communicationPreferences: prefs,
        });
      }

      toast({ title: 'Preferences saved', description: 'Your settings have been updated.' });
    } catch (e) {
      toast({ title: 'Save failed', description: 'Could not save preferences. They remain locally.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const SectionHeader = ({ title, description }) => (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      )}
      <Separator className="mt-4" />
    </div>
  );

  const Appearance = () => (
    <Card className="glass-strong bg-slate-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Monitor className="w-4 h-4" /> Appearance</CardTitle>
        <CardDescription>Choose theme and display preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="mb-2 block">Theme</Label>
          <div className="grid grid-cols-3 gap-2">
            {['light','dark','system'].map(t => (
              <Button key={t} type="button" variant={prefs.ui.theme === t ? 'default' : 'outline'}
                className="capitalize" onClick={() => setPrefs(p => ({ ...p, ui: { ...p.ui, theme: t }}))}>
                {t}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Reduce motion</Label>
            <p className="text-xs text-slate-500">Limit animations and transitions</p>
          </div>
          <Switch checked={prefs.ui.reduceMotion}
            onCheckedChange={(v) => setPrefs(p => ({ ...p, ui: { ...p.ui, reduceMotion: v }}))} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Compact mode</Label>
            <p className="text-xs text-slate-500">Denser UI for information-heavy pages</p>
          </div>
          <Switch checked={prefs.ui.compactMode}
            onCheckedChange={(v) => setPrefs(p => ({ ...p, ui: { ...p.ui, compactMode: v }}))} />
        </div>
        <div>
          <Label className="mb-2 block">Map units</Label>
          <div className="flex gap-2">
            {['metric','imperial'].map(u => (
              <Button key={u} type="button" variant={prefs.ui.mapUnits === u ? 'default' : 'outline'}
                className="capitalize" onClick={() => setPrefs(p => ({ ...p, ui: { ...p.ui, mapUnits: u }}))}>
                {u}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const Privacy = () => (
    <Card className="glass-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Shield className="w-4 h-4" /> Privacy & security</CardTitle>
        <CardDescription>Control analytics and personalization</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>Analytics</Label>
            <p className="text-xs text-slate-500">Allow anonymous usage analytics</p>
          </div>
          <Switch checked={prefs.privacy.analytics}
            onCheckedChange={(v) => setPrefs(p => ({ ...p, privacy: { ...p.privacy, analytics: v }}))} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Personalized content</Label>
            <p className="text-xs text-slate-500">Improve recommendations based on usage</p>
          </div>
          <Switch checked={prefs.privacy.personalization}
            onCheckedChange={(v) => setPrefs(p => ({ ...p, privacy: { ...p.privacy, personalization: v }}))} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Crash reports</Label>
            <p className="text-xs text-slate-500">Send crash diagnostics to help improve stability</p>
          </div>
          <Switch checked={prefs.privacy.crashReports}
            onCheckedChange={(v) => setPrefs(p => ({ ...p, privacy: { ...p.privacy, crashReports: v }}))} />
        </div>
      </CardContent>
    </Card>
  );

  const Notifications = () => (
    <Card className="glass-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</CardTitle>
        <CardDescription>Choose how you want to be notified</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {[
          ['Email notifications','email','Receive updates by email'],
          ['SMS notifications','sms','Receive updates by text message'],
          ['In-app notifications','inApp','Show alerts inside the app'],
          ['Marketing messages','marketing','Occasional product news'],
        ].map(([label, key, desc]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <Label>{label}</Label>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
            <Switch checked={prefs.notifications[key]}
              onCheckedChange={(v) => setPrefs(p => ({ ...p, notifications: { ...p.notifications, [key]: v }}))} />
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const Language = () => (
    <Card className="glass-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Globe className="w-4 h-4" /> Language & region</CardTitle>
        <CardDescription>Set your preferred language</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="mb-2 block">Language</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {['en-US','pt-BR','he-IL','es-ES'].map(loc => (
              <Button key={loc} type="button" variant={prefs.language.locale === loc ? 'default' : 'outline'}
                onClick={() => setPrefs(p => ({ ...p, language: { ...p.language, locale: loc }}))}>
                {loc}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const Billing = () => (
    <Card className="glass-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payments & billing</CardTitle>
        <CardDescription>Manage payment preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>Save payment methods</Label>
            <p className="text-xs text-slate-500">Fast checkout with saved methods</p>
          </div>
          <Switch checked={prefs.billing.savePaymentMethods}
            onCheckedChange={(v) => setPrefs(p => ({ ...p, billing: { ...p.billing, savePaymentMethods: v }}))} />
        </div>
        <div>
          <Label className="mb-2 block">Default currency</Label>
          <div className="flex gap-2">
            {['USD','ILS','EUR','BRL'].map(cur => (
              <Button key={cur} type="button" variant={prefs.billing.defaultCurrency === cur ? 'default' : 'outline'}
                onClick={() => setPrefs(p => ({ ...p, billing: { ...p.billing, defaultCurrency: cur }}))}>
                {cur}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const AccessibilitySection = () => (
    <Card className="glass-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Accessibility className="w-4 h-4" /> Accessibility</CardTitle>
        <CardDescription>Improve readability and interaction</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>High contrast</Label>
            <p className="text-xs text-slate-500">Increase contrast for text and UI</p>
          </div>
          <Switch checked={!!prefs.ui.highContrast}
            onCheckedChange={(v) => setPrefs(p => ({ ...p, ui: { ...p.ui, highContrast: v }}))} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Large text</Label>
            <p className="text-xs text-slate-500">Use larger base font size</p>
          </div>
          <Switch checked={!!prefs.ui.largeText}
            onCheckedChange={(v) => setPrefs(p => ({ ...p, ui: { ...p.ui, largeText: v }}))} />
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (active) {
      case 'appearance': return <Appearance/>;
      case 'privacy': return <Privacy/>;
      case 'notifications': return <Notifications/>;
      case 'language': return <Language/>;
      case 'billing': return <Billing/>;
      case 'accessibility': return <AccessibilitySection/>;
      default: return <Appearance/>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-xl">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <p className="text-slate-600">Loading your settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
            <SettingsIcon className="w-5 h-5"/>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-slate-600">Customize your Elaview experience</p>
          </div>
        </div>

        {/* Chrome-like layout: left sidebar, right content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-4 lg:col-span-3">
            <Card className="glass-strong sticky top-20 bg-slate-100">
              <CardContent className="p-4 space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Search settings"
                    className="pl-9"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <Separator/>
                <nav className="space-y-1">
                  {filteredSections.map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition ${
                        active === id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                      onClick={() => setActive(id)}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4" /> {label}
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-60" />
                    </button>
                  ))}
                </nav>
                <Separator/>
                <div className="text-xs text-slate-500 px-1">Changes are saved to your account</div>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="md:col-span-8 lg:col-span-9 space-y-4">
            {renderContent()}

            <div className="flex justify-end">
              <Button onClick={onSave} disabled={saving} className="gap-2 bg-slate-100">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save preferences
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
