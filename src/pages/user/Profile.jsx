import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { User as UserIcon, Phone, Building, MapPin, Save, Camera, Loader2, Sparkles, Edit3, Shield, Award, Star, LogOut } from 'lucide-react';
import { UploadFile } from '@/api/integrations';

export default function ProfilePage() {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', company: '', address: '', bio: '', profile_image: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (isLoaded && clerkUser) {
      const loadUser = async () => {
        setIsLoading(true);
        try {
          // Use Clerk user data
          const userData = {
            id: clerkUser.id,
            full_name: clerkUser.fullName || '',
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            phone: clerkUser.phoneNumbers[0]?.phoneNumber || '',
            profile_image: clerkUser.imageUrl || '',
            // Additional fields from publicMetadata or unsafeMetadata
            company: clerkUser.publicMetadata?.company || '',
            address: clerkUser.publicMetadata?.address || '',
            bio: clerkUser.publicMetadata?.bio || ''
          };
          
          setUser(userData);
          setFormData({
            full_name: userData.full_name,
            email: userData.email,
            phone: userData.phone,
            company: userData.company,
            address: userData.address,
            bio: userData.bio,
            profile_image: userData.profile_image
          });
        } catch (error) { 
          console.error('Error loading user:', error); 
        }
        setIsLoading(false);
      };
      loadUser();
    }
  }, [isLoaded, clerkUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, profile_image: file_url }));
    } catch (error) { 
      console.error('Error uploading image:', error); 
    }
    setIsUploading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Update Clerk user metadata
      await clerkUser.update({
        publicMetadata: {
          company: formData.company,
          address: formData.address,
          bio: formData.bio,
          profile_image: formData.profile_image
        }
      });
      
      // Update phone number if different
      if (formData.phone && formData.phone !== clerkUser.phoneNumbers[0]?.phoneNumber) {
        await clerkUser.createPhoneNumber({ phoneNumber: formData.phone });
      }
      
      alert("Profile updated successfully!");
    } catch (error) { 
      console.error('Error updating profile:', error); 
      alert("Failed to update profile. Please try again.");
    }
    setIsSaving(false);
  };

  // ✅ NEW: Logout handler
  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate('/browse'); // Redirect to browse page after logout
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-[var(--shadow-brand-lg)]">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <p className="text-[hsl(var(--muted-foreground))] font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Enhanced Profile Header */}
        <div className="text-center relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[hsl(var(--primary)/0.1)] rounded-3xl -z-10"></div>
          <div className="relative py-12 px-8">
            <div className="relative w-36 h-36 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-brand rounded-full p-1 shadow-[var(--shadow-brand-lg)]">
                <img 
                  src={formData.profile_image || `https://ui-avatars.com/api/?name=${user?.full_name}&background=6169A7&color=fff&size=144`} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover bg-[hsl(var(--card))]"
                />
              </div>
              <input 
                type="file" 
                onChange={handleImageUpload} 
                className="hidden" 
                id="profile-image-upload" 
                accept="image/*" 
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute bottom-2 right-2 rounded-full w-12 h-12 glass border-2 border-[hsl(var(--card))] shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand"
                onClick={() => document.getElementById('profile-image-upload')?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--primary))]" />
                ) : (
                  <Camera className="w-5 h-5 text-[hsl(var(--primary))]" />
                )}
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2 text-gradient-brand">
              {user?.full_name}
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] text-lg">{user?.email}</p>
            
            {/* Profile stats/badges */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="flex items-center gap-2 glass px-4 py-2 rounded-full border border-[hsl(var(--border))] shadow-sm">
                <Shield className="w-4 h-4 text-[hsl(var(--success))]" />
                <span className="text-sm font-medium text-[hsl(var(--success))]">Verified</span>
              </div>
              <div className="flex items-center gap-2 glass px-4 py-2 rounded-full border border-[hsl(var(--border))] shadow-sm">
                <Star className="w-4 h-4 text-[hsl(var(--warning))]" />
                <span className="text-sm font-medium">4.9 Rating</span>
              </div>
            </div>

            {/* ✅ NEW: Logout Button */}
            <div className="mt-6">
              <Button
                onClick={handleLogout}
                disabled={isSigningOut}
                variant="destructive"
                className="px-6 py-2 rounded-2xl font-semibold"
              >
                {isSigningOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Signing Out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Enhanced Edit Profile Card */}
        <Card className="glass-strong shadow-[var(--shadow-brand-lg)] rounded-3xl overflow-hidden">
          <CardHeader className="bg-[hsl(var(--primary)/0.05)] border-b border-[hsl(var(--border))] p-8">
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-[var(--shadow-brand)]">
                <Edit3 className="w-5 h-5 text-white" />
              </div>
              Edit Profile
            </CardTitle>
            <CardDescription className="text-lg text-[hsl(var(--muted-foreground))]">
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="phone" className="flex items-center gap-3 text-base font-semibold text-[hsl(var(--muted-foreground))]">
                    <div className="w-8 h-8 bg-[hsl(var(--muted))] rounded-xl flex items-center justify-center">
                      <Phone className="w-4 h-4 text-[hsl(var(--primary))]" />
                    </div>
                    Phone Number
                  </Label>
                  <Input 
                    id="phone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} 
                    placeholder="+1 (555) 123-4567" 
                    className="glass border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm focus-brand transition-brand" 
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="company" className="flex items-center gap-3 text-base font-semibold text-[hsl(var(--muted-foreground))]">
                    <div className="w-8 h-8 bg-[hsl(var(--muted))] rounded-xl flex items-center justify-center">
                      <Building className="w-4 h-4 text-[hsl(var(--primary))]" />
                    </div>
                    Company
                  </Label>
                  <Input 
                    id="company" 
                    value={formData.company} 
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))} 
                    placeholder="Your Company Inc." 
                    className="glass border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm focus-brand transition-brand" 
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="address" className="flex items-center gap-3 text-base font-semibold text-[hsl(var(--muted-foreground))]">
                  <div className="w-8 h-8 bg-[hsl(var(--muted))] rounded-xl flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-[hsl(var(--primary))]" />
                  </div>
                  Address
                </Label>
                <Input 
                  id="address" 
                  value={formData.address} 
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} 
                  placeholder="123 Main St, City, State, Country" 
                  className="glass border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm focus-brand transition-brand" 
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="bio" className="flex items-center gap-3 text-base font-semibold text-[hsl(var(--muted-foreground))]">
                  <div className="w-8 h-8 bg-[hsl(var(--muted))] rounded-xl flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-[hsl(var(--primary))]" />
                  </div>
                  About You
                </Label>
                <Textarea 
                  id="bio" 
                  value={formData.bio} 
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))} 
                  placeholder="Tell us about yourself, your business, and what makes you unique..." 
                  rows={4}
                  className="glass border-[hsl(var(--border))] rounded-2xl py-3 px-4 text-base backdrop-blur-sm focus-brand transition-brand resize-none" 
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isSaving} 
                className="w-full btn-gradient font-bold py-4 text-lg rounded-2xl shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-3"/>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-3"/>
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Enhanced Quick Actions Card */}
        <Card className="glass-strong shadow-[var(--shadow-lg)] rounded-3xl overflow-hidden">
          <CardHeader className="bg-[hsl(var(--primary)/0.05)] border-b border-[hsl(var(--border))] p-6">
            <CardTitle className="text-xl flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-brand rounded-xl flex items-center justify-center shadow-[var(--shadow-brand)]">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 rounded-2xl border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-brand"
              >
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-[hsl(var(--primary))]" />
                  <p className="font-semibold">Privacy Settings</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Manage your privacy</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 rounded-2xl border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-brand"
              >
                <div className="text-center">
                  <Award className="w-6 h-6 mx-auto mb-2 text-[hsl(var(--primary))]" />
                  <p className="font-semibold">Achievements</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">View your progress</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 rounded-2xl border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-brand"
              >
                <div className="text-center">
                  <UserIcon className="w-6 h-6 mx-auto mb-2 text-[hsl(var(--primary))]" />
                  <p className="font-semibold">Account Settings</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Advanced options</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Profile Completion Card */}
        <Card className="bg-[hsl(var(--success)/0.1)] border-[hsl(var(--success)/0.3)] shadow-[var(--shadow-lg)] rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[hsl(var(--success))] rounded-2xl flex items-center justify-center shadow-[var(--shadow-brand)]">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[hsl(var(--success))]">Profile Completion</h3>
                  <p className="text-[hsl(var(--success))]">85% complete - Looking great!</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-[hsl(var(--success)/0.2)] rounded-full overflow-hidden">
                  <div className="w-20 h-full bg-[hsl(var(--success))] rounded-full"></div>
                </div>
                <span className="text-sm font-bold text-[hsl(var(--success))]">85%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}