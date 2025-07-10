// src/components/admin/PaymentSettingsPanel.tsx
import React, { useState, useEffect } from 'react';
import { PaymentSettings } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Save, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';

// Type assertions for JSX components
const ButtonComponent = Button as React.ComponentType<any>;
const InputComponent = Input as React.ComponentType<any>;
const LabelComponent = Label as React.ComponentType<any>;
const SelectComponent = Select as React.ComponentType<any>;
const SelectContentComponent = SelectContent as React.ComponentType<any>;
const SelectItemComponent = SelectItem as React.ComponentType<any>;
const SelectTriggerComponent = SelectTrigger as React.ComponentType<any>;
const SelectValueComponent = SelectValue as React.ComponentType<any>;
const CardComponent = Card as React.ComponentType<any>;
const CardContentComponent = CardContent as React.ComponentType<any>;
const CardHeaderComponent = CardHeader as React.ComponentType<any>;
const CardTitleComponent = CardTitle as React.ComponentType<any>;
const SwitchComponent = Switch as React.ComponentType<any>;
const AlertComponent = Alert as React.ComponentType<any>;
const AlertDescriptionComponent = AlertDescription as React.ComponentType<any>;

// ✅ TypeScript interfaces
interface PaymentSettingsData {
    id?: string;
    stripe_publishable_key: string;
    stripe_secret_key: string;
    environment: 'test' | 'live';
    currency: 'USD' | 'EUR' | 'GBP' | 'CAD';
    tax_rate: number | string;
    is_enabled: boolean;
}

interface SaveMessage {
    type: 'success' | 'error' | '';
    message: string;
}

interface StripeModule {
    loadStripe: (publishableKey: string) => Promise<any>;
}

const PaymentSettingsPanel: React.FC = () => {
    const [settings, setSettings] = useState<PaymentSettingsData>({
        stripe_publishable_key: '',
        stripe_secret_key: '',
        environment: 'test',
        currency: 'USD',
        tax_rate: 0,
        is_enabled: false
    });
    
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [showSecretKey, setShowSecretKey] = useState<boolean>(false);
    const [saveMessage, setSaveMessage] = useState<SaveMessage>({ type: '', message: '' });
    const [existingSettingsId, setExistingSettingsId] = useState<string | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async (): Promise<void> => {
        try {
            const settingsList: PaymentSettingsData[] = await PaymentSettings.list();
            if (settingsList.length > 0) {
                const existing = settingsList[0];
                setSettings(existing);
                setExistingSettingsId(existing.id || null);
            }
        } catch (error) {
            console.error('Error loading payment settings:', error);
        }
        setIsLoading(false);
    };

    const validateSettings = (settings: PaymentSettingsData): void => {
        if (!settings.stripe_publishable_key.trim()) {
            throw new Error('Stripe publishable key is required');
        }

        if (settings.is_enabled && !settings.stripe_secret_key.trim()) {
            throw new Error('Stripe secret key is required when payments are enabled');
        }

        // Validate key formats
        if (settings.environment === 'test') {
            if (!settings.stripe_publishable_key.startsWith('pk_test_')) {
                throw new Error('Test publishable key should start with pk_test_');
            }
            if (settings.stripe_secret_key && !settings.stripe_secret_key.startsWith('sk_test_')) {
                throw new Error('Test secret key should start with sk_test_');
            }
        } else {
            if (!settings.stripe_publishable_key.startsWith('pk_live_')) {
                throw new Error('Live publishable key should start with pk_live_');
            }
            if (settings.stripe_secret_key && !settings.stripe_secret_key.startsWith('sk_live_')) {
                throw new Error('Live secret key should start with sk_live_');
            }
        }
    };

    const handleSave = async (): Promise<void> => {
        setIsSaving(true);
        setSaveMessage({ type: '', message: '' });

        try {
            validateSettings(settings);

            const settingsData: PaymentSettingsData = {
                ...settings,
                tax_rate: parseFloat(settings.tax_rate.toString()) || 0
            };

            if (existingSettingsId) {
                await PaymentSettings.update(existingSettingsId, settingsData);
            } else {
                const newSettings: PaymentSettingsData = await PaymentSettings.create(settingsData);
                setExistingSettingsId(newSettings.id || null);
            }

            setSaveMessage({ 
                type: 'success', 
                message: 'Payment settings saved successfully!' 
            });

            // Clear message after 3 seconds
            setTimeout(() => setSaveMessage({ type: '', message: '' }), 3000);

        } catch (error) {
            console.error('Error saving payment settings:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to save payment settings';
            setSaveMessage({ 
                type: 'error', 
                message: errorMessage
            });
        }
        setIsSaving(false);
    };

    const handleTestConnection = async (): Promise<void> => {
        if (!settings.stripe_publishable_key) {
            setSaveMessage({ 
                type: 'error', 
                message: 'Please enter a publishable key first' 
            });
            return;
        }

        try {
            // Test if key can be loaded (basic validation)
            const stripeModule: StripeModule = await import('@stripe/stripe-js');
            const stripe = await stripeModule.loadStripe(settings.stripe_publishable_key);
            
            if (stripe) {
                setSaveMessage({ 
                    type: 'success', 
                    message: 'Stripe connection test successful!' 
                });
            } else {
                throw new Error('Failed to initialize Stripe');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setSaveMessage({ 
                type: 'error', 
                message: `Connection test failed: ${errorMessage}` 
            });
        }

        setTimeout(() => setSaveMessage({ type: '', message: '' }), 3000);
    };

    const handleSettingsChange = <K extends keyof PaymentSettingsData>(
        key: K,
        value: PaymentSettingsData[K]
    ): void => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        key: keyof PaymentSettingsData
    ): void => {
        handleSettingsChange(key, event.target.value as PaymentSettingsData[keyof PaymentSettingsData]);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Loading payment settings...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-8 h-8 text-[hsl(var(--primary))]" />
                <div>
                    <h2 className="text-2xl font-bold">Payment Settings</h2>
                    <p className="text-muted-foreground">Configure Stripe payment integration</p>
                </div>
            </div>

            {saveMessage.message && (
                <AlertComponent className={`${saveMessage.type === 'success' ? 'border-[hsl(var(--success))] bg-[hsl(var(--success))]/10' : 'border-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10'} rounded-2xl`}>
                    {saveMessage.type === 'success' ? 
                        <CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" /> : 
                        <AlertTriangle className="h-4 w-4 text-[hsl(var(--destructive))]" />
                    }
                    <AlertDescriptionComponent className={saveMessage.type === 'success' ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'}>
                        {saveMessage.message}
                    </AlertDescriptionComponent>
                </AlertComponent>
            )}

            <CardComponent className="glass border-[hsl(var(--border))] rounded-3xl">
                <CardHeaderComponent>
                    <CardTitleComponent>Stripe Configuration</CardTitleComponent>
                </CardHeaderComponent>
                <CardContentComponent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <LabelComponent className="text-base font-semibold">Enable Stripe Payments</LabelComponent>
                            <p className="text-sm text-muted-foreground">Allow users to pay with credit cards</p>
                        </div>
                        <SwitchComponent
                            checked={settings.is_enabled}
                            onCheckedChange={(checked: boolean) => handleSettingsChange('is_enabled', checked)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <LabelComponent htmlFor="environment" className="text-base font-semibold mb-2 block">Environment</LabelComponent>
                            <SelectComponent 
                                value={settings.environment} 
                                onValueChange={(value: 'test' | 'live') => handleSettingsChange('environment', value)}
                            >
                                <SelectTriggerComponent className="glass border-[hsl(var(--border))] rounded-2xl">
                                    <SelectValueComponent />
                                </SelectTriggerComponent>
                                <SelectContentComponent>
                                    <SelectItemComponent value="test">Test Mode</SelectItemComponent>
                                    <SelectItemComponent value="live">Live Mode</SelectItemComponent>
                                </SelectContentComponent>
                            </SelectComponent>
                        </div>

                        <div>
                            <LabelComponent htmlFor="currency" className="text-base font-semibold mb-2 block">Currency</LabelComponent>
                            <SelectComponent 
                                value={settings.currency} 
                                onValueChange={(value: 'USD' | 'EUR' | 'GBP' | 'CAD') => handleSettingsChange('currency', value)}
                            >
                                <SelectTriggerComponent className="glass border-[hsl(var(--border))] rounded-2xl">
                                    <SelectValueComponent />
                                </SelectTriggerComponent>
                                <SelectContentComponent>
                                    <SelectItemComponent value="USD">USD - US Dollar</SelectItemComponent>
                                    <SelectItemComponent value="EUR">EUR - Euro</SelectItemComponent>
                                    <SelectItemComponent value="GBP">GBP - British Pound</SelectItemComponent>
                                    <SelectItemComponent value="CAD">CAD - Canadian Dollar</SelectItemComponent>
                                </SelectContentComponent>
                            </SelectComponent>
                        </div>
                    </div>

                    <div>
                        <LabelComponent htmlFor="publishable_key" className="text-base font-semibold mb-2 block">
                            Stripe Publishable Key *
                        </LabelComponent>
                        <InputComponent
                            id="publishable_key"
                            type="text"
                            value={settings.stripe_publishable_key}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'stripe_publishable_key')}
                            placeholder={settings.environment === 'test' ? 'pk_test_...' : 'pk_live_...'}
                            className="glass border-[hsl(var(--border))] rounded-2xl font-mono text-sm focus-brand"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            This key is safe to use in client-side code
                        </p>
                    </div>

                    <div>
                        <LabelComponent htmlFor="secret_key" className="text-base font-semibold mb-2 block">
                            Stripe Secret Key {settings.is_enabled && '*'}
                        </LabelComponent>
                        <div className="relative">
                            <InputComponent
                                id="secret_key"
                                type={showSecretKey ? "text" : "password"}
                                value={settings.stripe_secret_key}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'stripe_secret_key')}
                                placeholder={settings.environment === 'test' ? 'sk_test_...' : 'sk_live_...'}
                                className="glass border-[hsl(var(--border))] rounded-2xl font-mono text-sm pr-12 focus-brand"
                            />
                            <ButtonComponent
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8"
                                onClick={() => setShowSecretKey(!showSecretKey)}
                            >
                                {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </ButtonComponent>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Keep this key secure and never expose it in client-side code
                        </p>
                    </div>

                    <div>
                        <LabelComponent htmlFor="tax_rate" className="text-base font-semibold mb-2 block">Tax Rate (%)</LabelComponent>
                        <InputComponent
                            id="tax_rate"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={settings.tax_rate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'tax_rate')}
                            placeholder="0.00"
                            className="glass border-[hsl(var(--border))] rounded-2xl focus-brand"
                        />
                    </div>

                    {settings.environment === 'test' && (
                        <AlertComponent className="border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 rounded-2xl">
                            <AlertTriangle className="h-4 w-4 text-[hsl(var(--primary))]" />
                            <AlertDescriptionComponent className="text-[hsl(var(--primary))]">
                                <strong>Test Mode:</strong> Use test card 4242 4242 4242 4242 with any future expiry date and any 3-digit CVC.
                            </AlertDescriptionComponent>
                        </AlertComponent>
                    )}

                    <div className="flex gap-4 pt-4">
                        <ButtonComponent
                            onClick={handleTestConnection}
                            variant="outline"
                            disabled={!settings.stripe_publishable_key}
                            className="rounded-2xl border-[hsl(var(--border))] transition-brand"
                        >
                            Test Connection
                        </ButtonComponent>
                        <ButtonComponent
                            onClick={handleSave}
                            disabled={isSaving}
                            className="btn-gradient rounded-2xl transition-brand"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Settings
                                </>
                            )}
                        </ButtonComponent>
                    </div>
                </CardContentComponent>
            </CardComponent>
        </div>
    );
};

export default PaymentSettingsPanel;