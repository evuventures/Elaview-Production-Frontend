import React from "react";
import { SignIn } from "@clerk/clerk-react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function SignInPage() {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/browse";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Main Card Wrapping All Elements */}
      <Card className="w-full max-w-md rounded-2xl overflow-hidden shadow-lg">
        <CardContent className="p-8 space-y-8">
          {/* App Branding Section */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-[var(--shadow-brand-lg)]">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1
              className="text-3xl font-bold text-gradient-brand
 mb-2"
            >
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-lg">
              Sign in to continue to your advertising dashboard
            </p>
          </div>

          {/* Sign-In Form Section */}
          <SignIn
            routing="path"
            path="/sign-in"
            redirectUrl={redirectUrl}
            fallbackRedirectUrl="/browse"
            appearance={{
              elements: {
                rootBox: "w-full",
                // card: "hidden", // By applying This Google Button Will Appear
                header: "hidden",
                footer: "hidden",
                socialButtonsBlockButton: "hidden",
                dividerLine: "hidden",
                footerActionLink: "border-t-0 pt-0",

                // Social buttons Google
                socialButtonsBlockButton:
                  "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-2xl py-3 px-4 transition-all duration-200 bg-[hsl(var(--card))]",
                socialButtonsBlockButtonText: "text-foreground font-medium",

                formButtonPrimary:
                  "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-none",

                formFieldInput:
                  "bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200",

                formFieldLabel: "text-base font-semibold text-gray-600 mb-2",

                dividerText: "text-gray-500 bg-white px-4",

                form: "space-y-5 border-t-0 pt-0 mt-0",
                formFieldRow: "space-y-2",
              },
            }}
          />

          {/* Footer Links */}
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <a
                href="/sign-up"
                className="font-semibold text-gradient-brand hover:underline"
              >
                Sign up
              </a>
            </p>
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our{" "}
              <a href="/terms" className="text-muted-foregroundhover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="text-muted-foreground hover:underline"
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
