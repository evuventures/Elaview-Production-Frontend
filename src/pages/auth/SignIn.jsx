// src/pages/SignIn.jsx
import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Sparkles } from 'lucide-react';

export default function SignInPage() {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/browse';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Native App Branding */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-[var(--shadow-brand-lg)]">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient-brand mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-lg">
            Sign in to continue to your advertising dashboard
          </p>
        </div>
        
        {/* Native Styled Clerk Component */}
        <Card className="glass-strong shadow-[var(--shadow-brand-lg)] rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <SignIn 
              routing="path"
              path="/sign-in"
              redirectUrl={redirectUrl}
              fallbackRedirectUrl="/browse"
              appearance={{
                elements: {
                  // Main container
                  rootBox: 'w-full',
                  card: 'bg-transparent shadow-none border-none w-full',
                  
                  // Header
                  header: 'hidden', // Hide default header since we have our own
                  
                  // Form styling to match your app
                  formButtonPrimary: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border-none',
                  
                  // Input fields
                  formFieldInput: 'bg-[hsl(var(--input))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200',
                  formFieldLabel: 'text-base font-semibold text-muted-foreground mb-2',
                  
                  // Social buttons
                  socialButtonsBlockButton: 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-2xl py-3 px-4 transition-all duration-200 bg-[hsl(var(--card))]',
                  socialButtonsBlockButtonText: 'text-foreground font-medium',
                  
                  // Links and text
                  footerActionLink: 'text-primary hover:text-primary/90 font-medium transition-colors duration-200',
                  formFieldHintText: 'text-muted-foreground text-sm',
                  formFieldErrorText: 'text-red-500 text-sm',
                  
                  // Divider
                  dividerLine: 'bg-[hsl(var(--border))]',
                  dividerText: 'text-muted-foreground bg-[hsl(var(--background))] px-4',
                  
                  // Form container
                  form: 'space-y-6',
                  formFieldRow: 'space-y-2',
                  
                  // Footer
                  footer: 'text-center mt-6',
                  footerAction: 'text-muted-foreground',
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>Secure authentication powered by Clerk</span>
          </div>
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}